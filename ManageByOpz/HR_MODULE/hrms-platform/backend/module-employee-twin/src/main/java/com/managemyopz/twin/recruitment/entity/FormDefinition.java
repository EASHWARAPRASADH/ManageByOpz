package com.managemyopz.twin.recruitment.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "form_definition")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FormDefinition extends BaseEntity {

    @Column(name = "module_name", nullable = false)
    private String moduleName;

    @Column(name = "form_name", nullable = false)
    private String formName;

    @Column(name = "status")
    private String status = "ACTIVE";
}
