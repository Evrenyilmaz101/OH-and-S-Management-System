-- ============================================================================
-- OH&S Management System - Seed Data
-- Thornton Engineering — Pressure Vessel Fabrication, Victoria, Australia
-- ============================================================================

DO $$
DECLARE
  -- Role IDs
  role_manager uuid := gen_random_uuid();
  role_lead uuid := gen_random_uuid();
  role_boilermaker uuid := gen_random_uuid();
  role_inspector uuid := gen_random_uuid();
  role_apprentice uuid := gen_random_uuid();
  role_hand uuid := gen_random_uuid();
  role_contractor uuid := gen_random_uuid();

  -- Employee IDs
  emp_mark uuid := gen_random_uuid();
  emp_steve uuid := gen_random_uuid();
  emp_dave uuid := gen_random_uuid();
  emp_lisa uuid := gen_random_uuid();
  emp_tom uuid := gen_random_uuid();
  emp_james uuid := gen_random_uuid();

  -- Task IDs
  task_pv_weld uuid := gen_random_uuid();
  task_plate_roll uuid := gen_random_uuid();
  task_cnc_plasma uuid := gen_random_uuid();
  task_hydro uuid := gen_random_uuid();
  task_tig uuid := gen_random_uuid();
  task_crane uuid := gen_random_uuid();
  task_grind uuid := gen_random_uuid();
  task_qi uuid := gen_random_uuid();
  task_forklift uuid := gen_random_uuid();
  task_hotwork uuid := gen_random_uuid();

  -- SOP IDs
  sop_pv uuid := gen_random_uuid();
  sop_crane uuid := gen_random_uuid();
  sop_confined uuid := gen_random_uuid();
  sop_hotwork uuid := gen_random_uuid();
  sop_grind uuid := gen_random_uuid();
  sop_tig uuid := gen_random_uuid();
  sop_hydro uuid := gen_random_uuid();
  sop_house uuid := gen_random_uuid();

  -- Incident IDs
  inc_near uuid := gen_random_uuid();
  inc_burn uuid := gen_random_uuid();
  inc_forklift uuid := gen_random_uuid();

  -- Inspection IDs
  insp_jan uuid := gen_random_uuid();
  insp_feb uuid := gen_random_uuid();
  insp_dec uuid := gen_random_uuid();

  -- Plant IDs
  plant_press uuid := gen_random_uuid();
  plant_cnc uuid := gen_random_uuid();
  plant_roller uuid := gen_random_uuid();
  plant_crane10 uuid := gen_random_uuid();
  plant_jib uuid := gen_random_uuid();
  plant_mig1 uuid := gen_random_uuid();
  plant_mig2 uuid := gen_random_uuid();
  plant_mig3 uuid := gen_random_uuid();
  plant_tig1 uuid := gen_random_uuid();
  plant_tig2 uuid := gen_random_uuid();
  plant_forklift uuid := gen_random_uuid();
  plant_hydropump uuid := gen_random_uuid();
  plant_grinder uuid := gen_random_uuid();
  plant_oxy uuid := gen_random_uuid();
  plant_lathe uuid := gen_random_uuid();

  -- Induction template IDs
  ind_t1 uuid := gen_random_uuid();
  ind_t2 uuid := gen_random_uuid();
  ind_t3 uuid := gen_random_uuid();
  ind_t4 uuid := gen_random_uuid();
  ind_t5 uuid := gen_random_uuid();
  ind_t6 uuid := gen_random_uuid();
  ind_t7 uuid := gen_random_uuid();
  ind_t8 uuid := gen_random_uuid();
  ind_t9 uuid := gen_random_uuid();
  ind_t10 uuid := gen_random_uuid();
  ind_t11 uuid := gen_random_uuid();
  ind_t12 uuid := gen_random_uuid();
  ind_t13 uuid := gen_random_uuid();
  ind_t14 uuid := gen_random_uuid();
  ind_t15 uuid := gen_random_uuid();
  ind_t16 uuid := gen_random_uuid();
  ind_t17 uuid := gen_random_uuid();
  ind_t18 uuid := gen_random_uuid();
  ind_t19 uuid := gen_random_uuid();
  ind_t20 uuid := gen_random_uuid();

  -- SWMS IDs
  swms_pv uuid := gen_random_uuid();
  swms_crane uuid := gen_random_uuid();
  swms_confined uuid := gen_random_uuid();
  swms_hotwork uuid := gen_random_uuid();

  -- Risk Assessment IDs
  ra_pv uuid := gen_random_uuid();
  ra_crane uuid := gen_random_uuid();
  ra_grind uuid := gen_random_uuid();
  ra_confined uuid := gen_random_uuid();

  -- Corrective Action IDs
  ca1 uuid := gen_random_uuid();
  ca2 uuid := gen_random_uuid();
  ca3 uuid := gen_random_uuid();
  ca4 uuid := gen_random_uuid();

BEGIN

-- ============================================================================
-- ROLE DEFINITIONS
-- ============================================================================
INSERT INTO role_definitions (id, name, description, required_task_ids, required_cert_types, active) VALUES
(role_manager, 'Workshop Manager', 'Overall workshop operations, safety oversight, compliance', ARRAY[task_crane, task_forklift]::uuid[], ARRAY['First Aid', 'Return to Work Coordinator', 'Fire Warden'], true),
(role_lead, 'Lead Boilermaker', 'Senior fabricator, supervises welding & fitting, sign-off authority', ARRAY[task_pv_weld, task_plate_roll, task_tig, task_crane, task_grind, task_hotwork]::uuid[], ARRAY['AS/NZS 1554 Welding Supervisor', 'High Risk Work Licence', 'First Aid'], true),
(role_boilermaker, 'Boilermaker', 'Qualified tradesperson — welding, fitting, fabrication', ARRAY[task_pv_weld, task_plate_roll, task_tig, task_grind, task_hotwork]::uuid[], ARRAY['AS/NZS 1554 Welding', 'High Risk Work Licence'], true),
(role_inspector, 'Quality Inspector', 'NDT, dimensional checks, compliance documentation', ARRAY[task_qi, task_hydro]::uuid[], ARRAY['NDT Level II', 'First Aid'], true),
(role_apprentice, 'Apprentice Boilermaker', 'Apprentice learning trade under supervision', ARRAY[task_grind, task_hotwork]::uuid[], ARRAY['First Aid'], true),
(role_hand, 'Workshop Hand', 'General duties, material handling, housekeeping', ARRAY[task_forklift, task_grind]::uuid[], ARRAY['Forklift Licence', 'First Aid'], true),
(role_contractor, 'Contractor', 'External contractor — site-specific induction required', ARRAY[]::uuid[], ARRAY['Public Liability Insurance', 'Working with Children Check'], true);

-- ============================================================================
-- EMPLOYEES
-- ============================================================================
INSERT INTO employees (id, first_name, last_name, email, phone, role, role_id, employment_type, start_date, status, induction_status, emergency_contact_name, emergency_contact_phone, notes) VALUES
(emp_mark, 'Mark', 'Thompson', 'mark.thompson@thorntoneng.com.au', '0412 345 678', 'Workshop Manager', role_manager, 'Employee', '2018-03-15', 'Active', 'Completed', 'Sarah Thompson', '0413 456 789', 'OHS Committee Chair. Return to Work Coordinator.'),
(emp_steve, 'Steve', 'Wilson', 'steve.wilson@thorntoneng.com.au', '0423 456 789', 'Lead Boilermaker', role_lead, 'Employee', '2019-07-01', 'Active', 'Completed', 'Karen Wilson', '0424 567 890', 'AS/NZS 1554.1 Welding Supervisor. 15+ years experience in pressure vessel fabrication.'),
(emp_dave, 'Dave', 'Brown', 'dave.brown@thorntoneng.com.au', '0434 567 890', 'Boilermaker', role_boilermaker, 'Employee', '2020-11-09', 'Active', 'Completed', 'Michelle Brown', '0435 678 901', 'Qualified boilermaker. TIG and MIG certified.'),
(emp_lisa, 'Lisa', 'Chen', 'lisa.chen@thorntoneng.com.au', '0445 678 901', 'Quality Inspector', role_inspector, 'Employee', '2022-02-14', 'Active', 'Completed', 'David Chen', '0446 789 012', 'NDT Level II (UT, MT, PT). ISO 9001 internal auditor.'),
(emp_tom, 'Tom', 'Wright', 'tom.wright@thorntoneng.com.au', '0456 789 012', 'Apprentice Boilermaker', role_apprentice, 'Apprentice', '2025-12-02', 'Active', 'In Progress', 'Jenny Wright', '0457 890 123', '1st year apprentice. Enrolled at Kangan TAFE — Cert III Engineering (Fabrication Trade).'),
(emp_james, 'James', 'Murray', 'james.murray@thorntoneng.com.au', '0467 890 123', 'Workshop Hand', role_hand, 'Employee', '2023-06-19', 'Active', 'Completed', 'Pat Murray', '0468 901 234', 'Forklift licence. Responsible for material handling and workshop housekeeping.');

