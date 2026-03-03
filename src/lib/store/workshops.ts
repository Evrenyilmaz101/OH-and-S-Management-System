import { getAll, getById, insertRow, updateRow, deleteRow } from './core';
import type { Workshop } from '@/lib/types';

const TABLE = 'workshops';

export async function getWorkshops(): Promise<Workshop[]> { return getAll<Workshop>(TABLE, 'code'); }
export async function getWorkshop(id: string): Promise<Workshop | undefined> { return getById<Workshop>(TABLE, id); }
export async function addWorkshop(w: Partial<Workshop>): Promise<Workshop | null> { return insertRow<Workshop>(TABLE, w as Workshop); }
export async function updateWorkshop(w: Workshop): Promise<Workshop | null> { return updateRow<Workshop>(TABLE, w.id, w); }
export async function deleteWorkshop(id: string): Promise<boolean> { return deleteRow(TABLE, id); }
