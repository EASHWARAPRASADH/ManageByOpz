import { platformApi } from '../../app/api';

export interface FormDefinition {
  id?: string;
  moduleName: string;
  formName: string;
  status: string;
}

export interface FormSection {
  id?: string;
  formId: string;
  sectionName: string;
  displayOrder: number;
}

export interface FieldDefinition {
  id?: string;
  formId: string;
  groupId?: string;
  fieldKey: string;
  fieldLabel: string;
  fieldType: string;
  required: boolean;
  visible: boolean;
  readOnly: boolean;
  defaultValue?: string;
  validationJson?: string;
  displayOrder: number;
}

export interface FieldOption {
  id?: string;
  fieldDefinitionId: string;
  optionLabel: string;
  optionValue: string;
  optionOrder: number;
}

export interface FieldValue {
  id?: string;
  entityId: string;
  entityType: string;
  fieldDefinitionId: string;
  fieldValue: string;
}

export interface RecruitmentStage {
  id?: string;
  stageCode: string;
  stageName: string;
  displayOrder: number;
  stageColor?: string;
  active: boolean;
}

export interface InterviewType {
  id?: string;
  typeName: string;
  active: boolean;
}

export interface RecruitmentSource {
  id?: string;
  sourceName: string;
  active: boolean;
}

export interface WorkflowDefinition {
  id?: string;
  workflowName: string;
  workflowType: string;
  active: boolean;
}

export interface WorkflowStep {
  id?: string;
  workflowDefinitionId: string;
  stepName: string;
  stepOrder: number;
  approverRole: string;
}

export interface OfferTemplate {
  id?: string;
  templateName: string;
  templateType: string;
  templateHtml: string;
}

export interface NotificationTemplate {
  id?: string;
  templateName: string;
  eventType: string;
  channel: string;
  subject?: string;
  content: string;
}

export interface NotificationRule {
  id?: string;
  ruleName: string;
  eventType: string;
  notificationTemplateId: string;
  active: boolean;
}

export interface AutomationRule {
  id?: string;
  ruleName: string;
  triggerEvent: string;
  active: boolean;
}

export interface AutomationCondition {
  id?: string;
  automationRuleId: string;
  fieldKey: string;
  operator: string;
  expectedValue: string;
}

export interface AutomationAction {
  id?: string;
  automationRuleId: string;
  actionType: string;
  actionConfig?: string;
}

export interface RequisitionHiringReason {
  id?: string;
  reasonCode: string;
  reasonName: string;
  active: boolean;
}

export interface SkillMaster {
  id?: string;
  skillName: string;
  category?: string;
  active: boolean;
}

