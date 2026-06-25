package com.managemyopz.twin.controller;

import com.managemyopz.shared.dto.ApiResponse;
import com.managemyopz.orgdna.entity.*;
import com.managemyopz.orgdna.repository.*;
import com.managemyopz.twin.entity.EmployeeTwin;
import com.managemyopz.twin.repository.EmployeeTwinRepository;
import com.managemyopz.shared.entity.TenantContext;
import lombok.RequiredArgsConstructor;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/v1/dashboard/dna-analytics")
@RequiredArgsConstructor
public class DnaAnalyticsController {

    private final EmployeeTwinRepository employeeTwinRepository;
    private final OrganizationRepository organizationRepository;
    private final BusinessUnitRepository businessUnitRepository;
    private final DivisionRepository divisionRepository;
    private final DepartmentRepository departmentRepository;
    private final TeamRepository teamRepository;
    private final LocationRepository locationRepository;
    private final DesignationRepository designationRepository;
    private final GradeRepository gradeRepository;
    private final BandRepository bandRepository;
    private final EmploymentTypeRepository employmentTypeRepository;

    @GetMapping
    public ApiResponse<DnaAnalyticsReport> getDnaAnalytics() {
        String tenantId = TenantContext.getCurrentTenant();
        
        // 1. Fetch all active employee twins
        List<EmployeeTwin> employees = employeeTwinRepository.findAllActiveByTenant(tenantId);
        long totalEmployees = employees.size();

        // 2. Fetch all DNA nodes (Hibernate filter isolates by tenant)
        List<Organization> orgs = organizationRepository.findAll();
        List<BusinessUnit> bus = businessUnitRepository.findAll();
        List<Division> divs = divisionRepository.findAll();
        List<Department> depts = departmentRepository.findAll();
        List<Team> teams = teamRepository.findAll();
        List<Location> locs = locationRepository.findAll();
        List<Designation> desigs = designationRepository.findAll();
        List<Grade> grades = gradeRepository.findAll();
        List<Band> bands = bandRepository.findAll();
        List<EmploymentType> empTypes = employmentTypeRepository.findAll();

        // Map them by ID (only non-deleted ones)
        Map<UUID, Organization> orgMap = orgs.stream().filter(e -> !e.isDeleted()).collect(Collectors.toMap(Organization::getId, e -> e));
        Map<UUID, BusinessUnit> buMap = bus.stream().filter(e -> !e.isDeleted()).collect(Collectors.toMap(BusinessUnit::getId, e -> e));
        Map<UUID, Division> divMap = divs.stream().filter(e -> !e.isDeleted()).collect(Collectors.toMap(Division::getId, e -> e));
        Map<UUID, Department> deptMap = depts.stream().filter(e -> !e.isDeleted()).collect(Collectors.toMap(Department::getId, e -> e));
        Map<UUID, Team> teamMap = teams.stream().filter(e -> !e.isDeleted()).collect(Collectors.toMap(Team::getId, e -> e));
        Map<UUID, Location> locMap = locs.stream().filter(e -> !e.isDeleted()).collect(Collectors.toMap(Location::getId, e -> e));
        Map<UUID, Designation> desigMap = desigs.stream().filter(e -> !e.isDeleted()).collect(Collectors.toMap(Designation::getId, e -> e));
        Map<UUID, Grade> gradeMap = grades.stream().filter(e -> !e.isDeleted()).collect(Collectors.toMap(Grade::getId, e -> e));
        Map<UUID, Band> bandMap = bands.stream().filter(e -> !e.isDeleted()).collect(Collectors.toMap(Band::getId, e -> e));
        Map<UUID, EmploymentType> empTypeMap = empTypes.stream().filter(e -> !e.isDeleted()).collect(Collectors.toMap(EmploymentType::getId, e -> e));

        // 3. Count DNA Nodes
        long totalDnaNodes = orgMap.size() + buMap.size() + divMap.size() + deptMap.size() + teamMap.size() +
                locMap.size() + desigMap.size() + gradeMap.size() + bandMap.size() + empTypeMap.size();

        Map<String, Long> dnaNodesByType = new LinkedHashMap<>();
        dnaNodesByType.put("Organizations", (long) orgMap.size());
        dnaNodesByType.put("Business Units", (long) buMap.size());
        dnaNodesByType.put("Divisions", (long) divMap.size());
        dnaNodesByType.put("Departments", (long) deptMap.size());
        dnaNodesByType.put("Teams", (long) teamMap.size());
        dnaNodesByType.put("Locations", (long) locMap.size());
        dnaNodesByType.put("Designations", (long) desigMap.size());
        dnaNodesByType.put("Grades", (long) gradeMap.size());
        dnaNodesByType.put("Bands", (long) bandMap.size());
        dnaNodesByType.put("Employment Types", (long) empTypeMap.size());

        // 4. Validate DNA and detect orphans
        long employeesWithValidDna = 0;
        long employeesWithInvalidDna = 0;

        List<String> orphanBusinessUnitEmployees = new ArrayList<>();
        List<String> orphanDepartmentEmployees = new ArrayList<>();
        List<String> orphanTeamEmployees = new ArrayList<>();
        List<String> orphanOrganizationEmployees = new ArrayList<>();

        Map<String, Long> deptCounts = new LinkedHashMap<>();
        long unknownDeptCount = 0;
        Map<String, Long> locCounts = new LinkedHashMap<>();
        long unknownLocCount = 0;

        for (EmployeeTwin emp : employees) {
            boolean isValid = true;

            // Org check (Required)
            if (emp.getOrganizationId() == null || !orgMap.containsKey(emp.getOrganizationId())) {
                isValid = false;
                orphanOrganizationEmployees.add(formatEmpLabel(emp, emp.getOrganizationId()));
            }

            // BU check (Optional but must be valid if set)
            if (emp.getBusinessUnitId() != null && !buMap.containsKey(emp.getBusinessUnitId())) {
                isValid = false;
                orphanBusinessUnitEmployees.add(formatEmpLabel(emp, emp.getBusinessUnitId()));
            }

            // Division check
            if (emp.getDivisionId() != null && !divMap.containsKey(emp.getDivisionId())) {
                isValid = false;
            }

            // Department check (Optional but must be valid if set)
            boolean deptValid = true;
            if (emp.getDepartmentId() != null) {
                if (!deptMap.containsKey(emp.getDepartmentId())) {
                    isValid = false;
                    deptValid = false;
                    orphanDepartmentEmployees.add(formatEmpLabel(emp, emp.getDepartmentId()));
                }
            } else {
                deptValid = false;
            }

            // Team check
            if (emp.getSubDepartmentId() != null && !teamMap.containsKey(emp.getSubDepartmentId())) {
                isValid = false;
                orphanTeamEmployees.add(formatEmpLabel(emp, emp.getSubDepartmentId()));
            }

            // Location check
            boolean locValid = true;
            if (emp.getLocationId() != null) {
                if (!locMap.containsKey(emp.getLocationId())) {
                    isValid = false;
                    locValid = false;
                }
            } else {
                locValid = false;
            }

            // Designation check
            if (emp.getDesignationId() != null && !desigMap.containsKey(emp.getDesignationId())) {
                isValid = false;
            }

            // Grade check
            if (emp.getGradeId() != null && !gradeMap.containsKey(emp.getGradeId())) {
                isValid = false;
            }

            // Band check
            if (emp.getBandId() != null && !bandMap.containsKey(emp.getBandId())) {
                isValid = false;
            }

            // Employment Type check
            if (emp.getEmploymentTypeId() != null && !empTypeMap.containsKey(emp.getEmploymentTypeId())) {
                isValid = false;
            }

            if (isValid) {
                employeesWithValidDna++;
            } else {
                employeesWithInvalidDna++;
            }

            // Populate Department stats
            if (deptValid && emp.getDepartmentId() != null) {
                String deptName = deptMap.get(emp.getDepartmentId()).getName();
                deptCounts.put(deptName, deptCounts.getOrDefault(deptName, 0L) + 1);
            } else {
                unknownDeptCount++;
            }

            // Populate Location stats
            if (locValid && emp.getLocationId() != null) {
                String locName = locMap.get(emp.getLocationId()).getName();
                locCounts.put(locName, locCounts.getOrDefault(locName, 0L) + 1);
            } else {
                unknownLocCount++;
            }
        }

        // Create Department Breakdown List
        List<DnaAnalyticsReport.DepartmentBreakdown> departmentBreakdown = new ArrayList<>();
        for (Map.Entry<String, Long> entry : deptCounts.entrySet()) {
            double pct = totalEmployees > 0 ? Math.round(((double) entry.getValue() / totalEmployees) * 1000.0) / 10.0 : 0.0;
            departmentBreakdown.add(new DnaAnalyticsReport.DepartmentBreakdown(entry.getKey(), entry.getValue(), pct));
        }
        
        // Add Unknown Department if counts > 0
        if (unknownDeptCount > 0) {
            double pct = totalEmployees > 0 ? Math.round(((double) unknownDeptCount / totalEmployees) * 1000.0) / 10.0 : 0.0;
            departmentBreakdown.add(new DnaAnalyticsReport.DepartmentBreakdown("Unknown Department (" + unknownDeptCount + ")", unknownDeptCount, pct));
        }

        // Sort department breakdown by count descending
        departmentBreakdown.sort((a, b) -> Long.compare(b.getEmployeeCount(), a.getEmployeeCount()));

        // Create Location Breakdown List
        List<DnaAnalyticsReport.LocationBreakdown> locationBreakdown = new ArrayList<>();
        for (Map.Entry<String, Long> entry : locCounts.entrySet()) {
            double pct = totalEmployees > 0 ? Math.round(((double) entry.getValue() / totalEmployees) * 1000.0) / 10.0 : 0.0;
            locationBreakdown.add(new DnaAnalyticsReport.LocationBreakdown(entry.getKey(), entry.getValue(), pct));
        }
        
        // Add Unknown Location if counts > 0
        if (unknownLocCount > 0) {
            double pct = totalEmployees > 0 ? Math.round(((double) unknownLocCount / totalEmployees) * 1000.0) / 10.0 : 0.0;
            locationBreakdown.add(new DnaAnalyticsReport.LocationBreakdown("Unknown Location (" + unknownLocCount + ")", unknownLocCount, pct));
        }

        // Sort location breakdown by count descending
        locationBreakdown.sort((a, b) -> Long.compare(b.getEmployeeCount(), a.getEmployeeCount()));

        // Populate ID-to-name lookup maps for all DNA entity types
        Map<String, String> organizationNames = new HashMap<>();
        orgs.forEach(o -> { if (!o.isDeleted()) organizationNames.put(o.getId().toString(), o.getName()); });

        Map<String, String> businessUnitNames = new HashMap<>();
        bus.forEach(b -> { if (!b.isDeleted()) businessUnitNames.put(b.getId().toString(), b.getName()); });

        Map<String, String> divisionNames = new HashMap<>();
        divs.forEach(d -> { if (!d.isDeleted()) divisionNames.put(d.getId().toString(), d.getName()); });

        Map<String, String> departmentNames = new HashMap<>();
        depts.forEach(d -> { if (!d.isDeleted()) departmentNames.put(d.getId().toString(), d.getName()); });

        Map<String, String> teamNames = new HashMap<>();
        teams.forEach(t -> { if (!t.isDeleted()) teamNames.put(t.getId().toString(), t.getName()); });

        Map<String, String> locationNames = new HashMap<>();
        locs.forEach(l -> { if (!l.isDeleted()) locationNames.put(l.getId().toString(), l.getName()); });

        Map<String, String> designationNames = new HashMap<>();
        desigs.forEach(d -> { if (!d.isDeleted()) designationNames.put(d.getId().toString(), d.getName()); });

        Map<String, String> gradeNames = new HashMap<>();
        grades.forEach(g -> { if (!g.isDeleted()) gradeNames.put(g.getId().toString(), g.getName()); });

        Map<String, String> bandNames = new HashMap<>();
        bands.forEach(b -> { if (!b.isDeleted()) bandNames.put(b.getId().toString(), b.getName()); });

        double dnaIntegrityPercentage = totalEmployees > 0 ? Math.round(((double) employeesWithValidDna / totalEmployees) * 1000.0) / 10.0 : 100.0;

        DnaAnalyticsReport report = DnaAnalyticsReport.builder()
                .totalEmployees(totalEmployees)
                .employeesWithValidDna(employeesWithValidDna)
                .employeesWithInvalidDna(employeesWithInvalidDna)
                .dnaIntegrityPercentage(dnaIntegrityPercentage)
                .totalDnaNodes(totalDnaNodes)
                .dnaNodesByType(dnaNodesByType)
                .departmentBreakdown(departmentBreakdown)
                .locationBreakdown(locationBreakdown)
                .orphanBusinessUnitEmployees(orphanBusinessUnitEmployees)
                .orphanDepartmentEmployees(orphanDepartmentEmployees)
                .orphanTeamEmployees(orphanTeamEmployees)
                .orphanOrganizationEmployees(orphanOrganizationEmployees)
                .organizationNames(organizationNames)
                .businessUnitNames(businessUnitNames)
                .divisionNames(divisionNames)
                .departmentNames(departmentNames)
                .teamNames(teamNames)
                .locationNames(locationNames)
                .designationNames(designationNames)
                .gradeNames(gradeNames)
                .bandNames(bandNames)
                .build();

        return ApiResponse.success(report, "DNA analytics calculated successfully");
    }

