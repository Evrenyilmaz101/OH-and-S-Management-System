-- Document Templates: master fillable forms (VOC forms, leave applications, etc.)
CREATE TABLE IF NOT EXISTS document_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  category text DEFAULT 'General',
  file_name text DEFAULT '',
  file_url text DEFAULT '',
  active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Auto-update updated_at
CREATE OR REPLACE TRIGGER set_document_templates_updated_at
  BEFORE UPDATE ON document_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read document_templates"
  ON document_templates FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert document_templates"
  ON document_templates FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update document_templates"
  ON document_templates FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete document_templates"
  ON document_templates FOR DELETE TO authenticated USING (true);
