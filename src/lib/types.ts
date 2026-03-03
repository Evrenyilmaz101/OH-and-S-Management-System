// === CORE TYPES ===
export type EmploymentType = 'Employee' | 'Contractor' | 'Visitor';
export type EmployeeStatus = 'Active' | 'Inactive';
export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type VOCStatus = 'Not Competent' | 'In Training' | 'Competent';
export type ExpiryStatus = 'valid' | 'expiring' | 'expired';

export interface Employee {
  id: string;
  employee_number?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  role_id: string;
  employment_type: EmploymentType;
  start_date: string;
  status: EmployeeStatus;
  induction_status: OnboardingStatus;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  notes: string;
  photo_url?: string;
  manager_id?: string;
  workshop_id?: string;
}

export interface Task {
  id: string;
  name: string;
  description: string;
  category: string;
  risk_level: RiskLevel;
  required_ppe: string[];
  active: boolean;
}

export interface VOCRecord {
  id: string;
  employee_id: string;
  task_id: string;
  status: VOCStatus;
  assessed_date: string;
  assessed_by: string;
  expiry_date: string;
  notes: string;
}

export interface Certification {
  id: string;
  employee_id: string;
  cert_name: string;
  cert_number: string;
  issuing_body: string;
  issue_date: string;
  expiry_date: string;
}

// === ROLE DEFINITIONS & SKILLS MATRIX ===
export interface RoleDefinition {
  id: string;
  name: string;
  description: string;
  required_task_ids: string[];
  required_cert_types: string[];
  active: boolean;
}

// === ONBOARDING & INDUCTION ===
export type InductionItemStatus = 'Pending' | 'Completed' | 'N/A';
export type OnboardingStatus = 'Not Started' | 'In Progress' | 'Completed';
export type PayrollItemStatus = 'Pending' | 'Submitted' | 'N/A';

export interface InductionChecklistTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  required_for: 'All' | 'Employee' | 'Contractor' | 'Visitor';
  order: number;
  active: boolean;
}

export interface InductionRecord {
  id: string;
  employee_id: string;
  checklist_item_id: string;
  status: InductionItemStatus;
  completed_date: string;
  completed_by: string;
  notes: string;
}

export interface OnboardingRecord {
  id: string;
  employee_id: string;
  status: OnboardingStatus;
  start_date: string;
  completed_date: string;
  tfn_declaration_submitted: PayrollItemStatus;
  super_choice_submitted: PayrollItemStatus;
  bank_details_submitted: PayrollItemStatus;
  emergency_contact_provided: PayrollItemStatus;
  notes: string;
}

// === SOPs ===
export type SOPStatus = 'Current' | 'Under Review' | 'Archived';

export interface SOP {
  id: string;
  title: string;
  document_number: string;
  version: string;
  category: string;
  description: string;
  content: string;
  associated_equipment: string[];
  associated_task_ids: string[];
  review_date: string;
  last_reviewed_by: string;
  status: SOPStatus;
  created_date: string;
  updated_date: string;
}

export interface SOPAcknowledgment {
  id: string;
  sop_id: string;
  employee_id: string;
  acknowledged_date: string;
  acknowledged: boolean;
  notes: string;
}

// === INCIDENTS ===
export type IncidentType =
  | 'Near Miss'
  | 'First Aid'
  | 'Medical Treatment'
  | 'Lost Time Injury'
  | 'Dangerous Occurrence'
  | 'Property Damage';

export type IncidentSeverity = 'Insignificant' | 'Minor' | 'Moderate' | 'Major' | 'Catastrophic';

export type IncidentStatus =
  | 'Open'
  | 'Under Investigation'
  | 'Corrective Actions'
  | 'Closed';

export interface IncidentReport {
  id: string;
  incident_number: string;
  date: string;
  time: string;
  location: string;
  type: IncidentType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  reported_by: string;
  reported_date: string;
  involved_person_ids: string[];
  witness_ids: string[];
  description: string;
  immediate_actions: string;
  root_cause: string;
  contributing_factors: string;
  investigated_by: string;
  investigation_date: string;
  notes: string;
  closed_date: string;
}

