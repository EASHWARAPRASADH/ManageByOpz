package com.managemyopz.leave.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "leave_policy_audits")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeavePolicyAudit extends BaseEntity {

    @Column(name = "policy_id", nullable = false)
    private UUID policyId;

    @Column(name = "action", nullable = false)
    private String action; // E.g., CREATED, MODIFIED, ACTIVATED, DEACTIVATED, ASSIGNED, UNASSIGNED

    @Column(name = "old_value", columnDefinition = "TEXT")
    private String oldValue;

    @Column(name = "new_value", columnDefinition = "TEXT")
    private String newValue;
}
