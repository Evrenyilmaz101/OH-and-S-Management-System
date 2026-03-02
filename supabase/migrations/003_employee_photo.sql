-- ============================================================================
-- Migration: Add photo_url column to employees
-- ============================================================================

ALTER TABLE employees ADD COLUMN IF NOT EXISTS photo_url text;