-- ============================================================================
-- TASKS
-- ============================================================================
INSERT INTO tasks (id, name, description, category, risk_level, required_ppe, active) VALUES
(task_pv_weld, 'Pressure Vessel Welding', 'MMAW/MIG/TIG welding of pressure vessels to AS/NZS 3992 & AS 1210', 'Welding', 'High', ARRAY['Welding Helmet (AS/NZS 1338.1)', 'Welding Gloves', 'FR Clothing', 'Safety Boots', 'Respiratory Protection'], true),
(task_plate_roll, 'Plate Rolling', 'Operating plate rolling machine for cylindrical shell forming', 'Fabrication', 'High', ARRAY['Safety Boots', 'Gloves', 'Safety Glasses', 'Hearing Protection'], true),
(task_cnc_plasma, 'CNC Plasma Cutting', 'Operating CNC plasma cutting table for plate profiling', 'Cutting', 'Medium', ARRAY['Safety Glasses (AS/NZS 1337)', 'Hearing Protection', 'Safety Boots', 'Gloves'], true),
(task_hydro, 'Hydrostatic Testing', 'Pressure testing vessels per AS/NZS 3788 using hydrostatic test pump', 'Testing', 'High', ARRAY['Safety Boots', 'Safety Glasses', 'Face Shield', 'Hearing Protection'], true),
(task_tig, 'TIG Welding (GTAW)', 'Gas Tungsten Arc Welding for precision joints, stainless & alloy steels', 'Welding', 'High', ARRAY['TIG Welding Helmet', 'TIG Gloves', 'FR Clothing', 'Safety Boots'], true),
(task_crane, 'Overhead Crane Operation', 'Operation of 10T overhead bridge crane for material handling', 'Lifting', 'Critical', ARRAY['Hard Hat', 'Safety Boots', 'Hi-Vis Vest', 'Gloves'], true),
(task_grind, 'Grinding & Finishing', 'Angle grinding, linishing and surface preparation of fabricated items', 'Fabrication', 'Medium', ARRAY['Face Shield', 'Safety Glasses', 'Hearing Protection', 'Gloves', 'Safety Boots'], true),
(task_qi, 'Quality Inspection', 'Visual, dimensional and NDT inspection of welds and fabricated items', 'Quality', 'Low', ARRAY['Safety Boots', 'Safety Glasses', 'Gloves'], true),
(task_forklift, 'Forklift Operation', 'Operating counterbalance forklift for material transport', 'Logistics', 'Medium', ARRAY['Safety Boots', 'Hi-Vis Vest', 'Seatbelt'], true),
(task_hotwork, 'Hot Work (Oxy Cutting)', 'Oxy-acetylene cutting and heating of steel plate and sections', 'Cutting', 'High', ARRAY['Welding Goggles', 'Welding Gloves', 'FR Clothing', 'Safety Boots'], true);

-- ============================================================================
-- VOC RECORDS
-- ============================================================================
INSERT INTO voc_records (employee_id, task_id, status, assessed_date, assessed_by, expiry_date, notes) VALUES
-- Mark Thompson
(emp_mark, task_crane, 'Competent', '2024-06-15', 'External Assessor', '2026-06-15', 'Overhead crane — HRW licence verified'),
(emp_mark, task_forklift, 'Competent', '2024-06-15', 'External Assessor', '2026-06-15', 'Forklift — HRW licence verified'),
-- Steve Wilson
(emp_steve, task_pv_weld, 'Competent', '2024-03-10', 'WTIA Examiner', '2026-03-10', 'AS/NZS 1554.1 SP — all positions'),
(emp_steve, task_plate_roll, 'Competent', '2024-03-10', 'Mark Thompson', '2026-03-10', 'Plate roller operation verified'),
(emp_steve, task_tig, 'Competent', '2024-03-10', 'WTIA Examiner', '2026-03-10', 'GTAW qualified — CS, SS, alloy'),
(emp_steve, task_crane, 'Competent', '2024-03-10', 'External Assessor', '2026-03-10', '10T overhead crane — HRW licence'),
(emp_steve, task_grind, 'Competent', '2024-03-10', 'Mark Thompson', '2026-03-10', NULL),
(emp_steve, task_hotwork, 'Competent', '2024-03-10', 'Mark Thompson', '2026-03-10', NULL),
-- Dave Brown
(emp_dave, task_pv_weld, 'Competent', '2024-08-20', 'Steve Wilson', '2026-08-20', 'MMAW & MIG — flat and horizontal positions'),
(emp_dave, task_plate_roll, 'Competent', '2024-08-20', 'Steve Wilson', '2026-08-20', NULL),
(emp_dave, task_tig, 'In Training', '2025-01-15', 'Steve Wilson', NULL, 'Currently upskilling on TIG — stainless steel'),
(emp_dave, task_grind, 'Competent', '2024-08-20', 'Steve Wilson', '2026-08-20', NULL),
(emp_dave, task_hotwork, 'Competent', '2024-08-20', 'Steve Wilson', '2026-08-20', NULL),
(emp_dave, task_crane, 'Competent', '2024-08-20', 'External Assessor', '2026-08-20', NULL),
-- Lisa Chen
(emp_lisa, task_qi, 'Competent', '2024-05-01', 'External Assessor', '2026-05-01', 'NDT Level II — UT, MT, PT'),
(emp_lisa, task_hydro, 'Competent', '2024-05-01', 'Mark Thompson', '2026-05-01', NULL),
-- Tom Wright
(emp_tom, task_grind, 'In Training', '2025-12-15', 'Steve Wilson', NULL, 'Under supervision only'),
(emp_tom, task_hotwork, 'Not Competent', NULL, NULL, NULL, 'Not yet assessed — requires further training'),
-- James Murray
(emp_james, task_forklift, 'Competent', '2024-09-01', 'External Assessor', '2026-09-01', 'Forklift licence verified'),
(emp_james, task_grind, 'Competent', '2024-09-01', 'Steve Wilson', '2026-09-01', NULL);

-- ============================================================================
-- CERTIFICATIONS
-- ============================================================================
INSERT INTO certifications (employee_id, cert_name, cert_number, issuing_body, issue_date, expiry_date) VALUES
-- Mark
(emp_mark, 'Senior First Aid', 'FA-2024-4421', 'St John Ambulance', '2024-04-10', '2027-04-10'),
(emp_mark, 'Return to Work Coordinator', 'RTW-VIC-1087', 'WorkSafe Victoria', '2023-09-15', '2026-09-15'),
(emp_mark, 'Fire Warden Training', 'FW-2024-312', 'CFA Victoria', '2024-02-20', '2026-02-20'),
(emp_mark, 'High Risk Work Licence — Crane', 'HRW-CN-88421', 'WorkSafe Victoria', '2022-06-15', '2027-06-15'),
-- Steve
(emp_steve, 'AS/NZS 1554.1 Welding Supervisor', 'WS-2024-0087', 'WTIA', '2024-03-01', '2027-03-01'),
(emp_steve, 'High Risk Work Licence — Crane', 'HRW-CN-92310', 'WorkSafe Victoria', '2023-03-10', '2028-03-10'),
(emp_steve, 'Senior First Aid', 'FA-2024-4578', 'St John Ambulance', '2024-06-15', '2027-06-15'),
(emp_steve, 'AS/NZS 3992 Welder Qualification', 'WQ-2023-1145', 'WTIA', '2023-11-20', '2026-11-20'),
-- Dave
(emp_dave, 'AS/NZS 1554.1 Welding', 'W-2024-2201', 'WTIA', '2024-08-15', '2027-08-15'),
(emp_dave, 'High Risk Work Licence — Crane', 'HRW-CN-95012', 'WorkSafe Victoria', '2024-01-20', '2029-01-20'),
(emp_dave, 'First Aid', 'FA-2023-8812', 'St John Ambulance', '2023-11-05', '2026-11-05'),
-- Lisa
(emp_lisa, 'NDT Level II (UT, MT, PT)', 'NDT-2024-0412', 'AINDT', '2024-05-01', '2027-05-01'),
(emp_lisa, 'First Aid', 'FA-2024-9021', 'St John Ambulance', '2024-07-10', '2027-07-10'),
(emp_lisa, 'ISO 9001 Internal Auditor', 'QA-2023-0089', 'SAI Global', '2023-09-20', '2026-09-20'),
-- Tom
(emp_tom, 'First Aid', 'FA-2025-1101', 'St John Ambulance', '2025-12-10', '2028-12-10'),
-- James
(emp_james, 'Forklift Licence (LF)', 'HRW-LF-10234', 'WorkSafe Victoria', '2023-06-19', '2028-06-19'),
(emp_james, 'First Aid', 'FA-2024-6677', 'St John Ambulance', '2024-03-15', '2027-03-15');

