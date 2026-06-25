import { useState } from 'react';
import {
  useGetApprovalTasksQuery,
  useProcessTaskActionMutation,
  useGetWorkflowHistoryQuery,
  useCreateDelegationMutation
} from './workflowApi';
import { useGetEmployeesQuery } from '../employees/employeesApi';
import { DatePicker } from '../employees/DatePicker';
import { useGetAllLeaveRequestsQuery, useGetAllCompOffRequestsQuery } from '../leave/leaveApi';
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Send,
  History,
  Loader2,
  ArrowRightLeft,
  Shield,
  Calendar,
  User,
  Check,
  UserCheck,
  AlertCircle
} from 'lucide-react';

const STATUS_STYLES: Record<string, { bg: string; text: string; icon: any }> = {
  PENDING: { bg: 'bg-amber-50 border border-amber-200', text: 'text-amber-700', icon: Clock },
  APPROVED: { bg: 'bg-emerald-50 border border-emerald-250', text: 'text-emerald-700', icon: CheckCircle },
  REJECTED: { bg: 'bg-rose-50 border border-rose-250', text: 'text-rose-700', icon: XCircle },
  DELEGATED: { bg: 'bg-purple-50 border border-purple-250', text: 'text-purple-700', icon: ArrowRightLeft },
  ARCHIVED: { bg: 'bg-slate-100 border border-slate-200', text: 'text-slate-655', icon: AlertTriangle },
};

function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.PENDING;
  const Icon = style.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}>
      <Icon size={13} />
      {status.replace(/_/g, ' ')}
    </span>
  );
}

