import { getAll, getById, getFiltered, insertRow, updateRow, deleteRow } from './core';
import type { VOCRecord } from '@/lib/types';

const TABLE = 'voc_records';

export async function getVOCRecords(): Promise<VOCRecord[]> { return getAll<VOCRecord>(TABLE); }
export async function getVOCRecord(id: string): Promise<VOCRecord | undefined> { return getById<VOCRecord>(TABLE, id); }
export async function getVOCByEmployee(employeeId: string): Promise<VOCRecord[]> { return getFiltered<VOCRecord>(TABLE, 'employee_id', employeeId); }
export async function getVOCByTask(taskId: string): Promise<VOCRecord[]> { return getFiltered<VOCRecord>(TABLE, 'task_id', taskId); }
export async function addVOCRecord(record: Partial<VOCRecord>): Promise<VOCRecord | null> { return insertRow<VOCRecord>(TABLE, record as VOCRecord); }
export async function updateVOCRecord(record: VOCRecord): Promise<VOCRecord | null> { return updateRow<VOCRecord>(TABLE, record.id, record); }
export async function deleteVOCRecord(id: string): Promise<boolean> { return deleteRow(TABLE, id); }
