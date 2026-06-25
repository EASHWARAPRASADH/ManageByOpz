import { platformApi } from '../../app/api';

export interface RecognitionValue {
  id?: string;
  name: string;
  code: string;
  description: string;
  icon?: string;
  color?: string;
  status?: string;
  weight?: number;
}

export interface RecognitionType {
  id?: string;
  name: string;
  code: string;
  description: string;
  defaultPoints?: number;
  visibilityRules?: string;
  approvalRules?: string;
  badgeMapping?: string;
  status?: string;
}

export interface Recognition {
  id?: string;
  giverEmployeeId: string;
  receiverEmployeeId: string;
  recognitionType: 'PEER' | 'MANAGER' | 'ORGANIZATIONAL' | 'MILESTONE' | 'ANNIVERSARY' | 'SPOT';
  title: string;
  message: string;
  points: number;
  badgeId?: string;
  awardId?: string;
  visibility: 'PUBLIC' | 'TEAM' | 'PRIVATE';
  approved?: boolean;
  recognitionValueId?: string;
  recognitionTypeId?: string;
  tags?: string;
  projectRef?: string;
  businessImpact?: string;
  createdAt?: string;
  createdBy?: string;
}

export interface RecognitionComment {
  id?: string;
  recognitionId: string;
  employeeId: string;
  commentText: string;
  createdAt?: string;
}

export interface RecognitionPointsWallet {
  id?: string;
  employeeId: string;
  currentBalance: number;
  monthlyAllocation: number;
  used: number;
  remaining: number;
  expired: number;
}

export interface RewardCatalog {
  id?: string;
  name: string;
  description: string;
  cost: number;
  inventory: number;
  country: string;
  status: string;
  taxApplicable: boolean;
  category: string;
}

export interface RewardRedemption {
  id?: string;
  employeeId: string;
  rewardId: string;
  pointsUsed: number;
  status: 'PENDING' | 'APPROVED' | 'FULFILLED' | 'DELIVERED' | 'REJECTED';
  deliveryDetails?: string;
  trackingNumber?: string;
  createdAt?: string;
}

export interface AwardProgram {
  id?: string;
  name: string;
  description: string;
  category: 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'SPECIAL';
  active: boolean;
  budgetLimit?: number;
}

export interface AwardNomination {
  id?: string;
  programId: string;
  nomineeEmployeeId: string;
  nominatorEmployeeId: string;
  reason: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
  evidenceUrl?: string;
  voteCount?: number;
  score?: number;
}

