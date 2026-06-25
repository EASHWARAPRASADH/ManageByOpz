package com.managemyopz.orgdna.service;

import com.managemyopz.orgdna.entity.*;
import java.util.List;
import java.util.UUID;

public interface OrgDnaService {

    // Organizations
    Organization createOrganization(Organization org);
    Organization updateOrganization(UUID id, Organization org);
    Organization getOrganizationById(UUID id);
    List<Organization> getAllOrganizations(boolean includeDeleted);
    void deleteOrganization(UUID id); // acts as archive
    void restoreOrganization(UUID id);

    // Business Units
    BusinessUnit createBusinessUnit(BusinessUnit bu, UUID organizationId);
    BusinessUnit updateBusinessUnit(UUID id, BusinessUnit bu);
    List<BusinessUnit> getBusinessUnitsByOrg(UUID organizationId, boolean includeDeleted);
    void deleteBusinessUnit(UUID id); // acts as archive
    void restoreBusinessUnit(UUID id);
    BusinessUnit cloneBusinessUnit(UUID sourceBUId, String targetName, String targetCode);

    // Divisions
    Division createDivision(Division div, UUID businessUnitId);
    Division updateDivision(UUID id, Division div);
    List<Division> getDivisionsByBU(UUID businessUnitId, boolean includeDeleted);
    void deleteDivision(UUID id); // acts as archive
    void restoreDivision(UUID id);

    // Departments
    Department createDepartment(Department dept, UUID divisionId);
    Department updateDepartment(UUID id, Department dept);
    List<Department> getDepartmentsByDivision(UUID divisionId, boolean includeDeleted);
    void deleteDepartment(UUID id); // acts as archive
    void restoreDepartment(UUID id);

    // Teams (Sub Departments)
    Team createTeam(Team team, UUID departmentId);
    Team updateTeam(UUID id, Team team);
    List<Team> getTeamsByDept(UUID departmentId, boolean includeDeleted);
    void deleteTeam(UUID id); // acts as archive
    void restoreTeam(UUID id);

    // Locations
    Location createLocation(Location loc, UUID organizationId);
    Location updateLocation(UUID id, Location loc);
    List<Location> getLocationsByOrg(UUID organizationId, boolean includeDeleted);
    void deleteLocation(UUID id); // acts as archive
    void restoreLocation(UUID id);

    // Grades
    Grade createGrade(Grade gr, UUID organizationId);
    Grade updateGrade(UUID id, Grade gr);
    List<Grade> getGradesByOrg(UUID organizationId, boolean includeDeleted);
    void deleteGrade(UUID id); // acts as archive
    void restoreGrade(UUID id);

    // Bands
    Band createBand(Band bd, UUID organizationId);
    Band updateBand(UUID id, Band bd);
    List<Band> getBandsByOrg(UUID organizationId, boolean includeDeleted);
    void deleteBand(UUID id); // acts as archive
    void restoreBand(UUID id);

    // Designations
    Designation createDesignation(Designation desig, UUID organizationId);
    Designation updateDesignation(UUID id, Designation desig);
    List<Designation> getDesignationsByOrg(UUID organizationId, boolean includeDeleted);
    void deleteDesignation(UUID id); // acts as archive
    void restoreDesignation(UUID id);

    // Employment Types
    EmploymentType createEmploymentType(EmploymentType type, UUID organizationId);
    EmploymentType updateEmploymentType(UUID id, EmploymentType type);
    List<EmploymentType> getEmploymentTypesByOrg(UUID organizationId, boolean includeDeleted);
    void deleteEmploymentType(UUID id); // acts as archive
    void restoreEmploymentType(UUID id);

    // Cost Centers
    CostCenter createCostCenter(CostCenter cc, UUID organizationId);
    CostCenter updateCostCenter(UUID id, CostCenter cc);
    List<CostCenter> getCostCentersByOrg(UUID organizationId, boolean includeDeleted);
    void deleteCostCenter(UUID id); // acts as archive
    void restoreCostCenter(UUID id);
}
