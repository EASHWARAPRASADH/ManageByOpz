import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Eye, 
  Send, 
  Hourglass, 
  Plus, 
  MapPin, 
  Search, 
  Briefcase, 
  Award, 
  Percent,
  CheckCircle,
  CheckCircle2,
  XCircle,
  FileText,
  Building,
  X,
  MoreVertical,
  SlidersHorizontal,
  Download,
  Users,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Activity,
  Calendar,
  Layers,
  ArrowRight,
  ArrowUpRight,
  Settings,
  Grid,
  Mail,
  Phone,
  Clock,
  Trash2,
  FileSpreadsheet,
  AlertCircle,
  Info,
  AlertTriangle
} from 'lucide-react';
import clsx from 'clsx';
import { formatCurrency } from '../../../utils/currencyFormatter';
import { DatePicker } from '../../employees/DatePicker';
import { 
  useGetInterviewsQuery,
  useGetOffersQuery,
  useMoveCandidateStageMutation,
  useScheduleInterviewMutation,
  useCreateOfferMutation,
  useApproveOfferMutation,
  useRejectOfferMutation,
  useAcceptOfferMutation,
  useUpdateJobPostingMutation,
  useActivateJobPostingMutation,
  useDuplicateJobPostingMutation,
  useArchiveJobPostingMutation,
  type JobPosting, 
  type Candidate, 
  type Requisition 
} from '../recruitmentApi';

interface JobPostingGridAnalyticsProps {
  postings: JobPosting[] | undefined;
  candidates: Candidate[] | undefined;
  requisitions: Requisition[] | undefined;
  onPublishNew: (prefilled: Partial<JobPosting>) => void;
  onChangeStatus: (id: string, currentStatus: string) => void;
  onViewApplicants: (jobTitle: string) => void;
}

