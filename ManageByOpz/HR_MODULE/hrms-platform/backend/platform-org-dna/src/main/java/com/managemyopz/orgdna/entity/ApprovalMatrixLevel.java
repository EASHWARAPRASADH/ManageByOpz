package com.managemyopz.orgdna.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "approval_matrix_levels")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ApprovalMatrixLevel extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "matrix_id", nullable = false)
    @JsonBackReference
    private ApprovalMatrix approvalMatrix;

    @Column(name = "level_number", nullable = false)
    private Integer levelNumber;

    @Column(name = "approver_type", nullable = false)
    private String approverType; // SPECIFIC_USER, REPORTING_MANAGER, SKIP_MANAGER, DEPARTMENT_HEAD, DIVISION_HEAD, BUSINESS_UNIT_HEAD, HRBP, ORGANIZATION_ADMIN, CEO

    @Column(name = "approver_employee_id")
    private UUID approverEmployeeId;

    @Column(name = "required", nullable = false)
    private boolean required = true;

    @Column(name = "allow_skip", nullable = false)
    private boolean allowSkip = false;
}
