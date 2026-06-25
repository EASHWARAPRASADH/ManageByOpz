package com.managemyopz.twin.service;

import com.managemyopz.twin.entity.EmployeeTwin;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface EmployeeTwinService {

    EmployeeTwin createEmployee(EmployeeTwin employee, String triggeredBy);

    EmployeeTwin updateEmployee(UUID id, EmployeeTwin employeeDetails, String triggeredBy);

    EmployeeTwin transferEmployee(UUID id, UUID newDepartmentId, UUID newLocationId, String triggeredBy);

    EmployeeTwin promoteEmployee(UUID id, UUID newDesignationId, UUID newGradeId, String triggeredBy);

    EmployeeTwin changeManager(UUID id, UUID newManagerId, String triggeredBy);

    EmployeeTwin terminateEmployee(UUID id, LocalDate exitDate, String reason, String triggeredBy);

    void deleteEmployee(UUID id, String triggeredBy);

    EmployeeTwin archiveEmployee(UUID id, String reason, String triggeredBy);

    EmployeeTwin restoreEmployee(UUID id, String triggeredBy);

    void bulkArchive(List<UUID> ids, String reason, String triggeredBy);

    void bulkReassignManager(List<UUID> ids, UUID managerId, LocalDate effectiveDate, String reason, String triggeredBy);

    void bulkTerminate(List<UUID> ids, LocalDate terminationDate, LocalDate finalWorkingDay, String reason, String triggeredBy);

    EmployeeTwin getById(UUID id);

    List<EmployeeTwin> getAllActive();

    List<EmployeeTwin> getAll(boolean showArchived);

    int calculateProfileCompletion(UUID id);

    String previewNextEmployeeCode(UUID organizationId, UUID businessUnitId);

    boolean validateCodeUniqueness(String code);

    void reserveCode(UUID organizationId, String code);
}
