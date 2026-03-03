-- Workshops (business units / shop floors)
CREATE TABLE IF NOT EXISTS workshops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  description text DEFAULT '',
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Auto-update updated_at
CREATE OR REPLACE TRIGGER set_workshops_updated_at
  BEFORE UPDATE ON workshops
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE workshops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read workshops"
  ON workshops FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert workshops"
  ON workshops FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update workshops"
  ON workshops FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete workshops"
  ON workshops FOR DELETE TO authenticated USING (true);

-- Pre-seed the 6 workshops
INSERT INTO workshops (name, code, description) VALUES
  ('F1 Processing', 'F1', 'Processing workshop'),
  ('F2 Maintenance', 'F2', 'Maintenance workshop'),
  ('F3 Beamlines 1', 'F3', 'Beamlines 1 workshop'),
  ('F4 Beamlines 2', 'F4', 'Beamlines 2 workshop'),
  ('F6 Vessel Shop', 'F6', 'Vessel fabrication shop'),
  ('F7 Plate Shop', 'F7', 'Plate shop');
