import type {
  Employee, Task, VOCRecord, Certification, RoleDefinition,
  InductionChecklistTemplate, InductionRecord, OnboardingRecord,
  SOP, SOPAcknowledgment, IncidentReport, CorrectiveAction,
  Document, SWMS, RiskAssessment, ToolboxTalk,
  PlantEquipment, HazardousSubstance, PPERecord, FirstAidEntry,
  WorkplaceInspection, EmergencyInfo,
} from './types';

// ── EMPLOYEES ──
export const demoEmployees: Employee[] = [
  {
    id: 'emp-001', first_name: 'Craig', last_name: 'Morrison',
    email: 'c.morrison@thorntoneng.com.au', phone: '0412 345 678',
    role: 'Boilermaker/Welder', role_id: 'role-001',
    employment_type: 'Employee', start_date: '2019-03-15', status: 'Active',
    induction_status: 'Completed',
    emergency_contact_name: 'Sarah Morrison', emergency_contact_phone: '0412 999 001',
    notes: 'Lead fabricator on pressure vessel projects. AS 1796 Cert 3 qualified.',
  },
  {
    id: 'emp-002', first_name: 'Shane', last_name: 'Baxter',
    email: 's.baxter@thorntoneng.com.au', phone: '0423 456 789',
    role: 'Welder/Fitter', role_id: 'role-002',
    employment_type: 'Employee', start_date: '2020-07-01', status: 'Active',
    induction_status: 'Completed',
    emergency_contact_name: 'Karen Baxter', emergency_contact_phone: '0423 999 002',
    notes: 'Specialist in TIG welding stainless and aluminium.',
  },
  {
    id: 'emp-003', first_name: 'Darren', last_name: 'Kowalski',
    email: 'd.kowalski@thorntoneng.com.au', phone: '0434 567 890',
    role: 'Rigger/Crane Operator', role_id: 'role-003',
    employment_type: 'Employee', start_date: '2018-11-20', status: 'Active',
    induction_status: 'Completed',
    emergency_contact_name: 'Maria Kowalski', emergency_contact_phone: '0434 999 003',
    notes: 'Dogging and rigging specialist. Overhead crane certified.',
  },
  {
    id: 'emp-004', first_name: 'Jake', last_name: 'Thornton',
    email: 'j.thornton@thorntoneng.com.au', phone: '0445 678 901',
    role: 'Apprentice Boilermaker', role_id: 'role-005',
    employment_type: 'Employee', start_date: '2024-02-05', status: 'Active',
    induction_status: 'Completed',
    emergency_contact_name: 'Ron Thornton', emergency_contact_phone: '0445 999 004',
    notes: '2nd year apprentice. Enrolled at Kangan TAFE.',
  },
  {
    id: 'emp-005', first_name: 'Mick', last_name: 'Patterson',
    email: 'm.patterson@contractweld.com.au', phone: '0456 789 012',
    role: 'Contract Welder', role_id: 'role-006',
    employment_type: 'Contractor', start_date: '2023-09-10', status: 'Inactive',
    induction_status: 'Completed',
    emergency_contact_name: 'Jenny Patterson', emergency_contact_phone: '0456 999 005',
    notes: 'Contract ended Dec 2024. Available for recall.',
  },
  {
    id: 'emp-006', first_name: 'Lisa', last_name: 'Chen',
    email: 'l.chen@thorntoneng.com.au', phone: '0467 890 123',
    role: 'Quality Inspector', role_id: 'role-004',
    employment_type: 'Employee', start_date: '2022-01-10', status: 'Active',
    induction_status: 'Completed',
    emergency_contact_name: 'David Chen', emergency_contact_phone: '0467 999 006',
    notes: 'NATA accredited inspector. NDT Level II certified.',
  },
  {
    id: 'emp-007', first_name: 'Tom', last_name: 'Wright',
    email: 't.wright@thorntoneng.com.au', phone: '0478 901 234',
    role: 'Apprentice Boilermaker', role_id: 'role-005',
    employment_type: 'Employee', start_date: '2025-11-18', status: 'Active',
    induction_status: 'In Progress',
    emergency_contact_name: 'Helen Wright', emergency_contact_phone: '0478 999 007',
    notes: '1st year apprentice. Currently completing induction. Enrolled at Kangan TAFE.',
  },
];

// ── TASKS ──
export const demoTasks: Task[] = [
  { id: 'task-001', name: 'MIG Welding', description: 'Gas Metal Arc Welding (GMAW) on carbon steel and stainless steel plate and pipe in all positions.', category: 'Welding', risk_level: 'High', required_ppe: ['Welding Helmet', 'Welding Gloves', 'FR Clothing', 'Safety Boots', 'Ear Protection'], active: true },
  { id: 'task-002', name: 'TIG Welding', description: 'Gas Tungsten Arc Welding (GTAW) on stainless steel, aluminium, and exotic alloys.', category: 'Welding', risk_level: 'High', required_ppe: ['Welding Helmet', 'TIG Gloves', 'FR Clothing', 'Safety Boots', 'Ear Protection'], active: true },
  { id: 'task-003', name: 'Overhead Crane Operation', description: 'Operation of workshop overhead bridge crane up to 10 tonne capacity.', category: 'Lifting', risk_level: 'Critical', required_ppe: ['Hard Hat', 'Safety Boots', 'Hi-Vis Vest', 'Gloves'], active: true },
  { id: 'task-004', name: 'Oxy-Acetylene Cutting', description: 'Thermal cutting of carbon steel plate and sections using oxy-fuel equipment.', category: 'Hot Work', risk_level: 'High', required_ppe: ['Cutting Goggles', 'Leather Gloves', 'FR Clothing', 'Safety Boots', 'Ear Protection'], active: true },
  { id: 'task-005', name: 'Angle Grinding', description: 'Use of portable angle grinders for cutting, grinding, and linishing operations.', category: 'Hot Work', risk_level: 'Medium', required_ppe: ['Face Shield', 'Safety Glasses', 'Leather Gloves', 'Ear Protection', 'Safety Boots'], active: true },
  { id: 'task-006', name: 'Confined Space Entry', description: 'Entry into vessels, tanks, and other confined spaces for fabrication and inspection work.', category: 'Confined Space', risk_level: 'Critical', required_ppe: ['Gas Detector', 'Harness', 'Hard Hat', 'Safety Boots', 'Respirator'], active: true },
  { id: 'task-007', name: 'Working at Heights', description: 'Work performed above 2 metres including scaffold access and EWP operation.', category: 'Heights', risk_level: 'Critical', required_ppe: ['Harness', 'Hard Hat', 'Safety Boots', 'Hi-Vis Vest'], active: true },
  { id: 'task-008', name: 'Forklift Operation', description: 'Operation of counterbalance forklift for material handling and loading/unloading.', category: 'Lifting', risk_level: 'Medium', required_ppe: ['Hard Hat', 'Safety Boots', 'Hi-Vis Vest', 'Seatbelt'], active: true },
  { id: 'task-009', name: 'Plasma Cutting', description: 'Operation of CNC and hand-held plasma cutting equipment on various materials.', category: 'Hot Work', risk_level: 'High', required_ppe: ['Cutting Goggles', 'Leather Gloves', 'FR Clothing', 'Ear Protection', 'Safety Boots'], active: true },
  { id: 'task-010', name: 'Plate Rolling', description: 'Operation of plate rolling machine for cylindrical and conical shell forming.', category: 'Machine Operation', risk_level: 'High', required_ppe: ['Safety Glasses', 'Gloves', 'Safety Boots', 'Ear Protection'], active: true },
];

// ── VOC RECORDS ──
export const demoVOCRecords: VOCRecord[] = [
  { id: 'voc-001', employee_id: 'emp-001', task_id: 'task-001', status: 'Competent', assessed_date: '2024-06-15', assessed_by: 'Ron Thornton', expiry_date: '2026-06-15', notes: 'Excellent technique across all positions. Passed bend test.' },
  { id: 'voc-002', employee_id: 'emp-001', task_id: 'task-002', status: 'Competent', assessed_date: '2024-06-15', assessed_by: 'Ron Thornton', expiry_date: '2026-06-15', notes: 'Qualified on SS and aluminium. Clean welds.' },
  { id: 'voc-003', employee_id: 'emp-001', task_id: 'task-006', status: 'Competent', assessed_date: '2024-03-10', assessed_by: 'Ron Thornton', expiry_date: '2026-03-10', notes: 'Completed confined space refresher. Gas testing competent.' },
  { id: 'voc-004', employee_id: 'emp-001', task_id: 'task-004', status: 'Competent', assessed_date: '2024-06-15', assessed_by: 'Ron Thornton', expiry_date: '2026-06-15', notes: 'Safe oxy technique. Flashback arrestor checks competent.' },
  { id: 'voc-005', employee_id: 'emp-001', task_id: 'task-005', status: 'Competent', assessed_date: '2024-06-15', assessed_by: 'Ron Thornton', expiry_date: '2026-06-15', notes: 'Guard use and disc selection competent.' },
  { id: 'voc-006', employee_id: 'emp-002', task_id: 'task-002', status: 'Competent', assessed_date: '2024-08-20', assessed_by: 'Craig Morrison', expiry_date: '2026-08-20', notes: 'Strong TIG skills. Passed pressure weld test.' },
  { id: 'voc-007', employee_id: 'emp-002', task_id: 'task-001', status: 'Competent', assessed_date: '2024-08-20', assessed_by: 'Craig Morrison', expiry_date: '2026-08-20', notes: 'Competent MIG in all positions.' },
  { id: 'voc-008', employee_id: 'emp-002', task_id: 'task-005', status: 'Competent', assessed_date: '2024-01-12', assessed_by: 'Ron Thornton', expiry_date: '2026-01-12', notes: 'Safe technique. Understands guard requirements.' },
  { id: 'voc-009', employee_id: 'emp-003', task_id: 'task-003', status: 'Competent', assessed_date: '2023-11-05', assessed_by: 'Ron Thornton', expiry_date: '2025-11-05', notes: 'Experienced crane operator. Load calculation competent.' },
  { id: 'voc-010', employee_id: 'emp-003', task_id: 'task-007', status: 'Competent', assessed_date: '2024-04-18', assessed_by: 'Ron Thornton', expiry_date: '2026-04-18', notes: 'Harness inspection and rescue plan competent.' },
  { id: 'voc-011', employee_id: 'emp-003', task_id: 'task-008', status: 'Competent', assessed_date: '2024-04-18', assessed_by: 'Ron Thornton', expiry_date: '2026-04-18', notes: 'Safe forklift operation. Pre-start checks competent.' },
  { id: 'voc-012', employee_id: 'emp-004', task_id: 'task-001', status: 'In Training', assessed_date: '2024-09-01', assessed_by: 'Craig Morrison', expiry_date: '2026-09-01', notes: 'Progressing well. Flat and horizontal positions achieved.' },
  { id: 'voc-013', employee_id: 'emp-004', task_id: 'task-005', status: 'Not Competent', assessed_date: '2024-09-01', assessed_by: 'Craig Morrison', expiry_date: '2026-09-01', notes: 'Needs further training on guard adjustment and disc selection.' },
  { id: 'voc-014', employee_id: 'emp-006', task_id: 'task-006', status: 'Competent', assessed_date: '2024-05-20', assessed_by: 'Ron Thornton', expiry_date: '2026-05-20', notes: 'Gas testing and atmosphere monitoring competent for QC inspections.' },
];

