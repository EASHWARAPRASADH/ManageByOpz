package com.managemyopz.twin.recruitment.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "interview_type")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InterviewType extends BaseEntity {

    @Column(name = "type_name", nullable = false)
    private String typeName;

    @Column(name = "active", nullable = false)
    private Boolean active = true;
}
