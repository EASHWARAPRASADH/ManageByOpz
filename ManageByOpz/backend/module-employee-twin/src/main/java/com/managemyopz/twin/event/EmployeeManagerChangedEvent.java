package com.managemyopz.twin.event;

import com.managemyopz.shared.event.DomainEvent;
import lombok.Getter;
import java.time.LocalDate;
import java.util.UUID;

@Getter
public class EmployeeManagerChangedEvent extends DomainEvent {

    private final UUID oldManagerId;
    private final UUID newManagerId;
    private final LocalDate effectiveDate;
    private final String reason;

    public EmployeeManagerChangedEvent(String tenantId, String triggeredBy, UUID employeeId,
                                       UUID oldManagerId, UUID newManagerId, LocalDate effectiveDate, String reason) {
        super("EMPLOYEE_MANAGER_CHANGED", tenantId, triggeredBy, employeeId, "EmployeeTwin");
        this.oldManagerId = oldManagerId;
        this.newManagerId = newManagerId;
        this.effectiveDate = effectiveDate;
        this.reason = reason;
    }
}