// ── CERTIFICATIONS ──
export const demoCertifications: Certification[] = [
  { id: 'cert-001', employee_id: 'emp-001', cert_name: 'Welding Certification AS 1796 Cert 3', cert_number: 'WC-2022-4481', issuing_body: 'WTIA', issue_date: '2022-05-20', expiry_date: '2025-05-20' },
  { id: 'cert-002', employee_id: 'emp-001', cert_name: 'Confined Space Entry', cert_number: 'CSE-10234', issuing_body: 'WorkSafe Victoria', issue_date: '2024-03-10', expiry_date: '2026-03-10' },
  { id: 'cert-003', employee_id: 'emp-002', cert_name: 'Welding Certification AS 1796 Cert 4', cert_number: 'WC-2023-5592', issuing_body: 'WTIA', issue_date: '2023-08-15', expiry_date: '2026-08-15' },
  { id: 'cert-004', employee_id: 'emp-003', cert_name: 'Overhead Crane Licence', cert_number: 'HCR-0087621', issuing_body: 'WorkSafe Victoria', issue_date: '2021-06-01', expiry_date: '2026-06-01' },
  { id: 'cert-005', employee_id: 'emp-003', cert_name: 'Dogging Licence', cert_number: 'DG-0043218', issuing_body: 'WorkSafe Victoria', issue_date: '2020-04-12', expiry_date: '2025-04-12' },
  { id: 'cert-006', employee_id: 'emp-003', cert_name: 'Working at Heights', cert_number: 'WAH-77823', issuing_body: 'Height Safety Training Vic', issue_date: '2024-04-18', expiry_date: '2026-04-18' },
  { id: 'cert-007', employee_id: 'emp-003', cert_name: 'Forklift Licence', cert_number: 'FL-0091445', issuing_body: 'WorkSafe Victoria', issue_date: '2019-09-30', expiry_date: '2024-09-30' },
  { id: 'cert-008', employee_id: 'emp-006', cert_name: 'NDT Level II - UT', cert_number: 'NDT-UT-2201', issuing_body: 'AINDT', issue_date: '2022-06-15', expiry_date: '2027-06-15' },
  { id: 'cert-009', employee_id: 'emp-006', cert_name: 'NDT Level II - MT/PT', cert_number: 'NDT-MTPT-2202', issuing_body: 'AINDT', issue_date: '2022-06-15', expiry_date: '2027-06-15' },
  { id: 'cert-010', employee_id: 'emp-001', cert_name: 'First Aid Certificate', cert_number: 'FA-VIC-88210', issuing_body: 'St John Ambulance Vic', issue_date: '2024-01-20', expiry_date: '2027-01-20' },
];

// ── ROLE DEFINITIONS ──
export const demoRoles: RoleDefinition[] = [
  { id: 'role-001', name: 'Boilermaker/Welder', description: 'Qualified tradesperson for pressure vessel fabrication including welding, cutting, grinding, and confined space work.', required_task_ids: ['task-001', 'task-002', 'task-004', 'task-005', 'task-006'], required_cert_types: ['Welding Certification AS 1796'], active: true },
  { id: 'role-002', name: 'Welder/Fitter', description: 'Qualified welder/fitter for general fabrication including MIG, TIG, and grinding operations.', required_task_ids: ['task-001', 'task-002', 'task-005'], required_cert_types: ['Welding Certification AS 1796'], active: true },
  { id: 'role-003', name: 'Rigger/Crane Operator', description: 'Licensed rigger and crane operator for all workshop lifting operations.', required_task_ids: ['task-003', 'task-007', 'task-008'], required_cert_types: ['Overhead Crane Licence', 'Dogging Licence', 'Working at Heights'], active: true },
  { id: 'role-004', name: 'Quality Inspector', description: 'NATA accredited quality inspector for weld and material inspection.', required_task_ids: ['task-006'], required_cert_types: ['NDT Level II'], active: true },
  { id: 'role-005', name: 'Apprentice Boilermaker', description: 'Boilermaker apprentice in training — requires competency in basic tasks.', required_task_ids: ['task-001', 'task-005'], required_cert_types: [], active: true },
  { id: 'role-006', name: 'Contract Welder', description: 'External contract welder for project-based fabrication work.', required_task_ids: ['task-001', 'task-002'], required_cert_types: ['Welding Certification AS 1796'], active: true },
  { id: 'role-007', name: 'Workshop Supervisor', description: 'Supervises all workshop operations, responsible for safety and production.', required_task_ids: ['task-001', 'task-003', 'task-005', 'task-006', 'task-007'], required_cert_types: ['First Aid Certificate'], active: true },
];

// ── INDUCTION TEMPLATES ──
export const demoInductionTemplates: InductionChecklistTemplate[] = [
  { id: 'ind-t-001', title: 'Site Safety Orientation', description: 'Introduction to workshop layout, hazard zones, emergency exits, and assembly points.', category: 'General Safety', required_for: 'All', order: 1, active: true },
  { id: 'ind-t-002', title: 'Emergency Procedures', description: 'Fire evacuation routes, emergency contacts, first aid locations, and spill response.', category: 'General Safety', required_for: 'All', order: 2, active: true },
  { id: 'ind-t-003', title: 'PPE Requirements', description: 'Minimum PPE requirements for workshop entry and task-specific PPE.', category: 'General Safety', required_for: 'All', order: 3, active: true },
  { id: 'ind-t-004', title: 'Hazard Reporting Procedure', description: 'How to identify and report hazards, near misses, and incidents.', category: 'General Safety', required_for: 'All', order: 4, active: true },
  { id: 'ind-t-005', title: 'Workshop Rules & Housekeeping', description: 'General workshop conduct, housekeeping standards, and no-go zones.', category: 'Site Specific', required_for: 'All', order: 5, active: true },
  { id: 'ind-t-006', title: 'Hot Work Permit System', description: 'Understanding when hot work permits are required and the permit process.', category: 'Site Specific', required_for: 'All', order: 6, active: true },
  { id: 'ind-t-007', title: 'Confined Space Awareness', description: 'Identification of confined spaces and permit-required entry procedures.', category: 'Site Specific', required_for: 'All', order: 7, active: true },
  { id: 'ind-t-008', title: 'Chemical & Hazardous Substances', description: 'SDS location, chemical storage requirements, and spill kits.', category: 'Site Specific', required_for: 'All', order: 8, active: true },
  { id: 'ind-t-009', title: 'Crane & Lifting Safety', description: 'Overhead crane exclusion zones and safe lifting procedures.', category: 'Site Specific', required_for: 'All', order: 9, active: true },
  { id: 'ind-t-010', title: 'Noise & Hearing Conservation', description: 'Noise zones, audiometric testing requirements, and hearing PPE.', category: 'General Safety', required_for: 'All', order: 10, active: true },
  { id: 'ind-t-011', title: 'Manual Handling', description: 'Correct manual handling techniques and when to use mechanical aids.', category: 'General Safety', required_for: 'All', order: 11, active: true },
  { id: 'ind-t-012', title: 'Drug & Alcohol Policy', description: 'Company drug and alcohol policy and testing procedures.', category: 'General Safety', required_for: 'All', order: 12, active: true },
  { id: 'ind-t-013', title: 'Injury Management & Return to Work', description: 'WorkCover reporting, injury management process, and return to work policy.', category: 'General Safety', required_for: 'Employee', order: 13, active: true },
  { id: 'ind-t-014', title: 'Environmental Responsibilities', description: 'Waste disposal, recycling, and environmental management.', category: 'General Safety', required_for: 'All', order: 14, active: true },
  { id: 'ind-t-015', title: 'IT Systems & Security', description: 'Access to timesheets, safety reporting systems, and email.', category: 'Documentation', required_for: 'Employee', order: 15, active: true },
  { id: 'ind-t-016', title: 'Quality Management Overview', description: 'Introduction to quality management system and ITP requirements.', category: 'Documentation', required_for: 'Employee', order: 16, active: true },
  { id: 'ind-t-017', title: 'Contractor Safety Requirements', description: 'Additional safety requirements specific to contractors including SWMS.', category: 'Site Specific', required_for: 'Contractor', order: 17, active: true },
  { id: 'ind-t-018', title: 'Apprentice Supervision Requirements', description: 'Supervision ratios, log book requirements, and TAFE schedule.', category: 'Documentation', required_for: 'All', order: 18, active: true },
  { id: 'ind-t-019', title: 'Workplace Bullying & Harassment', description: 'Anti-bullying policy, reporting mechanisms, and support contacts.', category: 'General Safety', required_for: 'All', order: 19, active: true },
  { id: 'ind-t-020', title: 'Fatigue Management', description: 'Fatigue risk management, maximum work hours, and rest break requirements.', category: 'General Safety', required_for: 'All', order: 20, active: true },
];

