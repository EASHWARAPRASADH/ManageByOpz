import { platformApi } from '../../app/api';

export interface Organization {
  id: string;
  name: string;
  code: string;
  legalName?: string;
  registrationNumber?: string;
  taxId?: string;
  industry?: string;
  website?: string;
  primaryEmail?: string;
  primaryPhone?: string;
  address?: string;
  country?: string;
  currency?: string;
  timezone?: string;
  emailDomain?: string;
  employeeCodeTemplate?: string;
  active: boolean;
  deleted?: boolean;
  effectiveDate?: string;
}

export interface BusinessUnit {
  id: string;
  name: string;
  code: string;
  description?: string;
  headEmployeeId?: string;
  active: boolean;
  deleted?: boolean;
  effectiveDate?: string;
}

export interface Division {
  id: string;
  name: string;
  code: string;
  description?: string;
  headEmployeeId?: string;
  active: boolean;
  deleted?: boolean;
  effectiveDate?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  headEmployeeId?: string;
  active: boolean;
  deleted?: boolean;
  effectiveDate?: string;
}

export interface Team {
  id: string;
  name: string;
  code: string;
  description?: string;
  active: boolean;
  deleted?: boolean;
  effectiveDate?: string;
}

export interface Location {
  id: string;
  name: string;
  code: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  timezone?: string;
  locationType?: string;
  active: boolean;
  deleted?: boolean;
  effectiveDate?: string;
}

export interface Grade {
  id: string;
  name: string;
  code: string;
  level?: number;
  active: boolean;
  deleted?: boolean;
  effectiveDate?: string;
}

export interface Band {
  id: string;
  name: string;
  code: string;
  minSalary?: number;
  maxSalary?: number;
  currency?: string;
  active: boolean;
  deleted?: boolean;
  effectiveDate?: string;
}

export interface Designation {
  id: string;
  name: string;
  code: string;
  level?: number;
  jobFamily?: string;
  category?: string;
  description?: string;
  active: boolean;
  deleted?: boolean;
  effectiveDate?: string;
}

export interface EmploymentType {
  id: string;
  name: string;
  code: string;
  description?: string;
  probationDays?: number;
  noticePeriodDays?: number;
  active: boolean;
  deleted?: boolean;
  effectiveDate?: string;
}

export interface CostCenter {
  id: string;
  name: string;
  code: string;
  description?: string;
  budget?: number;
  currency?: string;
  departmentId?: string;
  active: boolean;
  deleted?: boolean;
  effectiveDate?: string;
}

export interface ApprovalMatrixLevel {
  id?: string;
  levelNumber: number;
  approverType: string;
  approverEmployeeId?: string;
  required: boolean;
  allowSkip: boolean;
}

export interface ApprovalMatrix {
  id: string;
  tenantId?: string;
  organizationId?: string;
  businessUnitId?: string;
  divisionId?: string;
  departmentId?: string;
  teamId?: string;
  designationId?: string;
  gradeId?: string;
  bandId?: string;
  approvalType: string;
  approverLevel1Id?: string;
  approverLevel1Type?: string;
  approverLevel2Id?: string;
  approverLevel2Type?: string;
  approverLevel3Id?: string;
  approverLevel3Type?: string;
  approverLevel4Id?: string;
  approverLevel4Type?: string;
  locationId?: string;
  employmentTypeId?: string;
  minAmount?: number;
  maxAmount?: number;
  effectiveFrom?: string;
  effectiveTo?: string;
  priority?: number;
  levels?: ApprovalMatrixLevel[];
  active: boolean;
  deleted?: boolean;
  effectiveDate?: string;
}

export interface DnaAnalyticsReport {
  totalEmployees: number;
  employeesWithValidDna: number;
  employeesWithInvalidDna: number;
  dnaIntegrityPercentage: number;
  totalDnaNodes: number;
  dnaNodesByType: Record<string, number>;
  departmentBreakdown: Array<{
    departmentName: string;
    employeeCount: number;
    percentage: number;
  }>;
  locationBreakdown: Array<{
    locationName: string;
    employeeCount: number;
    percentage: number;
  }>;
  orphanBusinessUnitEmployees: string[];
  orphanDepartmentEmployees: string[];
  orphanTeamEmployees: string[];
  orphanOrganizationEmployees: string[];
  organizationNames: Record<string, string>;
  businessUnitNames: Record<string, string>;
  divisionNames: Record<string, string>;
  departmentNames: Record<string, string>;
  teamNames: Record<string, string>;
  locationNames: Record<string, string>;
  designationNames: Record<string, string>;
  gradeNames: Record<string, string>;
  bandNames: Record<string, string>;
}

