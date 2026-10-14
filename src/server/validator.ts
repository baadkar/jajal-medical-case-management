import { db } from './db.ts';
import { CaseStatus, CasePriority } from '../types.ts';

const ALLOWED_STATUSES: CaseStatus[] = ['Draft', 'Planning', 'In Review', 'Approved', 'Completed', 'Cancelled'];
const ALLOWED_PRIORITIES: CasePriority[] = ['Low', 'Medium', 'High'];

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
}

/**
 * Simulates Laravel FormRequest: StoreCaseRequest & UpdateCaseRequest
 */
export function validateCaseInput(data: Record<string, unknown>, ignoreCaseId?: number): ValidationResult {
  const errors: Record<string, string[]> = {};

  const addError = (field: string, msg: string) => {
    if (!errors[field]) errors[field] = [];
    errors[field].push(msg);
  };

  // Case Number
  const caseNumber = typeof data.case_number === 'string' ? data.case_number.trim() : '';
  if (!caseNumber) {
    addError('case_number', 'The case number field is required.');
  } else {
    // Unique check
    const existing = db.findCaseByNumber(caseNumber);
    if (existing && (!ignoreCaseId || existing.id !== ignoreCaseId)) {
      addError('case_number', 'The case number has already been taken.');
    }
  }

  // Patient Reference
  const patientRef = typeof data.patient_reference === 'string' ? data.patient_reference.trim() : '';
  if (!patientRef) {
    addError('patient_reference', 'The patient reference field is required.');
  }

  // Surgeon Name
  const surgeonName = typeof data.surgeon_name === 'string' ? data.surgeon_name.trim() : '';
  if (!surgeonName) {
    addError('surgeon_name', 'The surgeon name field is required.');
  }

  // Implant Type
  const implantType = typeof data.implant_type === 'string' ? data.implant_type.trim() : '';
  if (!implantType) {
    addError('implant_type', 'The implant type field is required.');
  }

  // Status
  const status = typeof data.status === 'string' ? (data.status as CaseStatus) : null;
  if (!status) {
    addError('status', 'The status field is required.');
  } else if (!ALLOWED_STATUSES.includes(status)) {
    addError('status', `The selected status is invalid. Allowed values: ${ALLOWED_STATUSES.join(', ')}.`);
  }

  // Priority
  const priority = typeof data.priority === 'string' ? (data.priority as CasePriority) : null;
  if (!priority) {
    addError('priority', 'The priority field is required.');
  } else if (!ALLOWED_PRIORITIES.includes(priority)) {
    addError('priority', `The selected priority is invalid. Allowed values: ${ALLOWED_PRIORITIES.join(', ')}.`);
  }

  // Surgery Date (Optional, but if given must be valid date)
  if (data.surgery_date !== undefined && data.surgery_date !== null && data.surgery_date !== '') {
    const dateStr = String(data.surgery_date).trim();
    // Validate ISO date format YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateStr)) {
      addError('surgery_date', 'The surgery date does not match the format YYYY-MM-DD.');
    } else {
      const parsed = new Date(dateStr);
      if (isNaN(parsed.getTime())) {
        addError('surgery_date', 'The surgery date is not a valid date.');
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