// === DOCUMENTS ===
export type DocumentCategory =
  | 'SOP'
  | 'SWMS'
  | 'Risk Assessment'
  | 'Policy'
  | 'Form'
  | 'Certificate'
  | 'Licence'
  | 'SDS'
  | 'Warning'
  | 'Leave Application'
  | 'Induction Verification'
  | 'VOC Verification';

export type DocumentStatus = 'Current' | 'Under Review' | 'Superseded' | 'Archived';

export interface Document {
  id: string;
  title: string;
  document_number: string;
  version: string;
  category: DocumentCategory;
  description: string;
  content: string;
  file_name: string;
  file_url: string;
  upload_date: string;
  review_date: string;
  status: DocumentStatus;
  tags: string[];
  related_entity_id: string;
  related_entity_type: string;
  created_by: string;
  notes: string;
}

// === COMPLIANCE ===
export type SWMSStatus = 'Draft' | 'Current' | 'Under Review' | 'Archived';

export interface SWMS {
  id: string;
  title: string;
  document_number: string;
  version: string;
  high_risk_activities: string[];
  associated_task_ids: string[];
  prepared_by: string;
  reviewed_by: string;
  approved_by: string;
  review_date: string;
  status: SWMSStatus;
  content: string;
  notes: string;
}

export type RiskAssessmentStatus = 'Draft' | 'Current' | 'Under Review' | 'Archived';

export interface RiskAssessment {
  id: string;
  title: string;
  document_number: string;
  assessment_type: 'Risk Assessment' | 'JSA';
  associated_task_ids: string[];
  location: string;
  assessed_by: string;
  assessment_date: string;
  review_date: string;
  status: RiskAssessmentStatus;
  risk_rating_before: RiskLevel;
  risk_rating_after: RiskLevel;
  controls: string;
  content: string;
  notes: string;
}

// === PLANT & EQUIPMENT ===
export type PlantStatus = 'Operational' | 'Out of Service' | 'Under Maintenance' | 'Decommissioned';
export type RegistrationStatus = 'Registered' | 'Not Required' | 'Pending' | 'Expired';

export interface PlantEquipment {
  id: string;
  name: string;
  type: string;
  make: string;
  model: string;
  serial_number: string;
  asset_number: string;
  location: string;
  status: PlantStatus;
  registration_status: RegistrationStatus;
  registration_number: string;
  registration_expiry: string;
  purchase_date: string;
  last_maintenance_date: string;
  next_maintenance_date: string;
  maintenance_frequency_days: number;
  associated_sop_ids: string[];
  notes: string;
  workshop_id?: string;
}

// === HAZARDOUS SUBSTANCES ===
export interface HazardousSubstance {
  id: string;
  product_name: string;
  manufacturer: string;
  un_number: string;
  dangerous_goods_class: string;
  location_stored: string;
  sds_document_id: string;
  sds_issue_date: string;
  sds_expiry_date: string;
  quantity_held: string;
  risk_phrases: string[];
  control_measures: string;
  first_aid_measures: string;
  notes: string;
  workshop_id?: string;
}

// === TOOLBOX TALKS ===
export interface ToolboxTalk {
  id: string;
  title: string;
  date: string;
  time: string;
  conducted_by: string;
  location: string;
  attendee_ids: string[];
  topics_covered: string[];
  actions_arising: string;
  notes: string;
}

// === PPE ===
export type PPECondition = 'Good' | 'Fair' | 'Replace';

export interface PPERecord {
  id: string;
  employee_id: string;
  ppe_type: string;
  brand: string;
  serial_number: string;
  date_issued: string;
  expiry_date: string;
  condition: PPECondition;
  notes: string;
  workshop_id?: string;
}

// === FIRST AID ===
export interface FirstAidEntry {
  id: string;
  date: string;
  time: string;
  injured_person_id: string;
  nature_of_injury: string;
  body_part: string;
  treatment_provided: string;
  treated_by: string;
  location: string;
  follow_up_required: boolean;
  follow_up_notes: string;
  incident_report_id: string;
  workshop_id?: string;
}

// === INSPECTIONS ===
export type InspectionStatus = 'Scheduled' | 'In Progress' | 'Completed' | 'Overdue';
export type InspectionRating = 'Satisfactory' | 'Needs Improvement' | 'Unsatisfactory';