export interface DnaOrphanRecord {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  fieldName: string;
  invalidId: string;
  suggestedMatchId?: string;
  suggestedMatchName?: string;
}

export const orgDnaApi = platformApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrganizations: builder.query<Organization[], boolean | void>({
      query: (includeDeleted) => `/v1/org-dna/organizations${includeDeleted ? '?includeDeleted=true' : ''}`,
      transformResponse: (response: any) => response.data || [],
    }),
    updateOrganization: builder.mutation<Organization, { id: string; body: Partial<Organization> }>({
      query: ({ id, body }) => ({
        url: `/v1/org-dna/organizations/${id}`,
        method: 'PUT',
        body,
      }),
    }),
    createOrganization: builder.mutation<Organization, Partial<Organization>>({
      query: (body) => ({
        url: '/v1/org-dna/organizations',
        method: 'POST',
        body,
      }),
    }),
    deleteOrganization: builder.mutation<void, string>({
      query: (id) => ({
        url: `/v1/org-dna/organizations/${id}`,
        method: 'DELETE',
      }),
    }),
    restoreOrganization: builder.mutation<void, string>({
      query: (id) => ({
        url: `/v1/org-dna/organizations/${id}/restore`,
        method: 'POST',
      }),
    }),

    getBusinessUnits: builder.query<BusinessUnit[], string | { orgId: string; includeDeleted?: boolean }>({
      query: (arg) => {
        const orgId = typeof arg === 'string' ? arg : arg.orgId;
        const includeDeleted = typeof arg === 'string' ? false : !!arg.includeDeleted;
        return `/v1/org-dna/organizations/${orgId}/business-units${includeDeleted ? '?includeDeleted=true' : ''}`;
      },
      transformResponse: (response: any) => response.data || [],
    }),
    createBusinessUnit: builder.mutation<BusinessUnit, { orgId: string; body: Partial<BusinessUnit> }>({
      query: ({ orgId, body }) => ({
        url: `/v1/org-dna/organizations/${orgId}/business-units`,
        method: 'POST',
        body,
      }),
    }),
    updateBusinessUnit: builder.mutation<BusinessUnit, { id: string; body: Partial<BusinessUnit> }>({
      query: ({ id, body }) => ({
        url: `/v1/org-dna/business-units/${id}`,
        method: 'PUT',
        body,
      }),
    }),
    deleteBusinessUnit: builder.mutation<void, string>({
      query: (id) => ({
        url: `/v1/org-dna/business-units/${id}`,
        method: 'DELETE',
      }),
    }),
    restoreBusinessUnit: builder.mutation<void, string>({
      query: (id) => ({
        url: `/v1/org-dna/business-units/${id}/restore`,
        method: 'POST',
      }),
    }),

    getDivisions: builder.query<Division[], string | { buId: string; includeDeleted?: boolean }>({
      query: (arg) => {
        const buId = typeof arg === 'string' ? arg : arg.buId;
        const includeDeleted = typeof arg === 'string' ? false : !!arg.includeDeleted;
        return `/v1/org-dna/business-units/${buId}/divisions${includeDeleted ? '?includeDeleted=true' : ''}`;
      },
      transformResponse: (response: any) => response.data || [],
    }),
    createDivision: builder.mutation<Division, { buId: string; body: Partial<Division> }>({
      query: ({ buId, body }) => ({
        url: `/v1/org-dna/business-units/${buId}/divisions`,
        method: 'POST',
        body,
      }),
    }),
    updateDivision: builder.mutation<Division, { id: string; body: Partial<Division> }>({
      query: ({ id, body }) => ({
        url: `/v1/org-dna/divisions/${id}`,
        method: 'PUT',
        body,
      }),
    }),
    deleteDivision: builder.mutation<void, string>({
      query: (id) => ({
        url: `/v1/org-dna/divisions/${id}`,
        method: 'DELETE',
      }),
    }),
    restoreDivision: builder.mutation<void, string>({
      query: (id) => ({
        url: `/v1/org-dna/divisions/${id}/restore`,
        method: 'POST',
      }),
    }),

    getDepartments: builder.query<Department[], string | { divId: string; includeDeleted?: boolean }>({
      query: (arg) => {
        const divId = typeof arg === 'string' ? arg : arg.divId;
        const includeDeleted = typeof arg === 'string' ? false : !!arg.includeDeleted;
        return `/v1/org-dna/divisions/${divId}/departments${includeDeleted ? '?includeDeleted=true' : ''}`;
      },
      transformResponse: (response: any) => response.data || [],
    }),
    createDepartment: builder.mutation<Department, { divId: string; body: Partial<Department> }>({
      query: ({ divId, body }) => ({
        url: `/v1/org-dna/divisions/${divId}/departments`,
        method: 'POST',
        body,
      }),
    }),
    updateDepartment: builder.mutation<Department, { id: string; body: Partial<Department> }>({
      query: ({ id, body }) => ({
        url: `/v1/org-dna/departments/${id}`,
        method: 'PUT',
        body,
      }),
    }),
    deleteDepartment: builder.mutation<void, string>({
      query: (id) => ({
        url: `/v1/org-dna/departments/${id}`,
        method: 'DELETE',
      }),
    }),
    restoreDepartment: builder.mutation<void, string>({
      query: (id) => ({
        url: `/v1/org-dna/departments/${id}/restore`,
        method: 'POST',
      }),
    }),

    getTeams: builder.query<Team[], string | { deptId: string; includeDeleted?: boolean }>({
      query: (arg) => {
        const deptId = typeof arg === 'string' ? arg : arg.deptId;
        const includeDeleted = typeof arg === 'string' ? false : !!arg.includeDeleted;
        return `/v1/org-dna/departments/${deptId}/teams${includeDeleted ? '?includeDeleted=true' : ''}`;
      },
      transformResponse: (response: any) => response.data || [],
    }),
    createTeam: builder.mutation<Team, { deptId: string; body: Partial<Team> }>({
      query: ({ deptId, body }) => ({
        url: `/v1/org-dna/departments/${deptId}/teams`,
        method: 'POST',
        body,
      }),
    }),
    updateTeam: builder.mutation<Team, { id: string; body: Partial<Team> }>({
      query: ({ id, body }) => ({
        url: `/v1/org-dna/teams/${id}`,
        method: 'PUT',
        body,
      }),
    }),
    deleteTeam: builder.mutation<void, string>({
      query: (id) => ({
        url: `/v1/org-dna/teams/${id}`,
        method: 'DELETE',
      }),
    }),
    restoreTeam: builder.mutation<void, string>({
      query: (id) => ({
        url: `/v1/org-dna/teams/${id}/restore`,
        method: 'POST',
      }),
    }),

    getLocations: builder.query<Location[], string | { orgId: string; includeDeleted?: boolean }>({
      query: (arg) => {
        const orgId = typeof arg === 'string' ? arg : arg.orgId;
        const includeDeleted = typeof arg === 'string' ? false : !!arg.includeDeleted;
        return `/v1/org-dna/organizations/${orgId}/locations${includeDeleted ? '?includeDeleted=true' : ''}`;
      },
      transformResponse: (response: any) => response.data || [],
    }),
    createLocation: builder.mutation<Location, { orgId: string; body: Partial<Location> }>({
      query: ({ orgId, body }) => ({
        url: `/v1/org-dna/organizations/${orgId}/locations`,
        method: 'POST',
        body,
      }),
    }),
    updateLocation: builder.mutation<Location, { id: string; body: Partial<Location> }>({
      query: ({ id, body }) => ({
        url: `/v1/org-dna/locations/${id}`,
        method: 'PUT',
        body,
      }),
    }),
    deleteLocation: builder.mutation<void, string>({
      query: (id) => ({
        url: `/v1/org-dna/locations/${id}`,
        method: 'DELETE',
      }),
    }),
    restoreLocation: builder.mutation<void, string>({
      query: (id) => ({
        url: `/v1/org-dna/locations/${id}/restore`,
        method: 'POST',
      }),
    }),

    getGrades: builder.query<Grade[], string | { orgId: string; includeDeleted?: boolean }>({
      query: (arg) => {
        const orgId = typeof arg === 'string' ? arg : arg.orgId;
        const includeDeleted = typeof arg === 'string' ? false : !!arg.includeDeleted;
        return `/v1/org-dna/organizations/${orgId}/grades${includeDeleted ? '?includeDeleted=true' : ''}`;
      },
      transformResponse: (response: any) => response.data || [],
    }),
    createGrade: builder.mutation<Grade, { orgId: string; body: Partial<Grade> }>({
      query: ({ orgId, body }) => ({
        url: `/v1/org-dna/organizations/${orgId}/grades`,
        method: 'POST',
        body,
      }),
    }),
    updateGrade: builder.mutation<Grade, { id: string; body: Partial<Grade> }>({
      query: ({ id, body }) => ({
        url: `/v1/org-dna/grades/${id}`,
        method: 'PUT',
        body,
      }),
    }),
    deleteGrade: builder.mutation<void, string>({
      query: (id) => ({
        url: `/v1/org-dna/grades/${id}`,
        method: 'DELETE',
      }),
    }),
    restoreGrade: builder.mutation<void, string>({
      query: (id) => ({
        url: `/v1/org-dna/grades/${id}/restore`,
        method: 'POST',
      }),
    }),

    getBands: builder.query<Band[], string | { orgId: string; includeDeleted?: boolean }>({
      query: (arg) => {
        const orgId = typeof arg === 'string' ? arg : arg.orgId;
        const includeDeleted = typeof arg === 'string' ? false : !!arg.includeDeleted;
        return `/v1/org-dna/organizations/${orgId}/bands${includeDeleted ? '?includeDeleted=true' : ''}`;
      },
      transformResponse: (response: any) => response.data || [],
    }),
    createBand: builder.mutation<Band, { orgId: string; body: Partial<Band> }>({
      query: ({ orgId, body }) => ({
        url: `/v1/org-dna/organizations/${orgId}/bands`,
        method: 'POST',
        body,
      }),
    }),
    updateBand: builder.mutation<Band, { id: string; body: Partial<Band> }>({
      query: ({ id, body }) => ({
        url: `/v1/org-dna/bands/${id}`,
        method: 'PUT',
        body,
      }),
    }),
    deleteBand: builder.mutation<void, string>({
      query: (id) => ({
        url: `/v1/org-dna/bands/${id}`,
        method: 'DELETE',
      }),
    }),
    restoreBand: builder.mutation<void, string>({
      query: (id) => ({
        url: `/v1/org-dna/bands/${id}/restore`,
        method: 'POST',
      }),
    }),

    getDesignations: builder.query<Designation[], string | { orgId: string; includeDeleted?: boolean }>({
      query: (arg) => {
        const orgId = typeof arg === 'string' ? arg : arg.orgId;
        const includeDeleted = typeof arg === 'string' ? false : !!arg.includeDeleted;
        return `/v1/org-dna/organizations/${orgId}/designations${includeDeleted ? '?includeDeleted=true' : ''}`;
      },
      transformResponse: (response: any) => response.data || [],
    }),
    createDesignation: builder.mutation<Designation, { orgId: string; body: Partial<Designation> }>({
      query: ({ orgId, body }) => ({
        url: `/v1/org-dna/organizations/${orgId}/designations`,
        method: 'POST',
        body,
      }),
    }),
    updateDesignation: builder.mutation<Designation, { id: string; body: Partial<Designation> }>({
      query: ({ id, body }) => ({
        url: `/v1/org-dna/designations/${id}`,
        method: 'PUT',
        body,
      }),
    }),
    deleteDesignation: builder.mutation<void, string>({
      query: (id) => ({
        url: `/v1/org-dna/designations/${id}`,
        method: 'DELETE',
      }),
    }),
    restoreDesignation: builder.mutation<void, string>({
      query: (id) => ({
        url: `/v1/org-dna/designations/${id}/restore`,
        method: 'POST',
      }),
    }),

    getEmploymentTypes: builder.query<EmploymentType[], string | { orgId: string; includeDeleted?: boolean }>({
      query: (arg) => {
        const orgId = typeof arg === 'string' ? arg : arg.orgId;
        const includeDeleted = typeof arg === 'string' ? false : !!arg.includeDeleted;
        return `/v1/org-dna/organizations/${orgId}/employment-types${includeDeleted ? '?includeDeleted=true' : ''}`;
      },
      transformResponse: (response: any) => response.data || [],
    }),
    createEmploymentType: builder.mutation<EmploymentType, { orgId: string; body: Partial<EmploymentType> }>({
      query: ({ orgId, body }) => ({
        url: `/v1/org-dna/organizations/${orgId}/employment-types`,
        method: 'POST',
        body,
      }),
    }),
    updateEmploymentType: builder.mutation<EmploymentType, { id: string; body: Partial<EmploymentType> }>({
      query: ({ id, body }) => ({
        url: `/v1/org-dna/employment-types/${id}`,
        method: 'PUT',
        body,
      }),
    }),
    deleteEmploymentType: builder.mutation<void, string>({
      query: (id) => ({
        url: `/v1/org-dna/employment-types/${id}`,
        method: 'DELETE',
      }),
    }),
    restoreEmploymentType: builder.mutation<void, string>({
      query: (id) => ({
        url: `/v1/org-dna/employment-types/${id}/restore`,
        method: 'POST',
      }),
    }),

    getCostCenters: builder.query<CostCenter[], string | { orgId: string; includeDeleted?: boolean }>({
      query: (arg) => {
        const orgId = typeof arg === 'string' ? arg : arg.orgId;
        const includeDeleted = typeof arg === 'string' ? false : !!arg.includeDeleted;
        return `/v1/org-dna/organizations/${orgId}/cost-centers${includeDeleted ? '?includeDeleted=true' : ''}`;
      },
      transformResponse: (response: any) => response.data || [],
    }),
    createCostCenter: builder.mutation<CostCenter, { orgId: string; body: Partial<CostCenter> }>({
      query: ({ orgId, body }) => ({
        url: `/v1/org-dna/organizations/${orgId}/cost-centers`,
        method: 'POST',
        body,
      }),
    }),
    updateCostCenter: builder.mutation<CostCenter, { id: string; body: Partial<CostCenter> }>({
      query: ({ id, body }) => ({
        url: `/v1/org-dna/cost-centers/${id}`,
        method: 'PUT',
        body,
      }),
    }),
    deleteCostCenter: builder.mutation<void, string>({
      query: (id) => ({
        url: `/v1/org-dna/cost-centers/${id}`,
        method: 'DELETE',
      }),
    }),
    restoreCostCenter: builder.mutation<void, string>({
      query: (id) => ({
        url: `/v1/org-dna/cost-centers/${id}/restore`,
        method: 'POST',
      }),
    }),
    getApprovalMatrices: builder.query<ApprovalMatrix[], void>({
      query: () => '/v1/org-dna/approval-matrices',
      transformResponse: (response: any) => response.data || [],
    }),
    createApprovalMatrix: builder.mutation<ApprovalMatrix, Partial<ApprovalMatrix>>({
      query: (body) => ({
        url: '/v1/org-dna/approval-matrices',
        method: 'POST',
        body,
      }),
    }),
    updateApprovalMatrix: builder.mutation<ApprovalMatrix, { id: string; body: Partial<ApprovalMatrix> }>({
      query: ({ id, body }) => ({
        url: `/v1/org-dna/approval-matrices/${id}`,
        method: 'PUT',
        body,
      }),
    }),
    deleteApprovalMatrix: builder.mutation<void, string>({
      query: (id) => ({
        url: `/v1/org-dna/approval-matrices/${id}`,
        method: 'DELETE',
      }),
    }),
    cloneBusinessUnit: builder.mutation<BusinessUnit, { id: string; targetName: string; targetCode: string }>({
      query: ({ id, targetName, targetCode }) => ({
        url: `/v1/org-dna/business-units/${id}/clone?targetName=${encodeURIComponent(targetName)}&targetCode=${encodeURIComponent(targetCode)}`,
        method: 'POST',
      }),
    }),
    getAuditTrail: builder.query<{ content: any[]; totalElements: number }, { entityType: string; entityId: string; page?: number; size?: number }>({
      query: ({ entityType, entityId, page = 0, size = 10 }) => `/v1/org-dna/audit-trail?entityType=${entityType}&entityId=${entityId}&page=${page}&size=${size}`,
      transformResponse: (response: any) => response.data || { content: [], totalElements: 0 },
    }),
    getDnaAnalytics: builder.query<DnaAnalyticsReport, void>({
      query: () => '/v1/dashboard/dna-analytics',
      transformResponse: (response: any) => response.data,
    }),
    getDnaIntegrityReport: builder.query<DnaOrphanRecord[], void>({
      query: () => '/v1/dashboard/dna-analytics/integrity-report',
      transformResponse: (response: any) => response.data || [],
    }),
    manualRemap: builder.mutation<void, { employeeId: string; fieldName: string; targetId: string }>({
      query: (body) => ({
        url: '/v1/dashboard/dna-analytics/remap',
        method: 'POST',
        body,
      }),
    }),
    autoRepairDna: builder.mutation<void, void>({
      query: () => ({
        url: '/v1/dashboard/dna-analytics/auto-repair',
        method: 'POST',
      }),
    }),
    bulkRepairDna: builder.mutation<void, { repairs: Array<{ employeeId: string; fieldName: string; targetId: string }> }>({
      query: (body) => ({
        url: '/v1/dashboard/dna-analytics/bulk-repair',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useGetOrganizationsQuery,
  useCreateOrganizationMutation,
  useUpdateOrganizationMutation,
  useDeleteOrganizationMutation,
  useRestoreOrganizationMutation,

  useGetBusinessUnitsQuery,
  useCreateBusinessUnitMutation,
  useUpdateBusinessUnitMutation,
  useDeleteBusinessUnitMutation,
  useRestoreBusinessUnitMutation,

  useGetDivisionsQuery,
  useLazyGetDivisionsQuery,
  useCreateDivisionMutation,
  useUpdateDivisionMutation,
  useDeleteDivisionMutation,
  useRestoreDivisionMutation,

  useGetDepartmentsQuery,
  useLazyGetDepartmentsQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
  useRestoreDepartmentMutation,

  useGetTeamsQuery,
  useCreateTeamMutation,
  useUpdateTeamMutation,
  useDeleteTeamMutation,
  useRestoreTeamMutation,

  useGetLocationsQuery,
  useCreateLocationMutation,
  useUpdateLocationMutation,
  useDeleteLocationMutation,
  useRestoreLocationMutation,

  useGetGradesQuery,
  useCreateGradeMutation,
  useUpdateGradeMutation,
  useDeleteGradeMutation,
  useRestoreGradeMutation,

  useGetBandsQuery,
  useCreateBandMutation,
  useUpdateBandMutation,
  useDeleteBandMutation,
  useRestoreBandMutation,

  useGetDesignationsQuery,
  useCreateDesignationMutation,
  useUpdateDesignationMutation,
  useDeleteDesignationMutation,
  useRestoreDesignationMutation,

  useGetEmploymentTypesQuery,
  useCreateEmploymentTypeMutation,
  useUpdateEmploymentTypeMutation,
  useDeleteEmploymentTypeMutation,
  useRestoreEmploymentTypeMutation,

  useGetCostCentersQuery,
  useCreateCostCenterMutation,
  useUpdateCostCenterMutation,
  useDeleteCostCenterMutation,
  useRestoreCostCenterMutation,

  useGetApprovalMatricesQuery,
  useCreateApprovalMatrixMutation,
  useUpdateApprovalMatrixMutation,
  useDeleteApprovalMatrixMutation,
  useCloneBusinessUnitMutation,
  useGetAuditTrailQuery,
  useGetDnaAnalyticsQuery,
  useGetDnaIntegrityReportQuery,
  useManualRemapMutation,
  useAutoRepairDnaMutation,
  useBulkRepairDnaMutation,
} = orgDnaApi;

// Keep old hooks mapped for backward compatibility in case they are referenced elsewhere
export const useGetSubDepartmentsQuery = orgDnaApi.useGetTeamsQuery;
export const useCreateSubDepartmentMutation = orgDnaApi.useCreateTeamMutation;
export const useUpdateSubDepartmentMutation = orgDnaApi.useUpdateTeamMutation;
export const useDeleteSubDepartmentMutation = orgDnaApi.useDeleteTeamMutation;
export const useRestoreSubDepartmentMutation = orgDnaApi.useRestoreTeamMutation;
