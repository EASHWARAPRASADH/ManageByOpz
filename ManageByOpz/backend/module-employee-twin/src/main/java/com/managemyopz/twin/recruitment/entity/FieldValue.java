package com.managemyopz.twin.recruitment.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "recruitment_field_values")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FieldValue extends BaseEntity {

    @Column(name = "entity_id", nullable = false)
    private UUID entityId;

    @Column(name = "entity_type", nullable = false)
    private String entityType;

    @Column(name = "field_definition_id", nullable = false)
    private UUID fieldDefinitionId;

    @Column(name = "field_value", columnDefinition = "TEXT")
    private String fieldValue;
}
