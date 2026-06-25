package com.managemyopz.twin.recruitment.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "automation_action")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AutomationAction extends BaseEntity {

    @Column(name = "automation_rule_id", nullable = false)
    private UUID automationRuleId;

    @Column(name = "action_type", nullable = false)
    private String actionType;

    @Column(name = "action_config", columnDefinition = "TEXT")
    private String actionConfig;
}