export const recruitmentConfigApi = platformApi.injectEndpoints({
  endpoints: (builder) => ({
    // Form definitions
    getFormDefinitions: builder.query<FormDefinition[], void>({
      query: () => '/v1/recruitment/config/forms',
      transformResponse: (res: { data: FormDefinition[] }) => res.data,
      providesTags: ['RecruitmentConfig' as any],
    }),
    saveFormDefinition: builder.mutation<FormDefinition, Partial<FormDefinition>>({
      query: (body) => ({
        url: '/v1/recruitment/config/forms',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['RecruitmentConfig' as any],
    }),
    getFormSections: builder.query<FormSection[], string>({
      query: (formId) => `/v1/recruitment/config/forms/${formId}/sections`,
      transformResponse: (res: { data: FormSection[] }) => res.data,
    }),
    saveFormSection: builder.mutation<FormSection, Partial<FormSection>>({
      query: (body) => ({
        url: '/v1/recruitment/config/sections',
        method: 'POST',
        body,
      }),
    }),
    getFieldDefinitions: builder.query<FieldDefinition[], string>({
      query: (formId) => `/v1/recruitment/config/forms/${formId}/fields`,
      transformResponse: (res: { data: FieldDefinition[] }) => res.data,
      providesTags: ['FieldDefinition' as any],
    }),
    saveFieldDefinition: builder.mutation<FieldDefinition, Partial<FieldDefinition>>({
      query: (body) => ({
        url: '/v1/recruitment/config/fields',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['FieldDefinition' as any],
    }),
    getFieldOptions: builder.query<FieldOption[], string>({
      query: (fieldId) => `/v1/recruitment/config/fields/${fieldId}/options`,
      transformResponse: (res: { data: FieldOption[] }) => res.data,
    }),
    saveFieldOption: builder.mutation<FieldOption, Partial<FieldOption>>({
      query: (body) => ({
        url: '/v1/recruitment/config/options',
        method: 'POST',
        body,
      }),
    }),

    // Custom field values
    getFieldValues: builder.query<FieldValue[], { entityType: string; entityId: string }>({
      query: ({ entityType, entityId }) => `/v1/recruitment/config/values/${entityType}/${entityId}`,
      transformResponse: (res: { data: FieldValue[] }) => res.data,
      providesTags: ['FieldValue' as any],
    }),
    saveFieldValues: builder.mutation<void, { entityType: string; entityId: string; values: FieldValue[] }>({
      query: ({ entityType, entityId, values }) => ({
        url: `/v1/recruitment/config/values/${entityType}/${entityId}`,
        method: 'POST',
        body: values,
      }),
      invalidatesTags: ['FieldValue' as any],
    }),

    // Recruitment stages
    getStages: builder.query<RecruitmentStage[], void>({
      query: () => '/v1/recruitment/config/stages',
      transformResponse: (res: { data: RecruitmentStage[] }) => res.data,
      providesTags: ['RecruitmentStage' as any],
    }),
    saveStage: builder.mutation<RecruitmentStage, Partial<RecruitmentStage>>({
      query: (body) => ({
        url: '/v1/recruitment/config/stages',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['RecruitmentStage' as any],
    }),
    deleteStage: builder.mutation<void, string>({
      query: (id) => ({
        url: `/v1/recruitment/config/stages/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['RecruitmentStage' as any],
    }),

    // Interview types
    getInterviewTypes: builder.query<InterviewType[], void>({
      query: () => '/v1/recruitment/config/interview-types',
      transformResponse: (res: { data: InterviewType[] }) => res.data,
      providesTags: ['InterviewType' as any],
    }),
    saveInterviewType: builder.mutation<InterviewType, Partial<InterviewType>>({
      query: (body) => ({
        url: '/v1/recruitment/config/interview-types',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['InterviewType' as any],
    }),

    // Recruitment sources
    getRecruitmentSources: builder.query<RecruitmentSource[], void>({
      query: () => '/v1/recruitment/config/sources',
      transformResponse: (res: { data: RecruitmentSource[] }) => res.data,
      providesTags: ['RecruitmentSource' as any],
    }),
    saveRecruitmentSource: builder.mutation<RecruitmentSource, Partial<RecruitmentSource>>({
      query: (body) => ({
        url: '/v1/recruitment/config/sources',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['RecruitmentSource' as any],
    }),

    // Approval workflows
    getWorkflowDefinitions: builder.query<WorkflowDefinition[], void>({
      query: () => '/v1/recruitment/config/workflows',
      transformResponse: (res: { data: WorkflowDefinition[] }) => res.data,
      providesTags: ['WorkflowDefinition' as any],
    }),
    saveWorkflowDefinition: builder.mutation<WorkflowDefinition, Partial<WorkflowDefinition>>({
      query: (body) => ({
        url: '/v1/recruitment/config/workflows',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['WorkflowDefinition' as any],
    }),
    getWorkflowSteps: builder.query<WorkflowStep[], string>({
      query: (workflowId) => `/v1/recruitment/config/workflows/${workflowId}/steps`,
      transformResponse: (res: { data: WorkflowStep[] }) => res.data,
      providesTags: ['WorkflowStep' as any],
    }),
    saveWorkflowStep: builder.mutation<WorkflowStep, Partial<WorkflowStep>>({
      query: (body) => ({
        url: '/v1/recruitment/config/workflows/steps',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['WorkflowStep' as any],
    }),

    // Offer templates
    getOfferTemplates: builder.query<OfferTemplate[], void>({
      query: () => '/v1/recruitment/config/templates',
      transformResponse: (res: { data: OfferTemplate[] }) => res.data,
      providesTags: ['OfferTemplate' as any],
    }),
    saveOfferTemplate: builder.mutation<OfferTemplate, Partial<OfferTemplate>>({
      query: (body) => ({
        url: '/v1/recruitment/config/templates',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['OfferTemplate' as any],
    }),

    // Notification configs
    getNotificationTemplates: builder.query<NotificationTemplate[], void>({
      query: () => '/v1/recruitment/config/notification/templates',
      transformResponse: (res: { data: NotificationTemplate[] }) => res.data,
      providesTags: ['NotificationTemplate' as any],
    }),
    saveNotificationTemplate: builder.mutation<NotificationTemplate, Partial<NotificationTemplate>>({
      query: (body) => ({
        url: '/v1/recruitment/config/notification/templates',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['NotificationTemplate' as any],
    }),
    getNotificationRules: builder.query<NotificationRule[], void>({
      query: () => '/v1/recruitment/config/notification/rules',
      transformResponse: (res: { data: NotificationRule[] }) => res.data,
      providesTags: ['NotificationRule' as any],
    }),
    saveNotificationRule: builder.mutation<NotificationRule, Partial<NotificationRule>>({
      query: (body) => ({
        url: '/v1/recruitment/config/notification/rules',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['NotificationRule' as any],
    }),

    // Automation rules
    getAutomationRules: builder.query<AutomationRule[], void>({
      query: () => '/v1/recruitment/config/automation/rules',
      transformResponse: (res: { data: AutomationRule[] }) => res.data,
      providesTags: ['AutomationRule' as any],
    }),
    saveAutomationRule: builder.mutation<AutomationRule, Partial<AutomationRule>>({
      query: (body) => ({
        url: '/v1/recruitment/config/automation/rules',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AutomationRule' as any],
    }),
    getAutomationConditions: builder.query<AutomationCondition[], string>({
      query: (ruleId) => `/v1/recruitment/config/automation/rules/${ruleId}/conditions`,
      transformResponse: (res: { data: AutomationCondition[] }) => res.data,
      providesTags: ['AutomationCondition' as any],
    }),
    saveAutomationCondition: builder.mutation<AutomationCondition, Partial<AutomationCondition>>({
      query: (body) => ({
        url: '/v1/recruitment/config/automation/conditions',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AutomationCondition' as any],
    }),
    getAutomationActions: builder.query<AutomationAction[], string>({
      query: (ruleId) => `/v1/recruitment/config/automation/rules/${ruleId}/actions`,
      transformResponse: (res: { data: AutomationAction[] }) => res.data,
      providesTags: ['AutomationAction' as any],
    }),
    saveAutomationAction: builder.mutation<AutomationAction, Partial<AutomationAction>>({
      query: (body) => ({
        url: '/v1/recruitment/config/automation/actions',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AutomationAction' as any],
    }),

    // Hiring Reasons
    getHiringReasons: builder.query<RequisitionHiringReason[], void>({
      query: () => '/v1/recruitment/config/hiring-reasons',
      transformResponse: (res: { data: RequisitionHiringReason[] }) => res.data,
      providesTags: ['HiringReason' as any],
    }),
    saveHiringReason: builder.mutation<RequisitionHiringReason, Partial<RequisitionHiringReason>>({
      query: (body) => ({
        url: '/v1/recruitment/config/hiring-reasons',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['HiringReason' as any],
    }),

    // Skills
    getSkills: builder.query<SkillMaster[], void>({
      query: () => '/v1/recruitment/config/skills',
      transformResponse: (res: { data: SkillMaster[] }) => res.data,
      providesTags: ['Skill' as any],
    }),
    searchSkills: builder.query<SkillMaster[], string>({
      query: (query) => `/v1/recruitment/config/skills/search?query=${query}`,
      transformResponse: (res: { data: SkillMaster[] }) => res.data,
      providesTags: ['Skill' as any],
    }),
    saveSkill: builder.mutation<SkillMaster, Partial<SkillMaster>>({
      query: (body) => ({
        url: '/v1/recruitment/config/skills',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Skill' as any],
    }),
  }),
});

export const {
  useGetFormDefinitionsQuery,
  useSaveFormDefinitionMutation,
  useGetFormSectionsQuery,
  useSaveFormSectionMutation,
  useGetFieldDefinitionsQuery,
  useSaveFieldDefinitionMutation,
  useGetFieldOptionsQuery,
  useSaveFieldOptionMutation,
  useGetFieldValuesQuery,
  useSaveFieldValuesMutation,
  useGetStagesQuery,
  useSaveStageMutation,
  useDeleteStageMutation,
  useGetInterviewTypesQuery,
  useSaveInterviewTypeMutation,
  useGetRecruitmentSourcesQuery,
  useSaveRecruitmentSourceMutation,
  useGetWorkflowDefinitionsQuery,
  useSaveWorkflowDefinitionMutation,
  useGetWorkflowStepsQuery,
  useSaveWorkflowStepMutation,
  useGetOfferTemplatesQuery,
  useSaveOfferTemplateMutation,
  useGetNotificationTemplatesQuery,
  useSaveNotificationTemplateMutation,
  useGetNotificationRulesQuery,
  useSaveNotificationRuleMutation,
  useGetAutomationRulesQuery,
  useSaveAutomationRuleMutation,
  useGetAutomationConditionsQuery,
  useSaveAutomationConditionMutation,
  useGetAutomationActionsQuery,
  useSaveAutomationActionMutation,
  useGetHiringReasonsQuery,
  useSaveHiringReasonMutation,
  useGetSkillsQuery,
  useLazySearchSkillsQuery,
  useSaveSkillMutation,
} = recruitmentConfigApi;
