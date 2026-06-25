import React, { useState } from 'react';
import { type Interview, useSubmitInterviewFeedbackMutation, useScheduleInterviewMutation } from '../recruitmentApi';
import { Calendar, User, Star, CheckSquare, MessageSquare, ShieldAlert, Award, FileText, Clock, AlertTriangle, Plus, X, Video, MapPin, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';

interface InterviewWorkspaceProps {
  interviews: Interview[] | undefined;
  refetchInterviews: () => void;
  onScheduleNew: () => void;
}

export function InterviewWorkspace({
  interviews = [],
  refetchInterviews,
  onScheduleNew
}: InterviewWorkspaceProps) {
  const [selectedIntId, setSelectedIntId] = useState<string | null>(null);
  const [submitFeedback] = useSubmitInterviewFeedbackMutation();
  const [scheduleInterview] = useScheduleInterviewMutation();

  // Create Interview Form State
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [candId, setCandId] = useState('');
  const [intType, setIntType] = useState('TECHNICAL');
  const [intRound, setIntRound] = useState('Round 1: Initial Technical');
  const [panelMembers, setPanelMembers] = useState('');
  const [intLocation, setIntLocation] = useState('Zoom Video Meeting');
  const [meetingLink, setMeetingLink] = useState('https://zoom.us/j/100200300');
  const [scheduledTime, setScheduledTime] = useState('');
  const [evalFormSelected, setEvalFormSelected] = useState('Core Engineering Form');

  // Scorecard ratings state
  const [techRating, setTechRating] = useState(4);
  const [commRating, setCommRating] = useState(4);
  const [problemRating, setProblemRating] = useState(4);
  const [cultureRating, setCultureRating] = useState(4);
  const [leadershipRating, setLeadershipRating] = useState(4);
  const [recommendation, setRecommendation] = useState('RECOMMEND_HIRE');
  const [comments, setComments] = useState('');

  const selectedInt = interviews.find(i => i.id === selectedIntId);

  // Compute metrics
  const totalScheduled = interviews.filter(i => i.status === 'SCHEDULED').length;
  const totalCompleted = interviews.filter(i => i.status === 'COMPLETED').length;
  const pendingFeedback = interviews.filter(i => i.status === 'SCHEDULED' && !i.feedbackScorecard).length;
  const totalCancelled = interviews.filter(i => i.status === 'CANCELLED').length;
  const upcomingToday = interviews.filter(i => {
    if (!i.scheduledTime) return false;
    const todayStr = new Date().toISOString().split('T')[0];
    return i.scheduledTime.includes(todayStr);
  }).length;

  const handleCreateInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduledTime) return;
    try {
      await scheduleInterview({
        candidate: { id: candId || '00000000-0000-0000-0000-000000000001' } as any,
        interviewType: intType,
        scheduledTime: scheduledTime,
        interviewerIds: panelMembers || 'Sarah Jenkins (Engineering), Marcus Chen (Lead Dev)',
        status: 'SCHEDULED'
      }).unwrap();
      refetchInterviews();
      setShowScheduleForm(false);
      alert('New interview round scheduled successfully.');
    } catch (err) {
      console.error('Failed to schedule interview:', err);
    }
  };

  const handleSubmitScorecard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIntId) return;

    const payload = {
      interviewerId: '00000000-0000-0000-0000-000000000003', // Admin ID
      rating: Math.round((techRating + commRating + problemRating + cultureRating + leadershipRating) / 5),
      comments: comments,
      technicalRating: techRating,
      communicationRating: commRating,
      problemSolvingRating: problemRating,
      cultureFitRating: cultureRating,
      overallRecommendation: recommendation,
      feedbackNotes: `Scorecard Feedback: Tech (${techRating}), Comm (${commRating}), Problem (${problemRating}), Culture (${cultureRating}), Leadership (${leadershipRating})`
    };

    try {
      await submitFeedback({ id: selectedIntId, feedback: payload }).unwrap();
      refetchInterviews();
      setSelectedIntId(null);
      setComments('');
      alert('Scorecard submitted. Candidate profile updated.');
    } catch (err) {
      console.error('Failed to submit scorecard:', err);
    }
  };

  const renderRatingStars = (label: string, value: number, onChange: (val: number) => void) => {
    return (
      <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
        <span className="text-xs font-bold text-slate-655 dark:text-slate-350">{label}</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              className={clsx(
                'p-0.5 rounded transition',
                star <= value ? 'text-amber-500' : 'text-slate-300 dark:text-slate-700'
              )}
            >
              <Star size={15} fill={star <= value ? 'currentColor' : 'none'} />
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* ── INTERVIEW DASHBOARD METRICS (Phase 3) ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Scheduled', val: totalScheduled, color: 'text-blue-600 bg-blue-500/10' },
          { label: 'Completed', val: totalCompleted, color: 'text-emerald-600 bg-emerald-500/10' },
          { label: 'Pending Feedback', val: pendingFeedback, color: 'text-amber-600 bg-amber-500/10' },
          { label: 'Cancelled', val: totalCancelled, color: 'text-rose-600 bg-rose-500/10' },
          { label: 'Upcoming Today', val: upcomingToday, color: 'text-purple-600 bg-purple-500/10' }
        ].map((met, i) => (
          <div key={i} className="p-4 bg-white dark:bg-[#0B0F19] rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">{met.label}</span>
            <div className="flex items-center gap-2 mt-2">
              <span className={clsx('w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black', met.color)}>
                #
              </span>
              <span className="text-lg font-black">{met.val}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left List Pane (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Scheduled Rounds</h3>
            <button
              onClick={() => setShowScheduleForm(true)}
              className="text-[10px] bg-indigo-50 hover:bg-indigo-150 text-indigo-650 font-bold py-1.5 px-3 rounded-lg border border-indigo-150/40 flex items-center gap-1"
            >
              <Plus size={12} /> Schedule New
            </button>
          </div>

          {/* Schedule Form Overlay / Embedded */}
          {showScheduleForm && (
            <form onSubmit={handleCreateInterview} className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-950/60 space-y-3.5 text-xs">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-extrabold text-indigo-650 dark:text-indigo-400 text-xs">Schedule Interview Wizard</span>
                <button type="button" onClick={() => setShowScheduleForm(false)} className="text-slate-450 hover:text-slate-650"><X size={14} /></button>
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Interview Type</label>
                    <select value={intType} onChange={e => setIntType(e.target.value)} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-xs">
                      <option value="SCREENING">Screening Call</option>
                      <option value="TECHNICAL">Technical Round</option>
                      <option value="SYSTEM_DESIGN">System Design</option>
                      <option value="CULTURE_FIT">Culture Alignment</option>
                      <option value="HR_ROUND">HR Evaluation</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Interview Round</label>
                    <input type="text" value={intRound} onChange={e => setIntRound(e.target.value)} required className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-800 dark:text-white" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Meeting Link</label>
                    <input type="text" value={meetingLink} onChange={e => setMeetingLink(e.target.value)} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-800 dark:text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Date & Time</label>
                    <input type="datetime-local" value={scheduledTime} onChange={e => setScheduledTime(e.target.value)} required className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-0.5 text-xs text-slate-800 dark:text-white" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Panel Members</label>
                  <input type="text" value={panelMembers} onChange={e => setPanelMembers(e.target.value)} placeholder="Sarah Jenkins (Engineering), Marcus Chen (Lead Dev)" className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-800 dark:text-white" />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Location / Mode</label>
                    <input type="text" value={intLocation} onChange={e => setIntLocation(e.target.value)} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-800 dark:text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Evaluation Form</label>
                    <select value={evalFormSelected} onChange={e => setEvalFormSelected(e.target.value)} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-xs">
                      <option value="Core Engineering Form">Core Engineering Form</option>
                      <option value="Leadership Attributes">Leadership Attributes Form</option>
                      <option value="General Screening Form">General Screening Form</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-2 rounded-lg">Schedule</button>
                <button type="button" onClick={() => setShowScheduleForm(false)} className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 rounded-lg font-bold">Cancel</button>
              </div>
            </form>
          )}

          <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
            {interviews.map((int) => {
              const isSelected = int.id === selectedIntId;
              return (
                <div
                  key={int.id}
                  onClick={() => setSelectedIntId(int.id)}
                  className={clsx(
                    'p-4 rounded-2xl border transition-all cursor-pointer space-y-3',
                    isSelected
                      ? 'bg-indigo-50/10 border-indigo-500 shadow-md'
                      : 'bg-white dark:bg-[#0B0F19] border-slate-200/60 dark:border-slate-800/80 hover:border-slate-300'
                  )}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-black text-slate-800 dark:text-slate-200">{int.candidate?.fullName}</h4>
                      <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold mt-0.5">{int.interviewType}</p>
                    </div>
                    <span className={clsx(
                      'px-2 py-0.5 rounded-full text-[9px] font-extrabold border',
                      int.status === 'SCHEDULED' ? 'bg-blue-50 text-blue-600 border-blue-150' : 'bg-emerald-50 text-emerald-600 border-emerald-150'
                    )}>
                      {int.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold pt-1.5 border-t border-slate-100 dark:border-slate-850">
                    <span className="flex items-center gap-1"><Calendar size={12} /> {int.scheduledTime}</span>
                    <span className="flex items-center gap-1"><User size={12} /> Panelists: {int.interviewerIds || 'Acme HR'}</span>
                  </div>
                </div>
              );
            })}

            {interviews.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-xs bg-white dark:bg-[#0B0F19] rounded-2xl border border-slate-200/60 dark:border-slate-800/80 p-5">
                No interviews scheduled.
              </div>
            )}
          </div>
        </div>

        {/* Right Details & Scorecard Pane (7 cols) */}
        <div className="lg:col-span-7">
          {selectedInt ? (
            <div className="bg-white dark:bg-[#0B0F19] rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm p-6 space-y-6">
              <div>
                <span className="text-[10px] bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded text-slate-455 font-bold uppercase tracking-wider">Evaluation Cockpit</span>
                <h3 className="text-sm font-extrabold mt-2 text-indigo-650 dark:text-indigo-400">{selectedInt.candidate?.fullName}</h3>
                <p className="text-xs text-slate-455">Round details and structured review scorecard feedback.</p>
              </div>

              {selectedInt.status === 'COMPLETED' ? (
                <div className="p-4 bg-emerald-50/40 dark:bg-emerald-950/10 rounded-xl border border-emerald-150/40 flex items-start gap-2.5">
                  <CheckSquare className="w-5 h-5 text-emerald-600 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300">Feedback Scorecard Submitted</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Evaluation for this candidate has already been completed and stored in the database registry.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitScorecard} className="space-y-4">
                  <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 space-y-2">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Technical Skills & Attributes</h4>
                    {renderRatingStars('Technical Coding / Logic', techRating, setTechRating)}
                    {renderRatingStars('Communication & Presentation', commRating, setCommRating)}
                    {renderRatingStars('System Design / Problem Solving', problemRating, setProblemRating)}
                    {renderRatingStars('Culture Fit & Value System', cultureRating, setCultureRating)}
                    {renderRatingStars('Leadership Potential', leadershipRating, setLeadershipRating)}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5 col-span-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Overall Recommendation</label>
                      <select
                        value={recommendation}
                        onChange={e => setRecommendation(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="STRONG_HIRE">Strong Hire</option>
                        <option value="RECOMMEND_HIRE">Recommend Hire</option>
                        <option value="HOLD">Hold / Waitlist</option>
                        <option value="REJECT">Reject</option>
                      </select>
                    </div>

                    <div className="space-y-1.5 col-span-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Evaluation Comments</label>
                      <textarea
                        value={comments}
                        onChange={e => setComments(e.target.value)}
                        required
                        placeholder="Write evaluation details, strengths, weak areas, and score explanation..."
                        rows={3}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-650 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-2.5 rounded-xl shadow-sm transition"
                  >
                    Submit Scorecard Evaluation
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-[#0B0F19] rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm p-8 text-center text-slate-400 font-medium">
              Select a scheduled interview from the left panel to open the Interview Workspace.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
