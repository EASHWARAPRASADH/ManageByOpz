package com.managemyopz.ticketing.entity;

import com.managemyopz.shared.entity.BaseLongEntity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity(name = "TicketingNotification")
@Table(name = "ticketing_notifications", indexes = {
    @Index(name = "idx_notif_user",    columnList = "user_id"),
    @Index(name = "idx_notif_is_read", columnList = "is_read")
})
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Notification extends BaseLongEntity {
    

    @Column(name = "user_id", nullable = false, length = 128)
    private String userId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(nullable = false, length = 50)
    private String type;

    @Column(name = "ticket_id", length = 128)
    private String ticketId;

    @Column(name = "is_read")
    private Boolean isRead = false;

    @Column(name = "read_at")
    private LocalDateTime readAt;
    // createdAt inherited from BaseEntity
}
