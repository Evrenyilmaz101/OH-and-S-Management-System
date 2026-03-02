import { getAll, getById, getFiltered, insertRow, updateRow, deleteRow } from './core';
import type { InductionChecklistTemplate, InductionRecord, OnboardingRecord } from '@/lib/types';

const TABLE_TEMPLATES = 'induction_templates';
const TABLE_INDUCTIONS = 'induction_records';
const TABLE_ONBOARDING = 'onboarding_records';

// Induction Templates
export async function getInductionTemplates(): Promise<InductionChecklistTemplate[]> { return getAll<InductionChecklistTemplate>(TABLE_TEMPLATES); }
export async function getInductionTemplate(id: string): Promise<InductionChecklistTemplate | undefined> { return getById<InductionChecklistTemplate>(TABLE_TEMPLATES, id); }
export async function addInductionTemplate(t: Partial<InductionChecklistTemplate>): Promise<InductionChecklistTemplate | null> { return insertRow<InductionChecklistTemplate>(TABLE_TEMPLATES, t as InductionChecklistTemplate); }
export async function updateInductionTemplate(t: InductionChecklistTemplate): Promise<InductionChecklistTemplate | null> { return updateRow<InductionChecklistTemplate>(TABLE_TEMPLATES, t.id, t); }
export async function deleteInductionTemplate(id: string): Promise<boolean> { return deleteRow(TABLE_TEMPLATES, id); }

// Induction Records
export async function getInductionRecords(): Promise<InductionRecord[]> { return getAll<InductionRecord>(TABLE_INDUCTIONS); }
export async function getInductionsByEmployee(employeeId: string): Promise<InductionRecord[]> { return getFiltered<InductionRecord>(TABLE_INDUCTIONS, 'employee_id', employeeId); }
export async function addInductionRecord(r: Partial<InductionRecord>): Promise<InductionRecord | null> { return insertRow<InductionRecord>(TABLE_INDUCTIONS, r as InductionRecord); }
export async function updateInductionRecord(r: InductionRecord): Promise<InductionRecord | null> { return updateRow<InductionRecord>(TABLE_INDUCTIONS, r.id, r); }
export async function deleteInductionRecord(id: string): Promise<boolean> { return deleteRow(TABLE_INDUCTIONS, id); }

// Onboarding Records
export async function getOnboardingRecords(): Promise<OnboardingRecord[]> { return getAll<OnboardingRecord>(TABLE_ONBOARDING); }
export async function getOnboardingByEmployee(employeeId: string): Promise<OnboardingRecord | undefined> {
  const results = await getFiltered<OnboardingRecord>(TABLE_ONBOARDING, 'employee_id', employeeId);
  return results[0];
}
export async function addOnboardingRecord(r: Partial<OnboardingRecord>): Promise<OnboardingRecord | null> { return insertRow<OnboardingRecord>(TABLE_ONBOARDING, r as OnboardingRecord); }
export async function updateOnboardingRecord(r: OnboardingRecord): Promise<OnboardingRecord | null> { return updateRow<OnboardingRecord>(TABLE_ONBOARDING, r.id, r); }
export async function deleteOnboardingRecord(id: string): Promise<boolean> { return deleteRow(TABLE_ONBOARDING, id); }
