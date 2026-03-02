import { getEmployee, getEmployees } from './employees';
import { getRole, getRoles } from './roles';
import { getVOCByEmployee } from './voc';
import { getCertsByEmployee } from './certifications';
import { getInductionsByEmployee } from './onboarding';
import { getInductionTemplates } from './onboarding';
import { getExpiryStatus } from '@/lib/utils';
import type {
  Employee,
  RoleDefinition,
  VOCRecord,
  Certification,
  InductionRecord,
  InductionChecklistTemplate,
} from '@/lib/types';

// ── Compliance Status Interface ──

export interface ComplianceStatus {
  employeeId: string;
  // Induction
  inductionComplete: boolean;
  inductionProgress: number; // 0–100
  inductionTotal: number;
  inductionDone: number;
  // VOC
  vocComplete: boolean;
  vocProgress: number; // 0–100
  vocRequired: number;
  vocMet: number;
  vocMissing: string[]; // task IDs not yet competent
  vocExpiring: string[]; // task IDs expiring within 30 days
  vocExpired: string[]; // task IDs already expired
  // Certifications
  certsComplete: boolean;
  certsProgress: number; // 0–100
  certsRequired: number;
  certsMet: number;
  certsMissing: string[]; // cert type names not held
  certsExpiring: string[]; // cert type names expiring
  certsExpired: string[]; // cert type names expired
  // Overall
  overallCompliance: number; // 0–100 weighted average
  needsAttention: boolean;
  flags: string[]; // human-readable alert strings
}

// ── Single Employee Compliance ──

export async function getEmployeeCompliance(
  employeeId: string
): Promise<ComplianceStatus> {
  const [employee, vocRecords, certs, inductionRecords, templates, roles] =
    await Promise.all([
      getEmployee(employeeId),
      getVOCByEmployee(employeeId),
      getCertsByEmployee(employeeId),
      getInductionsByEmployee(employeeId),
      getInductionTemplates(),
      getRoles(),
    ]);

  if (!employee) return emptyStatus(employeeId);

  const role = roles.find((r) => r.id === employee.role_id) || null;

  return computeCompliance(
    employee,
    role,
    vocRecords,
    certs,
    inductionRecords,
    templates
  );
}

// ── Batch: All Employee Compliance ──

export async function getAllEmployeeCompliance(): Promise<ComplianceStatus[]> {
  const [employees, allVOC, allCerts, allInductions, templates, roles] =
    await Promise.all([
      getEmployees(),
      (await import('./voc')).getVOCRecords(),
      (await import('./certifications')).getCertifications(),
      (await import('./onboarding')).getInductionRecords(),
      getInductionTemplates(),
      getRoles(),
    ]);

  const activeEmployees = employees.filter((e) => e.status === 'Active');

  return activeEmployees.map((employee) => {
    const role = roles.find((r) => r.id === employee.role_id) || null;
    const vocRecords = allVOC.filter((v) => v.employee_id === employee.id);
    const certs = allCerts.filter((c) => c.employee_id === employee.id);
    const inductionRecords = allInductions.filter(
      (i) => i.employee_id === employee.id
    );

    return computeCompliance(
      employee,
      role,
      vocRecords,
      certs,
      inductionRecords,
      templates
    );
  });
}

// ── Pre-loaded Compliance (avoids refetching when data is already available) ──

