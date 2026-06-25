package com.managemyopz.twin.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

/**
 * EmployeeRelationship — Graph-ready relationship edges.
 * Supports: Manager, Buddy, Mentor, Reviewer, HRBP, Project Manager.
 */
@Entity @Table(name = "employee_relationships")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class EmployeeRelationship extends BaseEntity {
    @Column(name = "relationship_type", nullable = false) @Enumerated(EnumType.STRING)
    private RelationshipType relationshipType;
    @Column(name = "related_employee_id", nullable = false) private UUID relatedEmployeeId;
    @Column(name = "effective_from") private java.time.LocalDate effectiveFrom;
    @Column(name = "effective_to") private java.time.LocalDate effectiveTo;
    @Column(name = "is_primary") private boolean primary = false;
    @Column(name = "notes") private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_twin_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private EmployeeTwin employeeTwin;

    public enum RelationshipType {
        MANAGER, BUDDY, MENTOR, REVIEWER, HRBP, PROJECT_MANAGER, DOTTED_LINE_MANAGER, SKIP_LEVEL_MANAGER
    }
}
