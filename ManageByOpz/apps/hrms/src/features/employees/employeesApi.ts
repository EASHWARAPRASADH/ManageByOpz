import { platformApi } from '../../app/api';

export interface Skill {
  id?: string;
  name: string;
  category: 'TECHNICAL' | 'FUNCTIONAL' | 'SOFT';
  level: string;
}

export interface Document {
  id?: string;
  name: string;
  type: string;
  size: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  expiry: string;
}

export interface Relationship {
  id?: string;
  name: string;
  role: string;
  type: 'MANAGER' | 'BUDDY' | 'HRBP' | 'MENTEE' | 'SUBORDINATE';
}

export interface TimelineEvent {
  id?: string;
  date: string;
  title: string;
  description: string;
}

export interface EmployeeTwin {
  id?: string;
  employeeCode: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  displayName: string;
  workEmail: string;
  personalEmail?: string;
  workPhone?: string;
  personalPhone?: string;
  workPhoneCountryCode?: string;
  workPhoneNumber?: string;
  workPhoneFull?: string;
  personalPhoneCountryCode?: string;
  personalPhoneNumber?: string;
  personalPhoneFull?: string;
  gender?: string;
  dateOfBirth?: string;
  currentAddress?: string;
  permanentAddress?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  // DNA
  organizationId?: string;
  businessUnitId?: string;
  divisionId?: string;
  departmentId?: string;
  subDepartmentId?: string;
  designationId?: string;
  locationId?: string;
  gradeId?: string;
  bandId?: string;
  costCenterId?: string;
  employmentTypeId?: string;
  managerId?: string;
  skipManagerId?: string;
  departmentHeadId?: string;
  hrbpId?: string;
  mentorId?: string;
  buddyId?: string;
  dateOfJoining?: string;
  employmentStatus: 'ACTIVE' | 'ON_PROBATION' | 'ON_NOTICE' | 'ON_LEAVE' | 'SUSPENDED' | 'TERMINATED';
  workMode?: string;
  // Compliance
  panNumber?: string;
  aadhaarNumber?: string;
  uanNumber?: string;
  esicNumber?: string;
  passportNumber?: string;
  passportExpiry?: string;
  // Banking
  bankName?: string;
  bankAccountNumber?: string;
  bankIfsc?: string;
  bankBranch?: string;
  // Extensions
  skills?: Skill[];
  certifications?: any[];
  documents?: Document[];
  relationships?: any[];
  timeline?: TimelineEvent[];
}