    private String formatEmpLabel(EmployeeTwin emp, UUID refId) {
        String name = emp.getDisplayName() != null ? emp.getDisplayName() : emp.getFullName();
        return String.format("%s - %s (Ref ID: %s)", 
                emp.getEmployeeCode() != null ? emp.getEmployeeCode() : "N/A",
                name,
                refId != null ? refId.toString() : "MISSING");
    }

    @GetMapping("/integrity-report")
    public ApiResponse<List<DnaOrphanRecord>> getIntegrityReport() {
        String tenantId = TenantContext.getCurrentTenant();
        List<EmployeeTwin> employees = employeeTwinRepository.findAllActiveByTenant(tenantId);
        
        List<Organization> orgs = organizationRepository.findAll();
        List<BusinessUnit> bus = businessUnitRepository.findAll();
        List<Division> divs = divisionRepository.findAll();
        List<Department> depts = departmentRepository.findAll();
        List<Team> teams = teamRepository.findAll();
        List<Location> locs = locationRepository.findAll();
        List<Designation> desigs = designationRepository.findAll();
        List<Grade> grades = gradeRepository.findAll();
        List<Band> bands = bandRepository.findAll();

        Map<UUID, Organization> orgMap = orgs.stream().filter(e -> !e.isDeleted()).collect(Collectors.toMap(Organization::getId, e -> e));
        Map<UUID, BusinessUnit> buMap = bus.stream().filter(e -> !e.isDeleted()).collect(Collectors.toMap(BusinessUnit::getId, e -> e));
        Map<UUID, Division> divMap = divs.stream().filter(e -> !e.isDeleted()).collect(Collectors.toMap(Division::getId, e -> e));
        Map<UUID, Department> deptMap = depts.stream().filter(e -> !e.isDeleted()).collect(Collectors.toMap(Department::getId, e -> e));
        Map<UUID, Team> teamMap = teams.stream().filter(e -> !e.isDeleted()).collect(Collectors.toMap(Team::getId, e -> e));
        Map<UUID, Location> locMap = locs.stream().filter(e -> !e.isDeleted()).collect(Collectors.toMap(Location::getId, e -> e));
        Map<UUID, Designation> desigMap = desigs.stream().filter(e -> !e.isDeleted()).collect(Collectors.toMap(Designation::getId, e -> e));
        Map<UUID, Grade> gradeMap = grades.stream().filter(e -> !e.isDeleted()).collect(Collectors.toMap(Grade::getId, e -> e));
        Map<UUID, Band> bandMap = bands.stream().filter(e -> !e.isDeleted()).collect(Collectors.toMap(Band::getId, e -> e));

        List<DnaOrphanRecord> report = new ArrayList<>();

        for (EmployeeTwin emp : employees) {
            String empName = emp.getDisplayName() != null ? emp.getDisplayName() : emp.getFullName();

            // 1. Organization
            if (emp.getOrganizationId() == null || !orgMap.containsKey(emp.getOrganizationId())) {
                UUID invalidId = emp.getOrganizationId();
                Organization match = orgMap.values().stream().findFirst().orElse(null);
                report.add(new DnaOrphanRecord(emp.getId(), emp.getEmployeeCode(), empName, "organizationId", 
                        invalidId != null ? invalidId.toString() : "MISSING", 
                        match != null ? match.getId() : null, match != null ? match.getName() : null));
            }
            // 2. Business Unit
            if (emp.getBusinessUnitId() != null && !buMap.containsKey(emp.getBusinessUnitId())) {
                BusinessUnit match = buMap.values().stream().findFirst().orElse(null);
                report.add(new DnaOrphanRecord(emp.getId(), emp.getEmployeeCode(), empName, "businessUnitId", 
                        emp.getBusinessUnitId().toString(), 
                        match != null ? match.getId() : null, match != null ? match.getName() : null));
            }
            // 3. Division
            if (emp.getDivisionId() != null && !divMap.containsKey(emp.getDivisionId())) {
                Division match = divMap.values().stream().findFirst().orElse(null);
                report.add(new DnaOrphanRecord(emp.getId(), emp.getEmployeeCode(), empName, "divisionId", 
                        emp.getDivisionId().toString(), 
                        match != null ? match.getId() : null, match != null ? match.getName() : null));
            }
            // 4. Department
            if (emp.getDepartmentId() != null && !deptMap.containsKey(emp.getDepartmentId())) {
                Department match = deptMap.values().stream().findFirst().orElse(null);
                report.add(new DnaOrphanRecord(emp.getId(), emp.getEmployeeCode(), empName, "departmentId", 
                        emp.getDepartmentId().toString(), 
                        match != null ? match.getId() : null, match != null ? match.getName() : null));
            }
            // 5. Team (subDepartmentId)
            if (emp.getSubDepartmentId() != null && !teamMap.containsKey(emp.getSubDepartmentId())) {
                Team match = teamMap.values().stream().findFirst().orElse(null);
                report.add(new DnaOrphanRecord(emp.getId(), emp.getEmployeeCode(), empName, "subDepartmentId", 
                        emp.getSubDepartmentId().toString(), 
                        match != null ? match.getId() : null, match != null ? match.getName() : null));
            }
            // 6. Location
            if (emp.getLocationId() != null && !locMap.containsKey(emp.getLocationId())) {
                Location match = locMap.values().stream().findFirst().orElse(null);
                report.add(new DnaOrphanRecord(emp.getId(), emp.getEmployeeCode(), empName, "locationId", 
                        emp.getLocationId().toString(), 
                        match != null ? match.getId() : null, match != null ? match.getName() : null));
            }
            // 7. Designation
            if (emp.getDesignationId() != null && !desigMap.containsKey(emp.getDesignationId())) {
                Designation match = desigMap.values().stream().findFirst().orElse(null);
                report.add(new DnaOrphanRecord(emp.getId(), emp.getEmployeeCode(), empName, "designationId", 
                        emp.getDesignationId().toString(), 
                        match != null ? match.getId() : null, match != null ? match.getName() : null));
            }
            // 8. Grade
            if (emp.getGradeId() != null && !gradeMap.containsKey(emp.getGradeId())) {
                Grade match = gradeMap.values().stream().findFirst().orElse(null);
                report.add(new DnaOrphanRecord(emp.getId(), emp.getEmployeeCode(), empName, "gradeId", 
                        emp.getGradeId().toString(), 
                        match != null ? match.getId() : null, match != null ? match.getName() : null));
            }
            // 9. Band
            if (emp.getBandId() != null && !bandMap.containsKey(emp.getBandId())) {
                Band match = bandMap.values().stream().findFirst().orElse(null);
                report.add(new DnaOrphanRecord(emp.getId(), emp.getEmployeeCode(), empName, "bandId", 
                        emp.getBandId().toString(), 
                        match != null ? match.getId() : null, match != null ? match.getName() : null));
            }
        }

        return ApiResponse.success(report, "Integrity report generated successfully");
    }

