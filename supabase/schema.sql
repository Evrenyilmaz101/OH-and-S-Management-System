-- ============================================================================
-- OH&S Management System - Complete Supabase SQL Schema
-- For a fabrication workshop environment
-- ============================================================================
-- This schema creates all tables, triggers, indexes, and RLS policies
-- required for the OH&S Management System.
--
-- Run this file against a fresh Supabase project.
-- Requires: Supabase auth.users table (provided by Supabase automatically)
-- ============================================================================


-- ============================================================================
-- SECTION 1: UTILITY FUNCTIONS
-- ============================================================================

-- Function to automatically update the updated_at timestamp on row modification
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ============================================================================
-- SECTION 2: USER PROFILES (extends Supabase auth.users)
-- ============================================================================

CREATE TABLE user_profiles (
    id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name text,
    role text DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES auth.users(id)
);

-- Trigger: auto-create a user_profiles row when a new auth.users row is created
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, full_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- ============================================================================
-- SECTION 3: ROLE DEFINITIONS
-- ============================================================================
-- Defined before employees because employees references role_definitions.

CREATE TABLE role_definitions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    description text,
    required_task_ids uuid[],
    required_cert_types text[],
    active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES auth.users(id)
);

CREATE TRIGGER update_role_definitions_updated_at
    BEFORE UPDATE ON role_definitions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- ============================================================================
-- SECTION 4: EMPLOYEES
-- ============================================================================

CREATE TABLE employees (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text,
    phone text,
    role text,
    role_id uuid REFERENCES role_definitions(id),
    employment_type text CHECK (employment_type IN ('Employee', 'Apprentice', 'Contractor')),
    start_date date,
    status text DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    induction_status text DEFAULT 'Not Started' CHECK (induction_status IN ('Not Started', 'In Progress', 'Completed')),
    emergency_contact_name text,
    emergency_contact_phone text,
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES auth.users(id)
);

CREATE TRIGGER update_employees_updated_at
    BEFORE UPDATE ON employees
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_employees_role_id ON employees(role_id);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_employees_employment_type ON employees(employment_type);


-- ============================================================================
-- SECTION 5: TASKS
-- ============================================================================

CREATE TABLE tasks (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    description text,
    category text,
    risk_level text CHECK (risk_level IN ('Low', 'Medium', 'High', 'Critical')),
    required_ppe text[],
    active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES auth.users(id)
);

CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_tasks_category ON tasks(category);
CREATE INDEX idx_tasks_risk_level ON tasks(risk_level);


-- ============================================================================
-- SECTION 6: VOC (Verification of Competency) RECORDS
-- ============================================================================

CREATE TABLE voc_records (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id uuid REFERENCES employees(id) ON DELETE CASCADE NOT NULL,
    task_id uuid REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
    status text CHECK (status IN ('Not Competent', 'In Training', 'Competent')),
    assessed_date date,
    assessed_by text,
    expiry_date date,
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES auth.users(id)
);

CREATE TRIGGER update_voc_records_updated_at
    BEFORE UPDATE ON voc_records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_voc_records_employee_id ON voc_records(employee_id);
CREATE INDEX idx_voc_records_task_id ON voc_records(task_id);
CREATE INDEX idx_voc_records_status ON voc_records(status);


-- ============================================================================
-- SECTION 7: CERTIFICATIONS
-- ============================================================================

CREATE TABLE certifications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id uuid REFERENCES employees(id) ON DELETE CASCADE NOT NULL,
    cert_name text NOT NULL,
    cert_number text,
    issuing_body text,
    issue_date date,
    expiry_date date,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES auth.users(id)
);

CREATE TRIGGER update_certifications_updated_at
    BEFORE UPDATE ON certifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_certifications_employee_id ON certifications(employee_id);
CREATE INDEX idx_certifications_expiry_date ON certifications(expiry_date);


-- ============================================================================
-- SECTION 8: INDUCTION TEMPLATES
-- ============================================================================

CREATE TABLE induction_templates (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    description text,
    category text,
    required_for text DEFAULT 'All' CHECK (required_for IN ('All', 'Employee', 'Contractor', 'Apprentice')),
    sort_order integer DEFAULT 0,
    active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES auth.users(id)
);

