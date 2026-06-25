package com.managemyopz.twin.recruitment.controller;

import com.managemyopz.shared.dto.ApiResponse;
import com.managemyopz.twin.recruitment.entity.*;
import com.managemyopz.twin.recruitment.service.RecruitmentConfigService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/v1/recruitment/config")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_SUPER_ADMIN', 'ROLE_ULTRA_SUPER_ADMIN', 'ROLE_RECRUITER')")
public class RecruitmentConfigController {

    private final RecruitmentConfigService configService;

    // ── Form Definitions ──────────────────────────────────────
    @GetMapping("/forms")
    public ApiResponse<List<FormDefinition>> getFormDefinitions() {
        return ApiResponse.success(configService.getFormDefinitions(), "Form definitions retrieved successfully");
    }

    @PostMapping("/forms")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<FormDefinition> saveFormDefinition(@RequestBody FormDefinition form) {
        return ApiResponse.created(configService.saveFormDefinition(form), "Form definition saved successfully");
    }

    @GetMapping("/forms/{formId}/sections")
    public ApiResponse<List<FormSection>> getFormSections(@PathVariable UUID formId) {
        return ApiResponse.success(configService.getFormSections(formId), "Form sections retrieved successfully");
    }

    @PostMapping("/sections")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<FormSection> saveFormSection(@RequestBody FormSection section) {
        return ApiResponse.created(configService.saveFormSection(section), "Form section saved successfully");
    }

    @GetMapping("/forms/{formId}/fields")
    public ApiResponse<List<FieldDefinition>> getFieldDefinitions(@PathVariable UUID formId) {
        return ApiResponse.success(configService.getFieldDefinitions(formId), "Field definitions retrieved successfully");
    }

    @PostMapping("/fields")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<FieldDefinition> saveFieldDefinition(@RequestBody FieldDefinition field) {
        return ApiResponse.created(configService.saveFieldDefinition(field), "Field definition saved successfully");
    }

    @GetMapping("/fields/{fieldId}/options")
    public ApiResponse<List<FieldOption>> getFieldOptions(@PathVariable UUID fieldId) {
        return ApiResponse.success(configService.getFieldOptions(fieldId), "Field options retrieved successfully");
    }

    @PostMapping("/options")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<FieldOption> saveFieldOption(@RequestBody FieldOption option) {
        return ApiResponse.created(configService.saveFieldOption(option), "Field option saved successfully");
    }

    // ── Custom Field Values ────────────────────────────────────
    @GetMapping("/values/{entityType}/{entityId}")
    public ApiResponse<List<FieldValue>> getFieldValues(@PathVariable String entityType, @PathVariable UUID entityId) {
        return ApiResponse.success(configService.getFieldValues(entityId, entityType), "Custom field values retrieved successfully");
    }

    @PostMapping("/values/{entityType}/{entityId}")
    public ApiResponse<Void> saveFieldValues(@PathVariable String entityType, @PathVariable UUID entityId, @RequestBody List<FieldValue> values) {
        configService.saveFieldValues(entityId, entityType, values);
        return ApiResponse.success(null, "Custom field values saved successfully");
    }

    // ── Stages ────────────────────────────────────────────────
    @GetMapping("/stages")
    public ApiResponse<List<RecruitmentStage>> getStages() {
        return ApiResponse.success(configService.getStages(), "Recruitment stages retrieved successfully");
    }

    @PostMapping("/stages")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<RecruitmentStage> saveStage(@RequestBody RecruitmentStage stage) {
        return ApiResponse.created(configService.saveStage(stage), "Recruitment stage saved successfully");
    }

    @DeleteMapping("/stages/{id}")
    public ApiResponse<Void> deleteStage(@PathVariable UUID id) {
        configService.deleteStage(id);
        return ApiResponse.success(null, "Stage deleted successfully");
    }

