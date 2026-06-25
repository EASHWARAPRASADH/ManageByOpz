package com.managemyopz.leave.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "leave_policy_assignments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LeavePolicyAssignment extends BaseEntity {

    @Column(name = "policy_id", nullable = false)
    private UUID policyId;

    @Column(name = "organization_id")
    private UUID organizationId;

    @Column(name = "business_unit_id")
    private UUID businessUnitId;

    @Column(name = "department_id")
    private UUID departmentId;

    @Column(name = "grade_id")
    private UUID gradeId;

    @Column(name = "band_id")
    private UUID bandId;

    @Column(name = "employment_type_id")
    private UUID employmentTypeId;
}
