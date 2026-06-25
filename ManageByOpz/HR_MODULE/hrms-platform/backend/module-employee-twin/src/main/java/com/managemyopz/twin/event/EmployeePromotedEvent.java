package com.managemyopz.twin.event;

import com.managemyopz.shared.event.DomainEvent;
import lombok.Getter;
import java.util.UUID;

@Getter
public class EmployeePromotedEvent extends DomainEvent {

    private final UUID oldDesignationId;
    private final UUID newDesignationId;
    private final UUID oldGradeId;
    private final UUID newGradeId;

    public EmployeePromotedEvent(String tenantId, String triggeredBy, UUID employeeId,
                                 UUID oldDesignationId, UUID newDesignationId,
                                 UUID oldGradeId, UUID newGradeId) {
        super("EMPLOYEE_PROMOTED", tenantId, triggeredBy, employeeId, "EmployeeTwin");
        this.oldDesignationId = oldDesignationId;
        this.newDesignationId = newDesignationId;
        this.oldGradeId = oldGradeId;
        this.newGradeId = newGradeId;
    }
}
