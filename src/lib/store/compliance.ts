import { getAll, getById, insertRow, updateRow, deleteRow } from './core';
import type { SWMS, RiskAssessment, ToolboxTalk } from '@/lib/types';

const TABLE_SWMS = 'swms';
const TABLE_RISK = 'risk_assessments';
const TABLE_TALKS = 'toolbox_talks';

// SWMS
export async function getSWMSList(): Promise<SWMS[]> { return getAll<SWMS>(TABLE_SWMS); }
export async function getSWMS(id: string): Promise<SWMS | undefined> { return getById<SWMS>(TABLE_SWMS, id); }
export async function addSWMS(swms: Partial<SWMS>): Promise<SWMS | null> { return insertRow<SWMS>(TABLE_SWMS, swms as SWMS); }
export async function updateSWMS(swms: SWMS): Promise<SWMS | null> { return updateRow<SWMS>(TABLE_SWMS, swms.id, swms); }
export async function deleteSWMS(id: string): Promise<boolean> { return deleteRow(TABLE_SWMS, id); }

// Risk Assessments
export async function getRiskAssessments(): Promise<RiskAssessment[]> { return getAll<RiskAssessment>(TABLE_RISK); }
export async function getRiskAssessment(id: string): Promise<RiskAssessment | undefined> { return getById<RiskAssessment>(TABLE_RISK, id); }
export async function addRiskAssessment(ra: Partial<RiskAssessment>): Promise<RiskAssessment | null> { return insertRow<RiskAssessment>(TABLE_RISK, ra as RiskAssessment); }
export async function updateRiskAssessment(ra: RiskAssessment): Promise<RiskAssessment | null> { return updateRow<RiskAssessment>(TABLE_RISK, ra.id, ra); }
export async function deleteRiskAssessment(id: string): Promise<boolean> { return deleteRow(TABLE_RISK, id); }

// Toolbox Talks
export async function getToolboxTalks(): Promise<ToolboxTalk[]> { return getAll<ToolboxTalk>(TABLE_TALKS); }
export async function getToolboxTalk(id: string): Promise<ToolboxTalk | undefined> { return getById<ToolboxTalk>(TABLE_TALKS, id); }
export async function addToolboxTalk(talk: Partial<ToolboxTalk>): Promise<ToolboxTalk | null> { return insertRow<ToolboxTalk>(TABLE_TALKS, talk as ToolboxTalk); }
export async function updateToolboxTalk(talk: ToolboxTalk): Promise<ToolboxTalk | null> { return updateRow<ToolboxTalk>(TABLE_TALKS, talk.id, talk); }
export async function deleteToolboxTalk(id: string): Promise<boolean> { return deleteRow(TABLE_TALKS, id); }

// Get toolbox talks where a specific employee attended
export async function getToolboxTalksByAttendee(employeeId: string): Promise<ToolboxTalk[]> {
  const all = await getAll<ToolboxTalk>(TABLE_TALKS);
  return all.filter((t) => (t.attendee_ids || []).includes(employeeId));
}
