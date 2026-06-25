import { useState, useMemo } from 'react';
import { computeValidationSummary, type OnboardingFormData, type StepStatus } from './onboardingValidation';
import { PhoneInput } from './PhoneInput';
import { DatePicker } from './DatePicker';
import { useOnboardEmployeeMutation, useGetEmployeesQuery, useGetNextEmployeeCodeQuery } from './employeesApi';
import { 
  useGetOrganizationsQuery, 
  useGetBusinessUnitsQuery, 
  useGetDivisionsQuery, 
  useGetDepartmentsQuery, 
  useGetLocationsQuery, 
  useGetGradesQuery, 
  useGetBandsQuery 
} from '../org-dna/orgDnaApi';
import { 
  User, Briefcase, ShieldCheck, Award, FileText, Network, Clock, X, Plus, Trash2, CheckCircle2, Sparkles, Upload,
  Mail, Phone, Calendar, Building2, Globe, Fingerprint, MapPin, CreditCard, Info, ChevronDown, ChevronLeft, ChevronRight, Check, UploadCloud, Landmark, AlertTriangle
} from 'lucide-react';

interface WizardProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function EmployeeOnboardingWizard({ onClose, onSuccess }: WizardProps) {
  const [step, setStep] = useState(1);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  
  // ── Step 1: Identity ────────────────────────
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [workEmail, setWorkEmail] = useState('');
  const [personalEmail, setPersonalEmail] = useState('');
  const [workPhone, setWorkPhone] = useState('');
  const [personalPhone, setPersonalPhone] = useState('');
  const [workPhoneError, setWorkPhoneError] = useState<string | null>(null);
  const [personalPhoneError, setPersonalPhoneError] = useState<string | null>(null);
  const [gender, setGender] = useState('Male');
  const [dateOfBirth, setDateOfBirth] = useState('');

