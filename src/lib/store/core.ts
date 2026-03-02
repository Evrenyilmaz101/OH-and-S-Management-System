import { createClient } from '@/lib/supabase/client';

// ── Supabase Client Getter ──
export function getSupabase() {
  return createClient();
}

// ── Generic CRUD Helpers ──

export async function getAll<T>(table: string, orderBy?: string): Promise<T[]> {
  const query = getSupabase().from(table).select('*');
  if (orderBy) query.order(orderBy);
  const { data, error } = await query;
  if (error) {
    console.error(`[store] Error fetching ${table}:`, error.message);
    return [];
  }
  return (data || []) as T[];
}

export async function getById<T>(table: string, id: string): Promise<T | undefined> {
  const { data, error } = await getSupabase()
    .from(table)
    .select('*')
    .eq('id', id)
    .single();
  if (error) return undefined;
  return data as T;
}

export async function getFiltered<T>(table: string, column: string, value: string): Promise<T[]> {
  const { data, error } = await getSupabase()
    .from(table)
    .select('*')
    .eq(column, value);
  if (error) {
    console.error(`[store] Error filtering ${table}:`, error.message);
    return [];
  }
  return (data || []) as T[];
}

export async function getFilteredMulti<T>(
  table: string,
  filters: Record<string, string>
): Promise<T[]> {
  let query = getSupabase().from(table).select('*');
  for (const [col, val] of Object.entries(filters)) {
    query = query.eq(col, val);
  }
  const { data, error } = await query;
  if (error) {
    console.error(`[store] Error filtering ${table}:`, error.message);
    return [];
  }
  return (data || []) as T[];
}

export async function insertRow<T extends object>(
  table: string,
  row: Omit<T, 'id'> | T
): Promise<T | null> {
  const cleanRow = Object.fromEntries(
    Object.entries(row as Record<string, unknown>)
      .filter(([key, v]) => v !== undefined && key !== 'created_at' && key !== 'updated_at')
      .map(([key, v]) => [key, v === '' ? null : v])
  );
  const { data, error } = await getSupabase()
    .from(table)
    .insert(cleanRow)
    .select()
    .single();
  if (error) {
    console.error(`[store] Error inserting into ${table}:`, error.message);
    return null;
  }
  return data as T;
}

export async function updateRow<T extends object>(
  table: string,
  id: string,
  updates: Partial<T>
): Promise<T | null> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _id, created_at: _ca, ...rest } = updates as Record<string, unknown>;
  const cleanUpdates = Object.fromEntries(
    Object.entries(rest).map(([key, v]) => [key, v === '' ? null : v])
  );
  const { data, error } = await getSupabase()
    .from(table)
    .update(cleanUpdates)
    .eq('id', id)
    .select()
    .single();
  if (error) {
    console.error(`[store] Error updating ${table}:`, error.message);
    return null;
  }
  return data as T;
}

export async function deleteRow(table: string, id: string): Promise<boolean> {
  const { error } = await getSupabase()
    .from(table)
    .delete()
    .eq('id', id);
  if (error) {
    console.error(`[store] Error deleting from ${table}:`, error.message);
    return false;
  }
  return true;
}

// Delete all rows from all data tables (ordered to respect foreign keys)
const ALL_TABLES_ORDERED = [
  'sop_acknowledgments',
  'induction_records',
  'onboarding_records',
  'voc_assessments',
  'voc_records',
  'certifications',
  'ppe_records',
  'first_aid_entries',
  'corrective_actions',
  'incidents',
  'inspections',
  'toolbox_talks',
  'documents',
  'swms',
  'risk_assessments',
  'sops',
  'hazardous_substances',
  'plant_equipment',
  'emergency_info',
  'employees',
  'induction_templates',
  'voc_templates',
  'document_templates',
  'company_policies',
  'tasks',
  'role_definitions',
];

export async function deleteAllData(): Promise<{ success: boolean; errors: string[] }> {
  const supabase = getSupabase();
  const errors: string[] = [];

  for (const table of ALL_TABLES_ORDERED) {
    const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) {
      console.error(`[store] Error clearing ${table}:`, error.message);
      errors.push(`${table}: ${error.message}`);
    }
  }

  return { success: errors.length === 0, errors };
}
