import { describe, it, expect } from 'vitest';
import {
  validateStep1,
  validateStep2,
  validateStep3,
  validateStep4,
  validateStep5,
  validateStep6,
  validateStep7,
  computeValidationSummary,
  MANDATORY_STEPS,
  type OnboardingFormData,
} from './onboardingValidation';

// ── Factory ───────────────────────────────────────────────────────────────────

function createEmptyFormData(): OnboardingFormData {
  return {
    firstName: '',
    lastName: '',
    workEmail: '',
    personalEmail: '',
    workPhone: '',
    personalPhone: '',
    gender: '',
    dateOfBirth: '',
    dateOfJoining: '',
    selectedOrg: '',
    selectedBU: '',
    selectedDiv: '',
    selectedDept: '',
    selectedLoc: '',
    selectedGrade: '',
    selectedBand: '',
    managerId: '',
    workMode: 'HYBRID',
    designation: '',
    panNumber: '',
    aadhaarNumber: '',
    uanNumber: '',
    esicNumber: '',
    bankName: '',
    bankAccountNumber: '',
    bankIfsc: '',
    skillsList: [],
    certificationsList: [],
    documentsList: [],
    buddyId: '',
    mentorId: '',
    hrbpId: '',
    skipManagerId: '',
    departmentHeadId: '',
  };
}

function createFullFormData(): OnboardingFormData {
  return {
    firstName: 'Alex',
    lastName: 'Rivera',
    workEmail: 'alex@managemyopz.com',
    personalEmail: 'alex@gmail.com',
    workPhone: '+1-555-0199',
    personalPhone: '+1-555-0100',
    gender: 'Male',
    dateOfBirth: '1990-01-15',
    dateOfJoining: '2026-06-01',
    selectedOrg: 'uuid-org-1',
    selectedBU: 'uuid-bu-1',
    selectedDiv: 'uuid-div-1',
    selectedDept: 'uuid-dept-1',
    selectedLoc: 'uuid-loc-1',
    selectedGrade: 'uuid-grade-1',
    selectedBand: 'uuid-band-1',
    managerId: 'uuid-mgr-1',
    workMode: 'HYBRID',
    designation: 'Senior Engineer',
    panNumber: 'ABCDE1234F',
    aadhaarNumber: '1234 5678 9012',
    uanNumber: '100998822112',
    esicNumber: '31123456780011001',
    bankName: 'State Bank of India',
    bankAccountNumber: '9988112233',
    bankIfsc: 'SBIN0001234',
    skillsList: [{ skillName: 'React', skillCategory: 'TECHNICAL', proficiencyLevel: 'EXPERT' }],
    certificationsList: [{ certificationName: 'AWS SA', issuingAuthority: 'AWS', issueDate: '2025-01-01' }],
    documentsList: [{ documentName: 'passport.pdf', documentType: 'IDENTITY_PROOF' }],
    buddyId: 'uuid-buddy-1',
    mentorId: 'uuid-mentor-1',
    hrbpId: 'uuid-hrbp-1',
    skipManagerId: 'uuid-skip-1',
    departmentHeadId: 'uuid-depthead-1',
  };
}

// ── Step 1: Identity ──────────────────────────────────────────────────────────

describe('validateStep1 — Identity', () => {
  it('should return not_started when all fields are empty', () => {
    const result = validateStep1(createEmptyFormData());
    expect(result.status).toBe('not_started');
    expect(result.errors).toContain('First Name');
    expect(result.errors).toContain('Last Name');
    expect(result.errors).toContain('Work Email');
    expect(result.errors).toContain('Work Phone');
    expect(result.errors).toContain('Gender');
    expect(result.errors).toContain('Date of Birth');
    expect(result.filledCount).toBe(0);
  });

  it('should return completed when all required fields are filled', () => {
    const result = validateStep1(createFullFormData());
    expect(result.status).toBe('completed');
    expect(result.errors).toHaveLength(0);
  });

  it('should return in_progress when some fields are filled', () => {
    const data = createEmptyFormData();
    data.firstName = 'Alex';
    data.lastName = 'Rivera';
    const result = validateStep1(data);
    expect(result.status).toBe('in_progress');
    expect(result.filledCount).toBe(2);
    expect(result.errors).not.toContain('First Name');
    expect(result.errors).toContain('Work Email');
  });

  it('should report invalid email format', () => {
    const data = createFullFormData();
    data.workEmail = 'invalid-email';
    const result = validateStep1(data);
    expect(result.status).toBe('error');
    expect(result.errors).toContain('Work Email (invalid format)');
  });

  it('should not penalize empty optional fields', () => {
    const data = createFullFormData();
    data.personalEmail = '';
    data.personalPhone = '';
    const result = validateStep1(data);
    expect(result.status).toBe('completed');
  });
});