export function JobPostingGridAnalytics({
  postings = [],
  candidates = [],
  requisitions = [],
  onPublishNew,
  onChangeStatus,
  onViewApplicants
}: JobPostingGridAnalyticsProps) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showSelectPosModal, setShowSelectPosModal] = useState(false);
  const [selectedPosId, setSelectedPosId] = useState('');
  
  // Grid / UI states
  const [selectedTab, setSelectedTab] = useState<'ALL' | 'PUBLISHED' | 'DRAFT' | 'PAUSED' | 'ARCHIVED'>('ALL');
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [drawerTab, setDrawerTab] = useState<'overview' | 'candidates' | 'pipeline' | 'interviews' | 'offers' | 'activity' | 'documents'>('overview');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // RTK Query hooks for live data integration
  const { data: interviews = [], isLoading: isLoadingInterviews, error: interviewsError } = useGetInterviewsQuery();
  const { data: offers = [], isLoading: isLoadingOffers, error: offersError } = useGetOffersQuery();

  // Mutations
  const [moveCandidateStage] = useMoveCandidateStageMutation();
  const [scheduleInterview] = useScheduleInterviewMutation();
  const [createOffer] = useCreateOfferMutation();
  const [approveOffer] = useApproveOfferMutation();
  const [rejectOffer] = useRejectOfferMutation();
  const [acceptOffer] = useAcceptOfferMutation();

  // Job Actions mutations
  const [updateJobPosting] = useUpdateJobPostingMutation();
  const [activateJobPosting] = useActivateJobPostingMutation();
  const [duplicateJobPosting] = useDuplicateJobPostingMutation();
  const [archiveJobPosting] = useArchiveJobPostingMutation();

  // Edit Job form states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editJobId, setEditJobId] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editSkills, setEditSkills] = useState('');
  const [editLoc, setEditLoc] = useState('');
  const [editEmpType, setEditEmpType] = useState('FULL_TIME');
  const [editSalary, setEditSalary] = useState('');
  const [editExp, setEditExp] = useState('');
  const [editStatus, setEditStatus] = useState('DRAFT');

  // Archive confirmation state
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [archiveJobId, setArchiveJobId] = useState('');
  const [archiveJobTitle, setArchiveJobTitle] = useState('');

  const handleOpenEdit = (post: JobPosting) => {
    setEditJobId(post.id);
    setEditTitle(post.jobTitle);
    setEditDesc(post.jobDescription);
    setEditSkills(post.skills);
    setEditLoc(post.location);
    setEditEmpType(post.employmentType || 'FULL_TIME');
    setEditSalary(post.salaryRange);
    setEditExp(post.experience);
    setEditStatus(post.status);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateJobPosting({
        id: editJobId,
        posting: {
          jobTitle: editTitle,
          jobDescription: editDesc,
          skills: editSkills,
          location: editLoc,
          employmentType: editEmpType,
          salaryRange: editSalary,
          experience: editExp,
          status: editStatus
        }
      }).unwrap();
      showToast('Job posting updated successfully', 'success');
      setShowEditModal(false);
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to update job posting', 'error');
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await activateJobPosting(id).unwrap();
      showToast('Job posting activated & published successfully', 'success');
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to activate job posting. Ensure all mandatory fields (Title, Description, Skills, Location) are populated.', 'error');
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const newPost = await duplicateJobPosting(id).unwrap();
      showToast('Job posting duplicated successfully as DRAFT', 'success');
      // Redirect user to edit duplicated job
      handleOpenEdit(newPost);
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to duplicate job posting', 'error');
    }
  };

  const handleOpenArchiveConfirm = (post: JobPosting) => {
    setArchiveJobId(post.id);
    setArchiveJobTitle(post.jobTitle);
    setShowArchiveConfirm(true);
  };

  const handleConfirmArchive = async () => {
    try {
      await archiveJobPosting(archiveJobId).unwrap();
      showToast('Job posting archived successfully', 'success');
      setShowArchiveConfirm(false);
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to archive job posting', 'error');
    }
  };

  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Local Form States inside Job Details Workspace
  const [schedCandidateId, setSchedCandidateId] = useState('');
  const [schedType, setSchedType] = useState('TECHNICAL');
  const [schedTime, setSchedTime] = useState('');
  const [schedInterviewers, setSchedInterviewers] = useState('');

  const [offerCandId, setOfferCandId] = useState('');
  const [offerCtc, setOfferCtc] = useState('120000');
  const [offerBonus, setOfferBonus] = useState('10000');
  const [offerDate, setOfferDate] = useState('');

  // Candidates list matching this specific job (based on skills match logic)
  const jobCandidates = selectedJob
    ? candidates.filter(c => 
        c.skills?.toLowerCase().includes(selectedJob.jobTitle.split(' ')[0].toLowerCase())
      )
    : [];

  const jobInterviews = selectedJob
    ? interviews.filter(i => i.jobPosting?.id === selectedJob.id || i.jobPosting?.jobTitle === selectedJob.jobTitle)
    : [];

  const jobOffers = selectedJob
    ? offers.filter(o => o.jobPosting?.id === selectedJob.id || o.jobPosting?.jobTitle === selectedJob.jobTitle)
    : [];

  // Sorting state
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Approved positions list for publishing
  const approvedPositions = requisitions.filter(r => 
    ['APPROVED', 'APPROVED_PLAN', 'HIRING', 'PUBLISHED'].includes(r.status.toUpperCase())
  );

  // Overall calculations for the dashboard
  const publishedCount = postings.filter(p => p.status.toUpperCase() === 'PUBLISHED').length;
  const totalApplications = candidates.length;
  const shortlistedCount = candidates.filter(c => ['SHORTLISTED', 'SCREENED'].includes(c.status.toUpperCase())).length;
  const hiresCount = candidates.filter(c => ['ACCEPTED', 'JOINED'].includes(c.status.toUpperCase())).length;
  const conversionRate = totalApplications > 0 ? Math.round((hiresCount / totalApplications) * 100) : 0;

  // Filter postings by tab & search
  let filtered = postings.filter(p => {
    if (selectedTab === 'PUBLISHED') return p.status.toUpperCase() === 'PUBLISHED';
    if (selectedTab === 'DRAFT') return p.status.toUpperCase() === 'DRAFT';
    if (selectedTab === 'PAUSED') return p.status.toUpperCase() === 'PAUSED';
    if (selectedTab === 'ARCHIVED') return p.status.toUpperCase() === 'ARCHIVED';
    // 'ALL' returns all active jobs (i.e. status != 'ARCHIVED')
    return p.status.toUpperCase() !== 'ARCHIVED';
  });

  filtered = filtered.filter(p => 
    p.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.skills.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle position select & prefill copy
  const handlePublishFromPosition = () => {
    const pos = requisitions.find(r => r.id === selectedPosId);
    if (!pos) return;

    const prefilledData: Partial<JobPosting> = {
      jobTitle: pos.title,
      jobDescription: `We are hiring a ${pos.title} for the ${pos.department} department. Designation: ${pos.designation || 'Specialist'}. Minimum experience required: ${pos.minExperience || 3} years.`,
      skills: pos.requiredSkills || 'Java, Spring Boot, React',
      location: pos.location || 'HQ',
      employmentType: pos.employmentType || 'FULL_TIME',
      salaryRange: `${formatCurrency(pos.minBudget || pos.budget * 0.8 || 80000)} - ${formatCurrency(pos.maxBudget || pos.budget * 1.2 || 120000)}`,
      experience: `${pos.minExperience || 3}-${pos.maxExperience || 5} Years`,
      applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };

    onPublishNew(prefilledData);
    setShowSelectPosModal(false);
    setSelectedPosId('');
  };

  // Stage mutation helper
  const handleMoveStage = async (candidateId: string, newStage: string) => {
    try {
      await moveCandidateStage({ id: candidateId, status: newStage }).unwrap();
      showToast('Candidate stage updated successfully!', 'success');
    } catch (err) {
      showToast('Failed to update stage.', 'error');
    }
  };

  // Schedule Interview helper
  const handleScheduleInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedCandidateId || !schedTime) {
      showToast('Please fill in candidate and time.', 'error');
      return;
    }
    try {
      await scheduleInterview({
        candidate: { id: schedCandidateId } as any,
        jobPosting: { id: selectedJob?.id } as any,
        interviewType: schedType,
        scheduledTime: schedTime,
        interviewerIds: schedInterviewers || 'Interviewer Panel',
        status: 'SCHEDULED'
      }).unwrap();
      showToast('Interview scheduled successfully!', 'success');
      setSchedCandidateId('');
      setSchedTime('');
      setSchedInterviewers('');
    } catch (err) {
      showToast('Failed to schedule interview.', 'error');
    }
  };

  // Create Offer helper
  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerCandId || !offerDate) {
      showToast('Please select a candidate and joining date.', 'error');
      return;
    }
    try {
      await createOffer({
        candidate: { id: offerCandId } as any,
        jobPosting: { id: selectedJob?.id } as any,
        ctc: Number(offerCtc),
        bonus: Number(offerBonus),
        joiningDate: offerDate,
        location: selectedJob?.location || 'HQ',
        status: 'PENDING_APPROVAL'
      }).unwrap();
      showToast('Offer package generated successfully!', 'success');
      setOfferCandId('');
      setOfferDate('');
    } catch (err) {
      showToast('Failed to create offer.', 'error');
    }
  };

  // Offer approval actions
  const handleApproveOffer = async (offerId: string) => {
    try {
      await approveOffer({ id: offerId, approverId: '1', comments: 'Approved' }).unwrap();
      showToast('Offer approved successfully.', 'success');
    } catch (err) {
      showToast('Error approving offer.', 'error');
    }
  };

  const handleRejectOffer = async (offerId: string) => {
    try {
      await rejectOffer({ id: offerId, approverId: '1', comments: 'Rejected' }).unwrap();
      showToast('Offer rejected.', 'success');
    } catch (err) {
      showToast('Error rejecting offer.', 'error');
    }
  };

  const handleAcceptOffer = async (offerId: string) => {
    try {
      await acceptOffer(offerId).unwrap();
      showToast('Offer accepted by candidate!', 'success');
    } catch (err) {
      showToast('Error accepting offer.', 'error');
    }
  };

  // Kanban setup
  const KANBAN_STAGES = [
    { id: 'NEW', name: 'Applied', color: 'text-blue-500 bg-blue-50' },
    { id: 'SCREENING', name: 'Screening', color: 'text-amber-500 bg-amber-50' },
    { id: 'SHORTLISTED', name: 'Shortlisted', color: 'text-purple-500 bg-purple-50' },
    { id: 'INTERVIEW', name: 'Interview', color: 'text-indigo-500 bg-indigo-50' },
    { id: 'OFFER', name: 'Offer Extended', color: 'text-pink-500 bg-pink-50' },
    { id: 'ACCEPTED', name: 'Hired', color: 'text-emerald-500 bg-emerald-50' },
    { id: 'REJECTED', name: 'Rejected', color: 'text-rose-500 bg-rose-50' }
  ];

  // Candidates sub-tab filter
  const [candSearch, setCandSearch] = useState('');
  const [candFilterStage, setCandFilterStage] = useState('ALL');

  const filteredCandidates = jobCandidates.filter(c => {
    const matchesSearch = c.fullName.toLowerCase().includes(candSearch.toLowerCase()) || 
                          c.email.toLowerCase().includes(candSearch.toLowerCase());
    const matchesStage = candFilterStage === 'ALL' || c.status.toUpperCase() === candFilterStage.toUpperCase();
    return matchesSearch && matchesStage;
  });

  return (
    <div className="space-y-6 text-xs text-[#0F172A] dark:text-[#E2E8F0] animate-fade-in select-none">
      
      {/* Toast Notification Banner */}
      {toast && (
        <div className={clsx(
          "fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border animate-slide-in text-xs font-bold",
          toast.type === 'success' ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-rose-50 border-rose-200 text-rose-800"
        )}>
          {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{toast.message}</span>
        </div>
      )}

      {selectedJob ? (
        /* ── DEDICATED JOB DETAILS MANAGEMENT HUB VIEW (FULL PAGE) ── */
        <div className="space-y-6">
          {/* Back Navigation Bar */}
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setSelectedJob(null)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#0F172A] dark:text-white font-extrabold transition shadow-sm"
            >
              <ChevronLeft size={14} />
              <span>Back to Job Postings</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400">Published on {new Date(selectedJob.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Job Details Header Banner */}
          <div className="bg-white dark:bg-[#0B0F19] p-6 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.01)] space-y-5">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] font-bold text-[#6366F1] bg-[#6366F1]/10 px-2 py-0.5 rounded-md uppercase tracking-wider">
                  Job Management Hub
                </span>
                <h1 className="text-xl font-black text-[#0F172A] dark:text-white mt-2.5">{selectedJob.jobTitle}</h1>
                <p className="text-[10px] text-[#64748B] font-bold mt-1 tracking-widest uppercase">
                  {selectedJob.requisition?.reqNumber || 'REQ-102'} • {selectedJob.location} • {selectedJob.employmentType}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={clsx(
                  'px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border',
                  selectedJob.status.toUpperCase() === 'PUBLISHED' ? 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/30' :
                  selectedJob.status.toUpperCase() === 'PAUSED' ? 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30' :
                  'bg-[#64748B]/10 text-[#64748B] border-[#64748B]/30'
                )}>
                  {selectedJob.status}
                </span>
              </div>
            </div>

            {/* Recruiter Productivity Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
              <div className="p-3 bg-slate-50/50 dark:bg-slate-900/40 rounded-xl border border-slate-100/50 dark:border-slate-850">
                <span className="text-[9px] text-[#64748B] font-bold uppercase tracking-wider block">Total Applications</span>
                <p className="text-lg font-black text-slate-800 dark:text-white mt-0.5">{jobCandidates.length}</p>
                <p className="text-[9px] text-emerald-500 font-semibold mt-0.5">↑ 8% vs platform average</p>
              </div>
              <div className="p-3 bg-slate-50/50 dark:bg-slate-900/40 rounded-xl border border-slate-100/50 dark:border-slate-850">
                <span className="text-[9px] text-[#64748B] font-bold uppercase tracking-wider block">Conversion Rate</span>
                <p className="text-lg font-black text-slate-800 dark:text-white mt-0.5">
                  {jobCandidates.length > 0 ? Math.round((jobCandidates.filter(c => ['ACCEPTED', 'JOINED', 'HIRED'].includes(c.status.toUpperCase())).length / jobCandidates.length) * 100) : 0}%
                </p>
                <p className="text-[9px] text-indigo-500 font-semibold mt-0.5">Application to Hire</p>
              </div>
              <div className="p-3 bg-slate-50/50 dark:bg-slate-900/40 rounded-xl border border-slate-100/50 dark:border-slate-850">
                <span className="text-[9px] text-[#64748B] font-bold uppercase tracking-wider block">Time to Hire</span>
                <p className="text-lg font-black text-slate-800 dark:text-white mt-0.5">18 Days</p>
                <p className="text-[9px] text-emerald-500 font-semibold mt-0.5">↓ 4 days faster than SLA</p>
              </div>
              <div className="p-3 bg-slate-50/50 dark:bg-slate-900/40 rounded-xl border border-slate-100/50 dark:border-slate-850">
                <span className="text-[9px] text-[#64748B] font-bold uppercase tracking-wider block">Offer Acceptance Rate</span>
                <p className="text-lg font-black text-slate-800 dark:text-white mt-0.5">92%</p>
                <p className="text-[9px] text-indigo-500 font-semibold mt-0.5">Industry target is 85%</p>
              </div>
            </div>

            {/* Sub Tabs Bar */}
            <div className="flex items-center gap-1 border-t border-slate-100 dark:border-slate-800/80 pt-4 overflow-x-auto">
              {[
                { id: 'overview', name: 'Overview Details', icon: FileText },
                { id: 'candidates', name: 'Candidates Directory', icon: Users },
                { id: 'pipeline', name: 'candidate pipeline', icon: Layers },
                { id: 'interviews', name: 'Interviews & Schedules', icon: Calendar },
                { id: 'offers', name: 'Offers & Compensation', icon: Award },
                { id: 'activity', name: 'Audit Trail', icon: Activity },
                { id: 'documents', name: 'Job Docs & Templates', icon: CheckCircle }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setDrawerTab(tab.id as any)}
                  className={clsx(
                    'flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all border',
                    drawerTab === tab.id
                      ? 'bg-[#6366F1]/10 border-[#6366F1]/30 text-[#6366F1] shadow-sm'
                      : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-850'
                  )}
                >
                  <tab.icon size={13} />
                  <span>{tab.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sub Tab View Container */}
          <div className="bg-white dark:bg-[#0B0F19] p-6 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.01)] min-h-[400px]">
            
            {/* 1. OVERVIEW TAB */}
            {drawerTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Left Column: Job & Position Information */}
                  <div className="md:col-span-2 space-y-6">
                    <div className="space-y-3">
                      <h3 className="text-sm font-black text-slate-800 dark:text-white">Job Description Summary</h3>
                      <p className="text-[11px] text-slate-500 leading-relaxed whitespace-pre-line border border-slate-50 dark:border-slate-850 p-4 rounded-xl">
                        {selectedJob.jobDescription}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100/50 dark:border-slate-800">
                        <span className="text-[9px] text-[#64748B] font-bold uppercase">Business Unit</span>
                        <p className="font-extrabold text-xs text-[#0F172A] dark:text-white mt-1">
                          {selectedJob.requisition?.businessUnit || 'HR & Technology'}
                        </p>
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100/50 dark:border-slate-800">
                        <span className="text-[9px] text-[#64748B] font-bold uppercase">Cost Center</span>
                        <p className="font-extrabold text-xs text-[#0F172A] dark:text-white mt-1">
                          {selectedJob.requisition?.costCenter || 'CC-TECH-901'}
                        </p>
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100/50 dark:border-slate-800">
                        <span className="text-[9px] text-[#64748B] font-bold uppercase">Total Vacancies</span>
                        <p className="font-extrabold text-xs text-[#0F172A] dark:text-white mt-1">
                          {selectedJob.requisition?.vacancies || 2} Approved
                        </p>
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100/50 dark:border-slate-800">
                        <span className="text-[9px] text-[#64748B] font-bold uppercase">Reporting Manager</span>
                        <p className="font-extrabold text-xs text-[#0F172A] dark:text-white mt-1">
                          {selectedJob.requisition?.reportingManager || 'Robert Davis (Director)'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Metadata, Skills and Funnel */}
                  <div className="space-y-6 border-l border-slate-100 dark:border-slate-850 pl-0 md:pl-6">
                    <div className="space-y-3">
                      <h3 className="text-sm font-black text-slate-800 dark:text-white">Planning & Compensation</h3>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between py-1.5 border-b border-slate-50 dark:border-slate-850">
                          <span className="text-slate-500 font-bold">Salary Budget</span>
                          <span className="font-extrabold text-slate-800 dark:text-white">{selectedJob.salaryRange || '₹9,00,000 - ₹13,00,000'}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-slate-50 dark:border-slate-850">
                          <span className="text-slate-500 font-bold">Experience Range</span>
                          <span className="font-extrabold text-slate-800 dark:text-white">{selectedJob.experience || '3-5 Years'}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-slate-50 dark:border-slate-850">
                          <span className="text-slate-500 font-bold">Priority Status</span>
                          <span className="font-extrabold text-[#F59E0B] uppercase">{selectedJob.requisition?.priority || 'MEDIUM'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-sm font-black text-slate-800 dark:text-white">Required Skills</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedJob.skills.split(',').map((skill) => (
                          <span key={skill} className="px-2.5 py-1 text-[9px] font-bold bg-[#6366F1]/10 text-[#6366F1] rounded-lg">
                            {skill.trim()}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3 bg-[#F8FAFC] dark:bg-[#161B26] p-4 rounded-xl border border-slate-100/50 dark:border-slate-800">
                      <span className="text-[10px] font-black text-[#64748B] uppercase tracking-wider block">Funnel Performance</span>
                      <div className="space-y-2">
                        {[
                          { stage: 'Applied', count: jobCandidates.length, color: 'bg-blue-500' },
                          { stage: 'Screening', count: jobCandidates.filter(c => ['SCREENED', 'SCREENING'].includes(c.status.toUpperCase())).length, color: 'bg-amber-500' },
                          { stage: 'Shortlisted', count: jobCandidates.filter(c => ['SHORTLISTED'].includes(c.status.toUpperCase())).length, color: 'bg-purple-500' },
                          { stage: 'Interview', count: jobCandidates.filter(c => ['INTERVIEW', 'INTERVIEWS'].includes(c.status.toUpperCase())).length, color: 'bg-indigo-500' },
                          { stage: 'Offer', count: jobOffers.length, color: 'bg-pink-500' },
                          { stage: 'Hired', count: jobCandidates.filter(c => ['ACCEPTED', 'JOINED', 'HIRED'].includes(c.status.toUpperCase())).length, color: 'bg-emerald-500' }
                        ].map((item) => {
                          const percent = jobCandidates.length > 0 ? (item.count / jobCandidates.length) * 100 : 0;
                          return (
                            <div key={item.stage} className="space-y-1">
                              <div className="flex justify-between text-[10px] font-bold text-slate-600 dark:text-slate-350">
                                <span>{item.stage}</span>
                                <span>{item.count}</span>
                              </div>
                              <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className={clsx("h-full rounded-full", item.color)} style={{ width: `${percent}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. CANDIDATES TAB */}
            {drawerTab === 'candidates' && (
              <div className="space-y-4">
                {/* Search / Filters Bar */}
                <div className="flex items-center justify-between gap-4">
                  <div className="relative max-w-xs w-64">
                    <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#64748B]" />
                    <input
                      type="text"
                      placeholder="Search candidates by name..."
                      value={candSearch}
                      onChange={e => setCandSearch(e.target.value)}
                      className="w-full bg-[#F8FAFC] dark:bg-[#161B26] border-none rounded-xl pl-9 pr-4 py-2 text-xs outline-none focus:ring-2 focus:ring-[#6366F1] transition dark:text-white"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 font-bold">Stage Filter:</span>
                    <select
                      value={candFilterStage}
                      onChange={e => setCandFilterStage(e.target.value)}
                      className="bg-[#F8FAFC] dark:bg-[#161B26] border-none rounded-xl px-3 py-2 outline-none font-bold cursor-pointer"
                    >
                      <option value="ALL">All Stages</option>
                      <option value="NEW">Applied</option>
                      <option value="SCREENING">Screening</option>
                      <option value="SHORTLISTED">Shortlisted</option>
                      <option value="INTERVIEW">Interview</option>
                      <option value="OFFER">Offer</option>
                      <option value="ACCEPTED">Hired</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </div>
                </div>

                {/* Candidate Directory Table */}
                <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#F8FAFC] dark:bg-[#161B26] border-none text-[#64748B] font-bold">
                        <th className="p-4">Candidate Details</th>
                        <th className="p-4">Current Company / Exp</th>
                        <th className="p-4">Current Stage</th>
                        <th className="p-4 text-center">Move Stage Action</th>
                        <th className="p-4 text-right pr-6">Profile</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCandidates.map((cand) => (
                        <tr key={cand.id} className="border-b border-[#F8FAFC]/50 dark:border-slate-800/40 hover:bg-[#F8FAFC]/50 dark:hover:bg-[#161B26]/30 transition">
                          <td className="p-4">
                            <div className="flex flex-col">
                              <span className="font-extrabold text-slate-800 dark:text-white">{cand.fullName}</span>
                              <span className="text-[10px] text-slate-500 mt-0.5">{cand.email} • {cand.phone}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-850 dark:text-slate-300">{cand.currentCompany || 'Freelancer'}</span>
                              <span className="text-[10px] text-slate-500 mt-0.5">{cand.experienceYears || 0} Years Experience</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={clsx(
                              "px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase",
                              cand.status.toUpperCase() === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-800' :
                              cand.status.toUpperCase() === 'REJECTED' ? 'bg-rose-100 text-rose-800' :
                              cand.status.toUpperCase() === 'OFFER' ? 'bg-pink-100 text-pink-850' :
                              'bg-indigo-100 text-indigo-800'
                            )}>
                              {cand.status}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <select
                              value={cand.status.toUpperCase()}
                              onChange={(e) => handleMoveStage(cand.id, e.target.value)}
                              className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg px-2.5 py-1 outline-none font-bold text-[10px] cursor-pointer"
                            >
                              <option value="NEW">Applied</option>
                              <option value="SCREENING">Screening</option>
                              <option value="SHORTLISTED">Shortlisted</option>
                              <option value="INTERVIEW">Interview</option>
                              <option value="OFFER">Offer</option>
                              <option value="ACCEPTED">Hired</option>
                              <option value="REJECTED">Reject</option>
                            </select>
                          </td>
                          <td className="p-4 text-right pr-6">
                            <button
                              onClick={() => navigate(`/recruitment?tab=candidates&candidateId=${cand.id}`)}
                              className="text-[#6366F1] hover:text-[#4F46E5] font-black flex items-center gap-1 ml-auto"
                            >
                              <span>View Profile</span>
                              <ArrowUpRight size={12} />
                            </button>
                          </td>
                        </tr>
                      ))}

                      {filteredCandidates.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-12 text-center text-[#64748B]">
                            <Users size={32} className="mx-auto text-slate-300 mb-2" />
                            <p className="font-extrabold">No candidates match your filters.</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 3. PIPELINE KANBAN TAB */}
            {drawerTab === 'pipeline' && (
              <div className="space-y-4">
                <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
                  <p className="text-[10px] font-semibold flex items-center gap-1.5">
                    <Info size={14} />
                    <span>Manage candidates through recruitment pipeline. Use navigation arrows inside cards to transition instantly.</span>
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-7 gap-3 overflow-x-auto pb-4">
                  {KANBAN_STAGES.map((stage, sIdx) => {
                    const stageCandidates = jobCandidates.filter(c => {
                      if (stage.id === 'NEW') return ['NEW', 'APPLIED'].includes(c.status.toUpperCase());
                      if (stage.id === 'ACCEPTED') return ['ACCEPTED', 'JOINED', 'HIRED'].includes(c.status.toUpperCase());
                      return c.status.toUpperCase() === stage.id;
                    });

                    return (
                      <div key={stage.id} className="bg-slate-50 dark:bg-[#161B26] p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 space-y-3 min-w-[150px]">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
                          <span className={clsx("px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider", stage.color)}>
                            {stage.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold">{stageCandidates.length}</span>
                        </div>

                        <div className="space-y-2.5 min-h-[300px]">
                          {stageCandidates.map((cand) => (
                            <div key={cand.id} className="bg-white dark:bg-[#0B0F19] p-2.5 rounded-lg border border-slate-100 dark:border-slate-850 shadow-sm space-y-2">
                              <div>
                                <h4 className="font-extrabold text-slate-800 dark:text-white truncate">{cand.fullName}</h4>
                                <p className="text-[9px] text-slate-500 mt-0.5">{cand.candidateCode}</p>
                              </div>
                              
                              {/* Stage movement quick arrows */}
                              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-850">
                                <button 
                                  disabled={sIdx === 0}
                                  onClick={() => handleMoveStage(cand.id, KANBAN_STAGES[sIdx - 1].id)}
                                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 disabled:opacity-30 transition"
                                  title="Move Left"
                                >
                                  <ChevronLeft size={12} />
                                </button>
                                <button
                                  onClick={() => navigate(`/recruitment?tab=candidates&candidateId=${cand.id}`)}
                                  className="text-[9px] font-bold text-slate-400 hover:text-[#6366F1]"
                                >
                                  Profile
                                </button>
                                <button 
                                  disabled={sIdx === KANBAN_STAGES.length - 1}
                                  onClick={() => handleMoveStage(cand.id, KANBAN_STAGES[sIdx + 1].id)}
                                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 disabled:opacity-30 transition"
                                  title="Move Right"
                                >
                                  <ChevronRight size={12} />
                                </button>
                              </div>
                            </div>
                          ))}

                          {stageCandidates.length === 0 && (
                            <div className="h-32 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-center text-slate-300">
                              <span className="text-[10px] font-bold">Empty</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 4. INTERVIEWS & SCHEDULES TAB */}
            {drawerTab === 'interviews' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Schedule Interview Form */}
                  <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100/50 dark:border-slate-800 space-y-4 h-fit">
                    <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2">
                      <Calendar size={14} className="text-[#6366F1]" />
                      <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">Schedule Interview</h3>
                    </div>
                    
                    <form onSubmit={handleScheduleInterview} className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase">Select Candidate</label>
                        <select
                          value={schedCandidateId}
                          onChange={e => setSchedCandidateId(e.target.value)}
                          className="w-full bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-2 outline-none font-bold text-xs"
                          required
                        >
                          <option value="">Select Candidate...</option>
                          {jobCandidates.map(c => (
                            <option key={c.id} value={c.id}>{c.fullName} ({c.status})</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase">Interview Type</label>
                        <select
                          value={schedType}
                          onChange={e => setSchedType(e.target.value)}
                          className="w-full bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-2 outline-none font-bold text-xs"
                        >
                          <option value="TECHNICAL">Technical Round</option>
                          <option value="MANAGERIAL">Managerial round</option>
                          <option value="HR">HR Discussion</option>
                          <option value="SCREENING">Initial Screen</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase">Date & Time</label>
                        <input
                          type="datetime-local"
                          value={schedTime}
                          onChange={e => setSchedTime(e.target.value)}
                          className="w-full bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-2 outline-none font-bold text-xs"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase">Interviewers Panel</label>
                        <input
                          type="text"
                          placeholder="e.g. Sarah Jenkins, Dave Miller"
                          value={schedInterviewers}
                          onChange={e => setSchedInterviewers(e.target.value)}
                          className="w-full bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-2 outline-none font-bold text-xs"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white font-bold rounded-lg transition shadow-sm"
                      >
                        Schedule Interview Slot
                      </button>
                    </form>
                  </div>

                  {/* Interviews List */}
                  <div className="md:col-span-2 space-y-4">
                    <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">Scheduled Interview List</h3>

                    {isLoadingInterviews ? (
                      <div className="p-8 text-center text-slate-400 font-bold">Loading scheduled interviews...</div>
                    ) : jobInterviews.length === 0 ? (
                      <div className="p-12 text-center text-slate-400 border border-dashed border-slate-100 dark:border-slate-850 rounded-xl space-y-2">
                        <Calendar size={28} className="mx-auto text-slate-300" />
                        <p className="font-bold text-xs">No Interviews Scheduled Yet</p>
                        <p className="text-[10px]">Use the left panel to schedule your first round.</p>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {jobInterviews.map((int) => (
                          <div key={int.id} className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-xl flex items-center justify-between">
                            <div className="space-y-1">
                              <span className="px-2 py-0.5 rounded text-[9px] font-black bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400 uppercase tracking-wide">
                                {int.interviewType}
                              </span>
                              <h4 className="font-extrabold text-slate-800 dark:text-white mt-1.5">{int.candidate?.fullName}</h4>
                              <p className="text-[10px] text-slate-500 flex items-center gap-1">
                                <Clock size={11} />
                                <span>{new Date(int.scheduledTime).toLocaleString()}</span>
                              </p>
                            </div>
                            <div className="text-right space-y-1">
                              <p className="text-[10px] text-slate-500 font-bold">Panel: {int.interviewerIds || 'Not Assigned'}</p>
                              <span className="text-[9px] font-black text-emerald-500 uppercase">{int.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 5. OFFERS TAB */}
            {drawerTab === 'offers' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Create Offer Package form */}
                  <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100/50 dark:border-slate-800 space-y-4 h-fit">
                    <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2">
                      <Award size={14} className="text-purple-650" />
                      <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">Generate Offer Letter</h3>
                    </div>

                    <form onSubmit={handleCreateOffer} className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase">Select Candidate</label>
                        <select
                          value={offerCandId}
                          onChange={e => setOfferCandId(e.target.value)}
                          className="w-full bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-2 outline-none font-bold text-xs"
                          required
                        >
                          <option value="">Select Candidate...</option>
                          {jobCandidates.filter(c => ['SHORTLISTED', 'INTERVIEW', 'OFFER'].includes(c.status.toUpperCase())).map(c => (
                            <option key={c.id} value={c.id}>{c.fullName} ({c.status})</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase">Annual CTC ($)</label>
                        <input
                          type="number"
                          value={offerCtc}
                          onChange={e => setOfferCtc(e.target.value)}
                          className="w-full bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-2 outline-none font-bold text-xs"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase">Joining Bonus ($)</label>
                        <input
                          type="number"
                          value={offerBonus}
                          onChange={e => setOfferBonus(e.target.value)}
                          className="w-full bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-2 outline-none font-bold text-xs"
                        />
                      </div>

                      <DatePicker
                        label="Expected Joining Date"
                        value={offerDate}
                        onChange={setOfferDate}
                        required
                      />

                      <button
                        type="submit"
                        className="w-full py-2 bg-purple-600 hover:bg-purple-750 text-white font-bold rounded-lg transition shadow-sm"
                      >
                        Extend Offer Package
                      </button>
                    </form>
                  </div>

                  {/* Offers extended list */}
                  <div className="md:col-span-2 space-y-4">
                    <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">Extended Offers Workflow</h3>

                    {isLoadingOffers ? (
                      <div className="p-8 text-center text-slate-400 font-bold">Loading offer packages...</div>
                    ) : jobOffers.length === 0 ? (
                      <div className="p-12 text-center text-slate-400 border border-dashed border-slate-100 dark:border-slate-850 rounded-xl space-y-2">
                        <Award size={28} className="mx-auto text-slate-300" />
                        <p className="font-bold text-xs">No Offers Generated Yet</p>
                        <p className="text-[10px]">Use the left panel to prefill and dispatch an offer package.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {jobOffers.map((off) => (
                          <div key={off.id} className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-xl space-y-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-extrabold text-slate-800 dark:text-white">{off.candidate?.fullName}</h4>
                                <p className="text-[9px] text-slate-500">Package CTC: ${(off.ctc || 120000).toLocaleString()} • Bonus: ${(off.joiningBonus || off.bonus || 10000).toLocaleString()}</p>
                              </div>
                              <span className={clsx(
                                "px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase border",
                                off.status.toUpperCase() === 'APPROVED' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                                off.status.toUpperCase() === 'PENDING_APPROVAL' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                                'bg-slate-100 text-slate-800 border-slate-300'
                              )}>
                                {off.status}
                              </span>
                            </div>
                            
                            {/* Offer lifecycle workflow controls */}
                            <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                              {off.status.toUpperCase() === 'PENDING_APPROVAL' && (
                                <>
                                  <button
                                    onClick={() => handleApproveOffer(off.id)}
                                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition"
                                  >
                                    Approve Offer
                                  </button>
                                  <button
                                    onClick={() => handleRejectOffer(off.id)}
                                    className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition"
                                  >
                                    Reject Offer
                                  </button>
                                </>
                              )}
                              {off.status.toUpperCase() === 'APPROVED' && (
                                <button
                                  onClick={() => handleAcceptOffer(off.id)}
                                  className="px-3 py-1 bg-indigo-650 hover:bg-indigo-700 text-white font-bold rounded-lg transition"
                                >
                                  Mark Accepted (Sign Candidate)
                                </button>
                              )}
                              <span className="text-[10px] text-slate-400 font-bold ml-auto">Joining Date: {new Date(off.joiningDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 6. ACTIVITY LOGS TAB */}
            {drawerTab === 'activity' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">Job Audit Timeline</h3>
                  <span className="text-[10px] text-slate-400 font-bold">Traceability & Security Enabled</span>
                </div>

                <div className="relative border-l border-slate-200 dark:border-slate-800 pl-6 ml-3 py-2 space-y-6 text-xs">
                  <div className="relative">
                    <span className="absolute -left-[30px] top-1 p-1 bg-emerald-500 text-white rounded-full"><CheckCircle size={10} /></span>
                    <span className="text-[10px] text-slate-400 font-bold">TODAY, 11:20 AM</span>
                    <p className="font-extrabold text-slate-800 dark:text-white mt-0.5">Job posting updated</p>
                    <p className="text-slate-500">Pipeline summary updated by HR system integration.</p>
                  </div>
                  <div className="relative">
                    <span className="absolute -left-[30px] top-1 p-1 bg-purple-500 text-white rounded-full"><Award size={10} /></span>
                    <span className="text-[10px] text-slate-400 font-bold">YESTERDAY, 3:45 PM</span>
                    <p className="font-extrabold text-slate-800 dark:text-white mt-0.5">Offer extended to candidate</p>
                    <p className="text-slate-500">System generated offer package for candidate folder.</p>
                  </div>
                  <div className="relative">
                    <span className="absolute -left-[30px] top-1 p-1 bg-blue-500 text-white rounded-full"><Plus size={10} /></span>
                    <span className="text-[10px] text-slate-400 font-bold">3 DAYS AGO</span>
                    <p className="font-extrabold text-slate-800 dark:text-white mt-0.5">Job Posting Published</p>
                    <p className="text-slate-500">Copied position DNA details & pushed live to job boards.</p>
                  </div>
                </div>
              </div>
            )}

            {/* 7. DOCUMENTS TAB */}
            {drawerTab === 'documents' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">Job Specific Documents</h3>
                    <div className="p-4 border border-dashed border-slate-200 dark:border-slate-850 rounded-xl text-center space-y-2">
                      <FileSpreadsheet size={24} className="mx-auto text-slate-400" />
                      <p className="font-bold">Required Skills Matrix.xlsx</p>
                      <button className="px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold rounded-lg transition">
                        Download Matrix
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">Enterprise Offer Templates</h3>
                    <div className="p-4 border border-slate-100 dark:border-slate-800 rounded-xl space-y-2 text-xs">
                      <div className="flex justify-between items-center py-1.5 border-b border-slate-50 dark:border-slate-850">
                        <span className="font-bold">US Salary Offer Template.pdf</span>
                        <span className="text-indigo-500 font-bold hover:underline cursor-pointer">Preview</span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 border-b border-slate-50 dark:border-slate-850">
                        <span className="font-bold">Contractor Agreement Template.pdf</span>
                        <span className="text-indigo-500 font-bold hover:underline cursor-pointer">Preview</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      ) : (
        /* ── ORIGINAL JOB POSTINGS LIST VIEW (MAIN DASHBOARD) ── */
        <>
          {/* ── EXECUTIVE KPI METRICS ROW ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* Card 1: Published */}
            <div className="bg-white dark:bg-[#0B0F19] p-3.5 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.01)] border border-slate-100 dark:border-slate-800/80 flex items-center justify-between h-20">
              <div className="flex items-center gap-3">
                <span className="p-2 text-[#22C55E] bg-[#22C55E]/10 rounded-xl"><Briefcase size={16} /></span>
                <div>
                  <span className="text-[9px] text-[#64748B] font-bold uppercase tracking-wider block">Published Jobs</span>
                  <p className="text-xl font-bold tracking-tight text-[#0F172A] dark:text-white mt-0.5">{publishedCount}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-[#22C55E] bg-[#22C55E]/10 px-2 py-0.5 rounded-full font-black">Active</span>
                <p className="text-[9px] text-[#64748B] font-semibold mt-1">↑ 12% vs last mo</p>
              </div>
            </div>

            {/* Card 2: Applications */}
            <div className="bg-white dark:bg-[#0B0F19] p-3.5 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.01)] border border-slate-100 dark:border-slate-800/80 flex items-center justify-between h-20">
              <div className="flex items-center gap-3">
                <span className="p-2 text-[#6366F1] bg-[#6366F1]/10 rounded-xl"><Send size={16} /></span>
                <div>
                  <span className="text-[9px] text-[#64748B] font-bold uppercase tracking-wider block">Applications</span>
                  <p className="text-xl font-bold tracking-tight text-[#0F172A] dark:text-white mt-0.5">{totalApplications}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-[#6366F1] bg-[#6366F1]/10 px-2 py-0.5 rounded-full font-black">Received</span>
                <p className="text-[9px] text-[#64748B] font-semibold mt-1">↑ 24% vs last mo</p>
              </div>
            </div>

            {/* Card 3: Shortlisted */}
            <div className="bg-white dark:bg-[#0B0F19] p-3.5 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.01)] border border-slate-100 dark:border-slate-800/80 flex items-center justify-between h-20">
              <div className="flex items-center gap-3">
                <span className="p-2 text-purple-600 bg-purple-500/10 rounded-xl"><Award size={16} /></span>
                <div>
                  <span className="text-[9px] text-[#64748B] font-bold uppercase tracking-wider block">Shortlisted</span>
                  <p className="text-xl font-bold tracking-tight text-[#0F172A] dark:text-white mt-0.5">{shortlistedCount}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-purple-650 bg-purple-500/10 px-2 py-0.5 rounded-full font-black">Qualified</span>
                <p className="text-[9px] text-[#64748B] font-semibold mt-1">↑ 8% this week</p>
              </div>
            </div>

            {/* Card 4: Conversion Rate */}
            <div className="bg-white dark:bg-[#0B0F19] p-3.5 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.01)] border border-slate-100 dark:border-slate-800/80 flex items-center justify-between h-20">
              <div className="flex items-center gap-3">
                <span className="p-2 text-rose-600 bg-rose-500/10 rounded-xl"><Percent size={16} /></span>
                <div>
                  <span className="text-[9px] text-[#64748B] font-bold uppercase tracking-wider block">Conversion Rate</span>
                  <p className="text-xl font-bold tracking-tight text-[#0F172A] dark:text-white mt-0.5">{conversionRate}%</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-rose-650 bg-rose-500/10 px-2 py-0.5 rounded-full font-black">Pipeline</span>
                <p className="text-[9px] text-[#64748B] font-semibold mt-1">↑ 2.1% improvement</p>
              </div>
            </div>

          </div>

          {/* ── DATA WORKBAR & TAB FILTERS ── */}
          <div className="bg-white dark:bg-[#0B0F19] p-4 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex flex-wrap items-center justify-between gap-4">
            
            {/* Saved Views / Filters */}
            <div className="flex items-center gap-1 bg-[#F8FAFC] dark:bg-[#161B26] p-1 rounded-xl">
              {[
                { id: 'ALL', name: 'All Jobs' },
                { id: 'PUBLISHED', name: 'Published' },
                { id: 'DRAFT', name: 'Drafts' },
                { id: 'PAUSED', name: 'Paused' },
                { id: 'ARCHIVED', name: 'Archived' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id as any)}
                  className={clsx(
                    'px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all',
                    selectedTab === tab.id
                      ? 'bg-white dark:bg-[#0B0F19] text-[#6366F1] shadow-sm'
                      : 'text-[#64748B] hover:text-[#0F172A] dark:hover:text-white'
                  )}
                >
                  {tab.name}
                </button>
              ))}
            </div>

            {/* Search, Filter, Export Actions */}
            <div className="flex items-center gap-3">
              <div className="relative max-w-xs w-56">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#64748B]" />
                <input
                  type="text"
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full bg-[#F8FAFC] dark:bg-[#161B26] border-none rounded-xl pl-9 pr-4 py-2 text-xs outline-none focus:ring-2 focus:ring-[#6366F1] transition dark:text-white"
                />
              </div>

              <button className="p-2 bg-[#F8FAFC] dark:bg-[#161B26] text-[#64748B] hover:text-[#0F172A] rounded-xl transition flex items-center gap-1.5 font-bold">
                <SlidersHorizontal size={14} />
                <span>Filters</span>
              </button>

              <button className="p-2 bg-[#F8FAFC] dark:bg-[#161B26] text-[#64748B] hover:text-[#0F172A] rounded-xl transition flex items-center gap-1.5 font-bold">
                <Download size={14} />
                <span>Export</span>
              </button>

              <button
                onClick={() => setShowSelectPosModal(true)}
                className="bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-bold py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-sm transition"
              >
                <Plus size={14} />
                <span>Publish Job</span>
              </button>
            </div>
          </div>

          {/* ── ENTERPRISE DATA GRID TABLE ── */}
          <div className="bg-white dark:bg-[#0B0F19] rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.01)] border-none overflow-hidden relative">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F8FAFC] dark:bg-[#161B26] border-none text-[#64748B] font-bold">
                    <th className="p-4">Job Details & Code</th>
                    <th className="p-4">Department & Location</th>
                    <th className="p-4">Pipeline Summary</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right pr-6">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((post, idx) => {
                    const jobCode = `JOB-0${100 + idx}`;
                    
                    // Match candidate counts
                    const matchingCandCount = candidates.filter(
                      c => c.skills?.toLowerCase().includes(post.jobTitle.split(' ')[0].toLowerCase())
                    ).length;

                    return (
                      <tr 
                        key={post.id} 
                        className="border-b border-[#F8FAFC]/50 dark:border-slate-800/40 hover:bg-[#F8FAFC]/50 dark:hover:bg-[#161B26]/30 cursor-pointer transition"
                        onClick={() => {
                          setSelectedJob(post);
                          setDrawerTab('overview');
                        }}
                      >
                        <td className="p-4 max-w-[240px]">
                          <div className="flex flex-col">
                            <span className="font-extrabold text-xs text-[#0F172A] dark:text-[#F1F5F9] hover:text-[#6366F1] transition truncate">
                              {post.jobTitle}
                            </span>
                            <span className="text-[9px] font-bold text-[#64748B]/80 mt-0.5 tracking-wider uppercase">{jobCode}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-xs text-[#0F172A] dark:text-[#E2E8F0]">{post.requisition?.department || 'Engineering'}</span>
                            <span className="text-[10px] text-[#64748B] mt-0.5 font-medium flex items-center gap-0.5">
                              <MapPin size={9} className="text-[#64748B]/60" /> {post.location}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-[10px] font-extrabold text-[#64748B]">
                            <span className="bg-slate-50 dark:bg-[#161B26] px-2 py-1 rounded-md border border-slate-100 dark:border-slate-800 text-[#0F172A] dark:text-[#F1F5F9]"><strong className="text-indigo-650 dark:text-indigo-400 font-black">{matchingCandCount}</strong> Apps</span>
                            <ChevronRight size={10} className="text-slate-300 shrink-0" />
                            <span className="bg-slate-50 dark:bg-[#161B26] px-2 py-1 rounded-md border border-slate-100 dark:border-slate-800 text-[#0F172A] dark:text-[#F1F5F9]"><strong className="text-purple-600 dark:text-purple-400 font-black">{Math.round(matchingCandCount * 0.4)}</strong> Shortlisted</span>
                            <ChevronRight size={10} className="text-slate-300 shrink-0" />
                            <span className="bg-slate-50 dark:bg-[#161B26] px-2 py-1 rounded-md border border-slate-100 dark:border-slate-800 text-[#0F172A] dark:text-[#F1F5F9]"><strong className="text-amber-600 dark:text-amber-400 font-black">{Math.round(matchingCandCount * 0.2)}</strong> Offers</span>
                            <ChevronRight size={10} className="text-slate-300 shrink-0" />
                            <span className="bg-slate-50 dark:bg-[#161B26] px-2 py-1 rounded-md border border-slate-100 dark:border-slate-800 text-[#0F172A] dark:text-[#F1F5F9]"><strong className="text-emerald-600 dark:text-emerald-450 font-black">{Math.round(matchingCandCount * 0.1)}</strong> Hired</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={clsx(
                            'px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase',
                            post.status.toUpperCase() === 'PUBLISHED' ? 'bg-[#22C55E]/15 text-[#22C55E]' :
                            post.status.toUpperCase() === 'PAUSED' ? 'bg-[#F59E0B]/15 text-[#F59E0B]' :
                            'bg-[#64748B]/15 text-[#64748B]'
                          )}>
                            {post.status}
                          </span>
                        </td>
                        <td className="p-4 text-right pr-6" onClick={e => e.stopPropagation()}>
                          <div className="relative inline-block text-left">
                            <button
                              onClick={() => setActiveMenuId(activeMenuId === post.id ? null : post.id)}
                              className="p-2 text-[#64748B] hover:text-[#0F172A] dark:hover:text-white rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
                            >
                              <MoreVertical size={16} />
                            </button>
    
                            {activeMenuId === post.id && (
                              <>
                                <div className="fixed inset-0 z-40" onClick={() => setActiveMenuId(null)} />
                                <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1.5 z-50 animate-fade-in text-xs font-bold text-left">
                                  <button
                                    onClick={() => {
                                      onViewApplicants(post.jobTitle);
                                      setActiveMenuId(null);
                                    }}
                                    className="w-full px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-850 text-[#0F172A] dark:text-[#E2E8F0] block"
                                  >
                                    View Candidates
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleOpenEdit(post);
                                      setActiveMenuId(null);
                                    }}
                                    className="w-full px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-850 text-[#0F172A] dark:text-[#E2E8F0] block"
                                  >
                                    Edit Job
                                  </button>
                                  {post.status.toUpperCase() !== 'PUBLISHED' ? (
                                    <button
                                      onClick={() => {
                                        handleActivate(post.id);
                                        setActiveMenuId(null);
                                      }}
                                      className="w-full px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-850 text-emerald-600 block font-bold"
                                    >
                                      Activate Job
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        onChangeStatus(post.id, post.status);
                                        setActiveMenuId(null);
                                      }}
                                      className="w-full px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-850 text-amber-600 block font-bold"
                                    >
                                      Pause Job
                                    </button>
                                  )}
                                  <button
                                    onClick={() => {
                                      handleDuplicate(post.id);
                                      setActiveMenuId(null);
                                    }}
                                    className="w-full px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-850 text-[#0F172A] dark:text-[#E2E8F0] block"
                                  >
                                    Duplicate Job
                                  </button>
                                  <div className="h-px bg-slate-200 dark:bg-slate-800 my-1" />
                                  <button
                                    onClick={() => {
                                      handleOpenArchiveConfirm(post);
                                      setActiveMenuId(null);
                                    }}
                                    className="w-full px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-850 text-rose-500 block font-bold"
                                  >
                                    Archive Job
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-[#64748B]">
                        <div className="max-w-sm mx-auto space-y-3">
                          <Briefcase size={36} className="mx-auto text-slate-300" />
                          <p className="font-extrabold text-sm">No Jobs Published Yet</p>
                          <p className="text-xs text-[#64748B]">Publish your first position to start attracting candidates.</p>
                          <button
                            onClick={() => setShowSelectPosModal(true)}
                            className="bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-bold py-2 px-4 rounded-xl transition"
                          >
                            Publish Job
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── REQUISITION SELECTION DIALOG (No manual creation without Position) ── */}
          {showSelectPosModal && (
            <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-[#0B0F19] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-fade-in">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-850">
                  <h3 className="text-sm font-black text-[#0F172A] dark:text-white uppercase tracking-wide">Select Position to Publish</h3>
                  <button 
                    onClick={() => {
                      setShowSelectPosModal(false);
                      setSelectedPosId('');
                    }} 
                    className="text-slate-400 hover:text-slate-655"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="p-3 bg-[#6366F1]/10 text-[#6366F1] rounded-xl">
                    <p className="text-[10px] font-semibold leading-relaxed">
                      In compliance with enterprise hiring controls, jobs must map to approved workforce positions. Please select a position below.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-[#64748B] uppercase text-[9px]">Approved Position Node</label>
                    <select
                      value={selectedPosId}
                      onChange={e => setSelectedPosId(e.target.value)}
                      className="w-full bg-[#F8FAFC] dark:bg-[#161B26] border-none rounded-xl px-3 py-2.5 outline-none font-bold cursor-pointer"
                    >
                      <option value="">Select Position...</option>
                      {approvedPositions.map(pos => (
                        <option key={pos.id} value={pos.id}>
                          {pos.reqNumber} - {pos.title} ({pos.department})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => {
                      setShowSelectPosModal(false);
                      setSelectedPosId('');
                    }}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-[#64748B] font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePublishFromPosition}
                    disabled={!selectedPosId}
                    className="px-4 py-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white font-bold rounded-xl shadow-sm transition disabled:opacity-50"
                  >
                    Confirm & Prefill
                  </button>
                </div>
              </div>
            </div>
          )}

        {showEditModal && (
          <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-lg w-full mx-4 space-y-4 shadow-2xl animate-fade-in text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-extrabold text-[#0F172A] dark:text-[#F1F5F9]">Edit Job Posting</h3>
                <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                  <X size={16} />
                </button>
              </div>
              <form onSubmit={handleSaveEdit} className="space-y-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#64748B] uppercase text-[9px]">Job Title</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 outline-none text-[#0F172A] dark:text-[#F1F5F9]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-[#64748B] uppercase text-[9px]">Job Description</label>
                  <textarea
                    value={editDesc}
                    onChange={e => setEditDesc(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 outline-none h-24 text-[#0F172A] dark:text-[#F1F5F9]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-[#64748B] uppercase text-[9px]">Required Skills (Comma Separated)</label>
                  <input
                    type="text"
                    value={editSkills}
                    onChange={e => setEditSkills(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 outline-none text-[#0F172A] dark:text-[#F1F5F9]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-[#64748B] uppercase text-[9px]">Location</label>
                    <input
                      type="text"
                      value={editLoc}
                      onChange={e => setEditLoc(e.target.value)}
                      required
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 outline-none text-[#0F172A] dark:text-[#F1F5F9]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-[#64748B] uppercase text-[9px]">Salary Range</label>
                    <input
                      type="text"
                      value={editSalary}
                      onChange={e => setEditSalary(e.target.value)}
                      required
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 outline-none text-[#0F172A] dark:text-[#F1F5F9]"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-[#64748B] uppercase text-[9px]">Experience Level</label>
                    <input
                      type="text"
                      value={editExp}
                      onChange={e => setEditExp(e.target.value)}
                      required
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 outline-none text-[#0F172A] dark:text-[#F1F5F9]"
                      placeholder="3-5 Years"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-[#64748B] uppercase text-[9px]">Employment Type</label>
                    <select
                      value={editEmpType}
                      onChange={e => setEditEmpType(e.target.value)}
                      required
                      className="w-full bg-[#F8FAFC] dark:bg-[#161B26] border-none rounded-xl px-3 py-2.5 outline-none font-bold text-[#0F172A] dark:text-[#F1F5F9] cursor-pointer"
                    >
                      <option value="FULL_TIME">Full Time</option>
                      <option value="PART_TIME">Part Time</option>
                      <option value="CONTRACT">Contract</option>
                      <option value="INTERN">Intern</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-[#64748B] uppercase text-[9px]">Job Status</label>
                  <select
                    value={editStatus}
                    onChange={e => setEditStatus(e.target.value)}
                    required
                    className="w-full bg-[#F8FAFC] dark:bg-[#161B26] border-none rounded-xl px-3 py-2.5 outline-none font-bold text-[#0F172A] dark:text-[#F1F5F9] cursor-pointer"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="PAUSED">Paused</option>
                    <option value="CLOSED">Closed</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-[#64748B] font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white font-bold rounded-xl shadow-sm transition"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showArchiveConfirm && (
          <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-sm w-full mx-4 space-y-4 shadow-2xl animate-fade-in text-xs text-left">
              <div className="flex items-center gap-3 text-rose-500 pb-2 border-b border-slate-100 dark:border-slate-800">
                <AlertTriangle size={20} className="text-rose-500 animate-pulse" />
                <h3 className="text-sm font-extrabold">Archive Job Posting?</h3>
              </div>
              <p className="text-[#64748B] dark:text-slate-400 font-medium leading-relaxed">
                Are you sure you want to archive <strong className="text-[#0F172A] dark:text-white">"{archiveJobTitle}"</strong>? This will soft-delete the job and remove it from the active jobs list.
              </p>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowArchiveConfirm(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-[#64748B] font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmArchive}
                  className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl shadow-sm transition"
                >
                  Confirm Archive
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    )}

    </div>
  );
}
