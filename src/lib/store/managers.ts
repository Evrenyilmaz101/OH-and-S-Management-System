import { getAll, getById, getFiltered, insertRow, updateRow, deleteRow } from './core';
import type { Manager } from '@/lib/types';

const TABLE = 'managers';

export async function getManagers(): Promise<Manager[]> { return getAll<Manager>(TABLE, 'name'); }
export async function getManager(id: string): Promise<Manager | undefined> { return getById<Manager>(TABLE, id); }
export async function getManagersByWorkshop(workshopId: string): Promise<Manager[]> { return getFiltered<Manager>(TABLE, 'workshop_id', workshopId); }
export async function addManager(m: Partial<Manager>): Promise<Manager | null> { return insertRow<Manager>(TABLE, m as Manager); }
export async function updateManager(m: Manager): Promise<Manager | null> { return updateRow<Manager>(TABLE, m.id, m); }
export async function deleteManager(id: string): Promise<boolean> { return deleteRow(TABLE, id); }