// ── INDUCTION RECORDS (for Tom Wright - currently onboarding) ──
export const demoInductionRecords: InductionRecord[] = [
  { id: 'ind-r-001', employee_id: 'emp-007', checklist_item_id: 'ind-t-001', status: 'Completed', completed_date: '2025-11-18', completed_by: 'Ron Thornton', notes: '' },
  { id: 'ind-r-002', employee_id: 'emp-007', checklist_item_id: 'ind-t-002', status: 'Completed', completed_date: '2025-11-18', completed_by: 'Ron Thornton', notes: '' },
  { id: 'ind-r-003', employee_id: 'emp-007', checklist_item_id: 'ind-t-003', status: 'Completed', completed_date: '2025-11-18', completed_by: 'Ron Thornton', notes: '' },
  { id: 'ind-r-004', employee_id: 'emp-007', checklist_item_id: 'ind-t-004', status: 'Completed', completed_date: '2025-11-19', completed_by: 'Ron Thornton', notes: '' },
  { id: 'ind-r-005', employee_id: 'emp-007', checklist_item_id: 'ind-t-005', status: 'Completed', completed_date: '2025-11-19', completed_by: 'Craig Morrison', notes: '' },
  { id: 'ind-r-006', employee_id: 'emp-007', checklist_item_id: 'ind-t-006', status: 'Completed', completed_date: '2025-11-19', completed_by: 'Craig Morrison', notes: '' },
  { id: 'ind-r-007', employee_id: 'emp-007', checklist_item_id: 'ind-t-007', status: 'Pending', completed_date: '', completed_by: '', notes: '' },
  { id: 'ind-r-008', employee_id: 'emp-007', checklist_item_id: 'ind-t-008', status: 'Pending', completed_date: '', completed_by: '', notes: '' },
  { id: 'ind-r-009', employee_id: 'emp-007', checklist_item_id: 'ind-t-009', status: 'Pending', completed_date: '', completed_by: '', notes: '' },
  { id: 'ind-r-010', employee_id: 'emp-007', checklist_item_id: 'ind-t-010', status: 'Pending', completed_date: '', completed_by: '', notes: '' },
  { id: 'ind-r-011', employee_id: 'emp-007', checklist_item_id: 'ind-t-011', status: 'Pending', completed_date: '', completed_by: '', notes: '' },
  { id: 'ind-r-012', employee_id: 'emp-007', checklist_item_id: 'ind-t-012', status: 'Pending', completed_date: '', completed_by: '', notes: '' },
  { id: 'ind-r-013', employee_id: 'emp-007', checklist_item_id: 'ind-t-018', status: 'Pending', completed_date: '', completed_by: '', notes: '' },
  { id: 'ind-r-014', employee_id: 'emp-007', checklist_item_id: 'ind-t-019', status: 'Pending', completed_date: '', completed_by: '', notes: '' },
  { id: 'ind-r-015', employee_id: 'emp-007', checklist_item_id: 'ind-t-020', status: 'Pending', completed_date: '', completed_by: '', notes: '' },
  { id: 'ind-r-016', employee_id: 'emp-007', checklist_item_id: 'ind-t-014', status: 'Pending', completed_date: '', completed_by: '', notes: '' },
];

// ── ONBOARDING RECORDS ──
export const demoOnboardingRecords: OnboardingRecord[] = [
  { id: 'onb-001', employee_id: 'emp-007', status: 'In Progress', start_date: '2025-11-18', completed_date: '', tfn_declaration_submitted: 'Submitted', super_choice_submitted: 'Submitted', bank_details_submitted: 'Pending', emergency_contact_provided: 'Submitted', notes: 'Tom started 18 Nov. Bank details form still outstanding.' },
  { id: 'onb-002', employee_id: 'emp-004', status: 'Completed', start_date: '2024-02-05', completed_date: '2024-02-12', tfn_declaration_submitted: 'Submitted', super_choice_submitted: 'Submitted', bank_details_submitted: 'Submitted', emergency_contact_provided: 'Submitted', notes: '' },
  { id: 'onb-003', employee_id: 'emp-006', status: 'Completed', start_date: '2022-01-10', completed_date: '2022-01-17', tfn_declaration_submitted: 'Submitted', super_choice_submitted: 'Submitted', bank_details_submitted: 'Submitted', emergency_contact_provided: 'Submitted', notes: '' },
];

