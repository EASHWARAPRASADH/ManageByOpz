package com.managemyopz.twin.recruitment.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "notification_rule")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class NotificationRule extends BaseEntity {

    @Column(name = "rule_name", nullable = false)
    private String ruleName;

    @Column(name = "event_type", nullable = false)
    private String eventType;

    @Column(name = "notification_template_id", nullable = false)
    private UUID notificationTemplateId;

    @Column(name = "active", nullable = false)
    private Boolean active = true;
}
