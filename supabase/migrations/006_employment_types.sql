-- ============================================================================
-- Migration: Update employment types (remove Apprentice, add Visitor)
-- ============================================================================

-- Update employees table constraint
ALTER TABLE employees DROP CONSTRAINT IF EXISTS employees_employment_type_check;
ALTER TABLE employees ADD CONSTRAINT employees_employment_type_check
CHECK (employment_type IN ('Employee', 'Contractor', 'Visitor'));

-- Migrate any existing Apprentice records to Employee
UPDATE employees SET employment_type = 'Employee' WHERE employment_type = 'Apprentice';

-- Update induction templates required_for constraint
ALTER TABLE induction_templates DROP CONSTRAINT IF EXISTS induction_templates_required_for_check;
ALTER TABLE induction_templates ADD CONSTRAINT induction_templates_required_for_check
CHECK (required_for IN ('All', 'Employee', 'Contractor', 'Visitor'));

-- Migrate any existing Apprentice templates to All
UPDATE induction_templates SET required_for = 'All' WHERE required_for = 'Apprentice';