// ── SOPs ──
export const demoSOPs: SOP[] = [
  {
    id: 'sop-001', title: 'MIG Welding Operations', document_number: 'SOP-WLD-001', version: '3.1',
    category: 'Welding', description: 'Standard operating procedure for MIG (GMAW) welding in the workshop.',
    content: `PURPOSE\nThis procedure covers safe operation of MIG welding equipment at Thornton Engineering.\n\nSCOPE\nApplies to all personnel performing GMAW welding on carbon steel, stainless steel, and aluminium.\n\nPRE-START CHECKS\n1. Inspect welding lead and earth clamp for damage\n2. Check gas cylinder is secured and regulator set to correct flow rate (15-20 L/min for CO2/Argon mix)\n3. Confirm wire feed tension is set correctly for wire diameter\n4. Ensure welding screen/curtains are in place\n5. Check fire extinguisher is within 5 metres\n6. Verify hot work permit if required\n\nPPE REQUIREMENTS\n- Auto-darkening welding helmet (shade 10-13)\n- Welding gauntlet gloves\n- FR long-sleeve shirt and trousers\n- Leather boots with metatarsal protection\n- Ear plugs or muffs\n\nSAFE WORK PROCEDURE\n1. Complete pre-start checklist\n2. Set voltage and wire feed speed per WPS\n3. Ensure workpiece is properly earthed\n4. Position welding screen to protect others from arc flash\n5. Maintain correct gun angle (15-20° push technique for flat/horizontal)\n6. Monitor interpass temperature per WPS\n7. Allow workpiece to cool before handling\n\nEMERGENCY PROCEDURES\n- Arc flash exposure: Flush eyes with water, seek first aid\n- Burns: Cool under running water for 20 minutes\n- Fire: Use CO2 or dry powder extinguisher`,
    associated_equipment: ['MIG Welder #1', 'MIG Welder #2', 'MIG Welder #3'],
    associated_task_ids: ['task-001'],
    review_date: '2026-06-15', last_reviewed_by: 'Craig Morrison', status: 'Current',
    created_date: '2021-03-01', updated_date: '2025-06-15',
  },
  {
    id: 'sop-002', title: 'TIG Welding Operations', document_number: 'SOP-WLD-002', version: '2.4',
    category: 'Welding', description: 'Standard operating procedure for TIG (GTAW) welding.',
    content: `PURPOSE\nThis procedure covers safe operation of TIG welding equipment at Thornton Engineering.\n\nSCOPE\nApplies to all qualified personnel performing GTAW welding on stainless steel, aluminium, and exotic alloys.\n\nPRE-START CHECKS\n1. Inspect TIG torch, tungsten electrode, and gas lens\n2. Check argon cylinder secured, regulator set (8-12 L/min)\n3. Verify correct tungsten type and preparation for material\n4. Ensure back-purge gas connected for SS pipe welds\n5. Check fire extinguisher within 5 metres\n\nPPE REQUIREMENTS\n- Auto-darkening helmet (shade 10-13)\n- TIG welding gloves (thin leather)\n- FR clothing\n- Safety boots\n- Ear protection\n\nSAFE WORK PROCEDURE\n1. Grind tungsten to correct angle on dedicated grinder\n2. Set amperage per WPS\n3. Use foot pedal or fingertip control for heat input\n4. Maintain correct torch angle (15-20°) and arc length\n5. Feed filler rod at consistent rate\n6. Monitor gas coverage — no drafts near weld zone\n7. Post-flow gas for minimum 5 seconds after arc stops`,
    associated_equipment: ['TIG Welder #1', 'TIG Welder #2'],
    associated_task_ids: ['task-002'],
    review_date: '2026-08-20', last_reviewed_by: 'Shane Baxter', status: 'Current',
    created_date: '2021-03-01', updated_date: '2025-08-20',
  },
  {
    id: 'sop-003', title: 'Overhead Crane Operation', document_number: 'SOP-LFT-001', version: '4.0',
    category: 'Lifting', description: 'Safe operation of the 10-tonne overhead bridge crane.',
    content: `PURPOSE\nSafe operation procedure for the workshop overhead bridge crane.\n\nSCOPE\nApplies to all licensed crane operators and doggers at Thornton Engineering.\n\nPRE-START CHECKS\n1. Visual inspection of crane structure, hook, and wire rope\n2. Check pendant control buttons function correctly\n3. Verify emergency stop works\n4. Inspect slings and shackles for damage — check SWL tags\n5. Confirm no personnel in lift zone\n\nLIFT PLANNING\n1. Determine load weight from drawings or weigh\n2. Select correct sling configuration and capacity\n3. Calculate sling angles — never exceed 60° from vertical\n4. Identify lift path and landing area\n5. Assign dogger/spotter if blind lift required\n\nSAFE WORK PROCEDURE\n1. Sound horn before every crane movement\n2. Lift load just clear of ground, check balance\n3. Never travel with load over personnel\n4. Use tag lines for load control\n5. Never leave load suspended unattended\n6. Lower load gently to landing area\n7. Slacken slings before disconnecting`,
    associated_equipment: ['10T Overhead Crane'],
    associated_task_ids: ['task-003'],
    review_date: '2026-04-01', last_reviewed_by: 'Darren Kowalski', status: 'Current',
    created_date: '2020-01-15', updated_date: '2025-04-01',
  },
  {
    id: 'sop-004', title: 'Oxy-Acetylene Cutting', document_number: 'SOP-HW-001', version: '2.2',
    category: 'Hot Work', description: 'Safe operation of oxy-acetylene cutting equipment.',
    content: `PURPOSE\nThis procedure covers the safe use of oxy-acetylene cutting equipment.\n\nPRE-START CHECKS\n1. Inspect hoses for damage, correct colour coding (red=acetylene, blue=oxygen)\n2. Check flashback arrestors fitted at both regulator and torch\n3. Verify regulators are rated for correct gas\n4. Leak test all connections with soapy water\n5. Ensure fire extinguisher and fire blanket within 5 metres\n\nLIGHTING PROCEDURE\n1. Open acetylene valve 1/4 turn, ignite with striker (never a lighter)\n2. Adjust acetylene until smoke clears\n3. Slowly open oxygen valve\n4. Adjust to neutral or slight oxidising flame for cutting\n\nSHUTDOWN PROCEDURE\n1. Close oxygen valve first\n2. Close acetylene valve\n3. Close cylinder valves\n4. Bleed lines by opening torch valves\n5. Back off regulator adjusting screws`,
    associated_equipment: ['Oxy-Fuel Set #1', 'Oxy-Fuel Set #2'],
    associated_task_ids: ['task-004'],
    review_date: '2026-06-15', last_reviewed_by: 'Craig Morrison', status: 'Current',
    created_date: '2021-06-01', updated_date: '2025-06-15',
  },
  {
    id: 'sop-005', title: 'Angle Grinder Operations', document_number: 'SOP-HW-002', version: '3.0',
    category: 'Hot Work', description: 'Safe use of portable angle grinders.',
    content: `PURPOSE\nSafe operating procedure for angle grinders used in cutting, grinding, and linishing.\n\nPRE-START CHECKS\n1. Check disc guard is fitted and correctly positioned\n2. Inspect disc for damage, chips, or excessive wear\n3. Verify disc speed rating matches or exceeds grinder RPM\n4. Check power cord/air hose for damage\n5. Test dead-man switch operation\n\nDISC SELECTION\n- Cutting: Use thin cutting discs (1.0-1.6mm) for clean cuts\n- Grinding: Use grinding discs — NEVER grind with a cutting disc\n- Linishing: Use flap discs for finishing work\n\nSAFE WORK PROCEDURE\n1. Clamp workpiece securely\n2. Position guard between disc and operator\n3. Allow grinder to reach full speed before contact\n4. Apply light, even pressure — let the disc do the work\n5. Never use grinder above shoulder height\n6. Disconnect power before changing discs\n7. Store grinder with guard in place`,
    associated_equipment: ['Angle Grinder 125mm', 'Angle Grinder 230mm'],
    associated_task_ids: ['task-005'],
    review_date: '2026-03-01', last_reviewed_by: 'Ron Thornton', status: 'Current',
    created_date: '2020-06-01', updated_date: '2025-03-01',
  },
  {
    id: 'sop-006', title: 'Confined Space Entry', document_number: 'SOP-CS-001', version: '5.1',
    category: 'Confined Space', description: 'Permit-required confined space entry procedure per AS 2865.',
    content: `PURPOSE\nProcedure for safe entry into confined spaces in accordance with AS 2865-2009.\n\nDEFINITION\nA confined space is an enclosed or partially enclosed space not designed for continuous occupancy, with restricted entry/exit, and risk of hazardous atmosphere or engulfment.\n\nEXAMPLES AT THORNTON ENGINEERING\n- Pressure vessels during fabrication\n- Storage tanks\n- Pipe sections > 600mm diameter\n\nENTRY REQUIREMENTS\n1. Confined Space Entry Permit completed and signed\n2. Atmosphere tested: O2 19.5-23.5%, LEL <5%, no toxic gases\n3. Continuous atmospheric monitoring in place\n4. Standby person positioned at entry point at all times\n5. Rescue plan documented and rescue equipment available\n6. Mechanical isolation and lockout/tagout completed\n7. Forced ventilation running minimum 15 minutes prior to entry\n\nATMOSPHERE TESTING SEQUENCE\n1. Test at top, middle, and bottom of space\n2. Record readings on permit\n3. Re-test every 30 minutes during entry\n4. If alarm sounds — evacuate immediately\n\nEMERGENCY RESCUE\n1. Standby person calls emergency (000) and activates alarm\n2. DO NOT enter to rescue without breathing apparatus\n3. Use retrieval line/winch where possible\n4. Provide first aid once entrant is removed`,
    associated_equipment: ['4-Gas Detector', 'Confined Space Rescue Kit', 'Tripod/Winch'],
    associated_task_ids: ['task-006'],
    review_date: '2026-03-10', last_reviewed_by: 'Ron Thornton', status: 'Current',
    created_date: '2019-01-01', updated_date: '2025-03-10',
  },
  {
    id: 'sop-007', title: 'Working at Heights', document_number: 'SOP-HT-001', version: '3.2',
    category: 'Heights', description: 'Working at heights procedure — any work above 2 metres.',
    content: `PURPOSE\nSafe work procedure for any task performed at a height of 2 metres or above.\n\nHIERARCHY OF CONTROLS\n1. Eliminate — can the work be done at ground level?\n2. Passive fall prevention — guardrails, barriers\n3. Work positioning — travel restraint systems\n4. Fall arrest — harness and lanyard (last resort)\n\nPRE-WORK REQUIREMENTS\n1. Working at Heights Permit completed\n2. Fall protection plan documented\n3. All personnel hold current Working at Heights certification\n4. Harnesses inspected — check for damage, correct fit, in-date tag\n5. Anchorage points rated for 15kN minimum\n\nSCAFFOLD ACCESS\n1. Only use scaffolds erected by licensed scaffolders\n2. Check scaffold tag is GREEN (safe to use)\n3. Maintain 3 points of contact on ladders\n4. Never overload scaffold — check rated capacity\n\nEWP OPERATION\n1. Only certified operators\n2. Pre-start checklist completed\n3. Harness connected to EWP anchorage point\n4. Spotter on ground when operating near structures`,
    associated_equipment: ['Safety Harnesses', 'EWP - Scissor Lift', 'Scaffold'],
    associated_task_ids: ['task-007'],
    review_date: '2026-04-18', last_reviewed_by: 'Darren Kowalski', status: 'Current',
    created_date: '2020-01-01', updated_date: '2025-04-18',
  },
  {
    id: 'sop-008', title: 'Forklift Operations', document_number: 'SOP-LFT-002', version: '2.1',
    category: 'Lifting', description: 'Safe operation of counterbalance forklift.',
    content: `PURPOSE\nSafe operating procedure for counterbalance forklift operation.\n\nPRE-START CHECKS\n1. Walk-around inspection — tyres, forks, mast, lights\n2. Check fluid levels — hydraulic, engine oil, coolant\n3. Test brakes, horn, lights, and reversing alarm\n4. Check seat belt operation\n5. Verify fork tips are not cracked or bent\n\nOPERATION\n1. Always wear seatbelt\n2. Forks 100-150mm above ground when travelling\n3. Tilt mast back when carrying loads\n4. Drive in reverse if load obstructs forward view\n5. Sound horn at intersections and blind corners\n6. Maximum speed 10 km/h in workshop\n7. Never carry passengers on forks or counterweight\n\nLOADING/UNLOADING\n1. Approach load squarely\n2. Check load weight against forklift capacity\n3. Insert forks fully under load\n4. Lift just enough to clear ground\n5. Tilt back slightly and check stability before moving`,
    associated_equipment: ['Forklift - Toyota 2.5T'],
    associated_task_ids: ['task-008'],
    review_date: '2026-04-18', last_reviewed_by: 'Darren Kowalski', status: 'Current',
    created_date: '2021-01-01', updated_date: '2025-04-18',
  },
];