CREATE TRIGGER update_induction_templates_updated_at
    BEFORE UPDATE ON induction_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- ============================================================================
-- SECTION 9: INDUCTION RECORDS
-- ============================================================================

CREATE TABLE induction_records (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id uuid REFERENCES employees(id) ON DELETE CASCADE NOT NULL,
    checklist_item_id uuid REFERENCES induction_templates(id) ON DELETE CASCADE NOT NULL,
    status text DEFAULT 'Pending' CHECK (status IN ('Pending', 'Completed', 'N/A')),
    completed_date date,
    completed_by text,
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES auth.users(id)
);

CREATE TRIGGER update_induction_records_updated_at
    BEFORE UPDATE ON induction_records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_induction_records_employee_id ON induction_records(employee_id);
CREATE INDEX idx_induction_records_checklist_item_id ON induction_records(checklist_item_id);


-- ============================================================================
-- SECTION 10: ONBOARDING RECORDS
-- ============================================================================

CREATE TABLE onboarding_records (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id uuid REFERENCES employees(id) ON DELETE CASCADE NOT NULL,
    status text DEFAULT 'Not Started' CHECK (status IN ('Not Started', 'In Progress', 'Completed')),
    start_date date,
    completed_date date,
    tfn_declaration_submitted text DEFAULT 'Pending' CHECK (tfn_declaration_submitted IN ('Pending', 'Submitted', 'N/A')),
    super_choice_submitted text DEFAULT 'Pending' CHECK (super_choice_submitted IN ('Pending', 'Submitted', 'N/A')),
    bank_details_submitted text DEFAULT 'Pending' CHECK (bank_details_submitted IN ('Pending', 'Submitted', 'N/A')),
    emergency_contact_provided text DEFAULT 'Pending' CHECK (emergency_contact_provided IN ('Pending', 'Submitted', 'N/A')),
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES auth.users(id)
);

CREATE TRIGGER update_onboarding_records_updated_at
    BEFORE UPDATE ON onboarding_records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_onboarding_records_employee_id ON onboarding_records(employee_id);


-- ============================================================================
-- SECTION 11: STANDARD OPERATING PROCEDURES (SOPs)
-- ============================================================================

CREATE TABLE sops (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    document_number text,
    version text DEFAULT '1.0',
    category text,
    description text,
    content text,
    associated_equipment text[],
    associated_task_ids uuid[],
    review_date date,
    last_reviewed_by text,
    status text DEFAULT 'Current' CHECK (status IN ('Current', 'Under Review', 'Archived')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES auth.users(id)
);

CREATE TRIGGER update_sops_updated_at
    BEFORE UPDATE ON sops
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_sops_status ON sops(status);
CREATE INDEX idx_sops_category ON sops(category);


-- ============================================================================
-- SECTION 12: SOP ACKNOWLEDGMENTS
-- ============================================================================

CREATE TABLE sop_acknowledgments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    sop_id uuid REFERENCES sops(id) ON DELETE CASCADE NOT NULL,
    employee_id uuid REFERENCES employees(id) ON DELETE CASCADE NOT NULL,
    acknowledged_date date,
    acknowledged boolean DEFAULT false,
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES auth.users(id)
);

CREATE TRIGGER update_sop_acknowledgments_updated_at
    BEFORE UPDATE ON sop_acknowledgments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_sop_acknowledgments_sop_id ON sop_acknowledgments(sop_id);
CREATE INDEX idx_sop_acknowledgments_employee_id ON sop_acknowledgments(employee_id);


-- ============================================================================
-- SECTION 13: INCIDENTS
-- ============================================================================

CREATE TABLE incidents (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    incident_number text,
    date date,
    time text,
    location text,
    type text CHECK (type IN ('Near Miss', 'First Aid', 'Medical Treatment', 'Lost Time Injury', 'Dangerous Occurrence', 'Property Damage')),
    severity text CHECK (severity IN ('Insignificant', 'Minor', 'Moderate', 'Major', 'Catastrophic')),
    description text,
    immediate_actions text,
    root_cause text,
    contributing_factors text,
    status text DEFAULT 'Open' CHECK (status IN ('Open', 'Under Investigation', 'Corrective Actions', 'Closed')),
    reported_by text,
    reported_date date,
    investigated_by text,
    investigation_date date,
    closed_date date,
    involved_person_ids uuid[],
    witness_ids uuid[],
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES auth.users(id)
);

