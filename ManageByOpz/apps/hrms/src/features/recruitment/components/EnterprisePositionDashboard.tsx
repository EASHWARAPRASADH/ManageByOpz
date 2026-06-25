import React, { useState } from 'react';
import type { Requisition, Candidate, JobPosting } from '../recruitmentApi';
import { 
  Filter, 
  Users, 
  IndianRupee, 
  TrendingUp, 
  CheckCircle, 
  HelpCircle, 
  Briefcase, 
  Plus, 
  Clock, 
  Layers, 
  Snowflake, 
  Info, 
  MapPin, 
  User, 
  Building2, 
  Activity, 
  FileText,
  Workflow,
  X
} from 'lucide-react';
import { formatCurrency } from '../../../utils/currencyFormatter';
import clsx from 'clsx';

interface EnterprisePositionDashboardProps {
  requisitions: Requisition[] | undefined;
  candidates: Candidate[] | undefined;
  postings: JobPosting[] | undefined;
  onPublishJob: (req: Requisition) => void;
  onViewCandidates: (title: string) => void;
}

export function EnterprisePositionDashboard({
  requisitions = [],
  candidates = [],
  postings = [],
  onPublishJob,
  onViewCandidates
}: EnterprisePositionDashboardProps) {
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedPosition, setSelectedPosition] = useState<Requisition | null>(null);
  const [drawerTab, setDrawerTab] = useState<'overview' | 'headcount' | 'budget' | 'recruitment' | 'approvals' | 'activity' | 'documents'>('overview');

  // Filter approved positions
  const approvedReqs = requisitions.filter(r => 
    ['APPROVED', 'HIRING', 'PUBLISHED', 'FILLED', 'FROZEN', 'CLOSED'].includes(r.status.toUpperCase())
  );

  // Compute metrics
  const totalPositions = approvedReqs.reduce((acc, curr) => acc + (curr.vacancies || 1), 0);
  const approvedPositionsCount = approvedReqs.length;
  
  // Filled: Candidates accepted or joined
  const filledCandidates = candidates.filter(c => ['ACCEPTED', 'JOINED'].includes(c.status.toUpperCase()));
  const filledCount = filledCandidates.length;
  const vacantCount = Math.max(0, totalPositions - filledCount);
  
  // Hiring in progress
  const hiringInProgressCount = approvedReqs.filter(r => ['HIRING', 'PUBLISHED'].includes(r.status.toUpperCase())).length;
  
  // Frozen positions
  const frozenCount = approvedReqs.filter(r => r.status.toUpperCase() === 'FROZEN').length;
  
  // Budget calculations
  const totalBudget = approvedReqs.reduce((acc, curr) => acc + (curr.budget || 0), 0);

  // Filter positions
  const filteredReqs = approvedReqs.filter(r => {
    const deptMatch = selectedDept === 'ALL' || r.department.toLowerCase() === selectedDept.toLowerCase();
    const statusMatch = selectedStatus === 'ALL' || r.status.toUpperCase() === selectedStatus.toUpperCase();
    return deptMatch && statusMatch;
  });

  const uniqueDepartments = ['ALL', ...Array.from(new Set(approvedReqs.map(r => r.department)))];

  return (
    <div className="space-y-6 relative text-xs">
      
      {/* ── 8 ENTERPRISE POSITION METRIC CARDS ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-[#0B0F19] p-4.5 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400 rounded-xl">
            <Layers size={18} />
          </div>
          <div>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Total Positions</p>
            <p className="text-base font-black mt-0.5 text-slate-800 dark:text-slate-100">{totalPositions}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0B0F19] p-4.5 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <CheckCircle size={18} />
          </div>
          <div>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Approved Positions</p>
            <p className="text-base font-black mt-0.5 text-slate-800 dark:text-slate-100">{approvedPositionsCount}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0B0F19] p-4.5 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-455 rounded-xl">
            <Users size={18} />
          </div>
          <div>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Vacant Positions</p>
            <p className="text-base font-black mt-0.5 text-rose-600 dark:text-rose-455">{vacantCount}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0B0F19] p-4.5 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-xl">
            <TrendingUp size={18} />
          </div>
          <div>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Hiring In Progress</p>
            <p className="text-base font-black mt-0.5 text-slate-800 dark:text-slate-100">{hiringInProgressCount}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0B0F19] p-4.5 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-teal-50 dark:bg-teal-950/20 text-teal-650 dark:text-teal-400 rounded-xl">
            <Users size={18} />
          </div>
          <div>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Filled Positions</p>
            <p className="text-base font-black mt-0.5 text-slate-800 dark:text-slate-100">{filledCount}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0B0F19] p-4.5 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-sky-50 dark:bg-sky-950/20 text-sky-600 dark:text-sky-400 rounded-xl">
            <Snowflake size={18} />
          </div>
          <div>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Frozen Positions</p>
            <p className="text-base font-black mt-0.5 text-slate-800 dark:text-slate-100">{frozenCount}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0B0F19] p-4.5 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-purple-50 dark:bg-purple-950/20 text-purple-650 dark:text-purple-400 rounded-xl">
            <IndianRupee size={18} />
          </div>
          <div>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Annual Hiring Budget</p>
            <p className="text-base font-black mt-0.5 text-slate-800 dark:text-slate-100">{formatCurrency(totalBudget)}/yr</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0B0F19] p-4.5 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 rounded-xl">
            <Clock size={18} />
          </div>
          <div>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Avg Time To Fill</p>
            <p className="text-base font-black mt-0.5 text-slate-800 dark:text-slate-100">24 Days</p>
          </div>
        </div>

      </div>

      {/* ── FILTERS AND GRID ── */}
      <div className="bg-white dark:bg-[#0B0F19] rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm overflow-hidden">
        
        {/* Filters Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-black uppercase">
            <Filter size={14} />
            <span>Position Filters</span>
          </div>

          <div className="flex gap-3">
            <select
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              className="bg-white dark:bg-[#0B0F19] border border-slate-250 dark:border-slate-800 rounded-lg px-2.5 py-1.5 outline-none font-bold"
            >
              <option value="ALL">All Departments</option>
              {uniqueDepartments.filter(d => d !== 'ALL').map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="bg-white dark:bg-[#0B0F19] border border-slate-250 dark:border-slate-800 rounded-lg px-2.5 py-1.5 outline-none font-bold cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="APPROVED">APPROVED</option>
              <option value="HIRING">HIRING</option>
              <option value="PUBLISHED">PUBLISHED</option>
              <option value="FROZEN">FROZEN</option>
              <option value="FILLED">FILLED</option>
            </select>
          </div>
        </div>

        {/* Position Grid/Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-bold">
                <th className="p-4">Position Code</th>
                <th className="p-4">Position Title</th>
                <th className="p-4">Department</th>
                <th className="p-4">Designation</th>
                <th className="p-4">Grade</th>
                <th className="p-4">Band</th>
                <th className="p-4 text-center">Approved</th>
                <th className="p-4 text-center">Filled</th>
                <th className="p-4 text-center">Vacant</th>
                <th className="p-4">Budget</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReqs.map((pos) => {
                // Match candidate counts
                const matchedCandidatesCount = candidates.filter(
                  c => ['ACCEPTED', 'JOINED'].includes(c.status.toUpperCase()) &&
                  c.fullName.toLowerCase().includes(pos.title.toLowerCase().split(' ')[0])
                ).length;
                
                const vacanciesLeft = Math.max(0, (pos.vacancies || 1) - matchedCandidatesCount);

                return (
                  <tr key={pos.id} className="border-b border-slate-200/50 dark:border-slate-800/40 hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                    <td className="p-4 font-mono font-bold text-[10px] text-slate-455">{pos.reqNumber || 'POS-0001'}</td>
                    <td className="p-4 font-extrabold text-slate-800 dark:text-slate-100">{pos.title}</td>
                    <td className="p-4 font-bold">{pos.department}</td>
                    <td className="p-4 font-bold text-slate-500">{pos.designation || 'Specialist'}</td>
                    <td className="p-4 font-bold text-slate-450">{pos.grade || 'G7'}</td>
                    <td className="p-4 font-bold text-slate-450">{pos.band || 'B3'}</td>
                    <td className="p-4 text-center font-bold text-slate-700 dark:text-slate-300">{pos.vacancies || 1}</td>
                    <td className="p-4 text-center font-bold text-emerald-650">{matchedCandidatesCount}</td>
                    <td className="p-4 text-center font-bold text-rose-500">{vacanciesLeft}</td>
                    <td className="p-4 font-bold text-slate-655 dark:text-slate-400">{formatCurrency(pos.budget || 0)}</td>
                    <td className="p-4">
                      <span className={clsx(
                        "px-2 py-0.5 rounded-full text-[9px] font-extrabold border uppercase",
                        pos.status === 'FROZEN' ? 'bg-sky-50 text-sky-655 border-sky-200 dark:bg-sky-950/20' :
                        pos.status === 'FILLED' ? 'bg-emerald-50 text-emerald-655 border-emerald-200 dark:bg-emerald-950/20' :
                        'bg-indigo-50 text-indigo-650 border-indigo-200 dark:bg-indigo-950/20'
                      )}>
                        {pos.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedPosition(pos);
                            setDrawerTab('overview');
                          }}
                          className="bg-slate-50 hover:bg-slate-150 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-600 dark:text-slate-350 text-[10px] font-bold py-1 px-2.5 rounded-lg flex items-center gap-1.5 transition"
                        >
                          <Info size={11} /> Details
                        </button>
                        {pos.status !== 'FILLED' && (
                          <button
                            onClick={() => onPublishJob(pos)}
                            className="bg-indigo-50 hover:bg-indigo-150 text-indigo-650 text-[10px] font-bold py-1 px-2.5 rounded-lg border border-indigo-150/40 flex items-center gap-1 transition"
                          >
                            <Plus size={11} /> Publish Job
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredReqs.length === 0 && (
                <tr>
                  <td colSpan={12} className="p-8 text-center text-slate-400 font-medium">
                    No approved position nodes match filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── RIGHT POSITION DETAIL DRAWER overlay ── */}
      {selectedPosition && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setSelectedPosition(null)}
          />

          {/* Drawer panel */}
          <div className="relative w-full md:w-[48%] h-full bg-white dark:bg-[#0B0F19] border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col z-10 animate-slide-in">
            
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-150 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/10">
              <div>
                <span className="text-[10px] font-mono font-bold text-indigo-655 dark:text-indigo-400">{selectedPosition.reqNumber}</span>
                <h3 className="text-sm font-black text-slate-850 dark:text-white mt-0.5">{selectedPosition.title}</h3>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-indigo-100/50 text-indigo-650 border border-indigo-200 dark:bg-indigo-950/20">
                  {selectedPosition.status}
                </span>
                <button 
                  onClick={() => setSelectedPosition(null)} 
                  className="text-slate-450 hover:text-slate-655 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Tab Bar navigation */}
            <div className="flex border-b border-slate-150 dark:border-slate-800 px-4 bg-slate-50/30 dark:bg-slate-900/5">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'headcount', label: 'Headcount' },
                { id: 'budget', label: 'Budget' },
                { id: 'recruitment', label: 'Recruitment' },
                { id: 'approvals', label: 'Approvals' },
                { id: 'activity', label: 'Activity Timeline' },
                { id: 'documents', label: 'Documents' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setDrawerTab(tab.id as any)}
                  className={clsx(
                    "px-3 py-3 text-[10px] font-bold border-b-2 -mb-[2px] transition",
                    drawerTab === tab.id
                      ? "border-indigo-650 text-indigo-650 dark:text-indigo-455 font-black"
                      : "border-transparent text-slate-450 hover:text-slate-700 dark:hover:text-slate-300"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Drawer Tab Workspace content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">

              {/* OVERVIEW TAB */}
              {drawerTab === 'overview' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-1.5 border-b border-slate-100 dark:border-slate-800">
                    <Building2 size={13} />
                    <span>Position Information</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3.5">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Position Code</span>
                      <p className="font-extrabold text-slate-700 dark:text-slate-200 mt-0.5">{selectedPosition.reqNumber}</p>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Position Title</span>
                      <p className="font-extrabold text-slate-700 dark:text-slate-200 mt-0.5">{selectedPosition.title}</p>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Department</span>
                      <p className="font-extrabold text-slate-700 dark:text-slate-200 mt-0.5">{selectedPosition.department}</p>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Sub Department</span>
                      <p className="font-extrabold text-slate-700 dark:text-slate-200 mt-0.5">{selectedPosition.subDepartment || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Designation</span>
                      <p className="font-extrabold text-slate-700 dark:text-slate-200 mt-0.5">{selectedPosition.designation || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Grade</span>
                      <p className="font-extrabold text-slate-700 dark:text-slate-200 mt-0.5">{selectedPosition.grade || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Band</span>
                      <p className="font-extrabold text-slate-700 dark:text-slate-200 mt-0.5">{selectedPosition.band || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Location</span>
                      <p className="font-extrabold text-slate-700 dark:text-slate-200 mt-0.5">{selectedPosition.location || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Reporting Manager</span>
                      <p className="font-extrabold text-slate-700 dark:text-slate-200 mt-0.5">{selectedPosition.reportingManager || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Employment Type</span>
                      <p className="font-extrabold text-slate-700 dark:text-slate-200 mt-0.5">{selectedPosition.employmentType || 'FULL_TIME'}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Work Model</span>
                      <p className="font-extrabold text-slate-700 dark:text-slate-200 mt-0.5">{selectedPosition.workMode || 'OFFICE'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* HEADCOUNT TAB */}
              {drawerTab === 'headcount' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-slate-50 dark:bg-slate-900 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                      <span className="text-[8px] font-black text-slate-400 uppercase">Approved</span>
                      <p className="text-base font-black text-slate-700 dark:text-white mt-1">{selectedPosition.vacancies || 1}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                      <span className="text-[8px] font-black text-slate-400 uppercase">Filled</span>
                      <p className="text-base font-black text-emerald-650 mt-1">
                        {candidates.filter(c => ['ACCEPTED', 'JOINED'].includes(c.status.toUpperCase()) && c.fullName.toLowerCase().includes(selectedPosition.title.toLowerCase().split(' ')[0])).length}
                      </p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                      <span className="text-[8px] font-black text-slate-400 uppercase">Vacant</span>
                      <p className="text-base font-black text-rose-500 mt-1">
                        {Math.max(0, (selectedPosition.vacancies || 1) - candidates.filter(c => ['ACCEPTED', 'JOINED'].includes(c.status.toUpperCase()) && c.fullName.toLowerCase().includes(selectedPosition.title.toLowerCase().split(' ')[0])).length)}
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/80 space-y-3.5">
                    <h4 className="font-extrabold text-slate-700 dark:text-slate-200">Headcount Metrics & Pipeline</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-[10px] font-extrabold text-slate-500 mb-1">
                          <span>Headcount Fulfillment</span>
                          <span>
                            {Math.min(100, Math.round((candidates.filter(c => ['ACCEPTED', 'JOINED'].includes(c.status.toUpperCase()) && c.fullName.toLowerCase().includes(selectedPosition.title.toLowerCase().split(' ')[0])).length / (selectedPosition.vacancies || 1)) * 100))}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="bg-indigo-650 h-full rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(100, Math.round((candidates.filter(c => ['ACCEPTED', 'JOINED'].includes(c.status.toUpperCase()) && c.fullName.toLowerCase().includes(selectedPosition.title.toLowerCase().split(' ')[0])).length / (selectedPosition.vacancies || 1)) * 100))}%` }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-1.5 text-[10px]">
                        <div>
                          <span className="text-[8px] font-bold text-slate-400 uppercase">Open Requisitions</span>
                          <p className="font-extrabold mt-0.5 text-slate-750 dark:text-slate-200">1 Requisition</p>
                        </div>
                        <div>
                          <span className="text-[8px] font-bold text-slate-400 uppercase">Candidates In Pipeline</span>
                          <p className="font-extrabold mt-0.5 text-indigo-600 dark:text-indigo-400">
                            {candidates.filter(c => c.skills?.toLowerCase().includes(selectedPosition.title.toLowerCase().split(' ')[0])).length} Candidate(s)
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* BUDGET TAB */}
              {drawerTab === 'budget' && (
                <div className="space-y-5">
                  <div className="bg-slate-50/50 dark:bg-[#0b0f19] p-4 rounded-xl border border-slate-150 dark:border-slate-800/80 space-y-4">
                    <h4 className="font-extrabold text-slate-700 dark:text-slate-200">Allocated Salary & Cost Analysis</h4>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-450 font-bold">Salary Budget</span>
                        <span className="font-extrabold text-slate-800 dark:text-slate-100">{formatCurrency(selectedPosition.budget || 0)}/yr</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-450 font-bold">Recruitment Board Budget</span>
                        <span className="font-extrabold text-slate-800 dark:text-slate-100">{formatCurrency(Math.round((selectedPosition.budget || 0) * 0.12))}/yr</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-450 font-bold">Approval Budget Cap</span>
                        <span className="font-extrabold text-slate-800 dark:text-slate-100">{formatCurrency(Math.round((selectedPosition.budget || 0) * 1.05))}/yr</span>
                      </div>
                      <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-805 pt-2.5">
                        <span className="text-slate-700 dark:text-slate-300 font-extrabold">Forecast Cost</span>
                        <span className="font-black text-indigo-650 dark:text-indigo-400">{formatCurrency(Math.round((selectedPosition.budget || 0) * 1.02))}/yr</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50/50 dark:bg-[#0b0f19] p-4 rounded-xl border border-slate-150 dark:border-slate-800/80 space-y-3">
                    <h4 className="font-extrabold text-slate-700 dark:text-slate-200">Budget Consumed Rate</h4>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-3 rounded-full overflow-hidden flex">
                      <div className="bg-indigo-600 h-full rounded-l" style={{ width: '68%' }} />
                      <div className="bg-purple-600 h-full" style={{ width: '15%' }} />
                      <div className="bg-teal-500 h-full rounded-r" style={{ width: '8%' }} />
                    </div>
                    <div className="flex gap-4 text-[9px] font-bold text-slate-450 mt-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-indigo-600 rounded-full" />
                        <span>Salary Base (68%)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-purple-600 rounded-full" />
                        <span>Benefits (15%)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-teal-500 rounded-full" />
                        <span>Recruitment (8%)</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* RECRUITMENT TAB */}
              {drawerTab === 'recruitment' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-1.5 border-b border-slate-100 dark:border-slate-800">
                    <Briefcase size={13} />
                    <span>Recruitment Metrics</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                      <span className="text-slate-450 font-bold">Published Jobs</span>
                      <span className="font-extrabold text-slate-800 dark:text-slate-200">
                        {postings.filter(p => p.jobTitle.toLowerCase() === selectedPosition.title.toLowerCase()).length}
                      </span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                      <span className="text-slate-450 font-bold">Applications</span>
                      <span className="font-extrabold text-slate-800 dark:text-slate-200">
                        {candidates.filter(c => c.skills?.toLowerCase().includes(selectedPosition.title.toLowerCase().split(' ')[0])).length}
                      </span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                      <span className="text-slate-450 font-bold">Interviews</span>
                      <span className="font-extrabold text-indigo-650 dark:text-indigo-400">3 Scheduled</span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                      <span className="text-slate-450 font-bold">Offers</span>
                      <span className="font-extrabold text-slate-800 dark:text-slate-200">1 Extended</span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                      <span className="text-slate-450 font-bold">Accepted</span>
                      <span className="font-extrabold text-emerald-650">1 Accepted</span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                      <span className="text-slate-450 font-bold">Joined</span>
                      <span className="font-extrabold text-slate-800 dark:text-slate-200">0 Joined</span>
                    </div>
                  </div>
                </div>
              )}

              {/* APPROVALS TAB */}
              {drawerTab === 'approvals' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-1.5 border-b border-slate-100 dark:border-slate-800">
                    <Workflow size={13} />
                    <span>Approval Matrix Routing</span>
                  </div>

                  <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                    <div className="relative">
                      <span className="absolute -left-[22px] top-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#0B0F19]" />
                      <h5 className="font-extrabold text-slate-700 dark:text-slate-200">Hiring Manager Signoff</h5>
                      <p className="text-[10px] text-slate-400 mt-0.5">Approved by recruiter manager on 23 Jun 2026</p>
                    </div>
                    <div className="relative">
                      <span className="absolute -left-[22px] top-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#0B0F19]" />
                      <h5 className="font-extrabold text-slate-700 dark:text-slate-200">Department Head Signoff</h5>
                      <p className="text-[10px] text-slate-400 mt-0.5">Approved by department head on 23 Jun 2026</p>
                    </div>
                    <div className="relative">
                      <span className="absolute -left-[22px] top-1 w-3.5 h-3.5 rounded-full bg-indigo-500 border-2 border-white dark:border-[#0B0F19]" />
                      <h5 className="font-extrabold text-slate-700 dark:text-slate-200">Compensation Board Approval</h5>
                      <p className="text-[10px] text-slate-400 mt-0.5">Approved by HR Compensation Team on 24 Jun 2026</p>
                    </div>
                    <div className="relative">
                      <span className="absolute -left-[22px] top-1 w-3.5 h-3.5 rounded-full bg-slate-250 dark:bg-slate-800 border-2 border-white dark:border-[#0B0F19]" />
                      <h5 className="font-extrabold text-slate-400">Executive Finance Route</h5>
                      <p className="text-[10px] text-slate-400 mt-0.5">Awaiting signoff from CFO / EVP</p>
                    </div>
                  </div>
                </div>
              )}

              {/* ACTIVITY TIMELINE TAB */}
              {drawerTab === 'activity' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-1.5 border-b border-slate-100 dark:border-slate-800">
                    <Activity size={13} />
                    <span>Activity History logs</span>
                  </div>

                  <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                    <div className="relative">
                      <span className="absolute -left-[22px] top-1 w-3.5 h-3.5 rounded-full bg-slate-300 dark:bg-slate-750 flex items-center justify-center text-[8px] text-white">L</span>
                      <h5 className="font-extrabold text-slate-700 dark:text-slate-200">Position Published</h5>
                      <p className="text-[10px] text-slate-400 mt-0.5">Job posting was automatically published to internal careers board</p>
                    </div>
                    <div className="relative">
                      <span className="absolute -left-[22px] top-1 w-3.5 h-3.5 rounded-full bg-slate-300 dark:bg-slate-750 flex items-center justify-center text-[8px] text-white">L</span>
                      <h5 className="font-extrabold text-slate-700 dark:text-slate-200">Compensation Review Passed</h5>
                      <p className="text-[10px] text-slate-400 mt-0.5">Budget verification verified matched standard bands</p>
                    </div>
                    <div className="relative">
                      <span className="absolute -left-[22px] top-1 w-3.5 h-3.5 rounded-full bg-slate-300 dark:bg-slate-750 flex items-center justify-center text-[8px] text-white">L</span>
                      <h5 className="font-extrabold text-slate-700 dark:text-slate-200">Position Requisition Approved</h5>
                      <p className="text-[10px] text-slate-400 mt-0.5">Node status transitioned to APPROVED by Admin</p>
                    </div>
                  </div>
                </div>
              )}

              {/* DOCUMENTS TAB */}
              {drawerTab === 'documents' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-1.5 border-b border-slate-100 dark:border-slate-800">
                    <FileText size={13} />
                    <span>Position Documents</span>
                  </div>

                  <div className="space-y-2.5">
                    <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="text-indigo-650 w-5 h-5" />
                        <div>
                          <p className="font-extrabold">JobDescription_JD.pdf</p>
                          <span className="text-[9px] text-slate-400">PDF Document • 4.2 MB</span>
                        </div>
                      </div>
                      <a href="#download" className="text-[10px] font-bold text-indigo-600 hover:underline">Download</a>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="text-indigo-650 w-5 h-5" />
                        <div>
                          <p className="font-extrabold">CompensationBriefing_2026.pdf</p>
                          <span className="text-[9px] text-slate-400">PDF Document • 1.8 MB</span>
                        </div>
                      </div>
                      <a href="#download" className="text-[10px] font-bold text-indigo-600 hover:underline">Download</a>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Drawer Footer actions */}
            <div className="p-4 border-t border-slate-150 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/10 flex justify-end gap-3 shrink-0">
              <button 
                type="button" 
                onClick={() => setSelectedPosition(null)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-500 font-bold rounded-xl transition"
              >
                Close Panel
              </button>
              {selectedPosition.status !== 'FILLED' && (
                <button 
                  type="button" 
                  onClick={() => {
                    onPublishJob(selectedPosition);
                    setSelectedPosition(null);
                  }}
                  className="px-4 py-2 bg-indigo-650 hover:bg-indigo-750 text-white font-bold rounded-xl shadow-sm transition"
                >
                  Publish Active Job
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
