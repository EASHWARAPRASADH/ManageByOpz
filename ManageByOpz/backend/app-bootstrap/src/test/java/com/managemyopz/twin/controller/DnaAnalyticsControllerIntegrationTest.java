package com.managemyopz.twin.controller;

import com.managemyopz.shared.dto.ApiResponse;
import com.managemyopz.orgdna.entity.*;
import com.managemyopz.orgdna.repository.*;
import com.managemyopz.twin.entity.EmployeeTwin;
import com.managemyopz.twin.repository.EmployeeTwinRepository;
import com.managemyopz.shared.entity.TenantContext;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(classes = com.managemyopz.HrmsPlatformApplication.class)
@Transactional
public class DnaAnalyticsControllerIntegrationTest {

    @Autowired
    private DnaAnalyticsController dnaAnalyticsController;

    @Autowired
    private EmployeeTwinRepository employeeTwinRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private BusinessUnitRepository businessUnitRepository;

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private DivisionRepository divisionRepository;

    private String testTenant;
    private UUID testOrgId;
    private UUID testBUId;
    private UUID testDivId;
    private UUID testDeptId;

    @BeforeEach
    public void setUp() {
        testTenant = "TENANT_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        TenantContext.setCurrentTenant(testTenant);
        
        // 1. Create Organization
        String suffix = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        Organization org = new Organization();
        org.setName("Acme Org " + suffix);
        org.setCode("ACME_" + suffix);
        org.setTenantId(testTenant);
        org.setActive(true);
        org = organizationRepository.save(org);
        testOrgId = org.getId();

        // 2. Create Business Unit
        BusinessUnit bu = new BusinessUnit();
        bu.setName("Acme BU " + suffix);
        bu.setCode("BU_" + suffix);
        bu.setOrganization(org);
        bu.setTenantId(testTenant);
        bu.setActive(true);
        bu = businessUnitRepository.save(bu);
        testBUId = bu.getId();

        // 3. Create Division
        Division div = new Division();
        div.setName("Acme Division " + suffix);
        div.setCode("DIV_" + suffix);
        div.setBusinessUnit(bu);
        div.setTenantId(testTenant);
        div.setActive(true);
        div = divisionRepository.save(div);
        testDivId = div.getId();

        // 4. Create Department
        Department dept = new Department();
        dept.setName("Acme Engineering");
        dept.setCode("ENG_" + suffix);
        dept.setDivision(div);
        dept.setTenantId(testTenant);
        dept.setActive(true);
        dept = departmentRepository.save(dept);
        testDeptId = dept.getId();
    }

