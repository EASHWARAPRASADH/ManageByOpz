package com.managemyopz.twin.recruitment.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "recruitment_field_options")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FieldOption extends BaseEntity {

    @Column(name = "field_definition_id", nullable = false)
    private UUID fieldDefinitionId;

    @Column(name = "option_label", nullable = false)
    private String optionLabel;

    @Column(name = "option_value", nullable = false)
    private String optionValue;

    @Column(name = "option_order", nullable = false)
    private Integer optionOrder;
}
