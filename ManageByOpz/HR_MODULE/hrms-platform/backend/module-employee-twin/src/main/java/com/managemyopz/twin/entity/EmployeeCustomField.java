package com.managemyopz.twin.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

/**
 * EmployeeCustomField — EAV (Entity-Attribute-Value) pattern for unlimited extensibility.
 * Allows organizations to add custom fields without schema changes.
 */
@Entity @Table(name = "employee_custom_fields")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class EmployeeCustomField extends BaseEntity {
    @Column(name = "field_key", nullable = false) private String fieldKey;
    @Column(name = "field_value", columnDefinition = "TEXT") private String fieldValue;
    @Column(name = "field_type") private String fieldType; // STRING, NUMBER, DATE, BOOLEAN, JSON
    @Column(name = "field_group") private String fieldGroup; // Grouping for UI display
    @Column(name = "display_order") private int displayOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_twin_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private EmployeeTwin employeeTwin;
}
