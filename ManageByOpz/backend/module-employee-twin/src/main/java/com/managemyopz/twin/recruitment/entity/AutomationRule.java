package com.managemyopz.twin.recruitment.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "automation_rule")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AutomationRule extends BaseEntity {

    @Column(name = "rule_name", nullable = false)
    private String ruleName;

    @Column(name = "trigger_event", nullable = false)
    private String triggerEvent;

    @Column(name = "active", nullable = false)
    private Boolean active = true;
}