-- ============================================================================
-- INDUCTION TEMPLATES (20 items)
-- ============================================================================
INSERT INTO induction_templates (id, title, description, category, required_for, sort_order, active) VALUES
-- Site Orientation
(ind_t1, 'Workshop Tour & Layout', 'Complete guided tour of workshop, offices, amenities, and emergency exits', 'Site Orientation', 'All', 1, true),
(ind_t2, 'Sign-In/Sign-Out Procedures', 'Demonstrate use of sign-in board and visitor management', 'Site Orientation', 'All', 2, true),
(ind_t3, 'Parking & Site Access', 'Vehicle parking, pedestrian routes, delivery bay access', 'Site Orientation', 'All', 3, true),
(ind_t4, 'Introduction to Key Personnel', 'Meet Workshop Manager, First Aiders, Fire Wardens, OHS Rep', 'Site Orientation', 'All', 4, true),
-- Safety Systems
(ind_t5, 'OHS Policy & Responsibilities', 'Review OHS Policy, worker duties under OHS Act 2004 (Vic)', 'Safety Systems', 'All', 5, true),
(ind_t6, 'Hazard Reporting Procedures', 'How to identify and report hazards, near misses, and incidents', 'Safety Systems', 'All', 6, true),
(ind_t7, 'Permit to Work System', 'Hot work permits, confined space permits, isolation procedures', 'Safety Systems', 'All', 7, true),
(ind_t8, 'Risk Assessment & JSA Process', 'How to complete a JSA before starting non-routine tasks', 'Safety Systems', 'All', 8, true),
-- Emergency Procedures
(ind_t9, 'Emergency Evacuation Procedure', 'Alarm recognition, evacuation routes, assembly point location', 'Emergency Procedures', 'All', 9, true),
(ind_t10, 'First Aid Facilities', 'Location of first aid kits, first aiders, and injury reporting', 'Emergency Procedures', 'All', 10, true),
(ind_t11, 'Fire Extinguisher Locations & Types', 'Identify extinguisher locations and appropriate type for each fire class', 'Emergency Procedures', 'All', 11, true),
(ind_t12, 'Spill Response Procedures', 'Spill kit locations, clean-up procedures for oils and chemicals', 'Emergency Procedures', 'All', 12, true),
-- PPE & Equipment
(ind_t13, 'PPE Requirements & Issue', 'Mandatory PPE, how to request replacement, inspection standards', 'PPE & Equipment', 'All', 13, true),
(ind_t14, 'Hearing Protection Zones', 'Identify mandatory hearing protection zones and decibel levels', 'PPE & Equipment', 'All', 14, true),
(ind_t15, 'Respiratory Protection', 'When RPE is required, fit testing, filter types for welding fume', 'PPE & Equipment', 'Employee', 15, true),
(ind_t16, 'Overhead Crane Exclusion Zones', 'Crane operation zones, exclusion areas, signalling basics', 'PPE & Equipment', 'All', 16, true),
-- Role-Specific
(ind_t17, 'Welding Safety (Fume, Arc, Fire)', 'Welding fume extraction, arc flash protection, fire prevention', 'Role-Specific', 'Employee', 17, true),
(ind_t18, 'Grinding & Abrasive Wheels Safety', 'Angle grinder safety, guard requirements, disc inspection', 'Role-Specific', 'Employee', 18, true),
(ind_t19, 'MSDS/SDS Register Location', 'How to access Safety Data Sheets for workshop chemicals', 'Role-Specific', 'All', 19, true),
(ind_t20, 'Apprentice Supervision Requirements', 'Direct supervision rules, sign-off requirements, training log', 'Role-Specific', 'Apprentice', 20, true);

-- ============================================================================
-- INDUCTION RECORDS (Tom Wright — partially complete)
-- ============================================================================
INSERT INTO induction_records (employee_id, checklist_item_id, status, completed_date, completed_by, notes) VALUES
(emp_tom, ind_t1, 'Completed', '2025-12-02', 'Mark Thompson', 'Tour completed on first day'),
(emp_tom, ind_t2, 'Completed', '2025-12-02', 'Mark Thompson', NULL),
(emp_tom, ind_t3, 'Completed', '2025-12-02', 'Mark Thompson', NULL),
(emp_tom, ind_t4, 'Completed', '2025-12-02', 'Mark Thompson', 'Met all key personnel'),
(emp_tom, ind_t5, 'Completed', '2025-12-03', 'Mark Thompson', 'OHS policy signed'),
(emp_tom, ind_t6, 'Completed', '2025-12-03', 'Mark Thompson', NULL),
(emp_tom, ind_t7, 'Completed', '2025-12-04', 'Steve Wilson', NULL),
(emp_tom, ind_t8, 'Completed', '2025-12-04', 'Steve Wilson', NULL),
(emp_tom, ind_t9, 'Completed', '2025-12-03', 'Mark Thompson', 'Participated in practice evacuation'),
(emp_tom, ind_t10, 'Completed', '2025-12-03', 'Mark Thompson', NULL),
(emp_tom, ind_t11, 'Completed', '2025-12-03', 'Mark Thompson', NULL),
(emp_tom, ind_t12, 'Pending', NULL, NULL, NULL),
(emp_tom, ind_t13, 'Completed', '2025-12-02', 'Mark Thompson', 'PPE issued — see PPE register'),
(emp_tom, ind_t14, 'Completed', '2025-12-04', 'Steve Wilson', NULL),
(emp_tom, ind_t15, 'Pending', NULL, NULL, 'Fit test scheduled for next week'),
(emp_tom, ind_t16, 'Completed', '2025-12-05', 'Steve Wilson', NULL),
(emp_tom, ind_t17, 'Pending', NULL, NULL, NULL),
(emp_tom, ind_t18, 'Pending', NULL, NULL, NULL),
(emp_tom, ind_t19, 'Completed', '2025-12-04', 'Lisa Chen', NULL),
(emp_tom, ind_t20, 'Completed', '2025-12-02', 'Mark Thompson', 'Supervision requirements explained — direct supervision at all times');

-- ============================================================================
-- ONBOARDING RECORDS
-- ============================================================================
INSERT INTO onboarding_records (employee_id, status, start_date, completed_date, tfn_declaration_submitted, super_choice_submitted, bank_details_submitted, emergency_contact_provided, notes) VALUES
(emp_tom, 'In Progress', '2025-12-02', NULL, 'Submitted', 'Submitted', 'Submitted', 'Submitted', 'Induction ongoing — 15/20 items completed. Awaiting RPE fit test and welding safety induction.');

-- ============================================================================
-- SOPs (8 with inline content)
-- ============================================================================
INSERT INTO sops (id, title, document_number, version, category, description, content, associated_equipment, associated_task_ids, review_date, last_reviewed_by, status) VALUES
(sop_pv, 'Pressure Vessel Welding Procedure', 'SOP-WLD-001', '3.2', 'Welding', 'Safe welding procedure for pressure vessels per AS/NZS 3992 and AS 1210',
'1. PRE-WELD CHECKS
- Confirm WPS (Welding Procedure Specification) is available and current
- Verify welder qualifications match the WPS requirements
- Check welding equipment is in good working order — earth leads, gas flow, wire feed
- Ensure fume extraction is operational and positioned correctly
- Confirm fire watch arrangements are in place

2. MATERIAL PREPARATION
- Verify material grade matches drawing specifications
- Check plate edges are clean, free from rust, oil, and mill scale
- Confirm joint preparation geometry matches WPS (bevel angle, root gap, land)
- Fit and tack weld per drawing — check alignment and fit-up tolerances

3. WELDING OPERATIONS
- Set parameters per WPS — voltage, amperage, wire speed, gas flow
- Maintain interpass temperature within specified range (use temperature crayon/pyrometer)
- Complete root, fill, and cap passes as specified
- De-slag between passes, visually inspect each pass

4. POST-WELD
- Allow controlled cooling — do not quench
- Mark welder ID adjacent to completed weld
- Complete weld log entry
- Notify Quality Inspector for NDE',
ARRAY['MIG Welders', 'TIG Welders'], ARRAY[task_pv_weld, task_tig]::uuid[], '2026-03-01', 'Steve Wilson', 'Current'),

