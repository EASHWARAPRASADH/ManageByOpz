package com.managemyopz.twin.recruitment.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "requisition_hiring_reasons")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RequisitionHiringReason extends BaseEntity {

    @Column(name = "reason_code", nullable = false)
    private String reasonCode;

    @Column(name = "reason_name", nullable = false)
    private String reasonName;

    @Column(name = "active", nullable = false)
    private Boolean active = true;
}
