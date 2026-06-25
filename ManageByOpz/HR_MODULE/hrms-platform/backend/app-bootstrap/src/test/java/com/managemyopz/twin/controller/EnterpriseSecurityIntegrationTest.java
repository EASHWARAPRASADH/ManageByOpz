package com.managemyopz.twin.controller;

import com.managemyopz.shared.entity.TenantContext;
import com.managemyopz.security.entity.*;
import com.managemyopz.security.repository.*;
import com.managemyopz.security.service.AccessSimulatorService;
import com.managemyopz.security.service.DataScopeService;
import com.managemyopz.security.service.FieldSecurityService;
import com.managemyopz.twin.entity.EmployeeTwin;
import com.managemyopz.twin.repository.EmployeeTwinRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.UUID;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(classes = com.managemyopz.HrmsPlatformApplication.class)
@Transactional
public class EnterpriseSecurityIntegrationTest {

    @Autowired
    private FieldSecurityService fieldSecurityService;

    @Autowired
    private DataScopeService dataScopeService;

    @Autowired
    private AccessSimulatorService accessSimulatorService;

    @Autowired
    private EmployeeTwinRepository employeeTwinRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FieldPermissionRepository fieldPermissionRepository;

    @Autowired
    private DataScopeRuleRepository dataScopeRuleRepository;

    private String testTenant;
    private Role employeeRole;
    private Role managerRole;
    private Role adminRole;
    private User testUser;
    private User adminUser;
    private EmployeeTwin empSelf;
    private EmployeeTwin empReport;
    private EmployeeTwin empOther;

    @BeforeEach
    public void setUp() {
        testTenant = "TENANT_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        TenantContext.setCurrentTenant(null);

        // 1. Setup Roles
        employeeRole = roleRepository.findByCode("ROLE_EMPLOYEE").orElseGet(() -> {
            Role r = new Role();
            r.setCode("ROLE_EMPLOYEE");
            r.setName("Employee");
            r.setTenantId("SYSTEM");
            r.setSystemRole(true);
            return roleRepository.save(r);
        });

        managerRole = roleRepository.findByCode("ROLE_MANAGER").orElseGet(() -> {
            Role r = new Role();
            r.setCode("ROLE_MANAGER");
            r.setName("Manager");
            r.setTenantId("SYSTEM");
            r.setSystemRole(true);
            return roleRepository.save(r);
        });

        adminRole = roleRepository.findByCode("ROLE_SUPER_ADMIN").orElseGet(() -> {
            Role r = new Role();
            r.setCode("ROLE_SUPER_ADMIN");
            r.setName("Super Admin");
            r.setTenantId("SYSTEM");
            r.setSystemRole(true);
            return roleRepository.save(r);
        });

        // 2. Setup User
        testUser = new User();
        testUser.setUsername("testuser_" + testTenant.toLowerCase());
        testUser.setEmail("testuser@managemyopz.test");
        testUser.setPasswordHash("hash");
        testUser.setTenantId(testTenant);
        testUser.setRoles(new java.util.HashSet<>(List.of(employeeRole)));
        testUser.setActive(true);
        testUser.setDeleted(false);
        testUser = userRepository.save(testUser);

        adminUser = new User();
        adminUser.setUsername("admin_" + testTenant.toLowerCase());
        adminUser.setEmail("admin@managemyopz.test");
        adminUser.setPasswordHash("hash");
        adminUser.setTenantId(testTenant);
        adminUser.setRoles(new java.util.HashSet<>(List.of(adminRole)));
        adminUser.setActive(true);
        adminUser.setDeleted(false);
        adminUser = userRepository.save(adminUser);

        TenantContext.setCurrentTenant(testTenant);

        // 3. Setup Employees (Self, Direct Report, and Out-of-Scope employee)
        empSelf = new EmployeeTwin();
        empSelf.setEmployeeCode("EMP_SELF_" + testTenant);
        empSelf.setFirstName("Self");
        empSelf.setLastName("User");
        empSelf.setWorkEmail("self@managemyopz.test");
        empSelf.setPanNumber("ABCDE1234F");
        empSelf.setBankAccountNumber("1234567890");
        empSelf.setTenantId(testTenant);
        empSelf.setDeleted(false);
        empSelf = employeeTwinRepository.save(empSelf);

        // Assign employee id to user
        testUser.setEmployeeId(empSelf.getId().toString());
        TenantContext.setCurrentTenant(null);
        userRepository.save(testUser);
        TenantContext.setCurrentTenant(testTenant);

        empReport = new EmployeeTwin();
        empReport.setEmployeeCode("EMP_REPORT_" + testTenant);
        empReport.setFirstName("Report");
        empReport.setLastName("User");
        empReport.setWorkEmail("report@managemyopz.test");
        empReport.setManagerId(empSelf.getId());
        empReport.setTenantId(testTenant);
        empReport.setDeleted(false);
        empReport = employeeTwinRepository.save(empReport);

        empOther = new EmployeeTwin();
        empOther.setEmployeeCode("EMP_OTHER_" + testTenant);
        empOther.setFirstName("Other");
        empOther.setLastName("User");
        empOther.setWorkEmail("other@managemyopz.test");
        empOther.setTenantId(testTenant);
        empOther.setDeleted(false);
        empOther = employeeTwinRepository.save(empOther);
    }

