import { platformApi } from '../../app/api';

export interface Requisition {
  id: string;
  reqNumber: string;
  title: string;
  jobTitle?: string;
  department: string;
  subDepartment?: string;
  businessUnit: string;
  location: string;
  reportingManager?: string;
  designation: string;
  grade: string;
  band: string;
  employmentType: string;
  workMode?: string;
  vacancies: number;
  minExperience?: number;
  maxExperience?: number;
  budget: number;
  minBudget?: number;
  maxBudget?: number;
  costCenter?: string;
  requiredSkills?: string;
  preferredSkills?: string;
  certifications?: string;
  languages?: string;
  education?: string;
  hiringReason?: string;
  expectedJoiningDate: string;
  priority: string;
  status: string;
  reasonForHiring?: string;
  replacementEmployee?: string;
  replacementEmployeeId?: string;
  replacementDate?: string;
  businessJustification?: string;
  projectName?: string;
  expectedBusinessImpact?: string;
  revenueImpact?: string;
  riskNotFilled?: string;
  additionalNotes?: string;
  createdAt: string;
  approvals?: any[];
  comments?: any[];
  attachments?: any[];
  activityLogs?: any[];
  budgetAnalysis?: any;
  customValues?: any[];
}

export interface JobPosting {
  id: string;
  requisition?: Requisition;
  jobTitle: string;
  jobDescription: string;
  skills: string;
  location: string;
  employmentType: string;
  salaryRange: string;
  experience: string;
  applicationDeadline: string;
  status: string;
  createdAt: string;
}

export interface Candidate {
  id: string;
  candidateCode: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  currentCompany?: string;
  currentDesignation?: string;
  experienceYears?: number;
  currentSalary?: number;
  expectedSalary?: number;
  noticePeriodDays?: number;
  source?: string;
  skills?: string;
  resumeUrl?: string;
  status: string;
  createdAt: string;
}

export interface CandidateNote {
  id: string;
  noteText: string;
  authorId: string;
  createdAt: string;
}

export interface CandidateActivity {
  id: string;
  activityType: string;
  description: string;
  oldValue?: string;
  newValue?: string;
  createdAt: string;
}

export interface Interview {
  id: string;
  candidate: Candidate;
  jobPosting: JobPosting;
  interviewType: string;
  scheduledTime: string;
  interviewerIds: string;
  status: string;
  feedbackScorecard?: string;
  createdAt: string;
}

export interface InterviewFeedback {
  id?: string;
  interviewerId: string;
  rating?: number;
  comments?: string;
  technicalRating?: number;
  communicationRating?: number;
  problemSolvingRating?: number;
  cultureFitRating?: number;
  overallRecommendation: string;
  feedbackNotes?: string;
}

export interface Offer {
  id: string;
  candidate: Candidate;
  jobPosting: JobPosting;
  ctc: number;
  bonus?: number;
  joiningBonus?: number;
  joiningDate: string;
  location: string;
  status: string;
  createdAt: string;
}

export interface TalentPool {
  id: string;
  poolName: string;
  description?: string;
  department?: string;
  candidates: Candidate[];
}

