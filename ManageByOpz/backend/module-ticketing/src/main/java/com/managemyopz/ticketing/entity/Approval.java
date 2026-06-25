package com.managemyopz.ticketing.entity;

import com.managemyopz.shared.entity.BaseLongEntity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name = "approvals")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Approval extends BaseLongEntity {
    
    @Column(name = "ticket_id",        nullable = false)    private Long ticketId;
    @Column(length = 20)                                    private String status = "Pending";
    @Column(name = "requested_by",     nullable = false, length = 128) private String requestedBy;
    @Column(name = "requested_by_name",length = 255)        private String requestedByName;
    @Column(name = "approved_by",      length = 128)        private String approvedBy;
    @Column(name = "approved_by_name", length = 255)        private String approvedByName;
    @Column(columnDefinition = "TEXT")                      private String comments;
            @Column(name = "approved_at")                           private LocalDateTime approvedAt;
}
