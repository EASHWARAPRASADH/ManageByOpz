package com.managemyopz.twin.recruitment.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "recruitment_source")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RecruitmentSource extends BaseEntity {

    @Column(name = "source_name", nullable = false)
    private String sourceName;

    @Column(name = "active", nullable = false)
    private Boolean active = true;
}
