package com.managemyopz.twin.event;

import com.managemyopz.shared.event.DomainEvent;
import lombok.Getter;
import java.util.UUID;

@Getter
public class EmployeeTransferredEvent extends DomainEvent {

    private final UUID oldDepartmentId;
    private final UUID newDepartmentId;
    private final UUID oldLocationId;
    private final UUID newLocationId;

    public EmployeeTransferredEvent(String tenantId, String triggeredBy, UUID employeeId,
                                    UUID oldDepartmentId, UUID newDepartmentId,
                                    UUID oldLocationId, UUID newLocationId) {
        super("EMPLOYEE_TRANSFERRED", tenantId, triggeredBy, employeeId, "EmployeeTwin");
        this.oldDepartmentId = oldDepartmentId;
        this.newDepartmentId = newDepartmentId;
        this.oldLocationId = oldLocationId;
        this.newLocationId = newLocationId;
    }
}
