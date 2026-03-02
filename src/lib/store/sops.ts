import { getAll, getById, getFiltered, insertRow, updateRow, deleteRow } from './core';
import type { SOP, SOPAcknowledgment } from '@/lib/types';

const TABLE_SOPS = 'sops';
const TABLE_ACKS = 'sop_acknowledgments';

// SOPs
export async function getSOPs(): Promise<SOP[]> { return getAll<SOP>(TABLE_SOPS); }
export async function getSOP(id: string): Promise<SOP | undefined> { return getById<SOP>(TABLE_SOPS, id); }
export async function addSOP(sop: Partial<SOP>): Promise<SOP | null> { return insertRow<SOP>(TABLE_SOPS, sop as SOP); }
export async function updateSOP(sop: SOP): Promise<SOP | null> { return updateRow<SOP>(TABLE_SOPS, sop.id, sop); }
export async function deleteSOP(id: string): Promise<boolean> { return deleteRow(TABLE_SOPS, id); }

// SOP Acknowledgments
export async function getSOPAcknowledgments(): Promise<SOPAcknowledgment[]> { return getAll<SOPAcknowledgment>(TABLE_ACKS); }
export async function getSOPAcksByEmployee(employeeId: string): Promise<SOPAcknowledgment[]> { return getFiltered<SOPAcknowledgment>(TABLE_ACKS, 'employee_id', employeeId); }
export async function getSOPAcksBySOP(sopId: string): Promise<SOPAcknowledgment[]> { return getFiltered<SOPAcknowledgment>(TABLE_ACKS, 'sop_id', sopId); }
export async function addSOPAcknowledgment(ack: Partial<SOPAcknowledgment>): Promise<SOPAcknowledgment | null> { return insertRow<SOPAcknowledgment>(TABLE_ACKS, ack as SOPAcknowledgment); }
export async function updateSOPAcknowledgment(ack: SOPAcknowledgment): Promise<SOPAcknowledgment | null> { return updateRow<SOPAcknowledgment>(TABLE_ACKS, ack.id, ack); }
export async function deleteSOPAcknowledgment(id: string): Promise<boolean> { return deleteRow(TABLE_ACKS, id); }