export function computeCompliance(
  employee: Employee,
  role: RoleDefinition | null,
  vocRecords: VOCRecord[],
  certs: Certification[],
  inductionRecords: InductionRecord[],
  templates: InductionChecklistTemplate[]
): ComplianceStatus {
  const flags: string[] = [];

  if (!role) {
    flags.push('No role assigned — assign a role to enable compliance tracking');
  }

  // ── Induction ──
  const applicableTemplates = templates.filter(
    (t) =>
      t.active &&
      (t.required_for === 'All' || t.required_for === employee.employment_type)
  );
  const inductionTotal = applicableTemplates.length;
  const inductionDone = applicableTemplates.filter((t) => {
    const rec = inductionRecords.find((r) => r.checklist_item_id === t.id);
    return rec?.status === 'Completed';
  }).length;
  const inductionProgress =
    inductionTotal > 0 ? Math.round((inductionDone / inductionTotal) * 100) : 100;
  const inductionComplete = inductionTotal === 0 || inductionDone === inductionTotal;

  if (inductionTotal === 0) {
    flags.push('No induction checklist configured — add induction templates');
  } else if (!inductionComplete) {
    if (inductionDone === 0) {
      flags.push('Induction not started');
    } else {
      flags.push(`Induction ${inductionDone}/${inductionTotal} complete`);
    }
  }

  // ── VOC ──
  const requiredTaskIds = role?.required_task_ids || [];
  const vocMissing: string[] = [];
  const vocExpiring: string[] = [];
  const vocExpired: string[] = [];
  let vocMet = 0;

  for (const taskId of requiredTaskIds) {
    const rec = vocRecords.find(
      (v) => v.task_id === taskId && v.status === 'Competent'
    );
    if (!rec) {
      vocMissing.push(taskId);
    } else if (rec.expiry_date) {
      const status = getExpiryStatus(rec.expiry_date);
      if (status === 'expired') {
        vocExpired.push(taskId);
      } else if (status === 'expiring') {
        vocExpiring.push(taskId);
        vocMet++;
      } else {
        vocMet++;
      }
    } else {
      vocMet++;
    }
  }

  const vocRequired = requiredTaskIds.length;
  const vocProgress =
    vocRequired > 0 ? Math.round((vocMet / vocRequired) * 100) : 100;
  const vocComplete =
    vocRequired === 0 || (vocMissing.length === 0 && vocExpired.length === 0);

  if (vocRequired === 0 && role) {
    flags.push(`No competencies assigned to ${role.name} role — edit role in Settings`);
  } else if (vocMissing.length > 0) {
    flags.push(`${vocMissing.length} required VOC assessment(s) missing`);
  }
  if (vocExpired.length > 0) {
    flags.push(`${vocExpired.length} VOC assessment(s) expired`);
  }
  if (vocExpiring.length > 0) {
    flags.push(`${vocExpiring.length} VOC assessment(s) expiring soon`);
  }

  // ── Certifications ──
  const requiredCertTypes = role?.required_cert_types || [];
  const certsMissing: string[] = [];
  const certsExpiring: string[] = [];
  const certsExpired: string[] = [];
  let certsMet = 0;

  for (const certType of requiredCertTypes) {
    const certTypeLower = certType.toLowerCase();
    const matching = certs.find((c) =>
      c.cert_name.toLowerCase().includes(certTypeLower)
    );
    if (!matching) {
      certsMissing.push(certType);
    } else if (matching.expiry_date) {
      const status = getExpiryStatus(matching.expiry_date);
      if (status === 'expired') {
        certsExpired.push(certType);
      } else if (status === 'expiring') {
        certsExpiring.push(certType);
        certsMet++;
      } else {
        certsMet++;
      }
    } else {
      certsMet++;
    }
  }

  const certsRequired = requiredCertTypes.length;
  const certsProgress =
    certsRequired > 0 ? Math.round((certsMet / certsRequired) * 100) : 100;
  const certsComplete =
    certsRequired === 0 ||
    (certsMissing.length === 0 && certsExpired.length === 0);

  if (certsMissing.length > 0) {
    flags.push(`${certsMissing.length} required certification(s) missing`);
  }
  if (certsExpired.length > 0) {
    flags.push(`${certsExpired.length} certification(s) expired`);
  }
  if (certsExpiring.length > 0) {
    flags.push(`${certsExpiring.length} certification(s) expiring soon`);
  }

  // ── Overall ──
  // Weights: induction 30%, VOC 40%, certs 30%
  const overallCompliance = Math.round(
    inductionProgress * 0.3 + vocProgress * 0.4 + certsProgress * 0.3
  );
  const needsAttention = flags.length > 0;

  return {
    employeeId: employee.id,
    inductionComplete,
    inductionProgress,
    inductionTotal,
    inductionDone,
    vocComplete,
    vocProgress,
    vocRequired,
    vocMet,
    vocMissing,
    vocExpiring,
    vocExpired,
    certsComplete,
    certsProgress,
    certsRequired,
    certsMet,
    certsMissing,
    certsExpiring,
    certsExpired,
    overallCompliance,
    needsAttention,
    flags,
  };
}

// ── Helper ──

function emptyStatus(employeeId: string): ComplianceStatus {
  return {
    employeeId,
    inductionComplete: false,
    inductionProgress: 0,
    inductionTotal: 0,
    inductionDone: 0,
    vocComplete: true,
    vocProgress: 100,
    vocRequired: 0,
    vocMet: 0,
    vocMissing: [],
    vocExpiring: [],
    vocExpired: [],
    certsComplete: true,
    certsProgress: 100,
    certsRequired: 0,
    certsMet: 0,
    certsMissing: [],
    certsExpiring: [],
    certsExpired: [],
    overallCompliance: 0,
    needsAttention: true,
    flags: ['Employee not found'],
  };
}
