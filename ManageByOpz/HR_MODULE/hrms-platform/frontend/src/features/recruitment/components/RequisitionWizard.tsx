import React, { useState, useEffect } from 'react';
import { useGetFormDefinitionsQuery, useGetFieldDefinitionsQuery, useGetHiringReasonsQuery } from '../recruitmentConfigApi';
import { useLazySearchSkillsByQQuery, useCreateCustomSkillMutation } from '../recruitmentApi';
import { 
  useGetOrganizationsQuery, 
  useGetBusinessUnitsQuery, 
  useGetDivisionsQuery, 
  useGetDepartmentsQuery, 
  useGetTeamsQuery, 
  useGetLocationsQuery, 
  useGetGradesQuery, 
  useGetBandsQuery, 
  useGetDesignationsQuery 
} from '../../org-dna/orgDnaApi';
import { useGetEmployeesQuery } from '../../employees/employeesApi';
import { 
  Loader2, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  HelpCircle, 
  Briefcase, 
  IndianRupee, 
  FileText, 
  Users, 
  Award, 
  Sparkles, 
  Search, 
  Building2, 
  MapPin, 
  User, 
  Monitor, 
  Calendar, 
  Minus, 
  Plus, 
  Edit,
  X,
  AlertCircle
} from 'lucide-react';
import { formatCurrency } from '../../../utils/currencyFormatter';
import clsx from 'clsx';
import { DatePicker } from '../../employees/DatePicker';

interface RequisitionWizardProps {
  onSubmit: (
    values: Record<string, any>,
    customValues: Array<{ fieldDefinitionId: string; fieldValue: string }>,
    skills: Array<{ skillId?: string; skillName: string; isRequired: boolean }>
  ) => void;
  onCancel: () => void;
  currentUserId: string;
}