// ── SOP ACKNOWLEDGMENTS ──
export const demoSOPAcknowledgments: SOPAcknowledgment[] = [
  { id: 'sop-ack-001', sop_id: 'sop-001', employee_id: 'emp-001', acknowledged_date: '2025-06-20', acknowledged: true, notes: '' },
  { id: 'sop-ack-002', sop_id: 'sop-002', employee_id: 'emp-001', acknowledged_date: '2025-06-20', acknowledged: true, notes: '' },
  { id: 'sop-ack-003', sop_id: 'sop-006', employee_id: 'emp-001', acknowledged_date: '2025-03-15', acknowledged: true, notes: '' },
  { id: 'sop-ack-004', sop_id: 'sop-001', employee_id: 'emp-002', acknowledged_date: '2025-08-25', acknowledged: true, notes: '' },
  { id: 'sop-ack-005', sop_id: 'sop-002', employee_id: 'emp-002', acknowledged_date: '2025-08-25', acknowledged: true, notes: '' },
  { id: 'sop-ack-006', sop_id: 'sop-003', employee_id: 'emp-003', acknowledged_date: '2025-04-05', acknowledged: true, notes: '' },
  { id: 'sop-ack-007', sop_id: 'sop-007', employee_id: 'emp-003', acknowledged_date: '2025-04-22', acknowledged: true, notes: '' },
  { id: 'sop-ack-008', sop_id: 'sop-008', employee_id: 'emp-003', acknowledged_date: '2025-04-22', acknowledged: true, notes: '' },
  { id: 'sop-ack-009', sop_id: 'sop-005', employee_id: 'emp-004', acknowledged_date: '2024-09-05', acknowledged: true, notes: '' },
  { id: 'sop-ack-010', sop_id: 'sop-006', employee_id: 'emp-006', acknowledged_date: '2025-05-25', acknowledged: true, notes: '' },
];

// ── INCIDENT REPORTS ──
export const demoIncidents: IncidentReport[] = [
  {
    id: 'inc-001', incident_number: 'INC-2025-001', date: '2025-09-14', time: '10:30',
    location: 'Workshop Bay 2 — Grinding Station', type: 'Near Miss', severity: 'Moderate', status: 'Corrective Actions',
    reported_by: 'emp-002', reported_date: '2025-09-14',
    involved_person_ids: ['emp-004'], witness_ids: ['emp-002'],
    description: 'Grinding disc shattered during cutting operation. Fragments struck welding screen but no personnel injured. Apprentice Jake Thornton was operating the grinder at the time. Investigation found disc was past its expiry date and had a hairline crack.',
    immediate_actions: 'Area cleared immediately. All grinding discs in workshop inspected. Expired and damaged discs removed from service. Jake stood down from grinding pending refresher training.',
    root_cause: 'Expired grinding disc used due to lack of regular disc inspection regime. Disc storage area not organised by date.',
    contributing_factors: 'No disc inspection checklist. Disc storage not labelled. Apprentice not trained on disc inspection.',
    investigated_by: 'Ron Thornton', investigation_date: '2025-09-15', notes: '',
    closed_date: '',
  },
  {
    id: 'inc-002', incident_number: 'INC-2025-002', date: '2025-10-22', time: '14:15',
    location: 'Workshop Bay 1 — Welding Station', type: 'First Aid', severity: 'Minor', status: 'Closed',
    reported_by: 'emp-001', reported_date: '2025-10-22',
    involved_person_ids: ['emp-002'], witness_ids: ['emp-001'],
    description: 'Shane Baxter received a minor burn to left forearm from welding spatter. Spatter entered gap between glove and sleeve cuff. Burn approximately 15mm diameter, first degree.',
    immediate_actions: 'Burn cooled under running water for 20 minutes. First aid dressing applied by Craig Morrison (first aider). Shane continued work after treatment.',
    root_cause: 'Welding spatter entered gap between glove cuff and sleeve. FR sleeve was not tucked into glove.',
    contributing_factors: 'Standard practice of tucking sleeves not consistently followed. Position required overhead welding which increases spatter exposure.',
    investigated_by: 'Craig Morrison', investigation_date: '2025-10-22', notes: 'Toolbox talk conducted on correct PPE wear for overhead welding.',
    closed_date: '2025-10-30',
  },
];

// ── CORRECTIVE ACTIONS ──
export const demoCorrectiveActions: CorrectiveAction[] = [
  {
    id: 'ca-001', action_number: 'CA-2025-001',
    description: 'Implement weekly grinding disc inspection checklist. All discs to be checked for damage and expiry before use.',
    source_type: 'Incident', source_id: 'inc-001', source_reference: 'INC-2025-001',
    priority: 'High', assigned_to: 'emp-001', due_date: '2025-10-01',
    status: 'Completed', completed_date: '2025-09-25', completion_notes: 'Checklist created and implemented. Disc storage reorganised with FIFO system.',
    verified_by: 'Ron Thornton', verified_date: '2025-09-28', created_date: '2025-09-15', notes: '',
  },
  {
    id: 'ca-002', action_number: 'CA-2025-002',
    description: 'Conduct refresher training for Jake Thornton on angle grinder safety including disc inspection and selection.',
    source_type: 'Incident', source_id: 'inc-001', source_reference: 'INC-2025-001',
    priority: 'High', assigned_to: 'emp-001', due_date: '2025-10-15',
    status: 'Completed', completed_date: '2025-10-02', completion_notes: 'Training completed. Jake reassessed and passed grinder VOC.',
    verified_by: 'Ron Thornton', verified_date: '2025-10-05', created_date: '2025-09-15', notes: '',
  },
  {
    id: 'ca-003', action_number: 'CA-2025-003',
    description: 'Update SOP-HW-002 (Angle Grinder) to include mandatory disc inspection before each use and disc expiry checking procedure.',
    source_type: 'Incident', source_id: 'inc-001', source_reference: 'INC-2025-001',
    priority: 'Medium', assigned_to: 'emp-001', due_date: '2025-11-01',
    status: 'In Progress', completed_date: '', completion_notes: '',
    verified_by: '', verified_date: '', created_date: '2025-09-15', notes: 'Draft revision in progress.',
  },
  {
    id: 'ca-004', action_number: 'CA-2025-004',
    description: 'Conduct toolbox talk on correct PPE wear for overhead welding positions, emphasising sleeve/glove interface.',
    source_type: 'Incident', source_id: 'inc-002', source_reference: 'INC-2025-002',
    priority: 'Medium', assigned_to: 'emp-001', due_date: '2025-11-05',
    status: 'Completed', completed_date: '2025-10-28', completion_notes: 'Toolbox talk TBT-2025-003 completed with all welding personnel.',
    verified_by: 'Ron Thornton', verified_date: '2025-10-30', created_date: '2025-10-22', notes: '',
  },
  {
    id: 'ca-005', action_number: 'CA-2025-005',
    description: 'Replace workshop emergency lighting batteries — 2 units found non-functional during inspection.',
    source_type: 'Inspection', source_id: 'insp-001', source_reference: 'Monthly Inspection Oct 2025',
    priority: 'High', assigned_to: 'emp-003', due_date: '2025-11-15',
    status: 'Open', completed_date: '', completion_notes: '',
    verified_by: '', verified_date: '', created_date: '2025-10-30', notes: 'Batteries on order from supplier.',
  },
];

// ── DOCUMENTS ──
export const demoDocuments: Document[] = [
  { id: 'doc-001', title: 'OH&S Policy', document_number: 'POL-OHS-001', version: '4.0', category: 'Policy', description: 'Thornton Engineering Occupational Health & Safety Policy Statement.', content: 'Thornton Engineering is committed to providing a safe and healthy workplace for all employees, contractors, and visitors. We comply with the Occupational Health and Safety Act 2004 (Vic) and associated regulations. Management is committed to continuous improvement in OHS performance through consultation, training, and hazard management.', file_url: '', file_name: 'OHS_Policy_v4.pdf', upload_date: '2025-01-15', review_date: '2026-01-15', status: 'Current', tags: ['policy', 'ohs', 'safety'], related_entity_id: '', related_entity_type: '', created_by: 'Ron Thornton', notes: '' },
  { id: 'doc-002', title: 'Drug & Alcohol Policy', document_number: 'POL-DA-001', version: '2.0', category: 'Policy', description: 'Company drug and alcohol policy including testing procedures.', content: 'Thornton Engineering maintains a zero-tolerance policy for drug and alcohol impairment in the workplace. All employees and contractors may be subject to random testing. Any person found to be impaired will be immediately removed from the workplace.', file_url: '', file_name: 'Drug_Alcohol_Policy_v2.pdf', upload_date: '2025-03-01', review_date: '2026-03-01', status: 'Current', tags: ['policy', 'drugs', 'alcohol'], related_entity_id: '', related_entity_type: '', created_by: 'Ron Thornton', notes: '' },
  { id: 'doc-003', title: 'Emergency Evacuation Plan', document_number: 'EMG-001', version: '3.0', category: 'Form', description: 'Workshop emergency evacuation plan and assembly point map.', content: 'Assembly Point: Front car park, adjacent to the main gate.\nFire Warden: Craig Morrison (Bay 1-2), Darren Kowalski (Bay 3-4)\nFirst Aider: Craig Morrison\nEvacuation Route: Follow green exit signs to nearest emergency exit.', file_url: '', file_name: 'Evacuation_Plan_v3.pdf', upload_date: '2025-02-01', review_date: '2026-02-01', status: 'Current', tags: ['emergency', 'evacuation', 'fire'], related_entity_id: '', related_entity_type: '', created_by: 'Ron Thornton', notes: '' },
  { id: 'doc-004', title: 'Risk Assessment — Pressure Vessel Fabrication', document_number: 'RA-PV-001', version: '2.1', category: 'Risk Assessment', description: 'Comprehensive risk assessment for pressure vessel fabrication activities.', content: '', file_url: '', file_name: 'RA_Pressure_Vessel_v2.1.pdf', upload_date: '2025-04-15', review_date: '2026-04-15', status: 'Current', tags: ['risk', 'pressure vessel', 'fabrication'], related_entity_id: 'ra-001', related_entity_type: 'risk_assessment', created_by: 'Ron Thornton', notes: '' },
  { id: 'doc-005', title: 'SWMS — Hot Work', document_number: 'SWMS-HW-001', version: '3.0', category: 'SWMS', description: 'Safe Work Method Statement for all hot work activities in the workshop.', content: '', file_url: '', file_name: 'SWMS_Hot_Work_v3.pdf', upload_date: '2025-05-01', review_date: '2026-05-01', status: 'Current', tags: ['swms', 'hot work', 'welding', 'cutting'], related_entity_id: 'swms-001', related_entity_type: 'swms', created_by: 'Craig Morrison', notes: '' },
  { id: 'doc-006', title: 'Argon Gas SDS', document_number: 'SDS-ARG-001', version: '1.0', category: 'SDS', description: 'Safety Data Sheet for Argon shielding gas.', content: 'Product: Argon (Ar)\nUN Number: 1006\nDangerous Goods Class: 2.2 (Non-flammable gas)\nHazards: Asphyxiant in confined spaces. Heavier than air — displaces oxygen.\nFirst Aid: Move to fresh air. If not breathing, give artificial respiration.\nStorage: Store cylinders upright, secured, away from heat sources.', file_url: '', file_name: 'SDS_Argon.pdf', upload_date: '2024-06-01', review_date: '2029-06-01', status: 'Current', tags: ['sds', 'gas', 'argon', 'welding'], related_entity_id: 'haz-001', related_entity_type: 'hazardous_substance', created_by: 'Lisa Chen', notes: '' },
];

