import React, { useState, useEffect, useRef } from 'react';
import {
  useGetRequisitionCommentsQuery,
  useAddRequisitionCommentMutation,
  useGetRequisitionAttachmentsQuery,
  useAddRequisitionAttachmentMutation,
  useDeleteRequisitionAttachmentMutation,
  useGetRequisitionActivitiesQuery,
  useGetRequisitionBudgetAnalysisQuery,
  useGetRequisitionApprovalStepsQuery,
  useSubmitRequisitionMutation,
  useApproveRequisitionMutation,
  useRejectRequisitionMutation
} from '../recruitmentApi';
import type { Requisition } from '../recruitmentApi';
import {
  FileText,
  IndianRupee,
  MessageSquare,
  Paperclip,
  Activity,
  CheckCircle,
  Clock,
  User,
  Plus,
  Trash2,
  X,
  AlertCircle,
  HelpCircle,
  Briefcase,
  Loader2,
  ArrowLeft,
  Edit,
  Share2,
  Check,
  Send
} from 'lucide-react';
import { formatCurrency } from '../../../utils/currencyFormatter';
import clsx from 'clsx';

interface RequisitionDetailCockpitProps {
  requisition: Requisition;
  onClose: () => void;
  currentUserId: string;
  onPublishJob?: (req: Requisition) => void;
  refetchReqs: () => void;
  refetchDashboard: () => void;
  showBackButton?: boolean;
}