(sop_crane, 'Overhead Crane Operation', 'SOP-LFT-001', '2.1', 'Lifting', 'Safe operation of 10T overhead bridge crane',
'1. PRE-OPERATIONAL CHECKS
- Visual inspection of wire rope for broken strands, kinks, or corrosion
- Check hook, safety latch, and hook block for damage
- Test all crane motions (hoist, traverse, travel) at low speed with no load
- Check pendant/remote control buttons function correctly
- Confirm emergency stop works
- Report any defects to Workshop Manager — do not operate if defective

2. PLANNING THE LIFT
- Determine load weight — check against crane SWL (10,000 kg)
- Select appropriate sling/chain configuration
- Calculate sling angles — do not exceed 60° from vertical
- Identify lift path — clear of personnel and obstructions
- Establish exclusion zone under the load path

3. LIFTING OPERATIONS
- Attach slings/chains to designated lift points only
- Take up slack slowly — pause when slings are taut
- Lift load just clear of supports — check balance
- Keep load as low as practicable during travel
- Never leave a suspended load unattended
- Use tag lines for load control where necessary
- Lower load slowly onto stable supports

4. POST-USE
- Return crane to designated park position
- Lower hook to safe height
- Switch off pendant/remote
- Report any issues in crane log book',
ARRAY['10T Overhead Crane', '5T Jib Crane'], ARRAY[task_crane]::uuid[], '2026-06-01', 'Mark Thompson', 'Current'),

(sop_confined, 'Confined Space Entry', 'SOP-SAF-001', '2.0', 'Safety', 'Confined space entry procedure for pressure vessel internals and tanks',
'1. PERMIT REQUIREMENTS
- Confined Space Entry Permit must be completed and authorised BEFORE entry
- Permit valid for one shift only — renew for extended work
- Atmospheric testing required: O2 (19.5–23.5%), LEL (<5%), CO (<25ppm), H2S (<10ppm)
- Continuous monitoring during entry

2. ROLES
- Entry Supervisor: authorises permit, oversees entry
- Entrant: trained worker entering the space
- Standby Person: remains at entry point AT ALL TIMES, maintains communication
- Rescue Team: identified and available (do not enter to rescue without proper equipment)

3. PREPARATION
- Isolate all energy sources — lockout/tagout per isolation procedure
- Purge/ventilate the space — mechanical ventilation must run continuously
- Remove or secure all loose items near opening
- Position rescue equipment at entry point (harness, tripod, retrieval line)

4. ENTRY & WORK
- Entrant wears full body harness attached to retrieval system
- Maintain communication with Standby Person at all times
- If alarm sounds or symptoms occur — evacuate immediately
- No hot work inside confined space without additional Hot Work Permit

5. EXIT & CLOSE-OUT
- Remove all tools and equipment
- Close permit — sign off completion
- Report any concerns to Entry Supervisor',
ARRAY[]::text[], ARRAY[]::uuid[], '2026-04-01', 'Mark Thompson', 'Current'),

(sop_hotwork, 'Hot Work Permit Procedure', 'SOP-SAF-002', '1.4', 'Safety', 'Hot work permit and fire prevention for oxy cutting, welding, grinding',
'1. SCOPE
- Applies to all oxy cutting, welding, grinding, and any spark-producing activity outside designated welding bays
- Hot Work Permit required before commencing

2. PERMIT PROCESS
- Complete Hot Work Permit form
- Identify fire hazards within 10m radius
- Remove or protect combustible materials (fire blankets, shields)
- Ensure fire extinguisher is within 5m of work area
- Obtain authorisation from Workshop Manager or Lead Boilermaker

3. FIRE WATCH
- Fire Watch person must remain for duration of hot work AND 30 minutes after completion
- Fire Watch must have clear line of sight to work area
- Fire extinguisher must be immediately accessible

4. COMPLETION
- Inspect work area for smouldering materials
- Fire Watch conducts final 30-minute inspection
- Sign off and close permit',
ARRAY[]::text[], ARRAY[task_hotwork]::uuid[], '2026-05-01', 'Steve Wilson', 'Current'),

(sop_grind, 'Grinding & Abrasive Wheels Safety', 'SOP-FAB-001', '2.0', 'Fabrication', 'Safe use of angle grinders, pedestal grinders, and abrasive cutting',
'1. PRE-USE INSPECTION
- Check disc/wheel for cracks, chips, or excessive wear
- Verify disc rating matches grinder RPM — never exceed maximum RPM
- Confirm guard is fitted and correctly adjusted
- Check power cord and plug for damage
- Ensure handle is fitted and tight

2. PPE REQUIREMENTS
- Full face shield (AS/NZS 1337.1)
- Safety glasses underneath face shield
- Hearing protection
- Leather gloves
- Safety boots
- No loose clothing, jewellery, or gloves that could entangle

3. SAFE OPERATION
- Secure workpiece in vice or clamp — never hand-hold small pieces
- Never use side of a cutting disc for grinding
- Maintain firm two-handed grip at all times
- Grind away from body and other personnel
- Allow new discs to run at full speed for 1 minute before use

4. STORAGE
- Store discs flat in dry location
- Dispose of worn discs in metal bin
- Hang grinder on hook — do not leave on floor',
ARRAY['Pedestal Grinder'], ARRAY[task_grind]::uuid[], '2026-07-01', 'Steve Wilson', 'Current'),

(sop_tig, 'TIG Welding (GTAW) Procedure', 'SOP-WLD-002', '1.3', 'Welding', 'TIG welding procedure for stainless steel and alloy components',
'1. EQUIPMENT SETUP
- Select correct tungsten type and diameter for material
- Set gas flow rate (Argon) per WPS — typically 8-12 L/min
- Set amperage range per WPS for material thickness
- Ensure back-purge is connected for stainless steel (Argon, 5-8 L/min)
- Clean all joint surfaces — acetone wipe, stainless steel brush

2. WELDING
- Maintain consistent arc length (1-2x tungsten diameter)
- Feed filler rod into leading edge of weld pool
- Maintain correct torch angle (15-20° from vertical)
- Ensure adequate shielding gas coverage — no discolouration on stainless
- Control heat input — use pulse if available

3. POST-WELD
- Allow gas post-flow (5-10 seconds) to protect weld pool
- Inspect for sugaring (oxidation) on back of stainless welds
- Passivate stainless steel welds if required
- Clean weld with stainless brush — no carbon steel contamination
- Log welder ID and weld number',
ARRAY['TIG Welder 1', 'TIG Welder 2'], ARRAY[task_tig]::uuid[], '2026-03-01', 'Steve Wilson', 'Current'),

(sop_hydro, 'Hydrostatic Testing Procedure', 'SOP-QA-001', '2.1', 'Quality', 'Hydrostatic pressure testing of vessels per AS/NZS 3788',
'1. PRE-TEST PREPARATION
- Confirm vessel fabrication is complete and all welds have passed NDE
- Verify test pressure per design: typically 1.5x MAWP
- Fill vessel completely with clean water — ensure all air is vented
- Install calibrated pressure gauge(s) — certificate current within 12 months
- Establish exclusion zone — minimum 5m radius barricaded

2. PRESSURISATION
- Connect hydrostatic test pump
- Increase pressure slowly in increments of 10% of test pressure
- Hold at each increment for minimum 2 minutes — check for leaks
- Reach test pressure and hold for minimum 30 minutes (or as per spec)

3. INSPECTION AT TEST PRESSURE
- Visually inspect all welds, flanges, and fittings for leaks
- Check for visible deformation or bulging
- Record pressure gauge readings at start and end of hold period

4. DEPRESSURISATION & SIGN-OFF
- Reduce pressure slowly — do not vent rapidly
- Drain vessel completely
- Complete test certificate — sign off by Quality Inspector
- File test certificate with job documentation',
ARRAY['Hydrostatic Test Pump'], ARRAY[task_hydro]::uuid[], '2026-06-01', 'Lisa Chen', 'Current'),