    @Test
    public void testGetDnaAnalytics_Success() {
        TenantContext.setCurrentTenant(testTenant);

        // Create an employee with valid DNA
        EmployeeTwin validEmp = new EmployeeTwin();
        validEmp.setEmployeeCode("EMP100");
        validEmp.setFirstName("Valid");
        validEmp.setLastName("Employee");
        validEmp.setWorkEmail("valid.emp@managemyopz.com");
        validEmp.setOrganizationId(testOrgId);
        validEmp.setBusinessUnitId(testBUId);
        validEmp.setDivisionId(testDivId);
        validEmp.setDepartmentId(testDeptId);
        validEmp.setTenantId(testTenant);
        validEmp.setDeleted(false);
        employeeTwinRepository.save(validEmp);

        // Create an employee with invalid/orphan DNA (pointing to deleted/missing department)
        EmployeeTwin invalidEmp = new EmployeeTwin();
        invalidEmp.setEmployeeCode("EMP101");
        invalidEmp.setFirstName("Invalid");
        invalidEmp.setLastName("Employee");
        invalidEmp.setWorkEmail("invalid.emp@managemyopz.com");
        invalidEmp.setOrganizationId(testOrgId);
        invalidEmp.setDepartmentId(UUID.randomUUID()); // Non-existent ID (Orphan)
        invalidEmp.setTenantId(testTenant);
        invalidEmp.setDeleted(false);
        employeeTwinRepository.save(invalidEmp);

        // Execute controller endpoint
        ApiResponse<DnaAnalyticsController.DnaAnalyticsReport> response = dnaAnalyticsController.getDnaAnalytics();
        
        assertNotNull(response);
        assertTrue(response.isSuccess());
        
        DnaAnalyticsController.DnaAnalyticsReport report = response.getData();
        assertNotNull(report);
        
        // Assertions
        assertEquals(2, report.getTotalEmployees());
        assertEquals(1, report.getEmployeesWithValidDna());
        assertEquals(1, report.getEmployeesWithInvalidDna());
        assertEquals(50.0, report.getDnaIntegrityPercentage());

        // Verify Department Names instead of UUIDs
        boolean foundEngineering = false;
        boolean foundUnknown = false;
        
        for (DnaAnalyticsController.DnaAnalyticsReport.DepartmentBreakdown db : report.getDepartmentBreakdown()) {
            if ("Acme Engineering".equals(db.getDepartmentName())) {
                foundEngineering = true;
                assertEquals(1, db.getEmployeeCount());
            } else if (db.getDepartmentName().startsWith("Unknown Department")) {
                foundUnknown = true;
                assertEquals(1, db.getEmployeeCount());
            }
            // Ensure no raw UUIDs are shown in the department breakdown
            assertFalse(db.getDepartmentName().contains("-"));
        }
        
        assertTrue(foundEngineering, "Acme Engineering department should be displayed");
        assertTrue(foundUnknown, "Unknown Department group should be displayed");

        // Verify orphan references detected
        assertEquals(1, report.getOrphanDepartmentEmployees().size());
        assertTrue(report.getOrphanDepartmentEmployees().get(0).contains("EMP101"));
    }

    @Test
    public void testGetDnaIntegrityReport_Success() {
        TenantContext.setCurrentTenant(testTenant);

        // Create an employee with invalid department ID
        EmployeeTwin invalidEmp = new EmployeeTwin();
        invalidEmp.setEmployeeCode("EMP201");
        invalidEmp.setFirstName("Orphan");
        invalidEmp.setLastName("User");
        invalidEmp.setWorkEmail("orphan.user@managemyopz.com");
        invalidEmp.setOrganizationId(testOrgId);
        invalidEmp.setDepartmentId(UUID.randomUUID()); // Orphan ID
        invalidEmp.setTenantId(testTenant);
        invalidEmp.setDeleted(false);
        final EmployeeTwin savedInvalidEmp = employeeTwinRepository.save(invalidEmp);

        // Execute integrity report
        ApiResponse<List<DnaAnalyticsController.DnaOrphanRecord>> response = dnaAnalyticsController.getIntegrityReport();
        assertNotNull(response);
        assertTrue(response.isSuccess());

        List<DnaAnalyticsController.DnaOrphanRecord> report = response.getData();
        assertNotNull(report);
        assertFalse(report.isEmpty());

        // Check details of detected orphan
        DnaAnalyticsController.DnaOrphanRecord record = report.stream()
                .filter(r -> r.getEmployeeId().equals(savedInvalidEmp.getId()))
                .findFirst()
                .orElse(null);
        assertNotNull(record);
        assertEquals("departmentId", record.getFieldName());
    }

