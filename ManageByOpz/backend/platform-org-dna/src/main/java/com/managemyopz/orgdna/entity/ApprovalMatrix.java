package com.managemyopz.orgdna.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "approval_matrices")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class ApprovalMatrix extends BaseEntity {

    @Column(name = "organization_id")
    private UUID organizationId;

    @Column(name = "business_unit_id")
    private UUID businessUnitId;

    @Column(name = "division_id")
    private UUID divisionId;

    @Column(name = "department_id")
    private UUID departmentId;

    @Column(name = "team_id")
    private UUID teamId;

    @Column(name = "designation_id")
    private UUID designationId;

    @Column(name = "grade_id")
    private UUID gradeId;

    @Column(name = "band_id")
    private UUID bandId;

    @Column(name = "approval_type", nullable = false)
    private String approvalType;

    @Column(name = "approver_level1_id")
    private UUID approverLevel1Id;

    @Column(name = "approver_level1_type")
    private String approverLevel1Type;

    @Column(name = "approver_level2_id")
    private UUID approverLevel2Id;

    @Column(name = "approver_level2_type")
    private String approverLevel2Type;

    @Column(name = "approver_level3_id")
    private UUID approverLevel3Id;

    @Column(name = "approver_level3_type")
    private String approverLevel3Type;

    @Column(name = "approver_level4_id")
    private UUID approverLevel4Id;

    @Column(name = "approver_level4_type")
    private String approverLevel4Type;

    @Column(name = "location_id")
    private UUID locationId;

    @Column(name = "employment_type_id")
    private UUID employmentTypeId;

    @Column(name = "min_amount")
    private BigDecimal minAmount;

    @Column(name = "max_amount")
    private BigDecimal maxAmount;

    @Column(name = "effective_from")
    private java.time.LocalDate effectiveFrom;

    @Column(name = "effective_to")
    private java.time.LocalDate effectiveTo;

    @Column(name = "priority")
    private Integer priority = 0;

    @OneToMany(mappedBy = "approvalMatrix", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("levelNumber ASC")
    @com.fasterxml.jackson.annotation.JsonManagedReference
    private java.util.List<ApprovalMatrixLevel> levels = new java.util.ArrayList<>();

    @Column(name = "active", nullable = false)
    private boolean active = true;
}
