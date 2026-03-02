-- ============================================================================
-- Migration: Add employee_number column to employees
-- ============================================================================

ALTER TABLE employees ADD COLUMN IF NOT EXISTS employee_number text;
