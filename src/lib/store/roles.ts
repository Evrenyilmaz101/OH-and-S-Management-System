import { getAll, getById, insertRow, updateRow, deleteRow } from './core';
import type { RoleDefinition } from '@/lib/types';

const TABLE = 'role_definitions';

export async function getRoles(): Promise<RoleDefinition[]> { return getAll<RoleDefinition>(TABLE); }
export async function getRole(id: string): Promise<RoleDefinition | undefined> { return getById<RoleDefinition>(TABLE, id); }
export async function addRole(role: Partial<RoleDefinition>): Promise<RoleDefinition | null> { return insertRow<RoleDefinition>(TABLE, role as RoleDefinition); }
export async function updateRole(role: RoleDefinition): Promise<RoleDefinition | null> { return updateRow<RoleDefinition>(TABLE, role.id, role); }
export async function deleteRole(id: string): Promise<boolean> { return deleteRow(TABLE, id); }
