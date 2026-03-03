import { getAll, getById, getFiltered, insertRow, updateRow, deleteRow } from './core';
import { addOnboardingRecord, getInductionTemplates, addInductionRecord } from './onboarding';
import type { Employee } from '@/lib/types';

const TABLE = 'employees';

export async function getEmployees(): Promise<Employee[]> { return getAll<Employee>(TABLE, 'last_name'); }
export async function getEmployee(id: string): Promise<Employee | undefined> { return getById<Employee>(TABLE, id); }
export async function getEmployeesByWorkshop(workshopId: string): Promise<Employee[]> { return getFiltered<Employee>(TABLE, 'workshop_id', workshopId); }
export async function addEmployee(employee: Partial<Employee>): Promise<Employee | null> { return insertRow<Employee>(TABLE, employee as Employee); }
export async function updateEmployee(employee: Employee): Promise<Employee | null> { return updateRow<Employee>(TABLE, employee.id, employee); }
export async function deleteEmployee(id: string): Promise<boolean> { return deleteRow(TABLE, id); }

/**
 * Create a new employee and automatically set up their onboarding:
 * 1. Insert the employee record
 * 2. Create an onboarding record (Not Started, all payroll items Pending)
 * 3. Create induction records from applicable templates
 */
export async function createEmployeeWithOnboarding(employee: Partial<Employee>): Promise<Employee | null> {
  const created = await addEmployee(employee);
  if (!created) return null;

  // Create onboarding record
  await addOnboardingRecord({
    employee_id: created.id,
    status: 'Not Started',
    start_date: created.start_date || new Date().toISOString().split('T')[0],
    emergency_contact_provided: 'Pending',
    notes: '',
  });

  // Create induction records from applicable templates
  const templates = await getInductionTemplates();
  const applicable = templates.filter(
    (t) => t.active && (t.required_for === 'All' || t.required_for === created.employment_type)
  );

  for (const template of applicable) {
    await addInductionRecord({
      employee_id: created.id,
      checklist_item_id: template.id,
      status: 'Pending',
      completed_date: '',
      completed_by: '',
      notes: '',
    });
  }

  return created;
}
