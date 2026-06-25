import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Users,
  Calendar as CalendarIcon,
  Award,
  Building2,
  Shield,
  FileText,
  Settings,
  Plus,
  Check,
  X,
  FilePlus,
  Send,
  UserCheck,
  TrendingUp,
  MapPin,
  Clock,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  Info,
  Search,
  MessageSquare,
  Activity,
  ThumbsUp,
  ThumbsDown,
  UserMinus,
  Sparkles,
  ClipboardCheck,
  FolderPlus,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import {
  useGetRecruitmentDashboardQuery,
  useGetRequisitionsQuery,
  useCreateRequisitionMutation,
  useSubmitRequisitionMutation,
  useApproveRequisitionMutation,
  useRejectRequisitionMutation,
  useGetJobPostingsQuery,
  useCreateJobPostingMutation,
  useChangeJobPostingStatusMutation,
  useGetCandidatesQuery,
  useCreateCandidateMutation,
  useMoveCandidateStageMutation,
  useGetCandidateNotesQuery,
  useAddCandidateNoteMutation,
  useGetCandidateActivitiesQuery,
  useGetInterviewsQuery,
  useScheduleInterviewMutation,
  useSubmitInterviewFeedbackMutation,
  useGetOffersQuery,
  useCreateOfferMutation,
  useApproveOfferMutation,
  useRejectOfferMutation,
  useAcceptOfferMutation,
  useGetTalentPoolsQuery,
  useCreateTalentPoolMutation,
  useAddCandidateToPoolMutation,
  useGetRequisitionCommentsQuery,
  useAddRequisitionCommentMutation,
  useGetRequisitionAttachmentsQuery,
  useAddRequisitionAttachmentMutation,
  useDeleteRequisitionAttachmentMutation,
  useGetRequisitionActivitiesQuery,
  useGetRequisitionCustomFieldsQuery,
  useGetRequisitionCustomValuesQuery,
  useSaveRequisitionCustomValuesMutation,
  useGetRequisitionBudgetAnalysisQuery,
  useGetRequisitionApprovalStepsQuery,
  useSaveRequisitionSkillsMutation
} from './recruitmentApi';
import { useAppSelector } from '../../app/hooks';
import clsx from 'clsx';
import { DatePicker } from '../employees/DatePicker';
import { useSaveFieldValuesMutation } from './recruitmentConfigApi';
import { ATSConfigTab } from './components/ATSConfigTab';
import { DynamicFormRenderer } from './components/DynamicFormRenderer';
import { RequisitionWizard } from './components/RequisitionWizard';
import { RequisitionDetailCockpit } from './components/RequisitionDetailCockpit';
import { EnterprisePositionDashboard } from './components/EnterprisePositionDashboard';
import { JobPostingGridAnalytics } from './components/JobPostingGridAnalytics';
import { CandidateWorkspace } from './components/CandidateWorkspace';
import { InterviewWorkspace } from './components/InterviewWorkspace';
import { useLocation } from 'react-router-dom';
import { formatCurrency } from '../../utils/currencyFormatter';