// ── SWMS ──
export const demoSWMS: SWMS[] = [
  {
    id: 'swms-001', title: 'Hot Work Activities', document_number: 'SWMS-HW-001', version: '3.0',
    high_risk_activities: ['Welding', 'Oxy-cutting', 'Grinding', 'Plasma cutting'],
    associated_task_ids: ['task-001', 'task-002', 'task-004', 'task-005', 'task-009'],
    prepared_by: 'Craig Morrison', reviewed_by: 'Ron Thornton', approved_by: 'Ron Thornton',
    review_date: '2026-05-01', status: 'Current',
    content: `HIGH RISK WORK: Hot work activities including welding, thermal cutting, and grinding.\n\nSTEPS AND HAZARDS:\n1. Set up work area\n   - Hazard: Fire from sparks/spatter\n   - Control: Clear combustibles 10m radius, fire extinguisher within 5m, fire blanket available\n\n2. Pre-start equipment checks\n   - Hazard: Equipment malfunction\n   - Control: Complete pre-start checklist, tag out defective equipment\n\n3. Perform hot work\n   - Hazard: UV radiation, burns, fume inhalation\n   - Control: Welding screens, PPE as per SOP, forced ventilation or extraction\n\n4. Post-work inspection\n   - Hazard: Residual fire risk\n   - Control: Fire watch for 30 minutes after hot work ceases`,
    notes: '',
  },
  {
    id: 'swms-002', title: 'Confined Space Entry', document_number: 'SWMS-CS-001', version: '4.0',
    high_risk_activities: ['Confined space entry', 'Atmosphere testing', 'Rescue'],
    associated_task_ids: ['task-006'],
    prepared_by: 'Craig Morrison', reviewed_by: 'Ron Thornton', approved_by: 'Ron Thornton',
    review_date: '2026-03-10', status: 'Current',
    content: `HIGH RISK WORK: Entry into confined spaces per AS 2865-2009.\n\nSTEPS AND HAZARDS:\n1. Plan entry\n   - Hazard: Unidentified atmospheric hazards\n   - Control: Complete entry permit, risk assessment, rescue plan\n\n2. Prepare confined space\n   - Hazard: Hazardous atmosphere, energy sources\n   - Control: Isolate and LOTO all energy, ventilate 15+ mins, test atmosphere\n\n3. Enter confined space\n   - Hazard: Oxygen depletion, toxic gases\n   - Control: Continuous gas monitoring, standby person at entry, rescue equipment ready\n\n4. Emergency rescue\n   - Hazard: Entrant incapacitation\n   - Control: Trained rescue team, retrieval system in place, call 000`,
    notes: '',
  },
  {
    id: 'swms-003', title: 'Working at Heights', document_number: 'SWMS-HT-001', version: '2.5',
    high_risk_activities: ['Work above 2m', 'Scaffold access', 'EWP operation'],
    associated_task_ids: ['task-007'],
    prepared_by: 'Darren Kowalski', reviewed_by: 'Ron Thornton', approved_by: 'Ron Thornton',
    review_date: '2026-04-18', status: 'Current',
    content: `HIGH RISK WORK: Any work performed at a height of 2 metres or above.\n\nSTEPS AND HAZARDS:\n1. Plan the work\n   - Hazard: Falls from height\n   - Control: Apply hierarchy of controls, complete work at heights permit\n\n2. Set up access equipment\n   - Hazard: Equipment failure\n   - Control: Inspect scaffold tags, harness inspections, anchor point checks\n\n3. Perform work at height\n   - Hazard: Falls, dropped objects\n   - Control: 100% tie-off, tool lanyards, exclusion zone below\n\n4. Pack up\n   - Hazard: Falls during descent\n   - Control: Maintain 3 points of contact, secure tools before descent`,
    notes: '',
  },
];

// ── RISK ASSESSMENTS ──
export const demoRiskAssessments: RiskAssessment[] = [
  {
    id: 'ra-001', title: 'Pressure Vessel Fabrication', document_number: 'RA-PV-001',
    assessment_type: 'Risk Assessment', associated_task_ids: ['task-001', 'task-002', 'task-004', 'task-005', 'task-006'],
    location: 'Workshop Bay 1 & 2', assessed_by: 'Ron Thornton', assessment_date: '2025-04-15',
    review_date: '2026-04-15', status: 'Current',
    risk_rating_before: 'High', risk_rating_after: 'Medium',
    controls: 'Qualified welders only (AS 1796). WPS and PQR documentation. Pre-heat and interpass temperature monitoring. NDT inspection at hold points. Confined space permits for internal work. Hot work permits.',
    content: `ACTIVITY: Fabrication of pressure vessels to AS 1210 / AS 4458\n\nHAZARDS IDENTIFIED:\n- Welding fume exposure\n- UV radiation from arc\n- Burns from hot material\n- Confined space entry for internal welding\n- Heavy lifting of shell sections\n- Noise exposure > 85dB(A)\n\nEXISTING CONTROLS:\n- Welding fume extraction and forced ventilation\n- Welding screens and barriers\n- PPE (FR clothing, helmets, gloves)\n- Confined space entry permits and procedures\n- Overhead crane for lifting operations\n- Hearing protection zones marked\n\nRESIDUAL RISK: Medium — acceptable with controls in place`,
    notes: '',
  },
  {
    id: 'ra-002', title: 'Crane Lifting Operations — JSA', document_number: 'RA-CLO-001',
    assessment_type: 'JSA', associated_task_ids: ['task-003'],
    location: 'Workshop — All Bays', assessed_by: 'Darren Kowalski', assessment_date: '2025-04-01',
    review_date: '2026-04-01', status: 'Current',
    risk_rating_before: 'Critical', risk_rating_after: 'Medium',
    controls: 'Licensed operators only. Lift plans for non-routine lifts. Pre-start checks. Exclusion zones. Dogger for blind lifts. SWL verification. Tag lines for load control.',
    content: `JOB SAFETY ANALYSIS: Overhead Crane Lifting Operations\n\nSTEP 1: Pre-lift planning\n- Hazard: Overloading crane\n- Control: Verify load weight, check SWL, select correct slings\n\nSTEP 2: Rigging load\n- Hazard: Crush injury during rigging\n- Control: Hands clear of pinch points, use tag lines\n\nSTEP 3: Lifting and travel\n- Hazard: Dropped load, swing\n- Control: Test lift, exclusion zone, travel slowly, no personnel under load\n\nSTEP 4: Landing load\n- Hazard: Crush, tip-over\n- Control: Clear landing area, lower slowly, use chocks/blocks`,
    notes: '',
  },
];

// ── TOOLBOX TALKS ──
export const demoToolboxTalks: ToolboxTalk[] = [
  {
    id: 'tbt-001', title: 'Grinding Disc Safety & Inspection', date: '2025-09-22', time: '07:00',
    conducted_by: 'Craig Morrison', location: 'Workshop Smoko Room',
    attendee_ids: ['emp-001', 'emp-002', 'emp-003', 'emp-004', 'emp-006'],
    topics_covered: ['Disc inspection before use', 'Expiry date checking', 'Correct disc storage (FIFO)', 'Incident review: INC-2025-001'],
    actions_arising: 'All grinding discs to be inspected weekly. Old stock removed. FIFO labels added to storage.',
    notes: 'Conducted following grinding disc near-miss incident.',
  },
  {
    id: 'tbt-002', title: 'Summer Heat Safety', date: '2025-11-04', time: '07:00',
    conducted_by: 'Ron Thornton', location: 'Workshop Smoko Room',
    attendee_ids: ['emp-001', 'emp-002', 'emp-003', 'emp-004', 'emp-006', 'emp-007'],
    topics_covered: ['Heat stress symptoms and first aid', 'Hydration requirements', 'Mandatory rest breaks in shade', 'Buddy system for monitoring'],
    actions_arising: 'Additional water coolers ordered for Bays 3 and 4. Rest break schedule posted.',
    notes: 'Pre-summer preparation talk.',
  },
  {
    id: 'tbt-003', title: 'PPE Wear — Overhead Welding Positions', date: '2025-10-28', time: '07:00',
    conducted_by: 'Craig Morrison', location: 'Workshop Smoko Room',
    attendee_ids: ['emp-001', 'emp-002', 'emp-004'],
    topics_covered: ['Correct glove/sleeve interface for overhead welding', 'FR clothing requirements', 'Incident review: INC-2025-002', 'Spatter shields and additional protection'],
    actions_arising: 'Leather sleeve protectors ordered for overhead welding tasks.',
    notes: 'Conducted following welding burn incident.',
  },
];

