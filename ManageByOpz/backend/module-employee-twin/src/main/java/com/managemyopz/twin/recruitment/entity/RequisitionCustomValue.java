package com.managemyopz.twin.recruitment.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "requisition_custom_values")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RequisitionCustomValue extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requisition_id", nullable = false)
    @JsonIgnore
    private Requisition requisition;

    @Column(name = "field_key", nullable = false)
    private String fieldKey;

    @Column(name = "field_value", columnDefinition = "TEXT")
    private String fieldValue;
}