    @Test
    public void testFieldSecurityService_AccessLevels() {
        // Clear override field permissions first
        fieldPermissionRepository.deleteAll();

        // 1. Establish ROLE_EMPLOYEE defaults or explicitly save rule
        FieldPermission fpPan = new FieldPermission();
        fpPan.setRole(employeeRole);
        fpPan.setFieldName("panNumber");
        fpPan.setAccessLevel("MASKED");
        fpPan.setTenantId(testTenant);
        fieldPermissionRepository.save(fpPan);

        FieldPermission fpSalary = new FieldPermission();
        fpSalary.setRole(employeeRole);
        fpSalary.setFieldName("salary");
        fpSalary.setAccessLevel("HIDDEN");
        fpSalary.setTenantId(testTenant);
        fieldPermissionRepository.save(fpSalary);

        // Test as ROLE_EMPLOYEE
        SecurityContextHolder.getContext().setAuthentication(
            new UsernamePasswordAuthenticationToken(testUser.getUsername(), "pwd", List.of(new SimpleGrantedAuthority("ROLE_EMPLOYEE")))
        );

        String panAccess = fieldSecurityService.getAccessLevel(testUser.getUsername(), "panNumber");
        assertEquals("MASKED", panAccess);

        String salaryAccess = fieldSecurityService.getAccessLevel(testUser.getUsername(), "salary");
        assertEquals("HIDDEN", salaryAccess);

        // Test as ROLE_SUPER_ADMIN (should be EDITABLE/READ_ONLY)
        SecurityContextHolder.getContext().setAuthentication(
            new UsernamePasswordAuthenticationToken(adminUser.getUsername(), "pwd", List.of(new SimpleGrantedAuthority("ROLE_SUPER_ADMIN")))
        );
        String panAccessAdmin = fieldSecurityService.getAccessLevel(adminUser.getUsername(), "panNumber");
        assertEquals("EDITABLE", panAccessAdmin);

        SecurityContextHolder.clearContext();
    }

    @Test
    public void testDataScopeService_Filtering() {
        dataScopeRuleRepository.deleteAll();

        // 1. Add Data Scope Rule for ROLE_EMPLOYEE -> SELF_ONLY
        DataScopeRule rEmployee = new DataScopeRule();
        rEmployee.setRoleCode("ROLE_EMPLOYEE");
        rEmployee.setScopeType("SELF_ONLY");
        rEmployee.setRuleText("Self only access");
        rEmployee.setTenantId(testTenant);
        dataScopeRuleRepository.save(rEmployee);

        // 2. Add Data Scope Rule for ROLE_MANAGER -> DIRECT_REPORTS
        DataScopeRule rManager = new DataScopeRule();
        rManager.setRoleCode("ROLE_MANAGER");
        rManager.setScopeType("DIRECT_REPORTS");
        rManager.setRuleText("Direct reports access");
        rManager.setTenantId(testTenant);
        dataScopeRuleRepository.save(rManager);

        // 3. Test SELF_ONLY data scope filtering
        SecurityContextHolder.getContext().setAuthentication(
            new UsernamePasswordAuthenticationToken(testUser.getUsername(), "pwd", List.of(new SimpleGrantedAuthority("ROLE_EMPLOYEE")))
        );

        List<UUID> selfAccessible = dataScopeService.filterAccessibleEmployeeIds(
            testUser.getUsername(),
            List.of(empSelf.getId(), empReport.getId(), empOther.getId())
        );
        assertNotNull(selfAccessible);
        assertEquals(1, selfAccessible.size());
        assertTrue(selfAccessible.contains(empSelf.getId()));

        // 4. Test DIRECT_REPORTS data scope filtering
        testUser.setRoles(new java.util.HashSet<>(List.of(managerRole)));
        SecurityContextHolder.getContext().setAuthentication(
            new UsernamePasswordAuthenticationToken(testUser.getUsername(), "pwd", List.of(new SimpleGrantedAuthority("ROLE_MANAGER")))
        );
        List<UUID> managerAccessible = dataScopeService.filterAccessibleEmployeeIds(
            testUser.getUsername(),
            List.of(empSelf.getId(), empReport.getId(), empOther.getId())
        );
        assertNotNull(managerAccessible);
        // Should include self and direct report
        assertTrue(managerAccessible.contains(empSelf.getId()));
        assertTrue(managerAccessible.contains(empReport.getId()));
        assertFalse(managerAccessible.contains(empOther.getId()));

        SecurityContextHolder.clearContext();
    }

    @Test
    public void testAccessSimulatorService_TokenGeneration() {
        String token = accessSimulatorService.generateSimulationToken(
            testUser.getUsername(),
            testTenant,
            "ROLE_EMPLOYEE",
            empSelf.getId().toString()
        );

        assertNotNull(token);
    }
}
