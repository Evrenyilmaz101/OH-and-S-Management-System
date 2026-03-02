-- Company Policies: safety policies, HR policies, etc.
CREATE TABLE IF NOT EXISTS company_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  category text DEFAULT 'Safety',
  version text DEFAULT '1.0',
  effective_date date,
  review_date date,
  status text DEFAULT 'Current',
  file_name text DEFAULT '',
  file_url text DEFAULT '',
  active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Auto-update updated_at
CREATE OR REPLACE TRIGGER set_company_policies_updated_at
  BEFORE UPDATE ON company_policies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE company_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read company_policies"
  ON company_policies FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert company_policies"
  ON company_policies FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update company_policies"
  ON company_policies FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete company_policies"
  ON company_policies FOR DELETE TO authenticated USING (true);
