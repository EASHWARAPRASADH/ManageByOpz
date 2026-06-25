package com.managemyopz.twin.recruitment.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "recruitment_field_definitions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FieldDefinition extends BaseEntity {

    @Column(name = "form_id", nullable = false)
    private UUID formId;

    @Column(name = "group_id")
    private UUID groupId;

    @Column(name = "field_key", nullable = false)
    private String fieldKey;

    @Column(name = "field_label", nullable = false)
    private String fieldLabel;

    @Column(name = "field_type", nullable = false)
    private String fieldType;

    @Column(name = "required", nullable = false)
    private Boolean required = false;

    @Column(name = "visible", nullable = false)
    private Boolean visible = true;

    @Column(name = "read_only", nullable = false)
    private Boolean readOnly = false;

    @Column(name = "default_value")
    private String defaultValue;

    @Column(name = "validation_json", columnDefinition = "TEXT")
    private String validationJson;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder;
}
