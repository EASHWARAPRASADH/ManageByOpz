import React, { useState, useEffect } from 'react';
import { 
  Calendar, Send, Plus, FileText, Check, X, AlertCircle, Percent, Clock, 
  TrendingUp, AlertTriangle, Users, Search, Filter, IndianRupee, Briefcase, 
  History, UserCheck, MapPin, Sliders, Shield, Trash2, ChevronRight, UserPlus
} from 'lucide-react';
import { formatCurrency, getCurrencySymbol } from '../../utils/currencyFormatter';
import { useAppSelector } from '../../app/hooks';
import { 
  useGetLeaveTypesQuery,
  useGetLeaveBalancesQuery,
  useGetLeaveRequestsQuery,
  useApplyLeaveMutation,
  useActionLeaveMutation,
  useGetHolidayCalendarsQuery,
  useCreateHolidayCalendarMutation,
  useGetCalendarDaysQuery,
  useCreateCalendarDayMutation,
  useGetLeavePoliciesQuery,
  useCreateLeavePolicyMutation,
  useUpdateLeavePolicyMutation,
  useCloneLeavePolicyMutation,
  useArchiveLeavePolicyMutation,
  useActivateLeavePolicyMutation,
  useDeactivateLeavePolicyMutation,
  useDeleteLeavePolicyMutation,
  useGetPolicyRulesQuery,
  useCreatePolicyRuleMutation,
  useUpdatePolicyRuleMutation,
  useDeletePolicyRuleMutation,
  useGetPolicyAssignmentsQuery,
  useCreatePolicyAssignmentMutation,
  useDeletePolicyAssignmentMutation,
  useGetPolicyAssignmentsForIdQuery,
  useGetPolicyVersionsQuery,
  useGetPolicyAuditsQuery,
  useLazyGetPolicyImpactQuery,
  useRecalculateBalancesMutation,
  useGetCompOffRequestsQuery,
  useGetCompOffWalletQuery,
  useSubmitCompOffRequestMutation,
  useGetLiabilityReportQuery,
  useGetLiabilityDashboardQuery,
  useGetBurnoutRiskQuery,
  useGetRiskHeatmapQuery,
  useGetExhaustionPredictionQuery,
  useGetFrequentAbsenteePatternsQuery,
  useGetWorkflowPreviewQuery,
  useGetResolvedPolicyQuery,
  useGetTeamAvailabilityQuery,
  useGetAllLeaveRequestsQuery,
  useCreateLeaveTypeMutation,
  useUpdateLeaveTypeMutation,
  useDeleteLeaveTypeMutation,
  useAdjustBalanceMutation,
  useRecalculateWalletsMutation,
  type LeaveType,
  type LeaveBalance,
  type LeavePolicy,
  type LeavePolicyRule,
  type LeavePolicyAssignment,
} from './leaveApi';
import { useGetEmployeesQuery } from '../employees/employeesApi';
import {
  useGetApprovalTasksQuery,
  useProcessTaskActionMutation,
} from '../workflow/workflowApi';
import { DatePicker } from '../employees/DatePicker';