CREATE TRIGGER update_incidents_updated_at
    BEFORE UPDATE ON incidents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_incidents_type ON incidents(type);
CREATE INDEX idx_incidents_severity ON incidents(severity);
CREATE INDEX idx_incidents_date ON incidents(date);


-- ============================================================================
-- SECTION 14: CORRECTIVE ACTIONS
-- ============================================================================

CREATE TABLE corrective_actions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    action_number text,
    description text,
    source_type text CHECK (source_type IN ('Incident', 'Inspection', 'Audit', 'SWMS Review', 'Toolbox Talk', 'WorkSafe Notice', 'Other')),
    source_id uuid,
    source_reference text,
    priority text CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
    assigned_to text,
    due_date date,
    status text DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Completed', 'Overdue', 'Closed')),
    completed_date date,
    completion_notes text,
    verified_date date,
    verified_by text,
    created_date date,
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES auth.users(id)
);

CREATE TRIGGER update_corrective_actions_updated_at
    BEFORE UPDATE ON corrective_actions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_corrective_actions_source_id ON corrective_actions(source_id);
CREATE INDEX idx_corrective_actions_status ON corrective_actions(status);
CREATE INDEX idx_corrective_actions_priority ON corrective_actions(priority);
CREATE INDEX idx_corrective_actions_due_date ON corrective_actions(due_date);


-- ============================================================================
-- SECTION 15: DOCUMENTS
-- ============================================================================

CREATE TABLE documents (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    document_number text,
    version text DEFAULT '1.0',
    description text,
    content text,
    file_name text,
    category text CHECK (category IN ('SOP', 'SWMS', 'Risk Assessment', 'Policy', 'Form', 'Certificate', 'Licence', 'SDS')),
    upload_date date,
    review_date date,
    status text DEFAULT 'Current' CHECK (status IN ('Current', 'Under Review', 'Superseded', 'Archived')),
    tags text[],
    related_entity_id uuid,
    related_entity_type text,
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES auth.users(id)
);

CREATE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_documents_category ON documents(category);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_related_entity_id ON documents(related_entity_id);


-- ============================================================================
-- SECTION 16: SAFE WORK METHOD STATEMENTS (SWMS)
-- ============================================================================

CREATE TABLE swms (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    document_number text,
    version text DEFAULT '1.0',
    content text,
    high_risk_activities text[],
    associated_task_ids uuid[],
    prepared_by text,
    reviewed_by text,
    approved_by text,
    review_date date,
    status text DEFAULT 'Draft' CHECK (status IN ('Draft', 'Current', 'Under Review', 'Archived')),
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES auth.users(id)
);

CREATE TRIGGER update_swms_updated_at
    BEFORE UPDATE ON swms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_swms_status ON swms(status);


-- ============================================================================
-- SECTION 17: RISK ASSESSMENTS
-- ============================================================================

CREATE TABLE risk_assessments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    document_number text,
    assessment_type text CHECK (assessment_type IN ('Risk Assessment', 'JSA')),
    location text,
    assessed_by text,
    associated_task_ids uuid[],
    assessment_date date,
    review_date date,
    risk_rating_before text CHECK (risk_rating_before IN ('Low', 'Medium', 'High', 'Critical')),
    controls text,
    risk_rating_after text CHECK (risk_rating_after IN ('Low', 'Medium', 'High', 'Critical')),
    content text,
    status text DEFAULT 'Draft' CHECK (status IN ('Draft', 'Current', 'Under Review', 'Archived')),
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES auth.users(id)
);

CREATE TRIGGER update_risk_assessments_updated_at
    BEFORE UPDATE ON risk_assessments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_risk_assessments_status ON risk_assessments(status);
CREATE INDEX idx_risk_assessments_assessment_type ON risk_assessments(assessment_type);