export function RequisitionDetailCockpit({
  requisition,
  onClose,
  currentUserId,
  onPublishJob,
  refetchReqs,
  refetchDashboard,
  showBackButton = false
}: RequisitionDetailCockpitProps) {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'position' | 'requirements' | 'budget' | 'approvals' | 'activity' | 'comments'>('overview');
  const [newComment, setNewComment] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const commentInputRef = useRef<HTMLInputElement>(null);

  // API Queries & Mutations
  const { data: steps, isLoading: stepsLoading } = useGetRequisitionApprovalStepsQuery(requisition.id);
  const { data: budgetAnalysis, isLoading: budgetLoading } = useGetRequisitionBudgetAnalysisQuery(requisition.id);
  const { data: comments, refetch: refetchComments } = useGetRequisitionCommentsQuery(requisition.id);
  const { data: attachments, refetch: refetchAttachments } = useGetRequisitionAttachmentsQuery(requisition.id);
  const { data: activities, refetch: refetchActivities } = useGetRequisitionActivitiesQuery(requisition.id);

  const [submitReq, { isLoading: submittingReq }] = useSubmitRequisitionMutation();
  const [approveReq, { isLoading: approvingReq }] = useApproveRequisitionMutation();
  const [rejectReq, { isLoading: rejectingReq }] = useRejectRequisitionMutation();
  const [addComment] = useAddRequisitionCommentMutation();
  const [addAttachment] = useAddRequisitionAttachmentMutation();
  const [deleteAttachment] = useDeleteRequisitionAttachmentMutation();

  // Mentions autocomplete list
  const mentionUsers = [
    { username: 'HRManager', label: 'HR Manager (Sarah)' },
    { username: 'Recruiter', label: 'Talent Sourcing Specialist (Robert)' },
    { username: 'FinanceDirector', label: 'Finance Director (David)' },
    { username: 'CEO', label: 'Chief Executive Officer (James)' }
  ];

  const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNewComment(val);
    if (val.endsWith('@')) {
      setShowMentions(true);
    } else if (!val.includes('@') || val.endsWith(' ')) {
      setShowMentions(false);
    }
  };

  const handleSelectMention = (username: string) => {
    setNewComment(prev => {
      const base = prev.substring(0, prev.lastIndexOf('@'));
      return `${base}@${username} `;
    });
    setShowMentions(false);
    commentInputRef.current?.focus();
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await addComment({
        requisitionId: requisition.id,
        commentText: newComment.trim(),
        authorName: 'Current User'
      }).unwrap();
      setNewComment('');
      refetchComments();
      refetchActivities();
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  const handleUploadAttachment = async () => {
    const fileNames = [
      'Position_Justification_Document.pdf',
      'Dept_Hiring_Allocation_FY26.xlsx',
      'Candidate_Profile_Requirements.docx',
      'Budget_Allocation_Approval.pdf'
    ];
    const randomFile = fileNames[Math.floor(Math.random() * fileNames.length)];
    const size = Math.floor(Math.random() * 5000000) + 500000;

    try {
      await addAttachment({
        requisitionId: requisition.id,
        fileName: randomFile,
        fileType: randomFile.split('.').pop() || 'pdf',
        fileUrl: `/files/requisitions/${requisition.id}/${randomFile}`,
        fileSize: size
      }).unwrap();
      refetchAttachments();
      refetchActivities();
    } catch (err) {
      console.error('Failed to upload attachment:', err);
    }
  };

  const handleDeleteAttachment = async (id: string) => {
    try {
      await deleteAttachment(id).unwrap();
      refetchAttachments();
      refetchActivities();
    } catch (err) {
      console.error('Failed to delete attachment:', err);
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-[#06080F] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col h-full overflow-hidden text-xs">
      
      {/* ── HEADER CARD ── */}
      <div className="bg-white dark:bg-[#0B0F19] border-b border-slate-200 dark:border-slate-800 p-6 sticky top-0 z-10 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {showBackButton && (
              <button
                onClick={onClose}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition"
              >
                <ArrowLeft size={16} />
              </button>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">{requisition.reqNumber}</span>
                <span className={clsx(
                  'px-2 py-0.5 rounded-full text-[9px] font-black uppercase border',
                  requisition.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-250 dark:bg-emerald-950/20 dark:text-emerald-450 dark:border-emerald-900/30' :
                  requisition.status === 'PENDING_APPROVAL' ? 'bg-amber-50 text-amber-600 border-amber-250 dark:bg-amber-950/20 dark:text-amber-450 dark:border-amber-900/30' :
                  requisition.status === 'REJECTED' ? 'bg-rose-50 text-rose-600 border-rose-250 dark:bg-rose-950/20 dark:text-rose-450 dark:border-rose-900/30' :
                  'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800'
                )}>
                  {requisition.status?.replace('_', ' ')}
                </span>
                <span className={clsx(
                  'px-2 py-0.5 rounded-full text-[9px] font-black uppercase border',
                  requisition.priority === 'HIGH' ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30' :
                  requisition.priority === 'MEDIUM' ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30' :
                  'bg-slate-50 text-slate-655 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800'
                )}>
                  {requisition.priority} Priority
                </span>
              </div>
              <h2 className="text-lg font-black text-slate-800 dark:text-white mt-1.5 leading-snug">{requisition.title}</h2>
              <div className="flex items-center gap-1.5 mt-1 text-[11px] font-bold text-slate-400">
                <span>{requisition.department}</span>
                <span>•</span>
                <span>Budget: {formatCurrency(requisition.budget ?? 0)}</span>
              </div>
            </div>
          </div>
          {!showBackButton && (
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 transition">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Action Buttons Group */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-850">
          {requisition.status === 'DRAFT' && (
            <button
              disabled={submittingReq}
              onClick={async () => {
                await submitReq(requisition.id).unwrap();
                refetchReqs();
                refetchDashboard();
              }}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-[11px] font-bold py-2 px-4 rounded-xl shadow-sm transition flex items-center gap-1.5"
            >
              {submittingReq ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
              Submit for Approval
            </button>
          )}
          {requisition.status === 'PENDING_APPROVAL' && (
            <>
              <button
                disabled={approvingReq}
                onClick={async () => {
                  await approveReq({ id: requisition.id, approverId: currentUserId, comments: 'Approved requisition' }).unwrap();
                  refetchReqs();
                  refetchDashboard();
                }}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-[11px] font-bold py-2 px-4 rounded-xl shadow-sm transition flex items-center gap-1.5"
              >
                {approvingReq ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                Approve
              </button>
              <button
                disabled={rejectingReq}
                onClick={async () => {
                  await rejectReq({ id: requisition.id, approverId: currentUserId, comments: 'Rejected requisition' }).unwrap();
                  refetchReqs();
                  refetchDashboard();
                }}
                className="bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-[11px] font-bold py-2 px-4 rounded-xl shadow-sm transition flex items-center gap-1.5"
              >
                {rejectingReq ? <Loader2 size={13} className="animate-spin" /> : <X size={13} />}
                Reject
              </button>
            </>
          )}
          {requisition.status === 'APPROVED' && onPublishJob && (
            <button
              onClick={() => onPublishJob(requisition)}
              className="bg-indigo-650 hover:bg-indigo-750 text-white text-[11px] font-bold py-2 px-4 rounded-xl shadow-sm transition flex items-center gap-1.5"
            >
              <Briefcase size={13} />
              Publish Job
            </button>
          )}
          <button className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-bold py-2 px-3.5 rounded-xl transition flex items-center gap-1.5">
            <Edit size={13} />
            Edit
          </button>
          <button className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-bold py-2 px-3.5 rounded-xl transition flex items-center gap-1.5">
            <Share2 size={13} />
            Share
          </button>
        </div>
      </div>

      {/* ── DETAILED TABS NAVIGATION ── */}
      <div className="bg-white dark:bg-[#0B0F19] px-6 border-b border-slate-200 dark:border-slate-800 overflow-x-auto flex gap-6 scrollbar-none">
        {[
          { id: 'overview', name: 'Overview' },
          { id: 'position', name: 'Position Details' },
          { id: 'requirements', name: 'Candidate Requirements' },
          { id: 'budget', name: 'Budget & Justification' },
          { id: 'approvals', name: 'Approvals' },
          { id: 'activity', name: 'Activity Timeline' },
          { id: 'comments', name: 'Comments & Discussions' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={clsx(
              "pb-3.5 pt-1 text-[11px] font-bold border-b-2 transition-all uppercase tracking-wider shrink-0",
              activeSubTab === tab.id
                ? "border-indigo-600 text-indigo-650 dark:text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            )}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* ── DETAIL PANELS CONTAINER ── */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* ── OVERVIEW TAB ── */}
        {activeSubTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
            {/* Position Information Card */}
            <div className="bg-white dark:bg-[#0B0F19] p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm space-y-4">
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-slate-850 flex items-center gap-2">
                <Briefcase size={14} className="text-indigo-500" /> Position Information
              </h3>
              <div className="grid grid-cols-1 gap-3.5">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Department</span>
                  <p className="font-extrabold text-slate-700 dark:text-slate-200 mt-0.5">{requisition.department || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Designation</span>
                  <p className="font-extrabold text-slate-700 dark:text-slate-200 mt-0.5">{requisition.designation || requisition.title}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Grade</span>
                    <p className="font-extrabold text-slate-700 dark:text-slate-200 mt-0.5">{requisition.grade || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Band</span>
                    <p className="font-extrabold text-slate-700 dark:text-slate-200 mt-0.5">{requisition.band || 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Employment Type</span>
                  <p className="font-extrabold text-slate-700 dark:text-slate-200 mt-0.5">{requisition.employmentType?.replace('_', ' ') || 'FULL TIME'}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Vacancies</span>
                    <p className="font-extrabold text-slate-700 dark:text-slate-200 mt-0.5">{requisition.vacancies} Open</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Work Model</span>
                    <p className="font-extrabold text-slate-700 dark:text-slate-200 mt-0.5">{requisition.workMode || 'OFFICE'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Candidate Requirements Card */}
            <div className="bg-white dark:bg-[#0B0F19] p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm space-y-4">
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-slate-850 flex items-center gap-2">
                <User size={14} className="text-indigo-500" /> Candidate Requirements
              </h3>
              <div className="grid grid-cols-1 gap-3.5">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Experience Level</span>
                  <p className="font-extrabold text-slate-700 dark:text-slate-200 mt-0.5">
                    {requisition.minExperience !== undefined && requisition.maxExperience !== undefined
                      ? `${requisition.minExperience} - ${requisition.maxExperience} Years`
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Education Qualification</span>
                  <p className="font-extrabold text-slate-700 dark:text-slate-200 mt-0.5">{requisition.education || 'Graduate Degree'}</p>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase mb-1.5 block">Required Technical Skills</span>
                  <div className="flex flex-wrap gap-1">
                    {requisition.requiredSkills
                      ? requisition.requiredSkills.split(',').map((s) => (
                          <span key={s} className="px-2 py-0.5 bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 border border-indigo-500/25 rounded-md font-bold text-[9px]">
                            {s.trim()}
                          </span>
                        ))
                      : <span className="text-slate-400 italic">None registered</span>}
                  </div>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Certifications</span>
                  <p className="font-extrabold text-slate-700 dark:text-slate-200 mt-0.5">{requisition.certifications || 'No specific certifications required'}</p>
                </div>
              </div>
            </div>

            {/* Business Information Card */}
            <div className="bg-white dark:bg-[#0B0F19] p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm space-y-4">
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-slate-850 flex items-center gap-2">
                <IndianRupee size={14} className="text-indigo-500" /> Business Information
              </h3>
              <div className="grid grid-cols-1 gap-3.5">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Target Budget Allocation</span>
                  <p className="font-extrabold text-slate-850 dark:text-slate-100 text-sm mt-0.5">{formatCurrency(requisition.budget ?? 0)}</p>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Reason for Hiring</span>
                  <p className="font-extrabold text-slate-700 dark:text-slate-200 mt-0.5">{requisition.hiringReason?.replace('_', ' ') || 'NEW POSITION'}</p>
                </div>
                {requisition.replacementEmployee && (
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Replacement Employee</span>
                    <p className="font-extrabold text-slate-700 dark:text-slate-200 mt-0.5">{requisition.replacementEmployee} ({requisition.replacementEmployeeId || 'N/A'})</p>
                  </div>
                )}
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Target Joining Date</span>
                  <p className="font-extrabold text-slate-700 dark:text-slate-200 mt-0.5">{requisition.expectedJoiningDate || 'Immediate Joining'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── POSITION DETAILS TAB ── */}
        {activeSubTab === 'position' && (
          <div className="bg-white dark:bg-[#0B0F19] p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm space-y-6 animate-fade-in">
            <h3 className="text-sm font-black text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-850">Comprehensive Position Specifications</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase">Designation Code</span>
                <p className="font-extrabold text-slate-700 dark:text-slate-250 mt-1">{requisition.designation || 'N/A'}</p>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase">Location / Site</span>
                <p className="font-extrabold text-slate-700 dark:text-slate-250 mt-1">{requisition.location || 'Remote / Office HQ'}</p>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase">Reporting Manager</span>
                <p className="font-extrabold text-slate-700 dark:text-slate-250 mt-1">{requisition.reportingManager || 'Not specified'}</p>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase">Project / Cost Allocation Center</span>
                <p className="font-extrabold text-slate-700 dark:text-slate-250 mt-1">{requisition.projectName || 'General Platform Operations'}</p>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase">Employment Duration</span>
                <p className="font-extrabold text-slate-700 dark:text-slate-250 mt-1">{requisition.employmentType?.replace('_', ' ') || 'Permanent Full-time'}</p>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase">Grade Level Mapping</span>
                <p className="font-extrabold text-slate-700 dark:text-slate-250 mt-1">{requisition.grade || 'N/A'}</p>
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-850 pt-5 space-y-2">
              <span className="text-[9px] font-bold text-slate-400 uppercase">Business Justification Statement</span>
              <p className="text-slate-655 dark:text-slate-350 leading-relaxed font-semibold">{requisition.businessJustification || 'No justification statement registered for this requisition.'}</p>
            </div>
            
            {requisition.additionalNotes && (
              <div className="border-t border-slate-100 dark:border-slate-850 pt-5 space-y-2">
                <span className="text-[9px] font-bold text-slate-400 uppercase">Additional / Operational Notes</span>
                <p className="text-slate-655 dark:text-slate-350 leading-relaxed font-semibold">{requisition.additionalNotes}</p>
              </div>
            )}
          </div>
        )}

        {/* ── CANDIDATE REQUIREMENTS TAB ── */}
        {activeSubTab === 'requirements' && (
          <div className="bg-white dark:bg-[#0B0F19] p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm space-y-6 animate-fade-in">
            <h3 className="text-sm font-black text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-850">Mandatory Talent Competencies</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Required Technical Skill Tags</span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {requisition.requiredSkills
                      ? requisition.requiredSkills.split(',').map((s) => (
                          <span key={s} className="px-2.5 py-1 bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 border border-indigo-500/20 rounded-xl font-bold text-[10px]">
                            {s.trim()}
                          </span>
                        ))
                      : <span className="text-slate-400 italic">No skills registered</span>}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Preferred / Bonus Skillset</span>
                  <p className="font-extrabold text-slate-700 dark:text-slate-250 mt-1">{requisition.preferredSkills || 'No preferred skills listed'}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Minimum Required Education</span>
                  <p className="font-extrabold text-slate-700 dark:text-slate-250 mt-1">{requisition.education || 'Graduate level degree'}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Required Professional Certifications</span>
                  <p className="font-extrabold text-slate-700 dark:text-slate-250 mt-1">{requisition.certifications || 'None required'}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Languages Required</span>
                  <p className="font-extrabold text-slate-700 dark:text-slate-250 mt-1">{requisition.languages || 'English (Fluent)'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── BUDGET & JUSTIFICATION TAB ── */}
        {activeSubTab === 'budget' && (
          <div className="space-y-6 animate-fade-in">
            {budgetLoading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>
            ) : !budgetAnalysis ? (
              <div className="bg-white dark:bg-[#0B0F19] p-6 rounded-2xl border text-center text-slate-400 font-bold">No budget statistics registered.</div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Consumed budget card */}
                <div className="lg:col-span-2 bg-white dark:bg-[#0B0F19] p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm space-y-4">
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-slate-850">Cost Center Analysis</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-655">
                      <span>Consumed Budget: {formatCurrency(budgetAnalysis.budgetConsumed || 0)}</span>
                      <span>Total Allocation: {formatCurrency((budgetAnalysis.budgetConsumed || 0) + (budgetAnalysis.budgetAvailable || 0))}</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden flex shadow-inner">
                      <div
                        className="bg-indigo-500 h-full transition-all duration-500"
                        style={{ width: `${(budgetAnalysis.budgetConsumed / ((budgetAnalysis.budgetConsumed || 0) + (budgetAnalysis.budgetAvailable || 0))) * 100}%` }}
                      />
                      <div className="bg-emerald-500 h-full flex-1" />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold">
                      <span>{( (budgetAnalysis.budgetConsumed / ((budgetAnalysis.budgetConsumed || 0) + (budgetAnalysis.budgetAvailable || 0))) * 100 ).toFixed(1)}% Consumed</span>
                      <span>Remaining: {formatCurrency(budgetAnalysis.budgetAvailable || 0)}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-850 grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Requested Requisition Budget</span>
                      <p className="text-lg font-black text-slate-800 dark:text-white mt-1">{formatCurrency(requisition.budget ?? 0)}</p>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Cost Center Code</span>
                      <p className="text-lg font-black text-slate-800 dark:text-white mt-1">{requisition.costCenter || 'CC-ENGINEERING'}</p>
                    </div>
                  </div>
                </div>

                {/* Justification KPIs */}
                <div className="bg-white dark:bg-[#0B0F19] p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm space-y-4">
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-slate-850">Business Impact KPIs</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Expected Revenue Impact</span>
                      <p className="font-extrabold text-slate-700 dark:text-slate-250 mt-1">{requisition.revenueImpact || 'Product velocity acceleration and support SLA coverage.'}</p>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Risk If Position Not Filled</span>
                      <p className="font-extrabold text-slate-700 dark:text-slate-250 mt-1">{requisition.riskNotFilled || 'Missed deployment deadlines and customer renewals delayed.'}</p>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Business Justification Summary</span>
                      <p className="font-extrabold text-slate-700 dark:text-slate-250 mt-1 truncate">{requisition.businessJustification || 'None registered'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── APPROVALS TAB ── */}
        {activeSubTab === 'approvals' && (
          <div className="bg-white dark:bg-[#0B0F19] p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm space-y-6 animate-fade-in">
            <h3 className="text-sm font-black text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-850">Requisition Approval Board</h3>
            
            {stepsLoading ? (
              <div className="flex items-center justify-center py-6"><Loader2 className="w-5 h-5 text-indigo-500 animate-spin" /></div>
            ) : !steps || steps.length === 0 ? (
              <div className="text-center py-6 text-slate-400 font-medium">No approval configuration details present.</div>
            ) : (
              <div className="flex flex-col md:flex-row items-stretch gap-4 justify-between pt-2">
                {steps.map((step: any, idx: number) => {
                  const isApproved = step.status === 'APPROVED';
                  const isRejected = step.status === 'REJECTED';
                  const isPending = step.status === 'PENDING';
                  return (
                    <div key={step.id || idx} className="flex-1 bg-slate-50 dark:bg-slate-900/40 p-4 border border-slate-200/60 dark:border-slate-800 rounded-xl space-y-3 relative">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-black text-slate-400">STEP {idx + 1}</span>
                        <span className={clsx(
                          'px-2 py-0.5 rounded text-[8px] font-black uppercase border',
                          isApproved ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-450 dark:border-emerald-900/30' :
                          isRejected ? 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/20 dark:text-rose-450 dark:border-rose-900/30' :
                          isPending ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/20 dark:text-amber-450 dark:border-amber-900/30 animate-pulse' :
                          'bg-slate-50 text-slate-400 border-slate-100'
                        )}>
                          {step.status}
                        </span>
                      </div>
                      
                      <div>
                        <h4 className="font-extrabold text-slate-800 dark:text-white text-xs">{step.stepName}</h4>
                        <p className="text-[10px] text-slate-400 font-bold mt-1">Approver: {step.approverName || 'Department Head'}</p>
                      </div>

                      {step.comments && (
                        <div className="p-2 bg-white dark:bg-[#0B0F19] rounded-lg text-[9px] text-slate-500 italic border border-slate-100 dark:border-slate-800">
                          "{step.comments}"
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── ACTIVITY TIMELINE TAB ── */}
        {activeSubTab === 'activity' && (
          <div className="bg-white dark:bg-[#0B0F19] p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm space-y-6 animate-fade-in">
            <h3 className="text-sm font-black text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-850">History & Audit Trail</h3>
            
            <div className="relative pl-6 space-y-6 border-l border-slate-200 dark:border-slate-800 ml-4 mt-2">
              {/* Fallback visual logs if empty */}
              <div className="relative">
                <span className="absolute -left-[32px] top-0.5 w-4 h-4 rounded-full bg-emerald-500 border border-white dark:border-[#0B0F19] flex items-center justify-center text-white text-[9px] font-bold">✓</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-slate-800 dark:text-slate-200">Requisition Created</h4>
                    <span className="text-[9px] text-slate-400 font-bold">2 hours ago</span>
                  </div>
                  <p className="text-slate-450 dark:text-slate-400 mt-1 font-semibold">Initiated by Robert (Talent Sourcing Specialist)</p>
                </div>
              </div>

              <div className="relative">
                <span className="absolute -left-[32px] top-0.5 w-4 h-4 rounded-full bg-indigo-500 border border-white dark:border-[#0B0F19] flex items-center justify-center text-white text-[9px] font-bold">→</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-slate-800 dark:text-slate-200">Submitted for Approval</h4>
                    <span className="text-[9px] text-slate-400 font-bold">1 hour ago</span>
                  </div>
                  <p className="text-slate-450 dark:text-slate-400 mt-1 font-semibold">Forwarded to Sarah (HR Manager)</p>
                </div>
              </div>

              {requisition.status === 'APPROVED' && (
                <>
                  <div className="relative">
                    <span className="absolute -left-[32px] top-0.5 w-4 h-4 rounded-full bg-emerald-500 border border-white dark:border-[#0B0F19] flex items-center justify-center text-white text-[9px] font-bold">✓</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-slate-800 dark:text-slate-200">Approved by HR Manager</h4>
                        <span className="text-[9px] text-slate-400 font-bold">45 minutes ago</span>
                      </div>
                      <p className="text-slate-455 dark:text-slate-400 mt-1 font-semibold">Comments: "Requisition matches budget parameters for Q3"</p>
                    </div>
                  </div>

                  <div className="relative">
                    <span className="absolute -left-[32px] top-0.5 w-4 h-4 rounded-full bg-blue-500 border border-white dark:border-[#0B0F19] flex items-center justify-center text-white text-[9px] font-bold">★</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-slate-800 dark:text-slate-200">Job Posting Published</h4>
                        <span className="text-[9px] text-slate-400 font-bold">10 minutes ago</span>
                      </div>
                      <p className="text-slate-455 dark:text-slate-400 mt-1 font-semibold">Published on LinkedIn Talent Hub and Career Portal</p>
                    </div>
                  </div>
                </>
              )}

              {activities && activities.map((act: any, idx: number) => (
                <div key={act.id || idx} className="relative">
                  <span className="absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full bg-slate-400 border border-white dark:border-[#0B0F19]" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-slate-800 dark:text-slate-200">{act.activityType}</h4>
                      <span className="text-[9px] text-slate-400 font-bold">{new Date(act.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 mt-0.5 font-semibold">{act.description}</p>
                    <span className="text-[9px] text-slate-400 font-bold block mt-0.5">By: {act.createdBy || 'System'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── COMMENTS & DISCUSSIONS TAB ── */}
        {activeSubTab === 'comments' && (
          <div className="bg-white dark:bg-[#0B0F19] p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm space-y-6 animate-fade-in flex flex-col h-full">
            <h3 className="text-sm font-black text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-850">Threaded Discussions</h3>
            
            {/* Input comment box */}
            <div className="relative">
              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  ref={commentInputRef}
                  type="text"
                  value={newComment}
                  onChange={handleCommentChange}
                  className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white flex-1"
                  placeholder="Post an update or comment... Use '@' to mention team members"
                />
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2 text-xs font-bold transition flex items-center gap-1.5 shadow-sm">
                  <Send size={12} /> Post
                </button>
              </form>

              {/* Mentions Dropdown */}
              {showMentions && (
                <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 max-h-32 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-850">
                  {mentionUsers.map((user) => (
                    <button
                      key={user.username}
                      type="button"
                      onClick={() => handleSelectMention(user.username)}
                      className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center justify-between"
                    >
                      <span className="font-bold text-indigo-650 dark:text-indigo-400">@{user.username}</span>
                      <span className="text-[10px] text-slate-400">{user.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* List of comments */}
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
              {!comments || comments.length === 0 ? (
                <p className="text-slate-400 text-center py-6 font-bold italic">No posts in discussion feed yet.</p>
              ) : (
                comments.map((comment: any) => (
                  <div key={comment.id} className="p-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-150 dark:border-slate-850 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between text-[9px] text-slate-400 font-bold">
                      <span className="text-indigo-650 dark:text-indigo-400">{comment.authorName}</span>
                      <span>{new Date(comment.createdAt).toLocaleDateString()} {new Date(comment.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-slate-750 dark:text-slate-200 font-semibold leading-relaxed">{comment.commentText}</p>
                  </div>
                ))
              )}
            </div>

            {/* Attachments Section */}
            <div className="border-t border-slate-100 dark:border-slate-850 pt-5 space-y-3.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Attachments & Files</h4>
                <button
                  type="button"
                  onClick={handleUploadAttachment}
                  className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-800 text-[10px] font-bold py-1.5 px-3 rounded-lg transition"
                >
                  <Plus size={11} /> Add File
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[140px] overflow-y-auto">
                {!attachments || attachments.length === 0 ? (
                  <p className="text-slate-450 text-center py-3 font-semibold col-span-2">No files uploaded.</p>
                ) : (
                  attachments.map((file: any) => (
                    <div key={file.id} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2 truncate">
                        <Paperclip size={12} className="text-slate-400 flex-shrink-0" />
                        <span className="font-extrabold text-slate-700 dark:text-slate-300 truncate">{file.fileName}</span>
                        <span className="text-[9px] text-slate-400 font-bold shrink-0">({(file.fileSize / 1024).toFixed(0)} KB)</span>
                      </div>
                      <button
                        onClick={() => handleDeleteAttachment(file.id)}
                        className="text-rose-500 hover:bg-rose-50 p-1.5 rounded transition"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
