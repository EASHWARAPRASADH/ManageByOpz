// ══════════════════════════════════════════════════════════════════════════════
// Employee Onboarding — Validation & Profile Health Engine
// ══════════════════════════════════════════════════════════════════════════════

export type StepStatus = 'not_started' | 'in_progress' | 'error' | 'completed';

export interface StepValidationResult {
  status: StepStatus;
  errors: string[];
  /** Number of required fields filled */
  filledCount: number;
  /** Total number of required fields */
  totalRequired: number;
  /** Whether this step is mandatory for creation */
  isMandatory: boolean;
}

export interface OnboardingFormData {
  // Step 1: Identity
  firstName: string;
  lastName: string;
  workEmail: string;
  personalEmail: string;
  workPhone: string;
  personalPhone: string;
  gender: string;
  dateOfBirth: string;

  // Step 2: Employment DNA
  dateOfJoining: string;
  selectedOrg: string;
  selectedBU: string;
  selectedDiv: string;
  selectedDept: string;
  selectedLoc: string;
  selectedGrade: string;
  selectedBand: string;
  managerId: string;
  workMode: string;
  designation: string;
  employmentType?: string;

  // Step 3: Compliance
  panNumber: string;
  aadhaarNumber: string;
  uanNumber: string;
  esicNumber: string;

  // Step 4: Banking
  bankName: string;
  bankAccountNumber: string;
  bankIfsc: string;

  // Step 5: Skills & Certifications
  skillsList: any[];
  certificationsList: any[];

  // Step 6: Documents
  documentsList: any[];

  // Step 7: Relationships
  buddyId: string;
  mentorId: string;
  hrbpId: string;
  skipManagerId: string;
  departmentHeadId: string;
}

// ── Step 1: Identity (MANDATORY)
export function validateStep1(data: OnboardingFormData): StepValidationResult {
  const errors: string[] = [];
  const requiredChecks = [
    { value: data.firstName.trim(), label: 'First Name' },
    { value: data.lastName.trim(), label: 'Last Name' },
    { value: data.workEmail.trim(), label: 'Work Email' },
    { value: data.workPhone.trim(), label: 'Work Phone' },
    { value: data.gender.trim(), label: 'Gender' },
    { value: data.dateOfBirth.trim(), label: 'Date of Birth' },
  ];

  for (const check of requiredChecks) {
    if (!check.value) {
      errors.push(check.label);
    }
  }

  // Format validation — only validate if provided
  if (data.workEmail.trim() && !data.workEmail.includes('@')) {
    errors.push('Work Email (invalid format)');
  }

  const filledCount = requiredChecks.filter(c => !!c.value).length;
  const totalRequired = requiredChecks.length;

  return {
    status: deriveStatus(filledCount, totalRequired, errors),
    errors,
    filledCount,
    totalRequired,
    isMandatory: true,
  };
}

// ── Step 2: Employment DNA (MANDATORY)
export function validateStep2(data: OnboardingFormData): StepValidationResult {
  const errors: string[] = [];
  const requiredChecks = [
    { value: data.dateOfJoining.trim(), label: 'Date of Joining' },
    { value: data.selectedOrg.trim(), label: 'Organization' },
    { value: data.designation.trim(), label: 'Designation' },
    { value: data.managerId.trim(), label: 'Reporting Manager' },
  ];

  for (const check of requiredChecks) {
    if (!check.value) {
      errors.push(check.label);
    }
  }

  const filledCount = requiredChecks.filter(c => !!c.value).length;
  const totalRequired = requiredChecks.length;

  return {
    status: deriveStatus(filledCount, totalRequired, errors),
    errors,
    filledCount,
    totalRequired,
    isMandatory: true,
  };
}

// ── Step 3: Compliance (MANDATORY)
export function validateStep3(data: OnboardingFormData): StepValidationResult {
  const errors: string[] = [];
  const requiredChecks = [
    { value: data.panNumber.trim(), label: 'PAN Number' },
    { value: data.aadhaarNumber.trim(), label: 'Aadhaar Number' },
  ];

  for (const check of requiredChecks) {
    if (!check.value) {
      errors.push(check.label);
    }
  }

  if (data.panNumber.trim() && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(data.panNumber.trim())) {
    errors.push('PAN Number (invalid format — expected ABCDE1234F)');
  }
  if (data.aadhaarNumber.trim() && !/^\d{4}\s?\d{4}\s?\d{4}$/.test(data.aadhaarNumber.trim())) {
    errors.push('Aadhaar Number (invalid format — expected 12 digits)');
  }

  const filledCount = requiredChecks.filter(c => !!c.value).length;
  const totalRequired = requiredChecks.length;

  return {
    status: deriveStatus(filledCount, totalRequired, errors),
    errors,
    filledCount,
    totalRequired,
    isMandatory: true,
  };
}

