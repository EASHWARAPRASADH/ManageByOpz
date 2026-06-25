package com.managemyopz.notification.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

/**
 * Notification — Represents a notification sent through any channel.
 *
 * Supports: EMAIL, SMS, WHATSAPP, IN_APP
 * Template-based rendering with variable substitution.
 * Event-driven: created by NotificationEventListener.
 */
@Entity @Table(name = "notifications")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Notification extends BaseEntity {

    @Column(name = "recipient_user_id")
    private String recipientUserId;

    @Column(name = "recipient_email")
    private String recipientEmail;

    @Column(name = "recipient_phone")
    private String recipientPhone;

    @Column(name = "channel", nullable = false)
    @Enumerated(EnumType.STRING)
    private NotificationChannel channel;

    @Column(name = "template_code")
    private String templateCode;

    @Column(name = "subject")
    private String subject;

    @Column(name = "body", columnDefinition = "TEXT", nullable = false)
    private String body;

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private NotificationStatus status = NotificationStatus.PENDING;

    @Column(name = "sent_at")
    private Instant sentAt;

    @Column(name = "read_at")
    private Instant readAt;

    @Column(name = "retry_count")
    private int retryCount = 0;

    @Column(name = "error_message")
    private String errorMessage;

    @Column(name = "module_code")
    private String moduleCode;

    @Column(name = "reference_type")
    private String referenceType;

    @Column(name = "reference_id")
    private String referenceId;

    public enum NotificationChannel {
        EMAIL, SMS, WHATSAPP, IN_APP, PUSH
    }

    public enum NotificationStatus {
        PENDING, SENT, DELIVERED, READ, FAILED, CANCELLED
    }
}
