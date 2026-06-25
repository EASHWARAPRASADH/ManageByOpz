package com.managemyopz.orgdna.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "positions")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class Position extends BaseEntity {

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "department_id")
    private UUID departmentId;

    @Column(name = "grade_id")
    private UUID gradeId;

    @Column(name = "band_id")
    private UUID bandId;

    @Column(name = "location_id")
    private UUID locationId;

    @Column(name = "reports_to_position_id")
    private UUID reportsToPositionId;

    @Column(name = "status", nullable = false)
    private String status = "ACTIVE";

    @Column(name = "budgeted", nullable = false)
    private boolean budgeted = true;

    @Column(name = "vacant", nullable = false)
    private boolean vacant = true;

    @Column(name = "filled", nullable = false)
    private boolean filled = false;
}