// ── Step 4: Banking (MANDATORY)
export function validateStep4(data: OnboardingFormData): StepValidationResult {
  const errors: string[] = [];
  const requiredChecks = [
    { value: data.bankName.trim(), label: 'Bank Name' },
    { value: data.bankAccountNumber.trim(), label: 'Bank Account Number' },
    { value: data.bankIfsc.trim(), label: 'Bank IFSC Code' },
  ];

  for (const check of requiredChecks) {
    if (!check.value) {
      errors.push(check.label);
    }
  }

  const filledCount = requiredChecks.filter(c => !!c.value).length;
  const totalRequired = requiredChecks.length;

  return {
    status: deriveStatus(filledCount, totalRequired, errors),
    errors,
    filledCount,
    totalRequired,
    isMandatory: true,
  };
}

// ── Step 5: Skills & Certs (OPTIONAL)
export function validateStep5(data: OnboardingFormData): StepValidationResult {
  const hasSkills = data.skillsList.length > 0;
  const hasCerts = data.certificationsList.length > 0;
  const filledCount = (hasSkills ? 1 : 0) + (hasCerts ? 1 : 0);

  return {
    status: filledCount > 0 ? 'completed' : 'not_started',
    errors: [],
    filledCount,
    totalRequired: 0,
    isMandatory: false,
  };
}

// ── Step 6: Documents (OPTIONAL)
export function validateStep6(data: OnboardingFormData): StepValidationResult {
  const hasDocs = data.documentsList.length > 0;

  return {
    status: hasDocs ? 'completed' : 'not_started',
    errors: [],
    filledCount: hasDocs ? 1 : 0,
    totalRequired: 0,
    isMandatory: false,
  };
}

// ── Step 7: Relationships (OPTIONAL)
export function validateStep7(data: OnboardingFormData): StepValidationResult {
  const hasRelationships = !!(data.buddyId || data.mentorId || data.hrbpId);

  return {
    status: hasRelationships ? 'completed' : 'not_started',
    errors: [],
    filledCount: hasRelationships ? 1 : 0,
    totalRequired: 0,
    isMandatory: false,
  };
}

export type StepValidator = (data: OnboardingFormData) => StepValidationResult;

export const STEP_VALIDATORS: Record<number, StepValidator> = {
  1: validateStep1,
  2: validateStep2,
  3: validateStep3,
  4: validateStep4,
  5: validateStep5,
  6: validateStep6,
  7: validateStep7,
};

export const MANDATORY_STEPS = [1, 2, 3, 4];
export const OPTIONAL_STEPS = [5, 6, 7];

export interface ProfileHealthItem {
  label: string;
  filled: boolean;
  potentialGain: number;
  sectionLabel: string;
  stepNumber: number;
}

export interface ValidationSummary {
  stepResults: Record<number, StepValidationResult>;
  canSubmit: boolean;
  completionPercentage: number;
  missingSections: { stepNumber: number; stepLabel: string; errors: string[] }[];
  optionalMissing: ProfileHealthItem[];
}

const STEP_LABELS: Record<number, string> = {
  1: 'Identity',
  2: 'Employment DNA',
  3: 'Compliance',
  4: 'Banking Details',
  5: 'Skills & Certs',
  6: 'Documents Upload',
  7: 'Relationships',
};

export function computeValidationSummary(data: OnboardingFormData): ValidationSummary {
  const stepResults: Record<number, StepValidationResult> = {};

  for (const [stepStr, validator] of Object.entries(STEP_VALIDATORS)) {
    const stepNum = parseInt(stepStr);
    stepResults[stepNum] = validator(data);
  }

  const canSubmit = MANDATORY_STEPS.every(s => stepResults[s].status === 'completed');

  let totalRequired = 0;
  let totalFilled = 0;
  for (const s of MANDATORY_STEPS) {
    totalRequired += stepResults[s].totalRequired;
    totalFilled += stepResults[s].filledCount;
  }
  const completionPercentage = totalRequired > 0 ? Math.round((totalFilled / totalRequired) * 100) : 0;

  const missingSections: ValidationSummary['missingSections'] = [];
  for (const s of MANDATORY_STEPS) {
    if (stepResults[s].status !== 'completed') {
      missingSections.push({
        stepNumber: s,
        stepLabel: STEP_LABELS[s],
        errors: stepResults[s].errors,
      });
    }
  }

  return { stepResults, canSubmit, completionPercentage, missingSections, optionalMissing: [] };
}

function deriveStatus(filled: number, total: number, errors: string[]): StepStatus {
  if (filled === 0) return 'not_started';
  if (errors.length > 0) return filled < total ? 'in_progress' : 'error';
  return 'completed';
}
