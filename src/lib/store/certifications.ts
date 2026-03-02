import { getAll, getById, getFiltered, insertRow, updateRow, deleteRow } from './core';
import type { Certification } from '@/lib/types';

const TABLE = 'certifications';

export async function getCertifications(): Promise<Certification[]> { return getAll<Certification>(TABLE); }
export async function getCertification(id: string): Promise<Certification | undefined> { return getById<Certification>(TABLE, id); }
export async function getCertsByEmployee(employeeId: string): Promise<Certification[]> { return getFiltered<Certification>(TABLE, 'employee_id', employeeId); }
export async function addCertification(cert: Partial<Certification>): Promise<Certification | null> { return insertRow<Certification>(TABLE, cert as Certification); }
export async function updateCertification(cert: Certification): Promise<Certification | null> { return updateRow<Certification>(TABLE, cert.id, cert); }
export async function deleteCertification(id: string): Promise<boolean> { return deleteRow(TABLE, id); }
