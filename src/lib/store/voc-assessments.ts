import { getAll, getById, getFiltered, insertRow, updateRow, deleteRow } from './core';
import type { VOCAssessmentTemplate, VOCAssessment } from '@/lib/types';

// === VOC Assessment Templates ===
const TEMPLATES_TABLE = 'voc_assessment_templates';

export async function getVOCTemplates(): Promise<VOCAssessmentTemplate[]> {
  return getAll<VOCAssessmentTemplate>(TEMPLATES_TABLE, 'name');
}

export async function getVOCTemplate(id: string): Promise<VOCAssessmentTemplate | undefined> {
  return getById<VOCAssessmentTemplate>(TEMPLATES_TABLE, id);
}

export async function getVOCTemplateByTask(taskId: string): Promise<VOCAssessmentTemplate | undefined> {
  const results = await getFiltered<VOCAssessmentTemplate>(TEMPLATES_TABLE, 'task_id', taskId);
  return results.find(t => t.active) || results[0];
}

export async function addVOCTemplate(template: VOCAssessmentTemplate): Promise<VOCAssessmentTemplate | null> {
  return insertRow<VOCAssessmentTemplate>(TEMPLATES_TABLE, template);
}

export async function updateVOCTemplate(template: VOCAssessmentTemplate): Promise<VOCAssessmentTemplate | null> {
  return updateRow<VOCAssessmentTemplate>(TEMPLATES_TABLE, template.id, template);
}

export async function deleteVOCTemplate(id: string): Promise<boolean> {
  return deleteRow(TEMPLATES_TABLE, id);
}

// === VOC Assessments (completed) ===
const ASSESSMENTS_TABLE = 'voc_assessments';

export async function getVOCAssessments(): Promise<VOCAssessment[]> {
  return getAll<VOCAssessment>(ASSESSMENTS_TABLE, 'assessment_date');
}

export async function getVOCAssessment(id: string): Promise<VOCAssessment | undefined> {
  return getById<VOCAssessment>(ASSESSMENTS_TABLE, id);
}

export async function getVOCAssessmentByRecord(vocRecordId: string): Promise<VOCAssessment | undefined> {
  const results = await getFiltered<VOCAssessment>(ASSESSMENTS_TABLE, 'voc_record_id', vocRecordId);
  return results[0];
}

export async function addVOCAssessment(assessment: VOCAssessment): Promise<VOCAssessment | null> {
  return insertRow<VOCAssessment>(ASSESSMENTS_TABLE, assessment);
}

export async function updateVOCAssessment(assessment: VOCAssessment): Promise<VOCAssessment | null> {
  return updateRow<VOCAssessment>(ASSESSMENTS_TABLE, assessment.id, assessment);
}
