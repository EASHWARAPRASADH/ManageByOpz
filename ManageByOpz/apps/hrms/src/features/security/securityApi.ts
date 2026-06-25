import { platformApi } from '../../app/api';

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  employeeId: string | null;
  active: boolean;
  roles: Role[];
  status?: string;
  locked?: boolean;
}

export interface Role {
  id: string;
  name: string;
  code: string;
  priority: number;
  systemRole?: boolean;
  description?: string;
  active?: boolean;
}

export interface Permission {
  id: string;
  name: string;
  code: string;
  module: string;
  permissionKey: string;
}

export interface TokenResponse {
  token: string;
  username: string;
  tenantId: string;
  role: string;
  employeeId: string | null;
}

export const securityApi = platformApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<User[], void>({
      query: () => '/v1/security/users',
      transformResponse: (response: { data: User[] }) => response.data,
      providesTags: ['User'],
    }),
    createUser: builder.mutation<User, Partial<User> & { password?: string; roleCodes?: string[] }>({
      query: (body) => ({
        url: '/v1/security/users',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User'],
    }),
    assignRole: builder.mutation<User, { userId: string; roleCode: string }>({
      query: ({ userId, roleCode }) => ({
        url: `/v1/security/users/${userId}/roles`,
        method: 'POST',
        body: { roleCode },
      }),
      invalidatesTags: ['User'],
    }),
    revokeRole: builder.mutation<User, { userId: string; roleId: string }>({
      query: ({ userId, roleId }) => ({
        url: `/v1/security/users/${userId}/roles/${roleId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
    getRoles: builder.query<Role[], void>({
      query: () => '/v1/security/roles',
      transformResponse: (response: { data: Role[] }) => response.data,
      providesTags: ['Role'],
    }),
    getPermissions: builder.query<Permission[], void>({
      query: () => '/v1/security/permissions',
      transformResponse: (response: { data: Permission[] }) => response.data,
    }),
    generateToken: builder.mutation<TokenResponse, { username: string; tenantId: string; role: string; employeeId?: string }>({
      query: (body) => ({
        url: '/v1/security/auth/token',
        method: 'POST',
        body,
      }),
      transformResponse: (response: { data: TokenResponse }) => response.data,
    }),
    lockUser: builder.mutation<void, string>({
      query: (userId) => ({
        url: `/v1/security/users/${userId}/lock`,
        method: 'PUT',
      }),
      invalidatesTags: ['User'],
    }),
    unlockUser: builder.mutation<void, string>({
      query: (userId) => ({
        url: `/v1/security/users/${userId}/unlock`,
        method: 'PUT',
      }),
      invalidatesTags: ['User'],
    }),
    resendActivation: builder.mutation<void, string>({
      query: (userId) => ({
        url: `/v1/security/users/${userId}/resend-activation`,
        method: 'POST',
      }),
    }),
    adminResetPassword: builder.mutation<void, { userId: string; password?: string }>({
      query: ({ userId, password }) => ({
        url: `/v1/security/users/${userId}/reset-password`,
        method: 'PUT',
        body: { password },
      }),
    }),
    getMatrix: builder.query<any, void>({
      query: () => '/v1/security/matrix',
      transformResponse: (response: { data: any }) => response.data,
      providesTags: ['Matrix'],
    }),
    getMyNavigation: builder.query<any, void>({
      query: () => '/v1/security/my-navigation',
      transformResponse: (response: { data: any }) => response.data,
      providesTags: ['Matrix'],
    }),
    updateMatrix: builder.mutation<void, { targetType: string; targetId: string; pageId: string; permissionId: string; allow: boolean }>({
      query: (body) => ({
        url: '/v1/security/matrix',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Matrix'],
    }),
    getFieldPermissions: builder.query<any[], void>({
      query: () => '/v1/security/field-permissions',
      transformResponse: (response: { data: any[] }) => response.data,
      providesTags: ['FieldPermission'],
    }),
    saveFieldPermission: builder.mutation<any, any>({
      query: (body) => ({
        url: '/v1/security/field-permissions',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['FieldPermission'],
    }),
    getAuditLogs: builder.query<any[], void>({
      query: () => '/v1/security/audit',
      transformResponse: (response: { data: any[] }) => response.data,
      providesTags: ['Audit'],
    }),
    applyTemplate: builder.mutation<void, { roleId: string; templateCode: string }>({
      query: (body) => ({
        url: '/v1/security/templates/apply',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Matrix', 'Audit'],
    }),
    createRole: builder.mutation<Role, { name: string; description: string; baseRoleCode?: string }>({
      query: (body) => ({
        url: '/v1/security/roles',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Role', 'Matrix', 'Audit'],
    }),
    cloneRole: builder.mutation<Role, { roleId: string; name: string; description: string }>({
      query: ({ roleId, name, description }) => ({
        url: `/v1/security/roles/${roleId}/clone`,
        method: 'POST',
        body: { name, description },
      }),
      invalidatesTags: ['Role', 'Matrix', 'Audit'],
    }),
    archiveRole: builder.mutation<void, string>({
      query: (roleId) => ({
        url: `/v1/security/roles/${roleId}/archive`,
        method: 'PUT',
      }),
      invalidatesTags: ['Role', 'Matrix', 'Audit'],
    }),
    getDataScopes: builder.query<any[], void>({
      query: () => '/v1/security/data-scopes',
      transformResponse: (response: { data: any[] }) => response.data,
      providesTags: ['DataScope' as any],
    }),
    saveDataScope: builder.mutation<any, any>({
      query: (body) => ({
        url: '/v1/security/data-scopes',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['DataScope' as any, 'Audit'],
    }),
    deleteDataScope: builder.mutation<void, string>({
      query: (id) => ({
        url: `/v1/security/data-scopes/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['DataScope' as any, 'Audit'],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useCreateUserMutation,
  useAssignRoleMutation,
  useRevokeRoleMutation,
  useGetRolesQuery,
  useGetPermissionsQuery,
  useGenerateTokenMutation,
  useLockUserMutation,
  useUnlockUserMutation,
  useResendActivationMutation,
  useAdminResetPasswordMutation,
  useGetMatrixQuery,
  useGetMyNavigationQuery,
  useUpdateMatrixMutation,
  useGetFieldPermissionsQuery,
  useSaveFieldPermissionMutation,
  useGetAuditLogsQuery,
  useApplyTemplateMutation,
  useCreateRoleMutation,
  useCloneRoleMutation,
  useArchiveRoleMutation,
  useGetDataScopesQuery,
  useSaveDataScopeMutation,
  useDeleteDataScopeMutation,
} = securityApi;
