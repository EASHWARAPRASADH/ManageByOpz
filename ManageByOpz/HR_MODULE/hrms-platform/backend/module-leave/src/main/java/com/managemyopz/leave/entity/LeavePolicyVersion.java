package com.managemyopz.leave.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "leave_policy_versions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeavePolicyVersion extends BaseEntity {

    @Column(name = "policy_id", nullable = false)
    private UUID policyId;

    @Column(name = "version_number", nullable = false)
    private Integer versionNumber;

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

    @Column(name = "status")
    private String status;

    @Column(name = "organization_scope")
    private String organizationScope;

    @Column(name = "changed_fields", columnDefinition = "TEXT")
    private String changedFields;

    @Column(name = "policy_data_json", columnDefinition = "LONGTEXT")
    private String policyDataJson;
}