// ── PLANT & EQUIPMENT ──
export const demoPlantEquipment: PlantEquipment[] = [
  { id: 'plant-001', name: 'MIG Welder #1', type: 'Welding Machine', make: 'Lincoln Electric', model: 'Power MIG 360MP', serial_number: 'LE-360-2021-001', asset_number: 'TE-WLD-001', location: 'Bay 1', status: 'Operational', registration_status: 'Not Required', registration_number: '', registration_expiry: '', purchase_date: '2021-03-15', last_maintenance_date: '2025-09-01', next_maintenance_date: '2026-03-01', maintenance_frequency_days: 180, associated_sop_ids: ['sop-001'], notes: 'Primary MIG for pressure vessel work.' },
  { id: 'plant-002', name: 'MIG Welder #2', type: 'Welding Machine', make: 'Lincoln Electric', model: 'Power MIG 360MP', serial_number: 'LE-360-2021-002', asset_number: 'TE-WLD-002', location: 'Bay 1', status: 'Operational', registration_status: 'Not Required', registration_number: '', registration_expiry: '', purchase_date: '2021-03-15', last_maintenance_date: '2025-09-01', next_maintenance_date: '2026-03-01', maintenance_frequency_days: 180, associated_sop_ids: ['sop-001'], notes: '' },
  { id: 'plant-003', name: 'MIG Welder #3', type: 'Welding Machine', make: 'Kemppi', model: 'FastMig X 450', serial_number: 'KP-450-2023-001', asset_number: 'TE-WLD-003', location: 'Bay 2', status: 'Operational', registration_status: 'Not Required', registration_number: '', registration_expiry: '', purchase_date: '2023-06-20', last_maintenance_date: '2025-10-15', next_maintenance_date: '2026-04-15', maintenance_frequency_days: 180, associated_sop_ids: ['sop-001'], notes: 'Newest MIG unit — pulse capability.' },
  { id: 'plant-004', name: 'TIG Welder #1', type: 'Welding Machine', make: 'Lincoln Electric', model: 'Invertec V310-T AC/DC', serial_number: 'LE-310-2020-001', asset_number: 'TE-WLD-004', location: 'Bay 1', status: 'Operational', registration_status: 'Not Required', registration_number: '', registration_expiry: '', purchase_date: '2020-08-10', last_maintenance_date: '2025-08-01', next_maintenance_date: '2026-02-01', maintenance_frequency_days: 180, associated_sop_ids: ['sop-002'], notes: 'AC/DC for aluminium and SS.' },
  { id: 'plant-005', name: 'TIG Welder #2', type: 'Welding Machine', make: 'Fronius', model: 'MagicWave 230i', serial_number: 'FR-230-2022-001', asset_number: 'TE-WLD-005', location: 'Bay 2', status: 'Operational', registration_status: 'Not Required', registration_number: '', registration_expiry: '', purchase_date: '2022-02-14', last_maintenance_date: '2025-08-01', next_maintenance_date: '2026-02-01', maintenance_frequency_days: 180, associated_sop_ids: ['sop-002'], notes: '' },
  { id: 'plant-006', name: '10T Overhead Crane', type: 'Crane', make: 'Demag', model: 'EKKE 10T', serial_number: 'DM-EKKE-2018-001', asset_number: 'TE-CRN-001', location: 'Workshop — Full span', status: 'Operational', registration_status: 'Registered', registration_number: 'CR-VIC-22845', registration_expiry: '2026-06-30', purchase_date: '2018-01-20', last_maintenance_date: '2025-06-30', next_maintenance_date: '2025-12-30', maintenance_frequency_days: 180, associated_sop_ids: ['sop-003'], notes: 'Annual inspection due Jun. Wire rope replaced 2024.' },
  { id: 'plant-007', name: 'Forklift — Toyota 2.5T', type: 'Forklift', make: 'Toyota', model: '8FG25', serial_number: 'TY-8FG-2020-001', asset_number: 'TE-FLT-001', location: 'Yard', status: 'Operational', registration_status: 'Registered', registration_number: 'FL-VIC-44210', registration_expiry: '2026-03-15', purchase_date: '2020-05-01', last_maintenance_date: '2025-11-01', next_maintenance_date: '2026-02-01', maintenance_frequency_days: 90, associated_sop_ids: ['sop-008'], notes: 'LPG powered. Service every 250 hours or 3 months.' },
  { id: 'plant-008', name: 'Plate Roller', type: 'Machine', make: 'Davi', model: 'MCA 3053', serial_number: 'DV-MCA-2019-001', asset_number: 'TE-MCH-001', location: 'Bay 3', status: 'Operational', registration_status: 'Not Required', registration_number: '', registration_expiry: '', purchase_date: '2019-11-10', last_maintenance_date: '2025-05-15', next_maintenance_date: '2025-11-15', maintenance_frequency_days: 180, associated_sop_ids: [], notes: '3m capacity, 53mm plate thickness max.' },
  { id: 'plant-009', name: 'CNC Plasma Cutter', type: 'Machine', make: 'Hypertherm', model: 'XPR300', serial_number: 'HT-XPR-2022-001', asset_number: 'TE-MCH-002', location: 'Bay 4', status: 'Operational', registration_status: 'Not Required', registration_number: '', registration_expiry: '', purchase_date: '2022-09-01', last_maintenance_date: '2025-09-01', next_maintenance_date: '2026-03-01', maintenance_frequency_days: 180, associated_sop_ids: [], notes: 'Cuts up to 80mm mild steel.' },
  { id: 'plant-010', name: 'Pedestal Drill Press', type: 'Machine', make: 'Hafco', model: 'PD-50', serial_number: 'HF-PD50-2017-001', asset_number: 'TE-MCH-003', location: 'Bay 2', status: 'Operational', registration_status: 'Not Required', registration_number: '', registration_expiry: '', purchase_date: '2017-04-20', last_maintenance_date: '2025-07-01', next_maintenance_date: '2026-01-01', maintenance_frequency_days: 180, associated_sop_ids: [], notes: '' },
  { id: 'plant-011', name: 'EWP — Scissor Lift', type: 'EWP', make: 'JLG', model: '2646ES', serial_number: 'JLG-2646-2021-001', asset_number: 'TE-EWP-001', location: 'Yard', status: 'Operational', registration_status: 'Registered', registration_number: 'EWP-VIC-11892', registration_expiry: '2026-08-01', purchase_date: '2021-08-15', last_maintenance_date: '2025-08-15', next_maintenance_date: '2026-02-15', maintenance_frequency_days: 180, associated_sop_ids: ['sop-007'], notes: '8m working height.' },
];

// ── HAZARDOUS SUBSTANCES ──
export const demoHazardousSubstances: HazardousSubstance[] = [
  { id: 'haz-001', product_name: 'Argon (Shielding Gas)', manufacturer: 'BOC Australia', un_number: '1006', dangerous_goods_class: '2.2', location_stored: 'Gas cylinder rack — Bay 1', sds_document_id: 'doc-006', sds_issue_date: '2024-06-01', sds_expiry_date: '2029-06-01', quantity_held: '6 x G-size cylinders', risk_phrases: ['Asphyxiant in confined spaces'], control_measures: 'Ventilation, confined space procedures, cylinder secured upright', first_aid_measures: 'Move to fresh air. If not breathing, give artificial respiration. Call 000.', notes: '' },
  { id: 'haz-002', product_name: 'Acetylene (Dissolved)', manufacturer: 'BOC Australia', un_number: '1001', dangerous_goods_class: '2.1', location_stored: 'Gas cylinder rack — Bay 2 (separated from O2)', sds_document_id: '', sds_issue_date: '2024-06-01', sds_expiry_date: '2029-06-01', quantity_held: '4 x G-size cylinders', risk_phrases: ['Extremely flammable', 'May decompose explosively'], control_measures: 'Store upright, away from oxygen, flashback arrestors, no smoking 10m radius', first_aid_measures: 'Remove from exposure. If burns, cool with water 20 minutes.', notes: 'Never lay acetylene cylinder on its side.' },
  { id: 'haz-003', product_name: 'Oxygen (Compressed)', manufacturer: 'BOC Australia', un_number: '1072', dangerous_goods_class: '2.2 (5.1)', location_stored: 'Gas cylinder rack — Bay 2 (separated from acetylene)', sds_document_id: '', sds_issue_date: '2024-06-01', sds_expiry_date: '2029-06-01', quantity_held: '4 x G-size cylinders', risk_phrases: ['Oxidiser — intensifies fire'], control_measures: 'No oil or grease on fittings, separate from flammable gases by 3m minimum', first_aid_measures: 'Move to fresh air. Keep clothing free from oil/grease near oxygen.', notes: '' },
  { id: 'haz-004', product_name: 'CRC Brakleen (Degreaser)', manufacturer: 'CRC Industries', un_number: '1950', dangerous_goods_class: '2.1', location_stored: 'Chemical cabinet — Workshop office', sds_document_id: '', sds_issue_date: '2024-03-01', sds_expiry_date: '2029-03-01', quantity_held: '12 x 600ml cans', risk_phrases: ['Flammable aerosol', 'May cause drowsiness'], control_measures: 'Use in ventilated area only, no ignition sources, wear nitrile gloves', first_aid_measures: 'Inhalation: Move to fresh air. Skin: Wash with soap and water.', notes: 'Used for pre-weld cleaning.' },
  { id: 'haz-005', product_name: 'Anti-Spatter Spray', manufacturer: 'Weld-Aid', un_number: '1950', dangerous_goods_class: '2.1', location_stored: 'Welding supply shelf — Bay 1', sds_document_id: '', sds_issue_date: '2024-01-01', sds_expiry_date: '2029-01-01', quantity_held: '24 x 400ml cans', risk_phrases: ['Flammable aerosol'], control_measures: 'Do not spray near open flame. Store below 50°C.', first_aid_measures: 'Eye contact: Flush with water 15 mins. Skin: Wash with soap and water.', notes: '' },
  { id: 'haz-006', product_name: 'Cutting Fluid (Soluble Oil)', manufacturer: 'Castrol Australia', un_number: '', dangerous_goods_class: 'Not DG', location_stored: 'Drum storage — Bay 3', sds_document_id: '', sds_issue_date: '2024-09-01', sds_expiry_date: '2029-09-01', quantity_held: '1 x 205L drum', risk_phrases: ['May cause skin irritation with prolonged contact'], control_measures: 'Wear nitrile gloves, avoid prolonged skin contact, wash hands before eating', first_aid_measures: 'Skin: Wash with soap and water. Eyes: Flush with water.', notes: 'Used on drill press and lathe operations.' },
];

