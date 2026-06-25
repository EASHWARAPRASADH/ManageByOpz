package com.managemyopz.twin.event;

import com.managemyopz.shared.event.DomainEvent;
import lombok.Getter;
import java.time.LocalDate;
import java.util.UUID;

@Getter
public class EmployeeTerminatedEvent extends DomainEvent {

    private final LocalDate exitDate;
    private final String reason;

    public EmployeeTerminatedEvent(String tenantId, String triggeredBy, UUID employeeId,
                                   LocalDate exitDate, String reason) {
        super("EMPLOYEE_TERMINATED", tenantId, triggeredBy, employeeId, "EmployeeTwin");
        this.exitDate = exitDate;
        this.reason = reason;
    }
}