-- ============================================================================
-- SECTION 18: PLANT & EQUIPMENT
-- ============================================================================

CREATE TABLE plant_equipment (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    type text,
    make text,
    model text,
    serial_number text,
    asset_number text,
    location text,
    status text DEFAULT 'Operational' CHECK (status IN ('Operational', 'Out of Service', 'Under Maintenance', 'Decommissioned')),
    registration_status text CHECK (registration_status IN ('Registered', 'Not Required', 'Pending', 'Expired')),
    registration_number text,
    registration_expiry date,
    purchase_date date,
    last_maintenance_date date,
    next_maintenance_date date,
    maintenance_frequency_days integer,
    associated_sop_ids uuid[],
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES auth.users(id)
);

CREATE TRIGGER update_plant_equipment_updated_at
    BEFORE UPDATE ON plant_equipment
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_plant_equipment_status ON plant_equipment(status);
CREATE INDEX idx_plant_equipment_next_maintenance_date ON plant_equipment(next_maintenance_date);


-- ============================================================================
-- SECTION 19: HAZARDOUS SUBSTANCES
-- ============================================================================

CREATE TABLE hazardous_substances (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    product_name text NOT NULL,
    manufacturer text,
    un_number text,
    dangerous_goods_class text,
    location_stored text,
    sds_document_id uuid,
    sds_issue_date date,
    sds_expiry_date date,
    quantity_held text,
    risk_phrases text[],
    control_measures text,
    first_aid_measures text,
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES auth.users(id)
);

CREATE TRIGGER update_hazardous_substances_updated_at
    BEFORE UPDATE ON hazardous_substances
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_hazardous_substances_sds_expiry_date ON hazardous_substances(sds_expiry_date);


-- ============================================================================
-- SECTION 20: TOOLBOX TALKS
-- ============================================================================

CREATE TABLE toolbox_talks (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    date date,
    time text,
    location text,
    conducted_by text,
    attendee_ids uuid[],
    topics_covered text[],
    actions_arising text,
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES auth.users(id)
);

CREATE TRIGGER update_toolbox_talks_updated_at
    BEFORE UPDATE ON toolbox_talks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_toolbox_talks_date ON toolbox_talks(date);


-- ============================================================================
-- SECTION 21: PPE RECORDS
-- ============================================================================

CREATE TABLE ppe_records (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id uuid REFERENCES employees(id) ON DELETE CASCADE NOT NULL,
    ppe_type text,
    brand text,
    serial_number text,
    date_issued date,
    expiry_date date,
    condition text CHECK (condition IN ('Good', 'Fair', 'Replace')),
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES auth.users(id)
);

CREATE TRIGGER update_ppe_records_updated_at
    BEFORE UPDATE ON ppe_records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_ppe_records_employee_id ON ppe_records(employee_id);
CREATE INDEX idx_ppe_records_expiry_date ON ppe_records(expiry_date);


-- ============================================================================
-- SECTION 22: FIRST AID ENTRIES
-- ============================================================================

CREATE TABLE first_aid_entries (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    injured_person_id uuid REFERENCES employees(id) ON DELETE SET NULL,
    date date,
    time text,
    nature_of_injury text,
    body_part text,
    treatment_provided text,
    treated_by text,
    location text,
    follow_up_required boolean DEFAULT false,
    follow_up_notes text,
    incident_report_id uuid,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES auth.users(id)
);

CREATE TRIGGER update_first_aid_entries_updated_at
    BEFORE UPDATE ON first_aid_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_first_aid_entries_injured_person_id ON first_aid_entries(injured_person_id);
CREATE INDEX idx_first_aid_entries_incident_report_id ON first_aid_entries(incident_report_id);
CREATE INDEX idx_first_aid_entries_date ON first_aid_entries(date);


-- ============================================================================
-- SECTION 23: INSPECTIONS
-- ============================================================================

CREATE TABLE inspections (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    inspection_type text,
    inspector text,
    location text,
    scheduled_date date,
    completed_date date,
    status text DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'In Progress', 'Completed', 'Overdue')),
    findings jsonb DEFAULT '[]',
    overall_rating text CHECK (overall_rating IN ('Satisfactory', 'Needs Improvement', 'Unsatisfactory')),
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES auth.users(id)
);

