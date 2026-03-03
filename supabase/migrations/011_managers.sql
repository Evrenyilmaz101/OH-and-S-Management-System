-- Managers (standalone entities, not employee profiles)
CREATE TABLE IF NOT EXISTS managers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  workshop_id uuid REFERENCES workshops(id) ON DELETE SET NULL,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE OR REPLACE TRIGGER set_managers_updated_at
  BEFORE UPDATE ON managers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE managers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read managers"
  ON managers FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert managers"
  ON managers FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update managers"
  ON managers FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete managers"
  ON managers FOR DELETE TO authenticated USING (true);

CREATE INDEX idx_managers_workshop_id ON managers(workshop_id);
