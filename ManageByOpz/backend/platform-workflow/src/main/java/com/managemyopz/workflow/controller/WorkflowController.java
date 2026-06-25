package com.managemyopz.workflow.controller;

import com.managemyopz.shared.dto.ApiResponse;
import com.managemyopz.shared.entity.TenantContext;
import com.managemyopz.workflow.entity.ApprovalTask;
import com.managemyopz.workflow.entity.ApprovalDelegation;
import com.managemyopz.workflow.entity.ApprovalTransaction;
import com.managemyopz.workflow.entity.WorkflowInstance;
import com.managemyopz.workflow.service.ApprovalWorkflowService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/v1/workflow")
@RequiredArgsConstructor
public class WorkflowController {

    private final ApprovalWorkflowService workflowService;

    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<WorkflowInstance>>> getPendingApprovals() {
        String actor = TenantContext.getCurrentUser();
        log.info("Fetching pending approvals for actor: {}", actor);
        List<WorkflowInstance> pending = workflowService.getPendingApprovals(actor);
        return ResponseEntity.ok(ApiResponse.success(pending, "Pending approvals retrieved successfully"));
    }

    @PostMapping("/action")
    public ResponseEntity<ApiResponse<WorkflowInstance>> processAction(@RequestBody ActionRequest request, 
                                                                     @RequestHeader(value = "X-Forwarded-For", required = false) String ipAddress) {
        if (ipAddress == null) {
            ipAddress = "127.0.0.1";
        }
        String actor = TenantContext.getCurrentUser();
        log.info("User {} actioning {} request {}", actor, request.getAction(), request.getEntityId());
        WorkflowInstance updated = workflowService.processAction(
                request.getEntityType(),
                request.getEntityId(),
                actor,
                request.getAction(),
                request.getComments(),
                ipAddress
        );
        return ResponseEntity.ok(ApiResponse.success(updated, "Action processed successfully"));
    }

    @GetMapping("/history/{entityType}/{entityId}")
    public ResponseEntity<ApiResponse<List<ApprovalTransaction>>> getHistory(@PathVariable String entityType, @PathVariable UUID entityId) {
        log.info("Fetching workflow history for {} request {}", entityType, entityId);
        List<ApprovalTransaction> history = workflowService.getHistory(entityType, entityId);
        return ResponseEntity.ok(ApiResponse.success(history, "History retrieved successfully"));
    }

    @PostMapping("/delegations")
    public ResponseEntity<ApiResponse<ApprovalDelegation>> createDelegation(@RequestBody DelegationRequest request) {
        log.info("Creating delegation from {} to {}", request.getFromEmployeeId(), request.getToEmployeeId());
        ApprovalDelegation delegation = workflowService.createDelegation(
                request.getFromEmployeeId(),
                request.getToEmployeeId(),
                request.getStartDate(),
                request.getEndDate()
        );
        return ResponseEntity.ok(ApiResponse.success(delegation, "Delegation created successfully"));
    }

    @GetMapping("/tasks")
    public ResponseEntity<ApiResponse<List<ApprovalTask>>> getTasks(@RequestParam(value = "status", required = false) String status) {
        String actor = TenantContext.getCurrentUser();
        log.info("Fetching approval tasks for user {} with status {}", actor, status);
        List<ApprovalTask> tasks = workflowService.getTasksForUser(actor, status);
        return ResponseEntity.ok(ApiResponse.success(tasks, "Approval tasks retrieved successfully"));
    }

    @PostMapping("/tasks/{taskId}/action")
    public ResponseEntity<ApiResponse<ApprovalTask>> processTaskAction(@PathVariable UUID taskId,
                                                                     @RequestBody TaskActionRequest request,
                                                                     @RequestHeader(value = "X-Forwarded-For", required = false) String ipAddress) {
        if (ipAddress == null) {
            ipAddress = "127.0.0.1";
        }
        String actor = TenantContext.getCurrentUser();
        log.info("User {} actioning task {} with action {}", actor, taskId, request.getAction());
        ApprovalTask updated = workflowService.processTaskAction(taskId, actor, request.getAction(), request.getComments(), ipAddress);
        return ResponseEntity.ok(ApiResponse.success(updated, "Task action processed successfully"));
    }

    @GetMapping("/preview")
    public ResponseEntity<ApiResponse<com.managemyopz.workflow.dto.WorkflowPreviewDto>> previewWorkflow(
            @RequestParam String entityType,
            @RequestParam UUID employeeId) {
        log.info("Previewing workflow for {} request of employee {}", entityType, employeeId);
        com.managemyopz.workflow.dto.WorkflowPreviewDto preview = workflowService.previewWorkflow(entityType, employeeId);
        return ResponseEntity.ok(ApiResponse.success(preview, "Workflow preview retrieved successfully"));
    }

    @Data
    public static class ActionRequest {
        private String entityType;
        private UUID entityId;
        private String action;
        private String comments;
    }

    @Data
    public static class TaskActionRequest {
        private String action;
        private String comments;
    }

    @Data
    public static class DelegationRequest {
        private UUID fromEmployeeId;
        private UUID toEmployeeId;
        private LocalDate startDate;
        private LocalDate endDate;
    }
}
