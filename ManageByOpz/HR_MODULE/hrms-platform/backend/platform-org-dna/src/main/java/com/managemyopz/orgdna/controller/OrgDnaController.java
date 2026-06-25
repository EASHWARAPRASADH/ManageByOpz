package com.managemyopz.orgdna.controller;

import com.managemyopz.orgdna.entity.*;
import com.managemyopz.orgdna.repository.ApprovalMatrixRepository;
import com.managemyopz.orgdna.service.OrgDnaService;
import com.managemyopz.shared.dto.ApiResponse;
import com.managemyopz.shared.entity.TenantContext;
import com.managemyopz.audit.entity.AuditLog;
import com.managemyopz.audit.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.managemyopz.orgdna.exception.OrgDnaException;
import lombok.extern.slf4j.Slf4j;
import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/v1/org-dna")
@RequiredArgsConstructor
public class OrgDnaController {

    private final OrgDnaService orgDnaService;
    private final ApprovalMatrixRepository approvalMatrixRepository;
    private final AuditLogRepository auditLogRepository;

    // ── Organizations ──────────────────────────────────────────
    @PostMapping("/organizations")
    public ResponseEntity<ApiResponse<Organization>> createOrganization(@RequestBody Organization org) {
        Organization created = orgDnaService.createOrganization(org);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(created, "Organization created successfully"));
    }

    @PutMapping("/organizations/{id}")
    public ResponseEntity<ApiResponse<Organization>> updateOrganization(@PathVariable UUID id, @RequestBody Organization org) {
        Organization updated = orgDnaService.updateOrganization(id, org);
        return ResponseEntity.ok(ApiResponse.success(updated, "Organization updated successfully"));
    }

    @GetMapping("/organizations/{id}")
    public ResponseEntity<ApiResponse<Organization>> getOrganization(@PathVariable UUID id) {
        Organization org = orgDnaService.getOrganizationById(id);
        return ResponseEntity.ok(ApiResponse.success(org, "Organization retrieved successfully"));
    }

    @GetMapping("/organizations")
    public ResponseEntity<ApiResponse<List<Organization>>> getAllOrganizations(
            @RequestParam(value = "includeDeleted", required = false, defaultValue = "false") boolean includeDeleted) {
        List<Organization> orgs = orgDnaService.getAllOrganizations(includeDeleted);
        return ResponseEntity.ok(ApiResponse.success(orgs, "Organizations retrieved successfully"));
    }

    @DeleteMapping("/organizations/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteOrganization(@PathVariable UUID id) {
        orgDnaService.deleteOrganization(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Organization archived successfully"));
    }

    @PostMapping("/organizations/{id}/restore")
    public ResponseEntity<ApiResponse<Void>> restoreOrganization(@PathVariable UUID id) {
        orgDnaService.restoreOrganization(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Organization restored successfully"));
    }

    // ── Business Units ──────────────────────────────────────────
    @PostMapping("/organizations/{orgId}/business-units")
    public ResponseEntity<ApiResponse<BusinessUnit>> createBusinessUnit(@PathVariable UUID orgId, @RequestBody BusinessUnit bu) {
        BusinessUnit created = orgDnaService.createBusinessUnit(bu, orgId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(created, "Business Unit created successfully"));
    }

    @PutMapping("/business-units/{id}")
    public ResponseEntity<ApiResponse<BusinessUnit>> updateBusinessUnit(@PathVariable UUID id, @RequestBody BusinessUnit bu) {
        BusinessUnit updated = orgDnaService.updateBusinessUnit(id, bu);
        return ResponseEntity.ok(ApiResponse.success(updated, "Business Unit updated successfully"));
    }

    @GetMapping("/organizations/{orgId}/business-units")
    public ResponseEntity<ApiResponse<List<BusinessUnit>>> getBusinessUnits(
            @PathVariable UUID orgId,
            @RequestParam(value = "includeDeleted", required = false, defaultValue = "false") boolean includeDeleted) {
        List<BusinessUnit> bus = orgDnaService.getBusinessUnitsByOrg(orgId, includeDeleted);
        return ResponseEntity.ok(ApiResponse.success(bus, "Business Units retrieved successfully"));
    }

    @DeleteMapping("/business-units/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBusinessUnit(@PathVariable UUID id) {
        orgDnaService.deleteBusinessUnit(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Business Unit archived successfully"));
    }

    @PostMapping("/business-units/{id}/restore")
    public ResponseEntity<ApiResponse<Void>> restoreBusinessUnit(@PathVariable UUID id) {
        orgDnaService.restoreBusinessUnit(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Business Unit restored successfully"));
    }

    // ── Divisions ──────────────────────────────────────────
    @PostMapping("/business-units/{buId}/divisions")
    public ResponseEntity<ApiResponse<Division>> createDivision(@PathVariable UUID buId, @RequestBody Division div) {
        Division created = orgDnaService.createDivision(div, buId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(created, "Division created successfully"));
    }

    @PutMapping("/divisions/{id}")
    public ResponseEntity<ApiResponse<Division>> updateDivision(@PathVariable UUID id, @RequestBody Division div) {
        Division updated = orgDnaService.updateDivision(id, div);
        return ResponseEntity.ok(ApiResponse.success(updated, "Division updated successfully"));
    }

    @GetMapping("/business-units/{buId}/divisions")
    public ResponseEntity<ApiResponse<List<Division>>> getDivisions(
            @PathVariable UUID buId,
            @RequestParam(value = "includeDeleted", required = false, defaultValue = "false") boolean includeDeleted) {
        List<Division> divs = orgDnaService.getDivisionsByBU(buId, includeDeleted);
        return ResponseEntity.ok(ApiResponse.success(divs, "Divisions retrieved successfully"));
    }

    @DeleteMapping("/divisions/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDivision(@PathVariable UUID id) {
        orgDnaService.deleteDivision(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Division archived successfully"));
    }

    @PostMapping("/divisions/{id}/restore")
    public ResponseEntity<ApiResponse<Void>> restoreDivision(@PathVariable UUID id) {
        orgDnaService.restoreDivision(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Division restored successfully"));
    }

    // ── Departments ──────────────────────────────────────────
    @PostMapping("/divisions/{divId}/departments")
    public ResponseEntity<ApiResponse<Department>> createDepartment(@PathVariable UUID divId, @RequestBody Department dept) {
        Department created = orgDnaService.createDepartment(dept, divId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(created, "Department created successfully"));
    }

    @PutMapping("/departments/{id}")
    public ResponseEntity<ApiResponse<Department>> updateDepartment(@PathVariable UUID id, @RequestBody Department dept) {
        Department updated = orgDnaService.updateDepartment(id, dept);
        return ResponseEntity.ok(ApiResponse.success(updated, "Department updated successfully"));
    }

    @GetMapping("/divisions/{divId}/departments")
    public ResponseEntity<ApiResponse<List<Department>>> getDepartments(
            @PathVariable UUID divId,
            @RequestParam(value = "includeDeleted", required = false, defaultValue = "false") boolean includeDeleted) {
        List<Department> depts = orgDnaService.getDepartmentsByDivision(divId, includeDeleted);
        return ResponseEntity.ok(ApiResponse.success(depts, "Departments retrieved successfully"));
    }

    @DeleteMapping("/departments/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDepartment(@PathVariable UUID id) {
        orgDnaService.deleteDepartment(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Department archived successfully"));
    }

    @PostMapping("/departments/{id}/restore")
    public ResponseEntity<ApiResponse<Void>> restoreDepartment(@PathVariable UUID id) {
        orgDnaService.restoreDepartment(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Department restored successfully"));
    }

    // ── Teams ──────────────────────────────────────────
    @PostMapping("/departments/{deptId}/teams")
    public ResponseEntity<ApiResponse<Team>> createTeam(@PathVariable UUID deptId, @RequestBody Team team) {
        Team created = orgDnaService.createTeam(team, deptId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(created, "Team created successfully"));
    }

    @PutMapping("/teams/{id}")
    public ResponseEntity<ApiResponse<Team>> updateTeam(@PathVariable UUID id, @RequestBody Team team) {
        Team updated = orgDnaService.updateTeam(id, team);
        return ResponseEntity.ok(ApiResponse.success(updated, "Team updated successfully"));
    }

    @GetMapping("/departments/{deptId}/teams")
    public ResponseEntity<ApiResponse<List<Team>>> getTeams(
            @PathVariable UUID deptId,
            @RequestParam(value = "includeDeleted", required = false, defaultValue = "false") boolean includeDeleted) {
        List<Team> teams = orgDnaService.getTeamsByDept(deptId, includeDeleted);
        return ResponseEntity.ok(ApiResponse.success(teams, "Teams retrieved successfully"));
    }

    @DeleteMapping("/teams/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTeam(@PathVariable UUID id) {
        orgDnaService.deleteTeam(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Team archived successfully"));
    }

    @PostMapping("/teams/{id}/restore")
    public ResponseEntity<ApiResponse<Void>> restoreTeam(@PathVariable UUID id) {
        orgDnaService.restoreTeam(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Team restored successfully"));
    }

    // ── Locations ──────────────────────────────────────────
    @PostMapping("/organizations/{orgId}/locations")
    public ResponseEntity<ApiResponse<Location>> createLocation(@PathVariable UUID orgId, @RequestBody Location loc) {
        Location created = orgDnaService.createLocation(loc, orgId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(created, "Location created successfully"));
    }

    @PutMapping("/locations/{id}")
    public ResponseEntity<ApiResponse<Location>> updateLocation(@PathVariable UUID id, @RequestBody Location loc) {
        Location updated = orgDnaService.updateLocation(id, loc);
        return ResponseEntity.ok(ApiResponse.success(updated, "Location updated successfully"));
    }

    @GetMapping("/organizations/{orgId}/locations")
    public ResponseEntity<ApiResponse<List<Location>>> getLocations(
            @PathVariable UUID orgId,
            @RequestParam(value = "includeDeleted", required = false, defaultValue = "false") boolean includeDeleted) {
        List<Location> locs = orgDnaService.getLocationsByOrg(orgId, includeDeleted);
        return ResponseEntity.ok(ApiResponse.success(locs, "Locations retrieved successfully"));
    }

    @DeleteMapping("/locations/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteLocation(@PathVariable UUID id) {
        orgDnaService.deleteLocation(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Location archived successfully"));
    }

    @PostMapping("/locations/{id}/restore")
    public ResponseEntity<ApiResponse<Void>> restoreLocation(@PathVariable UUID id) {
        orgDnaService.restoreLocation(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Location restored successfully"));
    }

    // ── Grades ──────────────────────────────────────────
    @PostMapping("/organizations/{orgId}/grades")
    public ResponseEntity<ApiResponse<Grade>> createGrade(@PathVariable UUID orgId, @RequestBody Grade gr) {
        Grade created = orgDnaService.createGrade(gr, orgId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(created, "Grade created successfully"));
    }

    @PutMapping("/grades/{id}")
    public ResponseEntity<ApiResponse<Grade>> updateGrade(@PathVariable UUID id, @RequestBody Grade gr) {
        Grade updated = orgDnaService.updateGrade(id, gr);
        return ResponseEntity.ok(ApiResponse.success(updated, "Grade updated successfully"));
    }

    @GetMapping("/organizations/{orgId}/grades")
    public ResponseEntity<ApiResponse<List<Grade>>> getGrades(
            @PathVariable UUID orgId,
            @RequestParam(value = "includeDeleted", required = false, defaultValue = "false") boolean includeDeleted) {
        List<Grade> grs = orgDnaService.getGradesByOrg(orgId, includeDeleted);
        return ResponseEntity.ok(ApiResponse.success(grs, "Grades retrieved successfully"));
    }

    @DeleteMapping("/grades/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteGrade(@PathVariable UUID id) {
        orgDnaService.deleteGrade(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Grade archived successfully"));
    }

    @PostMapping("/grades/{id}/restore")
    public ResponseEntity<ApiResponse<Void>> restoreGrade(@PathVariable UUID id) {
        orgDnaService.restoreGrade(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Grade restored successfully"));
    }

    // ── Bands ──────────────────────────────────────────
    @PostMapping("/organizations/{orgId}/bands")
    public ResponseEntity<ApiResponse<Band>> createBand(@PathVariable UUID orgId, @RequestBody Band bd) {
        Band created = orgDnaService.createBand(bd, orgId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(created, "Band created successfully"));
    }

    @PutMapping("/bands/{id}")
    public ResponseEntity<ApiResponse<Band>> updateBand(@PathVariable UUID id, @RequestBody Band bd) {
        Band updated = orgDnaService.updateBand(id, bd);
        return ResponseEntity.ok(ApiResponse.success(updated, "Band updated successfully"));
    }

    @GetMapping("/organizations/{orgId}/bands")
    public ResponseEntity<ApiResponse<List<Band>>> getBands(
            @PathVariable UUID orgId,
            @RequestParam(value = "includeDeleted", required = false, defaultValue = "false") boolean includeDeleted) {
        List<Band> bds = orgDnaService.getBandsByOrg(orgId, includeDeleted);
        return ResponseEntity.ok(ApiResponse.success(bds, "Bands retrieved successfully"));
    }

    @DeleteMapping("/bands/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBand(@PathVariable UUID id) {
        orgDnaService.deleteBand(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Band archived successfully"));
    }

    @PostMapping("/bands/{id}/restore")
    public ResponseEntity<ApiResponse<Void>> restoreBand(@PathVariable UUID id) {
        orgDnaService.restoreBand(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Band restored successfully"));
    }

    // ── Designations ──────────────────────────────────────────
    @PostMapping("/organizations/{orgId}/designations")
    public ResponseEntity<ApiResponse<Designation>> createDesignation(@PathVariable UUID orgId, @RequestBody Designation desig) {
        Designation created = orgDnaService.createDesignation(desig, orgId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(created, "Designation created successfully"));
    }

    @PutMapping("/designations/{id}")
    public ResponseEntity<ApiResponse<Designation>> updateDesignation(@PathVariable UUID id, @RequestBody Designation desig) {
        Designation updated = orgDnaService.updateDesignation(id, desig);
        return ResponseEntity.ok(ApiResponse.success(updated, "Designation updated successfully"));
    }

    @GetMapping("/organizations/{orgId}/designations")
    public ResponseEntity<ApiResponse<List<Designation>>> getDesignations(
            @PathVariable UUID orgId,
            @RequestParam(value = "includeDeleted", required = false, defaultValue = "false") boolean includeDeleted) {
        List<Designation> desigs = orgDnaService.getDesignationsByOrg(orgId, includeDeleted);
        return ResponseEntity.ok(ApiResponse.success(desigs, "Designations retrieved successfully"));
    }

    @DeleteMapping("/designations/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDesignation(@PathVariable UUID id) {
        orgDnaService.deleteDesignation(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Designation archived successfully"));
    }

    @PostMapping("/designations/{id}/restore")
    public ResponseEntity<ApiResponse<Void>> restoreDesignation(@PathVariable UUID id) {
        orgDnaService.restoreDesignation(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Designation restored successfully"));
    }

    // ── Employment Types ──────────────────────────────────────────
    @PostMapping("/organizations/{orgId}/employment-types")
    public ResponseEntity<ApiResponse<EmploymentType>> createEmploymentType(@PathVariable UUID orgId, @RequestBody EmploymentType type) {
        EmploymentType created = orgDnaService.createEmploymentType(type, orgId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(created, "Employment Type created successfully"));
    }

    @PutMapping("/employment-types/{id}")
    public ResponseEntity<ApiResponse<EmploymentType>> updateEmploymentType(@PathVariable UUID id, @RequestBody EmploymentType type) {
        EmploymentType updated = orgDnaService.updateEmploymentType(id, type);
        return ResponseEntity.ok(ApiResponse.success(updated, "Employment Type updated successfully"));
    }

    @GetMapping("/organizations/{orgId}/employment-types")
    public ResponseEntity<ApiResponse<List<EmploymentType>>> getEmploymentTypes(
            @PathVariable UUID orgId,
            @RequestParam(value = "includeDeleted", required = false, defaultValue = "false") boolean includeDeleted) {
        List<EmploymentType> types = orgDnaService.getEmploymentTypesByOrg(orgId, includeDeleted);
        return ResponseEntity.ok(ApiResponse.success(types, "Employment Types retrieved successfully"));
    }

    @DeleteMapping("/employment-types/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteEmploymentType(@PathVariable UUID id) {
        orgDnaService.deleteEmploymentType(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Employment Type archived successfully"));
    }

    @PostMapping("/employment-types/{id}/restore")
    public ResponseEntity<ApiResponse<Void>> restoreEmploymentType(@PathVariable UUID id) {
        orgDnaService.restoreEmploymentType(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Employment Type restored successfully"));
    }

    // ── Cost Centers ──────────────────────────────────────────
    @PostMapping("/organizations/{orgId}/cost-centers")
    public ResponseEntity<ApiResponse<CostCenter>> createCostCenter(@PathVariable UUID orgId, @RequestBody CostCenter cc) {
        CostCenter created = orgDnaService.createCostCenter(cc, orgId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(created, "Cost Center created successfully"));
    }

    @PutMapping("/cost-centers/{id}")
    public ResponseEntity<ApiResponse<CostCenter>> updateCostCenter(@PathVariable UUID id, @RequestBody CostCenter cc) {
        CostCenter updated = orgDnaService.updateCostCenter(id, cc);
        return ResponseEntity.ok(ApiResponse.success(updated, "Cost Center updated successfully"));
    }

    @GetMapping("/organizations/{orgId}/cost-centers")
    public ResponseEntity<ApiResponse<List<CostCenter>>> getCostCenters(
            @PathVariable UUID orgId,
            @RequestParam(value = "includeDeleted", required = false, defaultValue = "false") boolean includeDeleted) {
        List<CostCenter> ccs = orgDnaService.getCostCentersByOrg(orgId, includeDeleted);
        return ResponseEntity.ok(ApiResponse.success(ccs, "Cost Centers retrieved successfully"));
    }

    @DeleteMapping("/cost-centers/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCostCenter(@PathVariable UUID id) {
        orgDnaService.deleteCostCenter(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Cost Center archived successfully"));
    }

    @PostMapping("/cost-centers/{id}/restore")
    public ResponseEntity<ApiResponse<Void>> restoreCostCenter(@PathVariable UUID id) {
        orgDnaService.restoreCostCenter(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Cost Center restored successfully"));
    }

    // ── Approval Matrices ──────────────────────────────────────────
    @PostMapping("/approval-matrices")
    public ResponseEntity<ApiResponse<ApprovalMatrix>> createApprovalMatrix(@RequestBody ApprovalMatrix matrix) {
        matrix.setTenantId(TenantContext.getCurrentTenant());
        matrix.setDeleted(false);
        if (matrix.getLevels() != null) {
            for (ApprovalMatrixLevel level : matrix.getLevels()) {
                level.setApprovalMatrix(matrix);
                level.setTenantId(matrix.getTenantId());
            }
        }
        ApprovalMatrix saved = approvalMatrixRepository.save(matrix);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(saved, "Approval Matrix created successfully"));
    }

    @PutMapping("/approval-matrices/{id}")
    public ResponseEntity<ApiResponse<ApprovalMatrix>> updateApprovalMatrix(@PathVariable UUID id, @RequestBody ApprovalMatrix details) {
        ApprovalMatrix existing = approvalMatrixRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new OrgDnaException("Approval Matrix not found", HttpStatus.NOT_FOUND, "MATRIX_NOT_FOUND"));
        existing.setOrganizationId(details.getOrganizationId());
        existing.setBusinessUnitId(details.getBusinessUnitId());
        existing.setDivisionId(details.getDivisionId());
        existing.setDepartmentId(details.getDepartmentId());
        existing.setTeamId(details.getTeamId());
        existing.setDesignationId(details.getDesignationId());
        existing.setGradeId(details.getGradeId());
        existing.setBandId(details.getBandId());
        existing.setApprovalType(details.getApprovalType());
        existing.setApproverLevel1Id(details.getApproverLevel1Id());
        existing.setApproverLevel1Type(details.getApproverLevel1Type());
        existing.setApproverLevel2Id(details.getApproverLevel2Id());
        existing.setApproverLevel2Type(details.getApproverLevel2Type());
        existing.setApproverLevel3Id(details.getApproverLevel3Id());
        existing.setApproverLevel3Type(details.getApproverLevel3Type());
        existing.setApproverLevel4Id(details.getApproverLevel4Id());
        existing.setApproverLevel4Type(details.getApproverLevel4Type());
        existing.setLocationId(details.getLocationId());
        existing.setEmploymentTypeId(details.getEmploymentTypeId());
        existing.setMinAmount(details.getMinAmount());
        existing.setMaxAmount(details.getMaxAmount());
        existing.setEffectiveFrom(details.getEffectiveFrom());
        existing.setEffectiveTo(details.getEffectiveTo());
        existing.setPriority(details.getPriority());
        existing.setActive(details.isActive());

        existing.getLevels().clear();
        if (details.getLevels() != null) {
            for (ApprovalMatrixLevel level : details.getLevels()) {
                level.setApprovalMatrix(existing);
                level.setTenantId(existing.getTenantId());
                existing.getLevels().add(level);
            }
        }

        ApprovalMatrix saved = approvalMatrixRepository.save(existing);
        return ResponseEntity.ok(ApiResponse.success(saved, "Approval Matrix updated successfully"));
    }

    @GetMapping("/approval-matrices")
    public ResponseEntity<ApiResponse<List<ApprovalMatrix>>> getApprovalMatrices() {
        List<ApprovalMatrix> list = approvalMatrixRepository.findByTenantIdAndDeletedFalse(TenantContext.getCurrentTenant());
        return ResponseEntity.ok(ApiResponse.success(list, "Approval Matrices retrieved successfully"));
    }

    @DeleteMapping("/approval-matrices/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteApprovalMatrix(@PathVariable UUID id) {
        ApprovalMatrix existing = approvalMatrixRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new OrgDnaException("Approval Matrix not found", HttpStatus.NOT_FOUND, "MATRIX_NOT_FOUND"));
        existing.archive();
        approvalMatrixRepository.save(existing);
        return ResponseEntity.ok(ApiResponse.success(null, "Approval Matrix deleted successfully"));
    }

    @GetMapping("/approval-matrices/match")
    public ResponseEntity<ApiResponse<List<ApprovalMatrix>>> matchApprovalMatrix(
            @RequestParam(required = false) UUID departmentId,
            @RequestParam(required = false) UUID designationId,
            @RequestParam(required = false) UUID gradeId,
            @RequestParam String approvalType) {
        List<ApprovalMatrix> list = approvalMatrixRepository.findMatchingRules(
                TenantContext.getCurrentTenant(), departmentId, designationId, gradeId, approvalType);
        return ResponseEntity.ok(ApiResponse.success(list, "Matching Approval Matrices retrieved successfully"));
    }

    @PostMapping("/business-units/{id}/clone")
    public ResponseEntity<ApiResponse<BusinessUnit>> cloneBusinessUnit(
            @PathVariable UUID id,
            @RequestParam String targetName,
            @RequestParam String targetCode) {
        BusinessUnit cloned = orgDnaService.cloneBusinessUnit(id, targetName, targetCode);
        return ResponseEntity.ok(ApiResponse.success(cloned, "Business Unit cloned successfully"));
    }

    @GetMapping("/audit-trail")
    public ResponseEntity<ApiResponse<Page<AuditLog>>> getAuditTrail(
            @RequestParam String entityType,
            @RequestParam String entityId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<AuditLog> auditLogs = auditLogRepository.findByTenantIdAndEntityTypeAndEntityIdOrderByPerformedAtDesc(
                TenantContext.getCurrentTenant(), entityType, entityId, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(auditLogs, "Audit trail retrieved successfully"));
    }
}
