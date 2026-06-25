package com.managemyopz.twin.recruitment.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "requisition_activity_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RequisitionActivityLog extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requisition_id", nullable = false)
    @JsonIgnore
    private Requisition requisition;

    @Column(name = "activity_type", nullable = false)
    private String activityType; // CREATE, EDIT, SUBMIT, APPROVE, REJECT, COMMENT_ADDED, ATTACHMENT_UPLOADED

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "ip_address")
    private String ipAddress;
}
