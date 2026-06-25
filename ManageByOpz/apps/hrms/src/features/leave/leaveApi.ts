import { platformApi } from '../../app/api';

export interface LeaveType {
  id: string;
  name: string;
  code: string;
  description: string;
  defaultDays: number;
  carryForwardAllowed: boolean;
  maxCarryForwardDays: number;
  encashmentAllowed: boolean;
  halfDayAllowed: boolean;
  negativeBalanceAllowed: boolean;
  requiresApproval: boolean;
  requiresDocument: boolean;
  minDaysNotice: number;
  maxConsecutiveDays: number;
  active: boolean;
  category?: string;
  genderEligibility?: string;
}

export interface LeaveBalance {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  year: number;
  totalAllocated: number;
  totalUsed: number;
  totalPending: number;
  carriedForward: number;
  balance: number;
}

export interface LeaveRequest {
  id?: string;
  employeeId: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  daysCount: number;
  halfDay: boolean;
  halfDayType?: 'FIRST_HALF' | 'SECOND_HALF';
  reason: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'AUTO_APPROVED' | 'PENDING_L1' | 'PENDING_L2' | 'PENDING_L3' | 'PENDING_L4' | 'WITHDRAWN';
  approvedBy?: string;
  rejectionReason?: string;
  workflowInstanceId?: string;
  cancellationReason?: string;
}

export interface HolidayCalendar {
  id?: string;
  organizationId?: string;
  calendarName: string;
  country: string;
  state: string;
  year: number;
  active: boolean;
}

export interface HolidayCalendarDay {
  id?: string;
  holidayCalendarId: string;
  holidayDate: string;
  holidayName: string;
  holidayType: string;
  optionalHoliday: boolean;
  active: boolean;
}

export interface LeavePolicy {
  id?: string;
  policyName: string;
  policyCode: string;
  description: string;
  effectiveFrom: string;
  effectiveTo?: string;
  active: boolean;
  status?: string;
  organizationScope?: string;
}

export interface LeavePolicyRule {
  id?: string;
  policyId: string;
  leaveTypeId: string;
  allocatedDays: number;
  accrualMethod: string; // YEARLY, MONTHLY, QUARTERLY
  carryForwardLimit: number;
  encashmentAllowed: boolean;
  negativeBalanceAllowed: boolean;
  noticePeriod?: number;
  minServiceDays?: number;
  attachmentRequired?: boolean;
  halfDayAllowed?: boolean;
  genderEligibility?: string;
  employmentTypeEligibility?: string;
}

export interface LeavePolicyAssignment {
  id?: string;
  policyId: string;
  organizationId?: string;
  businessUnitId?: string;
  departmentId?: string;
  gradeId?: string;
  bandId?: string;
  employmentTypeId?: string;
}

