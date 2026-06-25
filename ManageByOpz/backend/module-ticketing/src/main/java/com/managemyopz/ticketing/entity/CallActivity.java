package com.managemyopz.ticketing.entity;

import com.managemyopz.shared.entity.BaseLongEntity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "call_activities", indexes = {
    @Index(name = "idx_activity_call", columnList = "call_id")
})
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class CallActivity extends BaseLongEntity {

    

    @Column(name = "call_id", nullable = false)
    private Long callId;

    @Column(nullable = false)
    private String action;

    @Column(name = "user_id", nullable = false, length = 128)
    private String userId;

    @Column(name = "user_name")
    private String userName;

    @Column(columnDefinition = "TEXT")
    private String details;
    // createdAt inherited from BaseEntity
}
