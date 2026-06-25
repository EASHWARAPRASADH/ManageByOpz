package com.managemyopz.twin.controller;

import com.managemyopz.shared.dto.ApiResponse;
import com.managemyopz.twin.entity.EmployeeTwin;
import com.managemyopz.twin.repository.EmployeeTwinRepository;
import com.managemyopz.shared.entity.TenantContext;
import com.managemyopz.shared.exception.PlatformException;
import com.managemyopz.security.entity.User;
import com.managemyopz.security.entity.Role;
import com.managemyopz.security.repository.UserRepository;
import com.managemyopz.security.repository.RoleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import java.util.UUID;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(classes = com.managemyopz.HrmsPlatformApplication.class)
@Transactional
public class EmployeeTwinLifecycleIntegrationTest {

    @Autowired
    private EmployeeTwinController employeeTwinController;

    @Autowired
    private EmployeeTwinRepository employeeTwinRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @PersistenceContext
    private EntityManager entityManager;

    private String testTenant;

    @BeforeEach
    public void setUp() {
        testTenant = "TENANT_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        TenantContext.setCurrentTenant(testTenant);
    }

    @Test
    public void testEmployeeLifecycle_Success() {
        // Clear tenant context temporarily to load system roles and save the user
        TenantContext.setCurrentTenant(null);

        Role ultraRole = roleRepository.findByCode("ROLE_ULTRA_SUPER_ADMIN").orElse(null);
        if (ultraRole == null) {
            ultraRole = new Role();
            ultraRole.setCode("ROLE_ULTRA_SUPER_ADMIN");
            ultraRole.setName("Ultra Super Admin");
            ultraRole.setTenantId("SYSTEM");
            ultraRole = roleRepository.save(ultraRole);
        }

        User testUser = new User();
        testUser.setUsername("admin");
        testUser.setEmail("admin@managemyopz.test");
        testUser.setPasswordHash("$2b$10$SO7mGXLqrhDS/rEwAVMZZOFM1lbGKMD9omQGkF1kSRAU/mJpDyOei");
        testUser.setTenantId(testTenant);
        testUser.setRoles(Set.of(ultraRole));
        testUser.setActive(true);
        testUser.setDeleted(false);
        userRepository.save(testUser);

        // Restore tenant context
        TenantContext.setCurrentTenant(testTenant);

        // Setup Spring Security context
        SecurityContextHolder.getContext().setAuthentication(
            new UsernamePasswordAuthenticationToken(
                "admin", "password",
                List.of(new SimpleGrantedAuthority("ROLE_ULTRA_SUPER_ADMIN"))
            )
        );

        // 1. Create active employee
        EmployeeTwin emp = new EmployeeTwin();
        emp.setEmployeeCode("EMP_TEST_001");
        emp.setFirstName("John");
        emp.setLastName("Doe");
        emp.setWorkEmail("john.doe@managemyopz.test");
        emp.setEmploymentStatus(EmployeeTwin.EmploymentStatus.ACTIVE);
        emp.setTenantId(testTenant);
        emp.setDeleted(false);
        emp = employeeTwinRepository.save(emp);

        UUID empId = emp.getId();

        // 2. Add leave request dependency
        entityManager.createNativeQuery(
                "INSERT INTO leave_requests (id, tenant_id, employee_id, leave_type_id, start_date, end_date, days_count, status, reason, deleted) " +
                "VALUES (UNHEX(REPLACE(:reqId, '-', '')), :tenantId, UNHEX(REPLACE(:empId, '-', '')), UNHEX(REPLACE(:ltId, '-', '')), '2026-06-20', '2026-06-21', 2.0, 'PENDING', 'Vacation', 0)")
                .setParameter("reqId", UUID.randomUUID().toString())
                .setParameter("tenantId", testTenant)
                .setParameter("empId", empId.toString())
                .setParameter("ltId", UUID.randomUUID().toString())
                .executeUpdate();

        // 3. Try to hard delete -> must fail with PlatformException due to historical records
        final EmployeeTwin finalEmp = emp;
        java.security.Principal mockPrincipal = () -> "admin";
        PlatformException exception = assertThrows(PlatformException.class, () -> {
            employeeTwinController.deleteEmployee(finalEmp.getId(), mockPrincipal);
        });
        assertEquals("Employee cannot be deleted because historical records exist.", exception.getMessage());

        // Clear leave request dependency to test archiving
        entityManager.createNativeQuery("DELETE FROM leave_requests WHERE tenant_id = :tenantId")
                .setParameter("tenantId", testTenant)
                .executeUpdate();

        // 4. Archive the employee
        ApiResponse<EmployeeTwin> archiveResponse = employeeTwinController.archiveEmployee(empId, "Leaving the company", mockPrincipal);
        assertNotNull(archiveResponse);
        assertTrue(archiveResponse.isSuccess());
        assertEquals(EmployeeTwin.EmploymentStatus.ARCHIVED, archiveResponse.getData().getEmploymentStatus());
        assertEquals("Leaving the company", archiveResponse.getData().getArchiveReason());
        assertTrue(archiveResponse.getData().isDeleted());

        // 5. Query default list (showArchived = false) -> employee should NOT be visible
        ApiResponse<List<EmployeeTwin>> listResponseDefault = employeeTwinController.listEmployees(false);
        assertNotNull(listResponseDefault);
        assertTrue(listResponseDefault.isSuccess());
        boolean foundDefault = listResponseDefault.getData().stream()
                .anyMatch(e -> e.getId().equals(empId));
        assertFalse(foundDefault, "Archived employee should not be visible by default");

        // 6. Query list with showArchived = true -> employee should be visible
        ApiResponse<List<EmployeeTwin>> listResponseAll = employeeTwinController.listEmployees(true);
        assertNotNull(listResponseAll);
        assertTrue(listResponseAll.isSuccess());
        boolean foundAll = listResponseAll.getData().stream()
                .anyMatch(e -> e.getId().equals(empId));
        assertTrue(foundAll, "Archived employee should be visible when showArchived is true");

        // 7. Restore the archived employee
        ApiResponse<EmployeeTwin> restoreResponse = employeeTwinController.restoreEmployee(empId, mockPrincipal);
        assertNotNull(restoreResponse);
        assertTrue(restoreResponse.isSuccess());
        assertEquals(EmployeeTwin.EmploymentStatus.ACTIVE, restoreResponse.getData().getEmploymentStatus());
        assertFalse(restoreResponse.getData().isDeleted());
        assertNull(restoreResponse.getData().getArchiveReason());

        // 8. Query default list again -> employee should be visible now
        ApiResponse<List<EmployeeTwin>> listResponseDefaultAfterRestore = employeeTwinController.listEmployees(false);
        assertNotNull(listResponseDefaultAfterRestore);
        assertTrue(listResponseDefaultAfterRestore.isSuccess());
        boolean foundAfterRestore = listResponseDefaultAfterRestore.getData().stream()
                .anyMatch(e -> e.getId().equals(empId));
        assertTrue(foundAfterRestore, "Restored employee should be visible by default");

        // Clear security context after test
        SecurityContextHolder.clearContext();
    }
}
