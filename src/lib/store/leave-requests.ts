import { getAll, getFiltered, insertRow, updateRow } from './core';
import type { LeaveRequest } from '@/lib/types';

const TABLE = 'leave_requests';

export async function getLeaveRequests(): Promise<LeaveRequest[]> {
  return getAll<LeaveRequest>(TABLE, 'created_at');
}

export async function getLeaveRequestByToken(token: string): Promise<LeaveRequest | undefined> {
  const results = await getFiltered<LeaveRequest>(TABLE, 'approval_token', token);
  return results[0];
}

export async function addLeaveRequest(request: Partial<LeaveRequest>): Promise<LeaveRequest | null> {
  return insertRow<LeaveRequest>(TABLE, request as LeaveRequest);
}

export async function updateLeaveRequest(id: string, updates: Partial<LeaveRequest>): Promise<LeaveRequest | null> {
  return updateRow<LeaveRequest>(TABLE, id, updates);
}