// ── PPE RECORDS ──
export const demoPPERecords: PPERecord[] = [
  { id: 'ppe-001', employee_id: 'emp-001', ppe_type: 'Welding Helmet', brand: 'Speedglas', serial_number: 'SG-9100-2024-01', date_issued: '2024-03-01', expiry_date: '2029-03-01', condition: 'Good', notes: 'Speedglas 9100XXi auto-darkening.' },
  { id: 'ppe-002', employee_id: 'emp-001', ppe_type: 'Safety Boots', brand: 'Oliver', serial_number: '', date_issued: '2025-01-15', expiry_date: '2026-01-15', condition: 'Good', notes: 'Oliver AT 65-390 lace-up.' },
  { id: 'ppe-003', employee_id: 'emp-001', ppe_type: 'Safety Harness', brand: 'Protecta', serial_number: 'PR-HAR-2024-01', date_issued: '2024-06-01', expiry_date: '2029-06-01', condition: 'Good', notes: 'Inspected OK Oct 2025.' },
  { id: 'ppe-004', employee_id: 'emp-002', ppe_type: 'Welding Helmet', brand: 'Speedglas', serial_number: 'SG-9100-2023-02', date_issued: '2023-08-01', expiry_date: '2028-08-01', condition: 'Good', notes: '' },
  { id: 'ppe-005', employee_id: 'emp-002', ppe_type: 'Safety Boots', brand: 'Oliver', serial_number: '', date_issued: '2025-06-01', expiry_date: '2026-06-01', condition: 'Good', notes: '' },
  { id: 'ppe-006', employee_id: 'emp-003', ppe_type: 'Safety Harness', brand: 'Protecta', serial_number: 'PR-HAR-2023-03', date_issued: '2023-11-01', expiry_date: '2028-11-01', condition: 'Good', notes: '' },
  { id: 'ppe-007', employee_id: 'emp-003', ppe_type: 'Hard Hat', brand: 'Honeywell', serial_number: '', date_issued: '2025-04-01', expiry_date: '2028-04-01', condition: 'Good', notes: '' },
  { id: 'ppe-008', employee_id: 'emp-004', ppe_type: 'Welding Helmet', brand: 'Cigweld', serial_number: 'CW-WH-2024-04', date_issued: '2024-02-10', expiry_date: '2029-02-10', condition: 'Fair', notes: 'Minor scratches on lens cover. Replacement ordered.' },
  { id: 'ppe-009', employee_id: 'emp-004', ppe_type: 'Safety Boots', brand: 'Oliver', serial_number: '', date_issued: '2024-02-10', expiry_date: '2025-02-10', condition: 'Replace', notes: 'Sole separation. New pair on order.' },
  { id: 'ppe-010', employee_id: 'emp-006', ppe_type: 'Safety Boots', brand: 'Blundstone', serial_number: '', date_issued: '2025-03-01', expiry_date: '2026-03-01', condition: 'Good', notes: '' },
];

// ── FIRST AID ENTRIES ──
export const demoFirstAidEntries: FirstAidEntry[] = [
  {
    id: 'fa-001', date: '2025-10-22', time: '14:20',
    injured_person_id: 'emp-002', nature_of_injury: 'Minor burn — welding spatter',
    body_part: 'Left forearm', treatment_provided: 'Cooled under running water 20 mins. Non-adherent dressing applied. Paracetamol offered.',
    treated_by: 'emp-001', location: 'Bay 1 — Welding Station',
    follow_up_required: false, follow_up_notes: '',
    incident_report_id: 'inc-002',
  },
  {
    id: 'fa-002', date: '2025-08-12', time: '11:45',
    injured_person_id: 'emp-004', nature_of_injury: 'Metal splinter in finger',
    body_part: 'Right index finger', treatment_provided: 'Splinter removed with tweezers. Antiseptic applied. Band-aid dressing.',
    treated_by: 'emp-001', location: 'Bay 2 — Fitting area',
    follow_up_required: false, follow_up_notes: '',
    incident_report_id: '',
  },
];

// ── WORKPLACE INSPECTIONS ──
export const demoInspections: WorkplaceInspection[] = [
  {
    id: 'insp-001', title: 'Monthly Workshop Inspection — October 2025',
    inspection_type: 'Monthly Safety Inspection', scheduled_date: '2025-10-28', completed_date: '2025-10-30',
    inspector: 'Craig Morrison', location: 'Full Workshop', status: 'Completed',
    findings: [
      { id: 'find-001', description: 'Emergency lighting batteries flat in Bay 3 (2 units)', severity: 'High', corrective_action_id: 'ca-005' },
      { id: 'find-002', description: 'Fire extinguisher in office past 6-monthly service date', severity: 'Medium', corrective_action_id: '' },
      { id: 'find-003', description: 'Welding screens in Bay 2 have tears — UV light leaking', severity: 'Medium', corrective_action_id: '' },
    ],
    overall_rating: 'Needs Improvement',
    notes: '3 findings this month. Emergency lighting is the priority item.',
  },
  {
    id: 'insp-002', title: 'Monthly Workshop Inspection — November 2025',
    inspection_type: 'Monthly Safety Inspection', scheduled_date: '2025-11-28', completed_date: '',
    inspector: 'Craig Morrison', location: 'Full Workshop', status: 'Scheduled',
    findings: [],
    overall_rating: 'Satisfactory',
    notes: '',
  },
  {
    id: 'insp-003', title: 'Crane Annual Inspection 2025',
    inspection_type: 'Annual Plant Inspection', scheduled_date: '2025-12-15', completed_date: '',
    inspector: 'External — Crane Safety Vic', location: 'Workshop — Overhead Crane', status: 'Scheduled',
    findings: [],
    overall_rating: 'Satisfactory',
    notes: 'Booked with Crane Safety Victoria. Last inspection passed with no major findings.',
  },
];

// ── EMERGENCY INFO ──
export const demoEmergencyInfo: EmergencyInfo[] = [
  { id: 'emg-001', type: 'Warden', title: 'Chief Fire Warden', description: 'Responsible for coordinating evacuation from Bays 1-2 and main office. Trained in fire warden duties and evacuation procedures.', responsible_person_id: 'emp-001', location: 'Bay 1-2 & Office', contact_number: '0412 345 678', last_reviewed: '2025-06-01', review_due: '2026-06-01', notes: '' },
  { id: 'emg-002', type: 'Warden', title: 'Deputy Fire Warden', description: 'Responsible for coordinating evacuation from Bays 3-4 and yard area.', responsible_person_id: 'emp-003', location: 'Bay 3-4 & Yard', contact_number: '0434 567 890', last_reviewed: '2025-06-01', review_due: '2026-06-01', notes: '' },
  { id: 'emg-003', type: 'First Aider', title: 'Designated First Aider', description: 'Qualified first aider — holds current first aid certificate (HLTAID011). Responsible for providing first aid treatment in the workshop.', responsible_person_id: 'emp-001', location: 'Workshop', contact_number: '0412 345 678', last_reviewed: '2025-01-20', review_due: '2027-01-20', notes: 'First aid kit located in workshop office and Bay 2 pillar.' },
  { id: 'emg-004', type: 'Procedure', title: 'Assembly Point', description: 'Primary assembly point for all emergency evacuations: Front car park, adjacent to the main entrance gate. Secondary assembly point: Rear loading dock area (if front car park is affected).', responsible_person_id: '', location: 'Front Car Park / Rear Loading Dock', contact_number: '', last_reviewed: '2025-02-01', review_due: '2026-02-01', notes: 'Assembly point signs installed at both locations.' },
  { id: 'emg-005', type: 'Procedure', title: 'Emergency Contacts', description: 'Emergency Services: 000\nPoison Information: 13 11 26\nWorkSafe Victoria: 1800 136 089\nThornton Engineering (Ron Thornton): 0400 111 222\nNearest Hospital: Northern Hospital Epping — (03) 8405 8000', responsible_person_id: '', location: 'Posted at all exits and workshop office', contact_number: '000', last_reviewed: '2025-02-01', review_due: '2026-02-01', notes: '' },
];
