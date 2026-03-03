-- User Profiles (links Supabase auth.users to workshop + admin flag)
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  workshop_id uuid REFERENCES workshops(id) ON DELETE SET NULL,
  is_admin boolean DEFAULT false,
  display_name text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE OR REPLACE TRIGGER set_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read user_profiles"
  ON user_profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert user_profiles"
  ON user_profiles FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update user_profiles"
  ON user_profiles FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE INDEX idx_user_profiles_auth_user_id ON user_profiles(auth_user_id);

-- Add workshop_id to employees
ALTER TABLE employees ADD COLUMN IF NOT EXISTS workshop_id uuid REFERENCES workshops(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_employees_workshop_id ON employees(workshop_id);

-- Add workshop_id to register tables
ALTER TABLE plant_equipment ADD COLUMN IF NOT EXISTS workshop_id uuid REFERENCES workshops(id) ON DELETE SET NULL;
ALTER TABLE ppe_records ADD COLUMN IF NOT EXISTS workshop_id uuid REFERENCES workshops(id) ON DELETE SET NULL;
ALTER TABLE hazardous_substances ADD COLUMN IF NOT EXISTS workshop_id uuid REFERENCES workshops(id) ON DELETE SET NULL;
ALTER TABLE first_aid_entries ADD COLUMN IF NOT EXISTS workshop_id uuid REFERENCES workshops(id) ON DELETE SET NULL;
ALTER TABLE inspections ADD COLUMN IF NOT EXISTS workshop_id uuid REFERENCES workshops(id) ON DELETE SET NULL;
ALTER TABLE emergency_info ADD COLUMN IF NOT EXISTS workshop_id uuid REFERENCES workshops(id) ON DELETE SET NULL;

-- Clear existing manager_id values (they referenced employees, now they'll reference managers)
UPDATE employees SET manager_id = NULL;
