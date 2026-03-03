-- Migration 013: Supervisor / Manager hierarchy
-- Adds type column to managers and escalation columns to leave_requests

-- 1. Add type column to managers (existing rows become 'Manager')
ALTER TABLE managers ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'Manager';
CREATE INDEX IF NOT EXISTS idx_managers_type ON managers(type);

-- 2. Add escalation tracking columns to leave_requests
ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS escalated_to uuid;
ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS escalated_by text;
ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS escalation_notes text;
ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS escalated_date timestamptz;
