package com.managemyopz.twin.recruitment.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "automation_condition")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AutomationCondition extends BaseEntity {

    @Column(name = "automation_rule_id", nullable = false)
    private UUID automationRuleId;

    @Column(name = "field_key", nullable = false)
    private String fieldKey;

    @Column(name = "operator", nullable = false)
    private String operator;

    @Column(name = "expected_value", nullable = false)
    private String expectedValue;
}
