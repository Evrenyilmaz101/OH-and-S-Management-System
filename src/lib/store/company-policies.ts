import { getAll, getById, insertRow, updateRow, deleteRow } from './core';
import type { CompanyPolicy } from '@/lib/types';

const TABLE = 'company_policies';

export async function getCompanyPolicies(): Promise<CompanyPolicy[]> {
  return getAll<CompanyPolicy>(TABLE, 'sort_order');
}

export async function getCompanyPolicy(id: string): Promise<CompanyPolicy | undefined> {
  return getById<CompanyPolicy>(TABLE, id);
}

export async function addCompanyPolicy(p: Partial<CompanyPolicy>): Promise<CompanyPolicy | null> {
  return insertRow<CompanyPolicy>(TABLE, p as CompanyPolicy);
}

export async function updateCompanyPolicy(p: CompanyPolicy): Promise<CompanyPolicy | null> {
  return updateRow<CompanyPolicy>(TABLE, p.id, p);
}

export async function deleteCompanyPolicy(id: string): Promise<boolean> {
  return deleteRow(TABLE, id);
}
