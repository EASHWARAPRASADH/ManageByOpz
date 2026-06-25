package com.managemyopz.twin.recruitment.service;

import com.managemyopz.twin.recruitment.entity.*;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface RecruitmentConfigService {
    // Form & Fields
    List<FormDefinition> getFormDefinitions();
    FormDefinition saveFormDefinition(FormDefinition form);
    List<FormSection> getFormSections(UUID formId);
    FormSection saveFormSection(FormSection section);
    List<FieldDefinition> getFieldDefinitions(UUID formId);
    FieldDefinition saveFieldDefinition(FieldDefinition field);
    List<FieldOption> getFieldOptions(UUID fieldId);
    FieldOption saveFieldOption(FieldOption option);
    
    // Custom Field Values
    List<FieldValue> getFieldValues(UUID entityId, String entityType);
    void saveFieldValues(UUID entityId, String entityType, List<FieldValue> values);
    
    // Stages
    List<RecruitmentStage> getStages();
    RecruitmentStage saveStage(RecruitmentStage stage);
    void deleteStage(UUID id);
    
    // Interview Types
    List<InterviewType> getInterviewTypes();
    InterviewType saveInterviewType(InterviewType type);
    
    // Sources
    List<RecruitmentSource> getRecruitmentSources();
    RecruitmentSource saveRecruitmentSource(RecruitmentSource source);
    
    // Workflows
    List<WorkflowDefinition> getWorkflowDefinitions();
    WorkflowDefinition saveWorkflowDefinition(WorkflowDefinition wf);
    List<WorkflowStep> getWorkflowSteps(UUID workflowId);
    WorkflowStep saveWorkflowStep(WorkflowStep step);
    
    // Active workflow tracking
    WorkflowAssignment getWorkflowAssignment(UUID entityId, String entityType);
    WorkflowAssignment startWorkflow(UUID entityId, String entityType, UUID workflowDefId);
    WorkflowAssignment approveWorkflowStep(UUID entityId, String entityType, String approverRole, String comments);
    
    // Offer Templates
    List<OfferTemplate> getOfferTemplates();
    OfferTemplate saveOfferTemplate(OfferTemplate tpl);
    String generateOfferHtml(UUID templateId, Map<String, String> placeholders);
    
    // Notification Configurations
    List<NotificationTemplate> getNotificationTemplates();
    NotificationTemplate saveNotificationTemplate(NotificationTemplate tpl);
    List<NotificationRule> getNotificationRules();
    NotificationRule saveNotificationRule(NotificationRule rule);
    void triggerNotification(String eventType, Map<String, String> placeholders);
    
    // Automation rules
    List<AutomationRule> getAutomationRules();
    AutomationRule saveAutomationRule(AutomationRule rule);
    List<AutomationCondition> getAutomationConditions(UUID ruleId);
    AutomationCondition saveAutomationCondition(AutomationCondition cond);
    List<AutomationAction> getAutomationActions(UUID ruleId);
    AutomationAction saveAutomationAction(AutomationAction action);
    void triggerAutomation(String triggerEvent, UUID candidateId);

    // Hiring Reasons
    List<RequisitionHiringReason> getHiringReasons();
    RequisitionHiringReason saveHiringReason(RequisitionHiringReason reason);

    // Skills
    List<SkillMaster> getSkills();
    List<SkillMaster> searchSkills(String query);
    SkillMaster saveSkill(SkillMaster skill);
}
