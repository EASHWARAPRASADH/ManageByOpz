import React, { useState, useEffect } from 'react';
import {
  type Candidate,
  useGetCandidateNotesQuery,
  useAddCandidateNoteMutation,
  useGetCandidateActivitiesQuery,
  useMoveCandidateStageMutation,
  useGetInterviewsQuery,
  useScheduleInterviewMutation,
  useGetOffersQuery,
  useCreateOfferMutation,
  useSubmitInterviewFeedbackMutation,
} from '../recruitmentApi';
import {
  Mail, Phone, MapPin, Calendar, FileText, ArrowLeft, Send, CheckCircle,
  Clock, User, Award, ExternalLink, MessageSquare, ListTodo, Activity,
  Maximize2, ZoomIn, ZoomOut, RotateCw, Download, Printer, Percent,
  AlertTriangle, PhoneCall, Smartphone, Check, Plus, Upload, Shield,
  Building, Briefcase, IndianRupee, BookOpen, Star, FileCheck, RefreshCw
} from 'lucide-react';
import { formatCurrency } from '../../../utils/currencyFormatter';
import clsx from 'clsx';
import { DatePicker } from '../../employees/DatePicker';

interface CandidateWorkspaceProps {
  candidate: Candidate;
  onBack: () => void;
}

export function CandidateWorkspace({ candidate, onBack }: CandidateWorkspaceProps) {
  const { data: notes, refetch: refetchNotes } = useGetCandidateNotesQuery(candidate.id);
  const { data: activities, refetch: refetchActivities } = useGetCandidateActivitiesQuery(candidate.id);
  const { data: allInterviews, refetch: refetchInterviews } = useGetInterviewsQuery();
  const { data: allOffers, refetch: refetchOffers } = useGetOffersQuery();
  
  const [addNote] = useAddCandidateNoteMutation();
  const [moveStage] = useMoveCandidateStageMutation();
  const [scheduleInterview] = useScheduleInterviewMutation();
  const [createOffer] = useCreateOfferMutation();
  const [submitFeedback] = useSubmitInterviewFeedbackMutation();

  // Active Main Tab
  const [activeTab, setActiveTab] = useState<'overview' | 'resume' | 'timeline' | 'applications' | 'interviews' | 'feedback' | 'offers' | 'documents' | 'notes' | 'activity'>('overview');

  // Input states
  const [newNoteText, setNewNoteText] = useState('');
  const [zoomLevel, setZoomLevel] = useState(100);
  const [rotation, setRotation] = useState(0);

  // Scheduled interview form
  const [intType, setIntType] = useState('TECHNICAL');
  const [intRound, setIntRound] = useState('Round 2: Technical deep-dive');
  const [intTime, setIntTime] = useState('');
  const [intPanel, setIntPanel] = useState('Sarah Jenkins (Engineering), Marcus Chen (Lead Dev)');
  const [intLocation, setIntLocation] = useState('Zoom Call');
  const [intLink, setIntLink] = useState('https://zoom.us/j/984251783');

  // Feedback Scorecard form
  const [scoreTech, setScoreTech] = useState(4);
  const [scoreComm, setScoreComm] = useState(4);
  const [scoreProblem, setScoreProblem] = useState(4);
  const [scoreCulture, setScoreCulture] = useState(4);
  const [scoreLeadership, setScoreLeadership] = useState(4);
  const [feedbackRec, setFeedbackRec] = useState('RECOMMEND_HIRE');
  const [feedbackComments, setFeedbackComments] = useState('');

  // Offer Builder form
  const [offerCtc, setOfferCtc] = useState(candidate.expectedSalary || 120000);
  const [offerBonus, setOfferBonus] = useState(15000);
  const [offerJoinDate, setOfferJoinDate] = useState('2026-08-01');
  const [offerLoc, setOfferLoc] = useState(candidate.location || 'HQ Bangalore');
  const [offerTemplate, setOfferTemplate] = useState('Standard Executive Offer');

  // Documents state checklist
  const [verifiedDocs, setVerifiedDocs] = useState<Record<string, 'VERIFIED' | 'PENDING' | 'REJECTED'>>({
    Aadhaar: 'VERIFIED',
    PAN: 'PENDING',
    Passport: 'PENDING',
    Education: 'PENDING',
    Experience: 'PENDING',
    Photo: 'PENDING',
    'Bank Passbook': 'PENDING'
  });

  const getStageIndex = (status: string) => {
    const stages = ['APPLIED', 'SCREENING', 'SHORTLISTED', 'ASSESSMENT', 'INTERVIEW', 'OFFER', 'ACCEPTED', 'PREBOARDING', 'JOINED', 'REJECTED'];
    const idx = stages.indexOf(status.toUpperCase());
    return idx === -1 ? 0 : idx;
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await moveStage({ id: candidate.id, status: newStatus }).unwrap();
      refetchActivities();
    } catch (err) {
      console.error(err);
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!intTime) return;
    try {
      await scheduleInterview({
        candidate: { id: candidate.id } as any,
        interviewType: intType,
        scheduledTime: intTime,
        interviewerIds: intPanel,
        status: 'SCHEDULED'
      }).unwrap();
      refetchInterviews();
      alert('Interview round scheduled and calendar invitations dispatched.');
    } catch (err) {
      console.error(err);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const candidateInterviews = allInterviews?.filter(i => i.candidate?.id === candidate.id && i.status !== 'COMPLETED') || [];
    if (candidateInterviews.length === 0) {
      alert('No pending active interview rounds found to record feedback scorecard.');
      return;
    }
    const targetInterviewId = candidateInterviews[0].id;
    try {
      await submitFeedback({
        id: targetInterviewId,
        feedback: {
          interviewerId: '00000000-0000-0000-0000-000000000003', // Admin Id
          technicalRating: scoreTech,
          communicationRating: scoreComm,
          problemSolvingRating: scoreProblem,
          cultureFitRating: scoreCulture,
          rating: Math.round((scoreTech + scoreComm + scoreProblem + scoreCulture + scoreLeadership) / 5),
          overallRecommendation: feedbackRec,
          comments: feedbackComments,
          feedbackNotes: `Technical Score: ${scoreTech}, Comm: ${scoreComm}, Problem Solving: ${scoreProblem}, Leadership: ${scoreLeadership}`
        }
      }).unwrap();
      refetchInterviews();
      refetchActivities();
      alert('Evaluation scorecard recorded successfully.');
      setFeedbackComments('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateOfferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createOffer({
        candidate: { id: candidate.id } as any,
        ctc: offerCtc,
        bonus: offerBonus,
        joiningDate: offerJoinDate,
        location: offerLoc,
        status: 'PENDING_APPROVAL'
      }).unwrap();
      refetchOffers();
      refetchActivities();
      alert('Job offer initialized in approval workflow status.');
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    try {
      await addNote({
        id: candidate.id,
        noteText: newNoteText,
        authorId: '00000000-0000-0000-0000-000000000003'
      }).unwrap();
      setNewNoteText('');
      refetchNotes();
      refetchActivities();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleDocVerification = (docName: string) => {
    setVerifiedDocs(prev => ({
      ...prev,
      [docName]: prev[docName] === 'VERIFIED' ? 'PENDING' : 'VERIFIED'
    }));
  };

  // Filter interviews and offers for this candidate
  const candidateInterviews = allInterviews?.filter(i => i.candidate?.id === candidate.id) || [];
  const candidateOffers = allOffers?.filter(o => o.candidate?.id === candidate.id) || [];

  return (
    <div className="flex flex-col min-h-screen text-slate-800 dark:text-slate-100 bg-[#F8FAFC] dark:bg-[#060814] -m-6">
      
      {/* ── Sticky Top Candidate Header ── */}
      <header className="sticky top-0 z-20 bg-white/95 dark:bg-[#0B0F19]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 px-6 py-4 flex flex-col gap-4 shadow-sm shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
            >
              <ArrowLeft size={16} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-650 text-white font-extrabold flex items-center justify-center rounded-2xl text-lg shadow-lg shadow-indigo-500/20">
                {candidate.fullName.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-lg font-black tracking-tight">{candidate.fullName}</h1>
                  <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40">
                    {candidate.candidateCode}
                  </span>
                </div>
                <p className="text-xs text-slate-450 dark:text-slate-400 mt-1 font-bold">
                  {candidate.currentDesignation || 'Applicant'} at {candidate.currentCompany || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleStatusChange('INTERVIEW')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 px-3.5 rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-1.5"
            >
              <Calendar size={14} /> Schedule Interview
            </button>
            <button
              onClick={() => handleStatusChange('OFFER')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-3.5 rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-1.5"
            >
              <Award size={14} /> Generate Offer
            </button>
            <button
              onClick={() => handleStatusChange('REJECTED')}
              className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 dark:bg-rose-950/20 dark:border-rose-900/40 text-xs font-bold py-2 px-3.5 rounded-xl transition-all"
            >
              Reject
            </button>
          </div>
        </div>

        {/* ── Recruitment Stage Bar ── */}
        <div className="border-t border-slate-100 dark:border-slate-800/60 pt-3.5">
          <div className="flex items-center justify-between overflow-x-auto gap-2 pb-1 scrollbar-none">
            {['APPLIED', 'SCREENING', 'SHORTLISTED', 'ASSESSMENT', 'INTERVIEW', 'OFFER', 'ACCEPTED', 'PREBOARDING', 'JOINED', 'REJECTED'].map((stage, idx) => {
              const active = candidate.status.toUpperCase() === stage;
              const completed = getStageIndex(candidate.status) >= idx && candidate.status !== 'REJECTED';
              return (
                <button
                  key={stage}
                  onClick={() => handleStatusChange(stage)}
                  className="flex items-center gap-2 group whitespace-nowrap outline-none shrink-0"
                >
                  <div className="flex items-center gap-1.5">
                    <span className={clsx(
                      'w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black border transition-all',
                      active ? 'bg-indigo-650 border-indigo-650 text-white ring-4 ring-indigo-500/20 scale-105' :
                      completed ? 'bg-emerald-500 border-emerald-500 text-white' :
                      'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500'
                    )}>
                      {completed && !active ? <Check size={10} strokeWidth={3} /> : idx + 1}
                    </span>
                    <span className={clsx(
                      'text-[10px] font-black uppercase tracking-wider transition-colors',
                      active ? 'text-indigo-600 dark:text-indigo-400' :
                      completed ? 'text-emerald-600 dark:text-emerald-450' :
                      'text-slate-400 dark:text-slate-500'
                    )}>
                      {stage}
                    </span>
                  </div>
                  {idx < 9 && (
                    <div className={clsx(
                      'w-6 h-0.5 rounded transition-colors',
                      completed ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'
                    )} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Master-Detail Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 overflow-y-auto">
        
        {/* LEFT COLUMN: Candidate Summary Card (4/12 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-[#0B0F19] rounded-2xl border border-slate-200/60 dark:border-slate-800/80 p-5 shadow-sm space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-200 dark:border-slate-800 shadow-inner">
                <User size={32} />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-slate-800 dark:text-white">{candidate.fullName}</h2>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5">ID: {candidate.candidateCode}</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-150/40 text-[9px] font-black uppercase">
                    Source: {candidate.source || 'Direct Referral'}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 space-y-3.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-450 font-bold uppercase text-[9px]">Email</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{candidate.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-450 font-bold uppercase text-[9px]">Phone</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{candidate.phone}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-450 font-bold uppercase text-[9px]">Location</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{candidate.location}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-450 font-bold uppercase text-[9px]">Current Company</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{candidate.currentCompany || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-450 font-bold uppercase text-[9px]">Current Designation</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{candidate.currentDesignation || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-450 font-bold uppercase text-[9px]">Notice Period</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{candidate.noticePeriodDays ?? 30} Days</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-450 font-bold uppercase text-[9px]">Current CTC</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{candidate.currentSalary ? formatCurrency(candidate.currentSalary) : 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-450 font-bold uppercase text-[9px]">Expected CTC</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{candidate.expectedSalary ? formatCurrency(candidate.expectedSalary) : 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-450 font-bold uppercase text-[9px]">Total Experience</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{candidate.experienceYears ?? 0} Years</span>
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 space-y-2">
              <span className="text-slate-450 font-bold uppercase text-[9px]">Professional Skills</span>
              <div className="flex flex-wrap gap-1">
                {(candidate.skills || 'React, Redux, Node.js, TypeScript').split(',').map((skill, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-350 rounded-lg text-[10px] font-medium">
                    {skill.trim()}
                  </span>
                ))}
              </div>
            </div>

            {/* AI Resume Match */}
            <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-450 font-bold uppercase text-[9px]">AI Resume Match Score</span>
                <span className="text-xs font-black text-indigo-650 dark:text-indigo-400">94%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full" style={{ width: '94%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Profile Workspace Tabs Panel (8/12 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-[#0B0F19] rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm flex flex-col min-h-[600px] overflow-hidden">
          
          {/* Tab Headers */}
          <div className="flex border-b border-slate-250/60 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/10 overflow-x-auto scrollbar-none shrink-0">
            {[
              { id: 'overview', name: 'Overview' },
              { id: 'resume', name: 'Resume & Parsing' },
              { id: 'timeline', name: 'Timeline' },
              { id: 'applications', name: 'Applications' },
              { id: 'interviews', name: 'Interviews' },
              { id: 'feedback', name: 'Feedback Scorecard' },
              { id: 'offers', name: 'Offers Management' },
              { id: 'documents', name: 'Documents Checklist' },
              { id: 'notes', name: 'Internal Notes' },
              { id: 'activity', name: 'Activity Log' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={clsx(
                  'px-5 py-3 text-[11px] font-black uppercase tracking-wider border-b-2 whitespace-nowrap transition-all duration-150',
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-[#0B0F19]'
                    : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                )}
              >
                {tab.name}
              </button>
            ))}
          </div>

          {/* Tab Content Panels */}
          <div className="flex-1 p-6 overflow-y-auto">
            
            {/* OVERVIEW PANEL */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Professional Summary</h3>
                  <p className="text-xs text-slate-500 leading-relaxed bg-slate-50/40 dark:bg-slate-900/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                    Motivated and detail-oriented technical expert with {candidate.experienceYears ?? 4}+ years of professional history developing responsive frontends and backend structures. Possesses excellent communication skills, with a track record of driving cross-functional alignment on core project milestones.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50/40 dark:bg-slate-900/30 border border-slate-150/60 dark:border-slate-850 rounded-xl">
                    <span className="text-[9px] text-[#64748B] font-bold uppercase">Org DNA Alignment</span>
                    <div className="mt-3 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-450 font-bold uppercase text-[9px]">Department</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">Engineering</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-450 font-bold uppercase text-[9px]">Role Band</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">Band B3</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-450 font-bold uppercase text-[9px]">Grade Target</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">Grade 4 (Senior)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-450 font-bold uppercase text-[9px]">Employment Type</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">Full-Time</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50/40 dark:bg-slate-900/30 border border-slate-150/60 dark:border-slate-850 rounded-xl">
                    <span className="text-[9px] text-[#64748B] font-bold uppercase">Work Preferences</span>
                    <div className="mt-3 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-450 font-bold uppercase text-[9px]">Model</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">Hybrid / 3 days Office</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-450 font-bold uppercase text-[9px]">Target Location</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">{candidate.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-450 font-bold uppercase text-[9px]">Notice compliance</span>
                        <span className="font-bold text-emerald-600">Immediate / 30 days max</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* RESUME & PARSING PANEL */}
            {activeTab === 'resume' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Left sub-column: Structured Parsed Data */}
                  <div className="space-y-5">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-850">
                      <h4 className="text-[10px] font-black uppercase text-indigo-650 dark:text-indigo-400 tracking-wider">AI Structured Parser Output</h4>
                      <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/50 text-[9px] text-indigo-650 rounded font-bold">Parser Version 2.4</span>
                    </div>

                    <div className="space-y-4">
                      {/* Skills */}
                      <div className="space-y-1.5">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">Extracted Skills</span>
                        <div className="flex flex-wrap gap-1">
                          {['React.js', 'Redux', 'TypeScript', 'Spring Boot', 'MySQL', 'Aspect-Oriented Aspect', 'Docker'].map((s, i) => (
                            <span key={i} className="px-2 py-0.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded text-[10px]">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Education */}
                      <div className="space-y-2">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">Education History</span>
                        <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-150 dark:border-slate-850 rounded-xl text-xs space-y-1">
                          <p className="font-extrabold text-slate-800 dark:text-white">B.S. in Computer Science & Engineering</p>
                          <p className="text-[10px] text-slate-450">State Tech University • Graduation 2019</p>
                        </div>
                      </div>

                      {/* Certifications */}
                      <div className="space-y-2">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">Certifications</span>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="p-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-150 dark:border-slate-850 rounded-lg">
                            <p className="font-bold text-slate-750 dark:text-slate-200">AWS Solutions Architect</p>
                            <p className="text-[9px] text-slate-400">Credential Ref: AWS-9842</p>
                          </div>
                          <div className="p-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-150 dark:border-slate-850 rounded-lg">
                            <p className="font-bold text-slate-750 dark:text-slate-200">Oracle Certified Java SE</p>
                            <p className="text-[9px] text-slate-400">Credential Ref: OCP-8241</p>
                          </div>
                        </div>
                      </div>

                      {/* Projects */}
                      <div className="space-y-2">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">Key Projects</span>
                        <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-150 dark:border-slate-850 rounded-xl text-xs space-y-1.5">
                          <p className="font-extrabold text-slate-800 dark:text-white">Cloud-Native HRMS Engine</p>
                          <p className="text-[10px] text-slate-500 leading-normal">Developed microservices infrastructure processing 10k digital twins concurrently with Aspect-oriented transaction log tracking.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right sub-column: DocViewer */}
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-[400px]">
                    <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/80 flex justify-between items-center shrink-0">
                      <div className="flex items-center gap-1.5">
                        <FileText size={14} className="text-indigo-500" />
                        <span className="text-[9px] font-black uppercase text-slate-500">DocViewer Toolbar</span>
                      </div>
                      <div className="flex gap-1.5">
                        <button onClick={() => setZoomLevel(z => Math.max(50, z - 10))} className="p-1 hover:bg-white dark:hover:bg-slate-800 rounded"><ZoomOut size={12} /></button>
                        <span className="text-[9px] font-mono self-center text-slate-500">{zoomLevel}%</span>
                        <button onClick={() => setZoomLevel(z => Math.min(200, z + 10))} className="p-1 hover:bg-white dark:hover:bg-slate-800 rounded"><ZoomIn size={12} /></button>
                      </div>
                    </div>
                    <div className="flex-1 p-4 overflow-y-auto bg-slate-200/40 dark:bg-slate-950/40">
                      <div
                        className="bg-white dark:bg-[#111622] p-6 rounded shadow border border-slate-250 dark:border-slate-850 text-[10px] leading-relaxed transition-all duration-150 origin-top"
                        style={{ transform: `scale(${zoomLevel / 100})` }}
                      >
                        <h4 className="text-xs font-bold text-center border-b pb-2 uppercase mb-4">{candidate.fullName}</h4>
                        <p className="font-semibold text-indigo-650 dark:text-indigo-400 uppercase tracking-wider text-[9px] border-b pb-1 mb-2">Experience History</p>
                        <p className="font-bold text-slate-800 dark:text-white">{candidate.currentDesignation || 'Senior Software Engineer'}</p>
                        <p className="text-slate-400 italic mb-2">{candidate.currentCompany || 'Digital Tech Solutions'} (2022 - Present)</p>
                        <p className="text-[9.5px] text-slate-550 mb-4">Responsible for developing core responsive React features. Led a team of three frontend engineers executing state management updates.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TIMELINE PANEL */}
            {activeTab === 'timeline' && (
              <div className="space-y-6">
                <div className="relative pl-6 border-l-2 border-slate-250 dark:border-slate-800 py-2 space-y-6 text-xs">
                  {[
                    { title: 'Offer Released', desc: 'Job offer released via Offer Builder with compensation structure approval.', date: 'June 23, 2026', icon: Award, color: 'bg-emerald-500' },
                    { title: 'Interview Evaluation Scorecard', desc: 'Scorecard submitted with overall Hire recommendation (Avg Rating: 4.2).', date: 'June 21, 2026', icon: FileCheck, color: 'bg-indigo-500' },
                    { title: 'Technical Interview Round Scheduled', desc: 'Scheduled Technical Interview round with Sarah Jenkins (Lead Dev).', date: 'June 19, 2026', icon: Calendar, color: 'bg-blue-500' },
                    { title: 'Resume Sourced & Parsed', desc: 'Candidate details extracted automatically via AI parser engine.', date: 'June 18, 2026', icon: FileText, color: 'bg-slate-500' }
                  ].map((item, idx) => (
                    <div key={idx} className="relative">
                      <span className={clsx('absolute -left-[35px] top-1 w-6 h-6 rounded-full flex items-center justify-center text-white ring-4 ring-white dark:ring-[#0B0F19]', item.color)}>
                        <item.icon size={11} />
                      </span>
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold uppercase">{item.date}</span>
                        <h4 className="font-extrabold text-slate-800 dark:text-white mt-0.5">{item.title}</h4>
                        <p className="text-slate-500 dark:text-slate-400 mt-1 leading-normal">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* APPLICATIONS PANEL */}
            {activeTab === 'applications' && (
              <div className="space-y-4">
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-850 text-slate-500 font-bold">
                        <th className="p-3">Job Code</th>
                        <th className="p-3">Job Title / Role</th>
                        <th className="p-3">Department</th>
                        <th className="p-3">Applied Date</th>
                        <th className="p-3">Current Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-100 dark:border-slate-850">
                        <td className="p-3 font-mono font-bold">JOB-0421</td>
                        <td className="p-3 font-extrabold text-indigo-650 dark:text-indigo-400">Senior React Engineer</td>
                        <td className="p-3">Engineering</td>
                        <td className="p-3">June 18, 2026</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-indigo-50 text-indigo-600 border border-indigo-150">
                            {candidate.status}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* INTERVIEWS PANEL */}
            {activeTab === 'interviews' && (
              <div className="space-y-6">
                
                {/* List of Scheduled/Completed Interviews */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Interview History</h4>
                  {candidateInterviews.map((int) => (
                    <div key={int.id} className="p-4 bg-slate-50/40 dark:bg-slate-900/30 border border-slate-150/60 dark:border-slate-850 rounded-xl flex justify-between items-center text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/45 text-indigo-650 dark:text-indigo-400 border border-indigo-150/40 font-bold text-[9px]">{int.interviewType}</span>
                          <span className="text-slate-450 font-bold">{int.scheduledTime}</span>
                        </div>
                        <p className="text-slate-500 mt-1.5 font-medium">Panelists: {int.interviewerIds || 'N/A'}</p>
                      </div>
                      <span className={clsx(
                        'px-2.5 py-0.5 rounded-full text-[9px] font-black border',
                        int.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border-emerald-250' : 'bg-blue-50 text-blue-600 border-blue-250'
                      )}>
                        {int.status}
                      </span>
                    </div>
                  ))}
                  {candidateInterviews.length === 0 && (
                    <p className="text-xs text-slate-400 py-4 text-center">No scheduled interviews recorded.</p>
                  )}
                </div>

                {/* Form to schedule a new interview round */}
                <form onSubmit={handleScheduleSubmit} className="border-t border-slate-200 dark:border-slate-800 pt-6 space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Schedule New Interview Round</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] text-slate-400 font-bold uppercase">Interview Type</label>
                      <select value={intType} onChange={e => setIntType(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500">
                        <option value="SCREENING">Screening Call</option>
                        <option value="TECHNICAL">Technical Round</option>
                        <option value="SYSTEM_DESIGN">System Design Round</option>
                        <option value="CULTURE_FIT">Culture & Value Alignment</option>
                        <option value="HR_ROUND">HR & Compensation Round</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] text-slate-400 font-bold uppercase">Date & Time</label>
                      <input type="datetime-local" value={intTime} onChange={e => setIntTime(e.target.value)} required className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.8 text-xs outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white" />
                    </div>

                    <div className="space-y-1.5 col-span-2">
                      <label className="text-[9px] text-slate-400 font-bold uppercase">Panel Interviewers</label>
                      <input type="text" value={intPanel} onChange={e => setIntPanel(e.target.value)} required className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white" />
                    </div>

                    <div className="space-y-1.5 col-span-2">
                      <label className="text-[9px] text-slate-400 font-bold uppercase">Meeting Link</label>
                      <input type="text" value={intLink} onChange={e => setIntLink(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white" />
                    </div>
                  </div>

                  <button type="submit" className="bg-indigo-650 hover:bg-indigo-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm">
                    Schedule & Dispatch Invites
                  </button>
                </form>
              </div>
            )}

            {/* FEEDBACK SCORECARD PANEL */}
            {activeTab === 'feedback' && (
              <div className="space-y-6">
                
                {/* Form to submit feedback */}
                <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Record Scorecard Ratings (1-5 Stars)</h4>
                  
                  <div className="grid grid-cols-2 gap-3.5 bg-slate-50/40 dark:bg-slate-900/30 p-4 rounded-xl border border-slate-150/60 dark:border-slate-850">
                    {[
                      { label: 'Technical competency', val: scoreTech, setVal: setScoreTech },
                      { label: 'Communication skill', val: scoreComm, setVal: setScoreComm },
                      { label: 'Problem solving capability', val: scoreProblem, setVal: setScoreProblem },
                      { label: 'Culture & value alignment', val: scoreCulture, setVal: setScoreCulture },
                      { label: 'Leadership potential', val: scoreLeadership, setVal: setScoreLeadership }
                    ].map((item, index) => (
                      <div key={index} className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-650 dark:text-slate-350">{item.label}</span>
                        <div className="flex gap-1.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => item.setVal(star)}
                              className={clsx(
                                'p-0.5 rounded transition',
                                star <= item.val ? 'text-amber-500' : 'text-slate-300 dark:text-slate-700'
                              )}
                            >
                              <Star size={14} fill={star <= item.val ? 'currentColor' : 'none'} />
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1.5 col-span-2">
                      <label className="text-[9px] text-slate-400 font-bold uppercase">Overall Decision</label>
                      <select value={feedbackRec} onChange={e => setFeedbackRec(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500">
                        <option value="STRONG_HIRE">Strong Hire</option>
                        <option value="RECOMMEND_HIRE">Recommend Hire</option>
                        <option value="HOLD">Hold / Waitlist</option>
                        <option value="REJECT">Reject Candidate</option>
                      </select>
                    </div>

                    <div className="space-y-1.5 col-span-2">
                      <label className="text-[9px] text-slate-400 font-bold uppercase">Evaluation comments</label>
                      <textarea
                        value={feedbackComments}
                        onChange={e => setFeedbackComments(e.target.value)}
                        required
                        placeholder="Write constructive evaluation notes details..."
                        rows={3}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <button type="submit" className="bg-indigo-650 hover:bg-indigo-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm">
                    Submit Scorecard
                  </button>
                </form>
              </div>
            )}

            {/* OFFERS PANEL */}
            {activeTab === 'offers' && (
              <div className="space-y-6">
                
                {/* Active Offers */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Offer Proposals</h4>
                  {candidateOffers.map((off) => (
                    <div key={off.id} className="p-4 bg-slate-50/40 dark:bg-slate-900/30 border border-slate-150/60 dark:border-slate-850 rounded-xl text-xs space-y-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-extrabold text-slate-800 dark:text-white">Annual CTC: {formatCurrency(off.ctc || 0)}</p>
                          <p className="text-[10px] text-slate-450 mt-1">Joining Date: {off.joiningDate} • Location: {off.location}</p>
                        </div>
                        <span className={clsx(
                          'px-2 py-0.5 rounded-full text-[9px] font-black border',
                          off.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'
                        )}>
                          {off.status}
                        </span>
                      </div>

                      {/* Approval Workflow steps */}
                      <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-2">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">Approval Workflow Matrix</span>
                        <div className="grid grid-cols-4 gap-2 text-[10px]">
                          <div className="flex items-center gap-1 text-emerald-600"><CheckCircle size={10} /> <span>HR Approval</span></div>
                          <div className="flex items-center gap-1 text-emerald-600"><CheckCircle size={10} /> <span>Dept Head</span></div>
                          <div className="flex items-center gap-1 text-amber-600"><Clock size={10} /> <span>Finance</span></div>
                          <div className="flex items-center gap-1 text-slate-400"><Clock size={10} /> <span>Business Head</span></div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {candidateOffers.length === 0 && (
                    <p className="text-xs text-slate-450 py-4 text-center">No active offer proposals found.</p>
                  )}
                </div>

                {/* Form to release a new job offer */}
                <form onSubmit={handleCreateOfferSubmit} className="border-t border-slate-200 dark:border-slate-800 pt-6 space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Configure Offer Details</h4>
                  
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1.5">
                      <label className="text-[9px] text-slate-400 font-bold uppercase">Template Design</label>
                      <select value={offerTemplate} onChange={e => setOfferTemplate(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500">
                        <option value="Standard Executive Offer">Standard Executive Offer Letter</option>
                        <option value="Director Promotion & Package">Director Package Letter</option>
                        <option value="Contractor Engagement Template">Contractor Engagement Form</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] text-slate-400 font-bold uppercase">Basic Base Pay (CTC Annual)</label>
                      <input type="number" value={offerCtc} onChange={e => setOfferCtc(Number(e.target.value))} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.8 outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white" />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] text-slate-400 font-bold uppercase">Annual Bonus Scheme</label>
                      <input type="number" value={offerBonus} onChange={e => setOfferBonus(Number(e.target.value))} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.8 outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white" />
                    </div>

                    <DatePicker
                      label="Target Joining Date"
                      value={offerJoinDate}
                      onChange={setOfferJoinDate}
                    />

                    <div className="space-y-1.5 col-span-2">
                      <label className="text-[9px] text-slate-400 font-bold uppercase">Joining Office Location</label>
                      <input type="text" value={offerLoc} onChange={e => setOfferLoc(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white" />
                    </div>
                  </div>

                  <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm">
                    Initialize Offer & Send for Approval
                  </button>
                </form>
              </div>
            )}

            {/* DOCUMENTS CHECKLIST PANEL */}
            {activeTab === 'documents' && (
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Candidate Verification Documents Checklist</h4>
                <div className="space-y-2">
                  {Object.entries(verifiedDocs).map(([docName, status]) => (
                    <div key={docName} className="p-3 bg-slate-50/40 dark:bg-slate-900/30 border border-slate-150/60 dark:border-slate-850 rounded-xl flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <FileText size={14} className="text-slate-400" />
                        <span className="font-semibold text-slate-700 dark:text-slate-200">{docName} Document Card</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={clsx(
                          'px-2 py-0.5 rounded text-[9px] font-bold border',
                          status === 'VERIFIED' ? 'bg-emerald-50 text-emerald-600 border-emerald-150' : 'bg-amber-50 text-amber-600 border-amber-150'
                        )}>
                          {status}
                        </span>
                        <button
                          onClick={() => toggleDocVerification(docName)}
                          className="bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-500 text-[10px] font-bold px-2 py-1 border border-slate-200 dark:border-slate-750 rounded-lg"
                        >
                          {status === 'VERIFIED' ? 'Mark Pending' : 'Mark Verified'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* INTERNAL NOTES PANEL */}
            {activeTab === 'notes' && (
              <div className="space-y-5">
                <form onSubmit={handleAddNoteSubmit} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter internal review remarks..."
                    value={newNoteText}
                    onChange={e => setNewNoteText(e.target.value)}
                    required
                    className="flex-1 bg-slate-50 dark:bg-slate-900/60 border border-slate-250 dark:border-slate-800 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                  <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm">
                    Add Note
                  </button>
                </form>

                <div className="space-y-3">
                  {notes?.map((n) => (
                    <div key={n.id} className="p-3.5 bg-slate-50/40 dark:bg-slate-900/30 border border-slate-150/60 dark:border-slate-850 rounded-xl text-xs space-y-1.5">
                      <p className="text-slate-750 dark:text-slate-200 font-medium">{n.noteText}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">June 24, 2026 • Recruiter Console</p>
                    </div>
                  ))}
                  {notes?.length === 0 && (
                    <p className="text-xs text-slate-450 py-4 text-center">No notes recorded yet.</p>
                  )}
                </div>
              </div>
            )}

            {/* ACTIVITY LOG PANEL */}
            {activeTab === 'activity' && (
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Candidate Audit Trail History Log</h4>
                <div className="space-y-3.5 pl-4 border-l-2 border-slate-200 dark:border-slate-800">
                  {activities?.map((act) => (
                    <div key={act.id} className="text-xs">
                      <span className="text-[9px] text-slate-400 font-bold uppercase">{new Date(act.createdAt).toLocaleString()}</span>
                      <p className="font-bold text-slate-750 dark:text-slate-200 mt-0.5">{act.description}</p>
                      {act.oldValue && (
                        <p className="text-[10px] text-slate-400">Shifted Stage: {act.oldValue} → {act.newValue}</p>
                      )}
                    </div>
                  ))}
                  {activities?.length === 0 && (
                    <p className="text-xs text-slate-400 text-center">No audit trail logged yet.</p>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
