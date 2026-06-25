package com.managemyopz.orgdna.service;

import com.managemyopz.orgdna.entity.*;
import com.managemyopz.orgdna.repository.*;
import com.managemyopz.shared.entity.TenantContext;
import com.managemyopz.orgdna.exception.OrgDnaException;
import org.springframework.http.HttpStatus;
import com.managemyopz.audit.service.AuditService;
import com.managemyopz.audit.entity.AuditLog.AuditAction;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class OrgDnaServiceImpl implements OrgDnaService {

    private final OrganizationRepository organizationRepository;
    private final BusinessUnitRepository businessUnitRepository;
    private final DivisionRepository divisionRepository;
    private final DepartmentRepository departmentRepository;
    private final TeamRepository teamRepository;
    private final LocationRepository locationRepository;
    private final GradeRepository gradeRepository;
    private final BandRepository bandRepository;
    private final DesignationRepository designationRepository;
    private final EmploymentTypeRepository employmentTypeRepository;
    private final CostCenterRepository costCenterRepository;
    private final PositionRepository positionRepository;
    private final ApprovalMatrixRepository approvalMatrixRepository;
    private final AuditService auditService;
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    @PersistenceContext
    private EntityManager entityManager;

    private long countEmployeesForDnaNode(String columnName, UUID nodeId) {
        try {
            String queryStr = "SELECT count(*) FROM employee_twins WHERE " + columnName + " = :nodeId AND deleted = false";
            java.lang.Object result = entityManager.createNativeQuery(queryStr)
                    .setParameter("nodeId", nodeId)
                    .getSingleResult();
            if (result instanceof Number) {
                return ((Number) result).longValue();
            }
            return 0L;
        } catch (Exception e) {
            try {
                String queryStr = "SELECT count(*) FROM employee_twins WHERE " + columnName + " = :nodeId AND deleted = false";
                java.lang.Object result = entityManager.createNativeQuery(queryStr)
                        .setParameter("nodeId", nodeId.toString())
                        .getSingleResult();
                if (result instanceof Number) {
                    return ((Number) result).longValue();
                }
            } catch (Exception ex) {
                // fallback
            }
            return 0L;
        }
    }

    private String getCurrentUser() {
        String user = TenantContext.getCurrentUser();
        return user != null ? user : "system";
    }

    private Object convertToSafeMap(Object obj) {
        if (obj == null) return null;
        if (obj instanceof String || obj instanceof Number || obj instanceof Boolean) return obj;
        try {
            return objectMapper.convertValue(obj, java.util.Map.class);
        } catch (Exception e) {
            log.warn("Failed to convert object for safe auditing: {}", obj.getClass().getName(), e);
            return obj.toString();
        }
    }

    private void recordAudit(String entityType, String entityId, AuditAction action, Object before, Object after, String resultStatus) {
        try {
            Object beforeSafe = convertToSafeMap(before);
            Object afterSafe = convertToSafeMap(after);
            auditService.recordAudit(
                TenantContext.getCurrentTenant(),
                "ORG_DNA",
                entityType,
                entityId,
                action,
                beforeSafe,
                afterSafe,
                UUID.randomUUID().toString(),
                getCurrentUser(),
                resultStatus
            );
        } catch (Exception e) {
            log.error("Failed to record audit for {} {}", entityType, entityId, e);
        }
    }

    // ── Organizations ──────────────────────────────────────────
    @Override
    public Organization createOrganization(Organization org) {
        if (organizationRepository.existsByNameIgnoreCaseAndDeletedFalse(org.getName())) {
            throw new OrgDnaException("Organization name already exists.", HttpStatus.CONFLICT, "DUPLICATE_CODE");
        }
        if (organizationRepository.existsByCodeIgnoreCaseAndDeletedFalse(org.getCode())) {
            throw new OrgDnaException("Organization code already exists.", HttpStatus.CONFLICT, "DUPLICATE_CODE");
        }
        org.setDeleted(false);
        return organizationRepository.save(org);
    }

    @Override
    public Organization updateOrganization(UUID id, Organization org) {
        Organization existing = getOrganizationById(id);
        if (!existing.getName().equalsIgnoreCase(org.getName()) && organizationRepository.existsByNameIgnoreCaseAndDeletedFalse(org.getName())) {
            throw new OrgDnaException("Organization name already exists.", HttpStatus.CONFLICT, "DUPLICATE_CODE");
        }
        if (!existing.getCode().equalsIgnoreCase(org.getCode()) && organizationRepository.existsByCodeIgnoreCaseAndDeletedFalse(org.getCode())) {
            throw new OrgDnaException("Organization code already exists.", HttpStatus.CONFLICT, "DUPLICATE_CODE");
        }
        existing.setName(org.getName());
        existing.setCode(org.getCode());
        existing.setLegalName(org.getLegalName());
        existing.setIndustry(org.getIndustry());
        existing.setWebsite(org.getWebsite());
        existing.setPrimaryEmail(org.getPrimaryEmail());
        existing.setPrimaryPhone(org.getPrimaryPhone());
        existing.setAddress(org.getAddress());
        existing.setCountry(org.getCountry());
        existing.setCurrency(org.getCurrency());
        existing.setTimezone(org.getTimezone());
        existing.setEmailDomain(org.getEmailDomain());
        existing.setEmployeeCodeTemplate(org.getEmployeeCodeTemplate());
        return organizationRepository.save(existing);
    }

    @Override
    @Transactional(readOnly = true)
    public Organization getOrganizationById(UUID id) {
        return organizationRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new OrgDnaException("Organization not found", HttpStatus.NOT_FOUND, "ORG_NOT_FOUND"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Organization> getAllOrganizations(boolean includeDeleted) {
        if (includeDeleted) {
            return organizationRepository.findAll();
        } else {
            return organizationRepository.findByDeletedFalse();
        }
    }

    @Override
    public void deleteOrganization(UUID id) {
        Organization org = getOrganizationById(id);
        
        long buCount = businessUnitRepository.findByOrganizationIdAndDeletedFalse(id).size();
        long locCount = locationRepository.findByOrganizationIdAndDeletedFalse(id).size();
        long gradeCount = gradeRepository.findByOrganizationIdAndDeletedFalse(id).size();
        long bandCount = bandRepository.findByOrganizationIdAndDeletedFalse(id).size();
        long desigCount = designationRepository.findByOrganizationIdAndDeletedFalse(id).size();
        long empCount = countEmployeesForDnaNode("organization_id", id);

        if (buCount > 0 || locCount > 0 || gradeCount > 0 || bandCount > 0 || desigCount > 0 || empCount > 0) {
            recordAudit("Organization", id.toString(), AuditAction.DELETE, org, null, "DELETE_ATTEMPT_FAILED");
            throw new OrgDnaException("Organization contains active records and cannot be archived", HttpStatus.CONFLICT, "NODE_IN_USE");
        }

        org.archive();
        organizationRepository.save(org);
        recordAudit("Organization", id.toString(), AuditAction.DELETE, org, null, "ARCHIVED");
    }

    @Override
    public void restoreOrganization(UUID id) {
        Organization org = organizationRepository.findById(id)
                .orElseThrow(() -> new OrgDnaException("Organization not found", HttpStatus.NOT_FOUND, "ORG_NOT_FOUND"));
        org.restore();
        organizationRepository.save(org);
        recordAudit("Organization", id.toString(), AuditAction.UPDATE, null, org, "RESTORED");
    }

    // ── Business Units ──────────────────────────────────────────
    @Override
    public BusinessUnit createBusinessUnit(BusinessUnit bu, UUID organizationId) {
        Organization org = getOrganizationById(organizationId);
        if (businessUnitRepository.existsByOrganizationIdAndNameIgnoreCaseAndDeletedFalse(organizationId, bu.getName())) {
            throw new OrgDnaException("Business Unit name already exists.", HttpStatus.CONFLICT, "DUPLICATE_CODE");
        }
        if (businessUnitRepository.existsByOrganizationIdAndCodeIgnoreCaseAndDeletedFalse(organizationId, bu.getCode())) {
            throw new OrgDnaException("Business Unit code already exists.", HttpStatus.CONFLICT, "DUPLICATE_CODE");
        }
        bu.setOrganization(org);
        bu.setDeleted(false);
        return businessUnitRepository.save(bu);
    }

    @Override
    public BusinessUnit updateBusinessUnit(UUID id, BusinessUnit buDetails) {
        BusinessUnit existing = businessUnitRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new OrgDnaException("Business Unit not found", HttpStatus.NOT_FOUND, "BU_NOT_FOUND"));
        UUID orgId = existing.getOrganization().getId();
        if (!existing.getName().equalsIgnoreCase(buDetails.getName()) && businessUnitRepository.existsByOrganizationIdAndNameIgnoreCaseAndDeletedFalse(orgId, buDetails.getName())) {
            throw new OrgDnaException("Business Unit name already exists.", HttpStatus.CONFLICT, "DUPLICATE_CODE");
        }
        if (!existing.getCode().equalsIgnoreCase(buDetails.getCode()) && businessUnitRepository.existsByOrganizationIdAndCodeIgnoreCaseAndDeletedFalse(orgId, buDetails.getCode())) {
            throw new OrgDnaException("Business Unit code already exists.", HttpStatus.CONFLICT, "DUPLICATE_CODE");
        }
        existing.setName(buDetails.getName());
        existing.setCode(buDetails.getCode());
        existing.setDescription(buDetails.getDescription());
        existing.setHeadEmployeeId(buDetails.getHeadEmployeeId());
        existing.setActive(buDetails.isActive());
        return businessUnitRepository.save(existing);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BusinessUnit> getBusinessUnitsByOrg(UUID organizationId, boolean includeDeleted) {
        if (includeDeleted) {
            return businessUnitRepository.findByOrganizationId(organizationId);
        } else {
            return businessUnitRepository.findByOrganizationIdAndDeletedFalse(organizationId);
        }
    }

    @Override
    public void deleteBusinessUnit(UUID id) {
        BusinessUnit bu = businessUnitRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new OrgDnaException("Business Unit not found", HttpStatus.NOT_FOUND, "BU_NOT_FOUND"));
        
        long divCount = divisionRepository.countByBusinessUnitIdAndDeletedFalse(id);
        long empCount = countEmployeesForDnaNode("business_unit_id", id);

        if (divCount > 0 || empCount > 0) {
            recordAudit("BusinessUnit", id.toString(), AuditAction.DELETE, bu, null, "DELETE_ATTEMPT_FAILED");
            throw new OrgDnaException("Business Unit contains Divisions.", HttpStatus.CONFLICT, "NODE_IN_USE");
        }

        bu.archive();
        businessUnitRepository.save(bu);
        recordAudit("BusinessUnit", id.toString(), AuditAction.DELETE, bu, null, "ARCHIVED");
    }

    @Override
    public void restoreBusinessUnit(UUID id) {
        BusinessUnit bu = businessUnitRepository.findById(id)
                .orElseThrow(() -> new OrgDnaException("Business Unit not found", HttpStatus.NOT_FOUND, "BU_NOT_FOUND"));
        bu.restore();
        businessUnitRepository.save(bu);
        recordAudit("BusinessUnit", id.toString(), AuditAction.UPDATE, null, bu, "RESTORED");
    }

    // ── Divisions ──────────────────────────────────────────
    @Override
    public Division createDivision(Division div, UUID businessUnitId) {
        BusinessUnit bu = businessUnitRepository.findByIdAndDeletedFalse(businessUnitId)
                .orElseThrow(() -> new OrgDnaException("Business Unit not found", HttpStatus.NOT_FOUND, "BU_NOT_FOUND"));
        if (divisionRepository.existsByBusinessUnitIdAndNameIgnoreCaseAndDeletedFalse(businessUnitId, div.getName())) {
            throw new OrgDnaException("Division name already exists.", HttpStatus.CONFLICT, "DUPLICATE_CODE");
        }
        if (divisionRepository.existsByBusinessUnitIdAndCodeIgnoreCaseAndDeletedFalse(businessUnitId, div.getCode())) {
            throw new OrgDnaException("Division code already exists.", HttpStatus.CONFLICT, "DUPLICATE_CODE");
        }
        div.setBusinessUnit(bu);
        div.setDeleted(false);
        return divisionRepository.save(div);
    }

    @Override
    public Division updateDivision(UUID id, Division details) {
        Division existing = divisionRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new OrgDnaException("Division not found", HttpStatus.NOT_FOUND, "DIVISION_NOT_FOUND"));
        UUID buId = existing.getBusinessUnit().getId();
        if (!existing.getName().equalsIgnoreCase(details.getName()) && divisionRepository.existsByBusinessUnitIdAndNameIgnoreCaseAndDeletedFalse(buId, details.getName())) {
            throw new OrgDnaException("Division name already exists.", HttpStatus.CONFLICT, "DUPLICATE_CODE");
        }
        if (!existing.getCode().equalsIgnoreCase(details.getCode()) && divisionRepository.existsByBusinessUnitIdAndCodeIgnoreCaseAndDeletedFalse(buId, details.getCode())) {
            throw new OrgDnaException("Division code already exists.", HttpStatus.CONFLICT, "DUPLICATE_CODE");
        }
        existing.setName(details.getName());
        existing.setCode(details.getCode());
        existing.setDescription(details.getDescription());
        existing.setHeadEmployeeId(details.getHeadEmployeeId());
        existing.setActive(details.isActive());
        return divisionRepository.save(existing);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Division> getDivisionsByBU(UUID businessUnitId, boolean includeDeleted) {
        if (includeDeleted) {
            return divisionRepository.findByBusinessUnitId(businessUnitId);
        } else {
            return divisionRepository.findByBusinessUnitIdAndDeletedFalse(businessUnitId);
        }
    }

    @Override
    public void deleteDivision(UUID id) {
        Division div = divisionRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new OrgDnaException("Division not found", HttpStatus.NOT_FOUND, "DIVISION_NOT_FOUND"));
        
        long deptCount = departmentRepository.countByDivisionIdAndDeletedFalse(id);
        long empCount = countEmployeesForDnaNode("division_id", id);

        if (deptCount > 0 || empCount > 0) {
            recordAudit("Division", id.toString(), AuditAction.DELETE, div, null, "DELETE_ATTEMPT_FAILED");
            throw new OrgDnaException("Division contains Departments.", HttpStatus.CONFLICT, "NODE_IN_USE");
        }

        div.archive();
        divisionRepository.save(div);
        recordAudit("Division", id.toString(), AuditAction.DELETE, div, null, "ARCHIVED");
    }

    @Override
    public void restoreDivision(UUID id) {
        Division div = divisionRepository.findById(id)
                .orElseThrow(() -> new OrgDnaException("Division not found", HttpStatus.NOT_FOUND, "DIVISION_NOT_FOUND"));
        div.restore();
        divisionRepository.save(div);
        recordAudit("Division", id.toString(), AuditAction.UPDATE, null, div, "RESTORED");
    }

    // ── Departments ──────────────────────────────────────────
    @Override
    public Department createDepartment(Department dept, UUID divisionId) {
        Division div = divisionRepository.findByIdAndDeletedFalse(divisionId)
                .orElseThrow(() -> new OrgDnaException("Division not found", HttpStatus.NOT_FOUND, "DIVISION_NOT_FOUND"));
        if (departmentRepository.existsByDivisionIdAndNameIgnoreCaseAndDeletedFalse(divisionId, dept.getName())) {
            throw new OrgDnaException("Department name already exists.", HttpStatus.CONFLICT, "DUPLICATE_CODE");
        }
        if (departmentRepository.existsByDivisionIdAndCodeIgnoreCaseAndDeletedFalse(divisionId, dept.getCode())) {
            throw new OrgDnaException("Department code already exists.", HttpStatus.CONFLICT, "DUPLICATE_CODE");
        }
        dept.setDivision(div);
        dept.setDeleted(false);
        return departmentRepository.save(dept);
    }

    @Override
    public Department updateDepartment(UUID id, Department details) {
        Department existing = departmentRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new OrgDnaException("Department not found", HttpStatus.NOT_FOUND, "DEPARTMENT_NOT_FOUND"));
        UUID divId = existing.getDivision().getId();
        if (!existing.getName().equalsIgnoreCase(details.getName()) && departmentRepository.existsByDivisionIdAndNameIgnoreCaseAndDeletedFalse(divId, details.getName())) {
            throw new OrgDnaException("Department name already exists.", HttpStatus.CONFLICT, "DUPLICATE_CODE");
        }
        if (!existing.getCode().equalsIgnoreCase(details.getCode()) && departmentRepository.existsByDivisionIdAndCodeIgnoreCaseAndDeletedFalse(divId, details.getCode())) {
            throw new OrgDnaException("Department code already exists.", HttpStatus.CONFLICT, "DUPLICATE_CODE");
        }
        existing.setName(details.getName());
        existing.setCode(details.getCode());
        existing.setHeadEmployeeId(details.getHeadEmployeeId());
        existing.setActive(details.isActive());
        return departmentRepository.save(existing);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Department> getDepartmentsByDivision(UUID divisionId, boolean includeDeleted) {
        if (includeDeleted) {
            return departmentRepository.findByDivisionId(divisionId);
        } else {
            return departmentRepository.findByDivisionIdAndDeletedFalse(divisionId);
        }
    }

    @Override
    public void deleteDepartment(UUID id) {
        Department dept = departmentRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new OrgDnaException("Department not found", HttpStatus.NOT_FOUND, "DEPARTMENT_NOT_FOUND"));
        
        long teamCount = teamRepository.countByDepartmentIdAndDeletedFalse(id);
        long empCount = countEmployeesForDnaNode("department_id", id);
        long matrixCount = approvalMatrixRepository.countByDepartmentIdAndDeletedFalse(id);
        long positionCount = positionRepository.countByDepartmentIdAndDeletedFalse(id);

        if (teamCount > 0 || empCount > 0 || matrixCount > 0 || positionCount > 0) {
            recordAudit("Department", id.toString(), AuditAction.DELETE, dept, null, "DELETE_ATTEMPT_FAILED");
            throw new OrgDnaException("Department contains Teams.", HttpStatus.CONFLICT, "NODE_IN_USE");
        }

        dept.archive();
        departmentRepository.save(dept);
        recordAudit("Department", id.toString(), AuditAction.DELETE, dept, null, "ARCHIVED");
    }

    @Override
    public void restoreDepartment(UUID id) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new OrgDnaException("Department not found", HttpStatus.NOT_FOUND, "DEPARTMENT_NOT_FOUND"));
        dept.restore();
        departmentRepository.save(dept);
        recordAudit("Department", id.toString(), AuditAction.UPDATE, null, dept, "RESTORED");
    }

    // ── Teams ──────────────────────────────────────────
    @Override
    public Team createTeam(Team team, UUID departmentId) {
        Department dept = departmentRepository.findByIdAndDeletedFalse(departmentId)
                .orElseThrow(() -> new OrgDnaException("Department not found", HttpStatus.NOT_FOUND, "DEPARTMENT_NOT_FOUND"));
        if (teamRepository.existsByDepartmentIdAndNameIgnoreCaseAndDeletedFalse(departmentId, team.getName())) {
            throw new OrgDnaException("Team name already exists.", HttpStatus.CONFLICT, "DUPLICATE_CODE");
        }
        if (teamRepository.existsByDepartmentIdAndCodeIgnoreCaseAndDeletedFalse(departmentId, team.getCode())) {
            throw new OrgDnaException("Team code already exists.", HttpStatus.CONFLICT, "DUPLICATE_CODE");
        }
        team.setDepartment(dept);
        team.setDeleted(false);
        return teamRepository.save(team);
    }

    @Override
    public Team updateTeam(UUID id, Team details) {
        Team existing = teamRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new OrgDnaException("Team not found", HttpStatus.NOT_FOUND, "TEAM_NOT_FOUND"));
        UUID deptId = existing.getDepartment().getId();
        if (!existing.getName().equalsIgnoreCase(details.getName()) && teamRepository.existsByDepartmentIdAndNameIgnoreCaseAndDeletedFalse(deptId, details.getName())) {
            throw new OrgDnaException("Team name already exists.", HttpStatus.CONFLICT, "DUPLICATE_CODE");
        }
        if (!existing.getCode().equalsIgnoreCase(details.getCode()) && teamRepository.existsByDepartmentIdAndCodeIgnoreCaseAndDeletedFalse(deptId, details.getCode())) {
            throw new OrgDnaException("Team code already exists.", HttpStatus.CONFLICT, "DUPLICATE_CODE");
        }
        existing.setName(details.getName());
        existing.setCode(details.getCode());
        existing.setDescription(details.getDescription());
        existing.setHeadEmployeeId(details.getHeadEmployeeId());
        existing.setActive(details.isActive());
        return teamRepository.save(existing);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Team> getTeamsByDept(UUID departmentId, boolean includeDeleted) {
        if (includeDeleted) {
            return teamRepository.findByDepartmentId(departmentId);
        } else {
            return teamRepository.findByDepartmentIdAndDeletedFalse(departmentId);
        }
    }

    @Override
    public void deleteTeam(UUID id) {
        Team team = teamRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new OrgDnaException("Team not found", HttpStatus.NOT_FOUND, "TEAM_NOT_FOUND"));
        
        long empCount = countEmployeesForDnaNode("sub_department_id", id);

        if (empCount > 0) {
            recordAudit("Team", id.toString(), AuditAction.DELETE, team, null, "DELETE_ATTEMPT_FAILED");
            throw new OrgDnaException("Team contains active Employees.", HttpStatus.CONFLICT, "NODE_IN_USE");
        }

        team.archive();
        teamRepository.save(team);
        recordAudit("Team", id.toString(), AuditAction.DELETE, team, null, "ARCHIVED");
    }

    @Override
    public void restoreTeam(UUID id) {
        Team team = teamRepository.findById(id)
                .orElseThrow(() -> new OrgDnaException("Team not found", HttpStatus.NOT_FOUND, "TEAM_NOT_FOUND"));
        team.restore();
        teamRepository.save(team);
        recordAudit("Team", id.toString(), AuditAction.UPDATE, null, team, "RESTORED");
    }

    // ── Locations ──────────────────────────────────────────
    @Override
    public Location createLocation(Location loc, UUID organizationId) {
        Organization org = getOrganizationById(organizationId);
        if (locationRepository.existsByOrganizationIdAndNameIgnoreCaseAndDeletedFalse(organizationId, loc.getName())) {
            throw new OrgDnaException("Location name already exists.", HttpStatus.CONFLICT, "DUPLICATE_CODE");
        }
        if (locationRepository.existsByOrganizationIdAndCodeIgnoreCaseAndDeletedFalse(organizationId, loc.getCode())) {
            throw new OrgDnaException("Location code already exists.", HttpStatus.CONFLICT, "DUPLICATE_CODE");
        }
        loc.setOrganization(org);
        loc.setDeleted(false);
        return locationRepository.save(loc);
    }

    @Override
    public Location updateLocation(UUID id, Location details) {
        Location existing = locationRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new OrgDnaException("Location not found", HttpStatus.NOT_FOUND, "LOCATION_NOT_FOUND"));
        UUID orgId = existing.getOrganization().getId();
        if (!existing.getName().equalsIgnoreCase(details.getName()) && locationRepository.existsByOrganizationIdAndNameIgnoreCaseAndDeletedFalse(orgId, details.getName())) {
            throw new OrgDnaException("Location name already exists.", HttpStatus.CONFLICT, "DUPLICATE_CODE");
        }
        if (!existing.getCode().equalsIgnoreCase(details.getCode()) && locationRepository.existsByOrganizationIdAndCodeIgnoreCaseAndDeletedFalse(orgId, details.getCode())) {
            throw new OrgDnaException("Location code already exists.", HttpStatus.CONFLICT, "DUPLICATE_CODE");
        }
        existing.setName(details.getName());
        existing.setCode(details.getCode());
        existing.setLocationType(details.getLocationType());
        existing.setAddress(details.getAddress());
        existing.setCity(details.getCity());
        existing.setCountry(details.getCountry());
        existing.setTimezone(details.getTimezone());
        existing.setActive(details.isActive());
        return locationRepository.save(existing);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Location> getLocationsByOrg(UUID organizationId, boolean includeDeleted) {
        if (includeDeleted) {
            return locationRepository.findByOrganizationId(organizationId);
        } else {
            return locationRepository.findByOrganizationIdAndDeletedFalse(organizationId);
        }
    }

    @Override
    public void deleteLocation(UUID id) {
        Location loc = locationRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new OrgDnaException("Location not found", HttpStatus.NOT_FOUND, "LOCATION_NOT_FOUND"));
        
        long empCount = countEmployeesForDnaNode("location_id", id);
        long positionCount = positionRepository.countByLocationIdAndDeletedFalse(id);

        if (empCount > 0 || positionCount > 0) {
            recordAudit("Location", id.toString(), AuditAction.DELETE, loc, null, "DELETE_ATTEMPT_FAILED");
            throw new OrgDnaException("Location is in use by active Employees or Positions.", HttpStatus.CONFLICT, "NODE_IN_USE");
        }

        loc.archive();
        locationRepository.save(loc);
        recordAudit("Location", id.toString(), AuditAction.DELETE, loc, null, "ARCHIVED");
    }

    @Override
    public void restoreLocation(UUID id) {
        Location loc = locationRepository.findById(id)
                .orElseThrow(() -> new OrgDnaException("Location not found", HttpStatus.NOT_FOUND, "LOCATION_NOT_FOUND"));
        loc.restore();
        locationRepository.save(loc);
        recordAudit("Location", id.toString(), AuditAction.UPDATE, null, loc, "RESTORED");
    }

    // ── Grades ──────────────────────────────────────────
    @Override
    public Grade createGrade(Grade gr, UUID organizationId) {
        Organization org = getOrganizationById(organizationId);
        if (gradeRepository.existsByOrganizationIdAndNameIgnoreCaseAndDeletedFalse(organizationId, gr.getName())) {
            throw new OrgDnaException("Grade name already exists.", HttpStatus.CONFLICT, "DUPLICATE_CODE");
        }
        if (gradeRepository.existsByOrganizationIdAndCodeIgnoreCaseAndDeletedFalse(organizationId, gr.getCode())) {
            throw new OrgDnaException("Grade code already exists.", HttpStatus.CONFLICT, "DUPLICATE_CODE");
        }
        if (gradeRepository.existsByOrganizationIdAndLevelAndDeletedFalse(organizationId, gr.getLevel())) {
            throw new OrgDnaException("Grade level already exists.", HttpStatus.CONFLICT, "DUPLICATE_CODE");
        }
        gr.setOrganization(org);
        gr.setDeleted(false);
        return gradeRepository.save(gr);
    }

    @Override
    public Grade updateGrade(UUID id, Grade details) {
        Grade existing = gradeRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new OrgDnaException("Grade not found", HttpStatus.NOT_FOUND, "GRADE_NOT_FOUND"));
        UUID orgId = existing.getOrganization().getId();
        if (!existing.getName().equalsIgnoreCase(details.getName()) && gradeRepository.existsByOrganizationIdAndNameIgnoreCaseAndDeletedFalse(orgId, details.getName())) {
            throw new OrgDnaException("Grade name already exists.", HttpStatus.CONFLICT, "DUPLICATE_CODE");
        }
        if (!existing.getCode().equalsIgnoreCase(details.getCode()) && gradeRepository.existsByOrganizationIdAndCodeIgnoreCaseAndDeletedFalse(orgId, details.getCode())) {
            throw new OrgDnaException("Grade code already exists.", HttpStatus.CONFLICT, "DUPLICATE_CODE");
        }
        if (!existing.getLevel().equals(details.getLevel()) && gradeRepository.existsByOrganizationIdAndLevelAndDeletedFalse(orgId, details.getLevel())) {
            throw new OrgDnaException("Grade level already exists.", HttpStatus.CONFLICT, "DUPLICATE_CODE");
        }
        existing.setName(details.getName());
        existing.setCode(details.getCode());
        existing.setLevel(details.getLevel());
        existing.setActive(details.isActive());
        return gradeRepository.save(existing);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Grade> getGradesByOrg(UUID organizationId, boolean includeDeleted) {
        if (includeDeleted) {
            return gradeRepository.findByOrganizationId(organizationId);
        } else {
            return gradeRepository.findByOrganizationIdAndDeletedFalse(organizationId);
        }
    }

    @Override
    public void deleteGrade(UUID id) {
        Grade gr = gradeRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new OrgDnaException("Grade not found", HttpStatus.NOT_FOUND, "GRADE_NOT_FOUND"));

        long empCount = countEmployeesForDnaNode("grade_id", id);
        long positionCount = positionRepository.countByGradeIdAndDeletedFalse(id);
        long matrixCount = approvalMatrixRepository.countByGradeIdAndDeletedFalse(id);

        if (empCount > 0 || positionCount > 0 || matrixCount > 0) {
            recordAudit("Grade", id.toString(), AuditAction.DELETE, gr, null, "DELETE_ATTEMPT_FAILED");
            throw new OrgDnaException("Grade is in use by active Employees, Positions, or Approval Matrices.", HttpStatus.CONFLICT, "NODE_IN_USE");
        }

        gr.archive();
        gradeRepository.save(gr);
        recordAudit("Grade", id.toString(), AuditAction.DELETE, gr, null, "ARCHIVED");
    }

    @Override
    public void restoreGrade(UUID id) {
        Grade gr = gradeRepository.findById(id)
                .orElseThrow(() -> new OrgDnaException("Grade not found", HttpStatus.NOT_FOUND, "GRADE_NOT_FOUND"));
        gr.restore();
        gradeRepository.save(gr);
        recordAudit("Grade", id.toString(), AuditAction.UPDATE, null, gr, "RESTORED");
    }

    // ── Bands ──────────────────────────────────────────
    @Override
    public Band createBand(Band bd, UUID organizationId) {
        Organization org = getOrganizationById(organizationId);
        if (bandRepository.existsByOrganizationIdAndNameIgnoreCaseAndDeletedFalse(organizationId, bd.getName())) {
            throw new OrgDnaException("Band name already exists.", HttpStatus.CONFLICT, "DUPLICATE_CODE");
        }
        if (bandRepository.existsByOrganizationIdAndCodeIgnoreCaseAndDeletedFalse(organizationId, bd.getCode())) {
            throw new OrgDnaException("Band code already exists.", HttpStatus.CONFLICT, "DUPLICATE_CODE");
        }
        bd.setOrganization(org);
        bd.setDeleted(false);
        return bandRepository.save(bd);
    }

    @Override
    public Band updateBand(UUID id, Band details) {
        Band existing = bandRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new OrgDnaException("Band not found", HttpStatus.NOT_FOUND, "BAND_NOT_FOUND"));
        UUID orgId = existing.getOrganization().getId();
        if (!existing.getName().equalsIgnoreCase(details.getName()) && bandRepository.existsByOrganizationIdAndNameIgnoreCaseAndDeletedFalse(orgId, details.getName())) {
            throw new OrgDnaException("Band name already exists.", HttpStatus.CONFLICT, "DUPLICATE_CODE");
        }
        if (!existing.getCode().equalsIgnoreCase(details.getCode()) && bandRepository.existsByOrganizationIdAndCodeIgnoreCaseAndDeletedFalse(orgId, details.getCode())) {
            throw new OrgDnaException("Band code already exists.", HttpStatus.CONFLICT, "DUPLICATE_CODE");
        }
        existing.setName(details.getName());
        existing.setCode(details.getCode());
        existing.setMinSalary(details.getMinSalary());
        existing.setMaxSalary(details.getMaxSalary());
        existing.setCurrency(details.getCurrency());
        existing.setActive(details.isActive());
        return bandRepository.save(existing);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Band> getBandsByOrg(UUID organizationId, boolean includeDeleted) {
        if (includeDeleted) {
            return bandRepository.findByOrganizationId(organizationId);
        } else {
            return bandRepository.findByOrganizationIdAndDeletedFalse(organizationId);
        }
    }

    @Override
    public void deleteBand(UUID id) {
        Band bd = bandRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new OrgDnaException("Band not found", HttpStatus.NOT_FOUND, "BAND_NOT_FOUND"));

        long empCount = countEmployeesForDnaNode("band_id", id);
        long positionCount = positionRepository.countByBandIdAndDeletedFalse(id);

        if (empCount > 0 || positionCount > 0) {
            recordAudit("Band", id.toString(), AuditAction.DELETE, bd, null, "DELETE_ATTEMPT_FAILED");
            throw new OrgDnaException("Band is in use by active Employees or Positions.", HttpStatus.CONFLICT, "NODE_IN_USE");
        }

        bd.archive();
        bandRepository.save(bd);
        recordAudit("Band", id.toString(), AuditAction.DELETE, bd, null, "ARCHIVED");
    }

    @Override
    public void restoreBand(UUID id) {
        Band bd = bandRepository.findById(id)
                .orElseThrow(() -> new OrgDnaException("Band not found", HttpStatus.NOT_FOUND, "BAND_NOT_FOUND"));
        bd.restore();
        bandRepository.save(bd);
        recordAudit("Band", id.toString(), AuditAction.UPDATE, null, bd, "RESTORED");
    }

    // ── Designations ──────────────────────────────────────────
    @Override
    public Designation createDesignation(Designation desig, UUID organizationId) {
        Organization org = getOrganizationById(organizationId);
        if (designationRepository.existsByOrganizationIdAndNameIgnoreCaseAndDeletedFalse(organizationId, desig.getName())) {
            throw new OrgDnaException("Designation name already exists.", HttpStatus.CONFLICT, "DUPLICATE_CODE");
        }
        if (designationRepository.existsByOrganizationIdAndCodeIgnoreCaseAndDeletedFalse(organizationId, desig.getCode())) {
            throw new OrgDnaException("Designation code already exists.", HttpStatus.CONFLICT, "DUPLICATE_CODE");
        }
        desig.setOrganization(org);
        desig.setDeleted(false);
        return designationRepository.save(desig);
    }

    @Override
    public Designation updateDesignation(UUID id, Designation details) {
        Designation existing = designationRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new OrgDnaException("Designation not found", HttpStatus.NOT_FOUND, "DESIGNATION_NOT_FOUND"));
        UUID orgId = existing.getOrganization().getId();
        if (!existing.getName().equalsIgnoreCase(details.getName()) && designationRepository.existsByOrganizationIdAndNameIgnoreCaseAndDeletedFalse(orgId, details.getName())) {
            throw new OrgDnaException("Designation name already exists.", HttpStatus.CONFLICT, "DUPLICATE_CODE");
        }
        if (!existing.getCode().equalsIgnoreCase(details.getCode()) && designationRepository.existsByOrganizationIdAndCodeIgnoreCaseAndDeletedFalse(orgId, details.getCode())) {
            throw new OrgDnaException("Designation code already exists.", HttpStatus.CONFLICT, "DUPLICATE_CODE");
        }
        existing.setName(details.getName());
        existing.setCode(details.getCode());
        existing.setLevel(details.getLevel());
        existing.setJobFamily(details.getJobFamily());
        existing.setCategory(details.getCategory());
        existing.setDescription(details.getDescription());
        existing.setActive(details.isActive());
        return designationRepository.save(existing);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Designation> getDesignationsByOrg(UUID organizationId, boolean includeDeleted) {
        if (includeDeleted) {
            return designationRepository.findByOrganizationId(organizationId);
        } else {
            return designationRepository.findByOrganizationIdAndDeletedFalse(organizationId);
        }
    }

    @Override
    public void deleteDesignation(UUID id) {
        Designation desig = designationRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new OrgDnaException("Designation not found", HttpStatus.NOT_FOUND, "DESIGNATION_NOT_FOUND"));

        long empCount = countEmployeesForDnaNode("designation_id", id);
        long matrixCount = approvalMatrixRepository.countByDesignationIdAndDeletedFalse(id);

        if (empCount > 0 || matrixCount > 0) {
            recordAudit("Designation", id.toString(), AuditAction.DELETE, desig, null, "DELETE_ATTEMPT_FAILED");
            throw new OrgDnaException("Designation is in use by active Employees or Approval Matrices.", HttpStatus.CONFLICT, "NODE_IN_USE");
        }

        desig.archive();
        designationRepository.save(desig);
        recordAudit("Designation", id.toString(), AuditAction.DELETE, desig, null, "ARCHIVED");
    }

    @Override
    public void restoreDesignation(UUID id) {
        Designation desig = designationRepository.findById(id)
                .orElseThrow(() -> new OrgDnaException("Designation not found", HttpStatus.NOT_FOUND, "DESIGNATION_NOT_FOUND"));
        desig.restore();
        designationRepository.save(desig);
        recordAudit("Designation", id.toString(), AuditAction.UPDATE, null, desig, "RESTORED");
    }

    // ── Employment Types ──────────────────────────────────────────
    @Override
    public EmploymentType createEmploymentType(EmploymentType type, UUID organizationId) {
        Organization org = getOrganizationById(organizationId);
        if (employmentTypeRepository.existsByOrganizationIdAndNameIgnoreCaseAndDeletedFalse(organizationId, type.getName())) {
            throw new OrgDnaException("Employment Type name already exists.", HttpStatus.CONFLICT, "DUPLICATE_CODE");
        }
        if (employmentTypeRepository.existsByOrganizationIdAndCodeIgnoreCaseAndDeletedFalse(organizationId, type.getCode())) {
            throw new OrgDnaException("Employment Type code already exists.", HttpStatus.CONFLICT, "DUPLICATE_CODE");
        }
        type.setOrganization(org);
        type.setDeleted(false);
        return employmentTypeRepository.save(type);
    }

    @Override
    public EmploymentType updateEmploymentType(UUID id, EmploymentType details) {
        EmploymentType existing = employmentTypeRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new OrgDnaException("Employment Type not found", HttpStatus.NOT_FOUND, "EMPLOYMENT_TYPE_NOT_FOUND"));
        UUID orgId = existing.getOrganization().getId();
        if (!existing.getName().equalsIgnoreCase(details.getName()) && employmentTypeRepository.existsByOrganizationIdAndNameIgnoreCaseAndDeletedFalse(orgId, details.getName())) {
            throw new OrgDnaException("Employment Type name already exists.", HttpStatus.CONFLICT, "DUPLICATE_CODE");
        }
        if (!existing.getCode().equalsIgnoreCase(details.getCode()) && employmentTypeRepository.existsByOrganizationIdAndCodeIgnoreCaseAndDeletedFalse(orgId, details.getCode())) {
            throw new OrgDnaException("Employment Type code already exists.", HttpStatus.CONFLICT, "DUPLICATE_CODE");
        }
        existing.setName(details.getName());
        existing.setCode(details.getCode());
        existing.setActive(details.isActive());
        return employmentTypeRepository.save(existing);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmploymentType> getEmploymentTypesByOrg(UUID organizationId, boolean includeDeleted) {
        if (includeDeleted) {
            return employmentTypeRepository.findByOrganizationId(organizationId);
        } else {
            return employmentTypeRepository.findByOrganizationIdAndDeletedFalse(organizationId);
        }
    }

    @Override
    public void deleteEmploymentType(UUID id) {
        EmploymentType type = employmentTypeRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new OrgDnaException("Employment Type not found", HttpStatus.NOT_FOUND, "EMPLOYMENT_TYPE_NOT_FOUND"));

        long empCount = countEmployeesForDnaNode("employment_type_id", id);
        if (empCount > 0) {
            recordAudit("EmploymentType", id.toString(), AuditAction.DELETE, type, null, "DELETE_ATTEMPT_FAILED");
            throw new OrgDnaException("Employment Type is in use by active Employees.", HttpStatus.CONFLICT, "NODE_IN_USE");
        }

        type.archive();
        employmentTypeRepository.save(type);
        recordAudit("EmploymentType", id.toString(), AuditAction.DELETE, type, null, "ARCHIVED");
    }

    @Override
    public void restoreEmploymentType(UUID id) {
        EmploymentType type = employmentTypeRepository.findById(id)
                .orElseThrow(() -> new OrgDnaException("Employment Type not found", HttpStatus.NOT_FOUND, "EMPLOYMENT_TYPE_NOT_FOUND"));
        type.restore();
        employmentTypeRepository.save(type);
        recordAudit("EmploymentType", id.toString(), AuditAction.UPDATE, null, type, "RESTORED");
    }

    // ── Cost Centers ──────────────────────────────────────────
    @Override
    public CostCenter createCostCenter(CostCenter cc, UUID organizationId) {
        Organization org = getOrganizationById(organizationId);
        if (costCenterRepository.existsByOrganizationIdAndNameIgnoreCaseAndDeletedFalse(organizationId, cc.getName())) {
            throw new OrgDnaException("Cost Center name already exists.", HttpStatus.CONFLICT, "DUPLICATE_CODE");
        }
        if (costCenterRepository.existsByOrganizationIdAndCodeIgnoreCaseAndDeletedFalse(organizationId, cc.getCode())) {
            throw new OrgDnaException("Cost Center code already exists.", HttpStatus.CONFLICT, "DUPLICATE_CODE");
        }
        cc.setOrganization(org);
        cc.setDeleted(false);
        return costCenterRepository.save(cc);
    }

    @Override
    public CostCenter updateCostCenter(UUID id, CostCenter details) {
        CostCenter existing = costCenterRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new OrgDnaException("Cost Center not found", HttpStatus.NOT_FOUND, "COST_CENTER_NOT_FOUND"));
        UUID orgId = existing.getOrganization().getId();
        if (!existing.getName().equalsIgnoreCase(details.getName()) && costCenterRepository.existsByOrganizationIdAndNameIgnoreCaseAndDeletedFalse(orgId, details.getName())) {
            throw new OrgDnaException("Cost Center name already exists.", HttpStatus.CONFLICT, "DUPLICATE_CODE");
        }
        if (!existing.getCode().equalsIgnoreCase(details.getCode()) && costCenterRepository.existsByOrganizationIdAndCodeIgnoreCaseAndDeletedFalse(orgId, details.getCode())) {
            throw new OrgDnaException("Cost Center code already exists.", HttpStatus.CONFLICT, "DUPLICATE_CODE");
        }
        existing.setName(details.getName());
        existing.setCode(details.getCode());
        existing.setDescription(details.getDescription());
        existing.setBudget(details.getBudget());
        existing.setCurrency(details.getCurrency());
        existing.setDepartmentId(details.getDepartmentId());
        existing.setActive(details.isActive());
        return costCenterRepository.save(existing);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CostCenter> getCostCentersByOrg(UUID organizationId, boolean includeDeleted) {
        if (includeDeleted) {
            return costCenterRepository.findByOrganizationId(organizationId);
        } else {
            return costCenterRepository.findByOrganizationIdAndDeletedFalse(organizationId);
        }
    }

    @Override
    public void deleteCostCenter(UUID id) {
        CostCenter cc = costCenterRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new OrgDnaException("Cost Center not found", HttpStatus.NOT_FOUND, "COST_CENTER_NOT_FOUND"));

        long empCount = countEmployeesForDnaNode("cost_center_id", id);
        if (empCount > 0) {
            recordAudit("CostCenter", id.toString(), AuditAction.DELETE, cc, null, "DELETE_ATTEMPT_FAILED");
            throw new OrgDnaException("Cost Center is in use by active Employees.", HttpStatus.CONFLICT, "NODE_IN_USE");
        }

        cc.archive();
        costCenterRepository.save(cc);
        recordAudit("CostCenter", id.toString(), AuditAction.DELETE, cc, null, "ARCHIVED");
    }

    @Override
    public void restoreCostCenter(UUID id) {
        CostCenter cc = costCenterRepository.findById(id)
                .orElseThrow(() -> new OrgDnaException("Cost Center not found", HttpStatus.NOT_FOUND, "COST_CENTER_NOT_FOUND"));
        cc.restore();
        costCenterRepository.save(cc);
        recordAudit("CostCenter", id.toString(), AuditAction.UPDATE, null, cc, "RESTORED");
    }

    @Override
    public BusinessUnit cloneBusinessUnit(UUID sourceBUId, String targetName, String targetCode) {
        BusinessUnit sourceBU = businessUnitRepository.findByIdAndDeletedFalse(sourceBUId)
                .orElseThrow(() -> new OrgDnaException("Business Unit not found", HttpStatus.NOT_FOUND, "BU_NOT_FOUND"));

        BusinessUnit targetBU = new BusinessUnit();
        targetBU.setName(targetName);
        targetBU.setCode(targetCode);
        targetBU.setOrganization(sourceBU.getOrganization());
        targetBU.setTenantId(sourceBU.getTenantId());
        targetBU.setDeleted(false);
        targetBU = businessUnitRepository.save(targetBU);

        recordAudit("BusinessUnit", targetBU.getId().toString(), AuditAction.CREATE, null, targetBU, "CLONED");

        List<Division> divisions = divisionRepository.findByBusinessUnitIdAndDeletedFalse(sourceBUId);
        for (Division sourceDiv : divisions) {
            Division targetDiv = new Division();
            targetDiv.setName(sourceDiv.getName());
            targetDiv.setCode(sourceDiv.getCode());
            targetDiv.setDescription(sourceDiv.getDescription());
            targetDiv.setBusinessUnit(targetBU);
            targetDiv.setTenantId(sourceDiv.getTenantId());
            targetDiv.setDeleted(false);
            targetDiv = divisionRepository.save(targetDiv);

            List<Department> departments = departmentRepository.findByDivisionIdAndDeletedFalse(sourceDiv.getId());
            for (Department sourceDept : departments) {
                Department targetDept = new Department();
                targetDept.setName(sourceDept.getName());
                targetDept.setCode(sourceDept.getCode());
                targetDept.setDescription(sourceDept.getDescription());
                targetDept.setDivision(targetDiv);
                targetDept.setTenantId(sourceDept.getTenantId());
                targetDept.setDeleted(false);
                targetDept = departmentRepository.save(targetDept);

                List<Team> teams = teamRepository.findByDepartmentIdAndDeletedFalse(sourceDept.getId());
                for (Team sourceTeam : teams) {
                    Team targetTeam = new Team();
                    targetTeam.setName(sourceTeam.getName());
                    targetTeam.setCode(sourceTeam.getCode());
                    targetTeam.setDescription(sourceTeam.getDescription());
                    targetTeam.setDepartment(targetDept);
                    targetTeam.setTenantId(sourceTeam.getTenantId());
                    targetTeam.setDeleted(false);
                    teamRepository.save(targetTeam);
                }

                List<ApprovalMatrix> allDeptMatrices = approvalMatrixRepository.findByTenantIdAndDeletedFalse(TenantContext.getCurrentTenant());
                for (ApprovalMatrix sourceMatrix : allDeptMatrices) {
                    if (sourceDept.getId().equals(sourceMatrix.getDepartmentId())) {
                        ApprovalMatrix targetMatrix = new ApprovalMatrix();
                        targetMatrix.setDepartmentId(targetDept.getId());
                        targetMatrix.setDesignationId(sourceMatrix.getDesignationId());
                        targetMatrix.setGradeId(sourceMatrix.getGradeId());
                        targetMatrix.setApprovalType(sourceMatrix.getApprovalType());
                        targetMatrix.setTenantId(sourceMatrix.getTenantId());
                        targetMatrix.setDeleted(false);
                        targetMatrix.setApproverLevel1Type(sourceMatrix.getApproverLevel1Type());
                        targetMatrix.setApproverLevel2Type(sourceMatrix.getApproverLevel2Type());
                        targetMatrix.setApproverLevel3Type(sourceMatrix.getApproverLevel3Type());
                        targetMatrix.setApproverLevel4Type(sourceMatrix.getApproverLevel4Type());
                        targetMatrix.setLocationId(sourceMatrix.getLocationId());
                        targetMatrix.setEmploymentTypeId(sourceMatrix.getEmploymentTypeId());
                        targetMatrix.setMinAmount(sourceMatrix.getMinAmount());
                        targetMatrix.setMaxAmount(sourceMatrix.getMaxAmount());
                        targetMatrix.setApproverLevel1Id(null);
                        targetMatrix.setApproverLevel2Id(null);
                        targetMatrix.setApproverLevel3Id(null);
                        targetMatrix.setApproverLevel4Id(null);
                        approvalMatrixRepository.save(targetMatrix);
                    }
                }
            }
        }
        return targetBU;
    }
}