    // ── Interview Types ───────────────────────────────────────
    @GetMapping("/interview-types")
    public ApiResponse<List<InterviewType>> getInterviewTypes() {
        return ApiResponse.success(configService.getInterviewTypes(), "Interview types retrieved successfully");
    }

    @PostMapping("/interview-types")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<InterviewType> saveInterviewType(@RequestBody InterviewType type) {
        return ApiResponse.created(configService.saveInterviewType(type), "Interview type saved successfully");
    }

    // ── Sources ───────────────────────────────────────────────
    @GetMapping("/sources")
    public ApiResponse<List<RecruitmentSource>> getRecruitmentSources() {
        return ApiResponse.success(configService.getRecruitmentSources(), "Recruitment sources retrieved successfully");
    }

    @PostMapping("/sources")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<RecruitmentSource> saveRecruitmentSource(@RequestBody RecruitmentSource source) {
        return ApiResponse.created(configService.saveRecruitmentSource(source), "Recruitment source saved successfully");
    }

    // ── Workflows ──────────────────────────────────────────────
    @GetMapping("/workflows")
    public ApiResponse<List<WorkflowDefinition>> getWorkflowDefinitions() {
        return ApiResponse.success(configService.getWorkflowDefinitions(), "Workflow definitions retrieved");
    }

    @PostMapping("/workflows")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<WorkflowDefinition> saveWorkflowDefinition(@RequestBody WorkflowDefinition wf) {
        return ApiResponse.created(configService.saveWorkflowDefinition(wf), "Workflow definition saved successfully");
    }

    @GetMapping("/workflows/{workflowId}/steps")
    public ApiResponse<List<WorkflowStep>> getWorkflowSteps(@PathVariable UUID workflowId) {
        return ApiResponse.success(configService.getWorkflowSteps(workflowId), "Workflow steps retrieved successfully");
    }

    @PostMapping("/workflows/steps")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<WorkflowStep> saveWorkflowStep(@RequestBody WorkflowStep step) {
        return ApiResponse.created(configService.saveWorkflowStep(step), "Workflow step saved successfully");
    }

    // ── Active workflow tracking ──────────────────────────────
    @GetMapping("/workflows/assignments/{entityType}/{entityId}")
    public ApiResponse<WorkflowAssignment> getWorkflowAssignment(@PathVariable String entityType, @PathVariable UUID entityId) {
        return ApiResponse.success(configService.getWorkflowAssignment(entityId, entityType), "Workflow assignment retrieved");
    }

    @PostMapping("/workflows/assignments/{entityType}/{entityId}/start")
    public ApiResponse<WorkflowAssignment> startWorkflow(@PathVariable String entityType, @PathVariable UUID entityId, @RequestParam UUID workflowDefId) {
        return ApiResponse.success(configService.startWorkflow(entityId, entityType, workflowDefId), "Workflow assignment started");
    }

    @PostMapping("/workflows/assignments/{entityType}/{entityId}/approve")
    public ApiResponse<WorkflowAssignment> approveWorkflowStep(@PathVariable String entityType, @PathVariable UUID entityId, @RequestParam String approverRole, @RequestParam(required = false) String comments) {
        return ApiResponse.success(configService.approveWorkflowStep(entityId, entityType, approverRole, comments), "Workflow step approved");
    }

    // ── Offer Templates ───────────────────────────────────────
    @GetMapping("/templates")
    public ApiResponse<List<OfferTemplate>> getOfferTemplates() {
        return ApiResponse.success(configService.getOfferTemplates(), "Offer templates retrieved");
    }

    @PostMapping("/templates")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<OfferTemplate> saveOfferTemplate(@RequestBody OfferTemplate tpl) {
        return ApiResponse.created(configService.saveOfferTemplate(tpl), "Offer template saved");
    }

