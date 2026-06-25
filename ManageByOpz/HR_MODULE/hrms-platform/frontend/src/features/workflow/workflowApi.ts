import { platformApi } from '../../app/api';

export interface WorkflowInstance {
  id: string;
  entityType: string;
  entityId: string;
  initiatedBy: string;
  currentStepOrder: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'ESCALATED' | 'DELEGATED';
  startedAt?: string;
  completedAt?: string;
  slaDeadline?: string;
  createdAt?: string;
}

export interface ApprovalTransaction {
  id: string;
  matrixId?: string;
  workflowInstanceId?: string;
  entityType: string;
  entityId: string;
  levelNumber: number;
  actedBy: string;
  action: string;
  comments?: string;
  ipAddress?: string;
  actedAt: string;
}

export interface ApprovalDelegation {
  id: string;
  fromEmployeeId: string;
  toEmployeeId: string;
  startDate: string;
  endDate: string;
  active: boolean;
}

export interface ApprovalTask {
  id: string;
  tenantId: string;
  workflowInstanceId: string;
  moduleType: string;
  requestId: string;
  approverEmployeeId: string;
  delegatedTo?: string;
  levelNo: number;
  actionStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'DELEGATED' | 'ARCHIVED';
  assignedAt: string;
  dueAt: string;
  completedAt?: string;
}

export interface TaskActionRequest {
  action: string;
  comments?: string;
}

export interface ActionRequest {
  entityType: string;
  entityId: string;
  action: string;
  comments?: string;
}

export interface DelegationRequest {
  fromEmployeeId: string;
  toEmployeeId: string;
  startDate: string;
  endDate: string;
}

export const workflowApi = platformApi.injectEndpoints({
  endpoints: (builder) => ({
    getPendingApprovals: builder.query<WorkflowInstance[], void>({
      query: () => '/v1/workflow/pending',
      transformResponse: (response: any) => response.data || [],
    }),
    processAction: builder.mutation<WorkflowInstance, ActionRequest>({
      query: (body) => ({
        url: '/v1/workflow/action',
        method: 'POST',
        body,
      }),
      transformResponse: (response: any) => response.data,
    }),
    getWorkflowHistory: builder.query<ApprovalTransaction[], { entityType: string; entityId: string }>({
      query: ({ entityType, entityId }) => `/v1/workflow/history/${entityType}/${entityId}`,
      transformResponse: (response: any) => response.data || [],
    }),
    createDelegation: builder.mutation<ApprovalDelegation, DelegationRequest>({
      query: (body) => ({
        url: '/v1/workflow/delegations',
        method: 'POST',
        body,
      }),
      transformResponse: (response: any) => response.data,
    }),
    getApprovalTasks: builder.query<ApprovalTask[], { status?: string }>({
      query: (params) => ({
        url: '/v1/workflow/tasks',
        params,
      }),
      transformResponse: (response: any) => response.data || [],
    }),
    processTaskAction: builder.mutation<ApprovalTask, { taskId: string; body: TaskActionRequest }>({
      query: ({ taskId, body }) => ({
        url: `/v1/workflow/tasks/${taskId}/action`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: any) => response.data,
    }),
  }),
});

export const {
  useGetPendingApprovalsQuery,
  useProcessActionMutation,
  useGetWorkflowHistoryQuery,
  useCreateDelegationMutation,
  useGetApprovalTasksQuery,
  useProcessTaskActionMutation,
} = workflowApi;
