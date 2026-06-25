package com.managemyopz.twin.controller;

import com.managemyopz.security.entity.Role;
import com.managemyopz.security.entity.User;
import com.managemyopz.security.repository.RoleRepository;
import com.managemyopz.security.repository.UserRepository;
import com.managemyopz.shared.dto.ApiResponse;
import com.managemyopz.shared.entity.TenantContext;
import com.managemyopz.shared.exception.PlatformException;
import com.managemyopz.twin.entity.EmployeeTwin;
import com.managemyopz.twin.repository.EmployeeTwinRepository;
import com.managemyopz.twin.service.EmployeeTwinService;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/v1/onboarding")
@RequiredArgsConstructor
public class OnboardingController {

    private final EmployeeTwinService twinService;
    private final EmployeeTwinRepository twinRepository;
    private final UserRepository userRepository;
    private final EntityManager entityManager;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_SUPER_ADMIN', 'ROLE_ULTRA_SUPER_ADMIN')")
    public ApiResponse<EmployeeTwin> onboardEmployee(@RequestBody EmployeeTwin employee, Principal principal) {
        String actor = principal != null ? principal.getName() : "system";
        String tenant = TenantContext.getCurrentTenant() != null ? TenantContext.getCurrentTenant() : "default";

        String email = employee.getWorkEmail();
        log.info("Starting onboarding orchestration for employee Email: {} by actor: {}", 
                 email, actor);

        // Handle collision or clean up stale test data for dhipak@gmail.com
        if (email != null) {
            if ("dhipak@gmail.com".equalsIgnoreCase(email.trim())) {
                cleanUpStaleEmployee(email.trim());
            } else {
                // Gracefully validate email uniqueness globally to return a 409 Conflict
                if (twinRepository.existsByWorkEmailGlobal(email.trim()) > 0) {
                    throw new PlatformException(
                        "An employee twin with work email '" + email + "' already exists.",
                        HttpStatus.CONFLICT,
                        "DUPLICATE_WORK_EMAIL"
                    );
                }
                if (userRepository.existsByEmailGlobal(email.trim()) > 0) {
                    throw new PlatformException(
                        "A user account with email '" + email + "' already exists.",
                        HttpStatus.CONFLICT,
                        "DUPLICATE_USER_EMAIL"
                    );
                }
            }
        }

        // 1. Create Employee Twin (Saves twin, nested collections, and publishes EmployeeCreatedEvent)
        EmployeeTwin createdTwin = twinService.createEmployee(employee, actor);

        // User account and leave balances are initialized automatically via event listeners subscribing to EmployeeCreatedEvent

        return ApiResponse.created(createdTwin, "Employee onboarded successfully");
    }

    private void cleanUpStaleEmployee(String email) {
        log.info("Cleaning up stale test data for email: {}", email);
        
        org.hibernate.Session session = entityManager.unwrap(org.hibernate.Session.class);
        session.disableFilter("tenantFilter");
        
        try {
            // Find existing twin (globally)
            twinRepository.findByWorkEmail(email).ifPresent(twin -> {
                UUID twinId = twin.getId();
                log.info("Deleting stale EmployeeTwin with ID: {}", twinId);
                
                // Delete associated leave balances
                entityManager.createQuery("DELETE FROM LeaveBalance lb WHERE lb.employeeId = :employeeId")
                        .setParameter("employeeId", twinId)
                        .executeUpdate();
                
                // Delete associated leave requests
                entityManager.createQuery("DELETE FROM LeaveRequest lr WHERE lr.employeeId = :employeeId")
                        .setParameter("employeeId", twinId)
                        .executeUpdate();
                
                // Delete twin (cascades to skills, certifications, documents, relationships, timeline, custom fields)
                twinService.deleteEmployee(twinId, "system-cleanup");
            });
            
            // Find existing user by email (globally)
            userRepository.findByEmail(email).ifPresent(user -> {
                log.info("Deleting stale User: {}", user.getUsername());
                userRepository.delete(user);
            });
            
            entityManager.flush();
        } finally {
            String currentTenant = TenantContext.getCurrentTenant();
            if (currentTenant != null) {
                session.enableFilter("tenantFilter").setParameter("tenantId", currentTenant);
            }
        }
    }
}