export const leaveApi = platformApi.injectEndpoints({
  endpoints: (builder) => ({
    getLeaveTypes: builder.query<LeaveType[], void>({
      query: () => '/v1/leave/types',
      transformResponse: (response: any) => response.data || [],
      providesTags: [{ type: 'LeaveRequest', id: 'TYPES' }],
    }),
    createLeaveType: builder.mutation<LeaveType, Partial<LeaveType>>({
      query: (body) => ({
        url: '/v1/leave/types',
        method: 'POST',
        body,
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: [{ type: 'LeaveRequest', id: 'TYPES' }],
    }),
    updateLeaveType: builder.mutation<LeaveType, { id: string; body: Partial<LeaveType> }>({
      query: ({ id, body }) => ({
        url: `/v1/leave/types/${id}`,
        method: 'PUT',
        body,
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: [{ type: 'LeaveRequest', id: 'TYPES' }],
    }),
    getLeaveBalances: builder.query<LeaveBalance[], { employeeId: string; year: number }>({
      query: ({ employeeId, year }) => `/v1/leave/balances/employee/${employeeId}?year=${year}`,
      transformResponse: (response: any) => response.data || [],
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'LeaveBalance' as const, id })),
              { type: 'LeaveBalance', id: 'LIST' },
            ]
          : [{ type: 'LeaveBalance', id: 'LIST' }],
    }),
    getLeaveRequests: builder.query<LeaveRequest[], string>({
      query: (employeeId) => `/v1/leave/requests/employee/${employeeId}`,
      transformResponse: (response: any) => response.data || [],
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'LeaveRequest' as const, id })),
              { type: 'LeaveRequest', id: 'LIST' },
            ]
          : [{ type: 'LeaveRequest', id: 'LIST' }],
    }),
    getAllLeaveRequests: builder.query<LeaveRequest[], void>({
      query: () => '/v1/leave/requests',
      transformResponse: (response: any) => response.data || [],
      providesTags: [{ type: 'LeaveRequest', id: 'LIST' }],
    }),
    applyLeave: builder.mutation<LeaveRequest, Partial<LeaveRequest>>({
      query: (body) => ({
        url: '/v1/leave/requests',
        method: 'POST',
        body,
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: [
        { type: 'LeaveRequest', id: 'LIST' },
        { type: 'LeaveBalance', id: 'LIST' },
      ],
    }),
    actionLeave: builder.mutation<LeaveRequest, { id: string; status: string; comment?: string }>({
      query: ({ id, status, comment }) => ({
        url: `/v1/leave/requests/${id}/action`,
        method: 'POST',
        params: { status, comment: comment || '' },
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: [
        { type: 'LeaveRequest', id: 'LIST' },
        { type: 'LeaveBalance', id: 'LIST' },
      ],
    }),
    // Holiday Calendars
    getHolidayCalendars: builder.query<HolidayCalendar[], void>({
      query: () => '/v1/holiday-calendars',
      transformResponse: (response: any) => response.data || [],
      providesTags: [{ type: 'LeaveRequest', id: 'CALENDARS' }],
    }),
    createHolidayCalendar: builder.mutation<HolidayCalendar, Partial<HolidayCalendar>>({
      query: (body) => ({
        url: '/v1/holiday-calendars',
        method: 'POST',
        body,
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: [{ type: 'LeaveRequest', id: 'CALENDARS' }],
    }),
    getCalendarDays: builder.query<HolidayCalendarDay[], string>({
      query: (calendarId) => `/v1/holiday-calendars/${calendarId}/days`,
      transformResponse: (response: any) => response.data || [],
      providesTags: (result, error, calendarId) => [{ type: 'LeaveRequest', id: `DAYS_${calendarId}` }],
    }),
    createCalendarDay: builder.mutation<HolidayCalendarDay, { calendarId: string; body: Partial<HolidayCalendarDay> }>({
      query: ({ calendarId, body }) => ({
        url: `/v1/holiday-calendars/${calendarId}/days`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: (result, error, { calendarId }) => [{ type: 'LeaveRequest', id: `DAYS_${calendarId}` }],
    }),
    // Leave Policies
    getLeavePolicies: builder.query<LeavePolicy[], void>({
      query: () => '/v1/leave-policies',
      transformResponse: (response: any) => response.data || [],
      providesTags: [{ type: 'LeaveRequest', id: 'POLICIES' }],
    }),
    createLeavePolicy: builder.mutation<LeavePolicy, Partial<LeavePolicy>>({
      query: (body) => ({
        url: '/v1/leave-policies',
        method: 'POST',
        body,
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: [{ type: 'LeaveRequest', id: 'POLICIES' }],
    }),
    updateLeavePolicy: builder.mutation<LeavePolicy, { id: string; body: Partial<LeavePolicy> }>({
      query: ({ id, body }) => ({
        url: `/v1/leave-policies/${id}`,
        method: 'PUT',
        body,
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: [{ type: 'LeaveRequest', id: 'POLICIES' }],
    }),
    cloneLeavePolicy: builder.mutation<LeavePolicy, { id: string; newName: string; newCode: string }>({
      query: ({ id, newName, newCode }) => ({
        url: `/v1/leave-policies/${id}/clone`,
        method: 'POST',
        params: { newName, newCode },
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: [{ type: 'LeaveRequest', id: 'POLICIES' }],
    }),
    archiveLeavePolicy: builder.mutation<void, string>({
      query: (id) => ({
        url: `/v1/leave-policies/${id}/archive`,
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'LeaveRequest', id: 'POLICIES' }],
    }),
    activateLeavePolicy: builder.mutation<void, string>({
      query: (id) => ({
        url: `/v1/leave-policies/${id}/activate`,
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'LeaveRequest', id: 'POLICIES' }],
    }),
    deactivateLeavePolicy: builder.mutation<void, string>({
      query: (id) => ({
        url: `/v1/leave-policies/${id}/deactivate`,
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'LeaveRequest', id: 'POLICIES' }],
    }),
    deleteLeavePolicy: builder.mutation<void, string>({
      query: (id) => ({
        url: `/v1/leave-policies/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'LeaveRequest', id: 'POLICIES' }],
    }),
    getPolicyRules: builder.query<LeavePolicyRule[], string>({
      query: (policyId) => `/v1/leave-policies/${policyId}/rules`,
      transformResponse: (response: any) => response.data || [],
      providesTags: (result, error, policyId) => [{ type: 'LeaveRequest', id: `RULES_${policyId}` }],
    }),
    createPolicyRule: builder.mutation<LeavePolicyRule, { policyId: string; body: Partial<LeavePolicyRule> }>({
      query: ({ policyId, body }) => ({
        url: `/v1/leave-policies/${policyId}/rules`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: (result, error, { policyId }) => [
        { type: 'LeaveRequest', id: `RULES_${policyId}` },
        { type: 'LeaveRequest', id: 'POLICIES' }
      ],
    }),
    updatePolicyRule: builder.mutation<LeavePolicyRule, { ruleId: string; body: Partial<LeavePolicyRule> }>({
      query: ({ ruleId, body }) => ({
        url: `/v1/leave-policies/rules/${ruleId}`,
        method: 'PUT',
        body,
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: (result, error, { body }) => [
        { type: 'LeaveRequest', id: `RULES_${body.policyId}` },
        { type: 'LeaveRequest', id: 'POLICIES' }
      ],
    }),
    deletePolicyRule: builder.mutation<void, { ruleId: string; policyId: string }>({
      query: ({ ruleId }) => ({
        url: `/v1/leave-policies/rules/${ruleId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { policyId }) => [
        { type: 'LeaveRequest', id: `RULES_${policyId}` },
        { type: 'LeaveRequest', id: 'POLICIES' }
      ],
    }),
    getPolicyAssignments: builder.query<LeavePolicyAssignment[], void>({
      query: () => '/v1/leave-policies/assignments',
      transformResponse: (response: any) => response.data || [],
      providesTags: [{ type: 'LeaveRequest', id: 'ASSIGNMENTS' }],
    }),
    createPolicyAssignment: builder.mutation<LeavePolicyAssignment, Partial<LeavePolicyAssignment>>({
      query: (body) => ({
        url: '/v1/leave-policies/assignments',
        method: 'POST',
        body,
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: [
        { type: 'LeaveRequest', id: 'ASSIGNMENTS' },
        { type: 'LeaveRequest', id: 'POLICIES' }
      ],
    }),
    deletePolicyAssignment: builder.mutation<void, { assignmentId: string; policyId: string }>({
      query: ({ assignmentId }) => ({
        url: `/v1/leave-policies/assignments/${assignmentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { policyId }) => [
        { type: 'LeaveRequest', id: 'ASSIGNMENTS' },
        { type: 'LeaveRequest', id: 'POLICIES' }
      ],
    }),
    getPolicyAssignmentsForId: builder.query<LeavePolicyAssignment[], string>({
      query: (id) => `/v1/leave-policies/${id}/assignments`,
      transformResponse: (response: any) => response.data || [],
    }),
    getPolicyVersions: builder.query<any[], string>({
      query: (id) => `/v1/leave-policies/${id}/versions`,
      transformResponse: (response: any) => response.data || [],
    }),
    getPolicyAudits: builder.query<any[], string>({
      query: (id) => `/v1/leave-policies/${id}/audits`,
      transformResponse: (response: any) => response.data || [],
    }),
    getPolicyImpact: builder.query<any, { id: string; newAllocatedDays: number; leaveTypeId: string }>({
      query: ({ id, newAllocatedDays, leaveTypeId }) => ({
        url: `/v1/leave-policies/${id}/impact`,
        params: { newAllocatedDays, leaveTypeId },
      }),
      transformResponse: (response: any) => response.data,
    }),
    recalculateBalances: builder.mutation<void, { employeeId: string; action: 'recalculate' | 'regenerate' }>({
      query: ({ employeeId, action }) => ({
        url: `/v1/leave-policies/recalculate-balances`,
        method: 'POST',
        params: { employeeId, action },
      }),
      invalidatesTags: [{ type: 'LeaveBalance', id: 'LIST' }],
    }),
    adjustBalance: builder.mutation<LeaveBalance, { employeeId: string; leaveTypeId: string; year: number; amount: number; reason: string }>({
      query: ({ employeeId, leaveTypeId, year, amount, reason }) => ({
        url: '/v1/leave/balances/adjust',
        method: 'POST',
        params: { employeeId, leaveTypeId, year, amount, reason },
      }),
      invalidatesTags: [{ type: 'LeaveBalance', id: 'LIST' }],
    }),
    deleteLeaveType: builder.mutation<void, string>({
      query: (id) => ({
        url: `/v1/leave/types/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'LeaveRequest', id: 'TYPES' }],
    }),
    recalculateWallets: builder.mutation<any, { employeeId?: string }>({
      query: ({ employeeId }) => ({
        url: '/v1/leave/admin/recalculate-wallets',
        method: 'POST',
        params: { employeeId },
      }),
      invalidatesTags: [{ type: 'LeaveBalance', id: 'LIST' }],
    }),
    getCompOffRequests: builder.query<any[], string>({
      query: (employeeId) => `/v1/leave/comp-off/requests/${employeeId}`,
      transformResponse: (response: any) => response.data || [],
    }),
    getAllCompOffRequests: builder.query<any[], void>({
      query: () => '/v1/leave/comp-off/requests',
      transformResponse: (response: any) => response.data || [],
    }),
    getCompOffWallet: builder.query<any, string>({
      query: (employeeId) => `/v1/leave/comp-off/wallet/${employeeId}`,
      transformResponse: (response: any) => response.data,
    }),
    submitCompOffRequest: builder.mutation<any, { employeeId: string; workDate: string; hoursWorked: number; reason: string }>({
      query: (body) => ({
        url: '/v1/leave/comp-off',
        method: 'POST',
        body,
      }),
      transformResponse: (response: any) => response.data,
    }),
    getLiabilityReport: builder.query<any[], void>({
      query: () => '/v1/leave/liability/report',
      transformResponse: (response: any) => response.data || [],
    }),
    getLiabilityDashboard: builder.query<any, void>({
      query: () => '/v1/leave/liability/dashboard',
      transformResponse: (response: any) => response.data,
    }),
    getBurnoutRisk: builder.query<any, string>({
      query: (employeeId) => `/v1/leave/analytics/burnout/${employeeId}`,
      transformResponse: (response: any) => response.data,
    }),
    getRiskHeatmap: builder.query<any[], void>({
      query: () => '/v1/leave/analytics/heatmap',
      transformResponse: (response: any) => response.data || [],
    }),
    getExhaustionPrediction: builder.query<any, string>({
      query: (employeeId) => `/v1/leave/analytics/exhaustion/${employeeId}`,
      transformResponse: (response: any) => response.data,
    }),
    getFrequentAbsenteePatterns: builder.query<any[], void>({
      query: () => '/v1/leave/analytics/patterns',
      transformResponse: (response: any) => response.data || [],
    }),
    getWorkflowPreview: builder.query<any, { entityType: string; employeeId: string }>({
      query: ({ entityType, employeeId }) => `/v1/workflow/preview?entityType=${entityType}&employeeId=${employeeId}`,
      transformResponse: (response: any) => response.data,
    }),
    getResolvedPolicy: builder.query<any, string>({
      query: (employeeId) => `/v1/leave-policies/resolved/${employeeId}`,
      transformResponse: (response: any) => response.data,
    }),
    getTeamAvailability: builder.query<any, { employeeId: string; startDate: string; endDate: string }>({
      query: ({ employeeId, startDate, endDate }) => `/v1/leave/team-availability?employeeId=${employeeId}&startDate=${startDate}&endDate=${endDate}`,
      transformResponse: (response: any) => response.data,
    }),
  }),
});

export const {
  useGetLeaveTypesQuery,
  useCreateLeaveTypeMutation,
  useUpdateLeaveTypeMutation,
  useGetLeaveBalancesQuery,
  useGetLeaveRequestsQuery,
  useGetAllLeaveRequestsQuery,
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
  useGetPolicyImpactQuery,
  useRecalculateBalancesMutation,
  useAdjustBalanceMutation,
  useDeleteLeaveTypeMutation,
  useRecalculateWalletsMutation,
  useGetCompOffRequestsQuery,
  useGetAllCompOffRequestsQuery,
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
} = leaveApi;
