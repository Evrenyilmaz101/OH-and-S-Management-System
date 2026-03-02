import { getAll, getById, insertRow, updateRow, deleteRow } from './core';
import type { DocumentTemplate } from '@/lib/types';

const TABLE = 'document_templates';

export async function getDocumentTemplates(): Promise<DocumentTemplate[]> {
  return getAll<DocumentTemplate>(TABLE, 'sort_order');
}

export async function getDocumentTemplate(id: string): Promise<DocumentTemplate | undefined> {
  return getById<DocumentTemplate>(TABLE, id);
}

export async function addDocumentTemplate(t: Partial<DocumentTemplate>): Promise<DocumentTemplate | null> {
  return insertRow<DocumentTemplate>(TABLE, t as DocumentTemplate);
}

export async function updateDocumentTemplate(t: DocumentTemplate): Promise<DocumentTemplate | null> {
  return updateRow<DocumentTemplate>(TABLE, t.id, t);
}

export async function deleteDocumentTemplate(id: string): Promise<boolean> {
  return deleteRow(TABLE, id);
}
