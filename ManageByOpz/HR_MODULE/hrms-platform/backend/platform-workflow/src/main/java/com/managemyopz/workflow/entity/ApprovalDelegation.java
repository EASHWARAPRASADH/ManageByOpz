package com.managemyopz.workflow.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "approval_delegations")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ApprovalDelegation extends BaseEntity {

    @Column(name = "from_employee_id", nullable = false)
    private UUID fromEmployeeId;

    @Column(name = "to_employee_id", nullable = false)
    private UUID toEmployeeId;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "active", nullable = false)
    private boolean active = true;
}
