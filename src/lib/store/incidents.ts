import { getAll, getById, getFilteredMulti, insertRow, updateRow, deleteRow } from './core';
import type { IncidentReport, CorrectiveAction } from '@/lib/types';

const TABLE_INCIDENTS = 'incidents';
const TABLE_ACTIONS = 'corrective_actions';

// Incidents
export async function getIncidents(): Promise<IncidentReport[]> { return getAll<IncidentReport>(TABLE_INCIDENTS); }
export async function getIncident(id: string): Promise<IncidentReport | undefined> { return getById<IncidentReport>(TABLE_INCIDENTS, id); }
export async function addIncident(incident: Partial<IncidentReport>): Promise<IncidentReport | null> { return insertRow<IncidentReport>(TABLE_INCIDENTS, incident as IncidentReport); }
export async function updateIncident(incident: IncidentReport): Promise<IncidentReport | null> { return updateRow<IncidentReport>(TABLE_INCIDENTS, incident.id, incident); }
export async function deleteIncident(id: string): Promise<boolean> { return deleteRow(TABLE_INCIDENTS, id); }

// Corrective Actions
export async function getCorrectiveActions(): Promise<CorrectiveAction[]> { return getAll<CorrectiveAction>(TABLE_ACTIONS); }
export async function getCorrectiveAction(id: string): Promise<CorrectiveAction | undefined> { return getById<CorrectiveAction>(TABLE_ACTIONS, id); }
export async function getCorrectiveActionsBySource(sourceType: string, sourceId: string): Promise<CorrectiveAction[]> {
  return getFilteredMulti<CorrectiveAction>(TABLE_ACTIONS, { source_type: sourceType, source_id: sourceId });
}
export async function addCorrectiveAction(action: Partial<CorrectiveAction>): Promise<CorrectiveAction | null> { return insertRow<CorrectiveAction>(TABLE_ACTIONS, action as CorrectiveAction); }
export async function updateCorrectiveAction(action: CorrectiveAction): Promise<CorrectiveAction | null> { return updateRow<CorrectiveAction>(TABLE_ACTIONS, action.id, action); }
export async function deleteCorrectiveAction(id: string): Promise<boolean> { return deleteRow(TABLE_ACTIONS, id); }

// Get incidents involving a specific person (as involved or witness)
export async function getIncidentsByPerson(employeeId: string): Promise<IncidentReport[]> {
  const all = await getAll<IncidentReport>(TABLE_INCIDENTS);
  return all.filter(
    (i) =>
      (i.involved_person_ids || []).includes(employeeId) ||
      (i.witness_ids || []).includes(employeeId)
  );
}
