package com.managemyopz.ticketing.entity;

import com.managemyopz.shared.entity.BaseLongEntity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "call_notes", indexes = {
    @Index(name = "idx_note_call", columnList = "call_id")
})
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class CallNote extends BaseLongEntity {

    

    @Column(name = "call_id", nullable = false)
    private Long callId;

    @Column(name = "user_id", nullable = false, length = 128)
    private String userId;

    @Column(name = "user_name")
    private String userName;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;
    // createdAt inherited from BaseEntity
    // updatedAt inherited from BaseEntity
}