export const recognitionApi = platformApi.injectEndpoints({
  endpoints: (builder) => ({
    getValues: builder.query<RecognitionValue[], void>({
      query: () => '/v1/recognition/values',
      transformResponse: (response: any) => response.data || [],
      providesTags: ['Recognition'] as any,
    }),
    createValue: builder.mutation<RecognitionValue, Partial<RecognitionValue>>({
      query: (body) => ({
        url: '/v1/recognition/values',
        method: 'POST',
        body,
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: ['Recognition'] as any,
    }),
    getTypes: builder.query<RecognitionType[], void>({
      query: () => '/v1/recognition/types',
      transformResponse: (response: any) => response.data || [],
      providesTags: ['Recognition'] as any,
    }),
    createType: builder.mutation<RecognitionType, Partial<RecognitionType>>({
      query: (body) => ({
        url: '/v1/recognition/types',
        method: 'POST',
        body,
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: ['Recognition'] as any,
    }),
    getWallet: builder.query<RecognitionPointsWallet, string>({
      query: (employeeId) => `/v1/recognition/wallet/${employeeId}`,
      transformResponse: (response: any) => response.data,
      providesTags: (_res, _err, id) => [{ type: 'Recognition' as any, id }],
    }),
    giveRecognition: builder.mutation<Recognition, Partial<Recognition>>({
      query: (body) => ({
        url: '/v1/recognition/give',
        method: 'POST',
        body,
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: ['Recognition'] as any,
    }),
    getFeed: builder.query<Recognition[], void>({
      query: () => '/v1/recognition/feed',
      transformResponse: (response: any) => response.data || [],
      providesTags: ['Recognition'] as any,
    }),
    getComments: builder.query<RecognitionComment[], string>({
      query: (id) => `/v1/recognition/${id}/comments`,
      transformResponse: (response: any) => response.data || [],
      providesTags: (_res, _err, id) => [{ type: 'Recognition' as any, id }],
    }),
    addComment: builder.mutation<RecognitionComment, { id: string; body: { employeeId: string; commentText: string } }>({
      query: ({ id, body }) => ({
        url: `/v1/recognition/${id}/comment`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: (_res, _err, { id }) => [{ type: 'Recognition' as any, id }, 'Recognition'],
    }),
    toggleReaction: builder.mutation<void, { id: string; body: { employeeId: string; reactionType: string } }>({
      query: ({ id, body }) => ({
        url: `/v1/recognition/${id}/react`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: (_res, _err, { id }) => [{ type: 'Recognition' as any, id }, 'Recognition'],
    }),
    getCatalog: builder.query<RewardCatalog[], void>({
      query: () => '/v1/recognition/rewards/catalog',
      transformResponse: (response: any) => response.data || [],
      providesTags: ['Recognition'] as any,
    }),
    createCatalogItem: builder.mutation<RewardCatalog, Partial<RewardCatalog>>({
      query: (body) => ({
        url: '/v1/recognition/rewards/catalog',
        method: 'POST',
        body,
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: ['Recognition'] as any,
    }),
    redeemPoints: builder.mutation<RewardRedemption, { employeeId: string; rewardId: string; deliveryDetails: string }>({
      query: (body) => ({
        url: '/v1/recognition/rewards/redeem',
        method: 'POST',
        body,
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: (_res, _err, { employeeId }) => [{ type: 'Recognition' as any, id: employeeId }, 'Recognition'],
    }),
    getRedemptions: builder.query<RewardRedemption[], string | undefined>({
      query: (employeeId) => `/v1/recognition/rewards/redemptions${employeeId ? `?employeeId=${employeeId}` : ''}`,
      transformResponse: (response: any) => response.data || [],
      providesTags: ['Recognition'] as any,
    }),
    updateRedemptionStatus: builder.mutation<RewardRedemption, { id: string; status: string; trackingNumber?: string }>({
      query: ({ id, status, trackingNumber }) => ({
        url: `/v1/recognition/rewards/redemptions/${id}`,
        method: 'PUT',
        params: { status, trackingNumber },
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: ['Recognition'] as any,
    }),
    getAwardPrograms: builder.query<AwardProgram[], void>({
      query: () => '/v1/recognition/awards/programs',
      transformResponse: (response: any) => response.data || [],
      providesTags: ['Recognition'] as any,
    }),
    createAwardProgram: builder.mutation<AwardProgram, Partial<AwardProgram>>({
      query: (body) => ({
        url: '/v1/recognition/awards/programs',
        method: 'POST',
        body,
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: ['Recognition'] as any,
    }),
    nominateEmployee: builder.mutation<AwardNomination, Partial<AwardNomination>>({
      query: (body) => ({
        url: '/v1/recognition/awards/nominate',
        method: 'POST',
        body,
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: ['Recognition'] as any,
    }),
    getNominationsByProgram: builder.query<AwardNomination[], string>({
      query: (programId) => `/v1/recognition/awards/nominations/${programId}`,
      transformResponse: (response: any) => response.data || [],
      providesTags: ['Recognition'] as any,
    }),
    voteNomination: builder.mutation<AwardNomination, string>({
      query: (id) => ({
        url: `/v1/recognition/awards/nominations/${id}/vote`,
        method: 'POST',
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: ['Recognition'] as any,
    }),
    approveNomination: builder.mutation<AwardNomination, string>({
      query: (id) => ({
        url: `/v1/recognition/awards/nominations/${id}/approve`,
        method: 'POST',
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: ['Recognition'] as any,
    }),
    getLeaderboard: builder.query<any[], void>({
      query: () => '/v1/recognition/leaderboard',
      transformResponse: (response: any) => response.data || [],
      providesTags: ['Recognition'] as any,
    }),
    getAnalytics: builder.query<any, void>({
      query: () => '/v1/recognition/analytics',
      transformResponse: (response: any) => response.data,
      providesTags: ['Recognition'] as any,
    }),
    getAiInsights: builder.query<any, void>({
      query: () => '/v1/recognition/ai/insights',
      transformResponse: (response: any) => response.data,
    }),
    getHealthReport: builder.mutation<any, string[]>({
      query: (employeeIds) => ({
        url: '/v1/recognition/health/report',
        method: 'POST',
        body: employeeIds,
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: ['Recognition'] as any,
    }),
    provisionMissingWallets: builder.mutation<any, string[]>({
      query: (employeeIds) => ({
        url: '/v1/recognition/health/provision-wallets',
        method: 'POST',
        body: employeeIds,
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: ['Recognition'] as any,
    }),
  }),
});

export const {
  useGetValuesQuery,
  useCreateValueMutation,
  useGetTypesQuery,
  useCreateTypeMutation,
  useGetWalletQuery,
  useGiveRecognitionMutation,
  useGetFeedQuery,
  useGetCommentsQuery,
  useAddCommentMutation,
  useToggleReactionMutation,
  useGetCatalogQuery,
  useCreateCatalogItemMutation,
  useRedeemPointsMutation,
  useGetRedemptionsQuery,
  useUpdateRedemptionStatusMutation,
  useGetAwardProgramsQuery,
  useCreateAwardProgramMutation,
  useNominateEmployeeMutation,
  useGetNominationsByProgramQuery,
  useVoteNominationMutation,
  useApproveNominationMutation,
  useGetLeaderboardQuery,
  useGetAnalyticsQuery,
  useGetAiInsightsQuery,
  useGetHealthReportMutation,
  useProvisionMissingWalletsMutation,
} = recognitionApi;
