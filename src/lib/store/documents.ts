import { getAll, getById, getFiltered, getFilteredMulti, insertRow, updateRow, deleteRow, getSupabase } from './core';
import type { Document } from '@/lib/types';

const TABLE = 'documents';

export async function getDocuments(): Promise<Document[]> { return getAll<Document>(TABLE); }
export async function getDocument(id: string): Promise<Document | undefined> { return getById<Document>(TABLE, id); }
export async function getDocumentsByCategory(category: string): Promise<Document[]> { return getFiltered<Document>(TABLE, 'category', category); }
export async function addDocument(doc: Partial<Document>): Promise<Document | null> { return insertRow<Document>(TABLE, doc as Document); }
export async function updateDocument(doc: Document): Promise<Document | null> { return updateRow<Document>(TABLE, doc.id, doc); }
export async function deleteDocument(id: string): Promise<boolean> { return deleteRow(TABLE, id); }

// Get documents linked to a specific entity (e.g. employee)
export async function getDocumentsByEntity(entityId: string, entityType: string): Promise<Document[]> {
  return getFilteredMulti<Document>(TABLE, { related_entity_id: entityId, related_entity_type: entityType });
}

// Get ALL documents related to an employee — both directly linked and tagged via attachments
export async function getDocumentsForEmployee(employeeId: string): Promise<Document[]> {
  const tag = `emp:${employeeId}`;
  const { data, error } = await getSupabase()
    .from(TABLE)
    .select('*')
    .or(`and(related_entity_id.eq.${employeeId},related_entity_type.eq.employee),tags.cs.{"${tag}"}`);
  if (error) {
    console.error(`[store] Error fetching docs for employee:`, error.message);
    return [];
  }
  return (data || []) as Document[];
}
