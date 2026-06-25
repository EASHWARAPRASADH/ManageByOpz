package com.managemyopz.leave.listener;

import com.managemyopz.leave.entity.LeaveBalance;
import com.managemyopz.leave.entity.LeaveRequest;
import com.managemyopz.leave.entity.LeaveRequest.LeaveStatus;
import com.managemyopz.leave.repository.LeaveBalanceRepository;
import com.managemyopz.leave.repository.LeaveRequestRepository;
import com.managemyopz.leave.service.LeaveBalanceCalculator;
import com.managemyopz.shared.event.WorkflowTransitionEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class LeaveWorkflowListener {

    private final LeaveRequestRepository leaveRequestRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final LeaveBalanceCalculator leaveBalanceCalculator;
    private final com.managemyopz.leave.service.CompOffService compOffService;

    @EventListener
    @Transactional
    public void onWorkflowTransition(WorkflowTransitionEvent event) {
        if ("COMP_OFF".equalsIgnoreCase(event.getEntityType())) {
            UUID reqId = event.getEntityId();
            String statusStr = event.getStatus();
            log.info("Processing workflow transition event for CompOffRequest: {} with status: {}", reqId, statusStr);
            if ("APPROVED".equalsIgnoreCase(statusStr)) {
                compOffService.approveCompOffRequest(reqId, event.getActor());
            } else if ("REJECTED".equalsIgnoreCase(statusStr)) {
                compOffService.rejectCompOffRequest(reqId, event.getActor());
            }
            return;
        }

        if (!"LEAVE".equalsIgnoreCase(event.getEntityType())) {
            return;
        }

        UUID reqId = event.getEntityId();
        log.info("Processing workflow transition event for LeaveRequest: {} with status: {} at step order: {}", 
                reqId, event.getStatus(), event.getCurrentStepOrder());

        LeaveRequest request = leaveRequestRepository.findByIdAndDeletedFalse(reqId).orElse(null);
        if (request == null) {
            log.warn("LeaveRequest {} not found for workflow transition event", reqId);
            return;
        }

        String statusStr = event.getStatus();
        int stepOrder = event.getCurrentStepOrder();

        LeaveRequest.LeaveStatus oldStatus = request.getStatus();
        LeaveRequest.LeaveStatus newStatus = oldStatus;

        if ("APPROVED".equalsIgnoreCase(statusStr)) {
            newStatus = LeaveStatus.APPROVED;
        } else if ("REJECTED".equalsIgnoreCase(statusStr)) {
            newStatus = LeaveStatus.REJECTED;
        } else if ("CANCELLED".equalsIgnoreCase(statusStr)) {
            newStatus = LeaveStatus.CANCELLED;
        } else {
            // IN_PROGRESS or PENDING
            if (stepOrder == 1) {
                newStatus = LeaveStatus.PENDING_L1;
            } else if (stepOrder == 2) {
                newStatus = LeaveStatus.PENDING_L2;
            } else if (stepOrder == 3) {
                newStatus = LeaveStatus.PENDING_L3;
            } else {
                newStatus = LeaveStatus.PENDING;
            }
        }

        if (newStatus != oldStatus) {
            log.info("Transitioning LeaveRequest {} from status {} to {}", reqId, oldStatus, newStatus);
            request.setStatus(newStatus);

            if (newStatus == LeaveStatus.APPROVED) {
                // Consume the reserved balance
                int year = request.getStartDate().getYear();
                LeaveBalance balance = leaveBalanceRepository.findByEmployeeIdAndLeaveTypeIdAndYearAndDeletedFalse(
                        request.getEmployeeId(), request.getLeaveTypeId(), year).orElse(null);
                if (balance != null) {
                    leaveBalanceCalculator.consumeBalance(balance, request.getDaysCount());
                    leaveBalanceRepository.save(balance);
                    log.info("Consumed {} days from balance for Employee {}", request.getDaysCount(), request.getEmployeeId());
                }
            } else if (newStatus == LeaveStatus.REJECTED) {
                // Release the reserved balance
                int year = request.getStartDate().getYear();
                LeaveBalance balance = leaveBalanceRepository.findByEmployeeIdAndLeaveTypeIdAndYearAndDeletedFalse(
                        request.getEmployeeId(), request.getLeaveTypeId(), year).orElse(null);
                if (balance != null) {
                    leaveBalanceCalculator.releaseBalance(balance, request.getDaysCount(), false);
                    leaveBalanceRepository.save(balance);
                    log.info("Released reserved {} days back to balance for Employee {}", request.getDaysCount(), request.getEmployeeId());
                }
            } else if (newStatus == LeaveStatus.CANCELLED) {
                // Release balance
                int year = request.getStartDate().getYear();
                LeaveBalance balance = leaveBalanceRepository.findByEmployeeIdAndLeaveTypeIdAndYearAndDeletedFalse(
                        request.getEmployeeId(), request.getLeaveTypeId(), year).orElse(null);
                if (balance != null) {
                    boolean wasApproved = (oldStatus == LeaveStatus.APPROVED);
                    leaveBalanceCalculator.releaseBalance(balance, request.getDaysCount(), wasApproved);
                    leaveBalanceRepository.save(balance);
                    log.info("Released cancelled {} days back to balance for Employee {}", request.getDaysCount(), request.getEmployeeId());
                }
            }

            leaveRequestRepository.save(request);
        }
    }
}