  // ── Step 2: Employment DNA ──────────────────
  const [employeeCode] = useState('AUTO-GENERATED');
  const [dateOfJoining, setDateOfJoining] = useState('');
  const [selectedOrg, setSelectedOrg] = useState('');
  const [selectedBU, setSelectedBU] = useState('');
  const [selectedDiv, setSelectedDiv] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedLoc, setSelectedLoc] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedBand, setSelectedBand] = useState('');
  const [managerId, setManagerId] = useState('');
  const [workMode, setWorkMode] = useState('HYBRID');
  const [designation, setDesignation] = useState('');
  const [employmentType, setEmploymentType] = useState('');

  // ── Step 3: Compliance ──────────────────────
  const [panNumber, setPanNumber] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [uanNumber, setUanNumber] = useState('');
  const [esicNumber, setEsicNumber] = useState('');

  // ── Step 4: Banking ─────────────────────────
  const [bankName, setBankName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankIfsc, setBankIfsc] = useState('');

  // ── Step 5: Skills & Certifications ─────────
  const [skillsList, setSkillsList] = useState<any[]>([]);
  const [certificationsList, setCertificationsList] = useState<any[]>([]);
  // Local sub-form states
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory] = useState<'TECHNICAL' | 'FUNCTIONAL' | 'SOFT'>('TECHNICAL');
  const [newSkillLevel, setNewSkillLevel] = useState('INTERMEDIATE');
  
  const [newCertName, setNewCertName] = useState('');
  const [newCertAuthority, setNewCertAuthority] = useState('');
  const [newCertDate, setNewCertDate] = useState('');

  // ── Step 6: Documents ───────────────────────
  const [documentsList, setDocumentsList] = useState<any[]>([]);

  // ── Step 7: Relationships ───────────────────
  const [buddyId, setBuddyId] = useState('');
  const [mentorId, setMentorId] = useState('');
  const [hrbpId, setHrbpId] = useState('');
  const [skipManagerId, setSkipManagerId] = useState('');
  const [departmentHeadId, setDepartmentHeadId] = useState('');

  // ── Cascading Queries for Org DNA ───────────
  const { data: orgs } = useGetOrganizationsQuery();
  const { data: businessUnits } = useGetBusinessUnitsQuery(selectedOrg, { skip: !selectedOrg });
  const { data: divisions } = useGetDivisionsQuery(selectedBU, { skip: !selectedBU });
  const { data: departments } = useGetDepartmentsQuery(selectedDiv, { skip: !selectedDiv });
  const { data: locations } = useGetLocationsQuery(selectedOrg, { skip: !selectedOrg });
  const { data: grades } = useGetGradesQuery(selectedOrg, { skip: !selectedOrg });
  const { data: bands } = useGetBandsQuery(selectedOrg, { skip: !selectedOrg });
  const { data: existingEmployees } = useGetEmployeesQuery();
  const { data: nextEmployeeCode } = useGetNextEmployeeCodeQuery(selectedOrg, { skip: !selectedOrg });

  const [onboardEmployee, { isLoading }] = useOnboardEmployeeMutation();

  const handleNext = () => setStep(prev => Math.min(prev + 1, 8));
  const handlePrev = () => setStep(prev => Math.max(prev - 1, 1));

  // Add Skill
  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    setSkillsList(prev => [...prev, {
      skillName: newSkillName,
      skillCategory: newSkillCategory,
      proficiencyLevel: newSkillLevel
    }]);
    setNewSkillName('');
  };

  // Remove Skill
  const handleRemoveSkill = (idx: number) => {
    setSkillsList(prev => prev.filter((_, i) => i !== idx));
  };

  // Add Certification
  const handleAddCert = () => {
    if (!newCertName.trim() || !newCertAuthority.trim()) return;
    setCertificationsList(prev => [...prev, {
      certificationName: newCertName,
      issuingAuthority: newCertAuthority,
      issueDate: newCertDate
    }]);
    setNewCertName('');
    setNewCertAuthority('');
    setNewCertDate('');
  };

  // Remove Certification
  const handleRemoveCert = (idx: number) => {
    setCertificationsList(prev => prev.filter((_, i) => i !== idx));
  };

  // Mock Document upload trigger
  const handleDocUpload = (category: string, filename: string) => {
    if (!filename) return;
    setDocumentsList(prev => [
      ...prev.filter(d => d.documentType !== category), // replace if already exists
      {
        documentName: filename.split('\\').pop() || filename,
        documentType: category,
        fileSize: 1024 * 1024,
        mimeType: 'application/pdf',
        verificationStatus: 'PENDING',
        expiryDate: '2030-12-31'
      }
    ]);
  };

  // ── Validation Engine (data-driven, not navigation-driven) ──
  const formData: OnboardingFormData = useMemo(() => ({
    firstName, lastName, workEmail, personalEmail, workPhone, personalPhone, gender, dateOfBirth,
    dateOfJoining, selectedOrg, selectedBU, selectedDiv, selectedDept, selectedLoc, selectedGrade, selectedBand,
    managerId, workMode, designation, employmentType,
    panNumber, aadhaarNumber, uanNumber, esicNumber,
    bankName, bankAccountNumber, bankIfsc,
    skillsList, certificationsList, documentsList,
    buddyId, mentorId, hrbpId, skipManagerId, departmentHeadId,
  }), [firstName, lastName, workEmail, personalEmail, workPhone, personalPhone, gender, dateOfBirth,
    dateOfJoining, selectedOrg, selectedBU, selectedDiv, selectedDept, selectedLoc, selectedGrade, selectedBand,
    managerId, workMode, designation, employmentType, panNumber, aadhaarNumber, uanNumber, esicNumber,
    bankName, bankAccountNumber, bankIfsc, skillsList, certificationsList, documentsList,
    buddyId, mentorId, hrbpId, skipManagerId, departmentHeadId]);

  const validationSummary = useMemo(() => computeValidationSummary(formData), [formData]);
  const { canSubmit, completionPercentage: percentage, missingSections, optionalMissing, stepResults } = validationSummary;

  const getStepStatus = (stepNr: number): StepStatus => {
    if (stepNr === 8) return canSubmit ? 'completed' : (percentage > 0 ? 'in_progress' : 'not_started');
    return stepResults[stepNr]?.status ?? 'not_started';
  };

  const stepStatusColors = (status: StepStatus) => {
    switch (status) {
      case 'completed': return { bg: 'bg-emerald-500 border-emerald-500 text-white', text: 'text-emerald-500', icon: '✓' };
      case 'in_progress': return { bg: 'bg-blue-500 border-blue-500 text-white', text: 'text-blue-500', icon: '…' };
      case 'error': return { bg: 'bg-rose-500 border-rose-500 text-white', text: 'text-rose-500', icon: '!' };
      default: return { bg: 'bg-white dark:bg-[#0F131F] border-slate-200 dark:border-slate-850 text-slate-400 dark:text-slate-500', text: 'text-slate-400 dark:text-slate-500', icon: '' };
    }
  };

  // Legacy-compatible strength display
  let strength = 'Poor';
  let strengthColor = 'text-rose-500 bg-rose-500/10 border-rose-500/20';
  if (percentage >= 80) { strength = 'Excellent'; strengthColor = 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'; }
  else if (percentage >= 50) { strength = 'Good'; strengthColor = 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20'; }
  else if (percentage >= 25) { strength = 'Fair'; strengthColor = 'text-amber-500 bg-amber-500/10 border-amber-500/20'; }

  const handleSubmit = async () => {
    try {
      const relationships = [];
      if (managerId) {
        relationships.push({
          relationshipType: 'MANAGER',
          relatedEmployeeId: managerId
        });
      }
      if (buddyId) {
        relationships.push({
          relationshipType: 'BUDDY',
          relatedEmployeeId: buddyId
        });
      }
      if (mentorId) {
        relationships.push({
          relationshipType: 'MENTOR',
          relatedEmployeeId: mentorId
        });
      }
      if (hrbpId) {
        relationships.push({
          relationshipType: 'HRBP',
          relatedEmployeeId: hrbpId
        });
      }

      const parsePhone = (phone?: string) => {
        if (!phone) return { countryCode: undefined, number: undefined, full: undefined };
        const val = phone.trim();
        let countryCode = '+1';
        let localNumber = val;
        if (val.startsWith('+')) {
          const firstSpace = val.indexOf(' ');
          if (firstSpace > 0) {
            countryCode = val.substring(0, firstSpace);
            localNumber = val.substring(firstSpace + 1).trim();
          } else {
            if (val.startsWith('+971')) {
              countryCode = '+971';
              localNumber = val.substring(4);
            } else if (val.startsWith('+91')) {
              countryCode = '+91';
              localNumber = val.substring(3);
            } else if (val.startsWith('+44')) {
              countryCode = '+44';
              localNumber = val.substring(3);
            } else if (val.startsWith('+61')) {
              countryCode = '+61';
              localNumber = val.substring(3);
            } else if (val.startsWith('+65')) {
              countryCode = '+65';
              localNumber = val.substring(3);
            } else if (val.startsWith('+1')) {
              countryCode = '+1';
              localNumber = val.substring(2);
            }
          }
        }
        const cleanLocal = localNumber.replace(/\D/g, '');
        const full = countryCode + cleanLocal;
        return { countryCode, number: cleanLocal, full };
      };

      const wp = parsePhone(workPhone);
      const pp = parsePhone(personalPhone);

      await onboardEmployee({
        firstName,
        lastName,
        displayName: `${firstName} ${lastName}`,
        workEmail,
        personalEmail: personalEmail || undefined,
        workPhone: workPhone || undefined,
        personalPhone: personalPhone || undefined,
        workPhoneCountryCode: wp.countryCode,
        workPhoneNumber: wp.number,
        workPhoneFull: wp.full,
        personalPhoneCountryCode: pp.countryCode,
        personalPhoneNumber: pp.number,
        personalPhoneFull: pp.full,
        gender,
        dateOfBirth: dateOfBirth || undefined,
        employeeCode,
        dateOfJoining,
        organizationId: selectedOrg || undefined,
        businessUnitId: selectedBU || undefined,
        divisionId: selectedDiv || undefined,
        departmentId: selectedDept || undefined,
        locationId: selectedLoc || undefined,
        gradeId: selectedGrade || undefined,
        bandId: selectedBand || undefined,
        managerId: managerId || undefined,
        skipManagerId: skipManagerId || undefined,
        departmentHeadId: departmentHeadId || undefined,
        hrbpId: hrbpId || undefined,
        mentorId: mentorId || undefined,
        buddyId: buddyId || undefined,
        workMode,
        panNumber: panNumber || undefined,
        aadhaarNumber: aadhaarNumber || undefined,
        uanNumber: uanNumber || undefined,
        esicNumber: esicNumber || undefined,
        bankName: bankName || undefined,
        bankAccountNumber: bankAccountNumber || undefined,
        bankIfsc: bankIfsc || undefined,
        skills: skillsList,
        certifications: certificationsList,
        documents: documentsList,
        relationships: relationships,
        employmentStatus: 'ACTIVE'
      }).unwrap();
      onSuccess();
    } catch (err) {
      console.error('Failed to onboard employee twin', err);
    }
  };

  const stepsList = [
    { nr: 1, label: 'Identity', icon: User, desc: 'Personal and contact information' },
    { nr: 2, label: 'Employment DNA', icon: Briefcase, desc: 'Organizational levels' },
    { nr: 3, label: 'Compliance', icon: ShieldCheck, desc: 'Federal registries' },
    { nr: 4, label: 'Banking Details', icon: Clock, desc: 'Salary disbursement logs' },
    { nr: 5, label: 'Skills & Certs', icon: Award, desc: 'Expertise and levels' },
    { nr: 6, label: 'Documents Upload', icon: FileText, desc: 'Attached verification papers' },
    { nr: 7, label: 'Relationships', icon: Network, desc: 'Reporting managers & buddies' },
    { nr: 8, label: 'Review & Create', icon: Sparkles, desc: 'Verify and sync twin' }
  ];

  return (
    <div className="fixed inset-0 bg-[#F8FAFC] dark:bg-[#090D16] z-50 flex flex-col md:flex-row animate-fade-in text-slate-800 dark:text-slate-100 overflow-hidden h-screen w-screen font-sans">
      
      {/* ── Left Sidebar Navigation Pane ────────────────── */}
      <div className="w-full md:w-[280px] bg-white dark:bg-[#0F131F] border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          
          {/* Logo & Headline */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-indigo-650 flex items-center justify-center font-bold text-white shadow-md text-base">
              M
            </div>
            <div>
              <span className="font-extrabold text-xs tracking-wider text-slate-850 dark:text-white uppercase block leading-none">ManageMyTalenthive</span>
              <p className="text-[10px] text-slate-400 font-bold mt-1">HR Operating System</p>
            </div>
          </div>

          {/* Active Step Indicator Banner */}
          <div className="bg-[#eff6ff] dark:bg-indigo-950/20 border-l-4 border-indigo-500 p-3.5 rounded-r-lg">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400 block">Step {step} of 8</span>
            <h4 className="text-xs font-extrabold text-slate-800 dark:text-white mt-1">
              {stepsList.find(s => s.nr === step)?.label}
            </h4>
            <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-1 leading-normal">
              {stepsList.find(s => s.nr === step)?.desc}
            </p>
          </div>

          {/* Steps list */}
          <div className="space-y-1">
            {stepsList.map((s) => {
              const Icon = s.icon;
              const isActive = step === s.nr;
              const status = getStepStatus(s.nr);
              const colors = stepStatusColors(status);
              return (
                <button
                  key={s.nr}
                  onClick={() => setStep(s.nr)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs transition-all font-semibold outline-none ${
                    isActive 
                      ? 'bg-[#5D69F4] text-white shadow-[0_4px_12px_rgba(93,105,244,0.25)]' 
                      : status === 'completed'
                        ? 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40' 
                        : status === 'error'
                          ? 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20'
                          : status === 'in_progress'
                            ? 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20'
                            : 'text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : colors.text}`} />
                    <span>{s.label}</span>
                  </div>
                  {!isActive && status !== 'not_started' && (
                    <span className={`text-[10px] font-bold ${colors.text}`}>{colors.icon}</span>
                  )}
                </button>
              );
            })}
          </div>

        </div>

        {/* Completion Progress Widget */}
        <div className="space-y-2.5 border-t border-slate-200 dark:border-slate-800/80 pt-6">
          <div className="flex justify-between text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
            <span>Overall progress</span>
            <span>{percentage}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-500 rounded-full transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

      </div>

      {/* ── Main Form Pane ────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC] dark:bg-[#090D16]">
        
        {/* Form Header */}
        <div className="px-8 py-4 bg-white dark:bg-[#0F131F] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base font-extrabold text-slate-850 dark:text-white leading-none">Employee Onboarding</h2>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5">Configure employee digital twin and core information.</p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-850 dark:hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body Scroll Area */}
        <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full space-y-6">
          
          {/* Horizontal Stepper Progress Indicator */}
          <div className="bg-white dark:bg-[#0F131F] rounded-xl border border-slate-200 dark:border-slate-800/80 p-5 shadow-sm hidden md:block">
            <div className="flex items-center justify-between relative">
              {/* Connector line */}
              <div className="absolute top-5 left-8 right-8 h-0.5 border-t-2 border-dashed border-slate-200 dark:border-slate-800 z-0" />
              
              {stepsList.map((s) => {
                const isActive = step === s.nr;
                const status = getStepStatus(s.nr);
                const colors = stepStatusColors(status);
                return (
                  <button 
                    key={s.nr}
                    onClick={() => setStep(s.nr)}
                    className="flex flex-col items-center relative z-10 focus:outline-none group flex-1"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all font-bold text-xs ${
                      isActive 
                        ? 'bg-[#5D69F4] border-[#5D69F4] text-white shadow-[0_0_12px_rgba(93,105,244,0.3)]' 
                        : `${colors.bg} group-hover:border-slate-300`
                    }`}>
                      {!isActive && status === 'completed' ? <Check className="w-4.5 h-4.5" /> 
                        : !isActive && status === 'error' ? <AlertTriangle className="w-4 h-4" /> 
                        : s.nr}
                    </div>
                    <span className={`text-[10px] font-bold mt-2 text-center transition-colors ${
                      isActive 
                        ? 'text-indigo-600 dark:text-indigo-400' 
                        : status === 'completed'
                          ? 'text-slate-700 dark:text-slate-350' 
                          : status === 'error'
                            ? 'text-rose-500 dark:text-rose-400'
                            : status === 'in_progress'
                              ? 'text-blue-500 dark:text-blue-400'
                              : 'text-slate-400 dark:text-slate-550'
                    }`}>
                      {s.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white dark:bg-[#0F131F] rounded-xl border border-slate-200 dark:border-slate-800/80 p-6 shadow-sm min-h-[400px]">
            
            {/* Form Step Title Banner */}
            <div className="flex items-center gap-3.5 mb-6">
              <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-500 shrink-0">
                {step === 1 && <User className="w-5 h-5" />}
                {step === 2 && <Briefcase className="w-5 h-5" />}
                {step === 3 && <ShieldCheck className="w-5 h-5" />}
                {step === 4 && <Landmark className="w-5 h-5" />}
                {step === 5 && <Award className="w-5 h-5" />}
                {step === 6 && <FileText className="w-5 h-5" />}
                {step === 7 && <Network className="w-5 h-5" />}
                {step === 8 && <Sparkles className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-white leading-none">
                  {step === 1 && "Personal Information"}
                  {step === 2 && "Employment DNA"}
                  {step === 3 && "Compliance Keys"}
                  {step === 4 && "Banking & Payout Details"}
                  {step === 5 && "Professional Skills Cloud"}
                  {step === 6 && "Document Vault"}
                  {step === 7 && "Workforce Relationships"}
                  {step === 8 && "Review & Complete Profile"}
                </h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5 leading-none">
                  {step === 1 && "Enter the employee's personal and contact details."}
                  {step === 2 && "Map division, department, location levels, and designations."}
                  {step === 3 && "Input official tracking keys like PAN, Aadhaar, and ESIC."}
                  {step === 4 && "Configure primary disbursement accounts and IFSC logs."}
                  {step === 5 && "Configure expert credentials and capabilities."}
                  {step === 6 && "Attach scanned credentials for validation."}
                  {step === 7 && "Link team members, buddies, mentors, and HRBPs."}
                  {step === 8 && "Verify overall digital twin configuration before initialization."}
                </p>
              </div>
            </div>

            {/* STEP 1: IDENTITY */}
            {step === 1 && (
              <div className="space-y-4 animate-fade-in">
                
                {/* Photo Upload + Basic Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Left Side fields */}
                  <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">First Name *</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="text" 
                          placeholder="John"
                          value={firstName}
                          onChange={e => setFirstName(e.target.value)}
                          className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-3 py-2 outline-none w-full text-xs font-medium focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 transition-all text-slate-800 dark:text-white"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Last Name *</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="text" 
                          placeholder="Doe"
                          value={lastName}
                          onChange={e => setLastName(e.target.value)}
                          className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-3 py-2 outline-none w-full text-xs font-medium focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 transition-all text-slate-800 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Photo upload placeholder */}
                  <div className="md:col-span-1 flex flex-col justify-center">
                    <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center text-center h-[120px] bg-slate-50/30 dark:bg-slate-900/10 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-all cursor-pointer relative group">
                      {photoUrl ? (
                        <>
                          <img src={photoUrl} alt="Employee Avatar" className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500" />
                          <button 
                            onClick={(e) => { e.stopPropagation(); setPhotoUrl(null); }}
                            className="absolute top-2 right-2 bg-rose-500 text-white p-1 rounded-full hover:bg-rose-600 transition-colors shadow-sm"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </>
                      ) : (
                        <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full">
                          <UploadCloud className="w-5 h-5 text-indigo-500 group-hover:scale-115 transition-transform" />
                          <span className="text-xs font-bold text-slate-800 dark:text-white mt-1.5">Upload Photo</span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500">JPG, PNG up to 5MB</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                const url = URL.createObjectURL(e.target.files[0]);
                                setPhotoUrl(url);
                              }
                            }}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>

                {/* Additional Step 1 fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Work Email *</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="email" 
                        placeholder="john.doe@managemyopz.com"
                        value={workEmail}
                        onChange={e => setWorkEmail(e.target.value)}
                        className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-8 py-2 outline-none w-full text-xs font-medium focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 transition-all font-mono text-slate-800 dark:text-white"
                      />
                      {workEmail && workEmail.includes('@') && (
                        <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Personal Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="email" 
                        placeholder="john.doe.personal@gmail.com"
                        value={personalEmail}
                        onChange={e => setPersonalEmail(e.target.value)}
                        className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-3 py-2 outline-none w-full text-xs font-medium focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 transition-all font-mono text-slate-800 dark:text-white"
                      />
                    </div>
                  </div>

                  <PhoneInput 
                    label="Work Phone" 
                    value={workPhone} 
                    onChange={setWorkPhone} 
                    error={workPhoneError || undefined} 
                    setError={setWorkPhoneError} 
                  />

                  <PhoneInput 
                    label="Personal Phone" 
                    value={personalPhone} 
                    onChange={setPersonalPhone} 
                    error={personalPhoneError || undefined} 
                    setError={setPersonalPhoneError} 
                  />

                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Gender</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <select 
                        value={gender}
                        onChange={e => setGender(e.target.value)}
                        className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-8 py-2 outline-none w-full text-xs font-medium focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 transition-all appearance-none cursor-pointer text-slate-800 dark:text-white"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <DatePicker 
                    label="Date of Birth" 
                    value={dateOfBirth} 
                    onChange={setDateOfBirth} 
                  />
                </div>

                <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 rounded-xl p-3.5 flex items-center gap-2.5 mt-6">
                  <Info className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span className="text-[11px] font-semibold text-slate-650 dark:text-slate-400">
                    Only <span className="text-rose-500 font-bold">*</span> fields are required for creation. Other details can be added later via Employee 360.
                  </span>
                </div>

              </div>
            )}

            {/* STEP 2: EMPLOYMENT DNA */}
            {step === 2 && (
              <div className="space-y-4 animate-fade-in">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold flex items-center gap-1.5">
                      Employee Code
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold uppercase">Auto</span>
                    </label>
                    <div className="relative">
                      <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500" />
                      <input 
                        type="text" 
                        value={selectedOrg 
                          ? (nextEmployeeCode || 'Generating...')
                          : 'Select an organization first'
                        }
                        disabled
                        readOnly
                        className={`border rounded-lg pl-9 pr-3 py-2 outline-none w-full text-xs font-bold cursor-not-allowed ${
                          selectedOrg 
                            ? 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400 font-mono tracking-wider'
                            : 'bg-slate-100 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500'
                        }`}
                      />
                      {selectedOrg && (
                        <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500" />
                      )}
                    </div>
                  </div>
                  <DatePicker 
                    label="Date of Joining" 
                    value={dateOfJoining} 
                    onChange={setDateOfJoining} 
                    required={true}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Organization Tenant *</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <select 
                        value={selectedOrg}
                        onChange={e => {
                          setSelectedOrg(e.target.value);
                          setSelectedBU('');
                          setSelectedDiv('');
                          setSelectedDept('');
                        }}
                        className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-8 py-2 outline-none w-full text-xs font-medium focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 transition-all appearance-none cursor-pointer text-slate-800 dark:text-white"
                      >
                        <option value="">Select Org</option>
                        {(orgs || []).map((org: any) => (
                          <option key={org.id} value={org.id}>{org.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Business Unit</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <select 
                        value={selectedBU}
                        onChange={e => {
                          setSelectedBU(e.target.value);
                          setSelectedDiv('');
                          setSelectedDept('');
                        }}
                        disabled={!selectedOrg}
                        className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-8 py-2 outline-none w-full text-xs font-medium focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 transition-all appearance-none cursor-pointer disabled:opacity-40 text-slate-800 dark:text-white"
                      >
                        <option value="">Select BU</option>
                        {(businessUnits || []).map((bu: any) => (
                          <option key={bu.id} value={bu.id}>{bu.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Division</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <select 
                        value={selectedDiv}
                        onChange={e => {
                          setSelectedDiv(e.target.value);
                          setSelectedDept('');
                        }}
                        disabled={!selectedBU}
                        className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-8 py-2 outline-none w-full text-xs font-medium focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 transition-all appearance-none cursor-pointer disabled:opacity-40 text-slate-800 dark:text-white"
                      >
                        <option value="">Select Division</option>
                        {(divisions || []).map((div: any) => (
                          <option key={div.id} value={div.id}>{div.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Department *</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <select 
                        value={selectedDept}
                        onChange={e => setSelectedDept(e.target.value)}
                        disabled={!selectedDiv}
                        className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-8 py-2 outline-none w-full text-xs font-medium focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 transition-all appearance-none cursor-pointer disabled:opacity-40 text-slate-800 dark:text-white"
                      >
                        <option value="">Select Department</option>
                        {(departments || []).map((dept: any) => (
                          <option key={dept.id} value={dept.id}>{dept.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <select 
                        value={selectedLoc}
                        onChange={e => setSelectedLoc(e.target.value)}
                        disabled={!selectedOrg}
                        className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-8 py-2 outline-none w-full text-xs font-medium focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 transition-all appearance-none cursor-pointer disabled:opacity-40 text-slate-800 dark:text-white"
                      >
                        <option value="">Select Location</option>
                        {(locations || []).map((loc: any) => (
                          <option key={loc.id} value={loc.id}>{loc.name} ({loc.city})</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Grade Level</label>
                    <div className="relative">
                      <Award className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <select 
                        value={selectedGrade}
                        onChange={e => setSelectedGrade(e.target.value)}
                        disabled={!selectedOrg}
                        className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-8 py-2 outline-none w-full text-xs font-medium focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 transition-all appearance-none cursor-pointer disabled:opacity-40 text-slate-800 dark:text-white"
                      >
                        <option value="">Select Grade</option>
                        {(grades || []).map((g: any) => (
                          <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Salary Band</label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <select 
                        value={selectedBand}
                        onChange={e => setSelectedBand(e.target.value)}
                        disabled={!selectedOrg}
                        className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-8 py-2 outline-none w-full text-xs font-medium focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 transition-all appearance-none cursor-pointer disabled:opacity-40 text-slate-800 dark:text-white"
                      >
                        <option value="">Select Band</option>
                        {(bands || []).map((b: any) => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Work Mode</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <select 
                        value={workMode}
                        onChange={e => setWorkMode(e.target.value)}
                        className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-8 py-2 outline-none w-full text-xs font-medium focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 transition-all appearance-none cursor-pointer text-slate-800 dark:text-white"
                      >
                        <option value="REMOTE">Remote Office</option>
                        <option value="HYBRID">Hybrid Ecosystem</option>
                        <option value="ONSITE">On-Site Office</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Designation *</label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="Senior Fullstack Dev"
                        value={designation}
                        onChange={e => setDesignation(e.target.value)}
                        className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-3 py-2 outline-none w-full text-xs font-medium focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 transition-all text-slate-800 dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Reporting Manager</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <select 
                        value={managerId}
                        onChange={e => setManagerId(e.target.value)}
                        className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-8 py-2 outline-none w-full text-xs font-medium focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 transition-all appearance-none cursor-pointer text-slate-800 dark:text-white"
                      >
                        <option value="">Select Manager</option>
                        {(existingEmployees || []).map((emp: any) => (
                          <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} ({emp.employeeCode})</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Employment Type *</label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <select 
                        value={employmentType}
                        onChange={e => setEmploymentType(e.target.value)}
                        className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-8 py-2 outline-none w-full text-xs font-medium focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 transition-all appearance-none cursor-pointer text-slate-800 dark:text-white"
                      >
                        <option value="">Select Type</option>
                        <option value="FULL_TIME">Full Time</option>
                        <option value="PART_TIME">Part Time</option>
                        <option value="CONTRACT">Contract</option>
                        <option value="INTERN">Intern</option>
                        <option value="CONSULTANT">Consultant</option>
                        <option value="TEMPORARY">Temporary</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* STEP 3: COMPLIANCE */}
            {step === 3 && (
              <div className="space-y-4 animate-fade-in">
                
                <div className="bg-amber-50/30 dark:bg-amber-950/10 p-4 rounded-xl border border-amber-100/30 dark:border-amber-900/30 flex gap-3 items-start">
                  <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-slate-805 dark:text-white text-xs">Statutory Compliance Registries <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 font-bold uppercase ml-1">Optional</span></h4>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 leading-normal">
                      These fields can be completed after onboarding. They contribute to your Profile Health Score and compliance tracking.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">PAN Number</label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="ABCDE1234F"
                        value={panNumber}
                        onChange={e => setPanNumber(e.target.value.toUpperCase())}
                        className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-3 py-2 outline-none w-full text-xs font-mono font-bold focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 transition-all text-slate-800 dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Aadhaar Card Number</label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="1234 5678 9012"
                        value={aadhaarNumber}
                        onChange={e => setAadhaarNumber(e.target.value)}
                        className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-3 py-2 outline-none w-full text-xs font-mono font-bold focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 transition-all text-slate-800 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">UAN (Universal Account Number)</label>
                    <div className="relative">
                      <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="100998822112"
                        value={uanNumber}
                        onChange={e => setUanNumber(e.target.value)}
                        className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-3 py-2 outline-none w-full text-xs font-mono focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 transition-all text-slate-800 dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">ESIC Number</label>
                    <div className="relative">
                      <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="31123456780011001"
                        value={esicNumber}
                        onChange={e => setEsicNumber(e.target.value)}
                        className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-3 py-2 outline-none w-full text-xs font-mono focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 transition-all text-slate-800 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* STEP 4: BANKING DETAILS */}
            {step === 4 && (
              <div className="space-y-4 animate-fade-in">
                
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Bank Name</label>
                  <div className="relative">
                    <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Silicon Valley Bank"
                      value={bankName}
                      onChange={e => setBankName(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-3 py-2 outline-none w-full text-xs font-medium focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 transition-all text-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Bank Account Number</label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="9988112233"
                        value={bankAccountNumber}
                        onChange={e => setBankAccountNumber(e.target.value)}
                        className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-3 py-2 outline-none w-full text-xs font-mono font-bold focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 transition-all text-slate-800 dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Bank IFSC Code</label>
                    <div className="relative">
                      <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="SVTX0000231"
                        value={bankIfsc}
                        onChange={e => setBankIfsc(e.target.value.toUpperCase())}
                        className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-3 py-2 outline-none w-full text-xs font-mono font-bold focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 transition-all text-slate-800 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* STEP 5: SKILLS & CERTIFICATIONS */}
            {step === 5 && (
              <div className="space-y-6 animate-fade-in">
                
                {/* Skills Cloud */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-850 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">Skills Cloud</h3>
                  
                  {skillsList.length > 0 && (
                    <div className="flex flex-wrap gap-2 py-2">
                      {skillsList.map((sk, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1 rounded-full text-xs text-slate-800 dark:text-slate-200">
                          <span>{sk.skillName} • <span className="text-[10px] text-indigo-500 dark:text-indigo-400 uppercase font-bold">{sk.proficiencyLevel}</span></span>
                          <button onClick={() => handleRemoveSkill(idx)} className="text-rose-500 hover:text-rose-700 ml-1">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <input 
                      type="text" 
                      placeholder="React Native / Kubernetes"
                      value={newSkillName}
                      onChange={e => setNewSkillName(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 outline-none text-xs md:col-span-2 text-slate-800 dark:text-white"
                    />
                    <div className="relative">
                      <select 
                        value={newSkillLevel}
                        onChange={e => setNewSkillLevel(e.target.value)}
                        className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-3 pr-8 py-2 outline-none text-xs w-full appearance-none cursor-pointer text-slate-800 dark:text-white"
                      >
                        <option value="BEGINNER">Beginner</option>
                        <option value="INTERMEDIATE">Intermediate</option>
                        <option value="EXPERT">Expert</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                    <button 
                      onClick={handleAddSkill}
                      className="bg-[#18181B] hover:bg-[#27272A] dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white px-3.5 py-2 rounded-lg flex items-center justify-center gap-1.5 text-xs font-bold"
                    >
                      <Plus className="w-4 h-4" /> Add
                    </button>
                  </div>
                </div>

                {/* Certifications Vault */}
                <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <h3 className="text-xs font-bold text-slate-850 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">Certifications</h3>
                  
                  {certificationsList.length > 0 && (
                    <div className="space-y-2 py-2">
                      {certificationsList.map((cert, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2.5 rounded-xl">
                          <div>
                            <p className="font-bold text-xs text-slate-850 dark:text-white">{cert.certificationName}</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{cert.issuingAuthority} • Issued {cert.issueDate}</p>
                          </div>
                          <button onClick={() => handleRemoveCert(idx)} className="text-rose-500 hover:text-rose-700">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input 
                      type="text" 
                      placeholder="AWS Solution Architect"
                      value={newCertName}
                      onChange={e => setNewCertName(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 outline-none text-xs text-slate-800 dark:text-white"
                    />
                    <input 
                      type="text" 
                      placeholder="Amazon Web Services"
                      value={newCertAuthority}
                      onChange={e => setNewCertAuthority(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 outline-none text-xs text-slate-800 dark:text-white"
                    />
                    <div className="flex gap-2 items-center flex-1">
                      <DatePicker 
                        value={newCertDate} 
                        onChange={setNewCertDate} 
                      />
                      <button 
                        onClick={handleAddCert}
                        className="bg-[#18181B] hover:bg-[#27272A] dark:bg-indigo-650 dark:hover:bg-indigo-700 text-white px-3.5 rounded-lg flex items-center justify-center shrink-0 font-bold"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* STEP 6: DOCUMENTS */}
            {step === 6 && (
              <div className="space-y-4 animate-fade-in">
                
                <div className="bg-indigo-50/30 dark:bg-indigo-950/10 p-4 rounded-xl border border-indigo-100/30 dark:border-indigo-900/30 flex gap-3 items-start">
                  <FileText className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-slate-805 dark:text-white text-xs">Employee Document Vault</h4>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 leading-normal">
                      Attach identity credentials, education degree notes, and past records to initialize verification workflows.
                    </p>
                  </div>
                </div>

                {/* Document rows */}
                {[
                  { key: 'IDENTITY_PROOF', label: 'Identity Document (e.g. Passport/Aadhaar/PAN)' },
                  { key: 'EDUCATION_DEGREE', label: 'Education Certificate (e.g. Bachelor/Master Degree)' },
                  { key: 'EXPERIENCE_LETTER', label: 'Employment Letter (e.g. Relieving / Payslips)' }
                ].map((docType) => {
                  const uploaded = documentsList.find(d => d.documentType === docType.key);
                  return (
                    <div key={docType.key} className="p-4 border border-slate-200 dark:border-slate-800/80 rounded-xl flex items-center justify-between gap-4 bg-slate-50/30 dark:bg-slate-900/5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-slate-800 dark:text-slate-200">{docType.label}</p>
                        {uploaded ? (
                          <p className="text-[10px] text-emerald-600 dark:text-emerald-450 mt-1 flex items-center gap-1 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Attached: {uploaded.documentName}
                          </p>
                        ) : (
                          <p className="text-[10px] text-slate-400 dark:text-slate-550 mt-1">Pending document attachment</p>
                        )}
                      </div>
                      <label className="cursor-pointer bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 px-3.5 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0 text-slate-800 dark:text-white">
                        <Upload className="w-3.5 h-3.5 text-indigo-500" />
                        {uploaded ? 'Replace' : 'Upload'}
                        <input 
                          type="file" 
                          className="hidden" 
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleDocUpload(docType.key, e.target.files[0].name);
                            }
                          }}
                        />
                      </label>
                    </div>
                  );
                })}
              </div>
            )}

            {/* STEP 7: RELATIONSHIPS */}
            {step === 7 && (
              <div className="space-y-6 animate-fade-in">
                
                <div className="bg-indigo-50/30 dark:bg-indigo-950/10 p-4 rounded-xl border border-indigo-100/30 dark:border-indigo-900/30 flex gap-3 items-start">
                  <Network className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-slate-805 dark:text-white text-xs">Workforce Relationship Map</h4>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 leading-normal">
                      Establish organizational lines to link buddies, mentors, manager flows, and HR business partner accounts.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Reporting Manager */}
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Reporting Manager</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <select 
                        value={managerId}
                        onChange={e => setManagerId(e.target.value)}
                        className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-8 py-2.5 outline-none w-full text-xs font-medium focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 transition-all appearance-none cursor-pointer text-slate-800 dark:text-white"
                      >
                        <option value="">Select Manager</option>
                        {(existingEmployees || []).map((emp: any) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.firstName} {emp.lastName} ({emp.employeeCode})
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Onboarding Buddy */}
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Onboarding Buddy</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <select 
                        value={buddyId}
                        onChange={e => setBuddyId(e.target.value)}
                        className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-8 py-2.5 outline-none w-full text-xs font-medium focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 transition-all appearance-none cursor-pointer text-slate-800 dark:text-white"
                      >
                        <option value="">Select Onboarding Buddy</option>
                        {(existingEmployees || []).map((emp: any) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.firstName} {emp.lastName} ({emp.employeeCode})
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Career Mentor */}
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Career Mentor</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <select 
                        value={mentorId}
                        onChange={e => setMentorId(e.target.value)}
                        className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-8 py-2.5 outline-none w-full text-xs font-medium focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 transition-all appearance-none cursor-pointer text-slate-800 dark:text-white"
                      >
                        <option value="">Select Career Mentor</option>
                        {(existingEmployees || []).map((emp: any) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.firstName} {emp.lastName} ({emp.employeeCode})
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* HRBP */}
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">HR Business Partner (HRBP)</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <select 
                        value={hrbpId}
                        onChange={e => setHrbpId(e.target.value)}
                        className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-8 py-2.5 outline-none w-full text-xs font-medium focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 transition-all appearance-none cursor-pointer text-slate-800 dark:text-white"
                      >
                        <option value="">Select HRBP</option>
                        {(existingEmployees || []).map((emp: any) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.firstName} {emp.lastName} ({emp.employeeCode})
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Skip Manager */}
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Skip Manager</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <select 
                        value={skipManagerId}
                        onChange={e => setSkipManagerId(e.target.value)}
                        className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-8 py-2.5 outline-none w-full text-xs font-medium focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 transition-all appearance-none cursor-pointer text-slate-800 dark:text-white"
                      >
                        <option value="">Select Skip Manager</option>
                        {(existingEmployees || []).map((emp: any) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.firstName} {emp.lastName} ({emp.employeeCode})
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Department Head */}
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Department Head</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <select 
                        value={departmentHeadId}
                        onChange={e => setDepartmentHeadId(e.target.value)}
                        className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-8 py-2.5 outline-none w-full text-xs font-medium focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 transition-all appearance-none cursor-pointer text-slate-800 dark:text-white"
                      >
                        <option value="">Select Department Head</option>
                        {(existingEmployees || []).map((emp: any) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.firstName} {emp.lastName} ({emp.employeeCode})
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* STEP 8: REVIEW & CREATE */}
            {step === 8 && (
              <div className="space-y-6 animate-fade-in">
                
                {/* Strength & Completion */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`p-4 rounded-xl border ${strengthColor} flex items-center gap-3.5`}>
                    <Sparkles className="w-6 h-6 shrink-0 text-indigo-500 dark:text-indigo-400 animate-pulse" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-450">Twin Profile Strength</p>
                      <p className="text-sm font-extrabold mt-0.5">{strength}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                    <div className="flex justify-between items-center font-bold text-[10px] uppercase text-slate-455">
                      <span>Profile Completion</span>
                      <span>{percentage}%</span>
                    </div>
                    <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Mandatory Missing — Blocks creation */}
                {missingSections.length > 0 && (
                  <div className="border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/10 rounded-xl p-5 space-y-3">
                    <h4 className="font-extrabold text-rose-600 dark:text-rose-400 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" /> Required Fields Missing — Cannot Create
                    </h4>
                    <div className="space-y-2">
                      {missingSections.map((section) => (
                        <button
                          key={section.stepNumber}
                          onClick={() => setStep(section.stepNumber)}
                          className="w-full text-left p-3 border border-rose-100 dark:border-rose-900/30 rounded-lg bg-white dark:bg-[#0F131F] hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800 dark:text-white">{section.stepLabel}</span>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-500 transition-colors" />
                          </div>
                          <p className="text-[10px] text-rose-500 dark:text-rose-400 mt-1 font-semibold">
                            Missing: {section.errors.join(', ')}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ready to Create — Green success */}
                {canSubmit && (
                  <div className="border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/10 rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Ready To Create Employee Twin</p>
                        <p className="text-[10px] text-emerald-600/70 dark:text-emerald-500/70 mt-0.5">
                          Profile health: {percentage}% — Additional information can be added later from Employee 360 Workspace.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Profile Improvement Center — Optional items */}
                {canSubmit && optionalMissing.length > 0 && (
                  <div className="border border-amber-200 dark:border-amber-900/40 bg-amber-50/30 dark:bg-amber-950/10 rounded-xl p-5 space-y-3">
                    <h4 className="font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                      <Info className="w-4 h-4" /> Profile Improvement Center
                    </h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      These items are optional. Complete them after onboarding to improve the profile health score.
                    </p>
                    <div className="space-y-1.5 max-h-[140px] overflow-y-auto">
                      {optionalMissing.slice(0, 8).map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => setStep(item.stepNumber)}
                          className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-amber-100/50 dark:hover:bg-amber-950/20 transition-colors group text-left"
                        >
                          <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                            ⚠ {item.label} <span className="text-[9px] text-slate-400 ml-1">({item.sectionLabel})</span>
                          </span>
                          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">+{item.potentialGain}%</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Summary Lists */}
                <div className="border border-slate-200 dark:border-slate-800/80 rounded-xl p-5 bg-slate-50/30 dark:bg-slate-900/5 space-y-4 max-h-[260px] overflow-y-auto">
                  <h4 className="font-extrabold text-slate-850 dark:text-white uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" /> Profile Twin Summary
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5 text-xs font-semibold text-slate-705 dark:text-slate-350">
                    <div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase block font-bold">Full Name</span>
                      <strong className="text-slate-850 dark:text-slate-200">{firstName} {lastName}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase block font-bold">Employee Code</span>
                      <strong className="text-indigo-600 dark:text-indigo-400 font-mono">
                        {selectedOrg 
                          ? (nextEmployeeCode || 'Generating...')
                          : 'Pending — Select Org'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase block font-bold">Work Email</span>
                      <strong className="text-slate-850 dark:text-slate-200">{workEmail}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-455 uppercase block font-bold">Date of Joining</span>
                      <strong className="text-slate-850 dark:text-slate-200">{dateOfJoining || 'N/A'}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-455 uppercase block font-bold">Work Mode</span>
                      <strong className="text-slate-850 dark:text-slate-200 uppercase">{workMode}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-455 uppercase block font-bold">PAN ID</span>
                      <strong className="text-slate-850 dark:text-slate-200">{panNumber || 'N/A'}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-455 uppercase block font-bold">Bank details</span>
                      <strong className="text-slate-850 dark:text-slate-200">{bankName || 'N/A'} ({bankAccountNumber || 'N/A'})</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-455 uppercase block font-bold">Reporting Manager</span>
                      <strong className="text-slate-850 dark:text-slate-200">
                        {managerId ? (existingEmployees || []).find((e: any) => e.id === managerId)?.displayName || 'Assigned' : 'N/A'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-455 uppercase block font-bold">Skip Manager</span>
                      <strong className="text-slate-850 dark:text-slate-200">
                        {skipManagerId ? (existingEmployees || []).find((e: any) => e.id === skipManagerId)?.displayName || 'Assigned' : 'N/A'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-455 uppercase block font-bold">Department Head</span>
                      <strong className="text-slate-850 dark:text-slate-200">
                        {departmentHeadId ? (existingEmployees || []).find((e: any) => e.id === departmentHeadId)?.displayName || 'Assigned' : 'N/A'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-455 uppercase block font-bold">HRBP Link</span>
                      <strong className="text-slate-850 dark:text-slate-200">
                        {hrbpId ? (existingEmployees || []).find((e: any) => e.id === hrbpId)?.displayName || 'Assigned' : 'N/A'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-455 uppercase block font-bold">Buddy Link</span>
                      <strong className="text-slate-850 dark:text-slate-200">
                        {buddyId ? (existingEmployees || []).find((e: any) => e.id === buddyId)?.displayName || 'Assigned' : 'N/A'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-455 uppercase block font-bold">Mentor Link</span>
                      <strong className="text-slate-850 dark:text-slate-200">
                        {mentorId ? (existingEmployees || []).find((e: any) => e.id === mentorId)?.displayName || 'Assigned' : 'N/A'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-455 uppercase block font-bold">Skills Cloud</span>
                      <strong className="text-slate-850 dark:text-slate-200">{skillsList.length} skills added</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-455 uppercase block font-bold">Documents Vault</span>
                      <strong className="text-slate-850 dark:text-slate-200">{documentsList.length} files attached</strong>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-450 dark:text-slate-500 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
                  By clicking Onboard Employee Twin, you will commit this record to the platform's immutable Single Source of Truth. Transaction audit trails and lifecycle timelines will be initialized automatically.
                </p>
              </div>
            )}

          </div>
        </div>

        {/* Sticky Action Footer */}
        <div className="px-8 py-4 bg-white dark:bg-[#0F131F] border-t border-slate-200 dark:border-slate-800 flex justify-between shrink-0">
          <button 
            onClick={handlePrev}
            disabled={step === 1}
            className="px-5 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-650 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1.5 transition-all text-slate-805 dark:text-white"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          
          {step < 8 ? (
            <button 
              onClick={handleNext}
              className="bg-[#5D69F4] hover:bg-[#4C57DF] text-white px-5 py-2 rounded-lg text-xs font-bold transition-all shadow-[0_4px_12px_rgba(93,105,244,0.2)] flex items-center gap-1.5"
            >
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
              <button 
                onClick={handleSubmit}
                disabled={isLoading || !canSubmit}
                className={`px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  canSubmit 
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-[0_4px_12px_rgba(16,185,129,0.2)] disabled:opacity-50'
                    : 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                }`}
                title={!canSubmit ? 'Complete required Identity and Employment DNA fields' : ''}
              >
                {isLoading ? 'Onboarding...' : !canSubmit ? 'Complete Required Fields' : 'Onboard Employee Twin'} <Check className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