(sop_house, 'Workshop Housekeeping Standards', 'SOP-GEN-001', '1.2', 'General', 'Daily housekeeping requirements for workshop areas',
'1. DAILY REQUIREMENTS
- Each worker is responsible for their immediate work area
- Clear walkways and emergency exits at all times
- Return tools to designated storage after use
- Sweep work area at end of each shift
- Empty scrap bins when 75% full
- Wipe down equipment after use

2. WEEKLY TASKS
- Deep clean welding bays (Monday AM)
- Inspect and restock first aid kits (Monday AM)
- Clean amenities area including kitchen and toilet
- Check fire extinguisher access is clear
- Inspect spill kit supplies

3. MATERIAL STORAGE
- Stack materials on designated racks
- Label all stored materials with job number
- Keep flammable materials in bunded flammable stores cabinet
- Maximum stacking height: 2m unless on approved racking
- Keep 1m clear around all electrical switchboards

4. NON-COMPLIANCE
- Housekeeping deficiencies reported on hazard report form
- Repeat non-compliance addressed through toolbox talks
- Serious housekeeping breaches may result in formal warning',
ARRAY[]::text[], ARRAY[]::uuid[], '2026-01-01', 'Mark Thompson', 'Current');

-- ============================================================================
-- SOP ACKNOWLEDGMENTS
-- ============================================================================
INSERT INTO sop_acknowledgments (sop_id, employee_id, acknowledged_date, acknowledged) VALUES
(sop_pv, emp_steve, '2024-04-01', true),
(sop_pv, emp_dave, '2024-09-01', true),
(sop_crane, emp_mark, '2024-07-01', true),
(sop_crane, emp_steve, '2024-07-01', true),
(sop_crane, emp_dave, '2024-09-01', true),
(sop_grind, emp_steve, '2024-04-01', true),
(sop_grind, emp_dave, '2024-09-01', true),
(sop_grind, emp_james, '2024-10-01', true),
(sop_hotwork, emp_steve, '2024-04-01', true),
(sop_hotwork, emp_dave, '2024-09-01', true),
(sop_house, emp_mark, '2024-02-01', true),
(sop_house, emp_steve, '2024-02-01', true),
(sop_house, emp_dave, '2024-02-01', true),
(sop_house, emp_lisa, '2024-02-01', true),
(sop_house, emp_james, '2024-07-01', true),
(sop_hydro, emp_lisa, '2024-06-01', true),
(sop_tig, emp_steve, '2024-04-01', true),
(sop_confined, emp_mark, '2024-05-01', true),
(sop_confined, emp_steve, '2024-05-01', true);

-- ============================================================================
-- INCIDENTS
-- ============================================================================
INSERT INTO incidents (id, incident_number, date, time, location, type, severity, description, immediate_actions, root_cause, contributing_factors, status, reported_by, reported_date, investigated_by, investigation_date, closed_date, involved_person_ids, witness_ids, notes) VALUES
(inc_near, 'INC-2025-001', '2025-11-18', '10:30', 'Bay 2 — Grinding Area', 'Near Miss', 'Minor',
'Grinding disc fragment ejected when disc shattered during use on a weld prep. Fragment struck welding screen approximately 2m away. No personnel in the strike zone at the time.',
'Work stopped immediately. Area cleared and inspected. Remaining grinding discs from same batch inspected — 2 additional discs found with hairline cracks and disposed of.',
'Defective grinding disc — hairline crack not detected during pre-use inspection. Disc may have been damaged during storage (found stored leaning against wall instead of flat).',
'Inadequate disc storage. Pre-use inspection procedure not sufficiently detailed for crack detection.',
'Closed', 'Dave Brown', '2025-11-18', 'Mark Thompson', '2025-11-19', '2025-12-01',
ARRAY[emp_dave]::uuid[], ARRAY[emp_steve]::uuid[], NULL),

(inc_burn, 'INC-2025-002', '2025-12-10', '14:15', 'Bay 1 — Welding Bay', 'First Aid', 'Minor',
'Minor burn to left forearm when hot slag fell between glove and sleeve cuff during overhead MIG welding. Small blister approximately 15mm diameter on inner forearm.',
'First aid applied — cold running water for 20 minutes, burn dressing applied by Steve Wilson (First Aider). Worker returned to modified duties (no overhead welding) for remainder of shift.',
'Gap between welding glove gauntlet and sleeve allowed hot slag entry. FR sleeve was not tucked into glove as per SOP.',
'Worker rushing to complete task before afternoon break. PPE fit check not performed before starting overhead welding.',
'Closed', 'Steve Wilson', '2025-12-10', 'Mark Thompson', '2025-12-11', '2025-12-20',
ARRAY[emp_dave]::uuid[], ARRAY[emp_steve]::uuid[], 'First aid entry linked. Toolbox talk conducted on PPE fit for overhead welding.'),

(inc_forklift, 'INC-2026-001', '2026-02-14', '08:45', 'Material Storage Area', 'Property Damage', 'Moderate',
'Forklift contacted racking upright while positioning steel plate delivery. Racking upright dented and base plate anchor bolt bent. No structural collapse. No personnel in vicinity.',
'Area barricaded. Racking taken out of service pending structural assessment. Material relocated to floor storage temporarily.',
NULL, NULL,
'Under Investigation', 'James Murray', '2026-02-14', 'Mark Thompson', '2026-02-15', NULL,
ARRAY[emp_james]::uuid[], ARRAY[]::uuid[], 'Structural engineer inspection requested. Awaiting report.');

-- ============================================================================
-- CORRECTIVE ACTIONS
-- ============================================================================
INSERT INTO corrective_actions (id, action_number, description, source_type, source_id, source_reference, priority, assigned_to, due_date, status, completed_date, completion_notes, created_date, notes) VALUES
(ca1, 'CA-2025-001', 'Implement grinding disc storage procedure — all discs stored flat in original packaging. Add to daily housekeeping checklist.', 'Incident', inc_near, 'INC-2025-001', 'High', 'Steve Wilson', '2025-12-15', 'Completed', '2025-12-10', 'New disc storage rack installed in grinding bay. Added to housekeeping SOP.', '2025-11-19', NULL),
(ca2, 'CA-2025-002', 'Update grinding SOP to include tap-test for crack detection during pre-use inspection.', 'Incident', inc_near, 'INC-2025-001', 'Medium', 'Mark Thompson', '2025-12-31', 'Completed', '2025-12-20', 'SOP-FAB-001 updated to v2.1 with tap-test requirement. Toolbox talk conducted.', '2025-11-19', NULL),
(ca3, 'CA-2025-003', 'Conduct toolbox talk on PPE fit for overhead welding. Demonstrate correct glove/sleeve overlap technique.', 'Incident', inc_burn, 'INC-2025-002', 'High', 'Steve Wilson', '2025-12-20', 'Completed', '2025-12-18', 'Toolbox talk completed 18/12/2025 — all welders attended.', '2025-12-11', NULL),
(ca4, 'CA-2026-001', 'Review forklift operating procedures for material storage area. Consider installing physical barriers to protect racking uprights.', 'Incident', inc_forklift, 'INC-2026-001', 'High', 'Mark Thompson', '2026-03-14', 'Open', NULL, NULL, '2026-02-15', 'Awaiting racking structural assessment before finalising controls.');

-- ============================================================================
-- DOCUMENTS
-- ============================================================================
INSERT INTO documents (title, document_number, version, description, category, upload_date, review_date, status, tags, notes) VALUES
('OHS Policy', 'POL-OHS-001', '4.0', 'Thornton Engineering OHS Policy — commitment to health and safety per OHS Act 2004 (Vic)', 'Policy', '2024-01-15', '2026-01-15', 'Current', ARRAY['policy', 'ohs', 'worksafe'], 'Signed by Managing Director. Displayed in workshop and office.'),
('Drug & Alcohol Policy', 'POL-DA-001', '2.0', 'Zero tolerance drug and alcohol policy for all workers and contractors', 'Policy', '2024-01-15', '2026-01-15', 'Current', ARRAY['policy', 'drugs', 'alcohol'], NULL),
('Return to Work Policy', 'POL-RTW-001', '1.2', 'Return to work program per WorkSafe Victoria guidelines', 'Policy', '2023-09-15', '2025-09-15', 'Under Review', ARRAY['policy', 'rtw', 'worksafe'], 'Review overdue — Mark Thompson to update'),
('Hazard Report Form', 'FRM-HAZ-001', '1.0', 'Blank hazard report form for workplace hazard identification', 'Form', '2024-03-01', '2026-03-01', 'Current', ARRAY['form', 'hazard', 'reporting'], NULL),
('Incident Report Form', 'FRM-INC-001', '2.0', 'Incident/near miss report form', 'Form', '2024-03-01', '2026-03-01', 'Current', ARRAY['form', 'incident', 'reporting'], NULL),
('Hot Work Permit Form', 'FRM-HW-001', '1.5', 'Hot work permit form for non-routine welding, cutting, grinding', 'Form', '2024-06-01', '2026-06-01', 'Current', ARRAY['form', 'hot work', 'permit'], NULL),
('Confined Space Entry Permit', 'FRM-CS-001', '1.1', 'Confined space entry permit and checklist', 'Form', '2024-06-01', '2026-06-01', 'Current', ARRAY['form', 'confined space', 'permit'], NULL),
('AS 1210 — Pressure Vessels (Referenced)', 'STD-AS1210', '2010', 'Australian Standard for pressure vessel design and fabrication — reference copy', 'Certificate', '2023-01-01', '2028-01-01', 'Current', ARRAY['standard', 'pressure vessel', 'AS1210'], 'Reference standard — full copy in quality office'),
('Workshop Public Liability Insurance', 'CERT-PLI-001', '2025', 'Public liability insurance certificate — $20M cover', 'Certificate', '2025-01-01', '2026-01-01', 'Current', ARRAY['insurance', 'certificate'], NULL),
('WorkSafe Victoria Registration', 'CERT-WS-001', '2025', 'WorkSafe Victoria employer registration certificate', 'Licence', '2025-01-01', '2026-01-01', 'Current', ARRAY['worksafe', 'registration', 'licence'], NULL),
('Argon Gas SDS', 'SDS-ARG-001', '7.0', 'Safety Data Sheet — Argon (compressed gas, Class 2.2)', 'SDS', '2024-06-01', '2029-06-01', 'Current', ARRAY['sds', 'argon', 'gas'], NULL),
('Acetylene Gas SDS', 'SDS-ACE-001', '5.1', 'Safety Data Sheet — Acetylene (dissolved, Class 2.1)', 'SDS', '2024-06-01', '2029-06-01', 'Current', ARRAY['sds', 'acetylene', 'gas'], NULL);