CREATE TRIGGER update_inspections_updated_at
    BEFORE UPDATE ON inspections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_inspections_status ON inspections(status);
CREATE INDEX idx_inspections_scheduled_date ON inspections(scheduled_date);


-- ============================================================================
-- SECTION 24: EMERGENCY INFORMATION
-- ============================================================================

CREATE TABLE emergency_info (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    type text,
    title text NOT NULL,
    description text,
    location text,
    contact_number text,
    responsible_person_id uuid,
    last_reviewed date,
    review_due date,
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES auth.users(id)
);

CREATE TRIGGER update_emergency_info_updated_at
    BEFORE UPDATE ON emergency_info
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- ============================================================================
-- SECTION 25: ROW LEVEL SECURITY (RLS)
-- ============================================================================
-- Enable RLS on all tables and create policies allowing authenticated users
-- full access (SELECT, INSERT, UPDATE, DELETE).
-- In production, you would tighten these policies based on user roles.

-- Helper: list of all tables for RLS
-- We enable RLS and create policies for each table individually.

-- user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can select user_profiles"
    ON user_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert user_profiles"
    ON user_profiles FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update user_profiles"
    ON user_profiles FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete user_profiles"
    ON user_profiles FOR DELETE TO authenticated USING (true);

-- role_definitions
ALTER TABLE role_definitions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can select role_definitions"
    ON role_definitions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert role_definitions"
    ON role_definitions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update role_definitions"
    ON role_definitions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete role_definitions"
    ON role_definitions FOR DELETE TO authenticated USING (true);

-- employees
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can select employees"
    ON employees FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert employees"
    ON employees FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update employees"
    ON employees FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete employees"
    ON employees FOR DELETE TO authenticated USING (true);

-- tasks
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can select tasks"
    ON tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert tasks"
    ON tasks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update tasks"
    ON tasks FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete tasks"
    ON tasks FOR DELETE TO authenticated USING (true);

-- voc_records
ALTER TABLE voc_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can select voc_records"
    ON voc_records FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert voc_records"
    ON voc_records FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update voc_records"
    ON voc_records FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete voc_records"
    ON voc_records FOR DELETE TO authenticated USING (true);

-- certifications
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can select certifications"
    ON certifications FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert certifications"
    ON certifications FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update certifications"
    ON certifications FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete certifications"
    ON certifications FOR DELETE TO authenticated USING (true);

-- induction_templates
ALTER TABLE induction_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can select induction_templates"
    ON induction_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert induction_templates"
    ON induction_templates FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update induction_templates"
    ON induction_templates FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete induction_templates"
    ON induction_templates FOR DELETE TO authenticated USING (true);

-- induction_records
ALTER TABLE induction_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can select induction_records"
    ON induction_records FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert induction_records"
    ON induction_records FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update induction_records"
    ON induction_records FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete induction_records"
    ON induction_records FOR DELETE TO authenticated USING (true);

-- onboarding_records
ALTER TABLE onboarding_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can select onboarding_records"
    ON onboarding_records FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert onboarding_records"
    ON onboarding_records FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update onboarding_records"
    ON onboarding_records FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete onboarding_records"
    ON onboarding_records FOR DELETE TO authenticated USING (true);

-- sops
ALTER TABLE sops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can select sops"
    ON sops FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert sops"
    ON sops FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update sops"
    ON sops FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete sops"
    ON sops FOR DELETE TO authenticated USING (true);

-- sop_acknowledgments
ALTER TABLE sop_acknowledgments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can select sop_acknowledgments"
    ON sop_acknowledgments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert sop_acknowledgments"
    ON sop_acknowledgments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update sop_acknowledgments"
    ON sop_acknowledgments FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete sop_acknowledgments"
    ON sop_acknowledgments FOR DELETE TO authenticated USING (true);

-- incidents
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can select incidents"
    ON incidents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert incidents"
    ON incidents FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update incidents"
    ON incidents FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete incidents"
    ON incidents FOR DELETE TO authenticated USING (true);