// ── Step 2: Employment DNA ────────────────────────────────────────────────────

describe('validateStep2 — Employment DNA', () => {
  it('should return not_started when all fields are empty', () => {
    const result = validateStep2(createEmptyFormData());
    expect(result.status).toBe('not_started');
    expect(result.errors).toContain('Date of Joining');
    expect(result.errors).toContain('Organization');
    expect(result.errors).toContain('Designation');
    expect(result.errors).toContain('Reporting Manager');
  });

  it('should return completed when required fields are filled', () => {
    const result = validateStep2(createFullFormData());
    expect(result.status).toBe('completed');
    expect(result.errors).toHaveLength(0);
  });

  it('should return in_progress when only org is selected', () => {
    const data = createEmptyFormData();
    data.selectedOrg = 'uuid-org-1';
    const result = validateStep2(data);
    expect(result.status).toBe('in_progress');
    expect(result.filledCount).toBe(1);
    expect(result.errors).not.toContain('Organization');
    expect(result.errors).toContain('Date of Joining');
  });
});

// ── Step 3: Compliance ────────────────────────────────────────────────────────

describe('validateStep3 — Compliance', () => {
  it('should return not_started when all fields are empty', () => {
    const result = validateStep3(createEmptyFormData());
    expect(result.status).toBe('not_started');
    expect(result.errors).toContain('PAN Number');
    expect(result.errors).toContain('Aadhaar Number');
  });

  it('should return completed when PAN and Aadhaar are valid', () => {
    const result = validateStep3(createFullFormData());
    expect(result.status).toBe('completed');
    expect(result.errors).toHaveLength(0);
  });

  it('should flag invalid PAN format', () => {
    const data = createFullFormData();
    data.panNumber = 'INVALID';
    const result = validateStep3(data);
    expect(result.errors).toContain('PAN Number (invalid format — expected ABCDE1234F)');
  });

  it('should flag invalid Aadhaar format', () => {
    const data = createFullFormData();
    data.aadhaarNumber = '12345';
    const result = validateStep3(data);
    expect(result.errors).toContain('Aadhaar Number (invalid format — expected 12 digits)');
  });

  it('should accept Aadhaar without spaces', () => {
    const data = createFullFormData();
    data.aadhaarNumber = '123456789012';
    const result = validateStep3(data);
    expect(result.errors).not.toContain('Aadhaar Number (invalid format — expected 12 digits)');
  });
});

// ── Step 4: Banking ───────────────────────────────────────────────────────────

describe('validateStep4 — Banking', () => {
  it('should return not_started when all fields are empty', () => {
    const result = validateStep4(createEmptyFormData());
    expect(result.status).toBe('not_started');
    expect(result.errors).toContain('Bank Name');
    expect(result.errors).toContain('Bank Account Number');
    expect(result.errors).toContain('Bank IFSC Code');
  });

  it('should return completed when all banking fields are filled', () => {
    const result = validateStep4(createFullFormData());
    expect(result.status).toBe('completed');
  });

  it('should return in_progress when only bank name is filled', () => {
    const data = createEmptyFormData();
    data.bankName = 'SBI';
    const result = validateStep4(data);
    expect(result.status).toBe('in_progress');
    expect(result.filledCount).toBe(1);
    expect(result.totalRequired).toBe(3);
  });
});

// ── Step 5: Skills & Certs (optional) ─────────────────────────────────────────

describe('validateStep5 — Skills & Certifications (optional)', () => {
  it('should return not_started when no skills or certs', () => {
    const result = validateStep5(createEmptyFormData());
    expect(result.status).toBe('not_started');
    expect(result.errors).toHaveLength(0);
  });

  it('should return completed when at least one skill is added', () => {
    const data = createEmptyFormData();
    data.skillsList = [{ skillName: 'TypeScript', proficiencyLevel: 'EXPERT' }];
    const result = validateStep5(data);
    expect(result.status).toBe('completed');
  });

  it('should return completed when at least one cert is added', () => {
    const data = createEmptyFormData();
    data.certificationsList = [{ certificationName: 'GCP', issuingAuthority: 'Google' }];
    const result = validateStep5(data);
    expect(result.status).toBe('completed');
  });
});