-- ============================================================================
-- SWMS
-- ============================================================================
INSERT INTO swms (id, title, document_number, version, high_risk_activities, associated_task_ids, prepared_by, reviewed_by, approved_by, review_date, status, notes) VALUES
(swms_pv, 'SWMS — Pressure Vessel Welding', 'SWMS-001', '2.0', ARRAY['Work involving hot or molten metal', 'Work near pressurised gas lines'], ARRAY[task_pv_weld, task_tig]::uuid[], 'Steve Wilson', 'Lisa Chen', 'Mark Thompson', '2026-06-01', 'Current', 'Covers all pressure vessel welding activities in Bays 1-3'),
(swms_crane, 'SWMS — Overhead Crane Lifts', 'SWMS-002', '1.5', ARRAY['Work near powered mobile plant', 'Risk of falling objects'], ARRAY[task_crane]::uuid[], 'Mark Thompson', 'Steve Wilson', 'Mark Thompson', '2026-06-01', 'Current', '10T overhead crane and 5T jib crane operations'),
(swms_confined, 'SWMS — Confined Space Entry (Vessel Internals)', 'SWMS-003', '1.2', ARRAY['Confined space entry', 'Work in atmosphere with risk of engulfment'], ARRAY[]::uuid[], 'Mark Thompson', 'Steve Wilson', 'Mark Thompson', '2026-04-01', 'Current', 'Entry into pressure vessels, tanks, and drums for inspection and fabrication'),
(swms_hotwork, 'SWMS — Hot Work Outside Designated Areas', 'SWMS-004', '1.0', ARRAY['Work involving hot or molten metal', 'Work near flammable materials'], ARRAY[task_hotwork]::uuid[], 'Steve Wilson', 'Mark Thompson', 'Mark Thompson', '2026-05-01', 'Current', 'Oxy cutting, welding, and grinding performed outside standard welding bays');

-- ============================================================================
-- RISK ASSESSMENTS
-- ============================================================================
INSERT INTO risk_assessments (id, title, document_number, assessment_type, location, assessed_by, associated_task_ids, assessment_date, review_date, risk_rating_before, controls, risk_rating_after, status, notes) VALUES
(ra_pv, 'JSA — Pressure Vessel Welding', 'RA-001', 'JSA', 'Welding Bays 1-3', 'Steve Wilson', ARRAY[task_pv_weld]::uuid[], '2024-08-01', '2026-08-01', 'High',
'Fume extraction system, RPE (P2 minimum), FR clothing, welding screens, fire extinguishers, hot work permit for non-routine locations, pre-weld safety check',
'Medium', 'Current', 'Reviewed annually. Last update added requirement for continuous fume extraction monitoring.'),
(ra_crane, 'JSA — Overhead Crane Operation', 'RA-002', 'JSA', 'Workshop — Full Span', 'Mark Thompson', ARRAY[task_crane]::uuid[], '2024-06-01', '2026-06-01', 'Critical',
'HRW licence required, pre-operational checks, exclusion zones, SWL verification, sling inspection, tag lines for load control, emergency stop testing',
'Medium', 'Current', NULL),
(ra_grind, 'Risk Assessment — Grinding Operations', 'RA-003', 'Risk Assessment', 'All workshop areas', 'Steve Wilson', ARRAY[task_grind]::uuid[], '2024-09-01', '2026-09-01', 'Medium',
'Full face shield, hearing protection, guard fitted, disc RPM check, secure workpiece, no loose clothing',
'Low', 'Current', NULL),
(ra_confined, 'JSA — Confined Space Entry', 'RA-004', 'JSA', 'Vessel internals, tanks', 'Mark Thompson', ARRAY[]::uuid[], '2024-05-01', '2026-05-01', 'Critical',
'Permit system, atmospheric monitoring (continuous), mechanical ventilation, standby person, rescue equipment, harness with retrieval line, communication system',
'High', 'Current', 'Inherently high risk even with controls. Requires strict permit compliance.');

-- ============================================================================
-- PLANT & EQUIPMENT
-- ============================================================================
INSERT INTO plant_equipment (id, name, type, make, model, serial_number, asset_number, location, status, registration_status, registration_number, registration_expiry, purchase_date, last_maintenance_date, next_maintenance_date, maintenance_frequency_days, associated_sop_ids, notes) VALUES
(plant_press, '300T Hydraulic Press', 'Press', 'Bramley', 'BP300', 'BP300-2019-0042', 'TE-PR-001', 'Bay 4', 'Operational', 'Not Required', NULL, NULL, '2019-06-15', '2025-12-01', '2026-06-01', 180, ARRAY[]::uuid[], 'Annual certification by hydraulic specialist'),
(plant_cnc, 'CNC Plasma Cutting Table', 'Cutting', 'Kinetic Engineering', 'K4000', 'K4000-2021-1187', 'TE-CT-001', 'Bay 5', 'Operational', 'Not Required', NULL, NULL, '2021-03-20', '2026-01-15', '2026-04-15', 90, ARRAY[]::uuid[], 'Hypertherm XPR300 plasma source. Software v4.2.'),
(plant_roller, 'Plate Rolling Machine', 'Forming', 'Davi', 'MCA 3053', 'MCA-2018-0891', 'TE-FM-001', 'Bay 3', 'Operational', 'Not Required', NULL, NULL, '2018-09-10', '2025-11-20', '2026-05-20', 180, ARRAY[]::uuid[], '3m roll width, 50mm max thickness'),
(plant_crane10, '10T Overhead Bridge Crane', 'Crane', 'Konecranes', 'CXT 10', 'CXT10-2017-2234', 'TE-CR-001', 'Main Workshop', 'Operational', 'Registered', 'REG-CR-2234', '2026-08-15', '2017-01-15', '2025-12-20', '2026-03-20', 90, ARRAY[sop_crane]::uuid[], 'Major inspection due August 2026. Annual load test current.'),
(plant_jib, '5T Jib Crane', 'Crane', 'Demag', 'DC-Pro 5', 'DC5-2020-0567', 'TE-CR-002', 'Bay 2', 'Operational', 'Registered', 'REG-CR-0567', '2026-08-15', '2020-04-01', '2025-12-20', '2026-03-20', 90, ARRAY[sop_crane]::uuid[], NULL),
(plant_mig1, 'MIG Welder #1', 'Welder', 'Lincoln Electric', 'Speedtec 500SP', 'LS500-A1234', 'TE-WD-001', 'Bay 1', 'Operational', 'Not Required', NULL, NULL, '2020-05-01', '2026-01-10', '2026-07-10', 180, ARRAY[sop_pv]::uuid[], NULL),
(plant_mig2, 'MIG Welder #2', 'Welder', 'Lincoln Electric', 'Speedtec 500SP', 'LS500-A1235', 'TE-WD-002', 'Bay 2', 'Operational', 'Not Required', NULL, NULL, '2020-05-01', '2026-01-10', '2026-07-10', 180, ARRAY[sop_pv]::uuid[], NULL),
(plant_mig3, 'MIG Welder #3', 'Welder', 'Kemppi', 'FastMig X 450', 'FMX450-2022-882', 'TE-WD-003', 'Bay 3', 'Operational', 'Not Required', NULL, NULL, '2022-08-15', '2026-01-10', '2026-07-10', 180, ARRAY[sop_pv]::uuid[], NULL),
(plant_tig1, 'TIG Welder #1', 'Welder', 'Lincoln Electric', 'Aspect 375', 'LA375-B2201', 'TE-WD-004', 'Bay 1', 'Operational', 'Not Required', NULL, NULL, '2021-02-01', '2026-01-10', '2026-07-10', 180, ARRAY[sop_tig]::uuid[], NULL),
(plant_tig2, 'TIG Welder #2', 'Welder', 'Fronius', 'MagicWave 230i', 'MW230-2023-445', 'TE-WD-005', 'Bay 2', 'Operational', 'Not Required', NULL, NULL, '2023-04-10', '2026-01-10', '2026-07-10', 180, ARRAY[sop_tig]::uuid[], NULL),
(plant_forklift, 'Counterbalance Forklift', 'Forklift', 'Toyota', '8FG25', 'TY8FG-2021-3310', 'TE-FL-001', 'Material Storage', 'Operational', 'Registered', 'REG-FL-3310', '2026-06-30', '2021-07-01', '2026-02-01', '2026-05-01', 90, ARRAY[]::uuid[], '2.5T capacity. LPG. Pre-start checklist on clipboard.'),
(plant_hydropump, 'Hydrostatic Test Pump', 'Testing', 'Haskel', 'AW-60', 'AW60-2019-0088', 'TE-QA-001', 'Test Bay', 'Operational', 'Not Required', NULL, NULL, '2019-11-01', '2025-10-15', '2026-04-15', 180, ARRAY[sop_hydro]::uuid[], 'Calibrated annually. Current cal cert on file.'),
(plant_grinder, 'Pedestal Grinder', 'Grinder', 'Abbott & Ashby', 'AX8', 'AX8-2018-220', 'TE-GR-001', 'Tool Room', 'Operational', 'Not Required', NULL, NULL, '2018-03-01', '2025-12-01', '2026-06-01', 180, ARRAY[sop_grind]::uuid[], NULL),
(plant_oxy, 'Oxy-Acetylene Cutting Set', 'Cutting', 'BOC', 'Smoothcut', 'SC-2020-1122', 'TE-CT-002', 'Bay 3', 'Operational', 'Not Required', NULL, NULL, '2020-09-01', '2025-11-01', '2026-05-01', 180, ARRAY[sop_hotwork]::uuid[], 'Regulators tested annually. Flashback arrestors fitted.'),
(plant_lathe, 'Centre Lathe', 'Machine', 'Hafco', 'AL-960B', 'AL960-2017-556', 'TE-MC-001', 'Machine Shop', 'Operational', 'Not Required', NULL, NULL, '2017-06-01', '2025-09-15', '2026-03-15', 180, ARRAY[]::uuid[], '960mm swing. Used for nozzle prep and flange facing.');

