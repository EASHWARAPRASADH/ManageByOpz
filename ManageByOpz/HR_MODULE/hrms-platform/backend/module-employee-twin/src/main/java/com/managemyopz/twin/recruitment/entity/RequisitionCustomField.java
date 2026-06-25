package com.managemyopz.twin.recruitment.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "requisition_custom_fields")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RequisitionCustomField extends BaseEntity {

    @Column(name = "field_key", nullable = false)
    private String fieldKey;

    @Column(name = "field_label", nullable = false)
    private String fieldLabel;

    @Column(name = "field_type", nullable = false)
    private String fieldType; // Text, Number, Dropdown, Date, Currency

    @Column(name = "required")
    private Boolean required = false;

    @Column(name = "display_order")
    private Integer displayOrder;
}
