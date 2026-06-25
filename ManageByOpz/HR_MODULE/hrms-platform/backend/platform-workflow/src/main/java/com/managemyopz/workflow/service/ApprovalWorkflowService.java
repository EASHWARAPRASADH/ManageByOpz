package com.managemyopz.workflow.service;

import com.managemyopz.workflow.entity.ApprovalDelegation;
import com.managemyopz.workflow.entity.ApprovalTransaction;
import com.managemyopz.workflow.entity.WorkflowInstance;
import com.managemyopz.workflow.entity.ApprovalTask;
import com.managemyopz.workflow.dto.WorkflowPreviewDto;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface ApprovalWorkflowService {
    WorkflowInstance initiateWorkflow(String entityType, UUID entityId, UUID employeeId, String initiatorUsername);
    WorkflowInstance processAction(String entityType, UUID entityId, String actorUsername, String action, String comments, String ipAddress);
    List<WorkflowInstance> getPendingApprovals(String actorUsername);
    List<ApprovalTransaction> getHistory(String entityType, UUID entityId);
    ApprovalDelegation createDelegation(UUID fromEmployeeId, UUID toEmployeeId, LocalDate startDate, LocalDate endDate);
    String resolveCurrentApprover(String entityType, UUID entityId);

    // Phase 3 tasks
    List<ApprovalTask> getTasksForUser(String username, String status);
    ApprovalTask processTaskAction(UUID taskId, String actorUsername, String action, String comments, String ipAddress);

    WorkflowPreviewDto previewWorkflow(String entityType, UUID employeeId);
}
