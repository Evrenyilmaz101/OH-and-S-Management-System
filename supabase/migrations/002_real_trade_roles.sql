-- ============================================================================
-- Migration: Replace placeholder roles with real trade roles
-- ============================================================================

-- Clear existing role definitions
DELETE FROM role_definitions;

-- Insert 10 real trade roles for Thornton Engineering
-- required_task_ids and required_cert_types left empty — will be populated
-- when specific requirements per trade are provided.

INSERT INTO role_definitions (name, description, required_task_ids, required_cert_types, active) VALUES
  ('Boilermaker', 'Qualified boilermaker — pressure vessel fabrication and repair', '{}', '{}', true),
  ('Welder', 'Qualified welder — coded welding operations (MIG, TIG, stick)', '{}', '{}', true),
  ('Boilermaker Apprentice', 'Apprentice boilermaker under direct supervision', '{}', '{}', true),
  ('Welder Apprentice', 'Apprentice welder under direct supervision', '{}', '{}', true),
  ('Fitter', 'Mechanical fitter — assembly, alignment, and maintenance', '{}', '{}', true),
  ('Labourer', 'General workshop labourer — material handling and site support', '{}', '{}', true),
  ('Trade Assistant', 'Trade assistant supporting qualified tradespeople', '{}', '{}', true),
  ('Storeman', 'Stores and materials management — inventory and dispatch', '{}', '{}', true),
  ('Rigger', 'Licensed rigger — lifting operations and load calculations', '{}', '{}', true),
  ('Blaster/Painter', 'Surface preparation and protective coating specialist', '{}', '{}', true);
