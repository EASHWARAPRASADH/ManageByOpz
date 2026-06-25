package com.managemyopz.twin.recruitment.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.managemyopz.shared.entity.TenantContext;
import com.managemyopz.shared.exception.PlatformException;
import com.managemyopz.twin.entity.EmployeeTwin;
import com.managemyopz.twin.recruitment.entity.*;
import com.managemyopz.twin.recruitment.repository.*;
import com.managemyopz.twin.service.EmployeeTwinService;
import com.managemyopz.audit.service.AuditService;
import com.managemyopz.audit.entity.AuditLog.AuditAction;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class RecruitmentConfigServiceImpl implements RecruitmentConfigService {

    private final FormDefinitionRepository formDefinitionRepository;
    private final FormSectionRepository formSectionRepository;
    private final FieldDefinitionRepository fieldDefinitionRepository;
    private final FieldOptionRepository fieldOptionRepository;
    private final FieldValueRepository fieldValueRepository;
    private final RecruitmentStageRepository recruitmentStageRepository;
    private final InterviewTypeRepository interviewTypeRepository;
    private final RecruitmentSourceRepository recruitmentSourceRepository;
    private final WorkflowDefinitionRepository workflowDefinitionRepository;
    private final WorkflowStepRepository workflowStepRepository;
    private final WorkflowAssignmentRepository workflowAssignmentRepository;
    private final OfferTemplateRepository offerTemplateRepository;
    private final NotificationTemplateRepository notificationTemplateRepository;
    private final NotificationRuleRepository notificationRuleRepository;
    private final AutomationRuleRepository automationRuleRepository;
    private final AutomationConditionRepository automationConditionRepository;
    private final AutomationActionRepository automationActionRepository;

    private final CandidateRepository candidateRepository;
    private final EmployeeTwinService employeeTwinService;
    private final AuditService auditService;
    private final ObjectMapper objectMapper;

    private final RequisitionHiringReasonRepository requisitionHiringReasonRepository;
    private final SkillMasterRepository skillMasterRepository;

    private String getTenant() {
        String tenant = TenantContext.getCurrentTenant();
        return tenant != null ? tenant : "ACME";
    }

    private void recordAudit(String entityType, String entityId, AuditAction action, String summary) {
        try {
            String tenant = getTenant();
            String user = TenantContext.getCurrentUser() != null ? TenantContext.getCurrentUser() : "system";
            auditService.recordAudit(
                tenant,
                "RECRUITMENT_ADMIN",
                entityType,
                entityId,
                action,
                null,
                null,
                UUID.randomUUID().toString(),
                user,
                summary
            );
        } catch (Exception e) {
            log.error("Failed to write recruitment config audit log", e);
        }
    }

    // ── Form Definitions ──────────────────────────────────────
    @Override
    public List<FormDefinition> getFormDefinitions() {
        return formDefinitionRepository.findByTenantIdAndDeletedFalse(getTenant());
    }

    @Override
    public FormDefinition saveFormDefinition(FormDefinition form) {
        if (form.getTenantId() == null) form.setTenantId(getTenant());
        FormDefinition saved = formDefinitionRepository.save(form);
        recordAudit("FormDefinition", saved.getId().toString(), AuditAction.CREATE, "Saved Form Definition: " + saved.getFormName());
        return saved;
    }

    // ── Form Sections ──────────────────────────────────────────
    @Override
    public List<FormSection> getFormSections(UUID formId) {
        return formSectionRepository.findByTenantIdAndFormIdAndDeletedFalseOrderByDisplayOrderAsc(getTenant(), formId);
    }

    @Override
    public FormSection saveFormSection(FormSection section) {
        if (section.getTenantId() == null) section.setTenantId(getTenant());
        FormSection saved = formSectionRepository.save(section);
        recordAudit("FormSection", saved.getId().toString(), AuditAction.CREATE, "Saved Form Section: " + saved.getSectionName());
        return saved;
    }

    // ── Field Definitions ──────────────────────────────────────
    @Override
    public List<FieldDefinition> getFieldDefinitions(UUID formId) {
        return fieldDefinitionRepository.findByTenantIdAndFormIdAndDeletedFalseOrderByDisplayOrderAsc(getTenant(), formId);
    }

    @Override
    public FieldDefinition saveFieldDefinition(FieldDefinition field) {
        if (field.getTenantId() == null) field.setTenantId(getTenant());
        FieldDefinition saved = fieldDefinitionRepository.save(field);
        recordAudit("FieldDefinition", saved.getId().toString(), AuditAction.CREATE, "Saved Field Definition: " + saved.getFieldLabel());
        return saved;
    }

    // ── Field Options ──────────────────────────────────────────
    @Override
    public List<FieldOption> getFieldOptions(UUID fieldId) {
        return fieldOptionRepository.findByTenantIdAndFieldDefinitionIdAndDeletedFalseOrderByOptionOrderAsc(getTenant(), fieldId);
    }

    @Override
    public FieldOption saveFieldOption(FieldOption option) {
        if (option.getTenantId() == null) option.setTenantId(getTenant());
        FieldOption saved = fieldOptionRepository.save(option);
        recordAudit("FieldOption", saved.getId().toString(), AuditAction.CREATE, "Saved Field Option: " + saved.getOptionLabel());
        return saved;
    }

    // ── Custom Field Values ────────────────────────────────────
    @Override
    public List<FieldValue> getFieldValues(UUID entityId, String entityType) {
        return fieldValueRepository.findByTenantIdAndEntityIdAndEntityTypeAndDeletedFalse(getTenant(), entityId, entityType);
    }

    @Override
    public void saveFieldValues(UUID entityId, String entityType, List<FieldValue> values) {
        String tenant = getTenant();
        for (FieldValue val : values) {
            val.setTenantId(tenant);
            val.setEntityId(entityId);
            val.setEntityType(entityType);
            
            Optional<FieldValue> existing = fieldValueRepository.findByTenantIdAndEntityIdAndEntityTypeAndFieldDefinitionIdAndDeletedFalse(
                    tenant, entityId, entityType, val.getFieldDefinitionId());
            if (existing.isPresent()) {
                FieldValue ext = existing.get();
                ext.setFieldValue(val.getFieldValue());
                fieldValueRepository.save(ext);
            } else {
                fieldValueRepository.save(val);
            }
        }
        recordAudit(entityType + "Values", entityId.toString(), AuditAction.UPDATE, "Updated custom field values for " + entityType);
    }

    // ── Stages ────────────────────────────────────────────────
    @Override
    public List<RecruitmentStage> getStages() {
        return recruitmentStageRepository.findByTenantIdAndDeletedFalseOrderByDisplayOrderAsc(getTenant());
    }

    @Override
    public RecruitmentStage saveStage(RecruitmentStage stage) {
        if (stage.getTenantId() == null) stage.setTenantId(getTenant());
        RecruitmentStage saved = recruitmentStageRepository.save(stage);
        recordAudit("RecruitmentStage", saved.getId().toString(), AuditAction.CREATE, "Saved recruitment stage " + saved.getStageName());
        return saved;
    }

    @Override
    public void deleteStage(UUID id) {
        Optional<RecruitmentStage> stage = recruitmentStageRepository.findByIdAndTenantIdAndDeletedFalse(id, getTenant());
        if (stage.isPresent()) {
            RecruitmentStage stg = stage.get();
            stg.setDeleted(true);
            recruitmentStageRepository.save(stg);
            recordAudit("RecruitmentStage", id.toString(), AuditAction.DELETE, "Deleted recruitment stage " + stg.getStageName());
        }
    }

    // ── Interview Types ───────────────────────────────────────
    @Override
    public List<InterviewType> getInterviewTypes() {
        return interviewTypeRepository.findByTenantIdAndDeletedFalse(getTenant());
    }

    @Override
    public InterviewType saveInterviewType(InterviewType type) {
        if (type.getTenantId() == null) type.setTenantId(getTenant());
        InterviewType saved = interviewTypeRepository.save(type);
        recordAudit("InterviewType", saved.getId().toString(), AuditAction.CREATE, "Saved Interview Type: " + saved.getTypeName());
        return saved;
    }

    // ── Sources ───────────────────────────────────────────────
    @Override
    public List<RecruitmentSource> getRecruitmentSources() {
        return recruitmentSourceRepository.findByTenantIdAndDeletedFalse(getTenant());
    }

    @Override
    public RecruitmentSource saveRecruitmentSource(RecruitmentSource source) {
        if (source.getTenantId() == null) source.setTenantId(getTenant());
        RecruitmentSource saved = recruitmentSourceRepository.save(source);
        recordAudit("RecruitmentSource", saved.getId().toString(), AuditAction.CREATE, "Saved Recruitment Source: " + saved.getSourceName());
        return saved;
    }

    // ── Workflows ──────────────────────────────────────────────
    @Override
    public List<WorkflowDefinition> getWorkflowDefinitions() {
        return workflowDefinitionRepository.findByTenantIdAndDeletedFalse(getTenant());
    }

    @Override
    public WorkflowDefinition saveWorkflowDefinition(WorkflowDefinition wf) {
        if (wf.getTenantId() == null) wf.setTenantId(getTenant());
        WorkflowDefinition saved = workflowDefinitionRepository.save(wf);
        recordAudit("WorkflowDefinition", saved.getId().toString(), AuditAction.CREATE, "Saved Workflow Definition: " + saved.getWorkflowName());
        return saved;
    }

    @Override
    public List<WorkflowStep> getWorkflowSteps(UUID workflowId) {
        return workflowStepRepository.findByTenantIdAndWorkflowDefinitionIdAndDeletedFalseOrderByStepOrderAsc(getTenant(), workflowId);
    }

    @Override
    public WorkflowStep saveWorkflowStep(WorkflowStep step) {
        if (step.getTenantId() == null) step.setTenantId(getTenant());
        WorkflowStep saved = workflowStepRepository.save(step);
        recordAudit("WorkflowStep", saved.getId().toString(), AuditAction.CREATE, "Saved Workflow Step: " + saved.getStepName());
        return saved;
    }

    // ── Active workflow tracking ──────────────────────────────
    @Override
    public WorkflowAssignment getWorkflowAssignment(UUID entityId, String entityType) {
        return workflowAssignmentRepository.findByTenantIdAndEntityIdAndEntityTypeAndDeletedFalse(getTenant(), entityId, entityType)
                .orElse(null);
    }

    @Override
    public WorkflowAssignment startWorkflow(UUID entityId, String entityType, UUID workflowDefId) {
        String tenant = getTenant();
        // Clear any prior assignments
        workflowAssignmentRepository.findByTenantIdAndEntityIdAndEntityTypeAndDeletedFalse(tenant, entityId, entityType)
                .ifPresent(existing -> {
                    existing.setDeleted(true);
                    workflowAssignmentRepository.save(existing);
                });

        WorkflowAssignment assignment = new WorkflowAssignment();
        assignment.setTenantId(tenant);
        assignment.setEntityId(entityId);
        assignment.setEntityType(entityType);
        assignment.setWorkflowDefinitionId(workflowDefId);
        assignment.setCurrentStepIndex(0);
        assignment.setStatus("PENDING_APPROVAL");

        WorkflowAssignment saved = workflowAssignmentRepository.save(assignment);
        recordAudit("WorkflowAssignment", saved.getId().toString(), AuditAction.CREATE, "Initiated workflow approval assignment for " + entityType);
        return saved;
    }

    @Override
    public WorkflowAssignment approveWorkflowStep(UUID entityId, String entityType, String approverRole, String comments) {
        String tenant = getTenant();
        WorkflowAssignment assignment = workflowAssignmentRepository.findByTenantIdAndEntityIdAndEntityTypeAndDeletedFalse(tenant, entityId, entityType)
                .orElseThrow(() -> new PlatformException("Active workflow assignment not found", HttpStatus.NOT_FOUND, "WORKFLOW_NOT_FOUND"));

        List<WorkflowStep> steps = workflowStepRepository.findByTenantIdAndWorkflowDefinitionIdAndDeletedFalseOrderByStepOrderAsc(tenant, assignment.getWorkflowDefinitionId());
        if (steps.isEmpty()) {
            assignment.setStatus("APPROVED");
        } else {
            int currentIndex = assignment.getCurrentStepIndex();
            WorkflowStep currentStep = steps.get(currentIndex);

            // In a real environment we would check user's roles, for now we record the step approval
            if (currentIndex + 1 >= steps.size()) {
                assignment.setStatus("APPROVED");
            } else {
                assignment.setCurrentStepIndex(currentIndex + 1);
            }
        }

        WorkflowAssignment saved = workflowAssignmentRepository.save(assignment);
        recordAudit("WorkflowAssignment", saved.getId().toString(), AuditAction.APPROVE, "Approved step in workflow for " + entityType + ". Status: " + saved.getStatus());
        return saved;
    }

    // ── Offer Templates ───────────────────────────────────────
    @Override
    public List<OfferTemplate> getOfferTemplates() {
        return offerTemplateRepository.findByTenantIdAndDeletedFalse(getTenant());
    }

    @Override
    public OfferTemplate saveOfferTemplate(OfferTemplate tpl) {
        if (tpl.getTenantId() == null) tpl.setTenantId(getTenant());
        OfferTemplate saved = offerTemplateRepository.save(tpl);
        recordAudit("OfferTemplate", saved.getId().toString(), AuditAction.CREATE, "Saved Offer Template: " + saved.getTemplateName());
        return saved;
    }

    @Override
    public String generateOfferHtml(UUID templateId, Map<String, String> placeholders) {
        OfferTemplate tpl = offerTemplateRepository.findByIdAndTenantIdAndDeletedFalse(templateId, getTenant())
                .orElseThrow(() -> new PlatformException("Template not found", HttpStatus.NOT_FOUND, "TEMPLATE_NOT_FOUND"));
        
        String html = tpl.getTemplateHtml();
        for (Map.Entry<String, String> entry : placeholders.entrySet()) {
            html = html.replace("{{" + entry.getKey() + "}}", entry.getValue() != null ? entry.getValue() : "");
        }
        return html;
    }

    // ── Notification Configurations ─────────────────────────────
    @Override
    public List<NotificationTemplate> getNotificationTemplates() {
        return notificationTemplateRepository.findByTenantIdAndDeletedFalse(getTenant());
    }

    @Override
    public NotificationTemplate saveNotificationTemplate(NotificationTemplate tpl) {
        if (tpl.getTenantId() == null) tpl.setTenantId(getTenant());
        NotificationTemplate saved = notificationTemplateRepository.save(tpl);
        recordAudit("NotificationTemplate", saved.getId().toString(), AuditAction.CREATE, "Saved Notification Template: " + saved.getTemplateName());
        return saved;
    }

    @Override
    public List<NotificationRule> getNotificationRules() {
        return notificationRuleRepository.findByTenantIdAndDeletedFalse(getTenant());
    }

    @Override
    public NotificationRule saveNotificationRule(NotificationRule rule) {
        if (rule.getTenantId() == null) rule.setTenantId(getTenant());
        NotificationRule saved = notificationRuleRepository.save(rule);
        recordAudit("NotificationRule", saved.getId().toString(), AuditAction.CREATE, "Saved Notification Rule: " + saved.getRuleName());
        return saved;
    }

    @Override
    public void triggerNotification(String eventType, Map<String, String> placeholders) {
        String tenant = getTenant();
        List<NotificationRule> rules = notificationRuleRepository.findByTenantIdAndEventTypeAndActiveTrueAndDeletedFalse(tenant, eventType);
        
        for (NotificationRule rule : rules) {
            Optional<NotificationTemplate> templateOpt = notificationTemplateRepository.findByIdAndTenantIdAndDeletedFalse(
                    rule.getNotificationTemplateId(), tenant);
            if (templateOpt.isPresent()) {
                NotificationTemplate tpl = templateOpt.get();
                String subject = tpl.getSubject();
                String content = tpl.getContent();
                
                for (Map.Entry<String, String> entry : placeholders.entrySet()) {
                    String replacement = entry.getValue() != null ? entry.getValue() : "";
                    if (subject != null) subject = subject.replace("{{" + entry.getKey() + "}}", replacement);
                    content = content.replace("{{" + entry.getKey() + "}}", replacement);
                }
                
                log.info("Triggered Notification Rule [{}]: Channel: {}, Target Subject: {}, Content Preview: {}",
                        rule.getRuleName(), tpl.getChannel(), subject, content.length() > 50 ? content.substring(0, 50) + "..." : content);
                
                recordAudit("NotificationTrigger", rule.getId().toString(), AuditAction.CREATE, 
                        "Dispatched " + tpl.getChannel() + " alert triggered by event " + eventType);
            }
        }
    }

    // ── Automation Rules ──────────────────────────────────────
    @Override
    public List<AutomationRule> getAutomationRules() {
        return automationRuleRepository.findByTenantIdAndDeletedFalse(getTenant());
    }

    @Override
    public AutomationRule saveAutomationRule(AutomationRule rule) {
        if (rule.getTenantId() == null) rule.setTenantId(getTenant());
        AutomationRule saved = automationRuleRepository.save(rule);
        recordAudit("AutomationRule", saved.getId().toString(), AuditAction.CREATE, "Saved Automation Rule: " + saved.getRuleName());
        return saved;
    }

    @Override
    public List<AutomationCondition> getAutomationConditions(UUID ruleId) {
        return automationConditionRepository.findByTenantIdAndAutomationRuleIdAndDeletedFalse(getTenant(), ruleId);
    }

    @Override
    public AutomationCondition saveAutomationCondition(AutomationCondition cond) {
        if (cond.getTenantId() == null) cond.setTenantId(getTenant());
        AutomationCondition saved = automationConditionRepository.save(cond);
        recordAudit("AutomationCondition", saved.getId().toString(), AuditAction.CREATE, "Saved Automation Condition for Rule: " + cond.getAutomationRuleId());
        return saved;
    }

    @Override
    public List<AutomationAction> getAutomationActions(UUID ruleId) {
        return automationActionRepository.findByTenantIdAndAutomationRuleIdAndDeletedFalse(getTenant(), ruleId);
    }

    @Override
    public AutomationAction saveAutomationAction(AutomationAction action) {
        if (action.getTenantId() == null) action.setTenantId(getTenant());
        AutomationAction saved = automationActionRepository.save(action);
        recordAudit("AutomationAction", saved.getId().toString(), AuditAction.CREATE, "Saved Automation Action for Rule: " + action.getAutomationRuleId());
        return saved;
    }

    @Override
    public void triggerAutomation(String triggerEvent, UUID candidateId) {
        String tenant = getTenant();
        List<AutomationRule> rules = automationRuleRepository.findByTenantIdAndTriggerEventAndActiveTrueAndDeletedFalse(tenant, triggerEvent);
        
        if (rules.isEmpty()) {
            return;
        }

        Candidate candidate = candidateRepository.findByIdAndTenantIdAndDeletedFalse(candidateId, tenant)
                .orElse(null);
        if (candidate == null) {
            log.warn("Candidate {} not found for automation rule trigger", candidateId);
            return;
        }

        for (AutomationRule rule : rules) {
            log.info("Executing Automation Rule: {}", rule.getRuleName());
            List<AutomationAction> actions = automationActionRepository.findByTenantIdAndAutomationRuleIdAndDeletedFalse(tenant, rule.getId());
            
            for (AutomationAction action : actions) {
                if ("CREATE_EMPLOYEE_TWIN".equalsIgnoreCase(action.getActionType())) {
                    log.info("Automation triggered: Creating Employee Twin for candidate {}", candidate.getFullName());
                    EmployeeTwin employee = new EmployeeTwin();
                    String fullName = candidate.getFullName();
                    String firstName = fullName;
                    String lastName = "Candidate";
                    if (fullName.contains(" ")) {
                        int space = fullName.indexOf(" ");
                        firstName = fullName.substring(0, space);
                        lastName = fullName.substring(space + 1);
                    }
                    employee.setFirstName(firstName);
                    employee.setLastName(lastName);
                    employee.setWorkEmail(candidate.getEmail());
                    employee.setPersonalEmail(candidate.getEmail());
                    employee.setPersonalPhone(candidate.getPhone());
                    employee.setDateOfJoining(java.time.LocalDate.now()); // Default joining date
                    employee.setEmploymentStatus(EmployeeTwin.EmploymentStatus.ACTIVE);
                    employee.setOrganizationId(UUID.fromString("6841af62-9c16-431b-a8c2-a3adba1dc47a")); // ACME Seed organization ID
                    
                    String currentUser = TenantContext.getCurrentUser() != null ? TenantContext.getCurrentUser() : "system";
                    employeeTwinService.createEmployee(employee, currentUser);
                    recordAudit("AutomationExecute", rule.getId().toString(), AuditAction.CREATE, 
                            "Auto-converted candidate " + candidate.getFullName() + " to Employee Twin via rule " + rule.getRuleName());
                }
            }
        }
    }

    // ── Hiring Reasons ──────────────────────────────────────────
    @Override
    public List<RequisitionHiringReason> getHiringReasons() {
        return requisitionHiringReasonRepository.findByTenantIdAndDeletedFalse(getTenant());
    }

    @Override
    public RequisitionHiringReason saveHiringReason(RequisitionHiringReason reason) {
        if (reason.getTenantId() == null) reason.setTenantId(getTenant());
        RequisitionHiringReason saved = requisitionHiringReasonRepository.save(reason);
        recordAudit("HiringReason", saved.getId().toString(), AuditAction.CREATE, "Saved Hiring Reason: " + saved.getReasonName());
        return saved;
    }

    // ── Skills ──────────────────────────────────────────────────
    @Override
    public List<SkillMaster> getSkills() {
        return skillMasterRepository.findByTenantIdAndDeletedFalse(getTenant());
    }

    @Override
    public List<SkillMaster> searchSkills(String query) {
        return skillMasterRepository.findByTenantIdAndSkillNameContainingIgnoreCaseAndDeletedFalse(getTenant(), query);
    }

    @Override
    public SkillMaster saveSkill(SkillMaster skill) {
        if (skill.getTenantId() == null) skill.setTenantId(getTenant());
        SkillMaster saved = skillMasterRepository.save(skill);
        recordAudit("Skill", saved.getId().toString(), AuditAction.CREATE, "Saved Skill: " + saved.getSkillName());
        return saved;
    }
}