export function RequisitionWizard({ onSubmit, onCancel, currentUserId }: RequisitionWizardProps) {
  const { data: forms, isLoading: formsLoading } = useGetFormDefinitionsQuery();
  const formDef = forms?.find(f => f.formName === 'REQUISITION');

  const { data: fields, isLoading: fieldsLoading } = useGetFieldDefinitionsQuery(formDef?.id || '', {
    skip: !formDef?.id
  });

  const { data: hiringReasons } = useGetHiringReasonsQuery();
  const [triggerSearchSkills, { data: searchResults }] = useLazySearchSkillsByQQuery();
  const [createCustomSkill] = useCreateCustomSkillMutation();
  const [selectedSkills, setSelectedSkills] = useState<Array<{ id?: string; skillName: string; isRequired: boolean }>>([]);

  const [step, setStep] = useState(1);
  const [skillInput, setSkillInput] = useState('');

  // Tag-based input states
  const [prefSkillInput, setPrefSkillInput] = useState('');
  const [selectedPrefSkills, setSelectedPrefSkills] = useState<string[]>([]);
  const [certInput, setCertInput] = useState('');
  const [selectedCerts, setSelectedCerts] = useState<string[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState('STANDARD');

  // ── Cascading States for Org DNA ───────────
  const [selectedOrg, setSelectedOrg] = useState('');
  const [selectedDiv, setSelectedDiv] = useState('');

  const [formState, setFormState] = useState<Record<string, any>>({
    title: '',
    jobTitle: '',
    department: '',
    subDepartment: '',
    businessUnit: '',
    location: '',
    reportingManager: '',
    designation: '',
    grade: '',
    band: '',
    employmentType: 'FULL_TIME',
    workMode: 'OFFICE',
    vacancies: 1,
    minExperience: 0,
    maxExperience: 0,
    budget: 0,
    minBudget: 0,
    maxBudget: 0,
    costCenter: '',
    requiredSkills: '',
    preferredSkills: '',
    certifications: '',
    languages: '',
    education: '',
    hiringReason: 'NEW_POSITION',
    expectedJoiningDate: new Date().toISOString().split('T')[0],
    priority: 'MEDIUM',
    reasonForHiring: 'NEW_POSITION',
    replacementEmployee: '',
    replacementEmployeeId: '',
    replacementDate: '',
    businessJustification: '',
    projectName: '',
    expectedBusinessImpact: '',
    revenueImpact: '',
    riskNotFilled: '',
    additionalNotes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── Org DNA & Employee Queries ─────────────
  const { data: orgs } = useGetOrganizationsQuery();
  const { data: businessUnits } = useGetBusinessUnitsQuery(selectedOrg, { skip: !selectedOrg });
  const { data: divisions } = useGetDivisionsQuery(formState.businessUnit, { skip: !formState.businessUnit });
  const { data: departments } = useGetDepartmentsQuery(selectedDiv, { skip: !selectedDiv });
  const { data: teams } = useGetTeamsQuery(formState.department, { skip: !formState.department });
  const { data: locations } = useGetLocationsQuery(selectedOrg, { skip: !selectedOrg });
  const { data: grades } = useGetGradesQuery(selectedOrg, { skip: !selectedOrg });
  const { data: bands } = useGetBandsQuery(selectedOrg, { skip: !selectedOrg });
  const { data: designations } = useGetDesignationsQuery(selectedOrg, { skip: !selectedOrg });
  const { data: existingEmployees } = useGetEmployeesQuery();

  // Auto-select first Organization
  useEffect(() => {
    if (orgs && orgs.length > 0 && !selectedOrg) {
      setSelectedOrg(orgs[0].id);
    }
  }, [orgs, selectedOrg]);

  // ── Auto-populate Grade when Designation is selected ───────────────────
  useEffect(() => {
    if (formState.designation && designations && grades) {
      const selectedDesgObj = designations.find((d: any) => d.id === formState.designation);
      if (selectedDesgObj && selectedDesgObj.level !== undefined && selectedDesgObj.level !== null) {
        const matchingGrade = grades.find((g: any) => g.level === selectedDesgObj.level);
        if (matchingGrade) {
          handleChange('grade', matchingGrade.id);
        }
      }
    }
  }, [formState.designation, designations, grades]);

  // ── Auto-populate Band and Salary range when Grade is selected ──────────
  useEffect(() => {
    if (formState.grade && grades && bands) {
      const selectedGradeObj = grades.find((g: any) => g.id === formState.grade);
      if (selectedGradeObj) {
        const matchingBand = bands.find((b: any) => 
          (b.code && selectedGradeObj.code && b.code.toLowerCase() === selectedGradeObj.code.toLowerCase()) ||
          (b.name && selectedGradeObj.name && b.name.toLowerCase().includes(selectedGradeObj.name.toLowerCase()))
        ) || bands[0];
        
        if (matchingBand) {
          handleChange('band', matchingBand.id);
          if (matchingBand.minSalary !== undefined && matchingBand.minSalary !== null) {
            handleChange('minBudget', matchingBand.minSalary);
          }
          if (matchingBand.maxSalary !== undefined && matchingBand.maxSalary !== null) {
            handleChange('maxBudget', matchingBand.maxSalary);
          }
          if (matchingBand.minSalary !== undefined && matchingBand.maxSalary !== undefined) {
            handleChange('budget', Math.round((matchingBand.minSalary + matchingBand.maxSalary) / 2));
          }
        }
      }
    }
  }, [formState.grade, grades, bands]);

  useEffect(() => {
    if (fields) {
      const state: Record<string, any> = { ...formState };
      fields.forEach(f => {
        if (state[f.fieldKey] === undefined && f.defaultValue) {
          state[f.fieldKey] = f.defaultValue;
        }
      });
      setFormState(state);
    }
  }, [fields]);

  // Trigger search when input changes
  useEffect(() => {
    if (skillInput.trim()) {
      triggerSearchSkills(skillInput.trim());
    }
  }, [skillInput, triggerSearchSkills]);

  // Synchronize selectedSkills with formState.requiredSkills
  useEffect(() => {
    handleChange('requiredSkills', selectedSkills.map(s => s.skillName).join(', '));
  }, [selectedSkills]);

  const handleSelectSkill = (skill: any) => {
    if (!selectedSkills.some(s => s.skillName.toLowerCase() === skill.skillName.toLowerCase())) {
      setSelectedSkills(prev => [...prev, { id: skill.id, skillName: skill.skillName, isRequired: true }]);
      setErrors(prev => {
        const copy = { ...prev };
        delete copy.requiredSkills;
        return copy;
      });
    }
    setSkillInput('');
  };

  const handleRemoveSkill = (skillName: string) => {
    setSelectedSkills(prev => prev.filter(s => s.skillName !== skillName));
  };

  const handleCreateCustomSkill = async (name: string) => {
    if (!name.trim()) return;
    const trimmed = name.trim();
    if (selectedSkills.some(s => s.skillName.toLowerCase() === trimmed.toLowerCase())) {
      setSkillInput('');
      return;
    }
    try {
      const result = await createCustomSkill({ skillName: trimmed }).unwrap();
      const newSkill = {
        id: result.id || result.data?.id,
        skillName: result.skillName || result.data?.skillName || trimmed,
        isRequired: true
      };
      setSelectedSkills(prev => [...prev, newSkill]);
      setErrors(prev => {
        const copy = { ...prev };
        delete copy.requiredSkills;
        return copy;
      });
    } catch (err) {
      console.error("Failed to create custom skill, adding locally:", err);
      setSelectedSkills(prev => [...prev, { skillName: trimmed, isRequired: true }]);
      setErrors(prev => {
        const copy = { ...prev };
        delete copy.requiredSkills;
        return copy;
      });
    }
    setSkillInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (skillInput.trim()) {
        const trimmed = skillInput.trim();
        const exactMatch = searchResults?.find(s => s.skillName.toLowerCase() === trimmed.toLowerCase());
        if (exactMatch) {
          handleSelectSkill(exactMatch);
        } else {
          handleCreateCustomSkill(trimmed);
        }
      }
    }
  };

  if (formsLoading || fieldsLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-2" />
        <span className="text-sm text-gray-400">Initializing requisition wizard...</span>
      </div>
    );
  }

  // Filter out custom fields
  const standardKeys = Object.keys(formState);
  const customFields = fields?.filter(f => f.visible && !standardKeys.includes(f.fieldKey)) || [];

  const selectedOrgObj = orgs?.find((o: any) => o.id === selectedOrg);
  const selectedBUObj = businessUnits?.find((b: any) => b.id === formState.businessUnit);
  const selectedDivObj = divisions?.find((d: any) => d.id === selectedDiv);
  const selectedDeptObj = departments?.find((d: any) => d.id === formState.department);
  const selectedTeamObj = teams?.find((t: any) => t.id === formState.subDepartment);
  const selectedLocObj = locations?.find((l: any) => l.id === formState.location);
  const selectedDesgObj = designations?.find((d: any) => d.id === formState.designation);
  const selectedGradeObj = grades?.find((g: any) => g.id === formState.grade);
  const selectedBandObj = bands?.find((b: any) => b.id === formState.band);
  const selectedManagerObj = existingEmployees?.find((e: any) => e.id === formState.reportingManager);

  function handleChange(key: string, value: any) {
    setFormState(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    }
  }

  const handleOrgChange = (orgId: string) => {
    setSelectedOrg(orgId);
    setSelectedDiv('');
    handleChange('businessUnit', '');
    handleChange('department', '');
    handleChange('subDepartment', '');
    handleChange('location', '');
    handleChange('designation', '');
    handleChange('grade', '');
    handleChange('band', '');
  };

  const handleBUChange = (buId: string) => {
    handleChange('businessUnit', buId);
    setSelectedDiv('');
    handleChange('department', '');
    handleChange('subDepartment', '');
  };

  const handleDivChange = (divId: string) => {
    setSelectedDiv(divId);
    handleChange('department', '');
    handleChange('subDepartment', '');
  };

  const handleDeptChange = (deptId: string) => {
    handleChange('department', deptId);
    handleChange('subDepartment', '');
  };

  const handleAddPrefSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !selectedPrefSkills.includes(trimmed)) {
      const next = [...selectedPrefSkills, trimmed];
      setSelectedPrefSkills(next);
      setFormState(prev => ({ ...prev, preferredSkills: next.join(', ') }));
    }
    setPrefSkillInput('');
  };

  const handleRemovePrefSkill = (skill: string) => {
    const next = selectedPrefSkills.filter(s => s !== skill);
    setSelectedPrefSkills(next);
    setFormState(prev => ({ ...prev, preferredSkills: next.join(', ') }));
  };

  const handleAddCert = (cert: string) => {
    const trimmed = cert.trim();
    if (trimmed && !selectedCerts.includes(trimmed)) {
      const next = [...selectedCerts, trimmed];
      setSelectedCerts(next);
      setFormState(prev => ({ ...prev, certifications: next.join(', ') }));
    }
    setCertInput('');
  };

  const handleRemoveCert = (cert: string) => {
    const next = selectedCerts.filter(c => c !== cert);
    setSelectedCerts(next);
    setFormState(prev => ({ ...prev, certifications: next.join(', ') }));
  };

  const handleClearAll = () => {
    setFormState({
      title: '',
      jobTitle: '',
      department: '',
      subDepartment: '',
      businessUnit: '',
      location: '',
      reportingManager: '',
      designation: '',
      grade: '',
      band: '',
      employmentType: 'FULL_TIME',
      workMode: 'OFFICE',
      vacancies: 1,
      minExperience: 0,
      maxExperience: 0,
      budget: 0,
      minBudget: 0,
      maxBudget: 0,
      costCenter: '',
      requiredSkills: '',
      preferredSkills: '',
      certifications: '',
      languages: '',
      education: '',
      hiringReason: 'NEW_POSITION',
      expectedJoiningDate: new Date().toISOString().split('T')[0],
      priority: 'MEDIUM',
      reasonForHiring: 'NEW_POSITION',
      replacementEmployee: '',
      replacementEmployeeId: '',
      replacementDate: '',
      businessJustification: '',
      projectName: '',
      expectedBusinessImpact: '',
      revenueImpact: '',
      riskNotFilled: '',
      additionalNotes: ''
    });
    setSelectedSkills([]);
    setSelectedPrefSkills([]);
    setSelectedCerts([]);
    setSelectedWorkflow('STANDARD');
    setStep(1);
    setErrors({});
  };

  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formState.title) newErrors.title = 'Requisition title is required';
      if (!formState.department) newErrors.department = 'Department is required';
      if (!formState.designation) newErrors.designation = 'Designation is required';
      if (!formState.vacancies || formState.vacancies < 1) newErrors.vacancies = 'Vacancies must be at least 1';
    } else if (currentStep === 2) {
      if (selectedSkills.length === 0) newErrors.requiredSkills = 'Required skills are required';
    } else if (currentStep === 3) {
      if (!formState.budget || formState.budget <= 0) newErrors.budget = 'Target budget is required';
      if (!formState.businessJustification) newErrors.businessJustification = 'Business justification is required';
      if (formState.reasonForHiring === 'REPLACEMENT') {
        if (!formState.replacementEmployee) newErrors.replacementEmployee = 'Replacement employee name is required';
      }
    } else if (currentStep === 4) {
      customFields.forEach(f => {
        if (f.required && !formState[f.fieldKey]) {
          newErrors[f.fieldKey] = `${f.fieldLabel} is required`;
        }
      });
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(4)) return;

    const standardValues: Record<string, any> = {};
    const customValuesList: Array<{ fieldDefinitionId: string; fieldValue: string }> = [];

    // Map standard values
    standardKeys.forEach(key => {
      standardValues[key] = formState[key];
    });

    // Populate custom field values list
    if (fields) {
      fields.forEach(f => {
        if (!standardKeys.includes(f.fieldKey)) {
          const val = formState[f.fieldKey] !== undefined ? String(formState[f.fieldKey]) : '';
          customValuesList.push({
            fieldDefinitionId: f.id!,
            fieldValue: val
          });
        }
      });
    }

    onSubmit(standardValues, customValuesList, selectedSkills.map(s => ({ skillId: s.id, skillName: s.skillName, isRequired: s.isRequired })));
  };

  const renderCustomFieldInput = (field: any) => {
    const isError = !!errors[field.fieldKey];

    return (
      <div key={field.id} className="flex flex-col space-y-1">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center justify-between">
          <span>
            {field.fieldLabel}
            {field.required && <span className="text-rose-500 ml-1">*</span>}
          </span>
          {isError && <span className="text-[9px] text-rose-500 font-medium">{errors[field.fieldKey]}</span>}
        </label>

        {field.fieldType === 'textarea' ? (
          <textarea
            value={formState[field.fieldKey] || ''}
            onChange={e => handleChange(field.fieldKey, e.target.value)}
            disabled={field.readOnly}
            rows={2}
            className={`bg-slate-50 dark:bg-slate-900 border ${
              isError ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200 dark:border-slate-800 focus:ring-indigo-500'
            } rounded-xl px-3 py-1.5 text-xs outline-none focus:ring-2 transition-all dark:text-white`}
            placeholder={`Enter ${field.fieldLabel.toLowerCase()}...`}
          />
        ) : (
          <input
            type={field.fieldType === 'number' ? 'number' : field.fieldType === 'date' ? 'date' : 'text'}
            value={formState[field.fieldKey] || ''}
            onChange={e => handleChange(field.fieldKey, e.target.value)}
            disabled={field.readOnly}
            className={`bg-slate-50 dark:bg-slate-900 border ${
              isError ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200 dark:border-slate-800 focus:ring-indigo-500'
            } rounded-xl px-3 py-1.5 text-xs outline-none focus:ring-2 transition-all dark:text-white`}
            placeholder={`Enter ${field.fieldLabel.toLowerCase()}...`}
          />
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 text-xs select-none">
      
      {/* ── 5-STEP INDICATOR BOARD ── */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-4">
        {[
          { title: 'Position Details', desc: 'Job, Org & Team', num: 1 },
          { title: 'Candidate Requirements', desc: 'Skills & Education', num: 2 },
          { title: 'Budget & Justification', desc: 'Costs & Reason', num: 3 },
          { title: 'Approvals & Workflow', desc: 'Routing Matrix', num: 4 },
          { title: 'Review & Submit', desc: 'Final Sign-off', num: 5 }
        ].map((s, idx) => (
          <React.Fragment key={s.num}>
            <div className="flex items-center gap-2">
              <span
                className={clsx(
                  "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border transition-all duration-300",
                  step === s.num
                    ? "bg-indigo-600 text-white border-indigo-750 shadow-md shadow-indigo-500/20"
                    : step > s.num
                    ? "bg-emerald-500 text-white border-emerald-600"
                    : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400"
                )}
              >
                {step > s.num ? '✓' : s.num}
              </span>
              <div>
                <span className={clsx("block text-[10px] font-extrabold", step === s.num ? "text-indigo-650 dark:text-indigo-400" : "text-slate-400")}>
                  {s.title}
                </span>
                <span className="block text-[8px] text-slate-400 font-bold tracking-tight">{s.desc}</span>
              </div>
            </div>
            {idx < 4 && (
              <div
                className={clsx(
                  "flex-1 h-0.5 mx-2 rounded transition-all duration-300",
                  step > s.num ? "bg-indigo-600" : "bg-slate-200 dark:bg-slate-800"
                )}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* ── TWO-COLUMN SPLIT WORKSPACE ── */}
      <div className="grid grid-cols-12 gap-6 h-[440px] overflow-hidden">
        
        {/* LEFT COLUMN: Requisition Summary Side panel (25% width) */}
        <div className="col-span-3 bg-slate-50/50 dark:bg-[#0B0F19]/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 flex flex-col justify-between h-full">
          <div>
            <h4 className="text-[10px] font-black tracking-wider text-slate-400 dark:text-slate-500 uppercase mb-4">Requisition Summary</h4>
            <div className="space-y-3.5">
              <div>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-wide">Requisition Title</span>
                <p className="font-extrabold text-slate-700 dark:text-slate-200 truncate mt-0.5">{formState.title || 'e.g. Senior Backend Engineer'}</p>
              </div>
              <div>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-wide">Department</span>
                <p className="font-extrabold text-slate-700 dark:text-slate-200 truncate mt-0.5">{selectedDeptObj?.name || 'Select Department'}</p>
              </div>
              <div>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-wide">Vacancies</span>
                <p className="font-extrabold text-slate-700 dark:text-slate-200 mt-0.5">{formState.vacancies}</p>
              </div>
              <div>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-wide">Budget</span>
                <p className="font-extrabold text-slate-700 dark:text-slate-200 mt-0.5">{formatCurrency(formState.budget ?? 0)}</p>
              </div>
              <div>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-wide">Priority</span>
                <div className="mt-1">
                  <span className={clsx(
                    "px-2 py-0.5 rounded-full text-[8px] font-black uppercase border",
                    formState.priority === 'HIGH' ? 'bg-red-50 text-red-655 border-red-200 dark:bg-red-950/20' :
                    formState.priority === 'MEDIUM' ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/20' :
                    'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900/40'
                  )}>
                    {formState.priority}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-wide">Status</span>
                <div className="mt-1">
                  <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase border bg-blue-50 text-blue-650 border-blue-200 dark:bg-blue-950/20">
                    DRAFT
                  </span>
                </div>
              </div>
              <div>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-wide">Hiring Reason</span>
                <p className="font-extrabold text-slate-700 dark:text-slate-200 truncate mt-0.5">{formState.reasonForHiring === 'NEW_POSITION' ? 'New Position' : 'Replacement'}</p>
              </div>
              <div>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-wide">Target Joining</span>
                <p className="font-extrabold text-slate-700 dark:text-slate-200 mt-0.5">{formState.expectedJoiningDate || 'Immediate'}</p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClearAll}
            className="w-full flex items-center justify-center gap-1.5 py-2 border border-slate-200 hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-300 font-bold rounded-xl transition"
          >
            <Edit size={12} /> Clear All
          </button>
        </div>

        {/* RIGHT COLUMN: Specifications card & inputs (75% width) */}
        <div className="col-span-9 flex flex-col h-full bg-white dark:bg-[#0B0F19]/40 border border-slate-250/60 dark:border-slate-800 rounded-2xl overflow-hidden p-5 space-y-4">
          
          {/* Card Header Info */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-650 rounded-lg">
                <Sparkles size={16} />
              </div>
              <div>
                <h3 className="font-black text-slate-800 dark:text-white leading-snug">
                  {step === 1 && 'Step 1: Position Details'}
                  {step === 2 && 'Step 2: Candidate Requirements'}
                  {step === 3 && 'Step 3: Budget & Justification'}
                  {step === 4 && 'Step 4: Approvals & Workflow'}
                  {step === 5 && 'Step 5: Review & Submit'}
                </h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                  {step === 1 && 'Provide position details, select team, reporting manager and location.'}
                  {step === 2 && 'Outline the experience levels, required skills, and education.'}
                  {step === 3 && 'Provide cost centers, target budgets, and justification statements.'}
                  {step === 4 && 'Configure approval routes and dynamic custom fields.'}
                  {step === 5 && 'Verify all details and route this requisition for approval steps.'}
                </p>
              </div>
            </div>
            <a href="#help" className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:underline">
              <HelpCircle size={13} /> Need help?
            </a>
          </div>

          {/* Form scroll area */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-4">
            
            {/* ── STEP 1: ROLE & TEAM ── */}
            {step === 1 && (
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 animate-fade-in">
                
                <div className="flex flex-col space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Requisition Title *</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formState.title}
                      onChange={e => handleChange('title', e.target.value)}
                      className={clsx(
                        "w-full bg-slate-50 dark:bg-slate-900 border rounded-xl pl-3 pr-8 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white font-medium",
                        errors.title ? "border-rose-500" : "border-slate-200 dark:border-slate-800"
                      )}
                      placeholder="e.g. Senior Backend Engineer"
                    />
                    <Sparkles className="absolute right-3 top-2.5 text-indigo-500 w-4.5 h-4.5" />
                  </div>
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Job Title (External)</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formState.jobTitle}
                      onChange={e => handleChange('jobTitle', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-3 pr-8 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white font-medium"
                      placeholder="Search or type job title"
                    />
                    <Search className="absolute right-3 top-2.5 text-slate-400 w-4.5 h-4.5" />
                  </div>
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Organization *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400"><Building2 size={13} /></span>
                    <select
                      value={selectedOrg}
                      onChange={e => handleOrgChange(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white font-medium cursor-pointer"
                    >
                      <option value="">Select Organization</option>
                      {(orgs || []).map((o: any) => (
                        <option key={o.id} value={o.id}>{o.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Business Unit</label>
                  <select
                    value={formState.businessUnit}
                    onChange={e => handleBUChange(e.target.value)}
                    disabled={!selectedOrg}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white font-medium disabled:opacity-50 cursor-pointer"
                  >
                    <option value="">Select Business Unit</option>
                    {(businessUnits || []).map((b: any) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Division</label>
                  <select
                    value={selectedDiv}
                    onChange={e => handleDivChange(e.target.value)}
                    disabled={!formState.businessUnit}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white font-medium disabled:opacity-50 cursor-pointer"
                  >
                    <option value="">Select Division</option>
                    {(divisions || []).map((d: any) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Department *</label>
                  <select
                    value={formState.department}
                    onChange={e => handleDeptChange(e.target.value)}
                    disabled={!selectedDiv}
                    className={clsx(
                      "w-full bg-slate-50 dark:bg-slate-900 border rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white font-medium disabled:opacity-50 cursor-pointer",
                      errors.department ? "border-rose-500" : "border-slate-200 dark:border-slate-800"
                    )}
                  >
                    <option value="">Select Department</option>
                    {(departments || []).map((d: any) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Sub-Department / Team</label>
                  <select
                    value={formState.subDepartment}
                    onChange={e => handleChange('subDepartment', e.target.value)}
                    disabled={!formState.department}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white font-medium disabled:opacity-50 cursor-pointer"
                  >
                    <option value="">Select Sub-Department / Team</option>
                    {(teams || []).map((t: any) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Location</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400"><MapPin size={13} /></span>
                    <select
                      value={formState.location}
                      onChange={e => handleChange('location', e.target.value)}
                      disabled={!selectedOrg}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white font-medium disabled:opacity-50 cursor-pointer"
                    >
                      <option value="">Select Location</option>
                      {(locations || []).map((l: any) => (
                        <option key={l.id} value={l.id}>{l.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Designation *</label>
                  <select
                    value={formState.designation}
                    onChange={e => handleChange('designation', e.target.value)}
                    disabled={!selectedOrg}
                    className={clsx(
                      "w-full bg-slate-50 dark:bg-slate-900 border rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white font-medium disabled:opacity-50 cursor-pointer",
                      errors.designation ? "border-rose-500" : "border-slate-200 dark:border-slate-800"
                    )}
                  >
                    <option value="">Select Designation</option>
                    {(designations || []).map((d: any) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Reporting Manager</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400"><User size={13} /></span>
                    <select
                      value={formState.reportingManager}
                      onChange={e => handleChange('reportingManager', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white font-medium cursor-pointer"
                    >
                      <option value="">Search manager by name or ID</option>
                      {(existingEmployees || []).map((emp: any) => (
                        <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} ({emp.employeeCode})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Grade</label>
                  <select
                    value={formState.grade}
                    onChange={e => handleChange('grade', e.target.value)}
                    disabled={!selectedOrg}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white font-medium disabled:opacity-50 cursor-pointer"
                  >
                    <option value="">Select Grade</option>
                    {(grades || []).map((g: any) => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Band</label>
                  <select
                    value={formState.band}
                    onChange={e => handleChange('band', e.target.value)}
                    disabled={!selectedOrg}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white font-medium disabled:opacity-50 cursor-pointer"
                  >
                    <option value="">Select Band</option>
                    {(bands || []).map((b: any) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Employment Type *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400"><Briefcase size={13} /></span>
                    <select
                      value={formState.employmentType}
                      onChange={e => handleChange('employmentType', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white font-medium cursor-pointer"
                    >
                      <option value="FULL_TIME">Full Time</option>
                      <option value="PART_TIME">Part Time</option>
                      <option value="CONTRACT">Contract</option>
                      <option value="INTERN">Intern</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Work Model *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400"><Monitor size={13} /></span>
                    <select
                      value={formState.workMode}
                      onChange={e => handleChange('workMode', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white font-medium cursor-pointer"
                    >
                      <option value="OFFICE">Office-bound</option>
                      <option value="HYBRID">Hybrid</option>
                      <option value="REMOTE">Fully Remote</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Vacancies *</label>
                  <div className="relative flex items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs">
                    <Users size={13} className="text-slate-400 mr-2 shrink-0" />
                    <span className="font-bold flex-1 text-slate-700 dark:text-white">{formState.vacancies}</span>
                    <div className="flex gap-2.5 ml-2 border-l border-slate-200 dark:border-slate-800 pl-2 shrink-0">
                      <button 
                        type="button" 
                        onClick={() => handleChange('vacancies', Math.max(1, formState.vacancies - 1))}
                        className="text-slate-450 hover:text-slate-700 transition"
                      >
                        <Minus size={11} />
                      </button>
                      <button 
                        type="button" 
                        onClick={() => handleChange('vacancies', formState.vacancies + 1)}
                        className="text-slate-450 hover:text-slate-700 transition"
                      >
                        <Plus size={11} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-1">
                  <DatePicker
                    label="Target Joining Date *"
                    value={formState.expectedJoiningDate}
                    onChange={v => handleChange('expectedJoiningDate', v)}
                  />
                </div>

              </div>
            )}

            {/* ── STEP 2: CANDIDATE SPECS ── */}
            {step === 2 && (
              <div className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Min Experience (Years)</label>
                    <input
                      type="number"
                      min="0"
                      value={formState.minExperience}
                      onChange={e => handleChange('minExperience', Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                    />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Max Experience (Years)</label>
                    <input
                      type="number"
                      min="0"
                      value={formState.maxExperience}
                      onChange={e => handleChange('maxExperience', Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex flex-col space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase flex justify-between">
                    <span>Required Technical Skills *</span>
                    {errors.requiredSkills && <span className="text-[9px] text-rose-500 font-medium">{errors.requiredSkills}</span>}
                  </label>

                  {/* Selected skills as tags */}
                  {selectedSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                      {selectedSkills.map((skill) => (
                        <span key={skill.skillName} className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 border border-indigo-500/20 rounded-xl">
                          {skill.skillName}
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill.skillName)}
                            className="text-slate-400 hover:text-rose-500 font-bold ml-1 text-xs"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-[10px] text-slate-400 italic p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                      No skills selected. Use the search input below to add skills.
                    </div>
                  )}

                  {/* Searchable input */}
                  <div className="relative">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={e => setSkillInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type to search skills or type custom skill and press Enter..."
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                    />
                    {skillInput.trim().length > 0 && (
                      <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 max-h-40 overflow-y-auto divide-y divide-slate-150 dark:divide-slate-800">
                        {searchResults && searchResults.map((s: any) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => handleSelectSkill(s)}
                            className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850 transition flex items-center justify-between"
                          >
                            <span>{s.skillName}</span>
                            <span className="text-[9px] text-gray-400 italic">({s.category || 'General'})</span>
                          </button>
                        ))}
                        {(!searchResults || !searchResults.some(s => s.skillName.toLowerCase() === skillInput.trim().toLowerCase())) && (
                          <button
                            type="button"
                            onClick={() => handleCreateCustomSkill(skillInput)}
                            className="w-full text-left px-3 py-2.5 text-xs text-indigo-650 dark:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-850 transition font-bold"
                          >
                            + Create Custom Skill "{skillInput.trim()}"
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Preferred/Bonus Skills</label>
                  {selectedPrefSkills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                      {selectedPrefSkills.map((ps) => (
                        <span key={ps} className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold bg-purple-500/10 text-purple-650 dark:text-purple-400 border border-purple-500/20 rounded-xl">
                          {ps}
                          <button
                            type="button"
                            onClick={() => handleRemovePrefSkill(ps)}
                            className="text-slate-400 hover:text-rose-500 font-bold ml-1 text-xs"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <input
                    type="text"
                    value={prefSkillInput}
                    onChange={e => setPrefSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (prefSkillInput.trim()) {
                          handleAddPrefSkill(prefSkillInput);
                        }
                      }
                    }}
                    placeholder="Type preferred skill and press Enter..."
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Education Qualification</label>
                    <select
                      value={formState.education}
                      onChange={e => handleChange('education', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white font-bold cursor-pointer"
                    >
                      <option value="">Select Education...</option>
                      <option value="Bachelor Degree">Bachelor Degree</option>
                      <option value="Master Degree">Master Degree</option>
                      <option value="MBA">MBA</option>
                      <option value="PhD">PhD</option>
                      <option value="Diploma">Diploma</option>
                    </select>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Certifications</label>
                    {selectedCerts.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                        {selectedCerts.map((cert) => (
                          <span key={cert} className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold bg-teal-500/10 text-teal-650 dark:text-teal-400 border border-teal-500/20 rounded-xl">
                            {cert}
                            <button
                              type="button"
                              onClick={() => handleRemoveCert(cert)}
                              className="text-slate-400 hover:text-rose-500 font-bold ml-1 text-xs"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    <input
                      type="text"
                      value={certInput}
                      onChange={e => setCertInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (certInput.trim()) {
                            handleAddCert(certInput);
                          }
                        }
                      }}
                      placeholder="Type certification and press Enter..."
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 3: JUSTIFICATION & BUDGET ── */}
            {step === 3 && (
              <div className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Min Budget (₹) *</label>
                    <input
                      type="number"
                      min="0"
                      value={formState.minBudget}
                      onChange={e => handleChange('minBudget', Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                    />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Max Budget (₹) *</label>
                    <input
                      type="number"
                      min="0"
                      value={formState.maxBudget}
                      onChange={e => handleChange('maxBudget', Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                    />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Average Budget (₹) *</label>
                    <input
                      type="number"
                      min="0"
                      value={formState.budget}
                      onChange={e => handleChange('budget', Number(e.target.value))}
                      className={clsx(
                        "w-full bg-slate-50 dark:bg-slate-900 border rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white",
                        errors.budget ? "border-rose-500" : "border-slate-200 dark:border-slate-800"
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Cost Center</label>
                    <input
                      type="text"
                      value={formState.costCenter}
                      onChange={e => handleChange('costCenter', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                      placeholder="e.g. ENG-2026"
                    />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Hiring Reason</label>
                    <select
                      value={formState.reasonForHiring}
                      onChange={e => handleChange('reasonForHiring', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white font-medium cursor-pointer"
                    >
                      <option value="">Select Reason</option>
                      {hiringReasons?.map(reason => (
                        <option key={reason.id} value={reason.reasonCode}>
                          {reason.reasonName}
                        </option>
                      ))}
                      {(!hiringReasons || hiringReasons.length === 0) && (
                        <>
                          <option value="NEW_POSITION">New Headcount</option>
                          <option value="REPLACEMENT">Backfill / Replacement</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                {formState.reasonForHiring === 'REPLACEMENT' && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl grid grid-cols-3 gap-3 animate-fade-in">
                    <div className="flex flex-col space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Replacement For *</label>
                      <input
                        type="text"
                        value={formState.replacementEmployee}
                        onChange={e => handleChange('replacementEmployee', e.target.value)}
                        className={clsx(
                          "w-full bg-slate-50 dark:bg-slate-900 border rounded-xl px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white",
                          errors.replacementEmployee ? "border-rose-500" : "border-slate-200 dark:border-slate-800"
                        )}
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Employee ID</label>
                      <input
                        type="text"
                        value={formState.replacementEmployeeId}
                        onChange={e => handleChange('replacementEmployeeId', e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                        placeholder="EMP-1002"
                      />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <DatePicker
                        label="Exit Date"
                        value={formState.replacementDate}
                        onChange={v => handleChange('replacementDate', v)}
                      />
                    </div>
                  </div>
                )}

                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Project Name / Context</label>
                  <input
                    type="text"
                    value={formState.projectName}
                    onChange={e => handleChange('projectName', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                    placeholder="e.g. Project Phoenix"
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Business Justification *</label>
                  <textarea
                    value={formState.businessJustification}
                    onChange={e => handleChange('businessJustification', e.target.value)}
                    rows={2}
                    className={clsx(
                      "w-full bg-slate-50 dark:bg-slate-900 border rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white",
                      errors.businessJustification ? "border-rose-500" : "border-slate-200 dark:border-slate-800"
                    )}
                    placeholder="Explain why this headcount is required..."
                  />
                </div>
              </div>
            )}

            {/* ── STEP 4: APPROVALS & WORKFLOW ── */}
            {step === 4 && (
              <div className="space-y-6 animate-fade-in">
                {/* Render Custom Fields first if they exist */}
                {customFields.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Dynamic Requisition Fields</h4>
                    <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100 dark:border-slate-805">
                      {customFields.map(renderCustomFieldInput)}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100 dark:border-slate-800">
                    <Award size={14} className="text-indigo-650" />
                    <h4 className="text-[10px] font-black text-slate-450 uppercase tracking-wider">Approval Matrix & Routing Workflow</h4>
                  </div>

                  <div className="flex flex-col space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Select Workflow Routing Route</label>
                    <select
                      value={selectedWorkflow}
                      onChange={e => setSelectedWorkflow(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white font-bold cursor-pointer"
                    >
                      <option value="STANDARD">Standard Hiring Route (Hiring Manager + HR Comp)</option>
                      <option value="EXECUTIVE">Executive / Leadership Sign-Off (Dept Head + VP + CFO)</option>
                      <option value="TECHNICAL">Technical Engineering Path (Tech Lead + VP Eng + HR)</option>
                    </select>
                  </div>

                  {/* Workflow routing preview visualizer */}
                  <div className="bg-slate-50 dark:bg-slate-900/30 border border-slate-200/60 dark:border-slate-800/80 rounded-xl p-4 space-y-3">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Routing Chain Preview</span>
                    
                    {selectedWorkflow === 'STANDARD' && (
                      <div className="grid grid-cols-4 gap-3 relative pt-2">
                        {[
                          { step: 1, name: 'Requisition Creator', role: 'Hiring Manager', status: 'INITIATED' },
                          { step: 2, name: 'Department Head', role: 'Approval Owner', status: 'PENDING' },
                          { step: 3, name: 'Compensation Board', role: 'Budget Partner', status: 'QUEUED' },
                          { step: 4, name: 'HR Recruiter', role: 'Job Publisher', status: 'QUEUED' }
                        ].map((node) => (
                          <div key={node.step} className="bg-white dark:bg-[#0B0F19] p-3 rounded-lg border border-slate-200/80 dark:border-slate-800/80 text-center relative z-10">
                            <span className={clsx(
                              "w-5 h-5 rounded-full mx-auto flex items-center justify-center text-[9px] font-bold text-white mb-2",
                              node.status === 'INITIATED' ? 'bg-indigo-650' :
                              node.status === 'PENDING' ? 'bg-amber-500' : 'bg-slate-250 dark:bg-slate-800 text-slate-400'
                            )}>
                              {node.step}
                            </span>
                            <p className="font-extrabold text-[10px] truncate">{node.name}</p>
                            <p className="text-[8px] text-slate-400 font-bold uppercase mt-0.5">{node.role}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {selectedWorkflow === 'EXECUTIVE' && (
                      <div className="grid grid-cols-4 gap-3 relative pt-2">
                        {[
                          { step: 1, name: 'Requisition Creator', role: 'Hiring Manager', status: 'INITIATED' },
                          { step: 2, name: 'Department Head', role: 'Approval Owner', status: 'PENDING' },
                          { step: 3, name: 'VP / Director', role: 'Executive Signoff', status: 'QUEUED' },
                          { step: 4, name: 'Chief Financial Officer', role: 'Finance Partner', status: 'QUEUED' }
                        ].map((node) => (
                          <div key={node.step} className="bg-white dark:bg-[#0B0F19] p-3 rounded-lg border border-slate-200/80 dark:border-slate-800/80 text-center relative z-10">
                            <span className={clsx(
                              "w-5 h-5 rounded-full mx-auto flex items-center justify-center text-[9px] font-bold text-white mb-2",
                              node.status === 'INITIATED' ? 'bg-indigo-650' :
                              node.status === 'PENDING' ? 'bg-amber-500' : 'bg-slate-250 dark:bg-slate-800 text-slate-400'
                            )}>
                              {node.step}
                            </span>
                            <p className="font-extrabold text-[10px] truncate">{node.name}</p>
                            <p className="text-[8px] text-slate-400 font-bold uppercase mt-0.5">{node.role}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {selectedWorkflow === 'TECHNICAL' && (
                      <div className="grid grid-cols-4 gap-3 relative pt-2">
                        {[
                          { step: 1, name: 'Requisition Creator', role: 'Hiring Manager', status: 'INITIATED' },
                          { step: 2, name: 'Tech Lead / Principal', role: 'Technical Evaluator', status: 'PENDING' },
                          { step: 3, name: 'VP of Engineering', role: 'Executive Signoff', status: 'QUEUED' },
                          { step: 4, name: 'HR Recruiter', role: 'Job Publisher', status: 'QUEUED' }
                        ].map((node) => (
                          <div key={node.step} className="bg-white dark:bg-[#0B0F19] p-3 rounded-lg border border-slate-200/80 dark:border-slate-800/80 text-center relative z-10">
                            <span className={clsx(
                              "w-5 h-5 rounded-full mx-auto flex items-center justify-center text-[9px] font-bold text-white mb-2",
                              node.status === 'INITIATED' ? 'bg-indigo-650' :
                              node.status === 'PENDING' ? 'bg-amber-500' : 'bg-slate-250 dark:bg-slate-800 text-slate-400'
                            )}>
                              {node.step}
                            </span>
                            <p className="font-extrabold text-[10px] truncate">{node.name}</p>
                            <p className="text-[8px] text-slate-400 font-bold uppercase mt-0.5">{node.role}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 5: REVIEW BRIEF ── */}
            {step === 5 && (
              <div className="bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-4 animate-fade-in">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-250 dark:border-slate-800">Requisition Preview Details</h4>
                <div className="grid grid-cols-3 gap-y-3.5 gap-x-4">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Position Title</span>
                    <p className="font-extrabold mt-0.5 text-slate-800 dark:text-white truncate">{formState.title || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Job Title (Ext)</span>
                    <p className="font-extrabold mt-0.5 text-slate-800 dark:text-white truncate">{formState.jobTitle || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Organization</span>
                    <p className="font-extrabold mt-0.5 text-slate-800 dark:text-white truncate">{selectedOrgObj?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Business Unit</span>
                    <p className="font-extrabold mt-0.5 text-slate-800 dark:text-white truncate">{selectedBUObj?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Division</span>
                    <p className="font-extrabold mt-0.5 text-slate-800 dark:text-white truncate">{selectedDivObj?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Department</span>
                    <p className="font-extrabold mt-0.5 text-slate-800 dark:text-white truncate">{selectedDeptObj?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Sub-Dept / Team</span>
                    <p className="font-extrabold mt-0.5 text-slate-800 dark:text-white truncate">{selectedTeamObj?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Location</span>
                    <p className="font-extrabold mt-0.5 text-slate-800 dark:text-white truncate">{selectedLocObj?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Designation</span>
                    <p className="font-extrabold mt-0.5 text-slate-800 dark:text-white truncate">{selectedDesgObj?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Reporting Manager</span>
                    <p className="font-extrabold mt-0.5 text-slate-800 dark:text-white truncate">
                      {selectedManagerObj ? `${selectedManagerObj.firstName} ${selectedManagerObj.lastName}` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Vacancies</span>
                    <p className="font-extrabold mt-0.5 text-slate-800 dark:text-white">{formState.vacancies} Head(s)</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Employment Type</span>
                    <p className="font-extrabold mt-0.5 text-slate-800 dark:text-white">{formState.employmentType}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Target Budget</span>
                    <p className="font-extrabold mt-0.5 text-slate-800 dark:text-white">{formatCurrency(Number(formState.budget))}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Hiring Reason</span>
                    <p className="font-extrabold mt-0.5 text-slate-800 dark:text-white">
                      {formState.reasonForHiring === 'NEW_POSITION' ? 'New Headcount' : 'Replacement'}
                    </p>
                  </div>
                  <div className="col-span-3">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Required Technical Skills</span>
                    <p className="font-medium mt-0.5 text-slate-655 dark:text-slate-300 line-clamp-2">{formState.requiredSkills || 'None specified'}</p>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* ── FOOTER ACTIONS ── */}
      <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-850 shrink-0">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="text-[11px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition px-3 py-2"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleClearAll}
            className="text-[11px] font-bold text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl px-4 py-2 transition"
          >
            Save Draft
          </button>
        </div>

        <div className="flex gap-2">
          {step > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-600 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            >
              <ArrowLeft size={13} /> Back
            </button>
          )}

          {step < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1.5 px-4.5 py-2 text-xs font-bold text-white bg-indigo-650 hover:bg-indigo-750 rounded-xl shadow-sm transition"
            >
              Save & Next <ArrowRight size={13} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-indigo-650 hover:bg-indigo-750 rounded-xl shadow-md transition"
            >
              Submit Requisition <CheckCircle size={13} />
            </button>
          )}
        </div>
      </div>

    </div>
  );
}
