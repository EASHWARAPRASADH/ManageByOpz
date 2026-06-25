package com.managemyopz.twin.recruitment.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "recruitment_field_groups")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FormSection extends BaseEntity {

    @Column(name = "form_id", nullable = false)
    private UUID formId;

    @Column(name = "section_name", nullable = false)
    private String sectionName;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder;
}