export interface InspectionFinding {
  id: string;
  description: string;
  severity: RiskLevel;
  corrective_action_id: string;
}

export interface WorkplaceInspection {
  id: string;
  title: string;
  inspection_type: string;
  scheduled_date: string;
  completed_date: string;
  inspector: string;
  location: string;
  status: InspectionStatus;
  findings: InspectionFinding[];
  overall_rating: InspectionRating;
  notes: string;
  workshop_id?: string;
}

// === EMERGENCY ===
export interface EmergencyInfo {
  id: string;
  type: string;
  title: string;
  description: string;
  responsible_person_id: string;
  location: string;
  contact_number: string;
  last_reviewed: string;
  review_due: string;
  notes: string;
  workshop_id?: string;
}

// === CORRECTIVE ACTIONS ===
export type CorrectiveActionStatus = 'Open' | 'In Progress' | 'Completed' | 'Overdue' | 'Closed';
export type CorrectiveActionSource = 'Incident' | 'Inspection' | 'Audit' | 'SWMS Review' | 'Toolbox Talk' | 'WorkSafe Notice' | 'Other';
export type CorrectiveActionPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface CorrectiveAction {
  id: string;
  action_number: string;
  description: string;
  source_type: CorrectiveActionSource;
  source_id: string;
  source_reference: string;
  priority: CorrectiveActionPriority;
  assigned_to: string;
  due_date: string;
  status: CorrectiveActionStatus;
  completed_date: string;
  completion_notes: string;
  verified_by: string;
  verified_date: string;
  created_date: string;
  notes: string;
}

// === DOCUMENT TEMPLATES ===

export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  file_name: string;
  file_url: string;
  active: boolean;
  sort_order: number;
}

// === VOC ASSESSMENT TEMPLATES & ASSESSMENTS ===

export interface VOCAssessmentTemplate {
  id: string;
  task_id: string;
  name: string;
  sop_reference: string;
  knowledge_questions: { question: string }[];
  practical_tasks: { task: string; criteria: string }[];
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface VOCAssessment {
  id: string;
  voc_record_id: string;
  employee_id: string;
  task_id: string;
  template_id: string;
  assessor_name: string;
  employee_position: string;
  assessment_date: string;
  sop_acknowledged: boolean;
  knowledge_responses: { question: string; response: string; competent: boolean }[];
  practical_responses: { task: string; criteria: string; competent: boolean }[];
  overall_outcome: string;
  assessor_comments: string;
  assessor_signature: string;
  employee_signature: string;
  document_id: string;
  created_at?: string;
  updated_at?: string;
}

// === COMPANY POLICIES ===

export interface CompanyPolicy {
  id: string;
  name: string;
  description: string;
  category: string;
  version: string;
  effective_date: string;
  review_date: string;
  status: string;
  file_name: string;
  file_url: string;
  active: boolean;
  sort_order: number;
}

// === LEAVE REQUESTS ===
export type LeaveType =
  | 'Annual Leave'
  | 'Personal/Sick Leave'
  | 'Long Service Leave'
  | 'Unpaid Leave'
  | 'Compassionate Leave'
  | 'Parental Leave';

export type LeaveRequestStatus = 'Pending' | 'Approved' | 'Rejected' | 'Escalated';

export interface LeaveRequest {
  id: string;
  employee_id: string;
  employee_name: string;
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  reason: string;
  status: LeaveRequestStatus;
  manager_id?: string;
  approved_by?: string;
  approved_date?: string;
  approval_token?: string;
  escalated_to?: string;
  escalated_by?: string;
  escalation_notes?: string;
  escalated_date?: string;
  created_at?: string;
}

// === WORKSHOPS ===
export interface Workshop {
  id: string;
  name: string;
  code: string;
  description: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

// === MANAGERS ===
export type ManagerType = 'Manager' | 'Supervisor';

export interface Manager {
  id: string;
  name: string;
  email: string;
  workshop_id?: string;
  type: ManagerType;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

// === USER PROFILES ===
export interface UserProfile {
  id: string;
  auth_user_id: string;
  workshop_id?: string;
  is_admin: boolean;
  display_name: string;
  created_at?: string;
  updated_at?: string;
}
