package com.managemyopz.leave.service;

import com.managemyopz.leave.entity.LeaveRequest;
import com.managemyopz.leave.entity.LeaveRequest.LeaveStatus;
import com.managemyopz.workflow.entity.WorkflowInstance;
import com.managemyopz.workflow.entity.WorkflowInstance.WorkflowStatus;
import com.managemyopz.workflow.service.ApprovalWorkflowService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class LeaveApprovalServiceImpl implements LeaveApprovalService {

    private final ApprovalWorkflowService workflowService;

    @Override
    public LeaveRequest submitForApproval(LeaveRequest request, boolean requiresApproval) {
        if (!requiresApproval) {
            request.setStatus(LeaveStatus.AUTO_APPROVED);
            return request;
        }
        
        String initiator = request.getCreatedBy() != null ? request.getCreatedBy() : "system";
        WorkflowInstance instance = workflowService.initiateWorkflow("LEAVE", request.getId(), request.getEmployeeId(), initiator);
        request.setWorkflowInstanceId(instance.getId());
        mapStatus(request, instance);
        return request;
    }

    @Override
    public LeaveRequest approve(LeaveRequest request, String approverId, String comment) {
        WorkflowInstance instance = workflowService.processAction("LEAVE", request.getId(), approverId, "APPROVED", comment, "127.0.0.1");
        mapStatus(request, instance);
        request.setApprovedBy(approverId);
        return request;
    }

    @Override
    public LeaveRequest reject(LeaveRequest request, String approverId, String reason) {
        WorkflowInstance instance = workflowService.processAction("LEAVE", request.getId(), approverId, "REJECTED", reason, "127.0.0.1");
        mapStatus(request, instance);
        request.setApprovedBy(approverId);
        request.setRejectionReason(reason);
        return request;
    }

    private void mapStatus(LeaveRequest request, WorkflowInstance instance) {
        if (instance.getStatus() == WorkflowStatus.APPROVED) {
            request.setStatus(LeaveStatus.APPROVED);
        } else if (instance.getStatus() == WorkflowStatus.REJECTED) {
            request.setStatus(LeaveStatus.REJECTED);
        } else if (instance.getStatus() == WorkflowStatus.CANCELLED) {
            request.setStatus(LeaveStatus.CANCELLED);
        } else {
            // IN_PROGRESS or PENDING
            int currentStep = instance.getCurrentStepOrder();
            if (currentStep == 1) {
                request.setStatus(LeaveStatus.PENDING_L1);
            } else if (currentStep == 2) {
                request.setStatus(LeaveStatus.PENDING_L2);
            } else if (currentStep == 3) {
                request.setStatus(LeaveStatus.PENDING_L3);
            } else {
                request.setStatus(LeaveStatus.PENDING);
            }
        }
    }
}