function TimelinePanel({ entityType, entityId }: { entityType: string; entityId: string }) {
  const { data: history = [], isLoading } = useGetWorkflowHistoryQuery({ entityType, entityId });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-slate-500 p-4">
        <Loader2 size={16} className="animate-spin text-indigo-600" /> Loading timeline...
      </div>
    );
  }

  if (history.length === 0) {
    return <p className="text-slate-500 text-sm p-4">No timeline entries yet.</p>;
  }

  return (
    <div className="relative pl-6 py-2">
      <div className="absolute left-2 top-3 bottom-3 w-0.5 bg-gradient-to-b from-indigo-500/40 via-indigo-500/10 to-transparent" />
      {history.map((tx, idx) => (
        <div key={tx.id || idx} className="relative mb-4 last:mb-0">
          <div className="absolute -left-4 top-1 w-3 h-3 rounded-full border-2 border-indigo-500 bg-white" />
          <div className="ml-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-650">{tx.action}</span>
              <span className="text-xs text-slate-400">Level {tx.levelNumber}</span>
            </div>
            <p className="text-sm text-slate-700 mt-0.5 font-medium">
              <span className="font-semibold text-slate-800">{tx.actedBy}</span>
              {tx.comments && <span className="text-slate-500 font-normal"> — {tx.comments}</span>}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              {new Date(tx.actedAt).toLocaleString()}
              {tx.ipAddress && ` · ${tx.ipAddress}`}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ApprovalsScreen() {
  const [filterStatus, setFilterStatus] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL'>('PENDING');
  const [filterModule, setFilterModule] = useState<'ALL' | 'LEAVE' | 'COMP_OFF'>('ALL');
  
  // API Queries
  const { data: tasks = [], isLoading: tasksLoading, refetch } = useGetApprovalTasksQuery({
    status: filterStatus === 'ALL' ? undefined : filterStatus
  });
  const { data: employees = [] } = useGetEmployeesQuery();
  const { data: leaves = [] } = useGetAllLeaveRequestsQuery();
  const { data: compOffs = [] } = useGetAllCompOffRequestsQuery();
  const [processTaskAction] = useProcessTaskActionMutation();
  const [createDelegation] = useCreateDelegationMutation();

  // State
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [actionComment, setActionComment] = useState('');
  const [processing, setProcessing] = useState<string | null>(null);
  
  // Delegation form state
  const [delegateTo, setDelegateTo] = useState('');
  const [delegateStart, setDelegateStart] = useState('');
  const [delegateEnd, setDelegateEnd] = useState('');
  const [delegationMsg, setDelegationMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [delegationLoading, setDelegationLoading] = useState(false);

  // Helper to join task with actual request details
  const getTaskDetails = (task: any) => {
    if (task.moduleType === 'LEAVE') {
      const leave = leaves.find((l) => l.id === task.requestId);
      if (!leave) return null;
      const emp = employees.find((e) => e.id === leave.employeeId);
      return {
        type: 'Leave Request',
        initiator: emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown Employee',
        empCode: emp ? emp.employeeCode : '',
        details: `${leave.daysCount} Days (${new Date(leave.startDate).toLocaleDateString()} - ${new Date(leave.endDate).toLocaleDateString()})`,
        reason: leave.reason,
        raw: leave,
      };
    } else if (task.moduleType === 'COMP_OFF') {
      const compOff = compOffs.find((c) => c.id === task.requestId);
      if (!compOff) return null;
      const emp = employees.find((e) => e.id === compOff.employeeId);
      return {
        type: 'Comp-Off Request',
        initiator: emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown Employee',
        empCode: emp ? emp.employeeCode : '',
        details: `${compOff.hoursWorked} Hours Worked on ${new Date(compOff.workDate).toLocaleDateString()}`,
        reason: compOff.reason,
        raw: compOff,
      };
    }
    return null;
  };

  const handleAction = async (taskId: string, action: string) => {
    try {
      setProcessing(`${taskId}-${action}`);
      await processTaskAction({
        taskId,
        body: { action, comments: actionComment }
      }).unwrap();
      setActionComment('');
      setExpandedTaskId(null);
      refetch();
    } catch (err: any) {
      console.error('Task action failed:', err);
    } finally {
      setProcessing(null);
    }
  };

  const handleCreateDelegation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!delegateTo || !delegateStart || !delegateEnd) {
      setDelegationMsg({ type: 'error', text: 'Please fill in all delegation fields.' });
      return;
    }
    
    try {
      setDelegationLoading(true);
      const currentEmployee = employees[0]; // fallback
      if (!currentEmployee) {
        throw new Error('No employees available to delegate from.');
      }
      
      await createDelegation({
        fromEmployeeId: currentEmployee.id || '',
        toEmployeeId: delegateTo,
        startDate: delegateStart,
        endDate: delegateEnd,
      }).unwrap();

      setDelegationMsg({ type: 'success', text: 'Approvals delegated successfully!' });
      setDelegateTo('');
      setDelegateStart('');
      setDelegateEnd('');
    } catch (err: any) {
      setDelegationMsg({ type: 'error', text: err?.data?.message || 'Failed to create delegation.' });
    } finally {
      setDelegationLoading(false);
    }
  };

  // Filter tasks locally
  const filteredTasks = tasks.filter((task) => {
    if (filterModule !== 'ALL' && task.moduleType !== filterModule) {
      return false;
    }
    return true;
  });

  // SLA calculation helper
  const getSLAStatus = (dueAtStr: string) => {
    const due = new Date(dueAtStr).getTime();
    const now = Date.now();
    const diffHours = (due - now) / (1000 * 60 * 60);

    if (diffHours < 0) {
      return { label: 'Overdue', color: 'text-rose-700 bg-rose-50 border-rose-200' };
    } else if (diffHours < 12) {
      return { label: 'Critical (Due soon)', color: 'text-orange-700 bg-orange-50 border-orange-200' };
    }
    return { label: 'On Time', color: 'text-emerald-700 bg-emerald-50 border-emerald-250' };
  };

  return (
    <div className="min-h-screen bg-[#F3F7FA] text-slate-800">
      <div className="w-full max-w-none px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-805 flex items-center gap-2.5">
              <Shield size={28} className="text-indigo-650" />
              Workforce Approvals Cockpit
            </h1>
            <p className="text-slate-500 mt-2 text-sm">Centralized workspace to audit, delegate, and action pending workforce workflow tasks.</p>
          </div>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm self-start"
          >
            <Clock size={15} /> Refresh Workbench
          </button>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="rounded-xl p-5 border border-amber-100 bg-amber-50/60 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Clock size={20} className="text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-amber-700">
                  {tasks.filter(t => t.actionStatus === 'PENDING' || t.actionStatus === 'DELEGATED').length}
                </p>
                <p className="text-xs text-amber-800/80 font-bold uppercase tracking-wider mt-0.5">Pending Tasks</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl p-5 border border-purple-100 bg-purple-50/60 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <ArrowRightLeft size={20} className="text-purple-650" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-purple-700">
                  {tasks.filter(t => t.actionStatus === 'DELEGATED').length}
                </p>
                <p className="text-xs text-purple-800/80 font-bold uppercase tracking-wider mt-0.5">Delegated Tasks</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl p-5 border border-emerald-100 bg-emerald-50/60 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <CheckCircle size={20} className="text-emerald-655" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-emerald-700">98.4%</p>
                <p className="text-xs text-emerald-800/80 font-bold uppercase tracking-wider mt-0.5">SLA Compliance Rate</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs & Action Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Approval Workbench List */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Filter Cockpit */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-slate-200/80 bg-white shadow-sm">
              <div className="flex gap-2">
                {(['PENDING', 'APPROVED', 'REJECTED', 'ALL'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setFilterStatus(status);
                      setExpandedTaskId(null);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      filterStatus === status
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                        : 'text-slate-650 hover:text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-semibold">Module:</span>
                <select
                  value={filterModule}
                  onChange={(e) => setFilterModule(e.target.value as any)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 focus:outline-none focus:border-indigo-500/50 font-semibold cursor-pointer"
                >
                  <option value="ALL">All Modules</option>
                  <option value="LEAVE">Leaves</option>
                  <option value="COMP_OFF">Comp-offs</option>
                </select>
              </div>
            </div>

            {/* List */}
            {tasksLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500 bg-white rounded-xl border border-slate-200 shadow-sm">
                <Loader2 size={32} className="animate-spin text-indigo-600 mb-3" />
                <p className="text-sm font-semibold">Retrieving workbench actions...</p>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="text-center py-20 rounded-xl border border-dashed border-slate-300 bg-white shadow-sm">
                <CheckCircle size={48} className="mx-auto text-emerald-500/60 mb-4" />
                <h3 className="text-lg font-bold text-slate-800">All Tasks Handled</h3>
                <p className="text-slate-400 text-sm mt-1">No items found matching the current filters.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTasks.map((task) => {
                  const details = getTaskDetails(task);
                  const isExpanded = expandedTaskId === task.id;
                  const sla = getSLAStatus(task.dueAt);

                  return (
                    <div
                      key={task.id}
                      className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:border-slate-350 transition-all duration-200"
                    >
                      {/* Task Header Row */}
                      <div
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5 cursor-pointer hover:bg-slate-50/50 transition-colors"
                        onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                            {task.moduleType === 'LEAVE' ? (
                              <Calendar size={18} className="text-indigo-650" />
                            ) : (
                              <Clock size={18} className="text-purple-600" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-extrabold text-slate-800">
                                {details?.type || `${task.moduleType} Request`}
                              </p>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 border border-slate-200 text-slate-500">
                                Level {task.levelNo}
                              </span>
                              {task.actionStatus === 'DELEGATED' && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-100">
                                  <ArrowRightLeft size={10} /> Delegated
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                              Initiated by <span className="text-slate-800 font-bold">{details?.initiator || 'Unknown'}</span> · Code: {details?.empCode || 'N/A'}
                            </p>
                            <p className="text-xs text-indigo-650 mt-0.5 font-bold">{details?.details}</p>
                          </div>
                        </div>

                        {/* Status / SLA Indicator */}
                        <div className="flex items-center sm:flex-col sm:items-end gap-3 self-end sm:self-center">
                          <StatusBadge status={task.actionStatus} />
                          {task.actionStatus === 'PENDING' && (
                            <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${sla.color}`}>
                              SLA: {sla.label}
                            </span>
                          )}
                          {isExpanded ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                        </div>
                      </div>

                      {/* Expansion Panel */}
                      {isExpanded && (
                        <div className="border-t border-slate-100 bg-slate-50/40 px-6 py-5">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* Request Details & Actions */}
                            <div className="space-y-4">
                              <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-455">Request Context & Reason</h4>
                                <p className="text-sm text-slate-605 mt-1.5 italic bg-slate-50 p-3 rounded-lg border border-slate-150">
                                  "{details?.reason || 'No comments provided'}"
                                </p>
                              </div>

                              {task.actionStatus === 'PENDING' && (
                                <div>
                                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-455 mb-2">Audit Comment & Action</h4>
                                  <textarea
                                    value={actionComment}
                                    onChange={(e) => setActionComment(e.target.value)}
                                    placeholder="Provide reason for approval or rejection..."
                                    rows={3}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-805 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/15 resize-none"
                                  />
                                  <div className="flex gap-3 mt-3">
                                    <button
                                      onClick={() => handleAction(task.id, 'APPROVE')}
                                      disabled={processing !== null}
                                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold text-white transition-all duration-200 disabled:opacity-50"
                                      style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}
                                    >
                                      {processing === `${task.id}-APPROVE` ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                                      Approve Request
                                    </button>
                                    <button
                                      onClick={() => handleAction(task.id, 'REJECT')}
                                      disabled={processing !== null}
                                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold text-white transition-all duration-200 disabled:opacity-50"
                                      style={{ background: 'linear-gradient(135deg, #dc2626, #ef4444)' }}
                                    >
                                      {processing === `${task.id}-REJECT` ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                                      Reject Request
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Workflow Execution Log */}
                            <div>
                              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-455 mb-2 flex items-center gap-1.5">
                                <History size={13} />
                                Multi-level Timeline
                              </h4>
                              <div className="rounded-lg border border-slate-200 bg-white max-h-60 overflow-y-auto">
                                <TimelinePanel entityType={task.moduleType} entityId={task.requestId} />
                              </div>
                            </div>

                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Sidebar: Delegation Config */}
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-850 flex items-center gap-2 mb-1">
                <UserCheck size={18} className="text-purple-650" />
                Delegation Engine
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                Forward your approval authority automatically to a chosen backup colleague during an absence window.
              </p>

              <form onSubmit={handleCreateDelegation} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-450 mb-1.5 uppercase tracking-wider">Select Backup Approver</label>
                  <select
                    value={delegateTo}
                    onChange={(e) => setDelegateTo(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-805 focus:outline-none focus:border-indigo-500/50 font-semibold cursor-pointer"
                  >
                    <option value="">Choose colleague...</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName} ({emp.employeeCode})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <DatePicker
                    label="Start Date"
                    value={delegateStart}
                    onChange={setDelegateStart}
                  />
                  <DatePicker
                    label="End Date"
                    value={delegateEnd}
                    onChange={setDelegateEnd}
                  />
                </div>

                <button
                  type="submit"
                  disabled={delegationLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-550 hover:to-indigo-550 transition-all shadow-md shadow-indigo-600/10 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
                >
                  {delegationLoading ? <Loader2 size={16} className="animate-spin" /> : 'Activate Delegation'}
                </button>
              </form>

              {delegationMsg && (
                <div className={`mt-4 p-3 rounded-lg flex items-start gap-2 text-xs border ${
                  delegationMsg.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-rose-50 border-rose-200 text-rose-700'
                }`}>
                  <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                  <span>{delegationMsg.text}</span>
                </div>
              )}
            </div>

            {/* SLA Policy Summary Card */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5">
              <h3 className="text-sm font-bold text-slate-805 flex items-center gap-1.5 mb-2.5">
                <AlertCircle size={15} className="text-amber-500" />
                SLA Compliance Policies
              </h3>
              <ul className="space-y-2 text-xs text-slate-505 font-medium">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                  <span>Approvers receive a 48-hour default SLA to action assigned workflow tasks.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                  <span>Tasks approaching the 12-hour limit are automatically flagged as "Critical".</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                  <span>Overdue tasks trigger escalation logic to notify higher management tiers.</span>
                </li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
