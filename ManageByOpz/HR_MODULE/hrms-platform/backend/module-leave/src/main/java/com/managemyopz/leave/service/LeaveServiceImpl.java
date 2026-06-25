package com.managemyopz.leave.service;

import com.managemyopz.leave.entity.LeaveBalance;
import com.managemyopz.leave.entity.LeaveRequest;
import com.managemyopz.leave.entity.LeaveType;
import com.managemyopz.leave.repository.LeaveBalanceRepository;
import com.managemyopz.leave.repository.LeaveRequestRepository;
import com.managemyopz.leave.repository.LeaveTypeRepository;
import com.managemyopz.shared.exception.ResourceNotFoundException;
import com.managemyopz.shared.entity.TenantContext;
import com.managemyopz.audit.service.AuditService;
import com.managemyopz.audit.entity.AuditLog.AuditAction;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.managemyopz.leave.exception.LeaveTypeNotFoundException;
import com.managemyopz.leave.exception.LeaveValidationException;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class LeaveServiceImpl implements LeaveService {

    private final LeaveTypeRepository leaveTypeRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final AuditService auditService;
    private final LeaveValidationService leaveValidationService;
    private final LeaveApprovalService leaveApprovalService;
    private final LeaveBalanceCalculator leaveBalanceCalculator;

    private String getCurrentUser() {
        String user = TenantContext.getCurrentUser();
        return user != null ? user : "system";
    }

    private String getCurrentRole() {
        String role = TenantContext.getCurrentRole();
        return role != null ? role : "SYSTEM";
    }

    private void recordAudit(String entityType, String entityId, AuditAction action, Object before, Object after) {
        try {
            auditService.recordAudit(
                TenantContext.getCurrentTenant(),
                "LEAVE",
                entityType,
                entityId,
                action,
                before,
                after,
                UUID.randomUUID().toString(),
                getCurrentUser(),
                getCurrentRole()
            );
        } catch (Exception e) {
            log.error("Failed to record leave audit for {} {}", entityType, entityId, e);
        }
    }

    // ── Leave Types ──────────────────────────────────────────
    @Override
    public LeaveType createLeaveType(LeaveType leaveType) {
        String tenantId = TenantContext.getCurrentTenant();
        if (leaveTypeRepository.existsByTenantIdAndNameAndDeletedFalse(tenantId, leaveType.getName())) {
            throw new IllegalArgumentException("Leave Type with name '" + leaveType.getName() + "' already exists.");
        }
        if (leaveTypeRepository.existsByTenantIdAndCodeAndDeletedFalse(tenantId, leaveType.getCode())) {
            throw new IllegalArgumentException("Leave Type with code '" + leaveType.getCode() + "' already exists.");
        }
        leaveType.setTenantId(tenantId);
        leaveType.setDeleted(false);
        LeaveType saved = leaveTypeRepository.save(leaveType);
        recordAudit("LeaveType", saved.getId().toString(), AuditAction.CREATE, null, saved);
        return saved;
    }

    @Override
    public LeaveType updateLeaveType(UUID id, LeaveType details) {
        LeaveType existing = leaveTypeRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("LeaveType", id));
        String tenantId = TenantContext.getCurrentTenant();
        if (!existing.getName().equalsIgnoreCase(details.getName()) && leaveTypeRepository.existsByTenantIdAndNameAndDeletedFalse(tenantId, details.getName())) {
            throw new IllegalArgumentException("Leave Type with name '" + details.getName() + "' already exists.");
        }
        if (!existing.getCode().equalsIgnoreCase(details.getCode()) && leaveTypeRepository.existsByTenantIdAndCodeAndDeletedFalse(tenantId, details.getCode())) {
            throw new IllegalArgumentException("Leave Type with code '" + details.getCode() + "' already exists.");
        }

        LeaveType before = cloneLeaveType(existing);

        existing.setName(details.getName());
        existing.setCode(details.getCode());
        existing.setDescription(details.getDescription());
        existing.setDefaultDays(details.getDefaultDays());
        existing.setCarryForwardAllowed(details.isCarryForwardAllowed());
        existing.setMaxCarryForwardDays(details.getMaxCarryForwardDays());
        existing.setEncashmentAllowed(details.isEncashmentAllowed());
        existing.setHalfDayAllowed(details.isHalfDayAllowed());
        existing.setNegativeBalanceAllowed(details.isNegativeBalanceAllowed());
        existing.setRequiresApproval(details.isRequiresApproval());
        existing.setRequiresDocument(details.isRequiresDocument());
        existing.setMinDaysNotice(details.getMinDaysNotice());
        existing.setMaxConsecutiveDays(details.getMaxConsecutiveDays());
        existing.setActive(details.isActive());
        existing.setLeavePolicyId(details.getLeavePolicyId());
        existing.setCategory(details.getCategory());
        existing.setGenderEligibility(details.getGenderEligibility());

        LeaveType saved = leaveTypeRepository.save(existing);
        recordAudit("LeaveType", saved.getId().toString(), AuditAction.UPDATE, before, saved);
        return saved;
    }

    @Override
    @Transactional(readOnly = true)
    public List<LeaveType> getLeaveTypes() {
        return leaveTypeRepository.findByTenantIdAndDeletedFalse(TenantContext.getCurrentTenant());
    }

    @Override
    @Transactional(readOnly = true)
    public LeaveType getLeaveTypeById(UUID id) {
        return leaveTypeRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new LeaveTypeNotFoundException(id));
    }

    @Override
    public void deleteLeaveType(UUID id) {
        LeaveType existing = leaveTypeRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("LeaveType", id));
        LeaveType before = cloneLeaveType(existing);
        existing.setDeleted(true);
        existing.setDeletedAt(java.time.Instant.now());
        existing.setDeletedBy(getCurrentUser());
        leaveTypeRepository.save(existing);
        recordAudit("LeaveType", id.toString(), AuditAction.DELETE, before, existing);
    }

    // ── Leave Requests ──────────────────────────────────────────
    @Override
    public LeaveRequest applyLeave(LeaveRequest request) {
        LeaveType leaveType = getLeaveTypeById(request.getLeaveTypeId());
        
        // 1. Validate the request (including employee check, date check, overlap check, and policy check)
        leaveValidationService.validateRequest(request, leaveType);

        int year = request.getStartDate().getYear();
        
        // 2. Fetch the wallet (must be initialized by the validation layer)
        LeaveBalance balance = leaveBalanceRepository.findByEmployeeIdAndLeaveTypeIdAndYearAndDeletedFalse(request.getEmployeeId(), request.getLeaveTypeId(), year)
                .orElseThrow(() -> new LeaveValidationException("BALANCE_ERROR", "Balance record was not initialized correctly."));

        // 3. Reserve balance
        LeaveBalance beforeBalance = cloneLeaveBalance(balance);
        leaveBalanceCalculator.reserveBalance(balance, request.getDaysCount());
        leaveBalanceRepository.save(balance);
        recordAudit("LeaveBalance", balance.getId().toString(), AuditAction.UPDATE, beforeBalance, balance);

        // 4. Save leave request
        request.setTenantId(TenantContext.getCurrentTenant());
        request.setDeleted(false);
        LeaveRequest savedRequest = leaveRequestRepository.saveAndFlush(request);
        leaveApprovalService.submitForApproval(savedRequest, leaveType.isRequiresApproval());
        savedRequest = leaveRequestRepository.save(savedRequest);

        recordAudit("LeaveRequest", savedRequest.getId().toString(), AuditAction.CREATE, null, savedRequest);
        return savedRequest;
    }

    @Override
    public LeaveRequest actionLeaveRequest(UUID id, LeaveRequest.LeaveStatus newStatus, String comment, String approvedBy) {
        LeaveRequest request = leaveRequestRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("LeaveRequest", id));

        if (request.getStatus() == LeaveRequest.LeaveStatus.CANCELLED || 
            request.getStatus() == LeaveRequest.LeaveStatus.REJECTED) {
            throw new IllegalStateException("Leave request is already actioned. Current status: " + request.getStatus());
        }

        if (newStatus == LeaveRequest.LeaveStatus.APPROVED || newStatus == LeaveRequest.LeaveStatus.REJECTED) {
            if (request.getStatus() == LeaveRequest.LeaveStatus.APPROVED) {
                throw new IllegalStateException("Leave request is already approved.");
            }
        }

        int year = request.getStartDate().getYear();
        LeaveBalance balance = leaveBalanceRepository.findByEmployeeIdAndLeaveTypeIdAndYearAndDeletedFalse(request.getEmployeeId(), request.getLeaveTypeId(), year)
                .orElseThrow(() -> new ResourceNotFoundException("LeaveBalance", request.getEmployeeId()));

        LeaveRequest beforeRequest = cloneLeaveRequest(request);
        LeaveBalance beforeBalance = cloneLeaveBalance(balance);

        double days = request.getDaysCount();

        if (newStatus == LeaveRequest.LeaveStatus.APPROVED) {
            leaveBalanceCalculator.consumeBalance(balance, days);
            leaveApprovalService.approve(request, approvedBy, comment);
            recordAudit("LeaveRequest", request.getId().toString(), AuditAction.APPROVE, beforeRequest, request);
        } else if (newStatus == LeaveRequest.LeaveStatus.REJECTED) {
            leaveBalanceCalculator.releaseBalance(balance, days, false);
            leaveApprovalService.reject(request, approvedBy, comment);
            recordAudit("LeaveRequest", request.getId().toString(), AuditAction.REJECT, beforeRequest, request);
        } else if (newStatus == LeaveRequest.LeaveStatus.CANCELLED) {
            boolean isApproved = beforeRequest.getStatus() == LeaveRequest.LeaveStatus.APPROVED;
            leaveBalanceCalculator.releaseBalance(balance, days, isApproved);
            request.setStatus(LeaveRequest.LeaveStatus.CANCELLED);
            request.setCancellationReason(comment);
            recordAudit("LeaveRequest", request.getId().toString(), AuditAction.UPDATE, beforeRequest, request);
        } else {
            throw new IllegalArgumentException("Unsupported action status: " + newStatus);
        }

        leaveBalanceRepository.save(balance);
        recordAudit("LeaveBalance", balance.getId().toString(), AuditAction.UPDATE, beforeBalance, balance);

        return leaveRequestRepository.save(request);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LeaveRequest> getLeaveRequestsByEmployee(UUID employeeId) {
        return leaveRequestRepository.findByEmployeeIdAndDeletedFalse(employeeId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LeaveRequest> getAllLeaveRequests() {
        return leaveRequestRepository.findByTenantIdAndDeletedFalse(TenantContext.getCurrentTenant());
    }

    // ── Leave Balances ──────────────────────────────────────────
    @Override
    @Transactional(readOnly = true)
    public List<LeaveBalance> getLeaveBalancesByEmployee(UUID employeeId, int year) {
        return leaveBalanceRepository.findByEmployeeIdAndYearAndDeletedFalse(employeeId, year);
    }

    @Override
    public LeaveBalance adjustBalance(UUID employeeId, UUID leaveTypeId, int year, double amount, String reason) {
        LeaveBalance balance = leaveBalanceRepository.findByEmployeeIdAndLeaveTypeIdAndYearAndDeletedFalse(employeeId, leaveTypeId, year)
                .orElseGet(() -> {
                    LeaveBalance newBal = new LeaveBalance();
                    newBal.setEmployeeId(employeeId);
                    newBal.setLeaveTypeId(leaveTypeId);
                    newBal.setYear(year);
                    newBal.setTenantId(TenantContext.getCurrentTenant());
                    newBal.setDeleted(false);
                    return newBal;
                });

        LeaveBalance before = cloneLeaveBalance(balance);
        balance.setTotalAllocated(balance.getTotalAllocated() + amount);
        leaveBalanceCalculator.recalculate(balance);
        LeaveBalance saved = leaveBalanceRepository.save(balance);

        recordAudit("LeaveBalance", saved.getId().toString(), AuditAction.UPDATE, before, saved);
        return saved;
    }

    // Helper Cloners to avoid transactional references in audit logs
    private LeaveType cloneLeaveType(LeaveType source) {
        LeaveType dest = new LeaveType();
        dest.setId(source.getId());
        dest.setName(source.getName());
        dest.setCode(source.getCode());
        dest.setDescription(source.getDescription());
        dest.setDefaultDays(source.getDefaultDays());
        dest.setCarryForwardAllowed(source.isCarryForwardAllowed());
        dest.setMaxCarryForwardDays(source.getMaxCarryForwardDays());
        dest.setEncashmentAllowed(source.isEncashmentAllowed());
        dest.setHalfDayAllowed(source.isHalfDayAllowed());
        dest.setNegativeBalanceAllowed(source.isNegativeBalanceAllowed());
        dest.setRequiresApproval(source.isRequiresApproval());
        dest.setRequiresDocument(source.isRequiresDocument());
        dest.setMinDaysNotice(source.getMinDaysNotice());
        dest.setMaxConsecutiveDays(source.getMaxConsecutiveDays());
        dest.setActive(source.isActive());
        dest.setCategory(source.getCategory());
        dest.setGenderEligibility(source.getGenderEligibility());
        return dest;
    }

    private LeaveBalance cloneLeaveBalance(LeaveBalance source) {
        LeaveBalance dest = new LeaveBalance();
        dest.setId(source.getId());
        dest.setEmployeeId(source.getEmployeeId());
        dest.setLeaveTypeId(source.getLeaveTypeId());
        dest.setYear(source.getYear());
        dest.setTotalAllocated(source.getTotalAllocated());
        dest.setTotalUsed(source.getTotalUsed());
        dest.setTotalPending(source.getTotalPending());
        dest.setCarriedForward(source.getCarriedForward());
        dest.setBalance(source.getBalance());
        return dest;
    }

    private LeaveRequest cloneLeaveRequest(LeaveRequest source) {
        return LeaveRequest.builder()
                .employeeId(source.getEmployeeId())
                .leaveTypeId(source.getLeaveTypeId())
                .startDate(source.getStartDate())
                .endDate(source.getEndDate())
                .daysCount(source.getDaysCount())
                .halfDay(source.isHalfDay())
                .halfDayType(source.getHalfDayType())
                .reason(source.getReason())
                .status(source.getStatus())
                .approvedBy(source.getApprovedBy())
                .rejectionReason(source.getRejectionReason())
                .workflowInstanceId(source.getWorkflowInstanceId())
                .cancellationReason(source.getCancellationReason())
                .build();
    }
}
