package com.managemyopz.leave.service;

import com.managemyopz.leave.entity.CompOffRequest;
import com.managemyopz.leave.entity.CompOffWallet;
import com.managemyopz.leave.repository.CompOffRequestRepository;
import com.managemyopz.leave.repository.CompOffWalletRepository;
import com.managemyopz.shared.entity.TenantContext;
import com.managemyopz.workflow.service.ApprovalWorkflowService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class CompOffServiceImpl implements CompOffService {

    private final CompOffRequestRepository requestRepository;
    private final CompOffWalletRepository walletRepository;
    private final ApprovalWorkflowService workflowService;

    @Override
    public CompOffRequest submitCompOffRequest(UUID employeeId, LocalDate workDate, double hoursWorked, String reason, String initiatorUsername) {
        log.info("Submitting comp-off request for employee: {}, workDate: {}, hours: {}", employeeId, workDate, hoursWorked);
        
        CompOffRequest request = new CompOffRequest();
        request.setTenantId(TenantContext.getCurrentTenant());
        request.setEmployeeId(employeeId);
        request.setWorkDate(workDate);
        request.setHoursWorked(hoursWorked);
        request.setReason(reason);
        request.setStatus("PENDING");
        request.setExpiryDate(workDate.plusDays(60)); // Standard 60-day expiry
        
        CompOffRequest saved = requestRepository.save(request);

        // Initiate Approval Workflow
        try {
            workflowService.initiateWorkflow("COMP_OFF", saved.getId(), employeeId, initiatorUsername);
        } catch (Exception e) {
            log.error("Failed to initiate workflow for comp-off: {}", e.getMessage(), e);
        }

        return saved;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CompOffRequest> getEmployeeRequests(UUID employeeId) {
        return requestRepository.findByEmployeeIdAndDeletedFalse(employeeId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CompOffRequest> getAllRequests() {
        String tenantId = TenantContext.getCurrentTenant();
        return requestRepository.findByTenantIdAndDeletedFalse(tenantId);
    }

    @Override
    @Transactional(readOnly = true)
    public CompOffWallet getEmployeeWallet(UUID employeeId) {
        return walletRepository.findByEmployeeIdAndDeletedFalse(employeeId)
                .orElseGet(() -> {
                    CompOffWallet wallet = new CompOffWallet();
                    wallet.setTenantId(TenantContext.getCurrentTenant());
                    wallet.setEmployeeId(employeeId);
                    wallet.setAvailableDays(0.0);
                    return walletRepository.save(wallet);
                });
    }

    @Override
    public void approveCompOffRequest(UUID requestId, String approvedBy) {
        log.info("Approving comp-off request: {} by {}", requestId, approvedBy);
        CompOffRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Comp-off request not found: " + requestId));
        
        if (!"PENDING".equalsIgnoreCase(request.getStatus())) {
            return;
        }

        request.setStatus("APPROVED");
        request.setApprovedBy(approvedBy);
        requestRepository.save(request);

        // Credit to Wallet
        double creditDays = request.getHoursWorked() >= 8.0 ? 1.0 : (request.getHoursWorked() >= 4.0 ? 0.5 : 0.0);
        if (creditDays > 0.0) {
            CompOffWallet wallet = getEmployeeWallet(request.getEmployeeId());
            wallet.setAvailableDays(wallet.getAvailableDays() + creditDays);
            wallet.setExpiryDate(request.getExpiryDate());
            walletRepository.save(wallet);
            log.info("Credited {} days to comp-off wallet for employee {}", creditDays, request.getEmployeeId());
        }
    }

    @Override
    public void rejectCompOffRequest(UUID requestId, String rejectedBy) {
        log.info("Rejecting comp-off request: {} by {}", requestId, rejectedBy);
        CompOffRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Comp-off request not found: " + requestId));
        
        if (!"PENDING".equalsIgnoreCase(request.getStatus())) {
            return;
        }

        request.setStatus("REJECTED");
        requestRepository.save(request);
    }

    @Override
    public void expireCompOffBalances() {
        log.info("Running comp-off balance expiry job");
        LocalDate today = LocalDate.now();
        List<CompOffWallet> wallets = walletRepository.findByExpiryDateBeforeAndAvailableDaysGreaterThanAndDeletedFalse(today, 0.0);
        for (CompOffWallet wallet : wallets) {
            log.info("Expiring comp-off balance of {} days for employee {}", wallet.getAvailableDays(), wallet.getEmployeeId());
            wallet.setAvailableDays(0.0);
            walletRepository.save(wallet);
        }
    }
}