-- corrective_actions
ALTER TABLE corrective_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can select corrective_actions"
    ON corrective_actions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert corrective_actions"
    ON corrective_actions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update corrective_actions"
    ON corrective_actions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete corrective_actions"
    ON corrective_actions FOR DELETE TO authenticated USING (true);

-- documents
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can select documents"
    ON documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert documents"
    ON documents FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update documents"
    ON documents FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete documents"
    ON documents FOR DELETE TO authenticated USING (true);

-- swms
ALTER TABLE swms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can select swms"
    ON swms FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert swms"
    ON swms FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update swms"
    ON swms FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete swms"
    ON swms FOR DELETE TO authenticated USING (true);

-- risk_assessments
ALTER TABLE risk_assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can select risk_assessments"
    ON risk_assessments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert risk_assessments"
    ON risk_assessments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update risk_assessments"
    ON risk_assessments FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete risk_assessments"
    ON risk_assessments FOR DELETE TO authenticated USING (true);

-- plant_equipment
ALTER TABLE plant_equipment ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can select plant_equipment"
    ON plant_equipment FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert plant_equipment"
    ON plant_equipment FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update plant_equipment"
    ON plant_equipment FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete plant_equipment"
    ON plant_equipment FOR DELETE TO authenticated USING (true);

-- hazardous_substances
ALTER TABLE hazardous_substances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can select hazardous_substances"
    ON hazardous_substances FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert hazardous_substances"
    ON hazardous_substances FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update hazardous_substances"
    ON hazardous_substances FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete hazardous_substances"
    ON hazardous_substances FOR DELETE TO authenticated USING (true);

-- toolbox_talks
ALTER TABLE toolbox_talks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can select toolbox_talks"
    ON toolbox_talks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert toolbox_talks"
    ON toolbox_talks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update toolbox_talks"
    ON toolbox_talks FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete toolbox_talks"
    ON toolbox_talks FOR DELETE TO authenticated USING (true);

-- ppe_records
ALTER TABLE ppe_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can select ppe_records"
    ON ppe_records FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert ppe_records"
    ON ppe_records FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update ppe_records"
    ON ppe_records FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete ppe_records"
    ON ppe_records FOR DELETE TO authenticated USING (true);

-- first_aid_entries
ALTER TABLE first_aid_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can select first_aid_entries"
    ON first_aid_entries FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert first_aid_entries"
    ON first_aid_entries FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update first_aid_entries"
    ON first_aid_entries FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete first_aid_entries"
    ON first_aid_entries FOR DELETE TO authenticated USING (true);

-- inspections
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can select inspections"
    ON inspections FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert inspections"
    ON inspections FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update inspections"
    ON inspections FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete inspections"
    ON inspections FOR DELETE TO authenticated USING (true);

-- emergency_info
ALTER TABLE emergency_info ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can select emergency_info"
    ON emergency_info FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert emergency_info"
    ON emergency_info FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update emergency_info"
    ON emergency_info FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete emergency_info"
    ON emergency_info FOR DELETE TO authenticated USING (true);


-- ============================================================================
-- SCHEMA COMPLETE
-- ============================================================================
-- Total tables: 23
--   1.  user_profiles
--   2.  role_definitions
--   3.  employees
--   4.  tasks
--   5.  voc_records
--   6.  certifications
--   7.  induction_templates
--   8.  induction_records
--   9.  onboarding_records
--   10. sops
--   11. sop_acknowledgments
--   12. incidents
--   13. corrective_actions
--   14. documents
--   15. swms
--   16. risk_assessments
--   17. plant_equipment
--   18. hazardous_substances
--   19. toolbox_talks
--   20. ppe_records
--   21. first_aid_entries
--   22. inspections
--   23. emergency_info
--
-- All tables include:
--   - id uuid PRIMARY KEY (gen_random_uuid() or references auth.users)
--   - created_at timestamptz DEFAULT now()
--   - updated_at timestamptz DEFAULT now()
--   - created_by uuid REFERENCES auth.users(id) (nullable for seed data)
--   - updated_at auto-update trigger
--   - Row Level Security enabled with authenticated user policies
-- ============================================================================