    @PostMapping("/templates/{templateId}/generate")
    public ApiResponse<String> generateOfferHtml(@PathVariable UUID templateId, @RequestBody Map<String, String> placeholders) {
        return ApiResponse.success(configService.generateOfferHtml(templateId, placeholders), "Offer letter HTML generated successfully");
    }

    // ── Notification Configurations ─────────────────────────────
    @GetMapping("/notification/templates")
    public ApiResponse<List<NotificationTemplate>> getNotificationTemplates() {
        return ApiResponse.success(configService.getNotificationTemplates(), "Notification templates retrieved");
    }

    @PostMapping("/notification/templates")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<NotificationTemplate> saveNotificationTemplate(@RequestBody NotificationTemplate tpl) {
        return ApiResponse.created(configService.saveNotificationTemplate(tpl), "Notification template saved");
    }

    @GetMapping("/notification/rules")
    public ApiResponse<List<NotificationRule>> getNotificationRules() {
        return ApiResponse.success(configService.getNotificationRules(), "Notification rules retrieved");
    }

    @PostMapping("/notification/rules")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<NotificationRule> saveNotificationRule(@RequestBody NotificationRule rule) {
        return ApiResponse.created(configService.saveNotificationRule(rule), "Notification rule saved");
    }

    // ── Automation Rules ──────────────────────────────────────
    @GetMapping("/automation/rules")
    public ApiResponse<List<AutomationRule>> getAutomationRules() {
        return ApiResponse.success(configService.getAutomationRules(), "Automation rules retrieved");
    }

    @PostMapping("/automation/rules")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<AutomationRule> saveAutomationRule(@RequestBody AutomationRule rule) {
        return ApiResponse.created(configService.saveAutomationRule(rule), "Automation rule saved");
    }

    @GetMapping("/automation/rules/{ruleId}/conditions")
    public ApiResponse<List<AutomationCondition>> getAutomationConditions(@PathVariable UUID ruleId) {
        return ApiResponse.success(configService.getAutomationConditions(ruleId), "Automation conditions retrieved");
    }

    @PostMapping("/automation/conditions")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<AutomationCondition> saveAutomationCondition(@RequestBody AutomationCondition cond) {
        return ApiResponse.created(configService.saveAutomationCondition(cond), "Automation condition saved");
    }

    @GetMapping("/automation/rules/{ruleId}/actions")
    public ApiResponse<List<AutomationAction>> getAutomationActions(@PathVariable UUID ruleId) {
        return ApiResponse.success(configService.getAutomationActions(ruleId), "Automation actions retrieved");
    }

    @PostMapping("/automation/actions")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<AutomationAction> saveAutomationAction(@RequestBody AutomationAction action) {
        return ApiResponse.created(configService.saveAutomationAction(action), "Automation action saved");
    }

    // ── Hiring Reasons ──────────────────────────────────────────
    @GetMapping("/hiring-reasons")
    public ApiResponse<List<RequisitionHiringReason>> getHiringReasons() {
        return ApiResponse.success(configService.getHiringReasons(), "Hiring reasons retrieved successfully");
    }

    @PostMapping("/hiring-reasons")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<RequisitionHiringReason> saveHiringReason(@RequestBody RequisitionHiringReason reason) {
        return ApiResponse.created(configService.saveHiringReason(reason), "Hiring reason saved successfully");
    }

    // ── Skills ──────────────────────────────────────────────────
    @GetMapping("/skills")
    public ApiResponse<List<SkillMaster>> getSkills() {
        return ApiResponse.success(configService.getSkills(), "Skills retrieved successfully");
    }

    @GetMapping("/skills/search")
    public ApiResponse<List<SkillMaster>> searchSkills(@RequestParam String query) {
        return ApiResponse.success(configService.searchSkills(query), "Skills search completed");
    }

    @PostMapping("/skills")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<SkillMaster> saveSkill(@RequestBody SkillMaster skill) {
        return ApiResponse.created(configService.saveSkill(skill), "Skill saved successfully");
    }
}