-- ============================================================================
-- HAZARDOUS SUBSTANCES
-- ============================================================================
INSERT INTO hazardous_substances (product_name, manufacturer, un_number, dangerous_goods_class, location_stored, sds_issue_date, sds_expiry_date, quantity_held, risk_phrases, control_measures, first_aid_measures, notes) VALUES
('Welding Fume (Mixed)', 'Various', NULL, NULL, 'Generated during welding', '2024-01-01', '2029-01-01', 'Generated in process', ARRAY['H332 Harmful if inhaled', 'H351 Suspected of causing cancer'], 'Local exhaust ventilation (fume extraction arms), RPE (P2 minimum), general workshop ventilation, WES monitoring', 'Remove to fresh air. If breathing difficulty persists, seek medical attention.', 'Welding fume classified as Group 1 carcinogen by IARC. Fume extraction mandatory on all welding.'),
('Argon (Compressed Gas)', 'BOC', 'UN1006', '2.2', 'Gas Cylinder Storage Bay (chained)', '2024-06-01', '2029-06-01', '8 x G-size cylinders', ARRAY['H280 Contains gas under pressure'], 'Store upright, chained to wall/rack. Valve caps on when not in use. Adequate ventilation — asphyxiation risk in confined spaces.', 'Remove to fresh air. Administer oxygen if available. Seek medical attention if symptoms persist.', 'Non-flammable. Asphyxiation hazard in confined spaces.'),
('Acetylene (Dissolved)', 'BOC', 'UN1001', '2.1', 'Gas Cylinder Storage Bay (chained, separated)', '2024-06-01', '2029-06-01', '4 x G-size cylinders', ARRAY['H220 Extremely flammable gas', 'H280 Contains gas under pressure'], 'Store upright, chained, separated from oxygen by 3m or fire wall. No smoking within 5m. Flashback arrestors mandatory. Check for leaks with soapy water.', 'Remove to fresh air. If unconscious, place in recovery position. Seek immediate medical attention.', 'Explosive limits 2.5-81%. Never use at pressures above 103 kPa gauge.'),
('Anti-Spatter Spray', 'CRC', NULL, NULL, 'Welding Consumable Store', '2024-03-01', '2029-03-01', '12 x 400ml cans', ARRAY['H222 Extremely flammable aerosol', 'H229 Pressurised container'], 'Store below 50°C away from heat sources. Use in well-ventilated area. Do not spray near ignition sources.', 'If inhaled: remove to fresh air. If skin contact: wash with soap and water.', NULL),
('Workshop Degreaser (Solvent-Based)', 'Chemtools', NULL, NULL, 'Flammable Liquids Cabinet', '2024-04-01', '2029-04-01', '20L drum', ARRAY['H225 Highly flammable liquid and vapour', 'H319 Causes serious eye irritation', 'H336 May cause drowsiness or dizziness'], 'Use in well-ventilated area or with LEV. Nitrile gloves, safety glasses. No smoking. Ground containers during dispensing.', 'Skin: wash thoroughly. Eyes: flush with water 15 minutes. Ingestion: do not induce vomiting, seek medical attention.', 'Keep bunded in flammable liquids cabinet'),
('Cutting Fluid (Water-Soluble)', 'Castrol', NULL, NULL, 'Machine Shop — Lathe', '2024-05-01', '2029-05-01', '20L drum', ARRAY['H315 Causes skin irritation', 'H319 Causes serious eye irritation'], 'Nitrile gloves when handling concentrate. Safety glasses. Maintain correct dilution ratio (1:20). Monitor for bacterial growth.', 'Skin: wash with soap and water. Eyes: flush with water. Seek medical attention if irritation persists.', 'Change fluid monthly. Maintain concentration with refractometer.');

-- ============================================================================
-- TOOLBOX TALKS
-- ============================================================================
INSERT INTO toolbox_talks (title, date, time, location, conducted_by, attendee_ids, topics_covered, actions_arising, notes) VALUES
('PPE Fit for Overhead Welding', '2025-12-18', '07:00', 'Workshop Smoko Room', 'Steve Wilson', ARRAY[emp_mark, emp_steve, emp_dave, emp_lisa, emp_james]::uuid[],
ARRAY['Correct glove/sleeve overlap technique for overhead welding', 'FR clothing requirements — tuck sleeves into gauntlet gloves', 'Recent burn incident INC-2025-002 discussed', 'Practical demonstration of correct PPE fit'],
'Nil — all attendees demonstrated correct technique.', 'Arising from incident INC-2025-002. Tom Wright absent (not yet started).'),

('Grinding Disc Safety & Storage', '2025-12-04', '07:00', 'Workshop Smoko Room', 'Mark Thompson', ARRAY[emp_mark, emp_steve, emp_dave, emp_james]::uuid[],
ARRAY['Correct disc storage — flat, in original packaging', 'Pre-use inspection — visual and tap test', 'Maximum RPM and disc compatibility', 'Near miss INC-2025-001 discussed', 'New disc storage rack in grinding bay'],
'Steve to order new disc storage rack — COMPLETED.', 'Arising from near miss INC-2025-001. Lisa absent (off-site inspection).'),

('Monthly Safety Briefing — February 2026', '2026-02-03', '07:00', 'Workshop Smoko Room', 'Mark Thompson', ARRAY[emp_mark, emp_steve, emp_dave, emp_lisa, emp_tom, emp_james]::uuid[],
ARRAY['January incident review — nil reportable incidents', 'Forklift racking incident INC-2026-001 update', 'WorkSafe Victoria campaign — welding fume exposure', 'Upcoming hydrostatic test schedule', 'Apprentice progress update — Tom Wright'],
'Mark to arrange structural engineer assessment of damaged racking.', 'Full attendance. Tom Wright first toolbox talk — signed attendance sheet.');

