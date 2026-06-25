package com.managemyopz.leave.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "leave_policies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LeavePolicy extends BaseEntity {

    @Column(name = "policy_name", nullable = false)
    private String policyName;

    @Column(name = "policy_code", nullable = false)
    private String policyCode;

    @Column(name = "description")
    private String description;

    @Column(name = "effective_from")
    private LocalDate effectiveFrom;

    @Column(name = "effective_to")
    private LocalDate effectiveTo;

    @Column(name = "active", nullable = false)
    private boolean active = true;

    @Column(name = "status")
    private String status = "ACTIVE";

    @Column(name = "organization_scope")
    private String organizationScope;
}
