package com.managemyopz.twin.recruitment.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity(name = "TwinNotificationTemplate")
@Table(name = "notification_template")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class NotificationTemplate extends BaseEntity {

    @Column(name = "template_name", nullable = false)
    private String templateName;

    @Column(name = "event_type", nullable = false)
    private String eventType;

    @Column(name = "channel", nullable = false)
    private String channel;

    @Column(name = "subject")
    private String subject;

    @Column(name = "content", columnDefinition = "TEXT", nullable = false)
    private String content;
}
