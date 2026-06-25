package com.managemyopz.notification.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

/**
 * NotificationTemplate — Reusable templates for notifications.
 * Supports variable substitution: {{employeeName}}, {{leaveType}}, etc.
 */
@Entity @Table(name = "notification_templates")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class NotificationTemplate extends BaseEntity {

    @Column(name = "code", nullable = false, unique = true)
    private String code;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "channel", nullable = false)
    @Enumerated(EnumType.STRING)
    private Notification.NotificationChannel channel;

    @Column(name = "subject_template")
    private String subjectTemplate;

    @Column(name = "body_template", columnDefinition = "TEXT", nullable = false)
    private String bodyTemplate;

    @Column(name = "module_code")
    private String moduleCode;

    @Column(name = "active", nullable = false)
    private boolean active = true;
}