    @Test
    public void testManualRemap_Success() {
        TenantContext.setCurrentTenant(testTenant);

        // Create an employee with invalid department ID
        EmployeeTwin invalidEmp = new EmployeeTwin();
        invalidEmp.setEmployeeCode("EMP301");
        invalidEmp.setFirstName("Remap");
        invalidEmp.setLastName("User");
        invalidEmp.setWorkEmail("remap.user@managemyopz.com");
        invalidEmp.setOrganizationId(testOrgId);
        invalidEmp.setDepartmentId(UUID.randomUUID()); // Orphan ID
        invalidEmp.setTenantId(testTenant);
        invalidEmp.setDeleted(false);
        invalidEmp = employeeTwinRepository.save(invalidEmp);

        // Perform manual remap to valid department
        DnaAnalyticsController.RemapRequest request = new DnaAnalyticsController.RemapRequest(
                invalidEmp.getId(),
                "departmentId",
                testDeptId
        );
        ApiResponse<Void> response = dnaAnalyticsController.manualRemap(request);
        assertNotNull(response);
        assertTrue(response.isSuccess());

        // Verify database update
        EmployeeTwin updatedEmp = employeeTwinRepository.findById(invalidEmp.getId()).orElse(null);
        assertNotNull(updatedEmp);
        assertEquals(testDeptId, updatedEmp.getDepartmentId());
    }

    @Test
    public void testAutoRepair_Success() {
        TenantContext.setCurrentTenant(testTenant);

        // Create an employee with a deleted department reference where we have a suggested match
        Department deletedDept = new Department();
        deletedDept.setName("Acme Engineering");
        deletedDept.setCode("ENG_DEL");
        deletedDept.setDivision(divisionRepository.findById(testDivId).orElse(null));
        deletedDept.setTenantId(testTenant);
        deletedDept.setActive(false);
        deletedDept.setDeleted(true);
        deletedDept = departmentRepository.save(deletedDept);

        EmployeeTwin invalidEmp = new EmployeeTwin();
        invalidEmp.setEmployeeCode("EMP401");
        invalidEmp.setFirstName("Auto");
        invalidEmp.setLastName("Repair");
        invalidEmp.setWorkEmail("auto.repair@managemyopz.com");
        invalidEmp.setOrganizationId(testOrgId);
        invalidEmp.setDepartmentId(deletedDept.getId()); // Points to deleted department
        invalidEmp.setTenantId(testTenant);
        invalidEmp.setDeleted(false);
        invalidEmp = employeeTwinRepository.save(invalidEmp);

        // Execute auto-repair
        ApiResponse<Void> response = dnaAnalyticsController.autoRepair();
        assertNotNull(response);
        assertTrue(response.isSuccess());

        // Verify employee department is remapped to the active "Acme Engineering" department (testDeptId)
        EmployeeTwin updatedEmp = employeeTwinRepository.findById(invalidEmp.getId()).orElse(null);
        assertNotNull(updatedEmp);
        assertEquals(testDeptId, updatedEmp.getDepartmentId());
    }

    @Test
    public void testBulkRepair_Success() {
        TenantContext.setCurrentTenant(testTenant);

        EmployeeTwin invalidEmp = new EmployeeTwin();
        invalidEmp.setEmployeeCode("EMP501");
        invalidEmp.setFirstName("Bulk");
        invalidEmp.setLastName("User");
        invalidEmp.setWorkEmail("bulk.user@managemyopz.com");
        invalidEmp.setOrganizationId(testOrgId);
        invalidEmp.setDepartmentId(UUID.randomUUID()); // Orphan ID
        invalidEmp.setTenantId(testTenant);
        invalidEmp.setDeleted(false);
        invalidEmp = employeeTwinRepository.save(invalidEmp);

        // Prepare bulk repair
        java.util.List<DnaAnalyticsController.RemapRequest> repairs = new java.util.ArrayList<>();
        repairs.add(new DnaAnalyticsController.RemapRequest(invalidEmp.getId(), "departmentId", testDeptId));

        DnaAnalyticsController.BulkRemapRequest request = new DnaAnalyticsController.BulkRemapRequest(repairs);
        ApiResponse<Void> response = dnaAnalyticsController.bulkRepair(request);
        assertNotNull(response);
        assertTrue(response.isSuccess());

        // Verify update
        EmployeeTwin updatedEmp = employeeTwinRepository.findById(invalidEmp.getId()).orElse(null);
        assertNotNull(updatedEmp);
        assertEquals(testDeptId, updatedEmp.getDepartmentId());
    }
}