export function RecruitmentScreen() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'requisitions' | 'positions' | 'postings' | 'candidates' | 'pipeline' | 'interviews' | 'offers' | 'pools' | 'preboarding' | 'career' | 'analytics' | 'ats-config'>('dashboard');
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [selectedReqId, setSelectedReqId] = useState<string | null>(null);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Synchronize Tab and Selected Candidate with URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    const candParam = params.get('candidateId');
    if (tabParam) {
      setActiveTab(tabParam as any);
    }
    if (candParam) {
      setSelectedCandidateId(candParam);
    }
  }, [location.search]);

  // Collapsible sidebar auto-collapse trigger when Candidate Workspace is active
  useEffect(() => {
    if (selectedCandidateId) {
      window.dispatchEvent(new CustomEvent('collapse-sidebar', { detail: true }));
    } else {
      window.dispatchEvent(new CustomEvent('collapse-sidebar', { detail: false }));
    }
    return () => {
      window.dispatchEvent(new CustomEvent('collapse-sidebar', { detail: false }));
    };
  }, [selectedCandidateId]);

  const { data: dashboardStats, refetch: refetchDashboard } = useGetRecruitmentDashboardQuery();
  const { data: requisitions, refetch: refetchReqs } = useGetRequisitionsQuery();
  const { data: postings, refetch: refetchPostings } = useGetJobPostingsQuery();
  const { data: candidates, refetch: refetchCandidates } = useGetCandidatesQuery();
  const { data: interviews, refetch: refetchInterviews } = useGetInterviewsQuery();
  const { data: offers, refetch: refetchOffers } = useGetOffersQuery();
  const { data: pools, refetch: refetchPools } = useGetTalentPoolsQuery();

  const [createReq] = useCreateRequisitionMutation();
  const [submitReq] = useSubmitRequisitionMutation();
  const [approveReq] = useApproveRequisitionMutation();
  const [rejectReq] = useRejectRequisitionMutation();

  const [createPosting] = useCreateJobPostingMutation();
  const [changePostingStatus] = useChangeJobPostingStatusMutation();

  const [createCandidate] = useCreateCandidateMutation();
  const [moveCandidateStage] = useMoveCandidateStageMutation();

  const [scheduleInterview] = useScheduleInterviewMutation();
  const [submitFeedback] = useSubmitInterviewFeedbackMutation();

  const [createOffer] = useCreateOfferMutation();
  const [approveOffer] = useApproveOfferMutation();
  const [rejectOffer] = useRejectOfferMutation();
  const [acceptOffer] = useAcceptOfferMutation();

  const [createPool] = useCreateTalentPoolMutation();
  const [addCandidateToPool] = useAddCandidateToPoolMutation();
  const [saveCustomFieldValues] = useSaveFieldValuesMutation();
  const [saveRequisitionSkills] = useSaveRequisitionSkillsMutation();

  // Modals state
  const [showReqModal, setShowReqModal] = useState(false);
  const [showPostingModal, setShowPostingModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showPoolModal, setShowPoolModal] = useState(false);
  const [showCandidateDetailsModal, setShowCandidateDetailsModal] = useState(false);

  // Toast notifications state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const triggerToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Form selections / targets
  // Requisition list filters
  const [reqSearch, setReqSearch] = useState('');
  const [reqStatusFilter, setReqStatusFilter] = useState('');
  const [reqDeptFilter, setReqDeptFilter] = useState('');
  const [reqPriorityFilter, setReqPriorityFilter] = useState('');

  // Requisition Form
  const [reqTitle, setReqTitle] = useState('');
  const [reqDept, setReqDept] = useState('');
  const [reqVacancies, setReqVacancies] = useState(1);
  const [reqBudget, setReqBudget] = useState(120000);
  const [reqPriority, setReqPriority] = useState('MEDIUM');
  const [reqEmploymentType, setReqEmploymentType] = useState('FULL_TIME');

  // Job Posting Form
  const [postingTitle, setPostingTitle] = useState('');
  const [postingDesc, setPostingDesc] = useState('');
  const [postingSkills, setPostingSkills] = useState('');
  const [postingLoc, setPostingLoc] = useState('');
  const [postingSalary, setPostingSalary] = useState('');
  const [postingExp, setPostingExp] = useState('');

  // Offer Form
  const [offerCandidateId, setOfferCandidateId] = useState('');
  const [offerJobPostingId, setOfferJobPostingId] = useState('');
  const [offerCtc, setOfferCtc] = useState(150000);
  const [offerBonus, setOfferBonus] = useState(15000);
  const [offerDate, setOfferDate] = useState('');
  const [offerLoc, setOfferLoc] = useState('');

  // Interview Form
  const [intCandidateId, setIntCandidateId] = useState('');
  const [intJobPostingId, setIntJobPostingId] = useState('');
  const [intType, setIntType] = useState('TECHNICAL');
  const [intTime, setIntTime] = useState('');
  const [intInterviewers, setIntInterviewers] = useState('');

  // Feedback Scorecard Form
  const [feedbackRating, setFeedbackRating] = useState(4);
  const [techRating, setTechRating] = useState(4);
  const [commRating, setCommRating] = useState(4);
  const [problemRating, setProblemRating] = useState(4);
  const [cultureRating, setCultureRating] = useState(4);
  const [feedbackRec, setFeedbackRec] = useState('RECOMMEND_HIRE');
  const [feedbackComments, setFeedbackComments] = useState('');

  // Talent Pool Form
  const [poolName, setPoolName] = useState('');
  const [poolDesc, setPoolDesc] = useState('');
  const [poolDept, setPoolDept] = useState('');

  // Career Portal Form
  const [cName, setCName] = useState('');
  const [cEmail, setCEmail] = useState('');
  const [cPhone, setCPhone] = useState('');
  const [cLoc, setCLoc] = useState('');
  const [cCompany, setCCompany] = useState('');
  const [cDesignation, setCDesignation] = useState('');
  const [cExp, setCExp] = useState(3);
  const [cSalary, setCSalary] = useState(90000);
  const [cExpectedSalary, setCExpectedSalary] = useState(110000);
  const [cNotice, setCNotice] = useState(30);
  const [cSkills, setCSkills] = useState('');
  const [cResume, setCResume] = useState('');
  const [cJobId, setCJobId] = useState('');

  // AI Resume Parser Simulator state
  const [isParsing, setIsParsing] = useState(false);
  const [parsingProgress, setParsingProgress] = useState(0);
  const [parsingStep, setParsingStep] = useState('');
  const [parsedData, setParsedData] = useState<any>(null);

  // Preboarding state
  const [selectedPreboardCandidateId, setSelectedPreboardCandidateId] = useState<string | null>(null);
  const [preboardDocs, setPreboardDocs] = useState<Record<string, 'PENDING' | 'UPLOADED' | 'VERIFIED'>>({
    offerLetter: 'PENDING',
    aadhaar: 'PENDING',
    pan: 'PENDING'
  });
  const [aadhaarNo, setAadhaarNo] = useState('');
  const [panNo, setPanNo] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [bankIfsc, setBankIfsc] = useState('');
  const [preboardAddress, setPreboardAddress] = useState('');

  // Drag-and-drop state
  const [draggedOverStage, setDraggedOverStage] = useState<string | null>(null);

  // Candidate Details state
  const { data: candNotes } = useGetCandidateNotesQuery(selectedCandidateId || '', { skip: !selectedCandidateId });
  const { data: candActivities } = useGetCandidateActivitiesQuery(selectedCandidateId || '', { skip: !selectedCandidateId });
  const [newNoteText, setNewNoteText] = useState('');
  const [addNote] = useAddCandidateNoteMutation();

  const user = useAppSelector((state) => state.auth.user);
  const currentUserId = user?.id || '00000000-0000-0000-0000-000000000003';
  const [selectedInterviewId, setSelectedInterviewId] = useState<string | null>(null);

  // Talent Pipeline and Bulk Action states
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);
  const [pipelineJobFilter, setPipelineJobFilter] = useState('');
  const [pipelineSkillsFilter, setPipelineSkillsFilter] = useState('');
  const [pipelineLocFilter, setPipelineLocFilter] = useState('');
  const [bulkEmailSubject, setBulkEmailSubject] = useState('Acme HR Recruitment Updates');
  const [bulkEmailBody, setBulkEmailBody] = useState('Hello Candidate,\n\nWe wanted to share an update regarding your application process...');
  const [showBulkEmailModal, setShowBulkEmailModal] = useState(false);
  const [showBulkMoveModal, setShowBulkMoveModal] = useState(false);
  const [bulkMoveTargetStage, setBulkMoveTargetStage] = useState('SCREENING');

  // Digital Twin conversion states
  const [isConvertingTwin, setIsConvertingTwin] = useState(false);
  const [conversionStep, setConversionStep] = useState('');
  const [convertedEmployeeDetails, setConvertedEmployeeDetails] = useState<{ empCode: string; name: string } | null>(null);

  // Custom preboarding documents list
  const [customPreboardChecks, setCustomPreboardChecks] = useState<string[]>([]);
  const [newCheckName, setNewCheckName] = useState('');

  // Onboarding parameters states
  const [onboardLaptopBrand, setOnboardLaptopBrand] = useState('MacBook Pro M3');
  const [onboardManager, setOnboardManager] = useState('Marcus Chen');
  const [onboardBuddy, setOnboardBuddy] = useState('Sarah Jenkins');
  const [onboardGoals, setOnboardGoals] = useState('Complete Engineering Onboarding Checklist and push first PR.');
  const [onboardTrainingPlan, setOnboardTrainingPlan] = useState('Engineering BootCamp');
  const [onboardProbation, setOnboardProbation] = useState('3 Months');
  const [onboardCompletedChecks, setOnboardCompletedChecks] = useState<Record<string, boolean>>({});

  // Offer Letter and Approval simulation states
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [selectedOfferTemplate, setSelectedOfferTemplate] = useState('STANDARD');
  const [simulatedFinApproved, setSimulatedFinApproved] = useState<Record<string, boolean>>({});
  const [simulatedBizApproved, setSimulatedBizApproved] = useState<Record<string, boolean>>({});

  // Handlers
  const handleCreateReq = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createReq({
        title: reqTitle,
        department: reqDept,
        vacancies: reqVacancies,
        budget: reqBudget,
        priority: reqPriority,
        employmentType: reqEmploymentType,
        businessUnit: 'Engineering',
        location: 'HQ Bangalore',
        designation: reqTitle,
        grade: 'G3',
        band: 'B2',
        hiringReason: 'Team expansion',
        expectedJoiningDate: '2026-08-01'
      }).unwrap();
      setShowReqModal(false);
      setReqTitle('');
      refetchReqs();
      refetchDashboard();
      triggerToast("Requisition created successfully.", "success");
    } catch (err: any) {
      console.error(err);
      const isForbidden = err?.status === 403 || err?.status === 'PARSING_ERROR' || (err?.data && err.data.status === 403);
      const errMsg = isForbidden 
        ? "You do not have permission to create requisitions." 
        : (err?.data?.message || "Failed to create requisition.");
      triggerToast(errMsg, 'error');
    }
  };

  const handleCreatePosting = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPosting({
        jobTitle: postingTitle,
        jobDescription: postingDesc,
        skills: postingSkills,
        location: postingLoc,
        employmentType: 'FULL_TIME',
        salaryRange: postingSalary,
        experience: postingExp,
        status: 'PUBLISHED',
        applicationDeadline: '2026-09-01'
      }).unwrap();
      setShowPostingModal(false);
      setPostingTitle('');
      setPostingDesc('');
      setPostingSkills('');
      setPostingLoc('');
      setPostingSalary('');
      setPostingExp('');
      refetchPostings();
      refetchDashboard();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createOffer({
        candidate: { id: offerCandidateId } as any,
        jobPosting: { id: offerJobPostingId } as any,
        ctc: offerCtc,
        bonus: offerBonus,
        joiningDate: offerDate,
        location: offerLoc,
        status: 'DRAFT'
      }).unwrap();
      setShowOfferModal(false);
      refetchOffers();
      refetchDashboard();
    } catch (err) {
      console.error(err);
    }
  };

  const handleScheduleInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await scheduleInterview({
        candidate: { id: intCandidateId } as any,
        jobPosting: { id: intJobPostingId } as any,
        interviewType: intType,
        scheduledTime: intTime,
        interviewerIds: intInterviewers,
        status: 'SCHEDULED'
      }).unwrap();
      setShowInterviewModal(false);
      refetchInterviews();
      refetchDashboard();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInterviewId) return;
    try {
      await submitFeedback({
        id: selectedInterviewId,
        feedback: {
          interviewerId: currentUserId,
          technicalRating: techRating,
          communicationRating: commRating,
          problemSolvingRating: problemRating,
          cultureFitRating: cultureRating,
          overallRecommendation: feedbackRec,
          feedbackNotes: feedbackComments
        }
      }).unwrap();
      setShowFeedbackModal(false);
      setFeedbackComments('');
      refetchInterviews();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreatePool = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPool({
        poolName: poolName,
        description: poolDesc,
        department: poolDept
      }).unwrap();
      setShowPoolModal(false);
      setPoolName('');
      setPoolDesc('');
      setPoolDept('');
      refetchPools();
    } catch (err) {
      console.error(err);
    }
  };

  const handleApplyJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCandidate({
        fullName: cName,
        email: cEmail,
        phone: cPhone,
        location: cLoc,
        currentCompany: cCompany,
        currentDesignation: cDesignation,
        experienceYears: cExp,
        currentSalary: cSalary,
        expectedSalary: cExpectedSalary,
        noticePeriodDays: cNotice,
        skills: cSkills,
        resumeUrl: cResume || 'https://example.com/resume.pdf',
        status: 'APPLIED'
      }).unwrap();
      setCName('');
      setCEmail('');
      setCPhone('');
      refetchCandidates();
      refetchDashboard();
      alert('Application Submitted Successfully!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidateId || !newNoteText.trim()) return;
    try {
      await addNote({
        id: selectedCandidateId,
        noteText: newNoteText,
        authorId: currentUserId
      }).unwrap();
      setNewNoteText('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDragOverStage = (e: React.DragEvent, stage: string) => {
    e.preventDefault();
    setDraggedOverStage(stage);
  };

  const handleDragLeaveStage = () => {
    setDraggedOverStage(null);
  };

  const handleDropCandidate = async (e: React.DragEvent, targetStage: string) => {
    e.preventDefault();
    setDraggedOverStage(null);
    const candidateId = e.dataTransfer.getData('candidateId');
    if (!candidateId) return;
    try {
      await moveCandidateStage({ id: candidateId, status: targetStage }).unwrap();
      refetchCandidates();
      refetchDashboard();
    } catch (err) {
      console.error('Failed to drag and drop candidate:', err);
    }
  };

  const handleSimulateAiParse = () => {
    setIsParsing(true);
    setParsingProgress(10);
    setParsingStep('Initializing AI OCR Engine...');
    
    const steps = [
      { progress: 30, step: 'Extracting contact metadata & contact information...' },
      { progress: 65, step: 'Parsing professional experience timeline & matching designations...' },
      { progress: 85, step: 'Inferring candidate skill keywords...' },
      { progress: 100, step: 'AI parsing engine analysis complete!' }
    ];

    steps.forEach((s, index) => {
      setTimeout(() => {
        setParsingProgress(s.progress);
        setParsingStep(s.step);
        if (s.progress === 100) {
          setTimeout(() => {
            setIsParsing(false);
            const mockCandidates = [
              {
                fullName: 'Jane Smith',
                email: 'jane.smith@talentpool.io',
                phone: '555-0142',
                location: 'San Francisco, CA',
                currentCompany: 'TechSolutions Inc.',
                currentDesignation: 'Frontend Engineer',
                experienceYears: '4',
                noticePeriodDays: '30',
                skills: 'React, TypeScript, TailwindCSS, Jest',
                resumeUrl: 'https://managemyopz.s3.amazonaws.com/resumes/jane_smith_cv.pdf',
                expectedCtc: '135000',
                currentCtc: '115000'
              },
              {
                fullName: 'Alex Mercer',
                email: 'alex.mercer@devops.net',
                phone: '555-0987',
                location: 'Seattle, WA',
                currentCompany: 'CloudScale Corp',
                currentDesignation: 'DevOps Engineer',
                experienceYears: '6',
                noticePeriodDays: '15',
                skills: 'AWS, Kubernetes, Docker, Terraform, CI/CD',
                resumeUrl: 'https://managemyopz.s3.amazonaws.com/resumes/alex_mercer_devops.pdf',
                expectedCtc: '160000',
                currentCtc: '140000'
              },
              {
                fullName: 'Sarah Connor',
                email: 'sarah.c@securitylabs.com',
                phone: '555-0321',
                location: 'Austin, TX',
                currentCompany: 'Cyberdyne Systems',
                currentDesignation: 'Backend Developer',
                experienceYears: '5',
                noticePeriodDays: '45',
                skills: 'Java, Spring Boot, MySQL, Redis, REST APIs',
                resumeUrl: 'https://managemyopz.s3.amazonaws.com/resumes/sarah_connor_backend.pdf',
                expectedCtc: '145000',
                currentCtc: '120005'
              }
            ];
            const randCand = mockCandidates[Math.floor(Math.random() * mockCandidates.length)];
            setParsedData(randCand);
            alert(`AI Resume Parser complete! Extracted: ${randCand.fullName}. Form fields preloaded.`);
          }, 450);
        }
      }, (index + 1) * 550);
    });
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#F8FAFC] dark:bg-[#060814] overflow-hidden text-slate-800 dark:text-slate-100 animate-fade-in">
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed bottom-5 right-5 px-4 py-2.5 rounded-xl border text-xs font-bold shadow-lg z-50 animate-fade-in flex items-center gap-2 ${
          toast.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-250 dark:border-emerald-900/60'
            : 'bg-red-50 dark:bg-red-950/80 text-red-800 dark:text-red-300 border-red-250 dark:border-red-900/60'
        }`}>
          {toast.type === 'success' ? <Check size={14} /> : <X size={14} />}
          {toast.message}
        </div>
      )}

      {/* Top Header Row with Dynamic Title and Global Actions */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B0F19] px-6 py-4 flex items-center justify-between shrink-0 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {activeTab === 'dashboard' && 'Dashboard Reports'}
            {activeTab === 'requisitions' && 'Requisitions'}
            {activeTab === 'positions' && 'Position Management Center'}
            {activeTab === 'postings' && 'Jobs Management'}
            {activeTab === 'candidates' && 'Candidates Directory'}
            {activeTab === 'pipeline' && 'Candidate Pipeline'}
            {activeTab === 'interviews' && 'Interviews Workspace'}
            {activeTab === 'offers' && 'Offers Center'}
            {activeTab === 'preboarding' && 'Preboarding'}
            {activeTab === 'analytics' && 'Insights'}
            {activeTab === 'ats-config' && 'Settings'}
          </h1>
          <p className="text-[10px] text-[#64748B] font-semibold mt-0.5">
            {activeTab === 'dashboard' && "Review your organization's recruitment throughput and pipeline performance."}
            {activeTab === 'requisitions' && 'Manage and approve headcount requests and new requisitions.'}
            {activeTab === 'positions' && 'Track approved positions, workforce capacity and budgets.'}
            {activeTab === 'postings' && 'Manage published positions and recruitment campaigns.'}
            {activeTab === 'candidates' && 'Review applicant pools, source information and profile files.'}
            {activeTab === 'pipeline' && 'Track applicant transitions across screening stages.'}
            {activeTab === 'interviews' && 'Organize schedules, evaluation criteria and interviewer scorecards.'}
            {activeTab === 'offers' && 'Review candidate offer packages, base pay levels and structures.'}
            {activeTab === 'preboarding' && 'Track accepted candidates and transition them to employee twin records.'}
            {activeTab === 'analytics' && 'Recruitment funnel conversions and source efficacy reporting.'}
            {activeTab === 'ats-config' && 'Configure custom forms, stages and automation rules.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowReqModal(true)}
            className="bg-[#6366F1] hover:bg-[#4F46E5] text-white text-[11px] font-black py-2.5 px-4 rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus size={14} />
            <span>New Requisition</span>
          </button>
        </div>
      </header>

      {/* ── Tab Content Workspace ── */}
      <main className="flex-1 min-w-0 w-full overflow-x-hidden overflow-y-auto p-6 relative">
        {/* ── 1. DASHBOARD TAB ── */}
        {activeTab === 'dashboard' && (
          <div className="w-full max-w-none m-0 space-y-6 animate-fade-in pb-10">
            {/* Header: Greeting & Date Range */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                  Good morning, Robert! 👋
                </h1>
                <p className="text-xs text-slate-400 dark:text-slate-555 font-bold mt-1">Here's what's happening in your recruitment pipeline today.</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="bg-white dark:bg-[#0B0F19] hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold py-2 px-3.5 rounded-xl flex items-center gap-2 shadow-sm transition-all">
                  <CalendarIcon size={14} className="text-slate-400" />
                  <span>May 26 - Jun 1, 2026</span>
                  <ChevronDown size={12} className="text-slate-400" />
                </button>
              </div>
            </div>

            {/* Row of 5 Stats Cards */}
            <div className="ats-kpi-grid">
              {[
                { 
                  title: 'OPEN REQUISITIONS', 
                  value: dashboardStats?.openRequisitions ?? 12, 
                  trend: '↑ 2 vs last week', 
                  bgColor: 'bg-purple-50 dark:bg-purple-950/20 text-[#5D69F4]',
                  icon: FileText
                },
                { 
                  title: 'PUBLISHED JOBS', 
                  value: dashboardStats?.openJobs ?? 28, 
                  trend: '↑ 5 vs last week', 
                  bgColor: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400',
                  icon: Briefcase
                },
                { 
                  title: 'TOTAL CANDIDATES', 
                  value: dashboardStats?.candidatesApplied ?? 246, 
                  trend: '↑ 18 vs last week', 
                  bgColor: 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400',
                  icon: Users
                },
                { 
                  title: 'INTERVIEWS SCHEDULED', 
                  value: 36, 
                  trend: '↑ 6 vs last week', 
                  bgColor: 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400',
                  icon: CalendarIcon
                },
                { 
                  title: 'OFFERS ACCEPTED', 
                  value: dashboardStats?.offersAccepted ?? 9, 
                  trend: '↑ 3 vs last week', 
                  bgColor: 'bg-teal-50 dark:bg-teal-950/20 text-teal-650 dark:text-teal-400',
                  icon: UserCheck,
                  highlight: true
                }
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div 
                    key={i} 
                    className="bg-white dark:bg-[#0B0F19] p-5 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] border-none flex flex-col justify-between h-28"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider">{stat.title}</span>
                      <span className={clsx('p-1 rounded-lg', stat.bgColor)}>
                        <Icon size={12} />
                      </span>
                    </div>
                    <div>
                      <p className="text-3xl font-bold tracking-tight text-[#0F172A] dark:text-white">{stat.value}</p>
                      <p className="text-[10px] text-[#64748B] font-semibold mt-1 flex items-center gap-1">
                        <span className="text-[#22C55E] font-bold">{stat.trend.split(' ')[0] || '↑ 12%'}</span> {stat.trend.split(' ').slice(1).join(' ')}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Middle Section: Funnel, Sourcing, Recent Activity */}
            <div className="ats-analytics-row">
              {/* Funnel Chart Card */}
              <div className="bg-white dark:bg-[#0B0F19] p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-[0_1px_3px_rgba(0,0,0,0.08)] flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">Hiring Funnel</h3>
                    <span className="text-[10px] text-slate-400 font-bold hover:underline cursor-pointer flex items-center gap-0.5">
                      This Month <ChevronDown size={10} />
                    </span>
                  </div>
                  <div className="flex items-center gap-4 pt-2">
                    <div className="shrink-0 w-[110px] h-[130px] flex items-center justify-center">
                      <svg width="110" height="130" viewBox="0 0 200 200" className="w-full h-full">
                        {/* Stage 1 (Applied) - Indigo */}
                        <polygon points="10,10 190,10 175,40 25,40" fill="#5D69F4" className="transition-all hover:opacity-90 cursor-pointer" />
                        {/* Stage 2 (Screening) - Blue */}
                        <polygon points="25,45 175,45 160,75 40,75" fill="#3B82F6" className="transition-all hover:opacity-90 cursor-pointer" />
                        {/* Stage 3 (Interview) - Teal/Cyan */}
                        <polygon points="40,80 160,80 145,110 55,110" fill="#06B6D4" className="transition-all hover:opacity-90 cursor-pointer" />
                        {/* Stage 4 (Offered) - Orange */}
                        <polygon points="55,115 145,115 130,145 70,145" fill="#F59E0B" className="transition-all hover:opacity-90 cursor-pointer" />
                        {/* Stage 5 (Accepted) - Green */}
                        <polygon points="70,150 130,150 115,180 85,180" fill="#10B981" className="transition-all hover:opacity-90 cursor-pointer" />
                      </svg>
                    </div>
                    {/* Funnel Legend */}
                    <div className="flex-1 space-y-2 text-[10px] font-semibold">
                      {[
                        { name: 'Applied', count: 246, pct: '100%', color: '#5D69F4' },
                        { name: 'Screening', count: 98, pct: '39.8%', color: '#3B82F6' },
                        { name: 'Interview', count: 56, pct: '22.8%', color: '#06B6D4' },
                        { name: 'Offered', count: 15, pct: '6.1%', color: '#F59E0B' },
                        { name: 'Accepted', count: 9, pct: '3.7%', color: '#10B981' }
                      ].map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center">
                          <span className="flex items-center gap-1 text-slate-500 font-bold">
                            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                            {item.name}
                          </span>
                          <div className="text-right">
                            <span className="font-extrabold text-slate-800 dark:text-slate-250">{item.count}</span>
                            <span className="text-[9px] text-slate-400 font-bold ml-1.5">{item.pct}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveTab('analytics')}
                  className="w-full text-center text-xs font-bold text-[#5D69F4] hover:underline pt-3 border-t border-slate-100 dark:border-slate-850/60 mt-3 flex items-center justify-between"
                >
                  <span>View Full Funnel Analysis</span>
                  <ChevronRight size={14} />
                </button>
              </div>

              {/* Sourcing Channel Card */}
              <div className="bg-white dark:bg-[#0B0F19] p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-[0_1px_3px_rgba(0,0,0,0.08)] flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">Candidates by Source</h3>
                    <span className="text-[10px] text-slate-400 font-bold hover:underline cursor-pointer flex items-center gap-0.5">
                      This Month <ChevronDown size={10} />
                    </span>
                  </div>
                  <div className="flex items-center gap-4 pt-2">
                    <div className="shrink-0 w-[100px] h-[100px] relative flex items-center justify-center">
                      <svg width="100" height="100" viewBox="0 0 120 120" className="w-full h-full transform -rotate-90">
                        <circle cx="60" cy="60" r="40" fill="transparent" stroke="#5D69F4" strokeWidth="14" strokeDasharray="79.6 251.2" strokeDashoffset="0" />
                        <circle cx="60" cy="60" r="40" fill="transparent" stroke="#3B82F6" strokeWidth="14" strokeDasharray="65.3 251.2" strokeDashoffset="-79.6" />
                        <circle cx="60" cy="60" r="40" fill="transparent" stroke="#06B6D4" strokeWidth="14" strokeDasharray="43.0 251.2" strokeDashoffset="-144.9" />
                        <circle cx="60" cy="60" r="40" fill="transparent" stroke="#F59E0B" strokeWidth="14" strokeDasharray="28.6 251.2" strokeDashoffset="-187.9" />
                        <circle cx="60" cy="60" r="40" fill="transparent" stroke="#8B5CF6" strokeWidth="14" strokeDasharray="18.3 251.2" strokeDashoffset="-216.5" />
                        <circle cx="60" cy="60" r="40" fill="transparent" stroke="#94A3B8" strokeWidth="14" strokeDasharray="16.4 251.2" strokeDashoffset="-234.8" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-base font-black text-slate-800 dark:text-white leading-none">246</span>
                        <span className="text-[8px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">Total</span>
                      </div>
                    </div>
                    {/* Legend */}
                    <div className="flex-1 space-y-1 text-[9px] font-bold">
                      {[
                        { name: 'LinkedIn', count: 78, pct: '31.7%', color: '#5D69F4' },
                        { name: 'Career Portal', count: 64, pct: '26.0%', color: '#3B82F6' },
                        { name: 'Referral', count: 42, pct: '17.1%', color: '#06B6D4' },
                        { name: 'Naukri', count: 28, pct: '11.4%', color: '#F59E0B' },
                        { name: 'Consultancy', count: 18, pct: '7.3%', color: '#8B5CF6' },
                        { name: 'Others', count: 16, pct: '6.5%', color: '#94A3B8' }
                      ].map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center">
                          <span className="flex items-center gap-1 text-slate-500 font-bold truncate max-w-[70px]">
                            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                            {item.name}
                          </span>
                          <span className="font-extrabold text-slate-700 dark:text-slate-300">{item.count} ({item.pct})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveTab('analytics')}
                  className="w-full text-center text-xs font-bold text-[#5D69F4] hover:underline pt-3 border-t border-slate-100 dark:border-slate-850/60 mt-3 flex items-center justify-between"
                >
                  <span>View Source Analytics</span>
                  <ChevronRight size={14} />
                </button>
              </div>

              {/* Recent Activity Card */}
              <div className="bg-white dark:bg-[#0B0F19] p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-[0_1px_3px_rgba(0,0,0,0.08)] flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">Recent Activity</h3>
                    <span 
                      onClick={() => setActiveTab('pipeline')}
                      className="text-[10px] text-[#5D69F4] font-bold hover:underline cursor-pointer"
                    >
                      View All
                    </span>
                  </div>
                  {/* Activity Timeline List */}
                  <div className="space-y-3.5 pt-1">
                    {[
                      { 
                        title: 'John Doe accepted the job offer', 
                        desc: 'Software Engineer • 2 hours ago', 
                        color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-450',
                        icon: Check
                      },
                      { 
                        title: 'Interview scheduled with Sarah Wilson', 
                        desc: 'Product Manager • 4 hours ago', 
                        color: 'bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400',
                        icon: CalendarIcon
                      },
                      { 
                        title: 'New application received', 
                        desc: 'Michael Brown - UX Designer • 5 hours ago', 
                        color: 'bg-purple-50 text-purple-600 dark:bg-purple-950/20 dark:text-purple-400',
                        icon: Users
                      },
                      { 
                        title: 'Offer released to Emily Davis', 
                        desc: 'Data Analyst • 8 hours ago', 
                        color: 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400',
                        icon: FileText
                      },
                      { 
                        title: 'Requisition "Marketing Manager" approved', 
                        desc: 'Approved by James Smith • 1 day ago', 
                        color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-450',
                        icon: Check
                      }
                    ].map((item, idx) => {
                      const ActIcon = item.icon;
                      return (
                        <div key={idx} className="flex gap-3 text-xs">
                          <div className={clsx('w-6.5 h-6.5 rounded-lg flex items-center justify-center shrink-0 mt-0.5', item.color)}>
                            <ActIcon size={13} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-extrabold text-slate-800 dark:text-slate-200 leading-snug">{item.title}</h4>
                            <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold mt-0.5">{item.desc}</p>
                          </div>
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 self-center" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section: Open Requisitions, Interviews This Week, Top Recruiters */}
            <div className="ats-analytics-row">
              {/* Open Requisitions Table Widget */}
              <div className="bg-white dark:bg-[#0B0F19] p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-[0_1px_3px_rgba(0,0,0,0.08)] flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">Open Requisitions</h3>
                    <span 
                      onClick={() => setActiveTab('requisitions')}
                      className="text-[10px] text-[#5D69F4] font-bold hover:underline cursor-pointer"
                    >
                      View All
                    </span>
                  </div>
                  {/* Table */}
                  <div className="ats-table-container overflow-x-auto">
                    <table className="w-full text-left text-[10px] border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800/80 text-slate-450 dark:text-slate-550 font-bold">
                          <th className="pb-2">REQUISITION</th>
                          <th className="pb-2">POSITION</th>
                          <th className="pb-2">DEPARTMENT</th>
                          <th className="pb-2">CANDIDATES</th>
                          <th className="pb-2">STATUS</th>
                          <th className="pb-2 text-right"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 dark:divide-slate-850/50">
                        {[
                          { code: 'REQ-692162', pos: 'Software Engineer', dept: 'Engineering', count: 18, status: 'OPEN' },
                          { code: 'REQ-657893', pos: 'Product Manager', dept: 'Product', count: 12, status: 'OPEN' },
                          { code: 'REQ-445780', pos: 'UX Designer', dept: 'Design', count: 8, status: 'OPEN' },
                          { code: 'REQ-334221', pos: 'Data Analyst', dept: 'Analytics', count: 6, status: 'OPEN' }
                        ].map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 cursor-pointer" onClick={() => setActiveTab('requisitions')}>
                            <td className="py-2.5 font-bold text-slate-700 dark:text-slate-300">{row.code}</td>
                            <td className="py-2.5 font-extrabold text-slate-900 dark:text-white">{row.pos}</td>
                            <td className="py-2.5 font-bold text-slate-400 dark:text-slate-555">{row.dept}</td>
                            <td className="py-2.5 font-extrabold text-slate-800 dark:text-slate-200">{row.count}</td>
                            <td className="py-2.5">
                               <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-[9px] font-black rounded border border-emerald-100/50 dark:border-emerald-900/30">
                                 {row.status}
                               </span>
                            </td>
                            <td className="py-2.5 text-right"><ChevronRight size={12} className="text-slate-400 inline" /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Interviews This Week */}
              <div className="bg-white dark:bg-[#0B0F19] p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-[0_1px_3px_rgba(0,0,0,0.08)] flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">Interviews This Week</h3>
                    <span 
                      onClick={() => setActiveTab('interviews')}
                      className="text-[10px] text-[#5D69F4] font-bold hover:underline cursor-pointer"
                    >
                      View Calendar
                    </span>
                  </div>
                  {/* Interview List */}
                  <div className="space-y-3.5">
                    {[
                      { name: 'Sarah Wilson', pos: 'Product Manager', time: 'May 28, 10:00 AM', color: 'bg-rose-100 text-rose-750 dark:bg-rose-950/20 dark:text-rose-400' },
                      { name: 'Michael Brown', pos: 'UX Designer', time: 'May 28, 02:00 PM', color: 'bg-blue-100 text-blue-750 dark:bg-blue-950/20 dark:text-blue-400' },
                      { name: 'Emily Davis', pos: 'Data Analyst', time: 'May 29, 11:00 AM', color: 'bg-amber-100 text-amber-750 dark:bg-amber-950/20 dark:text-amber-400' },
                      { name: 'David Lee', pos: 'Software Engineer', time: 'May 30, 10:30 AM', color: 'bg-purple-100 text-purple-750 dark:bg-purple-950/20 dark:text-purple-450' }
                    ].map((row, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[10px] font-bold">
                        <div className="flex items-center gap-2">
                          <div className={clsx('w-7 h-7 rounded-full flex items-center justify-center font-bold text-[9px] uppercase shrink-0 shadow-sm', row.color)}>
                            {row.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <h4 className="font-extrabold text-slate-800 dark:text-slate-200 leading-snug">{row.name}</h4>
                            <p className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold">{row.pos}</p>
                          </div>
                        </div>
                        <span className="text-slate-500 font-bold">{row.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Top Recruiters */}
              <div className="bg-white dark:bg-[#0B0F19] p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-[0_1px_3px_rgba(0,0,0,0.08)] flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">Top Recruiters</h3>
                    <span className="text-[10px] text-slate-400 font-bold hover:underline cursor-pointer flex items-center gap-0.5">
                      This Month <ChevronDown size={10} />
                    </span>
                  </div>
                  {/* Table */}
                  <div className="ats-table-container overflow-x-auto">
                    <table className="w-full text-left text-[10px] border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800/80 text-slate-450 dark:text-slate-550 font-bold">
                          <th className="pb-2">RECRUITER</th>
                          <th className="pb-2">HIRES</th>
                          <th className="pb-2">OPEN JOBS</th>
                          <th className="pb-2">AVG. TIME TO HIRE</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 dark:divide-slate-850/50">
                        {[
                          { name: 'Robert Johnson', sub: 'You', hires: 6, jobs: 8, time: '18 days', up: false },
                          { name: 'James Smith', sub: '', hires: 4, jobs: 6, time: '22 days', up: false },
                          { name: 'Jessica Williams', sub: '', hires: 3, jobs: 5, time: '25 days', up: false },
                          { name: 'Michael Chen', sub: '', hires: 2, jobs: 4, time: '28 days', up: true }
                        ].map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/10">
                            <td className="py-2 flex items-center gap-2">
                              <div className="w-6.5 h-6.5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-[9px] uppercase shrink-0 text-slate-600 dark:text-slate-300">
                                {row.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div>
                                <span className="font-extrabold text-slate-900 dark:text-white leading-tight">{row.name}</span>
                                {row.sub && (
                                  <span className="ml-1 px-1 py-0.2 bg-amber-50 dark:bg-amber-955 text-amber-600 text-[8px] font-black rounded-sm border border-amber-100/50 dark:border-amber-900/30">
                                    {row.sub}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-2 font-black text-slate-800 dark:text-slate-200">{row.hires}</td>
                            <td className="py-2 font-bold text-slate-500">{row.jobs}</td>
                            <td className="py-2 font-bold text-slate-700 dark:text-slate-350">
                              <span className="flex items-center gap-1">
                                {row.time}
                                <span className={row.up ? 'text-rose-500' : 'text-emerald-500'}>
                                  {row.up ? '↑' : '↓'}
                                </span>
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── 2. REQUISITIONS CENTER TAB ── */}
        {activeTab === 'requisitions' && (() => {
          const selectedReq = requisitions?.find(r => r.id === selectedReqId);
          
          const filteredReqs = requisitions?.filter(r => {
            const matchesSearch = !reqSearch.trim() || 
              r.title?.toLowerCase().includes(reqSearch.toLowerCase()) || 
              r.reqNumber?.toLowerCase().includes(reqSearch.toLowerCase());
            const matchesStatus = !reqStatusFilter || r.status === reqStatusFilter;
            const matchesDept = !reqDeptFilter || r.department === reqDeptFilter;
            const matchesPriority = !reqPriorityFilter || r.priority === reqPriorityFilter;
            return matchesSearch && matchesStatus && matchesDept && matchesPriority;
          }) || [];

          const uniqueDepts = Array.from(new Set(requisitions?.map(r => r.department).filter(Boolean) || []));

          return (
            <div className="space-y-6">
              {/* Top Cockpit Title & Quick Action */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Manpower Requisition Center</h1>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-bold mt-1">Manage departmental vacancies and manpower requests.</p>
                </div>
                <button
                  onClick={() => setShowReqModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-sm transition-all"
                >
                  <Plus size={16} /> Create Requisition
                </button>
              </div>

              {/* Master-Detail Layout Panel */}
              <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-210px)] min-h-[550px] overflow-hidden">
                
                {/* LEFT SIDE: Requisition Directory List (35% width on desktop) */}
                <div className={clsx(
                  "w-full lg:w-[35%] flex flex-col h-full bg-white dark:bg-[#0B0F19] border border-slate-200/65 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden",
                  selectedReq ? "hidden lg:flex" : "flex"
                )}>
                  {/* Filters Header block */}
                  <div className="p-4 border-b border-slate-100 dark:border-slate-850 space-y-3 shrink-0 bg-slate-50/50 dark:bg-slate-900/10">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search Requisition..."
                        value={reqSearch}
                        onChange={e => setReqSearch(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-3 pr-8 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 dark:text-white font-medium"
                      />
                      {reqSearch && (
                        <button onClick={() => setReqSearch('')} className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600">
                          <X size={14} />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {/* Status Filter */}
                      <div className="flex flex-col gap-1">
                        <select
                          value={reqStatusFilter}
                          onChange={e => setReqStatusFilter(e.target.value)}
                          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-1.5 text-[10px] font-bold text-slate-500 outline-none cursor-pointer"
                        >
                          <option value="">Status: All</option>
                          <option value="DRAFT">Draft</option>
                          <option value="PENDING_APPROVAL">Pending</option>
                          <option value="APPROVED">Approved</option>
                          <option value="REJECTED">Rejected</option>
                        </select>
                      </div>

                      {/* Department Filter */}
                      <div className="flex flex-col gap-1">
                        <select
                          value={reqDeptFilter}
                          onChange={e => setReqDeptFilter(e.target.value)}
                          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-1.5 text-[10px] font-bold text-slate-500 outline-none cursor-pointer truncate"
                        >
                          <option value="">Dept: All</option>
                          {uniqueDepts.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                          ))}
                        </select>
                      </div>

                      {/* Priority Filter */}
                      <div className="flex flex-col gap-1">
                        <select
                          value={reqPriorityFilter}
                          onChange={e => setReqPriorityFilter(e.target.value)}
                          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-1.5 text-[10px] font-bold text-slate-500 outline-none cursor-pointer"
                        >
                          <option value="">Priority: All</option>
                          <option value="LOW">Low</option>
                          <option value="MEDIUM">Medium</option>
                          <option value="HIGH">High</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Scrollable Cards List */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin bg-slate-50/20 dark:bg-slate-950/5">
                    {filteredReqs.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12">
                        <AlertCircle size={24} className="mb-2 text-slate-300" />
                        <span className="font-bold text-xs">No requisitions matched.</span>
                      </div>
                    ) : (
                      filteredReqs.map((req) => {
                        const isSelected = selectedReqId === req.id;
                        return (
                          <div
                            key={req.id}
                            onClick={() => setSelectedReqId(req.id)}
                            className={clsx(
                              "p-4 rounded-2xl border transition-all duration-200 cursor-pointer relative shadow-sm",
                              isSelected 
                                ? "border-indigo-500 bg-indigo-500/5 dark:bg-indigo-950/10 shadow-[0_4px_12px_rgba(93,105,244,0.06)]" 
                                : "border-slate-200/70 dark:border-slate-800 bg-white dark:bg-[#0B0F19] hover:bg-slate-50/80 dark:hover:bg-slate-850/40"
                            )}
                          >
                            {/* Blue left border indicator for selected card */}
                            {isSelected && (
                              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-650 rounded-l-2xl" />
                            )}
                            
                            <div className="flex justify-between items-start">
                              <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">{req.reqNumber}</span>
                              <span className={clsx(
                                'px-2 py-0.5 rounded-full text-[9px] font-black uppercase border',
                                req.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-450 dark:border-emerald-900/30' :
                                req.status === 'PENDING_APPROVAL' ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/20 dark:text-amber-450 dark:border-amber-900/30' :
                                req.status === 'REJECTED' ? 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/20 dark:text-rose-450 dark:border-rose-900/30' :
                                'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800'
                              )}>
                                {req.status?.replace('_', ' ')}
                              </span>
                            </div>
                            
                            <h3 className="font-extrabold text-sm text-slate-800 dark:text-white mt-1.5 leading-snug">{req.title}</h3>
                            
                            <div className="flex items-center gap-1.5 mt-2 text-[10px] font-bold text-slate-400">
                              <span>{req.department}</span>
                              <span>•</span>
                              <span>{req.vacancies} {req.vacancies === 1 ? 'Vacancy' : 'Vacancies'}</span>
                            </div>
                            
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-850">
                              <span className={clsx(
                                'px-1.5 py-0.2 rounded text-[9px] font-black uppercase border',
                                req.priority === 'HIGH' ? 'bg-rose-50 text-rose-600 border-rose-150 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/20' :
                                req.priority === 'MEDIUM' ? 'bg-amber-50 text-amber-600 border-amber-150 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/20' :
                                'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800'
                              )}>
                                {req.priority}
                              </span>
                              <span className="text-[11px] font-black text-slate-800 dark:text-slate-200">${(req.budget ?? 0).toLocaleString()}</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* RIGHT SIDE: Detail Workspace (65% width on desktop) */}
                <div className={clsx(
                  "w-full lg:w-[65%] h-full flex flex-col",
                  !selectedReq ? "hidden lg:flex" : "flex"
                )}>
                  {selectedReq ? (
                    <RequisitionDetailCockpit
                      requisition={selectedReq}
                      onClose={() => setSelectedReqId(null)}
                      currentUserId={currentUserId}
                      refetchReqs={refetchReqs}
                      refetchDashboard={refetchDashboard}
                      showBackButton={true}
                      onPublishJob={(req) => {
                        setPostingTitle(req.title);
                        setPostingDesc(`We are hiring a ${req.title} for the ${req.department} department. This is a ${req.employmentType?.replace('_', ' ') || 'full-time'} role.`);
                        setPostingLoc(req.location || 'Bangalore HQ');
                        setPostingSalary(`$${((req.budget ?? 0) * 0.8).toLocaleString()} - $${(req.budget ?? 0).toLocaleString()}`);
                        setPostingExp('3-5 Years');
                        setShowPostingModal(true);
                      }}
                    />
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center bg-white dark:bg-[#0B0F19] border border-slate-200/65 dark:border-slate-800/80 rounded-2xl p-6 text-center text-slate-400 shadow-sm">
                      <HelpCircle size={36} className="text-slate-300 dark:text-slate-700 mb-3 animate-pulse" />
                      <h4 className="font-extrabold text-sm text-slate-700 dark:text-slate-200">No Requisition Selected</h4>
                      <p className="text-xs text-slate-400 dark:text-slate-550 mt-1 max-w-[280px]">Select a requisition from the directory on the left to view comprehensive details, approve requests, and publish jobs.</p>
                    </div>
                  )}
                </div>

              </div>
            </div>
          );
        })()}

        {/* ── 3. POSITION MANAGEMENT TAB ── */}
        {activeTab === 'positions' && (
          <EnterprisePositionDashboard
            requisitions={requisitions}
            candidates={candidates}
            postings={postings}
            onPublishJob={(req) => {
              setPostingTitle(req.title);
              setPostingDesc(`We are hiring a ${req.title} for the ${req.department} department. Designation: ${req.designation || 'Specialist'}. Minimum experience required: ${req.minExperience || 3} years.`);
              setPostingSkills(req.requiredSkills || 'Java, Spring Boot, React');
              setPostingLoc(req.location || 'Bangalore HQ');
              setPostingSalary(`$${(req.minBudget || req.budget * 0.8 || 80000).toLocaleString()} - $${(req.maxBudget || req.budget * 1.2 || 120000).toLocaleString()}`);
              setPostingExp(`${req.minExperience || 3}-${req.maxExperience || 5} Years`);
              setShowPostingModal(true);
            }}
            onViewCandidates={(title) => {
              setActiveTab('candidates');
            }}
          />
        )}

        {/* ── 4. JOB POSTING CENTER TAB ── */}
        {activeTab === 'postings' && (
          <JobPostingGridAnalytics
            postings={postings}
            candidates={candidates}
            requisitions={requisitions}
            onPublishNew={(prefilled) => {
              setPostingTitle(prefilled.jobTitle || '');
              setPostingDesc(prefilled.jobDescription || '');
              setPostingSkills(prefilled.skills || '');
              setPostingLoc(prefilled.location || '');
              setPostingSalary(prefilled.salaryRange || '');
              setPostingExp(prefilled.experience || '');
              setShowPostingModal(true);
            }}
            onChangeStatus={async (id, currentStatus) => {
              const nextStatus = currentStatus === 'PUBLISHED' ? 'PAUSED' : 'PUBLISHED';
              await changePostingStatus({ id, status: nextStatus }).unwrap();
              refetchPostings();
            }}
            onViewApplicants={(jobTitle) => {
              setActiveTab('candidates');
            }}
          />
        )}

        {/* ── 5. CANDIDATE DIRECTORY TAB ── */}
        {activeTab === 'candidates' && (
          selectedCandidateId ? (
            <CandidateWorkspace
              candidate={candidates?.find(c => c.id === selectedCandidateId)!}
              onBack={() => setSelectedCandidateId(null)}
            />
          ) : (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl font-extrabold tracking-tight">Candidate Applicant Directory</h1>
                <p className="text-xs text-slate-400 font-bold mt-1">Access applicant profiles, resumes, and manager scorecards.</p>
              </div>

              <div className="bg-white dark:bg-[#0B0F19] rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-bold">
                        <th className="p-4">Candidate Code</th>
                        <th className="p-4">Name</th>
                        <th className="p-4">Contact</th>
                        <th className="p-4">Current Employer</th>
                        <th className="p-4">Exp (Yrs)</th>
                        <th className="p-4">Expected Salary</th>
                        <th className="p-4">Resume</th>
                        <th className="p-4">Stage</th>
                        <th className="p-4 text-right">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {candidates?.map((cand) => (
                        <tr
                          key={cand.id}
                          onClick={() => setSelectedCandidateId(cand.id)}
                          className="border-b border-slate-200/50 dark:border-slate-800/40 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 cursor-pointer"
                        >
                          <td className="p-4 font-bold">{cand.candidateCode}</td>
                          <td className="p-4 font-extrabold text-indigo-650 dark:text-indigo-400">{cand.fullName}</td>
                          <td className="p-4 font-medium">
                            <p>{cand.email}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{cand.phone}</p>
                          </td>
                          <td className="p-4">
                            <p className="font-bold">{cand.currentDesignation || 'N/A'}</p>
                            <p className="text-[10px] text-slate-400">{cand.currentCompany || 'N/A'}</p>
                          </td>
                          <td className="p-4 font-bold">{cand.experienceYears ?? 0}</td>
                          <td className="p-4 font-medium">${(cand.expectedSalary ?? 0).toLocaleString()}</td>
                          <td className="p-4" onClick={e => e.stopPropagation()}>
                            <a href={cand.resumeUrl} target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-indigo-455 font-bold hover:underline flex items-center gap-1">
                              <FileText size={14} /> View Resume
                            </a>
                          </td>
                          <td className="p-4">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border bg-blue-50 text-blue-600 border-blue-200">
                              {cand.status}
                            </span>
                          </td>
                          <td className="p-4 text-right" onClick={e => e.stopPropagation()}>
                            <button
                              onClick={() => { setSelectedCandidateId(cand.id); setShowCandidateDetailsModal(true); }}
                              className="bg-slate-50 hover:bg-slate-150 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 font-bold py-1 px-2.5 rounded-lg text-[10px]"
                            >
                              Timeline & Comments
                            </button>
                          </td>
                        </tr>
                      ))}
                      {candidates?.length === 0 && (
                        <tr>
                          <td colSpan={9} className="p-8 text-center text-slate-400 font-medium">No applicant profiles registered.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )
        )}

        {/* ── 6. TALENT PIPELINE CENTER (Phase 2) ── */}
        {activeTab === 'pipeline' && (() => {
          // Candidates filtered by pipeline criteria
          const filteredCandidates = (candidates || []).filter(c => {
            if (pipelineJobFilter && c.currentDesignation && !c.currentDesignation.toLowerCase().includes(pipelineJobFilter.toLowerCase())) return false;
            if (pipelineSkillsFilter && c.skills && !c.skills.toLowerCase().includes(pipelineSkillsFilter.toLowerCase())) return false;
            if (pipelineLocFilter && c.location && !c.location.toLowerCase().includes(pipelineLocFilter.toLowerCase())) return false;
            return true;
          });

          // Metrics computations
          const totalCandidatesCount = filteredCandidates.length;
          const passThroughCount = filteredCandidates.filter(c => ['INTERVIEW', 'OFFER', 'ACCEPTED', 'JOINED'].includes(c.status.toUpperCase())).length;
          const passThroughRate = totalCandidatesCount > 0 ? Math.round((passThroughCount / totalCandidatesCount) * 100) : 0;
          const referralCount = filteredCandidates.filter(c => c.source?.toLowerCase().includes('referral')).length;

          // Stages list
          const pipelineStages = ['APPLIED', 'SCREENING', 'SHORTLISTED', 'ASSESSMENT', 'INTERVIEW', 'OFFER', 'ACCEPTED', 'PREBOARDING', 'JOINED', 'REJECTED'];

          // Bulk action operations
          const triggerBulkMove = async (targetStage: string) => {
            if (selectedCandidateIds.length === 0) return;
            try {
              for (const cid of selectedCandidateIds) {
                await moveCandidateStage({ id: cid, status: targetStage }).unwrap();
              }
              setSelectedCandidateIds([]);
              refetchCandidates();
              refetchDashboard();
              triggerToast(`Successfully transitioned ${selectedCandidateIds.length} candidates to ${targetStage}.`, 'success');
            } catch (err) {
              console.error(err);
              triggerToast('Failed to execute bulk stage transition.', 'error');
            }
          };

          const triggerBulkReject = async () => {
            if (selectedCandidateIds.length === 0) return;
            if (!confirm(`Are you sure you want to REJECT the ${selectedCandidateIds.length} selected candidates?`)) return;
            try {
              for (const cid of selectedCandidateIds) {
                await moveCandidateStage({ id: cid, status: 'REJECTED' }).unwrap();
              }
              setSelectedCandidateIds([]);
              refetchCandidates();
              refetchDashboard();
              triggerToast(`Rejected ${selectedCandidateIds.length} candidates.`, 'success');
            } catch (err) {
              console.error(err);
              triggerToast('Failed to reject candidates.', 'error');
            }
          };

          const triggerBulkEmailSend = () => {
            setShowBulkEmailModal(false);
            triggerToast(`Simulated dispatch of emails to ${selectedCandidateIds.length} selected candidates.`, 'success');
            setSelectedCandidateIds([]);
          };

          return (
            <div className="space-y-6">
              
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-extrabold tracking-tight">Talent Pipeline Center</h1>
                  <p className="text-xs text-slate-400 font-bold mt-1">Monitor candidate journeys, apply filters, and dispatch bulk actions.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedCandidateIds((candidates || []).map(c => c.id))}
                    className="bg-slate-50 hover:bg-slate-100 text-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-300 font-bold py-1.5 px-3 rounded-xl border border-slate-200/60 dark:border-slate-800 text-[10px]"
                  >
                    Select All
                  </button>
                  <button
                    onClick={() => setSelectedCandidateIds([])}
                    className="bg-slate-50 hover:bg-slate-100 text-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-300 font-bold py-1.5 px-3 rounded-xl border border-slate-200/60 dark:border-slate-800 text-[10px]"
                  >
                    Clear Selection
                  </button>
                </div>
              </div>

              {/* Pipeline Filters & Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white dark:bg-[#0B0F19] rounded-2xl border border-slate-200/60 dark:border-slate-800/80 p-5 shadow-sm text-xs">
                
                {/* Filters */}
                <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-4 border-r border-slate-100 dark:border-slate-800/60 pr-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Position Title</label>
                    <select
                      value={pipelineJobFilter}
                      onChange={e => setPipelineJobFilter(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 text-slate-850 dark:text-slate-200"
                    >
                      <option value="">All Job Positions</option>
                      {postings?.map(p => (
                        <option key={p.id} value={p.jobTitle}>{p.jobTitle}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-bold">Skills Search</label>
                    <input
                      type="text"
                      placeholder="e.g. React, Java..."
                      value={pipelineSkillsFilter}
                      onChange={e => setPipelineSkillsFilter(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-bold">Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Bangalore, Pune..."
                      value={pipelineLocFilter}
                      onChange={e => setPipelineLocFilter(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                {/* Analytics */}
                <div className="lg:col-span-4 grid grid-cols-2 gap-4 pl-2">
                  <div className="space-y-1">
                    <span className="text-[9px] text-[#64748B] font-bold uppercase">Pass-Through Rate</span>
                    <p className="font-extrabold text-base text-[#0F172A] dark:text-white">{passThroughRate}%</p>
                    <p className="text-[9px] text-slate-400 font-medium">Applied to Interview/Offer</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] text-[#64748B] font-bold uppercase">Source Efficacy</span>
                    <p className="font-extrabold text-base text-[#0F172A] dark:text-white">{referralCount} Referrals</p>
                    <p className="text-[9px] text-slate-400 font-medium">Out of {totalCandidatesCount} active profiles</p>
                  </div>
                </div>
              </div>

              {/* Bulk Actions Dashboard */}
              {selectedCandidateIds.length > 0 && (
                <div className="bg-indigo-50/45 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/80 p-4 rounded-2xl flex items-center justify-between text-xs animate-slide-in">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-650 text-white font-extrabold flex items-center justify-center text-[10px]">{selectedCandidateIds.length}</span>
                    <span className="font-extrabold text-indigo-750 dark:text-indigo-300">Candidates Selected for Bulk Action</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowBulkMoveModal(true)}
                      className="bg-indigo-650 hover:bg-indigo-700 text-white font-bold py-1.5 px-3 rounded-lg"
                    >
                      Bulk Move Stage
                    </button>
                    <button
                      onClick={() => setShowBulkEmailModal(true)}
                      className="bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-350 font-bold py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700"
                    >
                      Bulk Email
                    </button>
                    <button
                      onClick={triggerBulkReject}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold py-1.5 px-3 rounded-lg border border-rose-200"
                    >
                      Bulk Reject
                    </button>
                  </div>
                </div>
              )}

              {/* Pipeline Kanban Board Columns */}
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
                {pipelineStages.map((stage) => {
                  const stageCandidates = filteredCandidates.filter(c => c.status === stage);
                  return (
                    <div
                      key={stage}
                      onDragOver={(e) => handleDragOverStage(e, stage)}
                      onDragLeave={handleDragLeaveStage}
                      onDrop={(e) => handleDropCandidate(e, stage)}
                      className={clsx(
                        "w-72 rounded-2xl border p-4 shrink-0 flex flex-col h-[600px] shadow-sm transition-all duration-250",
                        draggedOverStage === stage
                          ? "bg-indigo-50/15 border-indigo-500 ring-4 ring-indigo-500/10 dark:bg-indigo-950/10"
                          : "bg-white dark:bg-[#0B0F19] border-slate-200/60 dark:border-slate-800/80"
                      )}
                    >
                      {/* Column Header */}
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-3">
                        <h4 className="text-[10px] font-black tracking-wider text-slate-450 uppercase">{stage.replace('_', ' ')}</h4>
                        <span className="text-[10px] bg-slate-550 text-slate-700 dark:text-slate-300 font-black px-1.5 py-0.5 rounded-full">{stageCandidates.length}</span>
                      </div>

                      {/* Candidates Cards Container */}
                      <div className="flex-1 overflow-y-auto space-y-3 scrollbar-none">
                        {stageCandidates.map((cand) => {
                          const isSelected = selectedCandidateIds.includes(cand.id);
                          return (
                            <div
                              key={cand.id}
                              draggable
                              onDragStart={(e) => e.dataTransfer.setData('candidateId', cand.id)}
                              className={clsx(
                                "p-4 rounded-xl border hover:shadow-md transition-all cursor-pointer space-y-3 relative group",
                                isSelected ? "bg-indigo-50/20 border-indigo-400 dark:bg-indigo-950/10" : "bg-slate-50 dark:bg-slate-900/60 border-slate-250/60 dark:border-slate-800"
                              )}
                              onClick={() => { setSelectedCandidateId(cand.id); setActiveTab('candidates'); }}
                            >
                              {/* Selection Checkbox */}
                              <div className="absolute top-3 right-3" onClick={e => e.stopPropagation()}>
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => {
                                    setSelectedCandidateIds(prev =>
                                      isSelected ? prev.filter(id => id !== cand.id) : [...prev, cand.id]
                                    );
                                  }}
                                  className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-650 outline-none focus:ring-0"
                                />
                              </div>

                              <div>
                                <h5 className="text-xs font-black text-indigo-650 dark:text-indigo-400 group-hover:underline">{cand.fullName}</h5>
                                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{cand.currentDesignation || 'No Designation'}</p>
                              </div>
                              
                              <div className="flex flex-wrap gap-1 text-[9px] font-bold text-slate-500">
                                {cand.skills?.split(',').slice(0, 3).map((s, i) => (
                                  <span key={i} className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700 rounded">
                                    {s.trim()}
                                  </span>
                                ))}
                              </div>

                              <div className="flex justify-between items-center pt-2 border-t border-slate-200/60 dark:border-slate-800">
                                <span className="text-[9px] text-slate-400 font-semibold">{cand.location}</span>
                                <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                                  {stage !== 'REJECTED' && (
                                    <button
                                      onClick={async () => { await moveCandidateStage({ id: cand.id, status: 'REJECTED' }).unwrap(); refetchCandidates(); refetchDashboard(); }}
                                      title="Reject"
                                      className="p-1 bg-rose-50 hover:bg-rose-150 text-rose-600 rounded border border-rose-150"
                                    >
                                      <X size={12} />
                                    </button>
                                  )}
                                  {stage === 'APPLIED' && (
                                    <button
                                      onClick={async () => { await moveCandidateStage({ id: cand.id, status: 'SCREENING' }).unwrap(); refetchCandidates(); refetchDashboard(); }}
                                      title="Move to Screening"
                                      className="p-1 bg-indigo-50 hover:bg-indigo-150 text-indigo-650 rounded border border-indigo-150"
                                    >
                                      <ChevronRight size={12} />
                                    </button>
                                  )}
                                  {stage === 'SCREENING' && (
                                    <button
                                      onClick={async () => { await moveCandidateStage({ id: cand.id, status: 'SHORTLISTED' }).unwrap(); refetchCandidates(); refetchDashboard(); }}
                                      title="Move to Shortlisted"
                                      className="p-1 bg-indigo-50 hover:bg-indigo-150 text-indigo-650 rounded border border-indigo-150"
                                    >
                                      <ChevronRight size={12} />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        {stageCandidates.length === 0 && (
                          <p className="text-[10px] text-slate-400 py-6 text-center">Empty Stage</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bulk Email Modal */}
              {showBulkEmailModal && (
                <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center">
                  <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full mx-4 space-y-4 shadow-2xl animate-fade-in text-xs">
                    <div className="flex justify-between items-center pb-2 border-b">
                      <h3 className="text-sm font-extrabold">Dispatch Bulk Email Notification</h3>
                      <button onClick={() => setShowBulkEmailModal(false)} className="text-slate-400 hover:text-slate-655"><X size={16} /></button>
                    </div>
                    <div className="space-y-3">
                      <p className="text-slate-455 font-bold">Recipients: <span className="font-extrabold text-indigo-650">{selectedCandidateIds.length} candidate(s)</span></p>
                      <div className="space-y-1">
                        <label className="font-bold text-slate-400 uppercase text-[10px]">Subject</label>
                        <input
                          type="text"
                          value={bulkEmailSubject}
                          onChange={e => setBulkEmailSubject(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-slate-400 uppercase text-[10px]">Email Body Content</label>
                        <textarea
                          rows={4}
                          value={bulkEmailBody}
                          onChange={e => setBulkEmailBody(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 outline-none"
                        />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button onClick={triggerBulkEmailSend} className="flex-1 bg-indigo-650 hover:bg-indigo-700 text-white font-bold py-2 rounded-xl">Send Updates</button>
                        <button onClick={() => setShowBulkEmailModal(false)} className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 rounded-xl font-bold">Cancel</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bulk Move Modal */}
              {showBulkMoveModal && (
                <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center">
                  <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-sm w-full mx-4 space-y-4 shadow-2xl animate-fade-in text-xs">
                    <div className="flex justify-between items-center pb-2 border-b">
                      <h3 className="text-sm font-extrabold">Bulk Target Stage Selector</h3>
                      <button onClick={() => setShowBulkMoveModal(false)} className="text-slate-400 hover:text-slate-655"><X size={16} /></button>
                    </div>
                    <div className="space-y-3">
                      <p className="text-slate-455 font-bold">Move <span className="font-extrabold text-indigo-650">{selectedCandidateIds.length} candidate(s)</span> to stage:</p>
                      <select
                        value={bulkMoveTargetStage}
                        onChange={e => setBulkMoveTargetStage(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 outline-none"
                      >
                        {pipelineStages.map(stg => (
                          <option key={stg} value={stg}>{stg}</option>
                        ))}
                      </select>
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => {
                            triggerBulkMove(bulkMoveTargetStage);
                            setShowBulkMoveModal(false);
                          }}
                          className="flex-1 bg-indigo-650 hover:bg-indigo-700 text-white font-bold py-2 rounded-xl"
                        >
                          Execute Transition
                        </button>
                        <button onClick={() => setShowBulkMoveModal(false)} className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 rounded-xl font-bold">Cancel</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          );
        })()}
        
        {/* ── 7. INTERVIEW CENTER TAB ── */}
        {activeTab === 'interviews' && (
          <InterviewWorkspace
            interviews={interviews}
            refetchInterviews={refetchInterviews}
            onScheduleNew={() => setShowInterviewModal(true)}
          />
        )}

        {/* ── 8. OFFER MANAGEMENT HUB & TEMPLATE BUILDER (Phase 4) ── */}
        {activeTab === 'offers' && (() => {
          // Dashboard statistics
          const releasedCount = offers?.filter(o => o.status === 'RELEASED').length || 0;
          const acceptedCount = offers?.filter(o => o.status === 'ACCEPTED').length || 0;
          const rejectedCount = offers?.filter(o => o.status === 'REJECTED').length || 0;
          const expiredCount = 1; // Simulated expired package for dashboard completeness

          const selectedOffer = offers?.find(o => o.id === selectedOfferId) || offers?.[0];

          // Compute approval states
          const isFinApproved = selectedOffer ? (simulatedFinApproved[selectedOffer.id] || selectedOffer.status !== 'DRAFT') : false;
          const isBizApproved = selectedOffer ? (simulatedBizApproved[selectedOffer.id] || selectedOffer.status !== 'DRAFT') : false;
          const allApprovalsCleared = isFinApproved && isBizApproved;

          // Template text helper
          const getTemplateText = (template: string, off: any) => {
            if (!off) return 'No offer selected.';
            const name = off.candidate?.fullName || 'John Doe';
            const title = off.jobPosting?.jobTitle || 'Software Engineer';
            const ctcVal = off.ctc ? formatCurrency(off.ctc) : '₹12,00,000';
            const bonusVal = off.bonus ? formatCurrency(off.bonus) : '₹1,20,000';
            const locVal = off.location || 'Bangalore HQ';
            const joinVal = off.joiningDate || '2026-08-01';

            if (template === 'EXECUTIVE') {
              return `EXECUTIVE APPOINTMENT AGREEMENT\n\nDear ${name},\n\nWe are pleased to appoint you to the executive leadership position of ${title} at Acme Systems.\n\nCOMPENSATION STRUCTURE:\n- Base Executive Salary: ${ctcVal} per annum\n- Target Performance Incentive: ${bonusVal} annually\n- Work Mode & Location: ${locVal}\n- Commencement Date: ${joinVal}\n\nThis offer is subject to reference validation and background verification checks.\n\nSigned,\nBoard of Directors, Acme Corp`;
            }
            if (template === 'INTERN') {
              return `TECHNICAL INTERNSHIP CONTRACT\n\nDear ${name},\n\nCongratulations on being selected for the Tech Intern position (${title}) at Acme Systems.\n\nSTIPEND DETAILS:\n- Monthly Consolidated Stipend: ${ctcVal} (calculated pro-rata)\n- Location: ${locVal}\n- Start Date: ${joinVal}\n\nWe look forward to an amazing learning journey together!\n\nAcme HR Operations Team`;
            }
            // Default Standard
            return `OFFER OF EMPLOYMENT\n\nDear ${name},\n\nWe are absolutely thrilled to extend you this offer of employment for the role of ${title} at Acme Systems.\n\nYour starting compensation package includes:\n- Gross Annual CTC: ${ctcVal}\n- Annual Performance Bonus: ${bonusVal}\n- Primary Reporting Location: ${locVal}\n- Expected Joining Date: ${joinVal}\n\nWe are confident your skills and expertise will be a phenomenal addition to our team.\n\nWarm regards,\nAcme HR Recruitment Team`;
          };

          return (
            <div className="space-y-6">
              
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-extrabold tracking-tight">Offer Management Hub</h1>
                  <p className="text-xs text-slate-400 font-bold mt-1">Design offer letters, configure variables, and run multi-level approval workflows.</p>
                </div>
                <button
                  onClick={() => setShowOfferModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-sm transition-all"
                >
                  <Plus size={16} /> New Offer Package
                </button>
              </div>

              {/* Offer Dashboard Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Released Letters', val: releasedCount, color: 'text-blue-600 bg-blue-500/10' },
                  { label: 'Candidate Accepted', val: acceptedCount, color: 'text-emerald-600 bg-emerald-500/10' },
                  { label: 'Candidate Rejected', val: rejectedCount, color: 'text-rose-600 bg-rose-500/10' },
                  { label: 'Expired Offers', val: expiredCount, color: 'text-slate-500 bg-slate-500/10' }
                ].map((met, i) => (
                  <div key={i} className="p-4 bg-white dark:bg-[#0B0F19] rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">{met.label}</span>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={clsx('w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black', met.color)}>
                        ✓
                      </span>
                      <span className="text-lg font-black">{met.val}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Main Cockpit columns */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Side: Offers List */}
                <div className="lg:col-span-5 space-y-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Active Offer Proposals</h3>
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                    {offers?.map((off) => {
                      const isSelected = selectedOffer?.id === off.id;
                      return (
                        <div
                          key={off.id}
                          onClick={() => setSelectedOfferId(off.id)}
                          className={clsx(
                            'p-4 rounded-2xl border transition-all cursor-pointer space-y-3',
                            isSelected
                              ? 'bg-indigo-50/15 border-indigo-500 shadow-md'
                              : 'bg-white dark:bg-[#0B0F19] border-slate-200/60 dark:border-slate-800/80 hover:border-slate-300'
                          )}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-xs font-black text-slate-850 dark:text-slate-200">{off.candidate?.fullName}</h4>
                              <p className="text-[10px] text-indigo-650 dark:text-indigo-400 font-bold mt-0.5">{off.jobPosting?.jobTitle}</p>
                            </div>
                            <span className={clsx(
                              'px-2 py-0.5 rounded-full text-[9px] font-extrabold border',
                              off.status === 'ACCEPTED' ? 'bg-emerald-50 text-emerald-600 border-emerald-150' :
                              off.status === 'RELEASED' ? 'bg-blue-50 text-blue-600 border-blue-150' :
                              off.status === 'REJECTED' ? 'bg-rose-50 text-rose-600 border-rose-150' : 'bg-slate-100 text-slate-600 border-slate-200'
                            )}>
                              {off.status}
                            </span>
                          </div>

                          <div className="flex justify-between items-center text-[10px] text-slate-455 pt-2 border-t border-slate-100 dark:border-slate-850">
                            <span className="font-extrabold">${(off.ctc ?? 0).toLocaleString()} CTC</span>
                            <span className="font-semibold">{off.location}</span>
                          </div>
                        </div>
                      );
                    })}

                    {offers?.length === 0 && (
                      <div className="text-center py-8 text-slate-400 text-xs bg-white dark:bg-[#0B0F19] rounded-2xl border border-slate-200/60 dark:border-slate-800/80 p-5">
                        No active offers configured.
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Side: Template Editor and Approval Tracker */}
                <div className="lg:col-span-7">
                  {selectedOffer ? (
                    <div className="bg-white dark:bg-[#0B0F19] rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm p-6 space-y-6 text-xs">
                      
                      {/* Template Selector */}
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Offer Letter Template</label>
                          <select
                            value={selectedOfferTemplate}
                            onChange={e => setSelectedOfferTemplate(e.target.value)}
                            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 outline-none font-bold text-slate-700 dark:text-slate-300"
                          >
                            <option value="STANDARD">Standard Offer Letter</option>
                            <option value="EXECUTIVE">Executive Appointment Letter</option>
                            <option value="INTERN">Technical Internship Agreement</option>
                          </select>
                        </div>
                        <button
                          onClick={() => alert(`Official Offer Letter PDF generated and cached under artifact directory for ${selectedOffer.candidate?.fullName}`)}
                          className="bg-slate-50 hover:bg-slate-100 text-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-300 font-bold py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-1.5"
                        >
                          <FileText size={13} /> Download Letter PDF
                        </button>
                      </div>

                      {/* Letter Preview Screen */}
                      <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-xl border border-slate-250/60 dark:border-slate-800/80 font-mono text-[11px] leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto text-slate-750 dark:text-slate-350 shadow-inner">
                        {getTemplateText(selectedOfferTemplate, selectedOffer)}
                      </div>

                      {/* Approval Matrix Workflow */}
                      <div className="space-y-3">
                        <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Approval Matrix & Status</h4>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                          
                          <div className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800 text-center">
                            <p className="font-extrabold text-[9px] text-slate-400 uppercase">1. Recruiter</p>
                            <span className="inline-block mt-1.5 text-[9px] bg-emerald-50 text-emerald-600 border border-emerald-150 px-1.5 py-0.5 rounded font-black">APPROVED</span>
                          </div>

                          <div className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800 text-center">
                            <p className="font-extrabold text-[9px] text-slate-400 uppercase">2. Dept Head</p>
                            <span className="inline-block mt-1.5 text-[9px] bg-emerald-50 text-emerald-600 border border-emerald-150 px-1.5 py-0.5 rounded font-black">APPROVED</span>
                          </div>

                          <div className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800 text-center flex flex-col justify-between items-center min-h-[64px]">
                            <p className="font-extrabold text-[9px] text-slate-400 uppercase">3. Finance</p>
                            {isFinApproved ? (
                              <span className="text-[9px] bg-emerald-50 text-emerald-600 border border-emerald-150 px-1.5 py-0.5 rounded font-black">APPROVED</span>
                            ) : (
                              <button
                                onClick={() => setSimulatedFinApproved(prev => ({ ...prev, [selectedOffer.id]: true }))}
                                className="text-[8px] bg-indigo-50 hover:bg-indigo-150 text-indigo-650 font-bold px-1 py-0.5 rounded border border-indigo-200 mt-1"
                              >
                                Approve
                              </button>
                            )}
                          </div>

                          <div className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800 text-center flex flex-col justify-between items-center min-h-[64px]">
                            <p className="font-extrabold text-[9px] text-slate-400 uppercase">4. Biz Head</p>
                            {isBizApproved ? (
                              <span className="text-[9px] bg-emerald-50 text-emerald-600 border border-emerald-150 px-1.5 py-0.5 rounded font-black">APPROVED</span>
                            ) : (
                              <button
                                onClick={() => setSimulatedBizApproved(prev => ({ ...prev, [selectedOffer.id]: true }))}
                                className="text-[8px] bg-indigo-50 hover:bg-indigo-150 text-indigo-650 font-bold px-1 py-0.5 rounded border border-indigo-200 mt-1"
                              >
                                Approve
                              </button>
                            )}
                          </div>

                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3 pt-3 border-t border-slate-100 dark:border-slate-850">
                        {selectedOffer.status === 'DRAFT' && (
                          <>
                            <button
                              disabled={!allApprovalsCleared}
                              onClick={async () => {
                                await approveOffer({ id: selectedOffer.id, approverId: currentUserId }).unwrap();
                                refetchOffers();
                                triggerToast('Offer released to candidate successfully.', 'success');
                              }}
                              className={clsx(
                                "flex-1 py-2.5 px-4 rounded-xl font-bold transition shadow-sm",
                                allApprovalsCleared
                                  ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                                  : "bg-slate-100 dark:bg-slate-900 text-slate-400 cursor-not-allowed border border-slate-200 dark:border-slate-800"
                              )}
                            >
                              {allApprovalsCleared ? 'Release Offer Letter' : 'Pending Core Approvals'}
                            </button>
                            <button
                              onClick={async () => {
                                await rejectOffer({ id: selectedOffer.id, approverId: currentUserId }).unwrap();
                                refetchOffers();
                              }}
                              className="bg-rose-50 hover:bg-rose-150 text-rose-600 font-bold py-2.5 px-4 rounded-xl border border-rose-150"
                            >
                              Reject Draft
                            </button>
                          </>
                        )}

                        {selectedOffer.status === 'RELEASED' && (
                          <button
                            onClick={async () => {
                              await acceptOffer(selectedOffer.id).unwrap();
                              refetchOffers();
                              refetchCandidates();
                              refetchDashboard();
                              alert('Offer accepted! Candidate transitioned to Preboarding. Onboarding Digital Twin initialized.');
                            }}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2.5 rounded-xl shadow-sm flex items-center justify-center gap-1.5"
                          >
                            <Check size={14} /> Simulate Candidate Acceptance
                          </button>
                        )}
                      </div>

                    </div>
                  ) : (
                    <div className="bg-white dark:bg-[#0B0F19] rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm p-8 text-center text-slate-400 font-medium">
                      Select an offer proposal to open the Template Builder and Approval workspace.
                    </div>
                  )}
                </div>

              </div>
            </div>
          );
        })()}
        

        {/* ── 9. TALENT POOLS TAB ── */}
        {activeTab === 'pools' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-extrabold tracking-tight">Talent Pools</h1>
                <p className="text-xs text-slate-400 font-bold mt-1">Categorize applicants into active departmental pipelines.</p>
              </div>
              <button
                onClick={() => setShowPoolModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-sm transition-all"
              >
                <Plus size={16} /> Create Talent Pool
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {pools?.map((pool) => (
                <div key={pool.id} className="bg-white dark:bg-[#0B0F19] rounded-2xl border border-slate-200/60 dark:border-slate-800/85 p-5 shadow-sm space-y-4">
                  <div>
                    <h3 className="text-sm font-extrabold text-indigo-650 dark:text-indigo-400">{pool.poolName}</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{pool.description}</p>
                    <p className="text-[10px] text-slate-400 font-bold mt-2">Department: {pool.department}</p>
                  </div>
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-450">{pool.candidates?.length ?? 0} Members</span>
                  </div>
                </div>
              ))}
              {pools?.length === 0 && (
                <div className="col-span-3 bg-white dark:bg-[#0B0F19] rounded-2xl border border-slate-200/50 dark:border-slate-850 p-8 text-center text-slate-400 font-medium">No talent pools created.</div>
              )}
            </div>
          </div>
        )}

        {/* ── 9.5 PREBOARDING & ONBOARDING WORKSPACE (Phase 5, 6, & 7) ── */}
        {activeTab === 'preboarding' && (() => {
          const acceptedCandidates = candidates?.filter(c => c.status === 'ACCEPTED') || [];
          const joinedCandidates = candidates?.filter(c => c.status === 'JOINED') || [];

          const selectedCand = candidates?.find(c => c.id === selectedPreboardCandidateId);
          const relatedOffer = offers?.find(o => o.candidate?.id === selectedPreboardCandidateId);

          // Calculate progress percentage
          const getProgressPercent = () => {
            if (!selectedCand) return 0;
            let score = 0;
            if (preboardDocs.aadhaar === 'VERIFIED') score += 15;
            if (preboardDocs.pan === 'VERIFIED') score += 15;
            if (preboardDocs.passport === 'VERIFIED') score += 15;
            if (bankAccount) score += 15;
            if (preboardAddress) score += 15;
            
            // Custom checks contribution
            if (customPreboardChecks.length > 0) {
              const checkedCustom = customPreboardChecks.filter(c => onboardCompletedChecks[c]).length;
              score += Math.round((checkedCustom / customPreboardChecks.length) * 25);
            } else {
              score += 25; // Default 25 if no custom checks are declared
            }
            return score;
          };

          // Onboarding launch handler
          const handleLaunchOnboarding = (e: React.FormEvent) => {
            e.preventDefault();
            triggerToast(`Onboarding journey initialized: Laptop ${onboardLaptopBrand} provisioned, manager ${onboardManager} assigned, buddy ${onboardBuddy} connected.`, 'success');
            setSelectedPreboardCandidateId(null);
            setConvertedEmployeeDetails(null);
          };

          // Start Digital Twin Conversion Sequence
          const startDigitalTwinConversion = async () => {
            if (!selectedPreboardCandidateId || !selectedCand) return;
            setIsConvertingTwin(true);
            setConversionStep('Generating unique Employee Code...');
            
            setTimeout(() => {
              setConversionStep('Creating Employee Digital Twin record in system registry...');
              setTimeout(() => {
                setConversionStep('Populating Org DNA reporting line nodes...');
                setTimeout(() => {
                  setConversionStep('Initializing leave credit balances & payroll wallets...');
                  setTimeout(async () => {
                    try {
                      await moveCandidateStage({ id: selectedPreboardCandidateId, status: 'JOINED' }).unwrap();
                      refetchCandidates();
                      refetchDashboard();
                      setIsConvertingTwin(false);
                      setConversionStep('');
                      const code = `EMP-2026-${Math.floor(Math.random() * 899 + 100)}`;
                      setConvertedEmployeeDetails({
                        empCode: code,
                        name: selectedCand.fullName
                      });
                      triggerToast('Employee Digital Twin successfully converted & registered!', 'success');
                    } catch (err) {
                      console.error(err);
                      setIsConvertingTwin(false);
                      setConversionStep('');
                      triggerToast('Conversion failed during registry write.', 'error');
                    }
                  }, 1000);
                }, 1000);
              }, 1000);
            }, 1000);
          };

          return (
            <div className="space-y-6">
              
              {/* Header */}
              <div>
                <h1 className="text-xl font-extrabold tracking-tight">Preboarding & Onboarding Workspace</h1>
                <p className="text-xs text-slate-400 font-bold mt-1">Audit onboarding document completeness, run automated Digital Twin conversion, and configure training plans.</p>
              </div>

              {/* Layout splits */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Side: Candidates in Preboarding & Joined lists */}
                <div className="lg:col-span-4 space-y-4">
                  
                  {/* Accepted Candidates (Preboarding) */}
                  <div className="bg-white dark:bg-[#0B0F19] rounded-2xl border border-slate-200/60 dark:border-slate-800/80 p-4 shadow-sm h-72 flex flex-col">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">Accepted Candidates (Preboarding)</h3>
                    <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                      {acceptedCandidates.map((cand) => (
                        <button
                          key={cand.id}
                          onClick={() => {
                            setSelectedPreboardCandidateId(cand.id);
                            setConvertedEmployeeDetails(null);
                            setPreboardDocs({ offerLetter: 'VERIFIED', aadhaar: 'PENDING', pan: 'PENDING', passport: 'PENDING' });
                          }}
                          className={clsx(
                            'w-full p-3 rounded-xl text-left border transition-all space-y-1',
                            selectedPreboardCandidateId === cand.id && !convertedEmployeeDetails
                              ? 'bg-indigo-50/50 border-indigo-500 dark:bg-indigo-950/20'
                              : 'bg-slate-50/50 dark:bg-[#131926]/40 border-slate-200/60 dark:border-slate-850 hover:bg-slate-50'
                          )}
                        >
                          <h4 className="text-xs font-black text-indigo-650 dark:text-indigo-400">{cand.fullName}</h4>
                          <p className="text-[9px] text-slate-500 font-medium">Notice: {cand.noticePeriodDays || 30} days | CTC: ${cand.expectedSalary || 'N/A'}</p>
                        </button>
                      ))}
                      {acceptedCandidates.length === 0 && (
                        <p className="text-xs text-slate-400 py-12 text-center">No candidates in ACCEPTED stage.</p>
                      )}
                    </div>
                  </div>

                  {/* Joined Candidates (Onboarding Activation) */}
                  <div className="bg-white dark:bg-[#0B0F19] rounded-2xl border border-slate-200/60 dark:border-slate-800/80 p-4 shadow-sm h-72 flex flex-col">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">Joined Candidates (Ready to Onboard)</h3>
                    <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                      {joinedCandidates.map((cand) => (
                        <button
                          key={cand.id}
                          onClick={() => {
                            setSelectedPreboardCandidateId(cand.id);
                            setConvertedEmployeeDetails({
                              empCode: `EMP-2026-${Math.floor(Math.random() * 899 + 100)}`,
                              name: cand.fullName
                            });
                          }}
                          className={clsx(
                            'w-full p-3 rounded-xl text-left border transition-all space-y-1',
                            selectedPreboardCandidateId === cand.id && convertedEmployeeDetails
                              ? 'bg-emerald-50/50 border-emerald-500 dark:bg-emerald-950/20'
                              : 'bg-slate-50/50 dark:bg-[#131926]/40 border-slate-200/60 dark:border-slate-850 hover:bg-slate-50'
                          )}
                        >
                          <h4 className="text-xs font-black text-emerald-650 dark:text-emerald-400">{cand.fullName}</h4>
                          <p className="text-[9px] text-slate-500 font-medium">Joined | Ready for Org Alignment</p>
                        </button>
                      ))}
                      {joinedCandidates.length === 0 && (
                        <p className="text-xs text-slate-400 py-12 text-center">No candidates in JOINED stage.</p>
                      )}
                    </div>
                  </div>

                </div>

                {/* Right Side: Active Workspace */}
                <div className="lg:col-span-8 bg-white dark:bg-[#0B0F19] rounded-2xl border border-slate-200/60 dark:border-slate-800/80 p-6 shadow-sm min-h-[580px] text-xs">
                  
                  {isConvertingTwin ? (
                    /* Conversion Animation Screen */
                    <div className="flex flex-col items-center justify-center h-full py-20 space-y-4">
                      <div className="w-12 h-12 border-4 border-indigo-650 border-t-transparent rounded-full animate-spin"></div>
                      <h3 className="text-sm font-extrabold text-slate-700 dark:text-slate-200">Executing Employee Digital Twin Conversion</h3>
                      <p className="text-xs text-slate-400 font-bold max-w-xs text-center">{conversionStep}</p>
                    </div>
                  ) : convertedEmployeeDetails ? (
                    
                    /* Success / Onboarding configuration panel (Phase 7) */
                    <form onSubmit={handleLaunchOnboarding} className="space-y-6 animate-fade-in">
                      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
                        <h3 className="text-sm font-extrabold text-emerald-800 flex items-center gap-1.5"><Check size={16} /> Employee Twin Activated</h3>
                        <p className="text-xs text-emerald-700">Digital twin record successfully synchronized in the HRMS database.</p>
                        <div className="grid grid-cols-2 gap-4 pt-2 text-xs font-bold text-emerald-900">
                          <div>
                            <span className="text-[10px] text-emerald-600 block">ASSIGNED EMP CODE</span>
                            <span className="text-sm font-black">{convertedEmployeeDetails.empCode}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-emerald-600 block">OFFICIAL FULL NAME</span>
                            <span className="text-sm font-black">{convertedEmployeeDetails.name}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Onboarding Launch Controls</h4>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="font-bold text-slate-455">Asset Allocation (Laptop)</label>
                            <select
                              value={onboardLaptopBrand}
                              onChange={e => setOnboardLaptopBrand(e.target.value)}
                              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 outline-none"
                            >
                              <option value="MacBook Pro M3">MacBook Pro M3 (16-inch)</option>
                              <option value="ThinkPad X1 Carbon">ThinkPad X1 Carbon (Gen 12)</option>
                              <option value="Dell XPS 15">Dell XPS 15 (9530)</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="font-bold text-slate-455">Reporting Manager</label>
                            <select
                              value={onboardManager}
                              onChange={e => setOnboardManager(e.target.value)}
                              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 outline-none"
                            >
                              <option value="Marcus Chen">Marcus Chen (Lead Dev)</option>
                              <option value="Sarah Jenkins">Sarah Jenkins (VP Engineering)</option>
                              <option value="Dhipak Kumar">Dhipak Kumar (HR Director)</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="font-bold text-slate-455">Onboarding Buddy</label>
                            <select
                              value={onboardBuddy}
                              onChange={e => setOnboardBuddy(e.target.value)}
                              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 outline-none"
                            >
                              <option value="Sarah Jenkins">Sarah Jenkins</option>
                              <option value="Marcus Chen">Marcus Chen</option>
                              <option value="John HR Coordinator">John HR Coordinator</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="font-bold text-slate-455">Training Plan Pathway</label>
                            <select
                              value={onboardTrainingPlan}
                              onChange={e => setOnboardTrainingPlan(e.target.value)}
                              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 outline-none"
                            >
                              <option value="Engineering BootCamp">Engineering Bootcamp (2 Weeks)</option>
                              <option value="Sales Academy">Sales Academy (3 Weeks)</option>
                              <option value="General HR Orientation">General HR Orientation (1 Week)</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="font-bold text-slate-455">Probation Period Duration</label>
                            <select
                              value={onboardProbation}
                              onChange={e => setOnboardProbation(e.target.value)}
                              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 outline-none"
                            >
                              <option value="3 Months">3 Months</option>
                              <option value="6 Months">6 Months</option>
                              <option value="Direct Confirmation">Direct Confirmation</option>
                            </select>
                          </div>
                          
                          <div className="space-y-1 flex items-center pt-5">
                            <label className="flex items-center gap-2 font-bold cursor-pointer">
                              <input
                                type="checkbox"
                                checked={onboardCompletedChecks['policies'] || false}
                                onChange={e => setOnboardCompletedChecks(prev => ({ ...prev, policies: e.target.checked }))}
                                className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-0"
                              />
                              <span>Policy Acceptance Signed</span>
                            </label>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-slate-455">Initial Onboarding Goals</label>
                          <textarea
                            value={onboardGoals}
                            onChange={e => setOnboardGoals(e.target.value)}
                            rows={3}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 outline-none text-slate-800 dark:text-white"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-indigo-650 hover:bg-indigo-700 text-white font-extrabold py-3 rounded-xl transition shadow-md"
                      >
                        Launch Journey & Notify Team
                      </button>
                    </form>

                  ) : selectedCand ? (
                    
                    /* Preboarding Checklist & Compliance workspace */
                    <div className="space-y-6">
                      
                      {/* Name card */}
                      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                        <div>
                          <h2 className="text-base font-extrabold text-indigo-650 dark:text-indigo-400">{selectedCand.fullName}</h2>
                          <p className="text-xs text-slate-455 mt-0.5">Role: <span className="font-bold text-slate-700 dark:text-slate-300">{selectedCand.currentDesignation || 'Acme Hire'}</span></p>
                        </div>
                        <div className="text-right">
                          <span className="inline-block px-2.5 py-0.5 bg-amber-50 text-amber-600 border border-amber-250 rounded-full text-[10px] font-black uppercase">Future Employee</span>
                          <span className="block text-[10px] text-slate-400 font-bold mt-1">Preboarding compliance</span>
                        </div>
                      </div>

                      {/* Dynamic 0-100% Progress Tracker */}
                      <div className="space-y-2">
                        <div className="flex justify-between font-bold text-[10px] text-slate-455">
                          <span>COMPLIANCE RATING</span>
                          <span className="text-indigo-650">{getProgressPercent()}% COMPLETE</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-900 h-2.5 rounded-full overflow-hidden">
                          <div
                            className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${getProgressPercent()}%` }}
                          />
                        </div>
                      </div>

                      {/* Documents Audit Checklist */}
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-[10px] font-black text-slate-455 uppercase tracking-wider">Required Checklist Controls</h3>
                          <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                            <input
                              type="text"
                              value={newCheckName}
                              onChange={e => setNewCheckName(e.target.value)}
                              placeholder="Add compliance rule..."
                              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-[10px] outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (!newCheckName) return;
                                setCustomPreboardChecks(prev => [...prev, newCheckName]);
                                setNewCheckName('');
                              }}
                              className="bg-indigo-50 hover:bg-indigo-150 text-indigo-650 px-2.5 py-1 rounded-lg border border-indigo-200 font-bold text-[10px]"
                            >
                              Add Check
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          
                          {/* Standard Aadhaar Check */}
                          <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800 rounded-xl space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="font-extrabold text-[11px]">1. National ID (Aadhaar)</span>
                              <span className={clsx(
                                'text-[9px] font-black border px-1.5 rounded',
                                preboardDocs.aadhaar === 'VERIFIED' ? 'bg-emerald-50 text-emerald-600 border-emerald-150' : 'bg-amber-50 text-amber-600 border-amber-150'
                              )}>
                                {preboardDocs.aadhaar}
                              </span>
                            </div>
                            {preboardDocs.aadhaar !== 'VERIFIED' ? (
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  maxLength={12}
                                  value={aadhaarNo}
                                  onChange={e => setAadhaarNo(e.target.value)}
                                  placeholder="12-Digit ID..."
                                  className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-0.5 text-[10px]"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (aadhaarNo.length !== 12) return alert('Aadhaar must be 12 digits');
                                    setPreboardDocs(prev => ({ ...prev, aadhaar: 'VERIFIED' }));
                                  }}
                                  className="bg-indigo-650 text-white px-2 py-0.5 rounded-lg text-[10px] font-bold"
                                >
                                  Verify
                                </button>
                              </div>
                            ) : (
                              <p className="text-[10px] text-slate-400 font-semibold">UIN verified: {aadhaarNo || '4050 8299 1045'}</p>
                            )}
                          </div>

                          {/* Standard PAN Check */}
                          <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800 rounded-xl space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="font-extrabold text-[11px]">2. Tax Registration (PAN)</span>
                              <span className={clsx(
                                'text-[9px] font-black border px-1.5 rounded',
                                preboardDocs.pan === 'VERIFIED' ? 'bg-emerald-50 text-emerald-600 border-emerald-150' : 'bg-amber-50 text-amber-600 border-amber-150'
                              )}>
                                {preboardDocs.pan}
                              </span>
                            </div>
                            {preboardDocs.pan !== 'VERIFIED' ? (
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  maxLength={10}
                                  value={panNo}
                                  onChange={e => setPanNo(e.target.value.toUpperCase())}
                                  placeholder="10-Char PAN..."
                                  className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-0.5 text-[10px]"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (panNo.length !== 10) return alert('PAN must be 10 characters');
                                    setPreboardDocs(prev => ({ ...prev, pan: 'VERIFIED' }));
                                  }}
                                  className="bg-indigo-650 text-white px-2 py-0.5 rounded-lg text-[10px] font-bold"
                                >
                                  Verify
                                </button>
                              </div>
                            ) : (
                              <p className="text-[10px] text-slate-400 font-semibold">PAN verified: {panNo || 'ABCDE1234F'}</p>
                            )}
                          </div>

                          {/* Passport Document Check */}
                          <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800 rounded-xl space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="font-extrabold text-[11px]">3. Passport Verification</span>
                              <span className={clsx(
                                'text-[9px] font-black border px-1.5 rounded',
                                preboardDocs.passport === 'VERIFIED' ? 'bg-emerald-50 text-emerald-600 border-emerald-150' : 'bg-amber-50 text-amber-600 border-amber-150'
                              )}>
                                {preboardDocs.passport}
                              </span>
                            </div>
                            {preboardDocs.passport !== 'VERIFIED' ? (
                              <button
                                type="button"
                                onClick={() => setPreboardDocs(prev => ({ ...prev, passport: 'VERIFIED' }))}
                                className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-650 py-1 rounded-lg border border-indigo-200 text-[10px] font-bold"
                              >
                                Upload & Verify Passport
                              </button>
                            ) : (
                              <p className="text-[10px] text-slate-400 font-semibold">International passport verified.</p>
                            )}
                          </div>

                          {/* Address & Bank Check */}
                          <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800 rounded-xl space-y-2 col-span-1">
                            <span className="font-extrabold text-[11px] block">4. Payroll Account Config</span>
                            <div className="space-y-1">
                              <input
                                type="text"
                                placeholder="Bank Account Number..."
                                value={bankAccount}
                                onChange={e => setBankAccount(e.target.value)}
                                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-0.5 text-[10px]"
                              />
                              <input
                                type="text"
                                placeholder="Permanent Home Address..."
                                value={preboardAddress}
                                onChange={e => setPreboardAddress(e.target.value)}
                                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-0.5 text-[10px]"
                              />
                            </div>
                          </div>

                          {/* Custom preboarding checklist items */}
                          {customPreboardChecks.map(check => {
                            const isChecked = onboardCompletedChecks[check] || false;
                            return (
                              <div key={check} className="p-3.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800 rounded-xl flex items-center justify-between col-span-1">
                                <span className="font-extrabold text-[11px] text-slate-650 dark:text-slate-350">{check}</span>
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={e => setOnboardCompletedChecks(prev => ({ ...prev, [check]: e.target.checked }))}
                                  className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-0"
                                />
                              </div>
                            );
                          })}

                        </div>
                      </div>

                      {/* Convert Twin Trigger */}
                      <button
                        type="button"
                        onClick={startDigitalTwinConversion}
                        className="w-full py-3 bg-indigo-650 hover:bg-indigo-750 text-white font-extrabold rounded-xl transition shadow-md"
                      >
                        Approve Preboarding & Onboard (Initialize Digital Twin)
                      </button>

                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center py-20">
                      <ClipboardCheck className="w-12 h-12 text-slate-350 dark:text-slate-700 mb-3 animate-pulse" />
                      <h3 className="text-sm font-extrabold text-slate-550">Select a candidate to start preboarding</h3>
                      <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed font-bold">Accepted candidates must upload identity cards and payroll details before converting to employee digital twins.</p>
                    </div>
                  )}

                </div>

              </div>

            </div>
          );
        })()}

        {/* ── 10. CAREER PORTAL TAB ── */}
        {activeTab === 'career' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-xl font-extrabold tracking-tight">Public Careers Portal</h1>
              <p className="text-xs text-slate-400 font-bold mt-1">Candidate external application form interface simulator.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Job Listings list */}
              <div className="lg:col-span-1 space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Open Positions</h3>
                {postings?.filter(p => p.status === 'PUBLISHED').map((post) => (
                  <button
                    key={post.id}
                    onClick={() => setCJobId(post.id)}
                    className={clsx(
                      'w-full p-4 rounded-xl text-left border transition-all space-y-2',
                      cJobId === post.id
                        ? 'bg-indigo-50/50 border-indigo-500 dark:bg-indigo-950/20'
                        : 'bg-white dark:bg-[#0B0F19] border-slate-200/60 dark:border-slate-850 hover:bg-slate-50'
                    )}
                  >
                    <h4 className="text-xs font-bold">{post.jobTitle}</h4>
                    <p className="text-[10px] text-slate-450">{post.location} • {post.employmentType}</p>
                  </button>
                ))}
              </div>

              {/* Application Form */}
              <div className="lg:col-span-2 bg-white dark:bg-[#0B0F19] p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-850">
                  <h3 className="text-sm font-extrabold">Apply for Selected Position</h3>
                  <button
                    onClick={handleSimulateAiParse}
                    disabled={isParsing || !cJobId}
                    className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-650 hover:from-indigo-600 hover:to-purple-755 disabled:from-slate-200 disabled:to-slate-300 dark:disabled:from-slate-800 dark:disabled:to-slate-850 text-white text-[10px] font-extrabold py-2 px-3.5 rounded-xl shadow-sm transition-all"
                  >
                    <Sparkles size={13} className={isParsing ? "animate-spin" : ""} />
                    {isParsing ? "AI Extraction Running..." : "Simulate AI Resume Parse"}
                  </button>
                </div>

                {isParsing && (
                  <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800 p-4 rounded-xl space-y-2.5">
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className="text-indigo-650 dark:text-indigo-400">{parsingStep}</span>
                      <span className="text-slate-400">{parsingProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-indigo-600 h-full transition-all duration-300" style={{ width: `${parsingProgress}%` }} />
                    </div>
                  </div>
                )}

                {!cJobId ? (
                  <p className="text-xs text-slate-400 font-bold">Please select an open position from the list to apply.</p>
                ) : (
                  <DynamicFormRenderer
                    formName="CANDIDATE"
                    entityType="candidate"
                    initialValues={parsedData || undefined}
                    onSubmit={async (values, customValues) => {
                      const payload = {
                        fullName: values.fullName || '',
                        email: values.email || '',
                        phone: values.phone || '',
                        location: values.location || '',
                        currentCompany: values.currentCompany || '',
                        currentDesignation: values.currentDesignation || '',
                        experienceYears: Number(values.experienceYears || 0),
                        noticePeriodDays: Number(values.noticePeriodDays || 0),
                        skills: values.skills || '',
                        resumeUrl: values.resumeUrl || '',
                        jobPosting: { id: cJobId }
                      };
                      try {
                        const candObj = await createCandidate(payload).unwrap();
                        if (customValues.length > 0 && candObj.id) {
                          await saveCustomFieldValues({
                            entityType: 'candidate',
                            entityId: candObj.id,
                            values: customValues.map(cv => ({
                              ...cv,
                              entityId: candObj.id!,
                              entityType: 'candidate'
                            }))
                          }).unwrap();
                        }
                        refetchCandidates();
                        refetchDashboard();
                        alert('Application submitted successfully!');
                        // Clear states
                        setCName('');
                        setCEmail('');
                        setCPhone('');
                        setParsedData(null);
                      } catch (err) {
                        console.error('Failed to apply:', err);
                      }
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── 11. ANALYTICS TAB ── */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-xl font-extrabold tracking-tight">Recruitment Analytics & ROI Cockpit</h1>
              <p className="text-xs text-slate-400 font-bold mt-1">Detailed recruiting metrics, source analysis, agency costs, and direct-sourcing savings.</p>
            </div>

            {/* Top Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <div className="bg-white dark:bg-[#0B0F19] p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Offer Acceptance Rate</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <h3 className="text-2xl font-black text-indigo-650 dark:text-indigo-400">83.4%</h3>
                  <span className="text-[10px] text-emerald-600 font-bold">+3.2% vs Q1</span>
                </div>
                <p className="text-[10px] text-slate-450 mt-1">Industry standard average: 70%</p>
              </div>

              <div className="bg-white dark:bg-[#0B0F19] p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Average Time-to-Hire</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <h3 className="text-2xl font-black text-indigo-650 dark:text-indigo-400">18.5 Days</h3>
                  <span className="text-[10px] text-emerald-600 font-bold">-4.2 Days</span>
                </div>
                <p className="text-[10px] text-slate-450 mt-1">Acme internal target: 22 Days</p>
              </div>

              <div className="bg-white dark:bg-[#0B0F19] p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Direct Sourcing Savings</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <h3 className="text-2xl font-black text-emerald-650 dark:text-emerald-450">{formatCurrency(68400)}</h3>
                  <span className="text-[10px] text-emerald-600 font-bold">ROI: 8.4x</span>
                </div>
                <p className="text-[10px] text-slate-455 mt-1">Savings from direct public career applications</p>
              </div>

              <div className="bg-white dark:bg-[#0B0F19] p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">External Agency Costs</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <h3 className="text-2xl font-black text-rose-600 dark:text-rose-450">{formatCurrency(14200)}</h3>
                  <span className="text-[10px] text-rose-500 font-bold">-22% YoY</span>
                </div>
                <p className="text-[10px] text-slate-455 mt-1">Commission payouts for boutique sourcing</p>
              </div>
            </div>

            {/* Graphical Visualization Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Sourcing Channels Distribution */}
              <div className="lg:col-span-2 bg-white dark:bg-[#0B0F19] p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm space-y-6">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200">Sourcing Channels Performance</h3>
                  <p className="text-[11px] text-slate-400 font-medium">Candidate distribution and conversion efficacy by channel</p>
                </div>

                <div className="space-y-4">
                  {[
                    { name: 'LinkedIn Recruiter Pro', percentage: 48, count: 96, color: 'bg-indigo-500', conversion: '12.4%' },
                    { name: 'Direct Public Careers Site', percentage: 32, count: 64, color: 'bg-purple-500', conversion: '18.2%' },
                    { name: 'Internal Employee Referral', percentage: 15, count: 30, color: 'bg-emerald-500', conversion: '35.0%' },
                    { name: 'External Sourcing Agency', percentage: 5, count: 10, color: 'bg-rose-500', conversion: '40.0%' }
                  ].map((chan, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-700 dark:text-slate-300">{chan.name}</span>
                        <span className="text-slate-400">{chan.count} Candidates ({chan.percentage}%)</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className={clsx("h-full rounded-full transition-all duration-500", chan.color)} style={{ width: `${chan.percentage}%` }} />
                        </div>
                        <span className="text-[10px] font-black text-indigo-650 dark:text-indigo-400 w-12 text-right">{chan.conversion} Conv</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Time-to-Hire Pipeline Steps */}
              <div className="lg:col-span-1 bg-white dark:bg-[#0B0F19] p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm space-y-6">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200">Pipeline Velocity</h3>
                  <p className="text-[11px] text-slate-400 font-medium">Average days spent in each recruiting milestone</p>
                </div>

                <div className="space-y-4">
                  {[
                    { step: 'Applied to Screening', days: 2.1, max: 5 },
                    { step: 'Screening to Shortlisted', days: 3.4, max: 5 },
                    { step: 'Shortlist to Interview', days: 5.8, max: 8 },
                    { step: 'Interview to Offer Release', days: 4.2, max: 7 },
                    { step: 'Offer Release to Acceptance', days: 3.0, max: 5 }
                  ].map((pStep, idx) => {
                    const ratio = Math.min((pStep.days / pStep.max) * 100, 100);
                    return (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between text-[11px] font-bold">
                          <span className="text-slate-600 dark:text-slate-350">{pStep.step}</span>
                          <span className="text-indigo-650 dark:text-indigo-400">{pStep.days} Days</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500" style={{ width: `${ratio}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── 12. ATS CONFIGURATION TAB ── */}
        {activeTab === 'ats-config' && (
          <ATSConfigTab />
        )}

        {/* ── REQUISITION MODAL ── */}
        {showReqModal && (
          <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-5xl w-full mx-4 space-y-4 shadow-2xl animate-fade-in text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-extrabold">New Manpower Requisition</h3>
                <button onClick={() => setShowReqModal(false)} className="text-slate-400 hover:text-slate-655"><X size={16} /></button>
              </div>
              <RequisitionWizard
                currentUserId={currentUserId}
                onSubmit={async (values, customValues, skills) => {
                  const payload = {
                    title: values.title || '',
                    jobTitle: values.jobTitle || values.title || '',
                    department: values.department || '',
                    subDepartment: values.subDepartment || '',
                    businessUnit: values.businessUnit || 'ACME',
                    location: values.location || '',
                    reportingManager: values.reportingManager || '',
                    designation: values.designation || '',
                    grade: values.grade || '',
                    band: values.band || '',
                    employmentType: values.employmentType || 'FULL_TIME',
                    workMode: values.workMode || 'OFFICE',
                    vacancies: Number(values.vacancies || 0),
                    minExperience: Number(values.minExperience || 0),
                    maxExperience: Number(values.maxExperience || 0),
                    budget: Number(values.budget || 0),
                    minBudget: Number(values.minBudget || 0),
                    maxBudget: Number(values.maxBudget || 0),
                    costCenter: values.costCenter || '',
                    requiredSkills: values.requiredSkills || '',
                    preferredSkills: values.preferredSkills || '',
                    certifications: values.certifications || '',
                    languages: values.languages || '',
                    education: values.education || '',
                    hiringReason: values.hiringReason || 'NEW_POSITION',
                    expectedJoiningDate: values.expectedJoiningDate || '',
                    priority: values.priority || 'MEDIUM',
                    reasonForHiring: values.reasonForHiring || 'NEW_POSITION',
                    replacementEmployee: values.replacementEmployee || '',
                    replacementEmployeeId: values.replacementEmployeeId || '',
                    replacementDate: values.replacementDate || '',
                    businessJustification: values.businessJustification || '',
                    projectName: values.projectName || '',
                    expectedBusinessImpact: values.expectedBusinessImpact || '',
                    revenueImpact: values.revenueImpact || '',
                    riskNotFilled: values.riskNotFilled || '',
                    additionalNotes: values.additionalNotes || ''
                  };
                  try {
                    const reqObj = await createReq(payload).unwrap();
                    if (customValues.length > 0 && reqObj.id) {
                      await saveCustomFieldValues({
                        entityType: 'requisition',
                        entityId: reqObj.id,
                        values: customValues.map(cv => ({
                          ...cv,
                          entityId: reqObj.id!,
                          entityType: 'requisition'
                        }))
                      }).unwrap();
                    }
                    if (reqObj.id && skills && skills.length > 0) {
                      await saveRequisitionSkills({
                        requisitionId: reqObj.id,
                        skills: skills.map(s => ({
                          skillId: s.skillId || '',
                          skillName: s.skillName,
                          isRequired: s.isRequired
                        }))
                      }).unwrap();
                    }
                    refetchReqs();
                    setShowReqModal(false);
                    triggerToast("Requisition created successfully.", "success");
                  } catch (err: any) {
                    console.error('Failed to create requisition:', err);
                    const isForbidden = err?.status === 403 || err?.status === 'PARSING_ERROR' || (err?.data && err.data.status === 403);
                    const errMsg = isForbidden 
                      ? "You do not have permission to create requisitions." 
                      : (err?.data?.message || "Failed to create requisition.");
                    triggerToast(errMsg, 'error');
                  }
                }}
                onCancel={() => setShowReqModal(false)}
              />
            </div>
          </div>
        )}

        {/* ── JOB POSTING MODAL ── */}
        {showPostingModal && (
          <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full mx-4 space-y-4 shadow-2xl animate-fade-in text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-extrabold">New Job Posting</h3>
                <button onClick={() => setShowPostingModal(false)} className="text-slate-400 hover:text-slate-655"><X size={16} /></button>
              </div>
              <form onSubmit={handleCreatePosting} className="space-y-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-400 uppercase text-[10px]">Job Title</label>
                  <input type="text" value={postingTitle} onChange={e => setPostingTitle(e.target.value)} required className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-400 uppercase text-[10px]">Job Description</label>
                  <textarea value={postingDesc} onChange={e => setPostingDesc(e.target.value)} required className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 outline-none h-24" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-400 uppercase text-[10px]">Required Skills (Comma Separated)</label>
                  <input type="text" value={postingSkills} onChange={e => setPostingSkills(e.target.value)} required className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase text-[10px]">Location</label>
                    <input type="text" value={postingLoc} onChange={e => setPostingLoc(e.target.value)} required className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase text-[10px]">Salary Range</label>
                    <input type="text" value={postingSalary} onChange={e => setPostingSalary(e.target.value)} required className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 outline-none" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-400 uppercase text-[10px]">Experience Level</label>
                  <input type="text" value={postingExp} onChange={e => setPostingExp(e.target.value)} required className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 outline-none" placeholder="3-5 Years" />
                </div>
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl shadow transition-all mt-4">Publish Posting</button>
              </form>
            </div>
          </div>
        )}

        {/* ── OFFER MODAL ── */}
        {showOfferModal && (
          <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full mx-4 space-y-4 shadow-2xl animate-fade-in text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-extrabold">Generate Job Offer Package</h3>
                <button onClick={() => setShowOfferModal(false)} className="text-slate-400 hover:text-slate-655"><X size={16} /></button>
              </div>
              <form onSubmit={handleCreateOffer} className="space-y-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-400 uppercase text-[10px]">Select Hired Candidate</label>
                  <select value={offerCandidateId} onChange={e => setOfferCandidateId(e.target.value)} required className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 outline-none">
                    <option value="">Select Hired Candidate...</option>
                    {candidates?.filter(c => c.status === 'INTERVIEW' || c.status === 'SHORTLISTED' || c.status === 'APPLIED').map((c) => (
                      <option key={c.id} value={c.id}>{c.fullName} ({c.email})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-400 uppercase text-[10px]">Select Job Position</label>
                  <select value={offerJobPostingId} onChange={e => setOfferJobPostingId(e.target.value)} required className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 outline-none">
                    <option value="">Select Job Position...</option>
                    {postings?.map((p) => (
                      <option key={p.id} value={p.id}>{p.jobTitle}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase text-[10px]">Offered CTC ($)</label>
                    <input type="number" value={offerCtc} onChange={e => setOfferCtc(Number(e.target.value))} required className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase text-[10px]">Annual Bonus ($)</label>
                    <input type="number" value={offerBonus} onChange={e => setOfferBonus(Number(e.target.value))} required className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <DatePicker
                    label="Expected Joining Date"
                    value={offerDate}
                    onChange={setOfferDate}
                    required
                  />
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase text-[10px]">Work Location</label>
                    <input type="text" value={offerLoc} onChange={e => setOfferLoc(e.target.value)} required className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 outline-none" />
                  </div>
                </div>
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl shadow transition-all mt-4">Create Offer Details</button>
              </form>
            </div>
          </div>
        )}

        {/* ── INTERVIEW MODAL ── */}
        {showInterviewModal && (
          <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full mx-4 space-y-4 shadow-2xl animate-fade-in text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-extrabold">Schedule Candidate Interview</h3>
                <button onClick={() => setShowInterviewModal(false)} className="text-slate-400 hover:text-slate-655"><X size={16} /></button>
              </div>
              <form onSubmit={handleScheduleInterview} className="space-y-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-400 uppercase text-[10px]">Select Candidate</label>
                  <select value={intCandidateId} onChange={e => setIntCandidateId(e.target.value)} required className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 outline-none">
                    <option value="">Select Candidate...</option>
                    {candidates?.map((c) => (
                      <option key={c.id} value={c.id}>{c.fullName} ({c.email})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-400 uppercase text-[10px]">Select Job Position</label>
                  <select value={intJobPostingId} onChange={e => setIntJobPostingId(e.target.value)} required className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 outline-none">
                    <option value="">Select Job Position...</option>
                    {postings?.map((p) => (
                      <option key={p.id} value={p.id}>{p.jobTitle}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase text-[10px]">Interview Type</label>
                    <select value={intType} onChange={e => setIntType(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 outline-none">
                      <option value="SCREENING">SCREENING</option>
                      <option value="TECHNICAL">TECHNICAL ROUND</option>
                      <option value="MANAGEMENT">MANAGEMENT ROUND</option>
                      <option value="HR">HR DISCUSSIONS</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase text-[10px]">Scheduled Time</label>
                    <input type="datetime-local" value={intTime} onChange={e => setIntTime(e.target.value)} required className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 outline-none" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-400 uppercase text-[10px]">Interviewer User IDs (Comma Separated)</label>
                  <input type="text" value={intInterviewers} onChange={e => setIntInterviewers(e.target.value)} required className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 outline-none" placeholder="00000000-0000-0000-0000-000000000003" />
                </div>
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl shadow transition-all mt-4">Confirm Schedule</button>
              </form>
            </div>
          </div>
        )}

        {/* ── FEEDBACK SCORECARD MODAL ── */}
        {showFeedbackModal && (
          <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full mx-4 space-y-4 shadow-2xl animate-fade-in text-xs text-slate-800 dark:text-slate-200">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-extrabold text-indigo-650 dark:text-indigo-400">Submit Enterprise Scorecard</h3>
                <button onClick={() => setShowFeedbackModal(false)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
              </div>
              <form onSubmit={handleSubmitFeedback} className="space-y-4">
                {/* 4 Ratings Dimensions */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase text-[9px]">Technical Competency (1-5)</label>
                    <input type="number" min="1" max="5" value={techRating} onChange={e => setTechRating(Number(e.target.value))} required className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 outline-none text-slate-800 dark:text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase text-[9px]">Communication Skill (1-5)</label>
                    <input type="number" min="1" max="5" value={commRating} onChange={e => setCommRating(Number(e.target.value))} required className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 outline-none text-slate-800 dark:text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase text-[9px]">Problem Solving (1-5)</label>
                    <input type="number" min="1" max="5" value={problemRating} onChange={e => setProblemRating(Number(e.target.value))} required className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 outline-none text-slate-800 dark:text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase text-[9px]">Culture & Alignment (1-5)</label>
                    <input type="number" min="1" max="5" value={cultureRating} onChange={e => setCultureRating(Number(e.target.value))} required className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 outline-none text-slate-800 dark:text-white" />
                  </div>
                </div>

                {/* Recommendation */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-400 uppercase text-[9px]">Overall Hiring Recommendation</label>
                  <select value={feedbackRec} onChange={e => setFeedbackRec(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 outline-none text-slate-800 dark:text-white">
                    <option value="STRONG_HIRE">STRONG HIRE</option>
                    <option value="HIRE">RECOMMEND HIRE</option>
                    <option value="MAYBE">MAYBE / NEUTRAL</option>
                    <option value="REJECT">NO HIRE</option>
                    <option value="STRONG_REJECT">STRONG NO HIRE</option>
                  </select>
                </div>

                {/* Feedback Notes */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-400 uppercase text-[9px]">Detailed Scorecard Notes / Feedback Comments</label>
                  <textarea value={feedbackComments} onChange={e => setFeedbackComments(e.target.value)} required className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 outline-none h-24 text-slate-800 dark:text-white" placeholder="Provide notes on the candidate's technical performance and soft skills..." />
                </div>

                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl shadow transition-all mt-4">Submit Evaluation Scorecard</button>
              </form>
            </div>
          </div>
        )}

        {/* ── TALENT POOL MODAL ── */}
        {showPoolModal && (
          <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full mx-4 space-y-4 shadow-2xl animate-fade-in text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-extrabold">Create New Talent Pool</h3>
                <button onClick={() => setShowPoolModal(false)} className="text-slate-400 hover:text-slate-655"><X size={16} /></button>
              </div>
              <form onSubmit={handleCreatePool} className="space-y-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-400 uppercase text-[10px]">Pool Name</label>
                  <input type="text" value={poolName} onChange={e => setPoolName(e.target.value)} required className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-400 uppercase text-[10px]">Description</label>
                  <textarea value={poolDesc} onChange={e => setPoolDesc(e.target.value)} required className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 outline-none h-20" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-400 uppercase text-[10px]">Department</label>
                  <input type="text" value={poolDept} onChange={e => setPoolDept(e.target.value)} required className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 outline-none" />
                </div>
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl shadow transition-all mt-4">Confirm Pool</button>
              </form>
            </div>
          </div>
        )}

        {/* ── CANDIDATE DETAILS MODAL (TIMELINE & COMMENTS) ── */}
        {showCandidateDetailsModal && selectedCandidateId && (
          <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-lg w-full mx-4 space-y-4 shadow-2xl animate-fade-in text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-extrabold">Candidate Timeline & Notes</h3>
                <button onClick={() => { setShowCandidateDetailsModal(false); setSelectedCandidateId(null); }} className="text-slate-400 hover:text-slate-655"><X size={16} /></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[350px] overflow-hidden">
                {/* Notes Column */}
                <div className="flex flex-col h-full justify-between border-r border-slate-100 dark:border-slate-800 pr-3">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2">Interviewer Comments</h4>
                  <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                    {candNotes?.map((note) => (
                      <div key={note.id} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-850">
                        <p className="font-medium">{note.noteText}</p>
                        <p className="text-[9px] text-slate-400 font-semibold mt-1">Author: {note.authorId.slice(0, 8)} • {new Date(note.createdAt).toLocaleDateString()}</p>
                      </div>
                    ))}
                    {candNotes?.length === 0 && (
                      <p className="text-[10px] text-slate-400 py-6 text-center">No interviewer notes added.</p>
                    )}
                  </div>
                  <form onSubmit={handleAddNote} className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <input
                      type="text"
                      placeholder="Add comment note..."
                      value={newNoteText}
                      onChange={e => setNewNoteText(e.target.value)}
                      className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs outline-none"
                    />
                    <button type="submit" className="p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"><Send size={14} /></button>
                  </form>
                </div>

                {/* Activity Log Column */}
                <div className="flex flex-col h-full">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2">Audit activity timeline</h4>
                  <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                    {candActivities?.map((act) => (
                      <div key={act.id} className="p-2.5 rounded-lg bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200/30 dark:border-slate-850/50">
                        <p className="font-extrabold text-[10px] text-indigo-600 dark:text-indigo-400">{act.activityType}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{act.description}</p>
                        {act.oldValue && (
                          <p className="text-[9px] text-slate-400 mt-1 font-semibold">Transition: {act.oldValue} → {act.newValue}</p>
                        )}
                        <p className="text-[9px] text-slate-400 font-semibold mt-1">{new Date(act.createdAt).toLocaleString()}</p>
                      </div>
                    ))}
                    {candActivities?.length === 0 && (
                      <p className="text-[10px] text-slate-400 py-6 text-center">No activities recorded.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