// ── Step 6: Documents (optional) ──────────────────────────────────────────────

describe('validateStep6 — Documents (optional)', () => {
  it('should return not_started when no documents uploaded', () => {
    const result = validateStep6(createEmptyFormData());
    expect(result.status).toBe('not_started');
  });

  it('should return completed when at least one document attached', () => {
    const data = createEmptyFormData();
    data.documentsList = [{ documentName: 'id.pdf', documentType: 'IDENTITY_PROOF' }];
    const result = validateStep6(data);
    expect(result.status).toBe('completed');
  });
});

// ── Step 7: Relationships (optional) ──────────────────────────────────────────

describe('validateStep7 — Relationships (optional)', () => {
  it('should return not_started when no relationships configured', () => {
    const result = validateStep7(createEmptyFormData());
    expect(result.status).toBe('not_started');
  });

  it('should return completed when a buddy is assigned', () => {
    const data = createEmptyFormData();
    data.buddyId = 'uuid-buddy-1';
    const result = validateStep7(data);
    expect(result.status).toBe('completed');
  });
});

// ── Aggregate Validation Summary ──────────────────────────────────────────────

describe('computeValidationSummary', () => {
  it('should block submission when all mandatory steps are empty', () => {
    const summary = computeValidationSummary(createEmptyFormData());
    expect(summary.canSubmit).toBe(false);
    expect(summary.completionPercentage).toBe(0);
    expect(summary.missingSections).toHaveLength(MANDATORY_STEPS.length);
    const labels = summary.missingSections.map(s => s.stepLabel);
    expect(labels).toContain('Identity');
    expect(labels).toContain('Employment DNA');
    expect(labels).toContain('Compliance');
    expect(labels).toContain('Banking Details');
  });

  it('should allow submission when all mandatory steps pass', () => {
    const summary = computeValidationSummary(createFullFormData());
    expect(summary.canSubmit).toBe(true);
    expect(summary.completionPercentage).toBe(100);
    expect(summary.missingSections).toHaveLength(0);
  });

  it('should calculate partial completion correctly', () => {
    const data = createEmptyFormData();
    // Fill all of step 1
    data.firstName = 'Alex';
    data.lastName = 'Rivera';
    data.workEmail = 'alex@test.com';
    data.workPhone = '555-0199';
    data.gender = 'Male';
    data.dateOfBirth = '1990-01-01';
    // Leave steps 2, 3, 4 empty
    const summary = computeValidationSummary(data);
    expect(summary.canSubmit).toBe(false);
    // Step 1 has 6 required, steps 2+3+4 have 4+2+3 = 9 required. Total 15. Filled 6.
    expect(summary.completionPercentage).toBe(40);
    expect(summary.missingSections).toHaveLength(3);
  });

  it('should show each mandatory step with its specific errors', () => {
    const data = createEmptyFormData();
    data.firstName = 'Partial'; // step 1 partially filled
    const summary = computeValidationSummary(data);
    const step1Missing = summary.missingSections.find(s => s.stepNumber === 1);
    expect(step1Missing).toBeDefined();
    expect(step1Missing!.errors).toContain('Last Name');
    expect(step1Missing!.errors).not.toContain('First Name');
  });

  it('should report 100% even if optional steps are not filled', () => {
    const data = createFullFormData();
    data.skillsList = [];
    data.certificationsList = [];
    data.documentsList = [];
    data.buddyId = '';
    data.mentorId = '';
    data.hrbpId = '';
    const summary = computeValidationSummary(data);
    expect(summary.canSubmit).toBe(true);
    expect(summary.completionPercentage).toBe(100);
  });

  it('should not allow submission if user skips all fields and reaches review', () => {
    const summary = computeValidationSummary(createEmptyFormData());
    expect(summary.canSubmit).toBe(false);
    expect(summary.completionPercentage).toBe(0);
    // Every mandatory step should be flagged
    for (const stepNum of MANDATORY_STEPS) {
      const found = summary.missingSections.find(s => s.stepNumber === stepNum);
      expect(found).toBeDefined();
      expect(found!.errors.length).toBeGreaterThan(0);
    }
  });
});
