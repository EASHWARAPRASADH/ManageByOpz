package com.managemyopz.twin.listener;

import com.managemyopz.twin.event.EmployeeCreatedEvent;
import com.managemyopz.twin.entity.EmployeeTwin;
import com.managemyopz.twin.repository.EmployeeTwinRepository;
import com.managemyopz.orgdna.repository.DesignationRepository;
import com.managemyopz.orgdna.repository.DepartmentRepository;
import com.managemyopz.security.service.UserProvisioningService;
import com.managemyopz.recognition.service.RecognitionService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class UserProvisioningOnboardingListener {

    private final EmployeeTwinRepository employeeTwinRepository;
    private final DesignationRepository designationRepository;
    private final DepartmentRepository departmentRepository;
    private final UserProvisioningService userProvisioningService;
    private final RecognitionService recognitionService;

    public UserProvisioningOnboardingListener(
            EmployeeTwinRepository employeeTwinRepository,
            DesignationRepository designationRepository,
            DepartmentRepository departmentRepository,
            UserProvisioningService userProvisioningService,
            RecognitionService recognitionService) {
        this.employeeTwinRepository = employeeTwinRepository;
        this.designationRepository = designationRepository;
        this.departmentRepository = departmentRepository;
        this.userProvisioningService = userProvisioningService;
        this.recognitionService = recognitionService;
        System.out.println("=== UserProvisioningOnboardingListener INITIALIZED ===");
    }

    @EventListener
    public void onEmployeeCreated(EmployeeCreatedEvent event) {
        System.out.println("=== UserProvisioningOnboardingListener RECEIVED EVENT FOR: " + event.getAggregateId() + " ===");
        log.info("Received EmployeeCreatedEvent for user provisioning: {}", event.getAggregateId());
        if (event.getAggregateId() == null) return;

        employeeTwinRepository.findById(event.getAggregateId()).ifPresent(twin -> {
            String roleCode = "ROLE_EMPLOYEE";
            String email = twin.getWorkEmail() != null ? twin.getWorkEmail().toLowerCase() : "";

            if (email.contains("super") || email.contains("admin")) {
                roleCode = "ROLE_SUPER_ADMIN";
            } else if (email.contains("hr")) {
                roleCode = "ROLE_HR_ADMIN";
            } else if (email.contains("manager") || email.contains("mgr")) {
                roleCode = "ROLE_MANAGER";
            } else {
                // Check designation
                if (twin.getDesignationId() != null) {
                    var desigOpt = designationRepository.findById(twin.getDesignationId());
                    if (desigOpt.isPresent()) {
                        String code = desigOpt.get().getCode() != null ? desigOpt.get().getCode().toUpperCase() : "";
                        String name = desigOpt.get().getName() != null ? desigOpt.get().getName().toUpperCase() : "";
                        if (code.contains("SUPER") || code.contains("ADMIN") || name.contains("SUPER") || name.contains("ADMIN")) {
                            roleCode = "ROLE_SUPER_ADMIN";
                        } else if (code.contains("HR") || name.contains("HR")) {
                            roleCode = "ROLE_HR_ADMIN";
                        } else if (code.contains("MGR") || code.contains("MANAGER") || name.contains("MGR") || name.contains("MANAGER")) {
                            roleCode = "ROLE_MANAGER";
                        }
                    }
                }
                // Check department
                if ("ROLE_EMPLOYEE".equals(roleCode) && twin.getDepartmentId() != null) {
                    var deptOpt = departmentRepository.findById(twin.getDepartmentId());
                    if (deptOpt.isPresent()) {
                        String code = deptOpt.get().getCode() != null ? deptOpt.get().getCode().toUpperCase() : "";
                        String name = deptOpt.get().getName() != null ? deptOpt.get().getName().toUpperCase() : "";
                        if (code.contains("HR") || name.contains("HR")) {
                            roleCode = "ROLE_HR_ADMIN";
                        }
                    }
                }
            }

            userProvisioningService.provisionUser(
                    twin.getTenantId(),
                    twin.getId(),
                    twin.getEmployeeCode(),
                    twin.getWorkEmail(),
                    twin.getFirstName(),
                    twin.getLastName(),
                    roleCode,
                    event.getTriggeredBy()
            );

            // Provision Recognition Wallet
            try {
                String previousTenant = com.managemyopz.shared.entity.TenantContext.getCurrentTenant();
                try {
                    com.managemyopz.shared.entity.TenantContext.setCurrentTenant(twin.getTenantId());
                    recognitionService.getOrCreateWallet(twin.getId());
                } finally {
                    com.managemyopz.shared.entity.TenantContext.setCurrentTenant(previousTenant);
                }
            } catch (Exception e) {
                log.error("Failed to provision Recognition Wallet for new employee {}", twin.getId(), e);
            }
        });
    }
}
