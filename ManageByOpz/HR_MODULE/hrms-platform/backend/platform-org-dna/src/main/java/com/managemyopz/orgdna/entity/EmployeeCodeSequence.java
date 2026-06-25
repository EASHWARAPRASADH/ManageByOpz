package com.managemyopz.orgdna.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "employee_code_sequences")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class EmployeeCodeSequence extends BaseEntity {

    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;

    @Column(name = "prefix")
    private String prefix;

    @Column(name = "current_sequence", nullable = false)
    private int currentSequence = 0;

    @Column(name = "sequence_length", nullable = false)
    private int sequenceLength = 6;

    @Column(name = "pattern", nullable = false)
    private String pattern = "{ORG}-{SEQ:6}";
}