export function LeaveScreen() {
  const currentUser = useAppSelector((state) => state.auth.user);
  const userRole = useAppSelector((state) => state.auth.role);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'wallet' | 'requests' | 'teamCalendar' | 'approvalCenter' | 'holidayCalendars' | 'policyRules' | 'auditLogs' | 'compOff' | 'analytics' | 'encashment' | 'applyWorkspace' | 'leaveTypesAdmin' | 'leaveBalancesAdmin'>('dashboard');

  const isAdminOrManager = userRole === 'ROLE_ADMIN' || userRole === 'ROLE_MANAGER' || userRole === 'ROLE_SUPER_ADMIN' || userRole === 'ROLE_ULTRA_SUPER_ADMIN';

  // Form Initializers & local states needed early for queries
  const [newRequest, setNewRequest] = useState({
    leaveTypeId: '',
    startDate: '',
    endDate: '',
    reason: '',
    halfDay: false,
    halfDayType: 'FIRST_HALF' as 'FIRST_HALF' | 'SECOND_HALF',
    attachmentName: ''
  });

  const [selectedAnalyticsEmpId, setSelectedAnalyticsEmpId] = useState<string>('');

  // Fetch employees to map the current user's email to employee ID
  const { data: employees = [], isLoading: isEmployeesLoading } = useGetEmployeesQuery();
  
  // Find current employee or fallback to first employee
  const currentEmployee = employees.find(e => e.workEmail?.toLowerCase() === currentUser?.email?.toLowerCase()) || employees[0];
  const employeeId = currentEmployee?.id;
  const currentYear = new Date().getFullYear();

  // Queries & Mutations
  const { data: leaveTypes = [], isLoading: isTypesLoading } = useGetLeaveTypesQuery();
  const { data: balances = [], isLoading: isBalancesLoading } = useGetLeaveBalancesQuery(
    { employeeId: employeeId || '', year: currentYear },
    { skip: !employeeId }
  );
  const { data: requests = [], isLoading: isRequestsLoading, refetch: refetchRequests } = useGetLeaveRequestsQuery(
    employeeId || '',
    { skip: !employeeId }
  );

  // Admin and Policy Queries
  const { data: holidayCalendars = [], refetch: refetchCalendars } = useGetHolidayCalendarsQuery();
  const { data: leavePolicies = [], refetch: refetchPolicies } = useGetLeavePoliciesQuery();
  const { data: policyAssignments = [], refetch: refetchAssignments } = useGetPolicyAssignmentsQuery();

  const [applyLeave, { isLoading: isApplying }] = useApplyLeaveMutation();
  const [actionLeave, { isLoading: isActioning }] = useActionLeaveMutation();

  const [updateLeavePolicy] = useUpdateLeavePolicyMutation();
  const [cloneLeavePolicy] = useCloneLeavePolicyMutation();
  const [archiveLeavePolicy] = useArchiveLeavePolicyMutation();
  const [activateLeavePolicy] = useActivateLeavePolicyMutation();
  const [deactivateLeavePolicy] = useDeactivateLeavePolicyMutation();
  const [deleteLeavePolicy] = useDeleteLeavePolicyMutation();

  const [updatePolicyRule] = useUpdatePolicyRuleMutation();
  const [deletePolicyRule] = useDeletePolicyRuleMutation();
  const [deletePolicyAssignment] = useDeletePolicyAssignmentMutation();

  const [createHolidayCalendar] = useCreateHolidayCalendarMutation();
  const [createCalendarDay] = useCreateCalendarDayMutation();
  const [createLeavePolicy] = useCreateLeavePolicyMutation();
  const [createPolicyRule] = useCreatePolicyRuleMutation();
  const [createPolicyAssignment] = useCreatePolicyAssignmentMutation();
  const [recalculateBalances] = useRecalculateBalancesMutation();
  const [createLeaveType] = useCreateLeaveTypeMutation();
  const [updateLeaveType] = useUpdateLeaveTypeMutation();
  const [deleteLeaveType] = useDeleteLeaveTypeMutation();
  const [adjustBalance] = useAdjustBalanceMutation();
  const [recalculateWallets] = useRecalculateWalletsMutation();



  // Comp-off Query and State
  const { data: compOffRequests = [], refetch: refetchCompOffRequests } = useGetCompOffRequestsQuery(employeeId || '', { skip: !employeeId });
  const { data: compOffWallet } = useGetCompOffWalletQuery(employeeId || '', { skip: !employeeId });
  const [submitCompOffRequest, { isLoading: isSubmittingCompOff }] = useSubmitCompOffRequestMutation();

  const [compOffForm, setCompOffForm] = useState({
    workDate: '',
    hoursWorked: 8,
    reason: ''
  });

  // Analytics Query and State
  const { data: liabilityDashboard } = useGetLiabilityDashboardQuery();
  const { data: riskHeatmap = [] } = useGetRiskHeatmapQuery();
  const { data: patterns = [] } = useGetFrequentAbsenteePatternsQuery();

  // Enterprise Workflow, Policy and Team Availability Preview Queries
  const { data: workflowPreview } = useGetWorkflowPreviewQuery(
    { entityType: 'LEAVE', employeeId: employeeId || '' },
    { skip: !employeeId }
  );

  const { data: resolvedPolicy } = useGetResolvedPolicyQuery(employeeId || '', { skip: !employeeId });

  const { data: teamAvailability } = useGetTeamAvailabilityQuery(
    { 
      employeeId: employeeId || '', 
      startDate: newRequest.startDate || '2026-01-01', 
      endDate: newRequest.endDate || '2026-01-01' 
    },
    { skip: !employeeId || !newRequest.startDate || !newRequest.endDate }
  );

  // Approval Inbox hook
  const { data: approvalTasks = [], refetch: refetchApprovalTasks } = useGetApprovalTasksQuery(
    { status: 'PENDING' },
    { skip: !isAdminOrManager }
  );
  
  const { data: allLeaveRequests = [] } = useGetAllLeaveRequestsQuery();

  const [processTaskAction] = useProcessTaskActionMutation();

  const { data: selectedBurnoutRisk } = useGetBurnoutRiskQuery(selectedAnalyticsEmpId, { skip: !selectedAnalyticsEmpId });
  const { data: selectedExhaustion } = useGetExhaustionPredictionQuery(selectedAnalyticsEmpId, { skip: !selectedAnalyticsEmpId });

  const handleSubmitCompOff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId) return;
    try {
      await submitCompOffRequest({
        employeeId,
        workDate: compOffForm.workDate,
        hoursWorked: Number(compOffForm.hoursWorked),
        reason: compOffForm.reason
      }).unwrap();
      setSuccessMessage("Comp-off request submitted successfully!");
      setCompOffForm({ workDate: '', hoursWorked: 8, reason: '' });
      refetchCompOffRequests();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.data?.message || "Failed to submit comp-off request");
    }
  };

  const handleTriggerCompOffExpiry = async () => {
    try {
      // Use standard fetch or api call
      await fetch('/v1/leave/comp-off/expire', { method: 'POST' });
      setSuccessMessage("Comp-off expiry job triggered successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      alert("Failed to trigger expiry job");
    }
  };

  const handleTaskAction = async (taskId: string, action: string, comments: string) => {
    try {
      await processTaskAction({ taskId, body: { action, comments } }).unwrap();
      setSuccessMessage(`Task successfully actioned: ${action}`);
      refetchApprovalTasks();
      refetchRequests();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.data?.message || `Failed to perform ${action} on task`);
      setTimeout(() => setErrorMessage(null), 4000);
    }
  };

  // Dialog & Form States
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showEncashModal, setShowEncashModal] = useState(false);
  const [showAddCalendarModal, setShowAddCalendarModal] = useState(false);
  const [showAddPolicyModal, setShowAddPolicyModal] = useState(false);
  const [showAddRuleModal, setShowAddRuleModal] = useState(false);
  const [showAddHolidayDayModal, setShowAddHolidayDayModal] = useState(false);
  const [showAddAssignmentModal, setShowAddAssignmentModal] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [encashRequest, setEncashRequest] = useState({
    leaveTypeId: '',
    days: 1
  });

  const [taskComments, setTaskComments] = useState<Record<string, string>>({});

  const [newCalendar, setNewCalendar] = useState({
    calendarName: '',
    country: 'India',
    state: 'Tamil Nadu',
    year: currentYear,
    active: true
  });

  const [newHolidayDay, setNewHolidayDay] = useState({
    calendarId: '',
    holidayName: '',
    holidayDate: '',
    holidayType: 'PUBLIC',
    optionalHoliday: false
  });

  const [newPolicy, setNewPolicy] = useState({
    policyName: '',
    policyCode: '',
    description: '',
    effectiveFrom: new Date().toISOString().split('T')[0],
    effectiveTo: '',
    active: true,
    status: 'ACTIVE',
    organizationScope: ''
  });

  const [editPolicyForm, setEditPolicyForm] = useState({
    id: '',
    policyName: '',
    policyCode: '',
    description: '',
    effectiveFrom: '',
    effectiveTo: '',
    status: 'ACTIVE',
    organizationScope: ''
  });

  const [clonePolicyForm, setClonePolicyForm] = useState({
    id: '',
    newName: '',
    newCode: ''
  });

  const [showEditPolicyModal, setShowEditPolicyModal] = useState(false);
  const [showClonePolicyModal, setShowClonePolicyModal] = useState(false);
  const [showEditRuleModal, setShowEditRuleModal] = useState(false);
  const [selectedRuleForEdit, setSelectedRuleForEdit] = useState<LeavePolicyRule | null>(null);
  const [policySubTab, setPolicySubTab] = useState<'rules' | 'assignments' | 'versions' | 'audits'>('rules');

  const [activePolicyMenuId, setActivePolicyMenuId] = useState<string | null>(null);
  const [showImpactDialog, setShowImpactDialog] = useState(false);
  const [impactAction, setImpactAction] = useState<'create' | 'update' | null>(null);

  const [newRule, setNewRule] = useState({
    policyId: '',
    leaveTypeId: '',
    allocatedDays: 12,
    accrualMethod: 'MONTHLY',
    carryForwardLimit: 5,
    encashmentAllowed: true,
    negativeBalanceAllowed: false,
    noticePeriod: 0,
    minServiceDays: 0,
    attachmentRequired: false,
    halfDayAllowed: false,
    genderEligibility: 'ALL',
    employmentTypeEligibility: 'ALL'
  });

  const [editRuleForm, setEditRuleForm] = useState({
    id: '',
    policyId: '',
    leaveTypeId: '',
    allocatedDays: 12,
    accrualMethod: 'MONTHLY',
    carryForwardLimit: 5,
    encashmentAllowed: true,
    negativeBalanceAllowed: false,
    noticePeriod: 0,
    minServiceDays: 0,
    attachmentRequired: false,
    halfDayAllowed: false,
    genderEligibility: 'ALL',
    employmentTypeEligibility: 'ALL',
    leaveTypeName: '',
    leaveTypeCode: ''
  });

  const [newAssignment, setNewAssignment] = useState({
    policyId: '',
    organizationId: '',
    businessUnitId: '',
    departmentId: '',
    gradeId: '',
    bandId: '',
    employmentTypeId: ''
  });

  // Leave Types Admin local state
  const [showAddTypeModal, setShowAddTypeModal] = useState(false);
  const [showEditTypeModal, setShowEditTypeModal] = useState(false);
  const [selectedTypeForEdit, setSelectedTypeForEdit] = useState<LeaveType | null>(null);
  const [typeForm, setTypeForm] = useState({
    name: '',
    code: '',
    description: '',
    category: 'GENERAL',
    genderEligibility: 'ALL',
    defaultDays: 12,
    carryForwardAllowed: true,
    maxCarryForwardDays: 5,
    encashmentAllowed: false,
    halfDayAllowed: true,
    negativeBalanceAllowed: false,
    requiresApproval: true,
    requiresDocument: false,
    minDaysNotice: 0,
    maxConsecutiveDays: 15,
    active: true
  });

  // Leave Balances Admin local state
  const [balanceFilterEmpId, setBalanceFilterEmpId] = useState<string>('');
  const [balanceFilterTypeVal, setBalanceFilterTypeVal] = useState<string>('');
  const [balanceFilterYearVal, setBalanceFilterYearVal] = useState<number>(currentYear);
  const [showAdjustBalanceModal, setShowAdjustBalanceModal] = useState(false);
  const [adjustBalanceForm, setAdjustBalanceForm] = useState({
    employeeId: '',
    leaveTypeId: '',
    year: currentYear,
    amount: 0,
    reason: '',
    mode: 'credit' as 'credit' | 'debit'
  });

  // Filter States
  const [requestFilter, setRequestFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [selectedCalendarId, setSelectedCalendarId] = useState<string>('');
  const [selectedPolicyId, setSelectedPolicyId] = useState<string>('');

  const { data: policyVersions = [] } = useGetPolicyVersionsQuery(selectedPolicyId, { skip: !selectedPolicyId });
  const { data: policyAudits = [] } = useGetPolicyAuditsQuery(selectedPolicyId, { skip: !selectedPolicyId });
  const { data: policyAssignmentsForId = [] } = useGetPolicyAssignmentsForIdQuery(selectedPolicyId, { skip: !selectedPolicyId });
  const [triggerGetImpact, { data: impactData }] = useLazyGetPolicyImpactQuery();

  // Local/Simulation States (to enrich Dashboard metrics)
  const [leavesToday] = useState([
    { name: 'Sarah Williams', code: 'ACME-000003', dept: 'Technology', type: 'Casual Leave', avatar: 'SW', color: 'bg-indigo-500' },
    { name: 'John Doe', code: 'ACME-000008', dept: 'Human Resources', type: 'Earned Leave', avatar: 'JD', color: 'bg-emerald-500' },
    { name: 'Emma Watson', code: 'ACME-000012', dept: 'Finance', type: 'Sick Leave', avatar: 'EW', color: 'bg-rose-500' }
  ]);

  const [burnoutRisk] = useState([
    { name: 'Sarah Williams', code: 'ACME-000003', balance: 24, consecutiveDays: 0, status: 'Risk Level: High (No leave taken in 120 days)' },
    { name: 'Dhipak Sankar', code: 'ACME-000004', balance: 18, consecutiveDays: 0, status: 'Risk Level: Medium (Low usage trend)' }
  ]);

  const [delegationRule, setDelegationRule] = useState({
    delegateTo: '',
    startDate: '',
    endDate: '',
    active: false
  });

  const [auditLogs] = useState([
    { user: 'admin@acme.com', action: 'CREATE_POLICY', details: 'Added Technology Employee Policy', ip: '192.168.1.10', time: '2026-06-19 10:24' },
    { user: 'sarah.williams@acme.com', action: 'APPROVE_LEAVE', details: 'Approved Casual Leave for Dhipak Sankar', ip: '192.168.2.14', time: '2026-06-19 14:15' },
    { user: 'michael.chen@acme.com', action: 'APPROVE_LEAVE', details: 'Approved Casual Leave (L2) for Dhipak Sankar', ip: '192.168.2.18', time: '2026-06-19 14:28' }
  ]);

  // Set defaults on load
  useEffect(() => {
    if (leaveTypes.length > 0) {
      if (!newRequest.leaveTypeId) setNewRequest(prev => ({ ...prev, leaveTypeId: leaveTypes[0].id }));
      if (!encashRequest.leaveTypeId) setEncashRequest(prev => ({ ...prev, leaveTypeId: leaveTypes[0].id }));
      if (!newRule.leaveTypeId) setNewRule(prev => ({ ...prev, leaveTypeId: leaveTypes[0].id }));
    }
  }, [leaveTypes]);

  useEffect(() => {
    if (holidayCalendars.length > 0 && !selectedCalendarId) {
      setSelectedCalendarId(holidayCalendars[0].id || '');
    }
  }, [holidayCalendars]);

  useEffect(() => {
    if (leavePolicies.length > 0 && !selectedPolicyId) {
      setSelectedPolicyId(leavePolicies[0].id || '');
    }
  }, [leavePolicies]);

  // Handle Handlers
  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!employeeId) {
      setErrorMessage("No employee profile found.");
      return;
    }

    try {
      await applyLeave({
        employeeId,
        leaveTypeId: newRequest.leaveTypeId,
        startDate: newRequest.startDate,
        endDate: newRequest.endDate,
        reason: newRequest.reason,
        halfDay: newRequest.halfDay,
        halfDayType: newRequest.halfDay ? newRequest.halfDayType : undefined,
        daysCount: 0 // Server calculated
      }).unwrap();

      setSuccessMessage("Leave request submitted successfully!");
      setShowRequestModal(false);
      setNewRequest(prev => ({
        ...prev,
        startDate: '',
        endDate: '',
        reason: '',
        halfDay: false
      }));
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.data?.message || err.message || "Failed to submit leave request.");
    }
  };

  const handleAction = async (id: string, status: 'APPROVED' | 'REJECTED' | 'CANCELLED') => {
    try {
      const comment = status === 'REJECTED' ? 'Rejected by manager' : 'Approved by manager';
      await actionLeave({ id, status, comment }).unwrap();
      setSuccessMessage(`Request successfully updated to ${status}`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      alert(err.data?.message || "Failed to update request.");
    }
  };

  const handleCreateCalendar = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createHolidayCalendar(newCalendar).unwrap();
      setShowAddCalendarModal(false);
      refetchCalendars();
      setNewCalendar({
        calendarName: '',
        country: 'India',
        state: 'Tamil Nadu',
        year: currentYear,
        active: true
      });
    } catch (err: any) {
      alert("Failed to create holiday calendar");
    }
  };

  const handleAddHolidayDay = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCalendarDay({
        calendarId: selectedCalendarId,
        body: {
          holidayName: newHolidayDay.holidayName,
          holidayDate: newHolidayDay.holidayDate,
          holidayType: newHolidayDay.holidayType,
          optionalHoliday: newHolidayDay.optionalHoliday,
          active: true
        }
      }).unwrap();
      setShowAddHolidayDayModal(false);
      setNewHolidayDay(prev => ({ ...prev, holidayName: '', holidayDate: '' }));
    } catch (err: any) {
      alert("Failed to add holiday day");
    }
  };

  const handleCreatePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createLeavePolicy(newPolicy).unwrap();
      setShowAddPolicyModal(false);
      refetchPolicies();
      setNewPolicy({
        policyName: '',
        policyCode: '',
        description: '',
        effectiveFrom: new Date().toISOString().split('T')[0],
        effectiveTo: '',
        active: true,
        status: 'ACTIVE',
        organizationScope: ''
      });
    } catch (err: any) {
      alert("Failed to create policy");
    }
  };

  const handleCreateLeaveType = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createLeaveType(typeForm).unwrap();
      setShowAddTypeModal(false);
      setTypeForm({
        name: '',
        code: '',
        description: '',
        category: 'GENERAL',
        genderEligibility: 'ALL',
        defaultDays: 12,
        carryForwardAllowed: true,
        maxCarryForwardDays: 5,
        encashmentAllowed: false,
        halfDayAllowed: true,
        negativeBalanceAllowed: false,
        requiresApproval: true,
        requiresDocument: false,
        minDaysNotice: 0,
        maxConsecutiveDays: 15,
        active: true
      });
      setSuccessMessage("Leave Type created successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.data?.message || "Failed to create leave type");
      setTimeout(() => setErrorMessage(null), 4000);
    }
  };

  const handleUpdateLeaveType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTypeForEdit?.id) return;
    try {
      await updateLeaveType({ id: selectedTypeForEdit.id, body: typeForm }).unwrap();
      setShowEditTypeModal(false);
      setSelectedTypeForEdit(null);
      setSuccessMessage("Leave Type updated successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.data?.message || "Failed to update leave type");
      setTimeout(() => setErrorMessage(null), 4000);
    }
  };

  const handleDeleteLeaveType = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete/archive this leave type?")) return;
    try {
      await deleteLeaveType(id).unwrap();
      setSuccessMessage("Leave Type archived successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.data?.message || "Failed to delete leave type");
      setTimeout(() => setErrorMessage(null), 4000);
    }
  };

  const handleAdjustBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const finalAmount = adjustBalanceForm.mode === 'debit' ? -Math.abs(adjustBalanceForm.amount) : Math.abs(adjustBalanceForm.amount);
      await adjustBalance({
        employeeId: adjustBalanceForm.employeeId,
        leaveTypeId: adjustBalanceForm.leaveTypeId,
        year: Number(adjustBalanceForm.year),
        amount: finalAmount,
        reason: adjustBalanceForm.reason
      }).unwrap();
      setShowAdjustBalanceModal(false);
      setAdjustBalanceForm({
        employeeId: '',
        leaveTypeId: '',
        year: currentYear,
        amount: 0,
        reason: '',
        mode: 'credit'
      });
      setSuccessMessage("Leave balance adjusted successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.data?.message || "Failed to adjust balance");
      setTimeout(() => setErrorMessage(null), 4000);
    }
  };

  const handleRecalculateAllWallets = async () => {
    if (!window.confirm("Are you sure you want to trigger bulk recalculation of all employee leave balances?")) return;
    try {
      await recalculateWallets({}).unwrap();
      setSuccessMessage("Recalculation triggered successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.data?.message || "Failed to trigger recalculation");
      setTimeout(() => setErrorMessage(null), 4000);
    }
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    setImpactAction('create');
    setShowImpactDialog(true);
  };

  const submitCreateRule = async () => {
    try {
      await createPolicyRule({
        policyId: selectedPolicyId,
        body: newRule
      }).unwrap();
      setShowAddRuleModal(false);
      setShowImpactDialog(false);
      setImpactAction(null);
      setSuccessMessage("Rule created successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.data?.message || "Failed to create policy rule");
      setTimeout(() => setErrorMessage(null), 4000);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPolicyAssignment({
        ...newAssignment,
        policyId: selectedPolicyId
      }).unwrap();
      setShowAddAssignmentModal(false);
      refetchAssignments();
    } catch (err: any) {
      alert("Failed to assign policy");
    }
  };

  const handleUpdatePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateLeavePolicy({
        id: editPolicyForm.id,
        body: {
          policyName: editPolicyForm.policyName,
          policyCode: editPolicyForm.policyCode,
          description: editPolicyForm.description,
          effectiveFrom: editPolicyForm.effectiveFrom,
          effectiveTo: editPolicyForm.effectiveTo || undefined,
          status: editPolicyForm.status,
          organizationScope: editPolicyForm.organizationScope || undefined
        }
      }).unwrap();
      setSuccessMessage("Policy updated successfully!");
      setShowEditPolicyModal(false);
      refetchPolicies();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.data?.message || "Failed to update policy");
      setTimeout(() => setErrorMessage(null), 4000);
    }
  };

  const handleClonePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const cloned = await cloneLeavePolicy({
        id: clonePolicyForm.id,
        newName: clonePolicyForm.newName,
        newCode: clonePolicyForm.newCode
      }).unwrap();
      setSuccessMessage(`Policy cloned successfully as ${cloned.policyName}`);
      setShowClonePolicyModal(false);
      refetchPolicies();
      setSelectedPolicyId(cloned.id || '');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.data?.message || "Failed to clone policy");
      setTimeout(() => setErrorMessage(null), 4000);
    }
  };

  const handleArchivePolicy = async (id: string) => {
    if (!window.confirm("Are you sure you want to archive this policy?")) return;
    try {
      await archiveLeavePolicy(id).unwrap();
      setSuccessMessage("Policy archived successfully!");
      refetchPolicies();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.data?.message || "Failed to archive policy");
      setTimeout(() => setErrorMessage(null), 4000);
    }
  };

  const handleActivatePolicy = async (id: string) => {
    try {
      await activateLeavePolicy(id).unwrap();
      setSuccessMessage("Policy activated successfully!");
      refetchPolicies();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.data?.message || "Failed to activate policy");
      setTimeout(() => setErrorMessage(null), 4000);
    }
  };

  const handleDeactivatePolicy = async (id: string) => {
    try {
      await deactivateLeavePolicy(id).unwrap();
      setSuccessMessage("Policy deactivated successfully!");
      refetchPolicies();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.data?.message || "Failed to deactivate policy");
      setTimeout(() => setErrorMessage(null), 4000);
    }
  };

  const handleDeletePolicy = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this policy? This is a soft delete and will preserve system consistency.")) return;
    try {
      await deleteLeavePolicy(id).unwrap();
      setSuccessMessage("Policy soft-deleted successfully!");
      refetchPolicies();
      setSelectedPolicyId(leavePolicies[0]?.id || '');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.data?.message || "Failed to delete policy");
      setTimeout(() => setErrorMessage(null), 4000);
    }
  };

  const handleUpdatePolicyRule = async (e: React.FormEvent) => {
    e.preventDefault();
    setImpactAction('update');
    setShowImpactDialog(true);
  };

  const submitUpdateRule = async () => {
    try {
      // First update the associated leave type if the name or code has changed
      const originalTypeDetails = leaveTypes.find(t => t.id === editRuleForm.leaveTypeId);
      if (originalTypeDetails && (originalTypeDetails.name !== editRuleForm.leaveTypeName || originalTypeDetails.code !== editRuleForm.leaveTypeCode)) {
        await updateLeaveType({
          id: editRuleForm.leaveTypeId,
          body: {
            ...originalTypeDetails,
            name: editRuleForm.leaveTypeName,
            code: editRuleForm.leaveTypeCode
          }
        }).unwrap();
      }

      await updatePolicyRule({
        ruleId: editRuleForm.id,
        body: {
          policyId: editRuleForm.policyId,
          leaveTypeId: editRuleForm.leaveTypeId,
          allocatedDays: editRuleForm.allocatedDays,
          accrualMethod: editRuleForm.accrualMethod,
          carryForwardLimit: editRuleForm.carryForwardLimit,
          encashmentAllowed: editRuleForm.encashmentAllowed,
          negativeBalanceAllowed: editRuleForm.negativeBalanceAllowed,
          noticePeriod: editRuleForm.noticePeriod,
          minServiceDays: editRuleForm.minServiceDays,
          attachmentRequired: editRuleForm.attachmentRequired,
          halfDayAllowed: editRuleForm.halfDayAllowed,
          genderEligibility: editRuleForm.genderEligibility,
          employmentTypeEligibility: editRuleForm.employmentTypeEligibility
        }
      }).unwrap();
      
      setShowEditRuleModal(false);
      setShowImpactDialog(false);
      setImpactAction(null);
      setSuccessMessage("Rule and Leave Type updated successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.data?.message || "Failed to update policy rule");
      setTimeout(() => setErrorMessage(null), 4000);
    }
  };

  const handleDeletePolicyRule = async (ruleId: string, policyId: string) => {
    if (!window.confirm("Are you sure you want to delete this rule?")) return;
    try {
      await deletePolicyRule({ ruleId, policyId }).unwrap();
      setSuccessMessage("Rule deleted successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.data?.message || "Failed to delete rule");
      setTimeout(() => setErrorMessage(null), 4000);
    }
  };

  const handleDeleteAssignment = async (assignmentId: string, policyId: string) => {
    if (!window.confirm("Are you sure you want to remove this assignment?")) return;
    try {
      await deletePolicyAssignment({ assignmentId, policyId }).unwrap();
      setSuccessMessage("Assignment removed successfully!");
      refetchAssignments();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.data?.message || "Failed to remove assignment");
      setTimeout(() => setErrorMessage(null), 4000);
    }
  };

  // Queries for active tabs
  const { data: activeCalendarDays = [] } = useGetCalendarDaysQuery(selectedCalendarId, { skip: !selectedCalendarId });
  const { data: activePolicyRules = [] } = useGetPolicyRulesQuery(selectedPolicyId, { skip: !selectedPolicyId });

  // Live Impact analysis trigger when rule form inputs change
  useEffect(() => {
    if (showEditRuleModal && editRuleForm.id && editRuleForm.leaveTypeId && selectedPolicyId) {
      triggerGetImpact({
        id: selectedPolicyId,
        newAllocatedDays: editRuleForm.allocatedDays,
        leaveTypeId: editRuleForm.leaveTypeId
      });
    }
  }, [editRuleForm.allocatedDays, editRuleForm.leaveTypeId, showEditRuleModal, selectedPolicyId]);

  useEffect(() => {
    if (showAddRuleModal && selectedPolicyId && newRule.leaveTypeId) {
      triggerGetImpact({
        id: selectedPolicyId,
        newAllocatedDays: newRule.allocatedDays,
        leaveTypeId: newRule.leaveTypeId
      });
    }
  }, [newRule.allocatedDays, newRule.leaveTypeId, showAddRuleModal, selectedPolicyId]);

  // Global click listener to close active policy 3-dot dropdown menu
  useEffect(() => {
    const handleGlobalClick = () => {
      setActivePolicyMenuId(null);
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);


  // Filter requests
  const filteredRequests = requests.filter(req => {
    if (requestFilter === 'ALL') return true;
    if (requestFilter === 'PENDING') return req.status?.startsWith('PENDING');
    return req.status === requestFilter;
  });

  const colors = [
    'from-blue-600 to-indigo-600',
    'from-emerald-600 to-teal-600',
    'from-amber-600 to-orange-600',
    'from-rose-600 to-pink-600',
    'from-violet-600 to-purple-600'
  ];

  const calculateDaysCount = (start: string, end: string, halfDay: boolean) => {
    if (!start || !end) return 0;
    if (halfDay) return 0.5;
    let s = new Date(start);
    let e = new Date(end);
    if (e < s) return 0;
    
    let count = 0;
    let cur = new Date(s);
    while (cur <= e) {
      const dayOfWeek = cur.getDay(); // 0 is Sunday, 6 is Saturday
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      const dateStr = cur.toISOString().split('T')[0];
      const isHoliday = activeCalendarDays.some(h => h.holidayDate === dateStr && !h.optionalHoliday);

      if (!isWeekend && !isHoliday) {
        count++;
      }
      cur.setDate(cur.getDate() + 1);
    }
    return count;
  };

  const selectedBalance = balances.find(b => b.leaveTypeId === newRequest.leaveTypeId);
  const availableBalance = selectedBalance ? selectedBalance.balance : 0;
  const requestedDays = calculateDaysCount(newRequest.startDate, newRequest.endDate, newRequest.halfDay);
  const remainingBalance = availableBalance - requestedDays;



  if (isEmployeesLoading || isTypesLoading || isBalancesLoading || isRequestsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Dynamic Tabs List based on role
  const tabs = isAdminOrManager 
    ? [
        { id: 'dashboard', label: 'Executive Dashboard', icon: Sliders },
        { id: 'applyWorkspace', label: 'Apply Leave Workspace', icon: Send },
        { id: 'wallet', label: 'My Wallet & Accruals', icon: IndianRupee },
        { id: 'requests', label: 'Leave History', icon: History },
        { id: 'teamCalendar', label: 'Team Capacity', icon: Calendar },
        { id: 'approvalCenter', label: 'Approval Inbox', icon: UserCheck },
        { id: 'holidayCalendars', label: 'Holiday Calendars', icon: MapPin },
        { id: 'policyRules', label: 'Policy Setup', icon: Shield },
        { id: 'leaveTypesAdmin', label: 'Leave Types Admin', icon: Briefcase },
        { id: 'leaveBalancesAdmin', label: 'Leave Balances Admin', icon: Users },
        { id: 'auditLogs', label: 'Audit Trail', icon: FileText },
        { id: 'compOff', label: 'Comp-Off Wallet', icon: Clock },
        { id: 'analytics', label: 'Predictive Analytics', icon: TrendingUp }
      ]
    : [
        { id: 'dashboard', label: 'Leave Dashboard', icon: Sliders },
        { id: 'applyWorkspace', label: 'Apply Leave Workspace', icon: Send },
        { id: 'wallet', label: 'Leave Balance Wallet', icon: IndianRupee },
        { id: 'requests', label: 'My Requests', icon: History },
        { id: 'teamCalendar', label: 'Team Calendar', icon: Calendar },
        { id: 'holidayCalendars', label: 'Holiday Calendar', icon: MapPin },
        { id: 'compOff', label: 'Comp-Off Requests', icon: Clock },
        { id: 'encashment', label: 'Leave Encashment', icon: Percent }
      ];

  return (
    <div className="space-y-6 animate-fade-in p-6 w-full max-w-none text-surface-900 dark:text-white">
      {/* Executive Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-gradient-to-r from-surface-50 to-surface-100 dark:from-surface-900 dark:to-surface-850 p-6 rounded-2xl border border-surface-200 dark:border-surface-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-primary-100 text-primary-800 dark:bg-primary-950/40 dark:text-primary-400 text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">Leave Cockpit</span>
            <span className="text-xs text-surface-400 font-medium">Tenant: Acme Corporation</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mt-1.5">{isAdminOrManager ? "Absence & Leave Planner" : "My Leave Portal"}</h1>
          <p className="text-sm text-surface-500 mt-1">
            Active Digital Twin: <span className="font-semibold text-primary-600 dark:text-primary-400">{currentEmployee ? `${currentEmployee.firstName} ${currentEmployee.lastName} (${currentEmployee.employeeCode})` : 'Guest User'}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => setActiveTab('applyWorkspace')}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md shadow-primary-600/20 hover:shadow-lg"
          >
            <Plus className="w-4 h-4" /> Apply Leave
          </button>
          {isAdminOrManager && (
            <button 
              onClick={() => recalculateBalances({ employeeId: employeeId || '', action: 'recalculate' })}
              className="flex items-center gap-2 bg-surface-200 hover:bg-surface-300 dark:bg-surface-800 dark:hover:bg-surface-700 text-surface-800 dark:text-surface-200 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border border-surface-300 dark:border-surface-700"
            >
              Recalculate Balances
            </button>
          )}
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30 rounded-xl text-sm font-medium animate-bounce">
          {successMessage}
        </div>
      )}

      {/* Primary Tab Navigation */}
      <div className="border-b border-surface-200 dark:border-surface-800 flex flex-wrap gap-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all outline-none ${
              activeTab === tab.id
                ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400 font-bold'
                : 'border-transparent text-surface-500 hover:text-surface-700 dark:hover:text-white hover:border-surface-300'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panel */}
      <div className="min-h-[400px]">

        {/* APPLY LEAVE WORKSPACE TAB */}
        {activeTab === 'applyWorkspace' && (
          <div className="space-y-6 animate-fade-in">
            {/* Top Workspace Header */}
            <div className="flex justify-between items-center bg-white dark:bg-surface-850 p-5 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm">
              <div>
                <h2 className="text-xl font-bold">New Leave Request Workspace</h2>
                <p className="text-xs text-surface-500 font-semibold mt-0.5">
                  Complete your leave details below. The system automatically resolves policy rules, workflows, team capacity constraints, and audits.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('dashboard')}
                className="px-4 py-2 border border-surface-200 dark:border-surface-750 font-bold rounded-xl text-xs hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>

            {/* Error and Success messages */}
            {errorMessage && (
              <div className="p-3.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 rounded-xl flex items-start gap-2.5 text-rose-600 dark:text-rose-400 text-xs font-bold">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {balances.length === 0 && (
              <div className="p-3.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl flex items-start gap-2.5 text-amber-600 dark:text-amber-400 text-xs font-bold">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Warning: No leave balances loaded. Please initialize your leave wallet before submitting requests.</span>
              </div>
            )}

            {/* Main Two-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* LEFT SIDE: Request Form, Impact, Compliance & Recent Audits */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* 1. Leave Request Form Card */}
                <div className="bg-white dark:bg-surface-850 border border-surface-200 dark:border-surface-800 rounded-2xl p-6 shadow-sm space-y-5">
                  <div className="flex items-center gap-2 border-b border-surface-100 dark:border-surface-750 pb-3">
                    <div className="p-1.5 bg-primary-50 dark:bg-primary-950/30 rounded-lg text-primary-600">
                      <FileText className="w-4.5 h-4.5" />
                    </div>
                    <h3 className="font-bold text-sm uppercase tracking-wider">1. Leave Request Details</h3>
                  </div>

                  <form onSubmit={handleApplyLeave} className="space-y-4 text-xs font-semibold text-surface-550">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="uppercase tracking-wider">Leave Type</label>
                        <select 
                          value={newRequest.leaveTypeId}
                          onChange={e => setNewRequest({ ...newRequest, leaveTypeId: e.target.value })}
                          className="w-full mt-1.5 px-3.5 py-2.5 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500/20 text-surface-800 dark:text-surface-200 font-bold"
                        >
                          {leaveTypes.map(t => (
                            <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-end pb-2">
                        <label className="flex items-center gap-2.5 select-none cursor-pointer">
                          <input 
                            type="checkbox"
                            checked={newRequest.halfDay}
                            onChange={e => setNewRequest({ ...newRequest, halfDay: e.target.checked })}
                            className="rounded border-surface-200 dark:border-surface-700 text-primary-600 focus:ring-primary-500/25 w-4 h-4"
                          />
                          <span className="uppercase tracking-wider">Request as Half Day</span>
                        </label>
                      </div>
                    </div>

                      <div>
                        <DatePicker
                          label="Start Date"
                          value={newRequest.startDate}
                          onChange={v => setNewRequest({ ...newRequest, startDate: v })}
                          required
                        />
                      </div>
                      <div>
                        <DatePicker
                          label="End Date"
                          value={newRequest.endDate}
                          onChange={v => setNewRequest({ ...newRequest, endDate: v })}
                          required
                        />
                      </div>

                    {newRequest.halfDay && (
                      <div>
                        <label className="uppercase tracking-wider">Half Day Session</label>
                        <select
                          value={newRequest.halfDayType}
                          onChange={e => setNewRequest({ ...newRequest, halfDayType: e.target.value as any })}
                          className="w-full mt-1.5 px-3.5 py-2.5 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl text-sm outline-none text-surface-800 dark:text-surface-200 font-bold"
                        >
                          <option value="FIRST_HALF">First Session (Morning)</option>
                          <option value="SECOND_HALF">Second Session (Afternoon)</option>
                        </select>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="uppercase tracking-wider">Reason for absence</label>
                        <textarea 
                          required
                          rows={3}
                          placeholder="Enter detailed reason..."
                          value={newRequest.reason}
                          onChange={e => setNewRequest({ ...newRequest, reason: e.target.value })}
                          className="w-full mt-1.5 px-3.5 py-2.5 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500/20 text-surface-800 dark:text-surface-200 font-medium"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="uppercase tracking-wider">Attachment (Mandatory for medical/sick leave)</label>
                        <div className="border-2 border-dashed border-surface-200 dark:border-surface-700 hover:border-primary-500 dark:hover:border-primary-500 rounded-xl p-4 flex flex-col items-center justify-center gap-1.5 transition-all bg-surface-50/40 dark:bg-surface-900/40 relative cursor-pointer group">
                          <input
                            type="file"
                            onChange={e => setNewRequest({ ...newRequest, attachmentName: e.target.files?.[0]?.name || '' })}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          />
                          <FileText className="w-7 h-7 text-surface-400 group-hover:text-primary-500 transition-colors" />
                          <span className="text-xs font-bold text-surface-700 dark:text-surface-300">
                            {newRequest.attachmentName ? newRequest.attachmentName : "Upload Attachment File"}
                          </span>
                          <span className="text-[10px] text-surface-400">PDF, PNG, JPG up to 10MB</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-surface-100 dark:border-surface-750">
                      <button 
                        type="button"
                        onClick={() => setActiveTab('dashboard')}
                        className="px-6 py-2.5 border border-surface-200 dark:border-surface-700 font-bold rounded-xl hover:bg-surface-50 dark:hover:bg-surface-750 transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        disabled={isApplying || balances.length === 0}
                        className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-md shadow-primary-600/10 hover:shadow-lg flex items-center justify-center gap-1.5"
                      >
                        <Send className="w-4 h-4" /> Submit Leave Request
                      </button>
                    </div>
                  </form>
                </div>

                {/* 2. Leave Impact Summary & Compliance Rules */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Leave Impact Card */}
                  <div className="bg-white dark:bg-surface-850 border border-surface-200 dark:border-surface-800 rounded-2xl p-5 shadow-sm space-y-4">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-surface-400 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4" /> Leave Impact Summary
                    </h3>
                    
                    <div className="bg-surface-50 dark:bg-surface-900 p-4 rounded-xl border border-surface-250 dark:border-surface-750 space-y-3 text-xs font-semibold">
                      <div className="flex justify-between">
                        <span className="text-surface-450">Requested Duration:</span>
                        <span className="text-primary-600 dark:text-primary-400 font-bold">{requestedDays} Days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-surface-450">Current Balance:</span>
                        <span className="text-surface-800 dark:text-white font-bold">{availableBalance} Days</span>
                      </div>
                      <div className="flex justify-between border-t border-surface-150 dark:border-surface-800 pt-2.5">
                        <span className="text-surface-450">Estimated Balance Post-Approval:</span>
                        <span className={`${remainingBalance < 0 ? 'text-rose-500 font-extrabold' : 'text-emerald-500'} font-bold`}>
                          {remainingBalance} Days
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-150 dark:border-indigo-900/30 rounded-xl text-[11px] text-indigo-700 dark:text-indigo-400 font-semibold space-y-1">
                      <p className="font-bold uppercase tracking-wider text-indigo-800 dark:text-indigo-300">Attendance & Payroll Impact</p>
                      <p>• Will update Attendance Sheet automatically for {requestedDays} days.</p>
                      <p>• {remainingBalance < 0 ? 'Will trigger loss of pay (LOP) deduction rules.' : 'Will be marked as fully paid absence.'}</p>
                    </div>
                  </div>

                  {/* Compliance Rules Card */}
                  <div className="bg-white dark:bg-surface-850 border border-surface-200 dark:border-surface-800 rounded-2xl p-5 shadow-sm space-y-4">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-surface-400 flex items-center gap-1.5">
                      <Shield className="w-4 h-4" /> Compliance Rules & Validations
                    </h3>
                    
                    <div className="space-y-3.5 text-xs">
                      {[
                        { 
                          name: 'Overlap Check', 
                          status: teamAvailability?.overlapCount > 0 ? 'WARNING' : 'PASSED',
                          desc: teamAvailability?.overlapCount > 0 ? `${teamAvailability.overlapCount} department overlap(s) found.` : 'No overlapping department leaves.' 
                        },
                        { 
                          name: 'Balance Sufficiency', 
                          status: remainingBalance < 0 ? 'WARNING' : 'PASSED',
                          desc: remainingBalance < 0 ? 'Balance will go negative. Subject to policy override.' : 'Sufficient balance available.' 
                        },
                        { 
                          name: 'Attachment Requirement', 
                          status: (newRequest.leaveTypeId && leaveTypes.find(t => t.id === newRequest.leaveTypeId)?.requiresDocument && requestedDays >= 2 && !newRequest.attachmentName) ? 'REQUIRED' : 'PASSED',
                          desc: 'Medical cert needed for Sick Leave exceeding 2 days.' 
                        },
                        {
                          name: 'Notice Period Enforcement',
                          status: 'PASSED',
                          desc: 'Required notice for planned absences satisfied.'
                        }
                      ].map((rule, idx) => (
                        <div key={idx} className="flex justify-between items-start gap-4">
                          <div>
                            <p className="font-bold text-surface-800 dark:text-surface-200">{rule.name}</p>
                            <p className="text-[10px] text-surface-450 mt-0.5">{rule.desc}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded font-extrabold uppercase tracking-wider text-[9px] ${
                            rule.status === 'PASSED' 
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20' 
                              : rule.status === 'REQUIRED'
                              ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/20'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/20'
                          }`}>
                            {rule.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Audit Trail Card */}
                <div className="bg-white dark:bg-surface-850 border border-surface-200 dark:border-surface-800 rounded-2xl p-5 shadow-sm space-y-4">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-surface-400 flex items-center gap-1.5">
                    <History className="w-4.5 h-4.5" /> Recent Leave Request Audit History
                  </h3>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="text-surface-400 border-b border-surface-100 dark:border-surface-800 font-bold uppercase tracking-wider pb-2">
                          <th className="py-2.5">Date</th>
                          <th>Action</th>
                          <th>Performed By</th>
                          <th>IP Address</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-100 dark:divide-surface-800 font-semibold text-surface-550">
                        {auditLogs.map((logItem, idx) => (
                          <tr key={idx} className="hover:bg-surface-50/30 dark:hover:bg-surface-800/10">
                            <td className="py-2.5 font-mono">{logItem.time}</td>
                            <td className="font-bold text-surface-800 dark:text-white">{logItem.action}</td>
                            <td>{logItem.user}</td>
                            <td className="font-mono text-surface-400">{logItem.ip}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

              {/* RIGHT SIDE: Balances, Policy details & Workflow Previews */}
              <div className="space-y-6">
                
                {/* Leave Balance Summary Card */}
                <div className="bg-white dark:bg-surface-850 border border-surface-200 dark:border-surface-800 rounded-2xl p-5 shadow-sm space-y-4">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-surface-400 flex items-center gap-1.5">
                    <IndianRupee className="w-4 h-4" /> Leave Balance Wallet Summary
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    {leaveTypes.map(t => {
                      const bal = balances.find(b => b.leaveTypeId === t.id);
                      const isSelected = newRequest.leaveTypeId === t.id;
                      return (
                        <div 
                          key={t.id} 
                          onClick={() => setNewRequest({ ...newRequest, leaveTypeId: t.id })}
                          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                            isSelected 
                              ? 'bg-primary-50/40 dark:bg-primary-950/20 border-primary-500' 
                              : 'bg-surface-50 dark:bg-surface-900 border-surface-200 dark:border-surface-800 hover:bg-surface-100/50'
                          }`}
                        >
                          <p className="text-[10px] text-surface-450 uppercase font-bold tracking-wider truncate">{t.name}</p>
                          <p className="text-lg font-black mt-1 text-surface-800 dark:text-white">
                            {t.code === 'LOP' ? 'Unlimited' : `${bal ? bal.balance : 0} d`}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Policy Information Card */}
                <div className="bg-white dark:bg-surface-850 border border-surface-200 dark:border-surface-800 rounded-2xl p-5 shadow-sm space-y-4">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-surface-400 flex items-center gap-1.5">
                    <Shield className="w-4 h-4" /> Selected Leave Policy Rules
                  </h3>

                  {newRequest.leaveTypeId ? (() => {
                    const selType = leaveTypes.find(t => t.id === newRequest.leaveTypeId);
                    
                    if (!selType) return <p className="text-xs text-surface-400">Select a leave type</p>;
                    
                    return (
                      <div className="space-y-3.5 text-xs font-semibold">
                        <div className="flex justify-between">
                          <span className="text-surface-450">Notice Period Required:</span>
                          <span className="text-surface-800 dark:text-white font-bold">{selType.minDaysNotice || 0} Days</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-surface-450">Maximum Consecutive Days:</span>
                          <span className="text-surface-800 dark:text-white font-bold">{selType.maxConsecutiveDays || 'No Limit'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-surface-450">Negative Balance Allowed:</span>
                          <span className="text-surface-800 dark:text-white font-bold">
                            {selType.negativeBalanceAllowed ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-surface-450">Carry Forward Days:</span>
                          <span className="text-surface-800 dark:text-white font-bold">
                            {selType.carryForwardAllowed ? `Yes (Max ${selType.maxCarryForwardDays}d)` : 'No'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-surface-450">Document Mandatory:</span>
                          <span className="text-surface-800 dark:text-white font-bold">
                            {selType.requiresDocument ? 'Yes (exceeding 2d)' : 'No'}
                          </span>
                        </div>
                        {resolvedPolicy?.policy && (
                          <div className="border-t border-surface-100 dark:border-surface-800 pt-2 mt-2">
                            <span className="text-[10px] text-surface-450 font-bold uppercase tracking-wider">Active Assigned Policy</span>
                            <p className="text-xs font-bold text-primary-600 dark:text-primary-400 mt-0.5">{resolvedPolicy.policy.policyName}</p>
                            <p className="text-[10px] text-surface-400 font-medium mt-0.5">{resolvedPolicy.policy.description}</p>
                          </div>
                        )}
                      </div>
                    );
                  })() : (
                    <p className="text-xs text-surface-400">Please select a leave type above to load policy rules.</p>
                  )}
                </div>

                {/* Approval Workflow Preview Card */}
                <div className="bg-white dark:bg-surface-850 border border-surface-200 dark:border-surface-800 rounded-2xl p-5 shadow-sm space-y-4">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-surface-400 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4" /> Approval Workflow Preview
                  </h3>

                  {workflowPreview ? (
                    <div className="space-y-4">
                      {/* Approver chain steps */}
                      <div className="relative border-l border-surface-200 dark:border-surface-750 ml-3 pl-5 space-y-4 text-xs font-semibold">
                        {workflowPreview.steps?.map((step: any, index: number) => (
                          <div key={index} className="relative">
                            {/* Blue dot indicator */}
                            <div className="absolute -left-[25.5px] top-0.5 w-3 h-3 bg-primary-600 rounded-full border-2 border-white dark:border-surface-850 shadow-sm" />
                            <p className="text-[10px] uppercase text-surface-450 font-bold tracking-wider">Level {step.levelNumber} Approver ({step.approverType})</p>
                            <p className="text-xs font-bold text-surface-800 dark:text-white mt-0.5">{step.approverName}</p>
                            <p className="text-[10px] font-mono text-surface-400 mt-0.5">{step.approverEmail}</p>
                          </div>
                        ))}
                      </div>

                      <div className="bg-surface-50 dark:bg-surface-900/50 p-3 rounded-xl border border-surface-150 dark:border-surface-800 space-y-2 text-[10px] font-bold text-surface-500 uppercase tracking-wider">
                        <div className="flex justify-between">
                          <span>Workflow SLA:</span>
                          <span className="text-surface-800 dark:text-white">{workflowPreview.slaHours || '72 Hours'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Escalation Path:</span>
                          <span className="text-surface-800 dark:text-white">{workflowPreview.escalationPath || 'Skip Manager'}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-surface-400">Loading approval workflow rules...</p>
                  )}
                </div>

                {/* Team Availability Card */}
                <div className="bg-white dark:bg-surface-850 border border-surface-200 dark:border-surface-800 rounded-2xl p-5 shadow-sm space-y-4">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-surface-400 flex items-center gap-1.5">
                    <Users className="w-4.5 h-4.5" /> Team Availability Panel
                  </h3>

                  <div className="space-y-3.5 text-xs font-semibold">
                    <div className="flex justify-between">
                      <span className="text-surface-450">Active Employees On Leave Today:</span>
                      <span className="text-surface-800 dark:text-white font-bold">{teamAvailability?.todayOnLeave || 0} Employees</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-surface-450">Requested Period Overlap:</span>
                      <span className={`${teamAvailability?.overlapCount > 0 ? 'text-amber-600 font-bold' : 'text-surface-800 dark:text-white'}`}>
                        {teamAvailability?.overlapCount || 0} Employees
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-surface-450">Department Capacity Impact:</span>
                      <span className={`px-2 py-0.5 rounded font-extrabold uppercase text-[9px] tracking-wider ${
                        teamAvailability?.capacityImpact === 'High' 
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/20' 
                          : teamAvailability?.capacityImpact === 'Medium'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/20'
                          : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20'
                      }`}>
                        {teamAvailability?.capacityImpact || 'Low'}
                      </span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* TAB 1: EXECUTIVE/EMPLOYEE DASHBOARD */}
        {activeTab === 'dashboard' && (
          isAdminOrManager ? (
            <div className="space-y-6">
              {/* KPI Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  { label: 'Leave Utilization Rate', value: '68.2%', change: '+3.4% YoY', icon: Percent, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/20' },
                  { label: 'Leave Liability Cost', value: formatCurrency(124500), change: 'Accrued liability', icon: IndianRupee, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20' },
                  { label: 'Carry Forward Exposure', value: formatCurrency(42300), change: 'Expires Dec 31', icon: Clock, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/20' },
                  { label: 'Avg Approval SLA / Compliance', value: '14.5 hrs / 94%', change: 'SLA target met', icon: TrendingUp, color: 'text-teal-600 bg-teal-50 dark:bg-teal-950/20' }
                ].map((kpi, idx) => (
                  <div key={idx} className="bg-white dark:bg-surface-850 p-5 rounded-xl border border-surface-200 dark:border-surface-800 flex items-center justify-between hover:shadow-md transition-all">
                    <div>
                      <p className="text-xs text-surface-400 font-bold uppercase tracking-wider">{kpi.label}</p>
                      <p className="text-2xl font-extrabold mt-1.5">{kpi.value}</p>
                      <span className="text-[11px] text-surface-550 dark:text-surface-400 font-medium block mt-1">{kpi.change}</span>
                    </div>
                    <div className={`p-3 rounded-xl ${kpi.color}`}>
                      <kpi.icon className="w-5 h-5" />
                    </div>
                  </div>
                ))}
              </div>

              {/* SLA Radial Representation / Visualizations */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* SLA Compliance Gauge */}
                <div className="bg-white dark:bg-surface-850 p-5 rounded-xl border border-surface-200 dark:border-surface-800 space-y-4">
                  <h3 className="font-bold text-sm uppercase tracking-wider text-surface-400">Approval SLA Targets</h3>
                  <div className="flex flex-col items-center justify-center py-4">
                    {/* Custom SVG Radial Gauge */}
                    <svg className="w-32 h-32" viewBox="0 0 36 36">
                      <path
                        className="text-surface-100 dark:text-surface-800"
                        strokeWidth="3"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-primary-600 dark:text-primary-400"
                        strokeDasharray="94, 100"
                        strokeWidth="3.2"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="text-center mt-3">
                      <p className="text-3xl font-extrabold text-surface-800 dark:text-white">94%</p>
                      <p className="text-xs text-surface-550 dark:text-surface-400 font-semibold mt-0.5">SLA Compliance Index</p>
                    </div>
                  </div>
                </div>

                {/* Monthly Liability Trend Bar Chart representation */}
                <div className="lg:col-span-2 bg-white dark:bg-surface-850 p-5 rounded-xl border border-surface-200 dark:border-surface-800 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-sm uppercase tracking-wider text-surface-400">Accrued Liability Trend</h3>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded">Fiscal 2026</span>
                  </div>
                  
                  {/* Custom Flex Bar Graph */}
                  <div className="flex items-end justify-between h-40 pt-4 px-2">
                    {[
                      { month: 'Jan', val: 40 }, { month: 'Feb', val: 55 }, { month: 'Mar', val: 68 },
                      { month: 'Apr', val: 80 }, { month: 'May', val: 95 }, { month: 'Jun', val: 120 }
                    ].map((data, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-2 w-12">
                        <div className="relative w-full bg-surface-100 dark:bg-surface-800 rounded-lg overflow-hidden group" style={{ height: '110px' }}>
                          <div 
                            className="absolute bottom-0 w-full bg-gradient-to-t from-primary-600 to-indigo-500 rounded-t-lg transition-all group-hover:opacity-90"
                            style={{ height: `${data.val}%` }}
                          >
                            <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-surface-900 text-white text-[9px] px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                              {getCurrencySymbol()}{data.val}k
                            </span>
                          </div>
                        </div>
                        <span className="text-xs text-surface-400 font-semibold">{data.month}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Attendance & Holidays Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Who is on Leave Today */}
                <div className="bg-white dark:bg-surface-850 p-5 rounded-xl border border-surface-200 dark:border-surface-800 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-base">On Leave Today ({leavesToday.length})</h3>
                    <Users className="w-4 h-4 text-surface-400" />
                  </div>
                  <div className="divide-y divide-surface-100 dark:divide-surface-750">
                    {leavesToday.map((emp, idx) => (
                      <div key={idx} className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full ${emp.color} flex items-center justify-center text-white text-xs font-bold`}>
                            {emp.avatar}
                          </div>
                          <div>
                            <p className="text-sm font-bold">{emp.name}</p>
                            <p className="text-[11px] text-surface-550 dark:text-surface-400 font-medium">{emp.dept} • {emp.code}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold bg-surface-100 dark:bg-surface-800 px-2 py-0.5 rounded text-surface-600">{emp.type}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upcoming Holidays */}
                <div className="bg-white dark:bg-surface-850 p-5 rounded-xl border border-surface-200 dark:border-surface-800 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-base font-sans">Upcoming Holidays</h3>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-surface-450" />
                      <select
                        value={selectedCalendarId}
                        onChange={e => setSelectedCalendarId(e.target.value)}
                        className="bg-surface-50 dark:bg-surface-800 border-none text-xs rounded font-bold px-1.5 py-0.5 outline-none"
                      >
                        {holidayCalendars.map(cal => (
                          <option key={cal.id} value={cal.id}>{cal.calendarName}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {activeCalendarDays.slice(0, 3).map((day, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 rounded-lg bg-surface-50/50 dark:bg-surface-800/10">
                        <div>
                          <p className="text-sm font-bold">{day.holidayName}</p>
                          <p className="text-xs text-surface-500 font-semibold mt-0.5">{day.holidayDate}</p>
                        </div>
                        <span className="text-[10px] bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                          {day.holidayType}
                        </span>
                      </div>
                    ))}
                    {activeCalendarDays.length === 0 && (
                      <p className="text-xs text-surface-400 italic text-center py-4">No holidays setup for this calendar.</p>
                    )}
                  </div>
                </div>

                {/* Burnout Risk Alerts */}
                <div className="bg-white dark:bg-surface-850 p-5 rounded-xl border border-surface-200 dark:border-surface-800 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-base text-rose-500 flex items-center gap-1.5"><AlertTriangle className="w-4 h-4" /> Burnout & Liability Risks</h3>
                  </div>
                  <div className="space-y-3">
                    {burnoutRisk.map((risk, idx) => (
                      <div key={idx} className="p-3 border border-rose-100 dark:border-rose-950/20 rounded-lg bg-rose-50/20 dark:bg-rose-950/5 space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold">{risk.name} ({risk.code})</span>
                          <span className="text-[10px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded">{risk.balance} days left</span>
                        </div>
                        <p className="text-[10px] text-surface-500 mt-1 font-semibold">{risk.status}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Welcome Banner Card */}
              <div className="bg-gradient-to-r from-blue-600 via-indigo-650 to-purple-700 text-white p-6 rounded-2xl border border-indigo-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl shadow-indigo-500/10">
                <div>
                  <h2 className="text-2xl font-extrabold tracking-tight">Welcome, {currentUser?.name || 'Employee'}!</h2>
                  <p className="text-sm text-indigo-100/90 mt-1 font-medium">Plan your absences, view holiday calendars, and manage leave requests seamlessly from your self-service portal.</p>
                </div>
                <button
                  onClick={() => setShowRequestModal(true)}
                  className="bg-white text-indigo-950 hover:bg-indigo-50 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md shrink-0 flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Apply Leave
                </button>
              </div>

              {/* Employee KPI Widgets Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* 1. Available Leave Balance */}
                <div className="bg-white dark:bg-surface-850 p-5 rounded-xl border border-surface-200 dark:border-surface-800 flex items-center justify-between hover:shadow-md transition-all">
                  <div>
                    <p className="text-xs text-surface-400 font-bold uppercase tracking-wider">Available Leave</p>
                    <p className="text-2xl font-extrabold mt-1.5">{balances.reduce((sum, b) => sum + b.balance, 0)} Days</p>
                    <span className="text-[11px] text-surface-550 dark:text-surface-400 font-medium block mt-1">Across all leave categories</span>
                  </div>
                  <div className="p-3 rounded-xl text-primary-600 bg-primary-50 dark:bg-primary-950/20">
                    <IndianRupee className="w-5 h-5" />
                  </div>
                </div>

                {/* 2. Pending Requests */}
                <div className="bg-white dark:bg-surface-850 p-5 rounded-xl border border-surface-200 dark:border-surface-800 flex items-center justify-between hover:shadow-md transition-all">
                  <div>
                    <p className="text-xs text-surface-400 font-bold uppercase tracking-wider">Pending Requests</p>
                    <p className="text-2xl font-extrabold mt-1.5">{requests.filter(r => r.status?.startsWith('PENDING')).length} Pending</p>
                    <span className="text-[11px] text-surface-550 dark:text-surface-400 font-medium block mt-1">Awaiting approval routing</span>
                  </div>
                  <div className="p-3 rounded-xl text-amber-600 bg-amber-50 dark:bg-amber-950/20">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>

                {/* 3. Upcoming Holidays */}
                <div className="bg-white dark:bg-surface-850 p-5 rounded-xl border border-surface-200 dark:border-surface-800 flex items-center justify-between hover:shadow-md transition-all">
                  <div>
                    <p className="text-xs text-surface-400 font-bold uppercase tracking-wider">Upcoming Holiday</p>
                    <p className="text-base font-extrabold mt-2 truncate max-w-[160px]">
                      {activeCalendarDays.filter(h => new Date(h.holidayDate) >= new Date())
                        .sort((a, b) => new Date(a.holidayDate).getTime() - new Date(b.holidayDate).getTime())[0]?.holidayName || 'None Scheduled'}
                    </p>
                    <span className="text-[11px] text-surface-550 dark:text-surface-400 font-medium block mt-1 font-mono">
                      {activeCalendarDays.filter(h => new Date(h.holidayDate) >= new Date())
                        .sort((a, b) => new Date(a.holidayDate).getTime() - new Date(b.holidayDate).getTime())[0]?.holidayDate || 'Public Holiday'}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20">
                    <MapPin className="w-5 h-5" />
                  </div>
                </div>

                {/* 4. Team Members On Leave */}
                <div className="bg-white dark:bg-surface-850 p-5 rounded-xl border border-surface-200 dark:border-surface-800 flex items-center justify-between hover:shadow-md transition-all">
                  <div>
                    <p className="text-xs text-surface-400 font-bold uppercase tracking-wider">Colleagues On Leave</p>
                    <p className="text-2xl font-extrabold mt-1.5">{leavesToday.length} Out Today</p>
                    <span className="text-[11px] text-surface-550 dark:text-surface-400 font-medium block mt-1">Active team absences</span>
                  </div>
                  <div className="p-3 rounded-xl text-indigo-600 bg-indigo-50 dark:bg-indigo-950/20">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Two Column Layout below */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Columns: Leave Wallets & History */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Balance Overview Widget */}
                  <div className="bg-white dark:bg-surface-850 p-5 rounded-xl border border-surface-200 dark:border-surface-800 space-y-4">
                    <h3 className="font-bold text-base">Your Active Leave Balances</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {balances.slice(0, 4).map((b) => {
                        const typeDetails = leaveTypes.find(t => t.id === b.leaveTypeId);
                        const percent = b.totalAllocated > 0 ? (b.totalUsed / b.totalAllocated) * 100 : 0;
                        return (
                          <div key={b.id} className="p-4 border border-surface-200 dark:border-surface-750 rounded-xl space-y-2">
                            <div className="flex justify-between items-center">
                              <h4 className="font-bold text-sm text-surface-800 dark:text-white">{typeDetails?.name || 'Leave Type'}</h4>
                              <span className="text-xs font-mono font-bold text-primary-600 dark:text-primary-400">{b.balance} left</span>
                            </div>
                            <div className="w-full bg-surface-100 dark:bg-surface-800 h-2 rounded-full overflow-hidden">
                              <div className="bg-primary-600 h-full rounded-full" style={{ width: `${Math.min(100, percent)}%` }} />
                            </div>
                            <div className="flex justify-between text-[10px] text-surface-500 font-semibold">
                              <span>Used: {b.totalUsed} Days</span>
                              <span>Allocated: {b.totalAllocated} Days</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Pending Requests Widget */}
                  <div className="bg-white dark:bg-surface-850 p-5 rounded-xl border border-surface-200 dark:border-surface-800 space-y-4">
                    <div className="flex justify-between items-center border-b border-surface-100 dark:border-surface-750 pb-3">
                      <h3 className="font-bold text-base">Active Requests</h3>
                      <button onClick={() => setActiveTab('requests')} className="text-xs text-primary-600 hover:underline font-bold">View History</button>
                    </div>
                    <div className="space-y-3">
                      {requests.filter(r => r.status?.startsWith('PENDING')).map(req => {
                        const typeDetails = leaveTypes.find(t => t.id === req.leaveTypeId);
                        return (
                          <div key={req.id} className="p-4 border border-surface-200 dark:border-surface-750 rounded-xl flex items-center justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-sm text-surface-800 dark:text-white">{typeDetails?.name}</h4>
                                <span className="text-xs bg-surface-100 dark:bg-surface-800 px-2 py-0.5 rounded text-surface-600 font-bold">{req.daysCount} Days</span>
                              </div>
                              <p className="text-xs text-surface-500 mt-1 font-semibold">{req.startDate} to {req.endDate}</p>
                              <p className="text-xs text-surface-450 italic mt-0.5">"{req.reason}"</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-xs bg-amber-50 text-amber-700 dark:bg-amber-950/20 px-2.5 py-1 rounded-full font-bold">{req.status}</span>
                              <button 
                                onClick={() => handleAction(req.id!, 'CANCELLED')}
                                className="px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 rounded-lg font-bold transition-all"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        );
                      })}
                      {requests.filter(r => r.status?.startsWith('PENDING')).length === 0 && (
                        <p className="text-xs text-surface-400 italic py-4 text-center">You have no active pending leave requests.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column: Upcoming Holidays & Team Absences */}
                <div className="space-y-6">
                  {/* Calendar/Holiday Widget */}
                  <div className="bg-white dark:bg-surface-850 p-5 rounded-xl border border-surface-200 dark:border-surface-800 space-y-4">
                    <h3 className="font-bold text-base">Upcoming Holidays</h3>
                    <div className="space-y-3">
                      {activeCalendarDays
                        .filter(h => new Date(h.holidayDate) >= new Date())
                        .sort((a, b) => new Date(a.holidayDate).getTime() - new Date(b.holidayDate).getTime())
                        .slice(0, 4)
                        .map((day, idx) => (
                          <div key={idx} className="flex justify-between items-center p-3 rounded-lg bg-surface-50/50 dark:bg-surface-800/10">
                            <div>
                              <p className="text-sm font-bold">{day.holidayName}</p>
                              <p className="text-xs text-surface-500 font-semibold mt-0.5 font-mono">{day.holidayDate}</p>
                            </div>
                            <span className="text-[10px] bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                              {day.holidayType}
                            </span>
                          </div>
                        ))}
                      {activeCalendarDays.length === 0 && (
                        <p className="text-xs text-surface-400 italic text-center py-4">No holidays setup for this calendar.</p>
                      )}
                    </div>
                  </div>

                  {/* Team Outages Today */}
                  <div className="bg-white dark:bg-surface-850 p-5 rounded-xl border border-surface-200 dark:border-surface-800 space-y-4">
                    <h3 className="font-bold text-base">On Leave Today ({leavesToday.length})</h3>
                    <div className="divide-y divide-surface-100 dark:divide-surface-750">
                      {leavesToday.map((emp, idx) => (
                        <div key={idx} className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full ${emp.color} flex items-center justify-center text-white text-xs font-bold`}>
                              {emp.avatar}
                            </div>
                            <div>
                              <p className="text-sm font-bold">{emp.name}</p>
                              <p className="text-[11px] text-surface-500 font-semibold">{emp.dept}</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold bg-surface-100 dark:bg-surface-800 px-2 py-0.5 rounded text-surface-600">{emp.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        )}

        {/* TAB 2: MY LEAVE WALLET */}
        {activeTab === 'wallet' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">Your Available Balances ({currentYear})</h2>
              <button 
                onClick={() => setShowEncashModal(true)}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md shadow-emerald-600/10"
              >
                Request Encashment
              </button>
            </div>

            {balances.length === 0 ? (
              <div className="bg-white dark:bg-surface-850 rounded-xl border border-surface-200 dark:border-surface-800 p-8 text-center text-surface-400">
                No leave balance records discovered. Requesting your first leave will auto-initialize these wallets.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {balances.map((bal, idx) => {
                  const typeDetails = leaveTypes.find(t => t.id === bal.leaveTypeId);
                  const color = colors[idx % colors.length];
                  const percent = Math.min(100, Math.round(((bal.totalUsed + bal.totalPending) / bal.totalAllocated) * 100)) || 0;
                  return (
                    <div key={bal.id} className="bg-white dark:bg-surface-850 rounded-xl border border-surface-200 dark:border-surface-800 p-5 hover:shadow-lg transition-all relative overflow-hidden group">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs text-surface-400 font-bold uppercase tracking-wider">{typeDetails?.name || 'Leave'}</p>
                          <p className="text-3xl font-extrabold text-surface-900 dark:text-white mt-1.5">{bal.balance} days</p>
                        </div>
                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white shadow-md`}>
                          <Calendar className="w-4 h-4" />
                        </div>
                      </div>

                      {/* Balance Progress Bar */}
                      <div className="mt-5">
                        <div className="flex justify-between text-[10px] text-surface-450 font-bold mb-1">
                          <span>Usage percentage</span>
                          <span>{percent}%</span>
                        </div>
                        <div className="w-full h-2 bg-surface-100 dark:bg-surface-750 rounded-full overflow-hidden">
                          <div className={`h-full bg-gradient-to-r ${color}`} style={{ width: `${percent}%` }}></div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mt-5 border-t border-surface-100 dark:border-surface-750 pt-4 text-center text-[11px] font-semibold">
                        <div>
                          <p className="text-surface-400">Allocated</p>
                          <p className="text-surface-850 dark:text-surface-200 mt-0.5">{bal.totalAllocated}</p>
                        </div>
                        <div>
                          <p className="text-surface-400">Used</p>
                          <p className="text-surface-850 dark:text-surface-200 mt-0.5">{bal.totalUsed}</p>
                        </div>
                        <div>
                          <p className="text-surface-400">Pending</p>
                          <p className="text-primary-600 dark:text-primary-400 mt-0.5">{bal.totalPending}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Accruals History Timeline */}
            <div className="bg-white dark:bg-surface-850 rounded-xl border border-surface-200 dark:border-surface-800 p-5 space-y-4">
              <h3 className="font-bold text-base">Accruals & Carry Forward History</h3>
              <div className="space-y-4 pl-3 relative border-l border-surface-200 dark:border-surface-750">
                {[
                  { title: 'Monthly Accrual Processed', date: 'June 01, 2026', type: 'CL', amount: '+1.0 Days', status: 'System Job credited' },
                  { title: 'Monthly Accrual Processed', date: 'May 01, 2026', type: 'CL', amount: '+1.0 Days', status: 'System Job credited' },
                  { title: 'Carry Forward Credit applied', date: 'Jan 01, 2026', type: 'EL', amount: '+3.0 Days', status: 'Carry-Forward rules executed' }
                ].map((item, idx) => (
                  <div key={idx} className="relative space-y-1">
                    <div className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-primary-500 border border-white"></div>
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="text-sm font-bold">{item.title}</h4>
                        <p className="text-xs text-surface-500 font-semibold">{item.date} • {item.status}</p>
                      </div>
                      <span className="text-xs font-bold text-emerald-600">{item.amount} {item.type}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: LEAVE HISTORY & REQUESTS */}
        {activeTab === 'requests' && (
          <div className="bg-white dark:bg-surface-850 rounded-xl border border-surface-200 dark:border-surface-800 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="text-lg font-bold">Leave Requests History</h2>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-surface-450" />
                {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(f => (
                  <button
                    key={f}
                    onClick={() => setRequestFilter(f as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      requestFilter === f 
                        ? 'bg-primary-600 border-primary-600 text-white'
                        : 'border-surface-200 dark:border-surface-750 text-surface-550 hover:bg-surface-50'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {filteredRequests.length === 0 ? (
              <div className="text-center py-10 text-surface-400">
                No leave requests found matching details.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRequests.map(req => {
                  const typeDetails = leaveTypes.find(t => t.id === req.leaveTypeId);
                  return (
                    <div key={req.id} className="border border-surface-200 dark:border-surface-750 rounded-xl p-5 hover:bg-surface-50/50 dark:hover:bg-surface-800/10 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                          req.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20' : 'bg-amber-50 text-amber-600 dark:bg-amber-950/20'
                        }`}>
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-surface-800 dark:text-white">{typeDetails?.name || 'Leave Request'}</h4>
                            <span className="text-xs font-mono bg-surface-100 dark:bg-surface-850 px-2 py-0.5 rounded text-surface-550 font-bold">
                              {req.daysCount} days
                            </span>
                            {req.halfDay && (
                              <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 px-1.5 py-0.5 rounded font-bold">
                                Half Day
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-surface-500 mt-1 font-semibold">
                            {req.startDate} to {req.endDate}
                          </p>
                          <p className="text-xs text-surface-450 mt-1 italic">"{req.reason}"</p>
                          {req.rejectionReason && (
                            <p className="text-xs text-rose-500 mt-1 font-semibold">Reason for rejection: {req.rejectionReason}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:gap-8 border-t lg:border-t-0 border-surface-100 dark:border-surface-750 pt-4 lg:pt-0">
                        <div className="space-y-1">
                          <p className="text-[9px] uppercase font-bold text-surface-400">Workflow Status</p>
                          <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${
                            req.status === 'APPROVED' 
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-450' 
                              : req.status === 'REJECTED'
                              ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-450'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-450'
                          }`}>
                            {req.status}
                          </span>
                        </div>

                        {isAdminOrManager && req.status?.startsWith('PENDING') && (
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleAction(req.id!, 'APPROVED')}
                              className="p-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors flex items-center justify-center"
                              title="Approve"
                            >
                              <Check className="w-4.5 h-4.5" />
                            </button>
                            <button 
                              onClick={() => handleAction(req.id!, 'REJECTED')}
                              className="p-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition-colors flex items-center justify-center"
                              title="Reject"
                            >
                              <X className="w-4.5 h-4.5" />
                            </button>
                          </div>
                        )}

                        {!isAdminOrManager && req.status?.startsWith('PENDING') && (
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleAction(req.id!, 'CANCELLED')}
                              className="px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 rounded-lg font-bold transition-all"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: TEAM CAPACITY & CALENDAR */}
        {activeTab === 'teamCalendar' && (
          <div className="bg-white dark:bg-surface-850 rounded-xl border border-surface-200 dark:border-surface-800 p-5 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold">Team Capacity Calendar</h2>
                <p className="text-xs text-surface-500 font-semibold mt-0.5">Visualize team absences and check for schedule overlaps before approving leaves.</p>
              </div>
            </div>

            {/* Overlap Detector / Team Grid View */}
            <div className="space-y-4">
              <div className="overflow-x-auto border border-surface-200 dark:border-surface-800 rounded-xl">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-surface-200 dark:border-surface-850 bg-surface-50/50 dark:bg-surface-800/40 text-surface-400 font-bold uppercase tracking-wider">
                      <th className="p-3.5 font-bold">Employee</th>
                      {Array.from({ length: 15 }).map((_, i) => (
                        <th key={i} className="p-3.5 border-l border-surface-200 dark:border-surface-850 font-mono text-center">
                          {i + 15} <br /> Jun
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-150 dark:divide-surface-800 text-sm">
                    {[
                      { name: 'Sarah Williams', leaves: [15, 16] },
                      { name: 'Dhipak Sankar', leaves: [17, 18, 19] },
                      { name: 'Michael Chen', leaves: [] },
                      { name: 'John Doe', leaves: [24, 25] }
                    ].map((member, idx) => (
                      <tr key={idx} className="hover:bg-surface-50/50 dark:hover:bg-surface-800/5">
                        <td className="p-3.5 font-bold border-r border-surface-200 dark:border-surface-850 bg-surface-50/10">{member.name}</td>
                        {Array.from({ length: 15 }).map((_, i) => {
                          const dateNum = i + 15;
                          const isOnLeave = member.leaves.includes(dateNum);
                          return (
                            <td key={i} className={`p-3.5 border-l border-surface-200 dark:border-surface-850 text-center ${
                              isOnLeave ? 'bg-amber-100/50 dark:bg-amber-950/20 text-amber-600 font-extrabold' : ''
                            }`}>
                              {isOnLeave ? 'Abs' : ''}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Legend and Overlap Alert */}
              <div className="p-4 bg-amber-50 dark:bg-amber-950/15 border border-amber-200 dark:border-amber-900/30 rounded-xl flex items-start gap-2.5 text-xs text-amber-700">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-800">Overlap warning system active</p>
                  <p className="mt-0.5 text-surface-500">The planner automatically checks if leave requests coincide with critical product releases or if department capacity falls below 60%.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: APPROVAL CENTER */}
        {activeTab === 'approvalCenter' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold">Leave Approval Inbox</h2>
                <p className="text-xs text-surface-500 font-semibold mt-0.5">Approve, reject, or delegate tasks as Level 1 Manager / Level 2 Director.</p>
              </div>
              
              {/* Delegation config */}
              <div className="bg-surface-50 dark:bg-surface-850 p-4 border border-surface-200 dark:border-surface-800 rounded-xl max-w-sm flex items-center justify-between gap-3 text-xs">
                <div>
                  <p className="font-bold">Approval Delegation</p>
                  <p className="text-[10px] text-surface-500 mt-0.5">
                    {delegationRule.active 
                      ? `Active: Delegated to ${delegationRule.delegateTo}` 
                      : 'No delegation active'}
                  </p>
                </div>
                <button
                  onClick={() => setDelegationRule(prev => ({
                    ...prev,
                    active: !prev.active,
                    delegateTo: prev.active ? '' : 'Michael Chen'
                  }))}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all border ${
                    delegationRule.active
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-primary-600 text-white border-primary-600 hover:bg-primary-700'
                  }`}
                >
                  {delegationRule.active ? 'Disable' : 'Delegate'}
                </button>
              </div>
            </div>

            {/* List of Pending requests for team members */}
            <div className="bg-white dark:bg-surface-850 border border-surface-200 dark:border-surface-800 rounded-xl p-5 space-y-4">
              <h3 className="font-bold text-sm uppercase tracking-wider text-surface-400">Team Requests Awaiting Your Approval</h3>
              
              {approvalTasks.length === 0 ? (
                <div className="text-center py-8 text-surface-400 text-sm">
                  You have no pending leave approval tasks.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5">
                  {approvalTasks.map((task) => {
                    const req = allLeaveRequests.find(r => r.id === task.requestId);
                    const emp = employees.find(e => e.id === req?.employeeId);
                    const leaveType = leaveTypes.find(t => t.id === req?.leaveTypeId);
                    
                    // Count overlap in department
                    const deptId = emp?.departmentId;
                    const overlapCount = deptId && req ? allLeaveRequests.filter(r => 
                      r.status === 'APPROVED' && 
                      r.employeeId !== emp?.id && 
                      employees.find(e => e.id === r.employeeId)?.departmentId === deptId && 
                      !(new Date(req.startDate) > new Date(r.endDate) || new Date(req.endDate) < new Date(r.startDate))
                    ).length : 0;

                    return (
                      <div key={task.id} className="p-5 border border-surface-200 dark:border-surface-800 rounded-2xl bg-surface-50/50 dark:bg-surface-900/10 hover:shadow-md transition-all space-y-4">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          {/* Employee details */}
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-800 dark:bg-primary-950/40 dark:text-primary-400 flex items-center justify-center font-bold text-sm uppercase">
                              {emp ? `${emp.firstName[0]}${emp.lastName[0]}` : '??'}
                            </div>
                            <div>
                              <p className="font-bold text-sm text-surface-800 dark:text-white">
                                {emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown Employee'}
                              </p>
                              <p className="text-[10px] text-surface-450 font-bold uppercase tracking-wider">
                                {(emp as any)?.designationName || 'Staff'} • {(emp as any)?.departmentName || 'General'}
                              </p>
                            </div>
                          </div>

                          {/* Level indicator */}
                          <div className="flex gap-2 items-center">
                            <span className="bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider">
                              Level {task.levelNo} Approver
                            </span>
                            <span className="bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider">
                              SLA: 48 Hrs
                            </span>
                          </div>
                        </div>

                        {/* Request content details */}
                        {req ? (
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white dark:bg-surface-850 p-4 rounded-xl border border-surface-150 dark:border-surface-800 text-xs font-semibold">
                            <div>
                              <p className="text-[10px] text-surface-400 uppercase">Leave Type</p>
                              <p className="text-surface-800 dark:text-white font-bold mt-0.5">{leaveType?.name || 'Leave'}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-surface-400 uppercase">Requested Duration</p>
                              <p className="text-surface-800 dark:text-white font-bold mt-0.5">{req.startDate} to {req.endDate}</p>
                              <p className="text-[10px] text-primary-500 mt-0.5">{req.daysCount} Days {req.halfDay ? '(Half Day)' : ''}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-surface-400 uppercase">Coverage Conflict</p>
                              <p className={`mt-0.5 font-bold ${overlapCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                                {overlapCount > 0 ? `${overlapCount} overlapping leave(s)` : 'No active overlaps'}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] text-surface-400 uppercase">Reason</p>
                              <p className="text-surface-850 dark:text-surface-300 font-medium truncate mt-0.5" title={req.reason}>
                                {req.reason || 'No reason provided'}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-rose-500 font-bold">Could not resolve leave request details for task ID {task.id}</p>
                        )}

                        {/* Interactive justification and Comments field */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-surface-400 font-bold uppercase tracking-wider">Approver Comments & Feedback</label>
                          <input 
                            type="text" 
                            placeholder="Add comment, feedback or delegation details here..."
                            value={taskComments[task.id] || ''}
                            onChange={e => setTaskComments(prev => ({ ...prev, [task.id]: e.target.value }))}
                            className="w-full px-3.5 py-2.5 bg-white dark:bg-surface-850 border border-surface-200 dark:border-surface-750 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-primary-500/20 text-surface-800 dark:text-white"
                          />
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-wrap gap-2 pt-2 border-t border-surface-100 dark:border-surface-800 text-[10px] font-extrabold uppercase tracking-wider">
                          <button
                            onClick={() => handleTaskAction(task.id, 'APPROVE', taskComments[task.id] || 'Approved')}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            onClick={() => handleTaskAction(task.id, 'REJECT', taskComments[task.id] || 'Rejected')}
                            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors flex items-center gap-1"
                          >
                            <X className="w-3.5 h-3.5" /> Reject
                          </button>
                          <button
                            onClick={() => handleTaskAction(task.id, 'REQUEST_CLARIFICATION', taskComments[task.id] || 'More information requested')}
                            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors flex items-center gap-1"
                          >
                            <AlertCircle className="w-3.5 h-3.5" /> Clarify
                          </button>
                          <button
                            onClick={() => handleTaskAction(task.id, 'DELEGATE', taskComments[task.id] || 'Delegated to Michael Chen')}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-1"
                          >
                            <UserPlus className="w-3.5 h-3.5" /> Delegate
                          </button>
                          <button
                            onClick={() => handleTaskAction(task.id, 'ESCALATE', taskComments[task.id] || 'Escalated')}
                            className="px-4 py-2 bg-surface-200 hover:bg-surface-300 dark:bg-surface-800 dark:hover:bg-surface-700 text-surface-800 dark:text-white rounded-lg transition-colors flex items-center gap-1 border border-surface-300 dark:border-surface-700"
                          >
                            <TrendingUp className="w-3.5 h-3.5" /> Escalate
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 6: HOLIDAY CALENDARS */}
        {activeTab === 'holidayCalendars' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Holiday Calendars Sidebar */}
            <div className="bg-white dark:bg-surface-850 p-5 rounded-xl border border-surface-200 dark:border-surface-800 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-base">Regional Calendars</h3>
                {isAdminOrManager && (
                  <button 
                    onClick={() => setShowAddCalendarModal(true)}
                    className="p-1 text-primary-600 hover:bg-primary-50 rounded"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {holidayCalendars.map(cal => (
                  <button
                    key={cal.id}
                    onClick={() => setSelectedCalendarId(cal.id || '')}
                    className={`w-full p-4 rounded-xl text-left border flex items-center justify-between transition-all ${
                      selectedCalendarId === cal.id
                        ? 'bg-primary-50/50 border-primary-300 text-primary-900 dark:bg-primary-950/20 dark:border-primary-800'
                        : 'bg-transparent border-surface-200 dark:border-surface-800 hover:bg-surface-50'
                    }`}
                  >
                    <div>
                      <h4 className="font-bold text-sm">{cal.calendarName}</h4>
                      <p className="text-xs text-surface-500 font-semibold mt-0.5">{cal.state}, {cal.country} • {cal.year}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-surface-400" />
                  </button>
                ))}
              </div>
            </div>

            {/* Calendar Days Detail Grid */}
            <div className="lg:col-span-2 bg-white dark:bg-surface-850 p-5 rounded-xl border border-surface-200 dark:border-surface-800 space-y-4">
              <div className="flex justify-between items-center border-b border-surface-150 dark:border-surface-800 pb-3">
                <div>
                  <h3 className="font-bold text-base">Holidays List ({currentYear})</h3>
                  <p className="text-xs text-surface-550 font-semibold mt-0.5">Active public and floating holiday schedule.</p>
                </div>
                {isAdminOrManager && (
                  <button
                    onClick={() => setShowAddHolidayDayModal(true)}
                    className="flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Holiday
                  </button>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="text-xs text-surface-400 border-b border-surface-200 dark:border-surface-800 font-bold uppercase tracking-wider bg-surface-50/50 dark:bg-surface-800/20">
                      <th className="p-3">Holiday</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Type</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-150 dark:divide-surface-800">
                    {activeCalendarDays.map((day) => (
                      <tr key={day.id} className="hover:bg-surface-50/50 dark:hover:bg-surface-800/10">
                        <td className="p-3 font-bold">{day.holidayName}</td>
                        <td className="p-3 font-semibold text-xs text-surface-500">{day.holidayDate}</td>
                        <td className="p-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                            day.optionalHoliday 
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/20' 
                              : 'bg-primary-50 text-primary-700 dark:bg-primary-950/20'
                          }`}>
                            {day.optionalHoliday ? 'Floating' : day.holidayType}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          {isAdminOrManager && (
                            <button className="text-rose-500 hover:text-rose-700">
                              <Trash2 className="w-4 h-4 inline-block" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {activeCalendarDays.length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-center py-6 text-xs text-surface-400 italic">No holidays configured for this calendar region.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 7: POLICY RULES */}
        {activeTab === 'policyRules' && (() => {
          const selectedPolicy = leavePolicies.find(p => p.id === selectedPolicyId);
          return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Policies Sidebar */}
              <div className="bg-white dark:bg-surface-850 p-5 rounded-xl border border-surface-200 dark:border-surface-800 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-base">Leave Policies</h3>
                  {isAdminOrManager && (
                    <button 
                      onClick={() => {
                        setNewPolicy({
                          policyName: '',
                          policyCode: '',
                          description: '',
                          effectiveFrom: new Date().toISOString().split('T')[0],
                          effectiveTo: '',
                          active: true,
                          status: 'ACTIVE',
                          organizationScope: 'GLOBAL'
                        });
                        setShowAddPolicyModal(true);
                      }}
                      className="p-1 text-primary-600 hover:bg-primary-50 rounded"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {leavePolicies.map(policy => (
                    <div
                      key={policy.id}
                      className={`relative w-full rounded-xl border flex items-center justify-between transition-all ${
                        selectedPolicyId === policy.id
                          ? 'bg-primary-50/50 border-primary-300 text-primary-900 dark:bg-primary-950/20 dark:border-primary-800'
                          : 'bg-transparent border-surface-200 dark:border-surface-800 hover:bg-surface-50'
                      }`}
                    >
                      <button
                        onClick={() => {
                          setSelectedPolicyId(policy.id || '');
                          setPolicySubTab('rules');
                        }}
                        className="flex-1 p-4 text-left"
                      >
                        <h4 className="font-bold text-sm">{policy.policyName}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-surface-500 font-mono text-[10px]">{policy.policyCode}</p>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                            policy.status === 'ACTIVE' ? 'bg-green-50 text-green-700 dark:bg-green-950/25 dark:text-green-400' :
                            policy.status === 'ARCHIVED' ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/25 dark:text-rose-450' :
                            'bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-400'
                          }`}>
                            {policy.status || (policy.active ? 'ACTIVE' : 'INACTIVE')}
                          </span>
                        </div>
                      </button>

                      {isAdminOrManager && (
                        <div className="pr-3 relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActivePolicyMenuId(activePolicyMenuId === policy.id ? null : policy.id || null);
                            }}
                            className="p-1 hover:bg-surface-200 dark:hover:bg-surface-800 rounded-full transition-all text-surface-500 hover:text-surface-800"
                            title="Policy Actions"
                          >
                            <span className="font-bold text-base leading-none">⋮</span>
                          </button>
                          
                          {activePolicyMenuId === policy.id && (
                            <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-surface-850 rounded-lg shadow-lg border border-surface-200 dark:border-surface-800 z-50 py-1 text-xs text-surface-700 dark:text-surface-300 font-semibold">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditPolicyForm({
                                    id: policy.id || '',
                                    policyName: policy.policyName,
                                    policyCode: policy.policyCode,
                                    description: policy.description || '',
                                    effectiveFrom: policy.effectiveFrom,
                                    effectiveTo: policy.effectiveTo || '',
                                    status: policy.status || 'ACTIVE',
                                    organizationScope: policy.organizationScope || 'GLOBAL'
                                  });
                                  setShowEditPolicyModal(true);
                                  setActivePolicyMenuId(null);
                                }}
                                className="w-full text-left px-3 py-2 hover:bg-surface-50 dark:hover:bg-surface-800 flex items-center gap-1.5"
                              >
                                ✏️ Edit Policy
                              </button>
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setClonePolicyForm({
                                    id: policy.id || '',
                                    newName: `${policy.policyName} (Copy)`,
                                    newCode: `${policy.policyCode}CPY`
                                  });
                                  setShowClonePolicyModal(true);
                                  setActivePolicyMenuId(null);
                                }}
                                className="w-full text-left px-3 py-2 hover:bg-surface-50 dark:hover:bg-surface-800 flex items-center gap-1.5"
                              >
                                📋 Clone Policy
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedPolicyId(policy.id || '');
                                  setPolicySubTab('assignments');
                                  setActivePolicyMenuId(null);
                                }}
                                className="w-full text-left px-3 py-2 hover:bg-surface-50 dark:hover:bg-surface-800 flex items-center gap-1.5"
                              >
                                👥 View Assignments
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedPolicyId(policy.id || '');
                                  setPolicySubTab('versions');
                                  setActivePolicyMenuId(null);
                                }}
                                className="w-full text-left px-3 py-2 hover:bg-surface-50 dark:hover:bg-surface-800 flex items-center gap-1.5"
                              >
                                📜 Version History
                              </button>
                              
                              {policy.status !== 'ACTIVE' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleActivatePolicy(policy.id || '');
                                    setActivePolicyMenuId(null);
                                  }}
                                  className="w-full text-left px-3 py-2 hover:bg-surface-50 dark:hover:bg-surface-800 flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400"
                                >
                                  ✅ Activate Policy
                                </button>
                              )}

                              {policy.status === 'ACTIVE' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeactivatePolicy(policy.id || '');
                                    setActivePolicyMenuId(null);
                                  }}
                                  className="w-full text-left px-3 py-2 hover:bg-surface-50 dark:hover:bg-surface-800 flex items-center gap-1.5 text-amber-600 dark:text-amber-450"
                                >
                                  ⚠️ Deactivate Policy
                                </button>
                              )}

                              {policy.status !== 'ARCHIVED' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleArchivePolicy(policy.id || '');
                                    setActivePolicyMenuId(null);
                                  }}
                                  className="w-full text-left px-3 py-2 hover:bg-surface-50 dark:hover:bg-surface-800 flex items-center gap-1.5 text-rose-600 dark:text-rose-450"
                                >
                                  📦 Archive Policy
                                </button>
                              )}

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeletePolicy(policy.id || '');
                                  setActivePolicyMenuId(null);
                                }}
                                className="w-full text-left px-3 py-2 hover:bg-surface-50 dark:hover:bg-surface-800 flex items-center gap-1.5 text-red-600 dark:text-red-400 border-t border-surface-100 dark:border-surface-800"
                              >
                                🗑️ Delete Policy
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Policy detail pane */}
              <div className="lg:col-span-2 space-y-6">
                {selectedPolicy ? (
                  <>
                    {/* Policy Metadata & Actions Card */}
                    <div className="bg-white dark:bg-surface-850 p-6 rounded-xl border border-surface-200 dark:border-surface-800 space-y-4">
                      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                        <div>
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <h2 className="text-lg font-bold text-surface-900 dark:text-white">{selectedPolicy.policyName}</h2>
                            <span className="text-xs font-mono bg-surface-100 dark:bg-surface-800 text-surface-600 px-2 py-0.5 rounded">
                              {selectedPolicy.policyCode}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                              selectedPolicy.status === 'ACTIVE' ? 'bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400' :
                              selectedPolicy.status === 'ARCHIVED' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/30 dark:text-rose-450' :
                              'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-450'
                            }`}>
                              {selectedPolicy.status || (selectedPolicy.active ? 'ACTIVE' : 'INACTIVE')}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary-50 text-primary-700 dark:bg-primary-950/20 dark:text-primary-400 uppercase tracking-wider">
                              Scope: {selectedPolicy.organizationScope || 'GLOBAL'}
                            </span>
                          </div>
                          <p className="text-xs text-surface-500 font-medium mt-2">{selectedPolicy.description}</p>
                          <p className="text-[10px] text-surface-400 mt-1 font-mono">
                            Effective: {selectedPolicy.effectiveFrom} {selectedPolicy.effectiveTo ? `to ${selectedPolicy.effectiveTo}` : '(No Expiry)'}
                          </p>
                        </div>

                        {isAdminOrManager && (
                          <div className="flex flex-wrap items-center gap-1.5 self-stretch md:self-auto justify-end">
                            <button
                              onClick={() => {
                                setEditPolicyForm({
                                  id: selectedPolicy.id || '',
                                  policyName: selectedPolicy.policyName,
                                  policyCode: selectedPolicy.policyCode,
                                  description: selectedPolicy.description || '',
                                  effectiveFrom: selectedPolicy.effectiveFrom,
                                  effectiveTo: selectedPolicy.effectiveTo || '',
                                  status: selectedPolicy.status || 'ACTIVE',
                                  organizationScope: selectedPolicy.organizationScope || 'GLOBAL'
                                });
                                setShowEditPolicyModal(true);
                              }}
                              className="px-2.5 py-1.5 text-xs font-bold border border-surface-200 dark:border-surface-700 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-800 flex items-center gap-1 text-surface-700 dark:text-surface-200"
                              title="Edit Policy Details"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                setClonePolicyForm({
                                  id: selectedPolicy.id || '',
                                  newName: `${selectedPolicy.policyName} (Cloned)`,
                                  newCode: `${selectedPolicy.policyCode}_CLONED`
                                });
                                setShowClonePolicyModal(true);
                              }}
                              className="px-2.5 py-1.5 text-xs font-bold border border-surface-200 dark:border-surface-700 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-800 flex items-center gap-1 text-surface-700 dark:text-surface-200"
                              title="Clone Leave Policy"
                            >
                              Clone
                            </button>
                            {selectedPolicy.status !== 'ACTIVE' ? (
                              <button
                                onClick={() => handleActivatePolicy(selectedPolicy.id || '')}
                                className="px-2.5 py-1.5 text-xs font-bold bg-green-600 hover:bg-green-700 text-white rounded-lg"
                              >
                                Activate
                              </button>
                            ) : (
                              <button
                                onClick={() => handleDeactivatePolicy(selectedPolicy.id || '')}
                                className="px-2.5 py-1.5 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg"
                              >
                                Deactivate
                              </button>
                            )}
                            {selectedPolicy.status !== 'ARCHIVED' && (
                              <button
                                onClick={() => handleArchivePolicy(selectedPolicy.id || '')}
                                className="px-2.5 py-1.5 text-xs font-bold bg-surface-100 hover:bg-surface-250 dark:bg-surface-800 dark:hover:bg-surface-700 text-surface-700 dark:text-white rounded-lg"
                              >
                                Archive
                              </button>
                            )}
                            <button
                              onClick={() => handleDeletePolicy(selectedPolicy.id || '')}
                              className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg"
                              title="Soft Delete Policy"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Sub-tab navigation */}
                      <div className="flex border-b border-surface-150 dark:border-surface-800 gap-4 mt-2">
                        {(['rules', 'assignments', 'versions', 'audits'] as const).map(tab => (
                          <button
                            key={tab}
                            onClick={() => setPolicySubTab(tab)}
                            className={`py-2 px-1 text-xs font-bold border-b-2 capitalize transition-all ${
                              policySubTab === tab
                                ? 'border-primary-500 text-primary-600'
                                : 'border-transparent text-surface-500 hover:text-surface-700'
                            }`}
                          >
                            {tab === 'rules' ? 'Accrual Rules' :
                             tab === 'assignments' ? 'DNA Scope Assignments' :
                             tab === 'versions' ? 'Version Snapshots' :
                             'Audit Logs'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Sub-tab Content: Rules */}
                    {policySubTab === 'rules' && (
                      <div className="bg-white dark:bg-surface-850 p-5 rounded-xl border border-surface-200 dark:border-surface-800 space-y-4">
                        <div className="flex justify-between items-center border-b border-surface-150 dark:border-surface-800 pb-3">
                          <div>
                            <h3 className="font-bold text-sm">Policy Rules</h3>
                            <p className="text-[11px] text-surface-500 mt-0.5">Parameters governing yearly credit allocations, carry limits, notice periods, and eligibilities.</p>
                          </div>
                          {isAdminOrManager && (
                            <button
                              onClick={() => {
                                setNewRule({
                                  policyId: selectedPolicy.id || '',
                                  leaveTypeId: leaveTypes[0]?.id || '',
                                  allocatedDays: 12,
                                  accrualMethod: 'MONTHLY',
                                  carryForwardLimit: 5,
                                  encashmentAllowed: true,
                                  negativeBalanceAllowed: false,
                                  noticePeriod: 0,
                                  minServiceDays: 0,
                                  attachmentRequired: false,
                                  halfDayAllowed: false,
                                  genderEligibility: 'ALL',
                                  employmentTypeEligibility: 'ALL'
                                });
                                setShowAddRuleModal(true);
                              }}
                              className="flex items-center gap-1 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg"
                            >
                              <Plus className="w-3.5 h-3.5" /> Add Rule
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {activePolicyRules.map((rule) => {
                            const typeDetails = leaveTypes.find(t => t.id === rule.leaveTypeId);
                            return (
                              <div key={rule.id} className="p-4 border border-surface-200 dark:border-surface-750 rounded-xl bg-surface-50/30 dark:bg-surface-900/5 space-y-3 relative group">
                                <div className="flex justify-between items-start">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-sm text-surface-800 dark:text-white">
                                      {typeDetails?.name || 'Leave Type Rule'}
                                    </h4>
                                    {isAdminOrManager && (
                                      <div className="flex items-center gap-1.5 ml-2">
                                        <button
                                          onClick={() => {
                                            setEditRuleForm({
                                              id: rule.id || '',
                                              policyId: rule.policyId,
                                              leaveTypeId: rule.leaveTypeId,
                                              allocatedDays: rule.allocatedDays,
                                              accrualMethod: rule.accrualMethod,
                                              carryForwardLimit: rule.carryForwardLimit,
                                              encashmentAllowed: rule.encashmentAllowed,
                                              negativeBalanceAllowed: rule.negativeBalanceAllowed,
                                              noticePeriod: rule.noticePeriod || 0,
                                              minServiceDays: rule.minServiceDays || 0,
                                              attachmentRequired: !!rule.attachmentRequired,
                                              halfDayAllowed: !!rule.halfDayAllowed,
                                              genderEligibility: rule.genderEligibility || 'ALL',
                                              employmentTypeEligibility: rule.employmentTypeEligibility || 'ALL',
                                              leaveTypeName: typeDetails?.name || '',
                                              leaveTypeCode: typeDetails?.code || ''
                                            });
                                            setSelectedRuleForEdit(rule);
                                            setShowEditRuleModal(true);
                                          }}
                                          className="text-primary-600 hover:text-primary-800 dark:text-primary-400 p-0.5 transition-colors"
                                          title="Edit Rule & Leave Type"
                                        >
                                          <span className="text-sm">✏️</span>
                                        </button>
                                        <button
                                          onClick={() => handleDeletePolicyRule(rule.id || '', selectedPolicyId)}
                                          className="text-rose-500 hover:text-rose-700 p-0.5 transition-colors"
                                          title="Delete Rule"
                                        >
                                          <span className="text-sm">🗑️</span>
                                        </button>
                                        <button
                                          onClick={() => {
                                            setNewRule({
                                              policyId: selectedPolicyId,
                                              leaveTypeId: rule.leaveTypeId,
                                              allocatedDays: rule.allocatedDays,
                                              accrualMethod: rule.accrualMethod,
                                              carryForwardLimit: rule.carryForwardLimit,
                                              encashmentAllowed: rule.encashmentAllowed,
                                              negativeBalanceAllowed: rule.negativeBalanceAllowed,
                                              noticePeriod: rule.noticePeriod || 0,
                                              minServiceDays: rule.minServiceDays || 0,
                                              attachmentRequired: !!rule.attachmentRequired,
                                              halfDayAllowed: !!rule.halfDayAllowed,
                                              genderEligibility: rule.genderEligibility || 'ALL',
                                              employmentTypeEligibility: rule.employmentTypeEligibility || 'ALL'
                                            });
                                            setShowAddRuleModal(true);
                                          }}
                                          className="text-surface-550 hover:text-surface-750 p-0.5 transition-colors text-xs"
                                          title="Duplicate Rule parameters"
                                        >
                                          📋
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                  <span className="text-[9px] bg-primary-50 dark:bg-primary-950/20 text-primary-700 dark:text-primary-400 font-bold px-2 py-0.5 rounded">
                                    {rule.accrualMethod}
                                  </span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-surface-500">
                                  <div>
                                    <p className="text-[10px] text-surface-400 uppercase">Allocated days</p>
                                    <p className="font-bold text-surface-800 dark:text-white mt-0.5">{rule.allocatedDays} Days</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] text-surface-400 uppercase">Carry Forward limit</p>
                                    <p className="font-bold text-surface-800 dark:text-white mt-0.5">{rule.carryForwardLimit} Days</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] text-surface-400 uppercase">Encashable</p>
                                    <p className="font-bold text-surface-800 dark:text-white mt-0.5">{rule.encashmentAllowed ? 'Yes' : 'No'}</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] text-surface-400 uppercase">Negative balance</p>
                                    <p className="font-bold text-surface-800 dark:text-white mt-0.5">{rule.negativeBalanceAllowed ? 'Allowed' : 'Not Allowed'}</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] text-surface-400 uppercase">Notice Period</p>
                                    <p className="font-bold text-surface-800 dark:text-white mt-0.5">{rule.noticePeriod || 0} Days</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] text-surface-400 uppercase">Min Service Days</p>
                                    <p className="font-bold text-surface-800 dark:text-white mt-0.5">{rule.minServiceDays || 0} Days</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] text-surface-400 uppercase">Req. Certificate</p>
                                    <p className="font-bold text-surface-800 dark:text-white mt-0.5">{rule.attachmentRequired ? 'Yes' : 'No'}</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] text-surface-400 uppercase">Half Day Allow</p>
                                    <p className="font-bold text-surface-800 dark:text-white mt-0.5">{rule.halfDayAllowed ? 'Yes' : 'No'}</p>
                                  </div>
                                  <div className="col-span-2 border-t border-surface-100 dark:border-surface-800 pt-1.5 mt-1.5 flex gap-3 text-[10px] text-surface-450">
                                    <span>Gender: <strong className="text-surface-700 dark:text-surface-200">{rule.genderEligibility || 'ALL'}</strong></span>
                                    <span>Emp Type: <strong className="text-surface-700 dark:text-surface-200">{rule.employmentTypeEligibility || 'ALL'}</strong></span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                          {activePolicyRules.length === 0 && (
                            <p className="text-xs text-surface-450 italic col-span-2 text-center py-6">No rules configured for the active leave policy.</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Sub-tab Content: Assignments */}
                    {policySubTab === 'assignments' && (
                      <div className="bg-white dark:bg-surface-850 p-5 rounded-xl border border-surface-200 dark:border-surface-800 space-y-4">
                        <div className="flex justify-between items-center border-b border-surface-150 dark:border-surface-800 pb-3">
                          <div>
                            <h3 className="font-bold text-sm">DNA Scope Assignments</h3>
                            <p className="text-[11px] text-surface-550 font-semibold mt-0.5">Segment configurations mapping departments, grades, or employment types to this policy.</p>
                          </div>
                          {isAdminOrManager && (
                            <button
                              onClick={() => {
                                setNewAssignment({
                                  policyId: selectedPolicy.id || '',
                                  organizationId: '',
                                  businessUnitId: '',
                                  departmentId: '',
                                  gradeId: '',
                                  bandId: '',
                                  employmentTypeId: ''
                                });
                                setShowAddAssignmentModal(true);
                              }}
                              className="flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg"
                            >
                              <Plus className="w-3.5 h-3.5" /> Assign Policy
                            </button>
                          )}
                        </div>

                        <div className="space-y-3">
                          {policyAssignmentsForId.map((assignment, idx) => (
                            <div key={assignment.id || idx} className="p-3 border border-surface-200 dark:border-surface-750 rounded-xl bg-surface-50/20 dark:bg-surface-900/5 flex items-center justify-between">
                              <div className="flex flex-wrap gap-2 items-center text-xs font-semibold text-surface-600">
                                <span className="text-surface-450 text-[10px] uppercase font-bold tracking-wide">Filters:</span>
                                {assignment.departmentId && (
                                  <span className="bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400 px-2 py-0.5 rounded font-mono">
                                    Dept: {assignment.departmentId.slice(0, 8)}...
                                  </span>
                                )}
                                {assignment.gradeId && (
                                  <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-450 px-2 py-0.5 rounded font-mono">
                                    Grade: {assignment.gradeId.slice(0, 8)}...
                                  </span>
                                )}
                                {assignment.employmentTypeId && (
                                  <span className="bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-450 px-2 py-0.5 rounded font-mono">
                                    Emp Type: {assignment.employmentTypeId.slice(0, 8)}...
                                  </span>
                                )}
                                {!assignment.departmentId && !assignment.gradeId && !assignment.employmentTypeId && (
                                  <span className="bg-surface-100 text-surface-600 px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[10px]">Global Fallback</span>
                                )}
                              </div>
                              {isAdminOrManager && (
                                <button
                                  onClick={() => handleDeleteAssignment(assignment.id || '', selectedPolicy.id || '')}
                                  className="text-rose-500 hover:text-rose-700 p-1 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded"
                                  title="Unassign Policy segment"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}
                          {policyAssignmentsForId.length === 0 && (
                            <p className="text-xs text-surface-450 italic text-center py-4">No segment assignments mapped for this policy.</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Sub-tab Content: Versions */}
                    {policySubTab === 'versions' && (
                      <div className="bg-white dark:bg-surface-850 p-5 rounded-xl border border-surface-200 dark:border-surface-800 space-y-4">
                        <div>
                          <h3 className="font-bold text-sm">Policy Version Snapshots</h3>
                          <p className="text-[11px] text-surface-550 font-semibold mt-0.5">Historical snapshots of policy configuration rules, captured automatically upon update.</p>
                        </div>

                        <div className="space-y-4">
                          {policyVersions.map((version) => (
                            <div key={version.id} className="p-4 border border-surface-200 dark:border-surface-750 rounded-xl bg-surface-50/20 dark:bg-surface-900/5 space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-primary-600 dark:text-primary-400">
                                  Version {version.version}
                                </span>
                                <span className="text-[10px] text-surface-400 font-mono">
                                  Captured: {new Date(version.createdAt).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-[10px] text-surface-500">
                                Modified By: <strong className="text-surface-700 dark:text-surface-300">{version.createdBy}</strong>
                              </p>
                              <div className="bg-surface-100/50 dark:bg-surface-950/30 p-2.5 rounded-lg border dark:border-surface-800 text-[10px] font-mono text-surface-600 dark:text-surface-400 overflow-x-auto max-h-36">
                                <span className="font-bold text-primary-600 block mb-1">Snapshot Rules Config:</span>
                                {(() => {
                                  try {
                                    const rules = JSON.parse(version.rulesSnapshot);
                                    if (Array.isArray(rules)) {
                                      return (
                                        <ul className="list-disc pl-4 space-y-1">
                                          {rules.map((ruleSnap: any, sIdx: number) => {
                                            const typeDetails = leaveTypes.find(t => t.id === ruleSnap.leaveTypeId);
                                            return (
                                              <li key={sIdx}>
                                                <strong>{typeDetails?.name || ruleSnap.leaveTypeId}</strong>: {ruleSnap.allocatedDays} days, {ruleSnap.accrualMethod || ruleSnap.accrualFrequency}, CF limit {ruleSnap.carryForwardLimit} days
                                              </li>
                                            );
                                          })}
                                        </ul>
                                      );
                                    }
                                  } catch (e) {}
                                  return <span>{version.rulesSnapshot}</span>;
                                })()}
                              </div>
                            </div>
                          ))}
                          {policyVersions.length === 0 && (
                            <p className="text-xs text-surface-450 italic text-center py-4">No historical version snapshots recorded yet.</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Sub-tab Content: Audits */}
                    {policySubTab === 'audits' && (
                      <div className="bg-white dark:bg-surface-850 p-5 rounded-xl border border-surface-200 dark:border-surface-800 space-y-4">
                        <div>
                          <h3 className="font-bold text-sm">Policy Activity Audit Logs</h3>
                          <p className="text-[11px] text-surface-550 font-semibold mt-0.5">Audit log of modifications, activations, assignments, and structural updates.</p>
                        </div>

                        <div className="overflow-x-auto border border-surface-200 dark:border-surface-800 rounded-xl">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="text-[10px] text-surface-400 font-bold uppercase tracking-wider border-b border-surface-200 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-800/20">
                                <th className="p-3">Date</th>
                                <th className="p-3">User</th>
                                <th className="p-3">Action</th>
                                <th className="p-3">Old Value</th>
                                <th className="p-3">New Value</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-150 dark:divide-surface-800">
                              {policyAudits.map((audit) => (
                                <tr key={audit.id} className="hover:bg-surface-50/50 dark:hover:bg-surface-800/10 font-medium">
                                  <td className="p-3 text-[10px] font-mono text-surface-500 whitespace-nowrap">
                                    {new Date(audit.createdAt).toLocaleString()}
                                  </td>
                                  <td className="p-3 font-semibold text-surface-700 dark:text-surface-200">
                                    {audit.createdBy}
                                  </td>
                                  <td className="p-3">
                                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary-50 text-primary-700 dark:bg-primary-950/20 dark:text-primary-400 uppercase tracking-wide">
                                      {audit.action}
                                    </span>
                                  </td>
                                  <td className="p-3 font-mono text-[10px] text-surface-600 dark:text-surface-400 max-w-[120px] truncate" title={audit.oldValue}>
                                    {audit.oldValue || '-'}
                                  </td>
                                  <td className="p-3 font-mono text-[10px] text-surface-600 dark:text-surface-400 max-w-[120px] truncate" title={audit.newValue}>
                                    {audit.newValue || '-'}
                                  </td>
                                </tr>
                              ))}
                              {policyAudits.length === 0 && (
                                <tr>
                                  <td colSpan={5} className="p-6 text-center text-surface-450 italic">No audits recorded.</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-white dark:bg-surface-850 p-12 text-center rounded-xl border border-surface-200 dark:border-surface-800 text-surface-450 italic flex flex-col items-center justify-center space-y-2">
                    <Sliders className="w-10 h-10 text-surface-300" />
                    <p className="font-semibold text-sm">Select a Leave Policy from the sidebar to manage settings.</p>
                  </div>
                )}
              </div>

            </div>
          );
        })()}

        {/* LEAVE TYPES ADMINISTRATION TAB */}
        {activeTab === 'leaveTypesAdmin' && (
          <div className="bg-white dark:bg-surface-850 rounded-xl border border-surface-200 dark:border-surface-800 p-5 space-y-4 animate-fade-in">
            <div className="flex justify-between items-center border-b border-surface-150 dark:border-surface-800 pb-3">
              <div>
                <h2 className="text-lg font-bold">Leave Types Administration</h2>
                <p className="text-xs text-surface-550 font-semibold mt-0.5">Manage leave types, categories, and system-wide default day allocations.</p>
              </div>
              {isAdminOrManager && (
                <button
                  onClick={() => {
                    setTypeForm({
                      name: '',
                      code: '',
                      description: '',
                      category: 'GENERAL',
                      genderEligibility: 'ALL',
                      defaultDays: 12,
                      carryForwardAllowed: true,
                      maxCarryForwardDays: 5,
                      encashmentAllowed: false,
                      halfDayAllowed: true,
                      negativeBalanceAllowed: false,
                      requiresApproval: true,
                      requiresDocument: false,
                      minDaysNotice: 0,
                      maxConsecutiveDays: 15,
                      active: true
                    });
                    setShowAddTypeModal(true);
                  }}
                  className="flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" /> Create Leave Type
                </button>
              )}
            </div>

            <div className="overflow-x-auto border border-surface-200 dark:border-surface-800 rounded-xl">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="text-xs text-surface-400 font-bold uppercase tracking-wider border-b border-surface-200 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-800/20">
                    <th className="p-3.5">Code</th>
                    <th className="p-3.5">Name</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Gender Eligibility</th>
                    <th className="p-3.5">Annual Allocation</th>
                    <th className="p-3.5">Carry Forward</th>
                    <th className="p-3.5">Encashable</th>
                    <th className="p-3.5">Negative Bal</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-150 dark:divide-surface-800 text-xs">
                  {leaveTypes.map((type) => (
                    <tr key={type.id} className="hover:bg-surface-50/50 dark:hover:bg-surface-800/10 font-medium">
                      <td className="p-3.5 font-bold font-mono text-primary-600 dark:text-primary-400">{type.code}</td>
                      <td className="p-3.5 font-bold text-surface-800 dark:text-surface-200">{type.name}</td>
                      <td className="p-3.5">
                        <span className="bg-surface-100 text-surface-700 dark:bg-surface-800 dark:text-surface-300 px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[10px]">
                          {type.category || 'GENERAL'}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[10px] ${
                          type.genderEligibility === 'FEMALE' ? 'bg-pink-50 text-pink-700 dark:bg-pink-950/20 dark:text-pink-400' :
                          type.genderEligibility === 'MALE' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400' :
                          'bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-400'
                        }`}>
                          {type.genderEligibility || 'ALL'}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-surface-800 dark:text-white">{type.defaultDays} Days</td>
                      <td className="p-3.5 font-semibold text-surface-600 dark:text-surface-400">
                        {type.carryForwardAllowed ? `Max ${type.maxCarryForwardDays} Days` : 'Disabled'}
                      </td>
                      <td className="p-3.5 font-semibold text-surface-600 dark:text-surface-400">{type.encashmentAllowed ? 'Yes' : 'No'}</td>
                      <td className="p-3.5 font-semibold text-surface-600 dark:text-surface-400">{type.negativeBalanceAllowed ? 'Allowed' : 'No'}</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[10px] ${
                          type.active ? 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400'
                        }`}>
                          {type.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedTypeForEdit(type);
                            setTypeForm({
                              name: type.name,
                              code: type.code,
                              description: type.description || '',
                              category: type.category || 'GENERAL',
                              genderEligibility: type.genderEligibility || 'ALL',
                              defaultDays: type.defaultDays,
                              carryForwardAllowed: type.carryForwardAllowed,
                              maxCarryForwardDays: type.maxCarryForwardDays,
                              encashmentAllowed: type.encashmentAllowed,
                              halfDayAllowed: type.halfDayAllowed,
                              negativeBalanceAllowed: type.negativeBalanceAllowed,
                              requiresApproval: type.requiresApproval,
                              requiresDocument: type.requiresDocument,
                              minDaysNotice: type.minDaysNotice,
                              maxConsecutiveDays: type.maxConsecutiveDays,
                              active: type.active
                            });
                            setShowEditTypeModal(true);
                          }}
                          className="px-2 py-1 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/20 rounded font-bold transition-all"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteLeaveType(type.id)}
                          className="px-2 py-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded font-bold transition-all"
                        >
                          Archive
                        </button>
                      </td>
                    </tr>
                  ))}
                  {leaveTypes.length === 0 && (
                    <tr>
                      <td colSpan={10} className="p-8 text-center text-surface-400 italic">No leave types found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* LEAVE BALANCES ADMINISTRATION TAB */}
        {activeTab === 'leaveBalancesAdmin' && (
          <div className="bg-white dark:bg-surface-850 rounded-xl border border-surface-200 dark:border-surface-800 p-5 space-y-4 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-surface-150 dark:border-surface-800 pb-3">
              <div>
                <h2 className="text-lg font-bold">Employee Leave Balances</h2>
                <p className="text-xs text-surface-550 font-semibold mt-0.5">Audit employee allocations, adjust balances (credits/debits), and recalculate wallets.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleRecalculateAllWallets}
                  className="bg-surface-100 hover:bg-surface-200 dark:bg-surface-800 dark:hover:bg-surface-750 text-surface-700 dark:text-surface-300 text-xs font-bold px-3 py-2 rounded-xl border border-surface-300 dark:border-surface-700 transition-all"
                >
                  Recalculate All Wallets
                </button>
                <button
                  onClick={() => {
                    setAdjustBalanceForm({
                      employeeId: balanceFilterEmpId || employees[0]?.id || '',
                      leaveTypeId: balanceFilterTypeVal || leaveTypes[0]?.id || '',
                      year: balanceFilterYearVal,
                      amount: 0,
                      reason: '',
                      mode: 'credit'
                    });
                    setShowAdjustBalanceModal(true);
                  }}
                  className="flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" /> Adjust Balance
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-surface-50/50 dark:bg-surface-900/5 p-4 rounded-xl border border-surface-150 dark:border-surface-800">
              <div>
                <label className="text-xs font-bold text-surface-500 uppercase">Employee</label>
                <select
                  value={balanceFilterEmpId}
                  onChange={e => setBalanceFilterEmpId(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-750 rounded-xl text-sm font-semibold"
                >
                  <option value="">Select Employee...</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.employeeCode})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-surface-500 uppercase">Leave Type</label>
                <select
                  value={balanceFilterTypeVal}
                  onChange={e => setBalanceFilterTypeVal(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-750 rounded-xl text-sm font-semibold"
                >
                  <option value="">All Leave Types</option>
                  {leaveTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.name} ({type.code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-surface-500 uppercase">Year</label>
                <select
                  value={balanceFilterYearVal}
                  onChange={e => setBalanceFilterYearVal(Number(e.target.value))}
                  className="w-full mt-1.5 px-3 py-2 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-750 rounded-xl text-sm font-semibold"
                >
                  <option value={currentYear}>{currentYear}</option>
                  <option value={currentYear - 1}>{currentYear - 1}</option>
                  <option value={currentYear + 1}>{currentYear + 1}</option>
                </select>
              </div>
            </div>

            {/* Balances Display */}
            {balanceFilterEmpId ? (
              <LeaveBalancesList 
                employeeId={balanceFilterEmpId} 
                year={balanceFilterYearVal} 
                employees={employees} 
                leaveTypes={leaveTypes} 
                filterTypeId={balanceFilterTypeVal}
                recalculateBalances={recalculateBalances}
                setSuccessMessage={setSuccessMessage}
              />
            ) : (
              <div className="p-8 text-center text-surface-450 italic border border-dashed rounded-xl dark:border-surface-750">
                Please select an employee to view, recalculate, and adjust leave balances.
              </div>
            )}
          </div>
        )}

        {/* TAB 8: AUDIT TRAIL */}
        {activeTab === 'auditLogs' && (
          <div className="bg-white dark:bg-surface-850 rounded-xl border border-surface-200 dark:border-surface-800 p-5 space-y-4">
            <div>
              <h2 className="text-lg font-bold">Leave Module Audit Logs</h2>
              <p className="text-xs text-surface-500 font-semibold mt-0.5">Comprehensive audit trail of leaves applied, approved, rejected, policy adjustments, and balances modified.</p>
            </div>

            <div className="overflow-x-auto border border-surface-200 dark:border-surface-800 rounded-xl">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="text-xs text-surface-400 font-bold uppercase tracking-wider border-b border-surface-200 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-800/20">
                    <th className="p-3.5">User</th>
                    <th className="p-3.5">Action</th>
                    <th className="p-3.5">Details</th>
                    <th className="p-3.5">IP Address</th>
                    <th className="p-3.5">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-150 dark:divide-surface-800 text-xs">
                  {auditLogs.map((log, idx) => (
                    <tr key={idx} className="hover:bg-surface-50/50 dark:hover:bg-surface-800/10 font-medium">
                      <td className="p-3.5 font-bold text-surface-800 dark:text-surface-200">{log.user}</td>
                      <td className="p-3.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                          log.action.includes('APPROVE') 
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-450' 
                            : 'bg-primary-50 text-primary-755 dark:bg-primary-950/20 dark:text-primary-400'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3.5 text-surface-600 dark:text-surface-300 font-semibold">{log.details}</td>
                      <td className="p-3.5 font-mono text-surface-500">{log.ip}</td>
                      <td className="p-3.5 text-surface-500">{log.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 9: COMP-OFF WALLET */}
        {activeTab === 'compOff' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Submit Request & Expiry */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-surface-850 p-6 rounded-xl border border-surface-200 dark:border-surface-800 space-y-4">
                <h3 className="font-bold text-base">Claim Overtime Comp-Off</h3>
                <p className="text-xs text-surface-500 font-semibold">Earn paid leave balance by claiming overtime hours worked on weekends or holidays.</p>
                
                <form onSubmit={handleSubmitCompOff} className="space-y-4 text-xs font-semibold text-surface-500">
                  <div>
                    <DatePicker
                      label="Work Date"
                      value={compOffForm.workDate}
                      onChange={v => setCompOffForm({ ...compOffForm, workDate: v })}
                      required
                    />
                  </div>
                  <div>
                    <label className="uppercase">Hours Worked</label>
                    <select
                      value={compOffForm.hoursWorked}
                      onChange={e => setCompOffForm({ ...compOffForm, hoursWorked: Number(e.target.value) })}
                      className="w-full mt-1.5 px-3 py-2 bg-surface-50 dark:bg-surface-900 border rounded-xl text-sm font-bold"
                    >
                      <option value={4}>4 Hours (Half Day Credit)</option>
                      <option value={8}>8 Hours (Full Day Credit)</option>
                      <option value={12}>12 Hours (Full Day + Overtime)</option>
                    </select>
                  </div>
                  <div>
                    <label className="uppercase">Reason / Project Context</label>
                    <textarea 
                      required rows={3} placeholder="Describe work delivered..."
                      value={compOffForm.reason}
                      onChange={e => setCompOffForm({ ...compOffForm, reason: e.target.value })}
                      className="w-full mt-1.5 px-3 py-2 bg-surface-50 dark:bg-surface-900 border rounded-xl text-sm font-normal"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmittingCompOff}
                    className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-4 h-4" /> Submit Claim
                  </button>
                </form>
              </div>

              {/* Expiry Trigger */}
              {isAdminOrManager && (
                <div className="bg-white dark:bg-surface-850 p-6 rounded-xl border border-surface-200 dark:border-surface-800 space-y-3">
                  <h4 className="font-bold text-sm text-surface-700 dark:text-surface-200 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    Operations Console
                  </h4>
                  <p className="text-xs text-surface-500">Run the scheduler job to expire overtime balances older than 60 days.</p>
                  <button
                    onClick={handleTriggerCompOffExpiry}
                    className="w-full py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-xl text-xs font-bold transition-all"
                  >
                    Run Expiry Cleanup Job
                  </button>
                </div>
              )}
            </div>

            {/* Wallet & History */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Wallet Summary */}
              <div className="bg-gradient-to-r from-purple-900/20 to-indigo-900/20 p-6 rounded-xl border border-purple-500/20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Overtime Wallet</span>
                  <h3 className="text-3xl font-extrabold mt-2 text-surface-900 dark:text-white">
                    {compOffWallet ? compOffWallet.availableDays : '0.0'} Days
                  </h3>
                  <p className="text-xs text-surface-500 mt-1 font-semibold">
                    {compOffWallet?.expiryDate ? `Next balance expires on: ${compOffWallet.expiryDate}` : 'No active balance expiry scheduled'}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20 text-purple-450">
                  <Clock className="w-6 h-6" />
                </div>
              </div>

              {/* History Table */}
              <div className="bg-white dark:bg-surface-850 p-6 rounded-xl border border-surface-200 dark:border-surface-800 space-y-4">
                <h3 className="font-bold text-base">Overtime Claim History</h3>
                <div className="overflow-x-auto border border-surface-200 dark:border-surface-800 rounded-xl">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="text-xs text-surface-400 border-b border-surface-200 dark:border-surface-850 bg-surface-50/50 dark:bg-surface-800/20 font-bold uppercase tracking-wider">
                        <th className="p-3">Work Date</th>
                        <th className="p-3">Hours</th>
                        <th className="p-3">Reason</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Expires On</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-150 dark:divide-surface-800 text-xs">
                      {compOffRequests.map((req: any) => (
                        <tr key={req.id} className="hover:bg-surface-50/50 dark:hover:bg-surface-800/10">
                          <td className="p-3 font-bold">{new Date(req.workDate).toLocaleDateString()}</td>
                          <td className="p-3 font-semibold">{req.hoursWorked} hrs</td>
                          <td className="p-3 text-surface-500 font-semibold">{req.reason}</td>
                          <td className="p-3">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              req.status === 'APPROVED' ? 'bg-emerald-500/15 text-emerald-400' :
                              req.status === 'REJECTED' ? 'bg-red-500/15 text-red-400' : 'bg-amber-500/15 text-amber-400'
                            }`}>
                              {req.status}
                            </span>
                          </td>
                          <td className="p-3 text-surface-400 font-mono">{req.expiryDate || 'N/A'}</td>
                        </tr>
                      ))}
                      {compOffRequests.length === 0 && (
                        <tr>
                          <td colSpan={5} className="text-center py-6 text-xs text-surface-450 italic">No comp-off overtime claims submitted yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 10: PREDICTIVE ANALYTICS & LIABILITY */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left side: Liability & Heatmap */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Liability Dashboard */}
              <div className="bg-white dark:bg-surface-850 p-6 rounded-xl border border-surface-200 dark:border-surface-800 space-y-5">
                <h3 className="font-bold text-base flex items-center gap-1.5">
                  <IndianRupee className="w-5 h-5 text-emerald-500" />
                  Leave Liability & Accrual Projections
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                    <p className="text-[10px] text-surface-450 uppercase font-bold">Total Accrued Days</p>
                    <p className="text-2xl font-extrabold mt-1">{liabilityDashboard?.totalAccruedDays || '0'} Days</p>
                  </div>
                  <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                    <p className="text-[10px] text-surface-450 uppercase font-bold">Total Financial Liability</p>
                    <p className="text-2xl font-extrabold mt-1 text-emerald-450">{formatCurrency(liabilityDashboard?.totalLiabilityCost || 0)}</p>
                  </div>
                  <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                    <p className="text-[10px] text-surface-450 uppercase font-bold">Projected Q4 Liability</p>
                    <p className="text-2xl font-extrabold mt-1 text-purple-400">{formatCurrency(Math.round(liabilityDashboard?.totalLiabilityCost * 1.15 || 0))}</p>
                  </div>
                </div>
              </div>

              {/* Heatmap & Absence Patterns */}
              <div className="bg-white dark:bg-surface-850 p-6 rounded-xl border border-surface-200 dark:border-surface-800 space-y-4">
                <h3 className="font-bold text-base flex items-center gap-1.5">
                  <TrendingUp className="w-5 h-5 text-indigo-500" />
                  Frequent Absenteeism Patterns & Heatmap
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Heatmap */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-surface-450 uppercase">Departmental Burnout Heatmap</h4>
                    <div className="space-y-2">
                      {riskHeatmap.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg border border-white/5 bg-white/[0.01]">
                          <span className="text-xs font-semibold">{item.departmentName}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            item.riskLevel === 'HIGH' ? 'bg-red-500/15 text-red-400' :
                            item.riskLevel === 'MEDIUM' ? 'bg-amber-500/15 text-amber-400' : 'bg-emerald-500/15 text-emerald-400'
                          }`}>
                            {item.riskLevel} ({item.burnoutCount} flagged)
                          </span>
                        </div>
                      ))}
                      {riskHeatmap.length === 0 && (
                        <p className="text-xs text-surface-450 italic">No department risk analytics available.</p>
                      )}
                    </div>
                  </div>

                  {/* Patterns */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-surface-450 uppercase">Absence Patterns & High Risks</h4>
                    <div className="space-y-2">
                      {patterns.map((item: any, idx: number) => {
                        const emp = employees.find(e => e.id === item.employeeId);
                        return (
                          <div key={idx} className="p-3 rounded-lg border border-white/5 bg-white/[0.01] space-y-1">
                            <p className="text-xs font-bold">{emp ? `${emp.firstName} ${emp.lastName}` : 'Employee'}</p>
                            <p className="text-[10px] text-surface-450">Pattern: {item.patternDescription}</p>
                            <span className="inline-block text-[9px] font-bold bg-rose-500/15 text-rose-400 px-1.5 py-0.5 rounded mt-1">
                              Risk Score: {item.riskScore}/100
                            </span>
                          </div>
                        );
                      })}
                      {patterns.length === 0 && (
                        <p className="text-xs text-surface-450 italic">No weekend/holiday spill patterns discovered.</p>
                      )}
                    </div>
                  </div>

                </div>
              </div>

            </div>

            {/* Right side: Diagnostic Console */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-surface-850 p-6 rounded-xl border border-surface-200 dark:border-surface-800 space-y-4">
                <h3 className="font-bold text-base flex items-center gap-1.5">
                  <Sliders className="w-5 h-5 text-purple-400" />
                  Burnout Diagnostic
                </h3>
                <p className="text-xs text-surface-500">Select any employee twin profile to calculate real-time exhaustion prediction and fatigue indexes.</p>

                <div>
                  <label className="block text-[10px] font-bold text-surface-450 uppercase mb-1.5">Select Employee Twin</label>
                  <select
                    value={selectedAnalyticsEmpId}
                    onChange={e => setSelectedAnalyticsEmpId(e.target.value)}
                    className="w-full bg-surface-50 dark:bg-surface-900 border rounded-xl px-3 py-2 text-sm text-surface-800 dark:text-surface-200 font-bold"
                  >
                    <option value="" className="bg-gray-900">Select Colleague...</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id} className="bg-gray-900">
                        {emp.firstName} {emp.lastName} ({emp.employeeCode})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedAnalyticsEmpId && (
                  <div className="space-y-4 pt-4 border-t border-surface-200 dark:border-surface-800">
                    
                    {/* Burnout risk score */}
                    <div className="p-4 rounded-xl border border-purple-500/20 bg-purple-500/[0.02] space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-purple-400">Burnout Risk Level</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          selectedBurnoutRisk?.riskLevel === 'HIGH' ? 'bg-red-500/15 text-red-400' :
                          selectedBurnoutRisk?.riskLevel === 'MEDIUM' ? 'bg-amber-500/15 text-amber-400' : 'bg-emerald-500/15 text-emerald-400'
                        }`}>
                          {selectedBurnoutRisk?.riskLevel || 'LOW'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-2xl font-extrabold">{selectedBurnoutRisk?.riskScore || '0'}/100</div>
                        <p className="text-[10px] text-surface-500">{selectedBurnoutRisk?.reason}</p>
                      </div>
                    </div>

                    {/* Absence exhaustion prediction */}
                    <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/[0.02] space-y-2.5">
                      <span className="text-xs font-bold text-indigo-400">Exhaustion Prediction</span>
                      <div className="grid grid-cols-2 gap-2 text-xs font-medium text-surface-500">
                        <div>
                          <p>Likelihood next 30d</p>
                          <p className="font-extrabold text-surface-800 dark:text-white mt-0.5">
                            {selectedExhaustion ? `${(selectedExhaustion.exhaustionRate * 100).toFixed(0)}%` : '0%'}
                          </p>
                        </div>
                        <div>
                          <p>Fatigue Index</p>
                          <p className="font-extrabold text-surface-800 dark:text-white mt-0.5">
                            {selectedExhaustion ? (selectedExhaustion.exhaustionRate * 10).toFixed(1) : '0.0'}/10
                          </p>
                        </div>
                      </div>
                      {selectedExhaustion?.predictedAbsenceStartDate && (
                        <div className="pt-2 border-t border-white/5 text-[10px] text-surface-500">
                          Next Predicted Absence: <span className="font-bold text-indigo-400">{new Date(selectedExhaustion.predictedAbsenceStartDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* TAB: LEAVE ENCASHMENT */}
        {activeTab === 'encashment' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-surface-850 p-6 rounded-xl border border-surface-200 dark:border-surface-800 space-y-4 shadow-sm">
              <h3 className="font-bold text-base">Encash Leave Balance</h3>
              <p className="text-xs text-surface-500 font-semibold">Convert accumulated, unused leave balances into direct financial compensation through payroll.</p>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                alert(`Leave encashment request for ${encashRequest.days} days of selected leave type has been submitted to payroll!`);
                setShowEncashModal(false);
              }} className="space-y-4 text-xs font-semibold text-surface-500">
                <div>
                  <label className="uppercase">Leave Type</label>
                  <select 
                    value={encashRequest.leaveTypeId}
                    onChange={e => setEncashRequest({ ...encashRequest, leaveTypeId: e.target.value })}
                    className="w-full mt-1.5 px-3 py-2.5 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl text-sm font-bold text-surface-800 dark:text-surface-200"
                  >
                    {leaveTypes.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="uppercase">Days to Encash</label>
                  <input 
                    type="number" min={1} required
                    value={encashRequest.days}
                    onChange={e => setEncashRequest({ ...encashRequest, days: Number(e.target.value) })}
                    className="w-full mt-1.5 px-3 py-2.5 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl text-sm text-surface-800 dark:text-surface-200"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-primary-600/10"
                >
                  Submit Encashment Claim
                </button>
              </form>
            </div>
            
            <div className="lg:col-span-2 bg-white dark:bg-surface-850 p-6 rounded-xl border border-surface-200 dark:border-surface-800 space-y-4 shadow-sm">
              <h3 className="font-bold text-base">Encashment History & Guidelines</h3>
              <p className="text-xs text-surface-500 font-semibold">Under active policies, only Earned Leaves (EL) or privileged absences can be enashed, up to a maximum of 10 days per fiscal year.</p>
              
              <div className="overflow-x-auto border border-surface-200 dark:border-surface-800 rounded-xl mt-4">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="text-xs text-surface-400 border-b border-surface-200 dark:border-surface-850 bg-surface-50/50 dark:bg-surface-800/20 font-bold uppercase tracking-wider">
                      <th className="p-3">Reference</th>
                      <th className="p-3">Days</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Payroll Period</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-150 dark:divide-surface-800">
                    <tr className="text-xs text-surface-550">
                      <td className="p-3 font-semibold">ENC-2026-001</td>
                      <td className="p-3 font-bold text-surface-800 dark:text-white">5.0 Days</td>
                      <td className="p-3"><span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Paid</span></td>
                      <td className="p-3 font-mono">June 2026</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* REQUEST LEAVE DIALOG */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-surface-950/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-surface-850 rounded-2xl border border-surface-200 dark:border-surface-800 w-full max-w-md p-6 shadow-2xl animate-scale-up">
            <div className="flex justify-between items-center border-b border-surface-100 dark:border-surface-750 pb-3.5">
              <h3 className="text-lg font-bold">Request Leave Absence</h3>
              <button 
                onClick={() => setShowRequestModal(false)}
                className="text-surface-400 hover:text-surface-600 dark:hover:text-white text-xl font-bold"
              >
                &times;
              </button>
            </div>

            {errorMessage && (
              <div className="mt-4 p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 rounded-xl flex items-start gap-2 text-rose-600 dark:text-rose-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {balances.length === 0 && (
              <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl flex items-start gap-2 text-amber-600 dark:text-amber-400 text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Warning: No leave balances loaded. Please initialize your leave wallet before submitting requests.</span>
              </div>
            )}

            <form onSubmit={handleApplyLeave} className="space-y-4 mt-4 text-xs font-semibold text-surface-500">
              <div>
                <label className="uppercase tracking-wider">Leave Type</label>
                <select 
                  value={newRequest.leaveTypeId}
                  onChange={e => setNewRequest({ ...newRequest, leaveTypeId: e.target.value })}
                  className="w-full mt-1.5 px-3.5 py-2.5 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500/20 text-surface-800 dark:text-surface-200 font-bold"
                >
                  {leaveTypes.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <DatePicker
                    label="Start Date"
                    value={newRequest.startDate}
                    onChange={v => setNewRequest({ ...newRequest, startDate: v })}
                    required
                  />
                </div>
                <div>
                  <DatePicker
                    label="End Date"
                    value={newRequest.endDate}
                    onChange={v => setNewRequest({ ...newRequest, endDate: v })}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input 
                  type="checkbox"
                  id="halfDay"
                  checked={newRequest.halfDay}
                  onChange={e => setNewRequest({ ...newRequest, halfDay: e.target.checked })}
                  className="rounded border-surface-200 dark:border-surface-700 text-primary-600 focus:ring-primary-500/25"
                />
                <label htmlFor="halfDay" className="select-none cursor-pointer uppercase tracking-wider">
                  Request as Half Day
                </label>
              </div>

              {newRequest.halfDay && (
                <div>
                  <label className="uppercase tracking-wider">Half Day Session</label>
                  <select
                    value={newRequest.halfDayType}
                    onChange={e => setNewRequest({ ...newRequest, halfDayType: e.target.value as any })}
                    className="w-full mt-1.5 px-3.5 py-2.5 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl text-sm outline-none text-surface-800 dark:text-surface-200 font-bold"
                  >
                    <option value="FIRST_HALF">First Session (Morning)</option>
                    <option value="SECOND_HALF">Second Session (Afternoon)</option>
                  </select>
                </div>
              )}

              <div>
                <label className="uppercase tracking-wider">Attachment (Mandatory for medical/sick leave)</label>
                <input
                  type="file"
                  onChange={e => setNewRequest({ ...newRequest, attachmentName: e.target.files?.[0]?.name || '' })}
                  className="w-full mt-1.5 px-3 py-2 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl text-xs outline-none"
                />
              </div>

              <div>
                <label className="uppercase tracking-wider">Reason for absence</label>
                <textarea 
                  required
                  rows={3}
                  placeholder="Enter detailed reason..."
                  value={newRequest.reason}
                  onChange={e => setNewRequest({ ...newRequest, reason: e.target.value })}
                  className="w-full mt-1.5 px-3.5 py-2.5 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500/20 text-surface-800 dark:text-surface-200"
                />
              </div>

              {newRequest.startDate && newRequest.endDate && (
                <div className="bg-surface-50 dark:bg-surface-900 p-4 rounded-xl border border-surface-200 dark:border-surface-750 space-y-2 mt-4 text-xs font-semibold">
                  <h4 className="text-surface-700 dark:text-surface-250 font-bold uppercase tracking-wider mb-2">Leave Summary Calculation</h4>
                  <div className="flex justify-between">
                    <span className="text-surface-450">Available Balance:</span>
                    <span className="text-surface-800 dark:text-white font-bold">{availableBalance} Days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-450">Requested Days:</span>
                    <span className="text-primary-600 dark:text-primary-400 font-bold">{requestedDays} Days</span>
                  </div>
                  <div className="flex justify-between border-t border-surface-155 dark:border-surface-800 pt-2">
                    <span className="text-surface-450">Remaining Balance:</span>
                    <span className={`${remainingBalance < 0 ? 'text-rose-500 font-extrabold' : 'text-emerald-500'} font-bold`}>{remainingBalance} Days</span>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-surface-100 dark:border-surface-750">
                <button 
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="flex-1 py-2.5 border border-surface-200 dark:border-surface-700 font-bold rounded-xl hover:bg-surface-50 dark:hover:bg-surface-750 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isApplying || balances.length === 0}
                  className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-md shadow-primary-600/10 hover:shadow-lg flex items-center justify-center gap-1.5"
                >
                  <Send className="w-4 h-4" /> Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ENCASH LEAVE DIALOG */}
      {showEncashModal && (
        <div className="fixed inset-0 bg-surface-950/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-surface-850 rounded-2xl border border-surface-200 dark:border-surface-800 w-full max-w-sm p-6 shadow-2xl animate-scale-up">
            <div className="flex justify-between items-center border-b border-surface-100 dark:border-surface-750 pb-3.5">
              <h3 className="text-lg font-bold">Encash Leave</h3>
              <button onClick={() => setShowEncashModal(false)} className="text-surface-400 hover:text-surface-650 text-xl font-bold">&times;</button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              alert(`Encashment requested successfully for ${encashRequest.days} days! Sent to payroll integration.`);
              setShowEncashModal(false);
            }} className="space-y-4 mt-4 text-xs font-semibold text-surface-500">
              <div>
                <label className="uppercase tracking-wider">Leave Type</label>
                <select 
                  value={encashRequest.leaveTypeId}
                  onChange={e => setEncashRequest({ ...encashRequest, leaveTypeId: e.target.value })}
                  className="w-full mt-1.5 px-3.5 py-2.5 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl text-sm outline-none text-surface-800 dark:text-surface-200 font-bold"
                >
                  {leaveTypes.filter(t => t.encashmentAllowed).map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="uppercase tracking-wider">Days to Encash</label>
                <input 
                  type="number" 
                  min={1} 
                  max={10}
                  required
                  value={encashRequest.days}
                  onChange={e => setEncashRequest({ ...encashRequest, days: parseInt(e.target.value) || 1 })}
                  className="w-full mt-1.5 px-3.5 py-2.5 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl text-sm outline-none text-surface-800 dark:text-surface-200 font-bold"
                />
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-850 dark:text-emerald-450 border border-emerald-100 dark:border-emerald-900/30 rounded-xl font-semibold">
                <p>Estimated payroll payout: ${(encashRequest.days * 180).toFixed(2)}</p>
                <p className="text-[10px] text-surface-450 mt-1">Calculated using base compensation multiplier rules.</p>
              </div>
              <div className="flex gap-3 pt-3">
                <button type="button" onClick={() => setShowEncashModal(false)} className="flex-1 py-2 border rounded-xl hover:bg-surface-50">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold">Request Payout</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD CALENDAR DIALOG */}
      {showAddCalendarModal && (
        <div className="fixed inset-0 bg-surface-950/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-surface-850 rounded-2xl border border-surface-200 dark:border-surface-800 w-full max-w-sm p-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-surface-100 dark:border-surface-750 pb-3">
              <h3 className="text-lg font-bold">Create Regional Calendar</h3>
              <button onClick={() => setShowAddCalendarModal(false)} className="text-surface-400 text-xl font-bold">&times;</button>
            </div>
            <form onSubmit={handleCreateCalendar} className="space-y-4 mt-4 text-xs font-semibold text-surface-500">
              <div>
                <label className="uppercase">Calendar Name</label>
                <input 
                  type="text" required placeholder="e.g. Bangalore Region"
                  value={newCalendar.calendarName}
                  onChange={e => setNewCalendar({ ...newCalendar, calendarName: e.target.value })}
                  className="w-full mt-1.5 px-3 py-2 bg-surface-50 dark:bg-surface-900 border rounded-xl text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="uppercase">State</label>
                  <input 
                    type="text" required
                    value={newCalendar.state}
                    onChange={e => setNewCalendar({ ...newCalendar, state: e.target.value })}
                    className="w-full mt-1.5 px-3 py-2 bg-surface-50 dark:bg-surface-900 border rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="uppercase">Year</label>
                  <input 
                    type="number" required
                    value={newCalendar.year}
                    onChange={e => setNewCalendar({ ...newCalendar, year: parseInt(e.target.value) || currentYear })}
                    className="w-full mt-1.5 px-3 py-2 bg-surface-50 dark:bg-surface-900 border rounded-xl text-sm"
                  />
                </div>
              </div>
              <button type="submit" className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold mt-2">Create Calendar</button>
            </form>
          </div>
        </div>
      )}

      {/* ADD HOLIDAY DAY DIALOG */}
      {showAddHolidayDayModal && (
        <div className="fixed inset-0 bg-surface-950/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-surface-850 rounded-2xl border border-surface-200 dark:border-surface-800 w-full max-w-sm p-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-surface-100 dark:border-surface-750 pb-3">
              <h3 className="text-lg font-bold">Add Holiday Day</h3>
              <button onClick={() => setShowAddHolidayDayModal(false)} className="text-surface-400 text-xl font-bold">&times;</button>
            </div>
            <form onSubmit={handleAddHolidayDay} className="space-y-4 mt-4 text-xs font-semibold text-surface-500">
              <div>
                <label className="uppercase">Holiday Name</label>
                <input 
                  type="text" required placeholder="e.g. Independence Day"
                  value={newHolidayDay.holidayName}
                  onChange={e => setNewHolidayDay({ ...newHolidayDay, holidayName: e.target.value })}
                  className="w-full mt-1.5 px-3 py-2 bg-surface-50 dark:bg-surface-900 border rounded-xl text-sm"
                />
              </div>
              <div>
                <DatePicker
                  label="Holiday Date"
                  value={newHolidayDay.holidayDate}
                  onChange={v => setNewHolidayDay({ ...newHolidayDay, holidayDate: v })}
                  required
                />
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" id="optional"
                  checked={newHolidayDay.optionalHoliday}
                  onChange={e => setNewHolidayDay({ ...newHolidayDay, optionalHoliday: e.target.checked })}
                  className="rounded border-surface-250 text-primary-600"
                />
                <label htmlFor="optional" className="select-none cursor-pointer uppercase">Optional Holiday</label>
              </div>
              <button type="submit" className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold mt-2">Add Day</button>
            </form>
          </div>
        </div>
      )}

      {/* EDIT POLICY DIALOG */}
      {showEditPolicyModal && (
        <div className="fixed inset-0 bg-surface-950/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-surface-850 rounded-2xl border border-surface-200 dark:border-surface-800 w-full max-w-sm p-6 shadow-2xl animate-scale-up">
            <div className="flex justify-between items-center border-b border-surface-100 dark:border-surface-750 pb-3">
              <h3 className="text-lg font-bold">Edit Leave Policy</h3>
              <button onClick={() => setShowEditPolicyModal(false)} className="text-surface-400 text-xl font-bold">&times;</button>
            </div>
            <form onSubmit={handleUpdatePolicy} className="space-y-4 mt-4 text-xs font-semibold text-surface-500">
              <div>
                <label className="uppercase">Policy Name</label>
                <input 
                  type="text" required
                  value={editPolicyForm.policyName}
                  onChange={e => setEditPolicyForm({ ...editPolicyForm, policyName: e.target.value })}
                  className="w-full mt-1.5 px-3 py-2 bg-surface-50 dark:bg-surface-900 border rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="uppercase">Policy Code</label>
                <input 
                  type="text" required
                  value={editPolicyForm.policyCode}
                  onChange={e => setEditPolicyForm({ ...editPolicyForm, policyCode: e.target.value })}
                  className="w-full mt-1.5 px-3 py-2 bg-surface-50 dark:bg-surface-900 border rounded-xl text-sm font-mono"
                />
              </div>
              <div>
                <label className="uppercase">Description</label>
                <textarea 
                  rows={2} required
                  value={editPolicyForm.description}
                  onChange={e => setEditPolicyForm({ ...editPolicyForm, description: e.target.value })}
                  className="w-full mt-1.5 px-3 py-2 bg-surface-50 dark:bg-surface-900 border rounded-xl text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <DatePicker
                    label="Effective Date"
                    value={editPolicyForm.effectiveFrom}
                    onChange={v => setEditPolicyForm({ ...editPolicyForm, effectiveFrom: v })}
                    required
                  />
                </div>
                <div>
                  <DatePicker
                    label="Expiry Date"
                    value={editPolicyForm.effectiveTo}
                    onChange={v => setEditPolicyForm({ ...editPolicyForm, effectiveTo: v })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="uppercase">Status</label>
                  <select 
                    value={editPolicyForm.status}
                    onChange={e => setEditPolicyForm({ ...editPolicyForm, status: e.target.value })}
                    className="w-full mt-1.5 px-3 py-2 bg-surface-50 dark:bg-surface-900 border rounded-xl text-sm"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>
                <div>
                  <label className="uppercase">Scope</label>
                  <select 
                    value={editPolicyForm.organizationScope}
                    onChange={e => setEditPolicyForm({ ...editPolicyForm, organizationScope: e.target.value })}
                    className="w-full mt-1.5 px-3 py-2 bg-surface-50 dark:bg-surface-900 border rounded-xl text-sm"
                  >
                    <option value="GLOBAL">Global</option>
                    <option value="DEPARTMENTAL">Departmental</option>
                    <option value="TENANT">Tenant Only</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold mt-2">Update Policy</button>
            </form>
          </div>
        </div>
      )}

      {/* CLONE POLICY DIALOG */}
      {showClonePolicyModal && (
        <div className="fixed inset-0 bg-surface-950/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-surface-850 rounded-2xl border border-surface-200 dark:border-surface-800 w-full max-w-sm p-6 shadow-2xl animate-scale-up">
            <div className="flex justify-between items-center border-b border-surface-100 dark:border-surface-750 pb-3">
              <h3 className="text-lg font-bold">Clone Policy</h3>
              <button onClick={() => setShowClonePolicyModal(false)} className="text-surface-400 text-xl font-bold">&times;</button>
            </div>
            <form onSubmit={handleClonePolicy} className="space-y-4 mt-4 text-xs font-semibold text-surface-500">
              <div>
                <label className="uppercase">New Policy Name</label>
                <input 
                  type="text" required placeholder="e.g. Sales Department Policy"
                  value={clonePolicyForm.newName}
                  onChange={e => setClonePolicyForm({ ...clonePolicyForm, newName: e.target.value })}
                  className="w-full mt-1.5 px-3 py-2 bg-surface-50 dark:bg-surface-900 border rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="uppercase">New Policy Code</label>
                <input 
                  type="text" required placeholder="e.g. POL-SALES"
                  value={clonePolicyForm.newCode}
                  onChange={e => setClonePolicyForm({ ...clonePolicyForm, newCode: e.target.value })}
                  className="w-full mt-1.5 px-3 py-2 bg-surface-50 dark:bg-surface-900 border rounded-xl text-sm font-mono"
                />
              </div>
              <button type="submit" className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold mt-2">Confirm Clone</button>
            </form>
          </div>
        </div>
      )}

      {/* ADD POLICY DIALOG */}
      {showAddPolicyModal && (
        <div className="fixed inset-0 bg-surface-950/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-surface-850 rounded-2xl border border-surface-200 dark:border-surface-800 w-full max-w-sm p-6 shadow-2xl animate-scale-up">
            <div className="flex justify-between items-center border-b border-surface-100 dark:border-surface-750 pb-3">
              <h3 className="text-lg font-bold">Create Leave Policy</h3>
              <button onClick={() => setShowAddPolicyModal(false)} className="text-surface-400 text-xl font-bold">&times;</button>
            </div>
            <form onSubmit={handleCreatePolicy} className="space-y-4 mt-4 text-xs font-semibold text-surface-500">
              <div>
                <label className="uppercase">Policy Name</label>
                <input 
                  type="text" required placeholder="e.g. Technology Staff Policy"
                  value={newPolicy.policyName}
                  onChange={e => setNewPolicy({ ...newPolicy, policyName: e.target.value })}
                  className="w-full mt-1.5 px-3 py-2 bg-surface-50 dark:bg-surface-900 border rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="uppercase">Policy Code</label>
                <input 
                  type="text" required placeholder="e.g. POL-TECH"
                  value={newPolicy.policyCode}
                  onChange={e => setNewPolicy({ ...newPolicy, policyCode: e.target.value })}
                  className="w-full mt-1.5 px-3 py-2 bg-surface-50 dark:bg-surface-900 border rounded-xl text-sm font-mono"
                />
              </div>
              <div>
                <label className="uppercase">Description</label>
                <textarea 
                  rows={2} required placeholder="Eligibility details..."
                  value={newPolicy.description}
                  onChange={e => setNewPolicy({ ...newPolicy, description: e.target.value })}
                  className="w-full mt-1.5 px-3 py-2 bg-surface-50 dark:bg-surface-900 border rounded-xl text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <DatePicker
                    label="Effective From"
                    value={newPolicy.effectiveFrom}
                    onChange={v => setNewPolicy({ ...newPolicy, effectiveFrom: v })}
                    required
                  />
                </div>
                <div>
                  <DatePicker
                    label="Effective To"
                    value={newPolicy.effectiveTo}
                    onChange={v => setNewPolicy({ ...newPolicy, effectiveTo: v })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="uppercase">Scope</label>
                  <select 
                    value={newPolicy.organizationScope}
                    onChange={e => setNewPolicy({ ...newPolicy, organizationScope: e.target.value })}
                    className="w-full mt-1.5 px-3 py-2 bg-surface-50 dark:bg-surface-900 border rounded-xl text-sm"
                  >
                    <option value="GLOBAL">Global</option>
                    <option value="DEPARTMENTAL">Departmental</option>
                    <option value="TENANT">Tenant Only</option>
                  </select>
                </div>
                <div>
                  <label className="uppercase">Initial Status</label>
                  <select 
                    value={newPolicy.status}
                    onChange={e => setNewPolicy({ ...newPolicy, status: e.target.value })}
                    className="w-full mt-1.5 px-3 py-2 bg-surface-50 dark:bg-surface-900 border rounded-xl text-sm"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold mt-2">Create Policy</button>
            </form>
          </div>
        </div>
      )}

      {/* ADD RULE DIALOG */}
      {showAddRuleModal && (
        <div className="fixed inset-0 bg-surface-950/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-surface-850 rounded-2xl border border-surface-200 dark:border-surface-800 w-full max-w-md p-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-scale-up">
            <div className="flex justify-between items-center border-b border-surface-100 dark:border-surface-750 pb-3">
              <h3 className="text-lg font-bold">Add Policy Rule</h3>
              <button onClick={() => setShowAddRuleModal(false)} className="text-surface-400 text-xl font-bold">&times;</button>
            </div>
            <form onSubmit={handleCreateRule} className="space-y-4 mt-4 text-xs font-semibold text-surface-500">
              <div>
                <label className="uppercase">Leave Type</label>
                <select 
                  value={newRule.leaveTypeId}
                  onChange={e => setNewRule({ ...newRule, leaveTypeId: e.target.value })}
                  className="w-full mt-1.5 px-3 py-2 bg-surface-50 dark:bg-surface-900 border rounded-xl text-sm"
                >
                  {leaveTypes.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="uppercase">Allocated Days</label>
                  <input 
                    type="number" required
                    value={newRule.allocatedDays}
                    onChange={e => setNewRule({ ...newRule, allocatedDays: parseInt(e.target.value) || 12 })}
                    className="w-full mt-1.5 px-3 py-2 bg-surface-50 dark:bg-surface-900 border rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="uppercase">Carry Limit</label>
                  <input 
                    type="number" required
                    value={newRule.carryForwardLimit}
                    onChange={e => setNewRule({ ...newRule, carryForwardLimit: parseInt(e.target.value) || 5 })}
                    className="w-full mt-1.5 px-3 py-2 bg-surface-50 dark:bg-surface-900 border rounded-xl text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="uppercase">Accrual Method</label>
                  <select 
                    value={newRule.accrualMethod}
                    onChange={e => setNewRule({ ...newRule, accrualMethod: e.target.value })}
                    className="w-full mt-1.5 px-3 py-2 bg-surface-50 dark:bg-surface-900 border rounded-xl text-sm"
                  >
                    <option value="YEARLY">Yearly Upfront</option>
                    <option value="MONTHLY">Monthly Accrued</option>
                    <option value="QUARTERLY">Quarterly Accrued</option>
                  </select>
                </div>
                <div>
                  <label className="uppercase">Notice Period (Days)</label>
                  <input 
                    type="number" required
                    value={newRule.noticePeriod}
                    onChange={e => setNewRule({ ...newRule, noticePeriod: parseInt(e.target.value) || 0 })}
                    className="w-full mt-1.5 px-3 py-2 bg-surface-50 dark:bg-surface-900 border rounded-xl text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="uppercase">Min Service (Days)</label>
                  <input 
                    type="number" required
                    value={newRule.minServiceDays}
                    onChange={e => setNewRule({ ...newRule, minServiceDays: parseInt(e.target.value) || 0 })}
                    className="w-full mt-1.5 px-3 py-2 bg-surface-50 dark:bg-surface-900 border rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="uppercase">Gender Eligibility</label>
                  <select 
                    value={newRule.genderEligibility}
                    onChange={e => setNewRule({ ...newRule, genderEligibility: e.target.value })}
                    className="w-full mt-1.5 px-3 py-2 bg-surface-50 dark:bg-surface-900 border rounded-xl text-sm"
                  >
                    <option value="ALL">All Genders</option>
                    <option value="FEMALE">Female Only</option>
                    <option value="MALE">Male Only</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="uppercase">Employment Type Eligibility</label>
                <select 
                  value={newRule.employmentTypeEligibility}
                  onChange={e => setNewRule({ ...newRule, employmentTypeEligibility: e.target.value })}
                  className="w-full mt-1.5 px-3 py-2 bg-surface-50 dark:bg-surface-900 border rounded-xl text-sm"
                >
                  <option value="ALL">All Employment Types</option>
                  <option value="FULL_TIME">Full Time</option>
                  <option value="PART_TIME">Part Time</option>
                  <option value="CONTRACTOR">Contractor</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2 bg-surface-50 dark:bg-surface-900 p-2.5 rounded-xl border">
                <div className="flex items-center gap-1.5">
                  <input 
                    type="checkbox" id="add_encash"
                    checked={newRule.encashmentAllowed}
                    onChange={e => setNewRule({ ...newRule, encashmentAllowed: e.target.checked })}
                    className="rounded text-primary-600 h-4 w-4"
                  />
                  <label htmlFor="add_encash" className="cursor-pointer">Encashable</label>
                </div>
                <div className="flex items-center gap-1.5">
                  <input 
                    type="checkbox" id="add_neg"
                    checked={newRule.negativeBalanceAllowed}
                    onChange={e => setNewRule({ ...newRule, negativeBalanceAllowed: e.target.checked })}
                    className="rounded text-primary-600 h-4 w-4"
                  />
                  <label htmlFor="add_neg" className="cursor-pointer">Neg. Balance</label>
                </div>
                <div className="flex items-center gap-1.5">
                  <input 
                    type="checkbox" id="add_attach"
                    checked={newRule.attachmentRequired}
                    onChange={e => setNewRule({ ...newRule, attachmentRequired: e.target.checked })}
                    className="rounded text-primary-600 h-4 w-4"
                  />
                  <label htmlFor="add_attach" className="cursor-pointer">Req Certificate</label>
                </div>
                <div className="flex items-center gap-1.5">
                  <input 
                    type="checkbox" id="add_half"
                    checked={newRule.halfDayAllowed}
                    onChange={e => setNewRule({ ...newRule, halfDayAllowed: e.target.checked })}
                    className="rounded text-primary-600 h-4 w-4"
                  />
                  <label htmlFor="add_half" className="cursor-pointer">Half Day Allow</label>
                </div>
              </div>

              {/* LIVE IMPACT ANALYSIS BOX */}
              {impactData && (
                <div className="bg-primary-50 dark:bg-primary-950/20 border border-primary-200 dark:border-primary-800 p-3 rounded-xl space-y-1 text-[11px] font-semibold text-primary-850 dark:text-primary-350">
                  <div className="flex items-center gap-1 font-bold text-xs mb-1">
                    <Sliders className="w-3.5 h-3.5 text-primary-600" />
                    <span>Policy Impact Preview</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Affected Employees:</span>
                    <span className="font-bold text-surface-900 dark:text-white">{impactData.affectedEmployeesCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Affected Departments:</span>
                    <span className="font-bold text-surface-900 dark:text-white">{impactData.affectedDepartmentsCount}</span>
                  </div>
                  <div className="flex justify-between border-t border-primary-100 dark:border-primary-900 pt-1 mt-1">
                    <span>Allocation Shift:</span>
                    <span className="font-bold text-surface-900 dark:text-white">
                      {impactData.currentAllocatedDays || 0} → {impactData.newAllocatedDays} Days
                    </span>
                  </div>
                </div>
              )}

              <button type="submit" className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold mt-2 shadow-md">Add Rule</button>
            </form>
          </div>
        </div>
      )}

      {/* EDIT RULE DIALOG */}
      {showEditRuleModal && selectedRuleForEdit && (
        <div className="fixed inset-0 bg-surface-950/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-surface-850 rounded-2xl border border-surface-200 dark:border-surface-800 w-full max-w-md p-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-scale-up">
            <div className="flex justify-between items-center border-b border-surface-100 dark:border-surface-750 pb-3">
              <h3 className="text-lg font-bold">Edit Policy Rule</h3>
              <button onClick={() => setShowEditRuleModal(false)} className="text-surface-400 text-xl font-bold">&times;</button>
            </div>
            <form onSubmit={handleUpdatePolicyRule} className="space-y-4 mt-4 text-xs font-semibold text-surface-500">
              <div>
                <label className="uppercase">Leave Type</label>
                <select 
                  value={editRuleForm.leaveTypeId}
                  disabled
                  className="w-full mt-1.5 px-3 py-2 bg-surface-100 dark:bg-surface-800 border rounded-xl text-sm cursor-not-allowed"
                >
                  {leaveTypes.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="uppercase">Leave Name</label>
                  <input 
                    type="text" required
                    value={editRuleForm.leaveTypeName}
                    onChange={e => setEditRuleForm({ ...editRuleForm, leaveTypeName: e.target.value })}
                    className="w-full mt-1.5 px-3 py-2 bg-surface-50 dark:bg-surface-900 border rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="uppercase">Leave Code</label>
                  <input 
                    type="text" required
                    value={editRuleForm.leaveTypeCode}
                    onChange={e => setEditRuleForm({ ...editRuleForm, leaveTypeCode: e.target.value })}
                    className="w-full mt-1.5 px-3 py-2 bg-surface-50 dark:bg-surface-900 border rounded-xl text-sm font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="uppercase">Allocated Days</label>
                  <input 
                    type="number" required
                    value={editRuleForm.allocatedDays}
                    onChange={e => setEditRuleForm({ ...editRuleForm, allocatedDays: parseInt(e.target.value) || 12 })}
                    className="w-full mt-1.5 px-3 py-2 bg-surface-50 dark:bg-surface-900 border rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="uppercase">Carry Limit</label>
                  <input 
                    type="number" required
                    value={editRuleForm.carryForwardLimit}
                    onChange={e => setEditRuleForm({ ...editRuleForm, carryForwardLimit: parseInt(e.target.value) || 5 })}
                    className="w-full mt-1.5 px-3 py-2 bg-surface-50 dark:bg-surface-900 border rounded-xl text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="uppercase">Accrual Method</label>
                  <select 
                    value={editRuleForm.accrualMethod}
                    onChange={e => setEditRuleForm({ ...editRuleForm, accrualMethod: e.target.value })}
                    className="w-full mt-1.5 px-3 py-2 bg-surface-50 dark:bg-surface-900 border rounded-xl text-sm"
                  >
                    <option value="YEARLY">Yearly Upfront</option>
                    <option value="MONTHLY">Monthly Accrued</option>
                    <option value="QUARTERLY">Quarterly Accrued</option>
                  </select>
                </div>
                <div>
                  <label className="uppercase">Notice Period (Days)</label>
                  <input 
                    type="number" required
                    value={editRuleForm.noticePeriod}
                    onChange={e => setEditRuleForm({ ...editRuleForm, noticePeriod: parseInt(e.target.value) || 0 })}
                    className="w-full mt-1.5 px-3 py-2 bg-surface-50 dark:bg-surface-900 border rounded-xl text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="uppercase">Min Service (Days)</label>
                  <input 
                    type="number" required
                    value={editRuleForm.minServiceDays}
                    onChange={e => setEditRuleForm({ ...editRuleForm, minServiceDays: parseInt(e.target.value) || 0 })}
                    className="w-full mt-1.5 px-3 py-2 bg-surface-50 dark:bg-surface-900 border rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="uppercase">Gender Eligibility</label>
                  <select 
                    value={editRuleForm.genderEligibility}
                    onChange={e => setEditRuleForm({ ...editRuleForm, genderEligibility: e.target.value })}
                    className="w-full mt-1.5 px-3 py-2 bg-surface-50 dark:bg-surface-900 border rounded-xl text-sm"
                  >
                    <option value="ALL">All Genders</option>
                    <option value="FEMALE">Female Only</option>
                    <option value="MALE">Male Only</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="uppercase">Employment Type Eligibility</label>
                <select 
                  value={editRuleForm.employmentTypeEligibility}
                  onChange={e => setEditRuleForm({ ...editRuleForm, employmentTypeEligibility: e.target.value })}
                  className="w-full mt-1.5 px-3 py-2 bg-surface-50 dark:bg-surface-900 border rounded-xl text-sm"
                >
                  <option value="ALL">All Employment Types</option>
                  <option value="FULL_TIME">Full Time</option>
                  <option value="PART_TIME">Part Time</option>
                  <option value="CONTRACTOR">Contractor</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2 bg-surface-50 dark:bg-surface-900 p-2.5 rounded-xl border">
                <div className="flex items-center gap-1.5">
                  <input 
                    type="checkbox" id="edit_encash"
                    checked={editRuleForm.encashmentAllowed}
                    onChange={e => setEditRuleForm({ ...editRuleForm, encashmentAllowed: e.target.checked })}
                    className="rounded text-primary-600 h-4 w-4"
                  />
                  <label htmlFor="edit_encash" className="cursor-pointer">Encashable</label>
                </div>
                <div className="flex items-center gap-1.5">
                  <input 
                    type="checkbox" id="edit_neg"
                    checked={editRuleForm.negativeBalanceAllowed}
                    onChange={e => setEditRuleForm({ ...editRuleForm, negativeBalanceAllowed: e.target.checked })}
                    className="rounded text-primary-600 h-4 w-4"
                  />
                  <label htmlFor="edit_neg" className="cursor-pointer">Neg. Balance</label>
                </div>
                <div className="flex items-center gap-1.5">
                  <input 
                    type="checkbox" id="edit_attach"
                    checked={editRuleForm.attachmentRequired}
                    onChange={e => setEditRuleForm({ ...editRuleForm, attachmentRequired: e.target.checked })}
                    className="rounded text-primary-600 h-4 w-4"
                  />
                  <label htmlFor="edit_attach" className="cursor-pointer">Req Certificate</label>
                </div>
                <div className="flex items-center gap-1.5">
                  <input 
                    type="checkbox" id="edit_half"
                    checked={editRuleForm.halfDayAllowed}
                    onChange={e => setEditRuleForm({ ...editRuleForm, halfDayAllowed: e.target.checked })}
                    className="rounded text-primary-600 h-4 w-4"
                  />
                  <label htmlFor="edit_half" className="cursor-pointer">Half Day Allow</label>
                </div>
              </div>

              {/* LIVE IMPACT ANALYSIS BOX */}
              {impactData && (
                <div className="bg-primary-50 dark:bg-primary-950/20 border border-primary-200 dark:border-primary-800 p-3 rounded-xl space-y-1 text-[11px] font-semibold text-primary-850 dark:text-primary-350">
                  <div className="flex items-center gap-1 font-bold text-xs mb-1">
                    <Sliders className="w-3.5 h-3.5 text-primary-600" />
                    <span>Policy Impact Preview</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Affected Employees:</span>
                    <span className="font-bold text-surface-900 dark:text-white">{impactData.affectedEmployeesCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Affected Departments:</span>
                    <span className="font-bold text-surface-900 dark:text-white">{impactData.affectedDepartmentsCount}</span>
                  </div>
                  <div className="flex justify-between border-t border-primary-100 dark:border-primary-900 pt-1 mt-1">
                    <span>Allocation Shift:</span>
                    <span className="font-bold text-surface-900 dark:text-white">
                      {impactData.currentAllocatedDays || 0} → {impactData.newAllocatedDays} Days
                    </span>
                  </div>
                </div>
              )}

              <button type="submit" className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold mt-2 shadow-md">Save Changes</button>
            </form>
          </div>
        </div>
      )}

      {/* PRE-SAVE POLICY IMPACT ANALYSIS DIALOG */}
      {showImpactDialog && (
        <div className="fixed inset-0 bg-surface-950/75 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-surface-850 rounded-2xl border border-amber-300 dark:border-amber-500 w-full max-w-md p-6 shadow-2xl animate-scale-up space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-surface-150 dark:border-surface-750">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="text-base font-extrabold text-amber-700 dark:text-amber-400">Pre-Save Impact Analysis</h3>
                <p className="text-[10px] text-surface-400 font-medium">Verify employee balance changes before final authorization</p>
              </div>
            </div>

            <div className="space-y-3 py-1 text-xs text-surface-550 font-semibold leading-relaxed">
              <p>
                You are modifying leave configurations. The system-level rules will recalculate and regenerate leave wallets immediately for all affected employee cohorts.
              </p>

              <div className="bg-surface-50 dark:bg-surface-900 rounded-xl p-3.5 border border-surface-200 dark:border-surface-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-surface-450 font-bold uppercase tracking-wider text-[9px]">Affected Employees</span>
                  <span className="font-extrabold text-sm px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400">
                    {impactData?.affectedEmployeesCount ?? 0} Employees
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-surface-450 font-bold uppercase tracking-wider text-[9px]">Affected Departments</span>
                  <span className="font-extrabold text-sm px-2 py-0.5 rounded bg-surface-100 dark:bg-surface-850 text-surface-800 dark:text-surface-200">
                    {impactData?.affectedDepartmentsCount ?? 0} Departments
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-surface-150 dark:border-surface-800 pt-2.5 mt-1">
                  <span className="text-surface-450 font-bold uppercase tracking-wider text-[9px]">Allocation Shift</span>
                  <div className="flex items-center gap-1.5 font-bold text-xs text-surface-800 dark:text-white">
                    <span className="line-through text-surface-400">
                      {impactData?.currentAllocatedDays ?? 0} Days
                    </span>
                    <span className="text-primary-500">→</span>
                    <span className="font-extrabold text-primary-600 dark:text-primary-400">
                      {impactData?.newAllocatedDays ?? 0} Days
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-850 p-3 rounded-xl flex gap-2">
                <span className="text-amber-500 text-sm">💡</span>
                <p className="text-[10px] text-amber-800 dark:text-amber-300 font-semibold leading-relaxed">
                  Saving will trigger background jobs to update leave ledgers, transaction records, and workforce planning calendars.
                </p>
              </div>
            </div>

            <div className="flex gap-2.5 pt-2 border-t border-surface-150 dark:border-surface-750">
              <button
                type="button"
                onClick={() => {
                  setShowImpactDialog(false);
                  setImpactAction(null);
                }}
                className="flex-1 py-2 text-xs font-bold bg-surface-100 hover:bg-surface-200 dark:bg-surface-800 dark:hover:bg-surface-750 rounded-xl transition-all"
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={() => {
                  if (impactAction === 'create') {
                    submitCreateRule();
                  } else if (impactAction === 'update') {
                    submitUpdateRule();
                  }
                }}
                className="flex-1 py-2 text-xs font-bold bg-amber-550 hover:bg-amber-600 dark:bg-amber-500 dark:hover:bg-amber-550 text-white rounded-xl transition-all shadow-md shadow-amber-500/10"
              >
                Confirm & Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD ASSIGNMENT DIALOG */}
      {showAddAssignmentModal && (
        <div className="fixed inset-0 bg-surface-950/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-surface-850 rounded-2xl border border-surface-200 dark:border-surface-800 w-full max-w-sm p-6 shadow-2xl animate-scale-up">
            <div className="flex justify-between items-center border-b border-surface-100 dark:border-surface-750 pb-3">
              <h3 className="text-lg font-bold">Assign Policy Eligibility</h3>
              <button onClick={() => setShowAddAssignmentModal(false)} className="text-surface-400 text-xl font-bold">&times;</button>
            </div>
            <form onSubmit={handleCreateAssignment} className="space-y-4 mt-4 text-xs font-semibold text-surface-500">
              <div>
                <label className="uppercase">Department Segment ID (UUID)</label>
                <input 
                  type="text" placeholder="Optional Segment ID"
                  value={newAssignment.departmentId}
                  onChange={e => setNewAssignment({ ...newAssignment, departmentId: e.target.value })}
                  className="w-full mt-1.5 px-3 py-2 bg-surface-50 dark:bg-surface-900 border rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="uppercase">Grade Segment ID (UUID)</label>
                <input 
                  type="text" placeholder="Optional Segment ID"
                  value={newAssignment.gradeId}
                  onChange={e => setNewAssignment({ ...newAssignment, gradeId: e.target.value })}
                  className="w-full mt-1.5 px-3 py-2 bg-surface-50 dark:bg-surface-900 border rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="uppercase">Employment Type ID (UUID)</label>
                <input 
                  type="text" placeholder="Optional Segment ID"
                  value={newAssignment.employmentTypeId}
                  onChange={e => setNewAssignment({ ...newAssignment, employmentTypeId: e.target.value })}
                  className="w-full mt-1.5 px-3 py-2 bg-surface-50 dark:bg-surface-900 border rounded-xl text-sm"
                />
              </div>
              <button type="submit" className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold mt-2">Save Assignment</button>
            </form>
          </div>
        </div>
      )}

      {/* ADD LEAVE TYPE DIALOG */}
      {showAddTypeModal && (
        <div className="fixed inset-0 bg-surface-950/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-surface-850 rounded-2xl border border-surface-200 dark:border-surface-800 w-full max-w-lg p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center border-b border-surface-100 dark:border-surface-750 pb-3">
              <h3 className="text-lg font-bold">Create New Leave Type</h3>
              <button onClick={() => setShowAddTypeModal(false)} className="text-surface-400 text-xl font-bold">&times;</button>
            </div>
            <form onSubmit={handleCreateLeaveType} className="space-y-4 mt-4 text-xs font-semibold text-surface-500">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="uppercase">Name</label>
                  <input
                    type="text" required
                    placeholder="e.g. Annual Leave"
                    value={typeForm.name}
                    onChange={e => setTypeForm({ ...typeForm, name: e.target.value })}
                    className="w-full mt-1.5 px-3 py-2 bg-surface-50 dark:bg-surface-900 border rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="uppercase">Code</label>
                  <input
                    type="text" required
                    placeholder="e.g. AL"
                    value={typeForm.code}
                    onChange={e => setTypeForm({ ...typeForm, code: e.target.value })}
                    className="w-full mt-1.5 px-3 py-2 bg-surface-50 dark:bg-surface-900 border rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="uppercase">Description</label>
                <textarea
                  value={typeForm.description}
                  onChange={e => setTypeForm({ ...typeForm, description: e.target.value })}
                  className="w-full mt-1.5 px-3 py-2 bg-surface-50 dark:bg-surface-900 border rounded-xl text-sm"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="uppercase">Category</label>
                  <select
                    value={typeForm.category}
                    onChange={e => setTypeForm({ ...typeForm, category: e.target.value })}
                    className="w-full mt-1.5 px-3 py-2 bg-surface-50 dark:bg-surface-900 border rounded-xl text-sm"
                  >
                    <option value="GENERAL">General</option>
                    <option value="MEDICAL">Medical</option>
                    <option value="CASUAL">Casual</option>
                    <option value="SPECIAL">Special</option>
                  </select>
                </div>
                <div>
                  <label className="uppercase">Gender Eligibility</label>
                  <select
                    value={typeForm.genderEligibility}
                    onChange={e => setTypeForm({ ...typeForm, genderEligibility: e.target.value })}
                    className="w-full mt-1.5 px-3 py-2 bg-surface-50 dark:bg-surface-900 border rounded-xl text-sm"
                  >
                    <option value="ALL">All Genders</option>
                    <option value="FEMALE">Female Only</option>
                    <option value="MALE">Male Only</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="uppercase">Annual Allocation Days</label>
                  <input
                    type="number" required min={0}
                    value={typeForm.defaultDays}
                    onChange={e => setTypeForm({ ...typeForm, defaultDays: Number(e.target.value) })}
                    className="w-full mt-1.5 px-3 py-2 bg-surface-50 dark:bg-surface-900 border rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="uppercase">Max Consecutive Days</label>
                  <input
                    type="number" required min={1}
                    value={typeForm.maxConsecutiveDays}
                    onChange={e => setTypeForm({ ...typeForm, maxConsecutiveDays: Number(e.target.value) })}
                    className="w-full mt-1.5 px-3 py-2 bg-surface-50 dark:bg-surface-900 border rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-surface-50 dark:bg-surface-900 p-3 rounded-xl border">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="carryForwardAllowed"
                    checked={typeForm.carryForwardAllowed}
                    onChange={e => setTypeForm({ ...typeForm, carryForwardAllowed: e.target.checked })}
                    className="rounded text-primary-600 focus:ring-primary-500 h-4 w-4"
                  />
                  <label htmlFor="carryForwardAllowed" className="cursor-pointer">Carry Forward</label>
                </div>
                {typeForm.carryForwardAllowed && (
                  <div>
                    <label className="uppercase">Max Carry Days</label>
                    <input
                      type="number" required min={0}
                      value={typeForm.maxCarryForwardDays}
                      onChange={e => setTypeForm({ ...typeForm, maxCarryForwardDays: Number(e.target.value) })}
                      className="w-full mt-1 px-2 py-1 bg-white dark:bg-surface-950 border rounded-lg text-xs font-bold"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="encashmentAllowed"
                    checked={typeForm.encashmentAllowed}
                    onChange={e => setTypeForm({ ...typeForm, encashmentAllowed: e.target.checked })}
                    className="rounded text-primary-600 h-4 w-4"
                  />
                  <label htmlFor="encashmentAllowed" className="cursor-pointer">Encashable</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="halfDayAllowed"
                    checked={typeForm.halfDayAllowed}
                    onChange={e => setTypeForm({ ...typeForm, halfDayAllowed: e.target.checked })}
                    className="rounded text-primary-600 h-4 w-4"
                  />
                  <label htmlFor="halfDayAllowed" className="cursor-pointer">Half Day</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="negativeBalanceAllowed"
                    checked={typeForm.negativeBalanceAllowed}
                    onChange={e => setTypeForm({ ...typeForm, negativeBalanceAllowed: e.target.checked })}
                    className="rounded text-primary-600 h-4 w-4"
                  />
                  <label htmlFor="negativeBalanceAllowed" className="cursor-pointer">Negative Bal</label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="requiresApproval"
                    checked={typeForm.requiresApproval}
                    onChange={e => setTypeForm({ ...typeForm, requiresApproval: e.target.checked })}
                    className="rounded text-primary-600 h-4 w-4"
                  />
                  <label htmlFor="requiresApproval" className="cursor-pointer">Requires Approval</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="requiresDocument"
                    checked={typeForm.requiresDocument}
                    onChange={e => setTypeForm({ ...typeForm, requiresDocument: e.target.checked })}
                    className="rounded text-primary-600 h-4 w-4"
                  />
                  <label htmlFor="requiresDocument" className="cursor-pointer">Req Certificate</label>
                </div>
              </div>

              <button type="submit" className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold mt-2 shadow-sm">Create Leave Type</button>
            </form>
          </div>
        </div>
      )}

      {/* EDIT LEAVE TYPE DIALOG */}
      {showEditTypeModal && selectedTypeForEdit && (
        <div className="fixed inset-0 bg-surface-950/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-surface-850 rounded-2xl border border-surface-200 dark:border-surface-800 w-full max-w-lg p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center border-b border-surface-100 dark:border-surface-750 pb-3">
              <h3 className="text-lg font-bold">Edit Leave Type: {selectedTypeForEdit.name}</h3>
              <button onClick={() => { setShowEditTypeModal(false); setSelectedTypeForEdit(null); }} className="text-surface-400 text-xl font-bold">&times;</button>
            </div>
            <form onSubmit={handleUpdateLeaveType} className="space-y-4 mt-4 text-xs font-semibold text-surface-500">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="uppercase">Name</label>
                  <input
                    type="text" required
                    value={typeForm.name}
                    onChange={e => setTypeForm({ ...typeForm, name: e.target.value })}
                    className="w-full mt-1.5 px-3 py-2 bg-surface-50 dark:bg-surface-900 border rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="uppercase">Code</label>
                  <input
                    type="text" required disabled
                    value={typeForm.code}
                    className="w-full mt-1.5 px-3 py-2 bg-surface-100 dark:bg-surface-800 border rounded-xl text-sm cursor-not-allowed font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="uppercase">Description</label>
                <textarea
                  value={typeForm.description}
                  onChange={e => setTypeForm({ ...typeForm, description: e.target.value })}
                  className="w-full mt-1.5 px-3 py-2 bg-surface-50 dark:bg-surface-900 border rounded-xl text-sm"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="uppercase">Category</label>
                  <select
                    value={typeForm.category}
                    onChange={e => setTypeForm({ ...typeForm, category: e.target.value })}
                    className="w-full mt-1.5 px-3 py-2 bg-surface-50 dark:bg-surface-900 border rounded-xl text-sm"
                  >
                    <option value="GENERAL">General</option>
                    <option value="MEDICAL">Medical</option>
                    <option value="CASUAL">Casual</option>
                    <option value="SPECIAL">Special</option>
                  </select>
                </div>
                <div>
                  <label className="uppercase">Gender Eligibility</label>
                  <select
                    value={typeForm.genderEligibility}
                    onChange={e => setTypeForm({ ...typeForm, genderEligibility: e.target.value })}
                    className="w-full mt-1.5 px-3 py-2 bg-surface-50 dark:bg-surface-900 border rounded-xl text-sm"
                  >
                    <option value="ALL">All Genders</option>
                    <option value="FEMALE">Female Only</option>
                    <option value="MALE">Male Only</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="uppercase">Annual Allocation Days</label>
                  <input
                    type="number" required min={0}
                    value={typeForm.defaultDays}
                    onChange={e => setTypeForm({ ...typeForm, defaultDays: Number(e.target.value) })}
                    className="w-full mt-1.5 px-3 py-2 bg-surface-50 dark:bg-surface-900 border rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="uppercase">Max Consecutive Days</label>
                  <input
                    type="number" required min={1}
                    value={typeForm.maxConsecutiveDays}
                    onChange={e => setTypeForm({ ...typeForm, maxConsecutiveDays: Number(e.target.value) })}
                    className="w-full mt-1.5 px-3 py-2 bg-surface-50 dark:bg-surface-900 border rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-surface-50 dark:bg-surface-900 p-3 rounded-xl border">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="editCarryForwardAllowed"
                    checked={typeForm.carryForwardAllowed}
                    onChange={e => setTypeForm({ ...typeForm, carryForwardAllowed: e.target.checked })}
                    className="rounded text-primary-600 focus:ring-primary-500 h-4 w-4"
                  />
                  <label htmlFor="editCarryForwardAllowed" className="cursor-pointer">Carry Forward</label>
                </div>
                {typeForm.carryForwardAllowed && (
                  <div>
                    <label className="uppercase">Max Carry Days</label>
                    <input
                      type="number" required min={0}
                      value={typeForm.maxCarryForwardDays}
                      onChange={e => setTypeForm({ ...typeForm, maxCarryForwardDays: Number(e.target.value) })}
                      className="w-full mt-1 px-2 py-1 bg-white dark:bg-surface-950 border rounded-lg text-xs font-bold"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="editEncashmentAllowed"
                    checked={typeForm.encashmentAllowed}
                    onChange={e => setTypeForm({ ...typeForm, encashmentAllowed: e.target.checked })}
                    className="rounded text-primary-600 h-4 w-4"
                  />
                  <label htmlFor="editEncashmentAllowed" className="cursor-pointer">Encashable</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="editHalfDayAllowed"
                    checked={typeForm.halfDayAllowed}
                    onChange={e => setTypeForm({ ...typeForm, halfDayAllowed: e.target.checked })}
                    className="rounded text-primary-600 h-4 w-4"
                  />
                  <label htmlFor="editHalfDayAllowed" className="cursor-pointer">Half Day</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="editNegativeBalanceAllowed"
                    checked={typeForm.negativeBalanceAllowed}
                    onChange={e => setTypeForm({ ...typeForm, negativeBalanceAllowed: e.target.checked })}
                    className="rounded text-primary-600 h-4 w-4"
                  />
                  <label htmlFor="editNegativeBalanceAllowed" className="cursor-pointer">Negative Bal</label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="editRequiresApproval"
                    checked={typeForm.requiresApproval}
                    onChange={e => setTypeForm({ ...typeForm, requiresApproval: e.target.checked })}
                    className="rounded text-primary-600 h-4 w-4"
                  />
                  <label htmlFor="editRequiresApproval" className="cursor-pointer">Requires Approval</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="editRequiresDocument"
                    checked={typeForm.requiresDocument}
                    onChange={e => setTypeForm({ ...typeForm, requiresDocument: e.target.checked })}
                    className="rounded text-primary-600 h-4 w-4"
                  />
                  <label htmlFor="editRequiresDocument" className="cursor-pointer">Req Certificate</label>
                </div>
              </div>

              <button type="submit" className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold mt-2 shadow-sm">Update Leave Type</button>
            </form>
          </div>
        </div>
      )}

      {/* ADJUST BALANCE DIALOG */}
      {showAdjustBalanceModal && (
        <div className="fixed inset-0 bg-surface-950/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-surface-850 rounded-2xl border border-surface-200 dark:border-surface-800 w-full max-w-sm p-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-surface-100 dark:border-surface-750 pb-3">
              <h3 className="text-lg font-bold">Adjust Leave Balance</h3>
              <button onClick={() => setShowAdjustBalanceModal(false)} className="text-surface-400 text-xl font-bold">&times;</button>
            </div>
            <form onSubmit={handleAdjustBalance} className="space-y-4 mt-4 text-xs font-semibold text-surface-500">
              <div>
                <label className="uppercase">Employee</label>
                <select
                  required
                  value={adjustBalanceForm.employeeId}
                  onChange={e => setAdjustBalanceForm({ ...adjustBalanceForm, employeeId: e.target.value })}
                  className="w-full mt-1.5 px-3 py-2 bg-surface-50 dark:bg-surface-900 border rounded-xl text-sm font-semibold"
                >
                  <option value="">Select Employee...</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.employeeCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="uppercase">Leave Type</label>
                <select
                  required
                  value={adjustBalanceForm.leaveTypeId}
                  onChange={e => setAdjustBalanceForm({ ...adjustBalanceForm, leaveTypeId: e.target.value })}
                  className="w-full mt-1.5 px-3 py-2 bg-surface-50 dark:bg-surface-900 border rounded-xl text-sm font-semibold"
                >
                  <option value="">Select Leave Type...</option>
                  {leaveTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.name} ({type.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="uppercase">Adjustment Mode</label>
                  <select
                    value={adjustBalanceForm.mode}
                    onChange={e => setAdjustBalanceForm({ ...adjustBalanceForm, mode: e.target.value as any })}
                    className="w-full mt-1.5 px-3 py-2 bg-surface-50 dark:bg-surface-900 border rounded-xl text-sm font-semibold"
                  >
                    <option value="credit">Credit (+)</option>
                    <option value="debit">Debit (-)</option>
                  </select>
                </div>
                <div>
                  <label className="uppercase">Days Amount</label>
                  <input
                    type="number" required min={0.5} step={0.5}
                    value={adjustBalanceForm.amount}
                    onChange={e => setAdjustBalanceForm({ ...adjustBalanceForm, amount: Number(e.target.value) })}
                    className="w-full mt-1.5 px-3 py-2 bg-surface-50 dark:bg-surface-900 border rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="uppercase">Reason for adjustment</label>
                <input
                  type="text" required
                  placeholder="e.g. Carry forward correction"
                  value={adjustBalanceForm.reason}
                  onChange={e => setAdjustBalanceForm({ ...adjustBalanceForm, reason: e.target.value })}
                  className="w-full mt-1.5 px-3 py-2 bg-surface-50 dark:bg-surface-900 border rounded-xl text-sm"
                />
              </div>

              <button type="submit" className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold mt-2 shadow-sm">Save Adjustment</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// Sub-component to load balances for selected employee
function LeaveBalancesList({ 
  employeeId, 
  year, 
  employees, 
  leaveTypes,
  filterTypeId,
  recalculateBalances,
  setSuccessMessage
}: { 
  employeeId: string; 
  year: number; 
  employees: any[]; 
  leaveTypes: LeaveType[];
  filterTypeId: string;
  recalculateBalances: any;
  setSuccessMessage: any;
}) {
  const { data: userBalances = [], isLoading, refetch } = useGetLeaveBalancesQuery({ employeeId, year });
  const employee = employees.find(e => e.id === employeeId);

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const filteredBalances = filterTypeId 
    ? userBalances.filter(b => b.leaveTypeId === filterTypeId)
    : userBalances;

  const handleRecalculateSingle = async () => {
    try {
      await recalculateBalances({ employeeId, action: 'recalculate' }).unwrap();
      refetch();
      setSuccessMessage("Employee balances recalculated successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      alert("Failed to recalculate balances: " + (err.data?.message || err.message));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-primary-50/30 dark:bg-primary-950/10 p-3 rounded-xl border border-primary-100 dark:border-primary-900/50">
        <span className="text-xs font-bold text-primary-800 dark:text-primary-300">
          Showing balances for: {employee?.firstName} {employee?.lastName} ({employee?.employeeCode}) for Year {year}
        </span>
        <button
          onClick={handleRecalculateSingle}
          className="text-xs bg-primary-600 hover:bg-primary-700 text-white font-bold px-2.5 py-1 rounded-lg transition-all"
        >
          Recalculate
        </button>
      </div>

      <div className="overflow-x-auto border border-surface-200 dark:border-surface-800 rounded-xl">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="text-xs text-surface-400 font-bold uppercase tracking-wider border-b border-surface-200 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-800/20">
              <th className="p-3.5">Leave Type</th>
              <th className="p-3.5">Allocated</th>
              <th className="p-3.5">Carried Forward</th>
              <th className="p-3.5">Used</th>
              <th className="p-3.5">Pending</th>
              <th className="p-3.5 font-bold">Available Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-150 dark:divide-surface-800 text-xs">
            {filteredBalances.map((b) => {
              const type = leaveTypes.find(t => t.id === b.leaveTypeId);
              return (
                <tr key={b.id} className="hover:bg-surface-50/50 dark:hover:bg-surface-800/10 font-medium">
                  <td className="p-3.5 font-bold text-surface-800 dark:text-surface-200">{type?.name || 'Unknown'} ({type?.code || '?'})</td>
                  <td className="p-3.5 font-semibold text-surface-700 dark:text-surface-300">{b.totalAllocated} Days</td>
                  <td className="p-3.5 font-semibold text-surface-700 dark:text-surface-300">{b.carriedForward} Days</td>
                  <td className="p-3.5 font-bold text-red-650 dark:text-red-400">{b.totalUsed} Days</td>
                  <td className="p-3.5 font-bold text-amber-600 dark:text-amber-455">{b.totalPending} Days</td>
                  <td className="p-3.5 font-bold text-green-650 dark:text-green-400">{b.balance} Days</td>
                </tr>
              );
            })}
            {filteredBalances.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-surface-400 italic">No leave balances found for this year.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
