import { getAll, getById, insertRow, updateRow, deleteRow } from './core';
import type { Task } from '@/lib/types';

const TABLE = 'tasks';

export async function getTasks(): Promise<Task[]> { return getAll<Task>(TABLE); }
export async function getTask(id: string): Promise<Task | undefined> { return getById<Task>(TABLE, id); }
export async function addTask(task: Partial<Task>): Promise<Task | null> { return insertRow<Task>(TABLE, task as Task); }
export async function updateTask(task: Task): Promise<Task | null> { return updateRow<Task>(TABLE, task.id, task); }
export async function deleteTask(id: string): Promise<boolean> { return deleteRow(TABLE, id); }
