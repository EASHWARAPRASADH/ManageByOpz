package com.managemyopz.twin.event;

import com.managemyopz.shared.event.DomainEvent;
import lombok.Getter;
import java.util.UUID;

@Getter
public class EmployeeCreatedEvent extends DomainEvent {

    private final String employeeCode;
    private final String workEmail;
    private final String fullName;

    public EmployeeCreatedEvent(String tenantId, String triggeredBy, UUID employeeId, 
                                String employeeCode, String workEmail, String fullName) {
        super("EMPLOYEE_CREATED", tenantId, triggeredBy, employeeId, "EmployeeTwin");
        this.employeeCode = employeeCode;
        this.workEmail = workEmail;
        this.fullName = fullName;
    }
}