export const employeesApi = platformApi.injectEndpoints({
  endpoints: (builder) => ({
    getEmployees: builder.query<EmployeeTwin[], boolean | void>({
      query: (showArchived) => ({
        url: '/v1/employees',
        params: showArchived ? { showArchived: 'true' } : {},
      }),
      transformResponse: (response: any) => response.data || [],
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ id }) => ({ type: 'Employee' as const, id })),
            { type: 'Employee', id: 'LIST' },
          ]
          : [{ type: 'Employee', id: 'LIST' }],
    }),
    getEmployeeById: builder.query<EmployeeTwin, string>({
      query: (id) => `/v1/employees/${id}`,
      transformResponse: (response: any) => response.data,
      providesTags: (_result, _error, id) => [{ type: 'Employee', id }],
    }),
    createEmployee: builder.mutation<EmployeeTwin, Partial<EmployeeTwin>>({
      query: (body) => ({
        url: '/v1/employees',
        method: 'POST',
        body,
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: [{ type: 'Employee', id: 'LIST' }],
    }),
    updateEmployee: builder.mutation<EmployeeTwin, { id: string; body: Partial<EmployeeTwin> }>({
      query: ({ id, body }) => ({
        url: `/v1/employees/${id}`,
        method: 'PUT',
        body,
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Employee', id }, { type: 'Employee', id: 'LIST' }],
    }),
    transferEmployee: builder.mutation<EmployeeTwin, { id: string; departmentId: string; locationId: string }>({
      query: ({ id, departmentId, locationId }) => ({
        url: `/v1/employees/${id}/transfer`,
        method: 'POST',
        params: { newDepartmentId: departmentId, newLocationId: locationId },
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Employee', id }, { type: 'Employee', id: 'LIST' }],
    }),
    promoteEmployee: builder.mutation<EmployeeTwin, { id: string; designationId: string; gradeId: string }>({
      query: ({ id, designationId, gradeId }) => ({
        url: `/v1/employees/${id}/promote`,
        method: 'POST',
        params: { newDesignationId: designationId, newGradeId: gradeId },
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Employee', id }, { type: 'Employee', id: 'LIST' }],
    }),
    changeManager: builder.mutation<EmployeeTwin, { id: string; managerId: string }>({
      query: ({ id, managerId }) => ({
        url: `/v1/employees/${id}/change-manager`,
        method: 'POST',
        params: { newManagerId: managerId },
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Employee', id }, { type: 'Employee', id: 'LIST' }],
    }),
    terminateEmployee: builder.mutation<EmployeeTwin, { id: string; exitDate: string; reason: string }>({
      query: ({ id, exitDate, reason }) => ({
        url: `/v1/employees/${id}/terminate`,
        method: 'POST',
        params: { exitDate, reason },
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Employee', id }, { type: 'Employee', id: 'LIST' }],
    }),
    archiveEmployee: builder.mutation<EmployeeTwin, { id: string; reason: string }>({
      query: ({ id, reason }) => ({
        url: `/v1/employees/${id}/archive`,
        method: 'POST',
        params: { reason },
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Employee', id }, { type: 'Employee', id: 'LIST' }],
    }),
    restoreEmployee: builder.mutation<EmployeeTwin, string>({
      query: (id) => ({
        url: `/v1/employees/${id}/restore`,
        method: 'POST',
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: (_result, _error, id) => [{ type: 'Employee', id }, { type: 'Employee', id: 'LIST' }],
    }),
    bulkArchiveEmployees: builder.mutation<void, { ids: string[]; reason: string }>({
      query: ({ ids, reason }) => ({
        url: '/v1/employees/bulk-archive',
        method: 'POST',
        params: { ids: ids.join(','), reason },
      }),
      invalidatesTags: [{ type: 'Employee', id: 'LIST' }],
    }),
    bulkReassignManager: builder.mutation<void, { employeeIds: string[]; managerId: string; effectiveDate: string; reason: string }>({
      query: (body) => ({
        url: '/v1/employees/bulk-reassign-manager',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Employee', id: 'LIST' }],
    }),
    bulkTerminateEmployees: builder.mutation<void, { employeeIds: string[]; terminationDate: string; finalWorkingDay: string; reason: string }>({
      query: (body) => ({
        url: '/v1/employees/bulk-terminate',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Employee', id: 'LIST' }],
    }),
    deleteEmployee: builder.mutation<void, string>({
      query: (id) => ({
        url: `/v1/employees/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Employee', id: 'LIST' }],
    }),
    getCompletionScore: builder.query<number, string>({
      query: (id) => `/v1/employees/${id}/completion`,
      transformResponse: (response: any) => response.data,
    }),
    getNextEmployeeCode: builder.query<string, string | undefined>({
      query: (orgId) => ({
        url: '/v1/employees/preview/next-code',
        params: orgId ? { organizationId: orgId } : {},
      }),
      transformResponse: (response: any) => response.data,
    }),
    onboardEmployee: builder.mutation<EmployeeTwin, Partial<EmployeeTwin>>({
      query: (body) => ({
        url: '/v1/onboarding',
        method: 'POST',
        body,
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: [{ type: 'Employee', id: 'LIST' }],
    }),
    getEmployeeAccount: builder.query<any, string>({
      query: (employeeId) => `/v1/employees/${employeeId}/account`,
      transformResponse: (response: any) => response.data,
      providesTags: (_result, _error, id) => [{ type: 'Employee' as const, id }],
    }),
    updateEmployeeAccount: builder.mutation<any, { employeeId: string; body: any }>({
      query: ({ employeeId, body }) => ({
        url: `/v1/employees/${employeeId}/account`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { employeeId }) => [{ type: 'Employee', id: employeeId }],
    }),
    resendActivation: builder.mutation<any, string>({
      query: (employeeId) => ({
        url: `/v1/employees/${employeeId}/account/resend-activation`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, employeeId) => [{ type: 'Employee', id: employeeId }],
    }),
    resetPassword: builder.mutation<any, { employeeId: string; body: any }>({
      query: ({ employeeId, body }) => ({
        url: `/v1/employees/${employeeId}/account/reset-password`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { employeeId }) => [{ type: 'Employee', id: employeeId }],
    }),
    unlockAccount: builder.mutation<any, string>({
      query: (employeeId) => ({
        url: `/v1/employees/${employeeId}/account/unlock`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, employeeId) => [{ type: 'Employee', id: employeeId }],
    }),
    disableAccount: builder.mutation<any, string>({
      query: (employeeId) => ({
        url: `/v1/employees/${employeeId}/account/disable`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, employeeId) => [{ type: 'Employee', id: employeeId }],
    }),
    enableAccount: builder.mutation<any, string>({
      query: (employeeId) => ({
        url: `/v1/employees/${employeeId}/account/enable`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, employeeId) => [{ type: 'Employee', id: employeeId }],
    }),
    forcePasswordChange: builder.mutation<any, string>({
      query: (employeeId) => ({
        url: `/v1/employees/${employeeId}/account/force-password-change`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, employeeId) => [{ type: 'Employee', id: employeeId }],
    }),
    generateTempPassword: builder.mutation<any, string>({
      query: (employeeId) => ({
        url: `/v1/employees/${employeeId}/account/generate-temp-password`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, employeeId) => [{ type: 'Employee', id: employeeId }],
    }),
  }),
});

export const {
  useGetEmployeesQuery,
  useGetEmployeeByIdQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useTransferEmployeeMutation,
  usePromoteEmployeeMutation,
  useChangeManagerMutation,
  useTerminateEmployeeMutation,
  useArchiveEmployeeMutation,
  useRestoreEmployeeMutation,
  useBulkArchiveEmployeesMutation,
  useBulkReassignManagerMutation,
  useBulkTerminateEmployeesMutation,
  useDeleteEmployeeMutation,
  useGetCompletionScoreQuery,
  useGetNextEmployeeCodeQuery,
  useOnboardEmployeeMutation,
  useGetEmployeeAccountQuery,
  useUpdateEmployeeAccountMutation,
  useResendActivationMutation,
  useResetPasswordMutation,
  useUnlockAccountMutation,
  useDisableAccountMutation,
  useEnableAccountMutation,
  useForcePasswordChangeMutation,
  useGenerateTempPasswordMutation,
} = employeesApi;
