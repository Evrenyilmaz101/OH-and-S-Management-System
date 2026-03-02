import { getAll, getById, getFiltered, insertRow, updateRow, deleteRow } from './core';
import type { PlantEquipment, HazardousSubstance, PPERecord, FirstAidEntry, WorkplaceInspection, EmergencyInfo } from '@/lib/types';

const TABLE_PLANT = 'plant_equipment';
const TABLE_HAZARDOUS = 'hazardous_substances';
const TABLE_PPE = 'ppe_records';
const TABLE_FIRSTAID = 'first_aid_entries';
const TABLE_INSPECTIONS = 'inspections';
const TABLE_EMERGENCY = 'emergency_info';

// Plant & Equipment
export async function getPlantEquipment(): Promise<PlantEquipment[]> { return getAll<PlantEquipment>(TABLE_PLANT); }
export async function getPlantItem(id: string): Promise<PlantEquipment | undefined> { return getById<PlantEquipment>(TABLE_PLANT, id); }
export async function addPlantEquipment(item: Partial<PlantEquipment>): Promise<PlantEquipment | null> { return insertRow<PlantEquipment>(TABLE_PLANT, item as PlantEquipment); }
export async function updatePlantEquipment(item: PlantEquipment): Promise<PlantEquipment | null> { return updateRow<PlantEquipment>(TABLE_PLANT, item.id, item); }
export async function deletePlantEquipment(id: string): Promise<boolean> { return deleteRow(TABLE_PLANT, id); }

// Hazardous Substances
export async function getHazardousSubstances(): Promise<HazardousSubstance[]> { return getAll<HazardousSubstance>(TABLE_HAZARDOUS); }
export async function getHazardousSubstance(id: string): Promise<HazardousSubstance | undefined> { return getById<HazardousSubstance>(TABLE_HAZARDOUS, id); }
export async function addHazardousSubstance(sub: Partial<HazardousSubstance>): Promise<HazardousSubstance | null> { return insertRow<HazardousSubstance>(TABLE_HAZARDOUS, sub as HazardousSubstance); }
export async function updateHazardousSubstance(sub: HazardousSubstance): Promise<HazardousSubstance | null> { return updateRow<HazardousSubstance>(TABLE_HAZARDOUS, sub.id, sub); }
export async function deleteHazardousSubstance(id: string): Promise<boolean> { return deleteRow(TABLE_HAZARDOUS, id); }

// PPE Records
export async function getPPERecords(): Promise<PPERecord[]> { return getAll<PPERecord>(TABLE_PPE); }
export async function getPPEByEmployee(employeeId: string): Promise<PPERecord[]> { return getFiltered<PPERecord>(TABLE_PPE, 'employee_id', employeeId); }
export async function addPPERecord(record: Partial<PPERecord>): Promise<PPERecord | null> { return insertRow<PPERecord>(TABLE_PPE, record as PPERecord); }
export async function updatePPERecord(record: PPERecord): Promise<PPERecord | null> { return updateRow<PPERecord>(TABLE_PPE, record.id, record); }
export async function deletePPERecord(id: string): Promise<boolean> { return deleteRow(TABLE_PPE, id); }

// First Aid
export async function getFirstAidEntries(): Promise<FirstAidEntry[]> { return getAll<FirstAidEntry>(TABLE_FIRSTAID); }
export async function getFirstAidEntry(id: string): Promise<FirstAidEntry | undefined> { return getById<FirstAidEntry>(TABLE_FIRSTAID, id); }
export async function addFirstAidEntry(entry: Partial<FirstAidEntry>): Promise<FirstAidEntry | null> { return insertRow<FirstAidEntry>(TABLE_FIRSTAID, entry as FirstAidEntry); }
export async function updateFirstAidEntry(entry: FirstAidEntry): Promise<FirstAidEntry | null> { return updateRow<FirstAidEntry>(TABLE_FIRSTAID, entry.id, entry); }
export async function deleteFirstAidEntry(id: string): Promise<boolean> { return deleteRow(TABLE_FIRSTAID, id); }

// Inspections
export async function getInspections(): Promise<WorkplaceInspection[]> { return getAll<WorkplaceInspection>(TABLE_INSPECTIONS); }
export async function getInspection(id: string): Promise<WorkplaceInspection | undefined> { return getById<WorkplaceInspection>(TABLE_INSPECTIONS, id); }
export async function addInspection(inspection: Partial<WorkplaceInspection>): Promise<WorkplaceInspection | null> { return insertRow<WorkplaceInspection>(TABLE_INSPECTIONS, inspection as WorkplaceInspection); }
export async function updateInspection(inspection: WorkplaceInspection): Promise<WorkplaceInspection | null> { return updateRow<WorkplaceInspection>(TABLE_INSPECTIONS, inspection.id, inspection); }
export async function deleteInspection(id: string): Promise<boolean> { return deleteRow(TABLE_INSPECTIONS, id); }

// Emergency Info
export async function getEmergencyInfo(): Promise<EmergencyInfo[]> { return getAll<EmergencyInfo>(TABLE_EMERGENCY); }
export async function getEmergencyItem(id: string): Promise<EmergencyInfo | undefined> { return getById<EmergencyInfo>(TABLE_EMERGENCY, id); }
export async function addEmergencyInfo(info: Partial<EmergencyInfo>): Promise<EmergencyInfo | null> { return insertRow<EmergencyInfo>(TABLE_EMERGENCY, info as EmergencyInfo); }
export async function updateEmergencyInfo(info: EmergencyInfo): Promise<EmergencyInfo | null> { return updateRow<EmergencyInfo>(TABLE_EMERGENCY, info.id, info); }
export async function deleteEmergencyInfo(id: string): Promise<boolean> { return deleteRow(TABLE_EMERGENCY, id); }

// Get first aid entries for a specific injured person
export async function getFirstAidByPerson(employeeId: string): Promise<FirstAidEntry[]> {
  return getFiltered<FirstAidEntry>(TABLE_FIRSTAID, 'injured_person_id', employeeId);
}
