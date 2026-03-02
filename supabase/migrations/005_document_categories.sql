-- ============================================================================
-- Migration: Expand document category constraint with new types
-- ============================================================================

-- Drop existing constraint if it exists
ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_category_check;

-- Re-create with expanded values
ALTER TABLE documents ADD CONSTRAINT documents_category_check
CHECK (category IN (
  'SOP', 'SWMS', 'Risk Assessment', 'Policy', 'Form',
  'Certificate', 'Licence', 'SDS',
  'Warning', 'Leave Application', 'Induction Verification', 'VOC Verification'
));