-- ============================================================================
-- PPE RECORDS
-- ============================================================================
INSERT INTO ppe_records (employee_id, ppe_type, brand, serial_number, date_issued, expiry_date, condition, notes) VALUES
(emp_steve, 'Welding Helmet (Auto-Dark)', 'Lincoln Electric', 'LWH-3440-A', '2024-03-01', '2027-03-01', 'Good', 'Viking 3350 — shade 9-13'),
(emp_steve, 'Safety Boots', 'Oliver', NULL, '2024-06-01', '2025-12-01', 'Fair', 'Due for replacement'),
(emp_steve, 'Welding Gloves', 'Bossweld', NULL, '2025-09-01', '2026-03-01', 'Good', 'MIG gauntlet gloves'),
(emp_dave, 'Welding Helmet (Auto-Dark)', 'Speedglas', 'SG-9100X-228', '2024-09-01', '2027-09-01', 'Good', '3M Speedglas 9100X'),
(emp_dave, 'Safety Boots', 'Oliver', NULL, '2024-11-01', '2026-05-01', 'Good', NULL),
(emp_dave, 'Hearing Protection', '3M', NULL, '2025-01-15', '2026-01-15', 'Good', 'Peltor X4A earmuffs'),
(emp_lisa, 'Safety Boots', 'Blundstone', NULL, '2024-02-01', '2025-08-01', 'Replace', 'Worn — replacement ordered'),
(emp_lisa, 'Safety Glasses', 'Bolle', NULL, '2025-06-01', '2026-06-01', 'Good', 'Bolle Contour — clear lens'),
(emp_tom, 'Welding Helmet (Passive)', 'Bossweld', 'BW-PRO-001', '2025-12-02', '2028-12-02', 'Good', 'Shade 11 — apprentice issue'),
(emp_tom, 'Safety Boots', 'Oliver', NULL, '2025-12-02', '2027-06-02', 'Good', 'New issue'),
(emp_tom, 'Safety Glasses', 'Bolle', NULL, '2025-12-02', '2026-12-02', 'Good', 'Clear lens — Bolle Contour'),
(emp_tom, 'Hearing Protection', '3M', NULL, '2025-12-02', '2026-12-02', 'Good', 'Peltor X4A earmuffs'),
(emp_tom, 'FR Clothing Set', 'Bisley', NULL, '2025-12-02', '2026-12-02', 'Good', 'Shirt + trousers — new issue'),
(emp_james, 'Safety Boots', 'Oliver', NULL, '2024-06-01', '2025-12-01', 'Fair', NULL),
(emp_james, 'Hi-Vis Vest', '3M', NULL, '2024-06-01', '2025-12-01', 'Good', 'Class D/N vest');

-- ============================================================================
-- FIRST AID ENTRIES
-- ============================================================================
INSERT INTO first_aid_entries (injured_person_id, date, time, nature_of_injury, body_part, treatment_provided, treated_by, location, follow_up_required, follow_up_notes, incident_report_id) VALUES
(emp_dave, '2025-12-10', '14:20', 'Minor burn — hot slag contact', 'Left forearm', 'Cold running water 20 minutes. Burns dressing applied. Paracetamol offered (declined).', 'Steve Wilson', 'Bay 1 First Aid Kit', true, 'Review dressing in 2 days. Monitor for signs of infection. Modified duties — no overhead welding for 48 hours.', inc_burn),
(emp_james, '2025-08-22', '11:10', 'Minor laceration — sharp plate edge', 'Right hand', 'Cleaned wound with saline. Applied steri-strips and dressing. No sutures required.', 'Mark Thompson', 'Material Storage Area', false, NULL, NULL);

-- ============================================================================
-- INSPECTIONS
-- ============================================================================
INSERT INTO inspections (id, title, inspection_type, inspector, location, scheduled_date, completed_date, status, findings, overall_rating, notes) VALUES
(insp_dec, 'Monthly Workshop Inspection — December 2025', 'Monthly Safety Inspection', 'Mark Thompson', 'Full Workshop', '2025-12-15', '2025-12-15', 'Completed',
'[{"area":"Welding Bays","finding":"Fume extraction arm in Bay 2 not returning to position — spring mechanism worn","severity":"Medium","corrective_action":"Replace spring mechanism — ordered"},{"area":"Material Storage","finding":"Steel offcuts not properly stored — tripping hazard near walkway","severity":"Low","corrective_action":"Offcuts cleared and scrap bin relocated"},{"area":"Emergency Equipment","finding":"Fire extinguisher near main door — annual service tag expired Nov 2025","severity":"High","corrective_action":"Service booked with Wormald — 19 Dec 2025"},{"area":"PPE","finding":"All PPE in good condition. Spare safety glasses stock low.","severity":"Low","corrective_action":"Order placed for 10x Bolle Contour clear lens"}]',
'Needs Improvement', '4 findings — 1 high priority (fire extinguisher service). All corrective actions initiated.'),

(insp_jan, 'Monthly Workshop Inspection — January 2026', 'Monthly Safety Inspection', 'Mark Thompson', 'Full Workshop', '2026-01-15', '2026-01-16', 'Completed',
'[{"area":"Welding Bays","finding":"Fume extraction arm Bay 2 repaired — operating correctly","severity":"Low","corrective_action":"Nil — verified OK"},{"area":"Workshop Floor","finding":"Oil stain near lathe — slip hazard","severity":"Medium","corrective_action":"Cleaned immediately. Drip tray repositioned."},{"area":"Emergency Equipment","finding":"All fire extinguishers serviced and current","severity":"Low","corrective_action":"Nil"},{"area":"First Aid","finding":"First aid kit fully stocked. Eye wash station checked OK.","severity":"Low","corrective_action":"Nil"}]',
'Satisfactory', '4 items checked — significant improvement from December. Oil stain addressed immediately.'),

(insp_feb, 'Monthly Workshop Inspection — February 2026', 'Monthly Safety Inspection', 'Lisa Chen', 'Full Workshop', '2026-02-15', NULL, 'Scheduled',
'[]',
NULL, 'Scheduled inspection — Lisa Chen conducting in Mark''s absence.');

-- ============================================================================
-- EMERGENCY INFO
-- ============================================================================
INSERT INTO emergency_info (type, title, description, location, contact_number, responsible_person_id, last_reviewed, review_due, notes) VALUES
('Fire Warden', 'Chief Fire Warden — Mark Thompson', 'Chief Fire Warden responsible for evacuation coordination and roll call', 'Office / Workshop', '0412 345 678', emp_mark, '2025-12-01', '2026-06-01', 'CFA Fire Warden trained. Backup: Steve Wilson.'),
('Fire Warden', 'Deputy Fire Warden — Steve Wilson', 'Deputy Fire Warden responsible for workshop floor sweep', 'Workshop Floor', '0423 456 789', emp_steve, '2025-12-01', '2026-06-01', NULL),
('First Aider', 'Senior First Aider — Mark Thompson', 'Senior First Aid qualified. St John Ambulance certificate current.', 'Office / Workshop', '0412 345 678', emp_mark, '2025-12-01', '2026-06-01', 'First aid kit locations: Office, Bay 1, Material Storage, Smoko Room'),
('First Aider', 'First Aider — Steve Wilson', 'Senior First Aid qualified.', 'Workshop Floor', '0423 456 789', emp_steve, '2025-12-01', '2026-06-01', NULL),
('Assembly Point', 'Primary Assembly Point', 'Front car park — near the main gate. All personnel to report for roll call.', 'Front Car Park', NULL, NULL, '2025-12-01', '2026-06-01', 'Assembly point clearly marked with green sign. Visitor sign-in book taken to assembly point by office staff.'),
('Emergency Procedure', 'Emergency Evacuation Procedure', 'On hearing alarm (continuous siren): Stop work. Secure hazards if safe (close gas valves, lower crane loads). Proceed to assembly point via nearest exit. Do not re-enter until all-clear given by Chief Fire Warden.', 'All Areas', '000', NULL, '2025-12-01', '2026-06-01', 'Evacuation drill conducted quarterly. Last drill: November 2025.'),
('Emergency Procedure', 'Serious Injury / Medical Emergency', 'Call 000. Administer first aid if trained. Do not move injured person unless immediate danger. Send someone to guide ambulance from main gate.', 'All Areas', '000', NULL, '2025-12-01', '2026-06-01', 'Nearest hospital: Northern Hospital, Epping — 15 min drive');

END $$;