    @PostMapping("/remap")
    @org.springframework.transaction.annotation.Transactional
    public ApiResponse<Void> manualRemap(@RequestBody RemapRequest request) {
        EmployeeTwin emp = employeeTwinRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new IllegalArgumentException("Employee not found"));

        setField(emp, request.getFieldName(), request.getTargetId());
        employeeTwinRepository.save(emp);

        return ApiResponse.success(null, "Employee field " + request.getFieldName() + " successfully remapped");
    }

    @PostMapping("/auto-repair")
    @org.springframework.transaction.annotation.Transactional
    public ApiResponse<Void> autoRepair() {
        ApiResponse<List<DnaOrphanRecord>> reportResponse = getIntegrityReport();
        List<DnaOrphanRecord> orphans = reportResponse.getData();

        for (DnaOrphanRecord orphan : orphans) {
            if (orphan.getSuggestedMatchId() != null) {
                EmployeeTwin emp = employeeTwinRepository.findById(orphan.getEmployeeId())
                        .orElseThrow(() -> new IllegalArgumentException("Employee not found"));
                setField(emp, orphan.getFieldName(), orphan.getSuggestedMatchId());
                employeeTwinRepository.save(emp);
            }
        }

        return ApiResponse.success(null, "Auto repaired " + orphans.size() + " orphan references successfully");
    }

    @PostMapping("/bulk-repair")
    @org.springframework.transaction.annotation.Transactional
    public ApiResponse<Void> bulkRepair(@RequestBody BulkRemapRequest request) {
        if (request.getRepairs() != null) {
            for (RemapRequest repair : request.getRepairs()) {
                EmployeeTwin emp = employeeTwinRepository.findById(repair.getEmployeeId())
                        .orElseThrow(() -> new IllegalArgumentException("Employee not found"));
                setField(emp, repair.getFieldName(), repair.getTargetId());
                employeeTwinRepository.save(emp);
            }
        }
        return ApiResponse.success(null, "Bulk remapped all selected orphan references successfully");
    }

    private void setField(EmployeeTwin emp, String fieldName, UUID targetId) {
        switch (fieldName) {
            case "organizationId":
                emp.setOrganizationId(targetId);
                break;
            case "businessUnitId":
                emp.setBusinessUnitId(targetId);
                break;
            case "divisionId":
                emp.setDivisionId(targetId);
                break;
            case "departmentId":
                emp.setDepartmentId(targetId);
                break;
            case "subDepartmentId":
            case "teamId":
                emp.setSubDepartmentId(targetId);
                break;
            case "locationId":
                emp.setLocationId(targetId);
                break;
            case "designationId":
                emp.setDesignationId(targetId);
                break;
            case "gradeId":
                emp.setGradeId(targetId);
                break;
            case "bandId":
                emp.setBandId(targetId);
                break;
            default:
                throw new IllegalArgumentException("Invalid DNA field name: " + fieldName);
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RemapRequest {
        private UUID employeeId;
        private String fieldName;
        private UUID targetId;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BulkRemapRequest {
        private List<RemapRequest> repairs;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DnaOrphanRecord {
        private UUID employeeId;
        private String employeeCode;
        private String employeeName;
        private String fieldName;
        private String invalidId;
        private UUID suggestedMatchId;
        private String suggestedMatchName;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DnaAnalyticsReport {
        private long totalEmployees;
        private long employeesWithValidDna;
        private long employeesWithInvalidDna;
        private double dnaIntegrityPercentage;
        private long totalDnaNodes;
        private Map<String, Long> dnaNodesByType;
        private List<DepartmentBreakdown> departmentBreakdown;
        private List<LocationBreakdown> locationBreakdown;
        private List<String> orphanBusinessUnitEmployees;
        private List<String> orphanDepartmentEmployees;
        private List<String> orphanTeamEmployees;
        private List<String> orphanOrganizationEmployees;
        private Map<String, String> organizationNames;
        private Map<String, String> businessUnitNames;
        private Map<String, String> divisionNames;
        private Map<String, String> departmentNames;
        private Map<String, String> teamNames;
        private Map<String, String> locationNames;
        private Map<String, String> designationNames;
        private Map<String, String> gradeNames;
        private Map<String, String> bandNames;

        @Data
        @NoArgsConstructor
        @AllArgsConstructor
        public static class DepartmentBreakdown {
            private String departmentName;
            private long employeeCount;
            private double percentage;
        }

        @Data
        @NoArgsConstructor
        @AllArgsConstructor
        public static class LocationBreakdown {
            private String locationName;
            private long employeeCount;
            private double percentage;
        }
    }
}
