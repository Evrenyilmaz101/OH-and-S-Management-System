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
  // Query 1: Documents directly linked to this employee
  const { data: directDocs, error: err1 } = await getSupabase()
    .from(TABLE)
    .select('*')
    .eq('related_entity_id', employeeId)
    .eq('related_entity_type', 'employee');

  // Query 2: Documents tagged with this employee (e.g. VOC assessments linked via tags)
  const tag = `emp:${employeeId}`;
  const { data: taggedDocs, error: err2 } = await getSupabase()
    .from(TABLE)
    .select('*')
    .contains('tags', [tag]);

  if (err1) console.error(`[store] Error fetching direct docs:`, err1.message);
  if (err2) console.error(`[store] Error fetching tagged docs:`, err2.message);

  // Merge and deduplicate
  const allDocs = [...(directDocs || []), ...(taggedDocs || [])];
  const seen = new Set<string>();
  return allDocs.filter((d) => {
    if (seen.has(d.id)) return false;
    seen.add(d.id);
    return true;
  }) as Document[];
}