export const recruitmentApi = platformApi.injectEndpoints({
  endpoints: (builder) => ({
    getRecruitmentDashboard: builder.query<any, void>({
      query: () => '/v1/recruitment/dashboard',
      transformResponse: (res: { data: any }) => res.data,
      providesTags: ['Requisition', 'JobPosting', 'Candidate', 'Offer'],
    }),

    // Requisitions
    getRequisitions: builder.query<Requisition[], void>({
      query: () => '/v1/recruitment/requisitions',
      transformResponse: (res: { data: Requisition[] }) => res.data,
      providesTags: ['Requisition'],
    }),
    createRequisition: builder.mutation<Requisition, Partial<Requisition>>({
      query: (body) => ({
        url: '/v1/recruitment/requisitions',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Requisition'],
    }),
    updateRequisition: builder.mutation<Requisition, { id: string; req: Partial<Requisition> }>({
      query: ({ id, req }) => ({
        url: `/v1/recruitment/requisitions/${id}`,
        method: 'PUT',
        body: req,
      }),
      invalidatesTags: ['Requisition'],
    }),
    submitRequisition: builder.mutation<Requisition, string>({
      query: (id) => ({
        url: `/v1/recruitment/requisitions/${id}/submit`,
        method: 'POST',
      }),
      invalidatesTags: ['Requisition'],
    }),
    approveRequisition: builder.mutation<Requisition, { id: string; approverId: string; comments?: string }>({
      query: ({ id, approverId, comments }) => ({
        url: `/v1/recruitment/requisitions/${id}/approve`,
        method: 'POST',
        params: { approverId, comments },
      }),
      invalidatesTags: ['Requisition'],
    }),
    rejectRequisition: builder.mutation<Requisition, { id: string; approverId: string; comments?: string }>({
      query: ({ id, approverId, comments }) => ({
        url: `/v1/recruitment/requisitions/${id}/reject`,
        method: 'POST',
        params: { approverId, comments },
      }),
      invalidatesTags: ['Requisition'],
    }),

    // Job Postings
    getJobPostings: builder.query<JobPosting[], { status?: string } | void>({
      query: (arg) => ({
        url: '/v1/recruitment/jobs',
        params: arg ? { status: arg.status } : undefined,
      }),
      transformResponse: (res: { data: JobPosting[] }) => res.data,
      providesTags: ['JobPosting'],
    }),
    createJobPosting: builder.mutation<JobPosting, Partial<JobPosting>>({
      query: (body) => ({
        url: '/v1/recruitment/jobs',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['JobPosting'],
    }),
    updateJobPosting: builder.mutation<JobPosting, { id: string; posting: Partial<JobPosting> }>({
      query: ({ id, posting }) => ({
        url: `/v1/recruitment/jobs/${id}`,
        method: 'PUT',
        body: posting,
      }),
      invalidatesTags: ['JobPosting'],
    }),
    changeJobPostingStatus: builder.mutation<JobPosting, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/v1/recruitment/jobs/${id}/status`,
        method: 'PUT',
        params: { status },
      }),
      invalidatesTags: ['JobPosting'],
    }),
    activateJobPosting: builder.mutation<JobPosting, string>({
      query: (id) => ({
        url: `/v1/recruitment/jobs/${id}/activate`,
        method: 'PUT',
      }),
      invalidatesTags: ['JobPosting'],
    }),
    duplicateJobPosting: builder.mutation<JobPosting, string>({
      query: (id) => ({
        url: `/v1/recruitment/jobs/${id}/duplicate`,
        method: 'POST',
      }),
      invalidatesTags: ['JobPosting'],
    }),
    archiveJobPosting: builder.mutation<JobPosting, string>({
      query: (id) => ({
        url: `/v1/recruitment/jobs/${id}/archive`,
        method: 'PUT',
      }),
      invalidatesTags: ['JobPosting'],
    }),

    // Candidates
    getCandidates: builder.query<Candidate[], void>({
      query: () => '/v1/recruitment/candidates',
      transformResponse: (res: { data: Candidate[] }) => res.data,
      providesTags: ['Candidate'],
    }),
    createCandidate: builder.mutation<Candidate, Partial<Candidate>>({
      query: (body) => ({
        url: '/v1/recruitment/candidates',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Candidate'],
    }),
    updateCandidate: builder.mutation<Candidate, { id: string; candidate: Partial<Candidate> }>({
      query: ({ id, candidate }) => ({
        url: `/v1/recruitment/candidates/${id}`,
        method: 'PUT',
        body: candidate,
      }),
      invalidatesTags: ['Candidate'],
    }),
    moveCandidateStage: builder.mutation<Candidate, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/v1/recruitment/candidates/${id}/stage`,
        method: 'PUT',
        params: { status },
      }),
      invalidatesTags: ['Candidate'],
    }),
    getCandidateNotes: builder.query<CandidateNote[], string>({
      query: (id) => `/v1/recruitment/candidates/${id}/notes`,
      transformResponse: (res: { data: CandidateNote[] }) => res.data,
    }),
    addCandidateNote: builder.mutation<CandidateNote, { id: string; noteText: string; authorId: string }>({
      query: ({ id, noteText, authorId }) => ({
        url: `/v1/recruitment/candidates/${id}/notes`,
        method: 'POST',
        params: { noteText, authorId },
      }),
      invalidatesTags: ['Candidate'],
    }),
    getCandidateActivities: builder.query<CandidateActivity[], string>({
      query: (id) => `/v1/recruitment/candidates/${id}/activities`,
      transformResponse: (res: { data: CandidateActivity[] }) => res.data,
    }),

    // Interviews
    getInterviews: builder.query<Interview[], void>({
      query: () => '/v1/recruitment/interviews',
      transformResponse: (res: { data: Interview[] }) => res.data,
      providesTags: ['Interview'],
    }),
    scheduleInterview: builder.mutation<Interview, Partial<Interview>>({
      query: (body) => ({
        url: '/v1/recruitment/interviews',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Interview', 'Candidate'],
    }),
    updateInterview: builder.mutation<Interview, { id: string; interview: Partial<Interview> }>({
      query: ({ id, interview }) => ({
        url: `/v1/recruitment/interviews/${id}`,
        method: 'PUT',
        body: interview,
      }),
      invalidatesTags: ['Interview'],
    }),
    submitInterviewFeedback: builder.mutation<InterviewFeedback, { id: string; feedback: Partial<InterviewFeedback> }>({
      query: ({ id, feedback }) => ({
        url: `/v1/recruitment/interviews/${id}/feedback`,
        method: 'POST',
        body: feedback,
      }),
      invalidatesTags: ['Interview', 'Candidate'],
    }),

    // Offers
    getOffers: builder.query<Offer[], void>({
      query: () => '/v1/recruitment/offers',
      transformResponse: (res: { data: Offer[] }) => res.data,
      providesTags: ['Offer'],
    }),
    createOffer: builder.mutation<Offer, Partial<Offer>>({
      query: (body) => ({
        url: '/v1/recruitment/offers',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Offer', 'Candidate'],
    }),
    updateOffer: builder.mutation<Offer, { id: string; offer: Partial<Offer> }>({
      query: ({ id, offer }) => ({
        url: `/v1/recruitment/offers/${id}`,
        method: 'PUT',
        body: offer,
      }),
      invalidatesTags: ['Offer'],
    }),
    approveOffer: builder.mutation<Offer, { id: string; approverId: string; comments?: string }>({
      query: ({ id, approverId, comments }) => ({
        url: `/v1/recruitment/offers/${id}/approve`,
        method: 'POST',
        params: { approverId, comments },
      }),
      invalidatesTags: ['Offer', 'Candidate'],
    }),
    rejectOffer: builder.mutation<Offer, { id: string; approverId: string; comments?: string }>({
      query: ({ id, approverId, comments }) => ({
        url: `/v1/recruitment/offers/${id}/reject`,
        method: 'POST',
        params: { approverId, comments },
      }),
      invalidatesTags: ['Offer', 'Candidate'],
    }),
    acceptOffer: builder.mutation<Offer, string>({
      query: (id) => ({
        url: `/v1/recruitment/offers/${id}/accept`,
        method: 'POST',
      }),
      invalidatesTags: ['Offer', 'Candidate', 'Employee'],
    }),

    // Talent Pools
    getTalentPools: builder.query<TalentPool[], void>({
      query: () => '/v1/recruitment/pools',
      transformResponse: (res: { data: TalentPool[] }) => res.data,
      providesTags: ['TalentPool'],
    }),
    createTalentPool: builder.mutation<TalentPool, Partial<TalentPool>>({
      query: (body) => ({
        url: '/v1/recruitment/pools',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['TalentPool'],
    }),
    addCandidateToPool: builder.mutation<void, { poolId: string; candidateId: string }>({
      query: ({ poolId, candidateId }) => ({
        url: `/v1/recruitment/pools/${poolId}/candidates`,
        method: 'POST',
        params: { candidateId },
      }),
      invalidatesTags: ['TalentPool'],
    }),

    // Requisition Details Sub-entities
    getRequisitionComments: builder.query<any[], string>({
      query: (reqId) => `/v1/recruitment/requisitions/${reqId}/comments`,
      transformResponse: (res: { data: any[] }) => res.data,
      providesTags: (result, error, reqId) => [{ type: 'Requisition', id: reqId }],
    }),
    addRequisitionComment: builder.mutation<any, { requisitionId: string; commentText: string; authorName: string }>({
      query: ({ requisitionId, commentText, authorName }) => ({
        url: `/v1/recruitment/requisitions/${requisitionId}/comments`,
        method: 'POST',
        body: { commentText, authorName },
      }),
      invalidatesTags: (result, error, { requisitionId }) => [{ type: 'Requisition', id: requisitionId }],
    }),

    getRequisitionAttachments: builder.query<any[], string>({
      query: (reqId) => `/v1/recruitment/requisitions/${reqId}/attachments`,
      transformResponse: (res: { data: any[] }) => res.data,
      providesTags: (result, error, reqId) => [{ type: 'Requisition', id: reqId }],
    }),
    addRequisitionAttachment: builder.mutation<any, { requisitionId: string; fileName: string; fileType: string; fileUrl: string; fileSize: number }>({
      query: ({ requisitionId, ...body }) => ({
        url: `/v1/recruitment/requisitions/${requisitionId}/attachments`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { requisitionId }) => [{ type: 'Requisition', id: requisitionId }],
    }),
    deleteRequisitionAttachment: builder.mutation<void, string>({
      query: (attachmentId) => ({
        url: `/v1/recruitment/requisitions/attachments/${attachmentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Requisition'],
    }),

    getRequisitionActivities: builder.query<any[], string>({
      query: (reqId) => `/v1/recruitment/requisitions/${reqId}/activities`,
      transformResponse: (res: { data: any[] }) => res.data,
      providesTags: (result, error, reqId) => [{ type: 'Requisition', id: reqId }],
    }),

    getRequisitionCustomFields: builder.query<any[], void>({
      query: () => '/v1/recruitment/requisitions/custom-fields',
      transformResponse: (res: { data: any[] }) => res.data,
    }),

    getRequisitionCustomValues: builder.query<any[], string>({
      query: (reqId) => `/v1/recruitment/requisitions/${reqId}/custom-values`,
      transformResponse: (res: { data: any[] }) => res.data,
      providesTags: (result, error, reqId) => [{ type: 'Requisition', id: reqId }],
    }),
    saveRequisitionCustomValues: builder.mutation<void, { requisitionId: string; values: Array<{ fieldKey: string; fieldValue: string }> }>({
      query: ({ requisitionId, values }) => ({
        url: `/v1/recruitment/requisitions/${requisitionId}/custom-values`,
        method: 'POST',
        body: values,
      }),
      invalidatesTags: (result, error, { requisitionId }) => [{ type: 'Requisition', id: requisitionId }],
    }),

    getRequisitionBudgetAnalysis: builder.query<any, string>({
      query: (reqId) => `/v1/recruitment/requisitions/${reqId}/budget-analysis`,
      transformResponse: (res: { data: any }) => res.data,
      providesTags: (result, error, reqId) => [{ type: 'Requisition', id: reqId }],
    }),

    getRequisitionApprovalSteps: builder.query<any[], string>({
      query: (reqId) => `/v1/recruitment/requisitions/${reqId}/approval-steps`,
      transformResponse: (res: { data: any[] }) => res.data,
      providesTags: (result, error, reqId) => [{ type: 'Requisition', id: reqId }],
    }),

    searchSkillsByQ: builder.query<any[], string>({
      query: (q) => `/skills/search?q=${q}`,
      transformResponse: (res: { data: any[] }) => res.data,
    }),

    createCustomSkill: builder.mutation<any, Partial<any>>({
      query: (body) => ({
        url: '/skills',
        method: 'POST',
        body,
      }),
    }),

    saveRequisitionSkills: builder.mutation<any, { requisitionId: string; skills: Array<{ skillId: string; skillName: string; isRequired: boolean }> }>({
      query: ({ requisitionId, skills }) => ({
        url: `/requisitions/${requisitionId}/skills`,
        method: 'POST',
        body: skills,
      }),
    }),
  }),
});

export const {
  useGetRecruitmentDashboardQuery,
  useGetRequisitionsQuery,
  useCreateRequisitionMutation,
  useUpdateRequisitionMutation,
  useSubmitRequisitionMutation,
  useApproveRequisitionMutation,
  useRejectRequisitionMutation,
  useGetJobPostingsQuery,
  useCreateJobPostingMutation,
  useUpdateJobPostingMutation,
  useChangeJobPostingStatusMutation,
  useActivateJobPostingMutation,
  useDuplicateJobPostingMutation,
  useArchiveJobPostingMutation,
  useGetCandidatesQuery,
  useCreateCandidateMutation,
  useUpdateCandidateMutation,
  useMoveCandidateStageMutation,
  useGetCandidateNotesQuery,
  useAddCandidateNoteMutation,
  useGetCandidateActivitiesQuery,
  useGetInterviewsQuery,
  useScheduleInterviewMutation,
  useUpdateInterviewMutation,
  useSubmitInterviewFeedbackMutation,
  useGetOffersQuery,
  useCreateOfferMutation,
  useUpdateOfferMutation,
  useApproveOfferMutation,
  useRejectOfferMutation,
  useAcceptOfferMutation,
  useGetTalentPoolsQuery,
  useCreateTalentPoolMutation,
  useAddCandidateToPoolMutation,

  // New hooks exported
  useGetRequisitionCommentsQuery,
  useAddRequisitionCommentMutation,
  useGetRequisitionAttachmentsQuery,
  useAddRequisitionAttachmentMutation,
  useDeleteRequisitionAttachmentMutation,
  useGetRequisitionActivitiesQuery,
  useGetRequisitionCustomFieldsQuery,
  useGetRequisitionCustomValuesQuery,
  useSaveRequisitionCustomValuesMutation,
  useGetRequisitionBudgetAnalysisQuery,
  useGetRequisitionApprovalStepsQuery,

  // Skill hooks
  useSearchSkillsByQQuery,
  useLazySearchSkillsByQQuery,
  useCreateCustomSkillMutation,
  useSaveRequisitionSkillsMutation,
} = recruitmentApi;
