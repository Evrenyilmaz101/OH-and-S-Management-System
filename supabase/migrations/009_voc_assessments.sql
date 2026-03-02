-- VOC Assessment Templates (criteria per task/competency)
CREATE TABLE IF NOT EXISTS voc_assessment_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  name text NOT NULL,
  sop_reference text DEFAULT '',
  knowledge_questions jsonb DEFAULT '[]'::jsonb,
  practical_tasks jsonb DEFAULT '[]'::jsonb,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Auto-update timestamp
CREATE OR REPLACE FUNCTION update_voc_assessment_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_voc_assessment_templates_updated_at
  BEFORE UPDATE ON voc_assessment_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_voc_assessment_templates_updated_at();

-- RLS
ALTER TABLE voc_assessment_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read voc_assessment_templates"
  ON voc_assessment_templates FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert voc_assessment_templates"
  ON voc_assessment_templates FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update voc_assessment_templates"
  ON voc_assessment_templates FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated delete voc_assessment_templates"
  ON voc_assessment_templates FOR DELETE
  TO authenticated USING (true);

-- Index for task lookup
CREATE INDEX idx_voc_assessment_templates_task_id ON voc_assessment_templates(task_id);

-- ===

-- VOC Assessments (completed assessment forms)
CREATE TABLE IF NOT EXISTS voc_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  voc_record_id uuid REFERENCES voc_records(id) ON DELETE SET NULL,
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE,
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  template_id uuid REFERENCES voc_assessment_templates(id) ON DELETE SET NULL,
  assessor_name text NOT NULL,
  employee_position text DEFAULT '',
  assessment_date date DEFAULT CURRENT_DATE,
  sop_acknowledged boolean DEFAULT false,
  knowledge_responses jsonb DEFAULT '[]'::jsonb,
  practical_responses jsonb DEFAULT '[]'::jsonb,
  overall_outcome text DEFAULT 'Not Yet Competent',
  assessor_comments text DEFAULT '',
  assessor_signature text DEFAULT '',
  employee_signature text DEFAULT '',
  document_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Auto-update timestamp
CREATE OR REPLACE FUNCTION update_voc_assessments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_voc_assessments_updated_at
  BEFORE UPDATE ON voc_assessments
  FOR EACH ROW
  EXECUTE FUNCTION update_voc_assessments_updated_at();

-- RLS
ALTER TABLE voc_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read voc_assessments"
  ON voc_assessments FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert voc_assessments"
  ON voc_assessments FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update voc_assessments"
  ON voc_assessments FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated delete voc_assessments"
  ON voc_assessments FOR DELETE
  TO authenticated USING (true);

-- Indexes
CREATE INDEX idx_voc_assessments_employee_id ON voc_assessments(employee_id);
CREATE INDEX idx_voc_assessments_task_id ON voc_assessments(task_id);
CREATE INDEX idx_voc_assessments_voc_record_id ON voc_assessments(voc_record_id);
