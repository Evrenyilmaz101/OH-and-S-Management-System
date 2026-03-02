// Re-export everything from modules
export { getEmployees, getEmployee, addEmployee, updateEmployee, deleteEmployee, createEmployeeWithOnboarding } from './employees';
export { getTasks, getTask, addTask, updateTask, deleteTask } from './tasks';
export { getVOCRecords, getVOCRecord, getVOCByEmployee, getVOCByTask, addVOCRecord, updateVOCRecord, deleteVOCRecord } from './voc';
export { getCertifications, getCertification, getCertsByEmployee, addCertification, updateCertification, deleteCertification } from './certifications';
export { getRoles, getRole, addRole, updateRole, deleteRole } from './roles';
export {
  getInductionTemplates, getInductionTemplate, addInductionTemplate, updateInductionTemplate, deleteInductionTemplate,
  getInductionRecords, getInductionsByEmployee, addInductionRecord, updateInductionRecord, deleteInductionRecord,
  getOnboardingRecords, getOnboardingByEmployee, addOnboardingRecord, updateOnboardingRecord, deleteOnboardingRecord,
} from './onboarding';
export { getSOPs, getSOP, addSOP, updateSOP, deleteSOP, getSOPAcknowledgments, getSOPAcksByEmployee, getSOPAcksBySOP, addSOPAcknowledgment, updateSOPAcknowledgment, deleteSOPAcknowledgment } from './sops';
export { getIncidents, getIncident, addIncident, updateIncident, deleteIncident, getIncidentsByPerson, getCorrectiveActions, getCorrectiveAction, getCorrectiveActionsBySource, addCorrectiveAction, updateCorrectiveAction, deleteCorrectiveAction } from './incidents';
export { getDocuments, getDocument, getDocumentsByCategory, getDocumentsByEntity, getDocumentsForEmployee, addDocument, updateDocument, deleteDocument } from './documents';
export { getSWMSList, getSWMS, addSWMS, updateSWMS, deleteSWMS, getRiskAssessments, getRiskAssessment, addRiskAssessment, updateRiskAssessment, deleteRiskAssessment, getToolboxTalks, getToolboxTalk, addToolboxTalk, updateToolboxTalk, deleteToolboxTalk, getToolboxTalksByAttendee } from './compliance';
export {
  getPlantEquipment, getPlantItem, addPlantEquipment, updatePlantEquipment, deletePlantEquipment,
  getHazardousSubstances, getHazardousSubstance, addHazardousSubstance, updateHazardousSubstance, deleteHazardousSubstance,
  getPPERecords, getPPEByEmployee, addPPERecord, updatePPERecord, deletePPERecord,
  getFirstAidEntries, getFirstAidEntry, addFirstAidEntry, updateFirstAidEntry, deleteFirstAidEntry, getFirstAidByPerson,
  getInspections, getInspection, addInspection, updateInspection, deleteInspection,
  getEmergencyInfo, getEmergencyItem, addEmergencyInfo, updateEmergencyInfo, deleteEmergencyInfo,
} from './registers';

// Document templates
export { getDocumentTemplates, getDocumentTemplate, addDocumentTemplate, updateDocumentTemplate, deleteDocumentTemplate } from './document-templates';

// Company policies
export { getCompanyPolicies, getCompanyPolicy, addCompanyPolicy, updateCompanyPolicy, deleteCompanyPolicy } from './company-policies';

// Compliance engine
export { getEmployeeCompliance, getAllEmployeeCompliance, computeCompliance } from './compliance-engine';
export type { ComplianceStatus } from './compliance-engine';

// Backward-compatible aliases
export { getVOCByEmployee as getVOCRecordsByEmployee } from './voc';
export { getVOCByTask as getVOCRecordsByTask } from './voc';
export { getCertsByEmployee as getCertificationsByEmployee } from './certifications';
