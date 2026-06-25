package com.managemyopz.twin.recruitment.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "offer_approvals")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OfferApproval extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "offer_id", nullable = false)
    @JsonIgnore
    private Offer offer;

    @Column(name = "approver_id", nullable = false)
    private UUID approverId;

    @Column(name = "role_code")
    private String roleCode;

    @Column(name = "approval_status", nullable = false)
    private String approvalStatus = "PENDING"; // PENDING, APPROVED, REJECTED

    @Column(name = "comments", columnDefinition = "TEXT")
    private String comments;

    @Column(name = "step_number")
    private Integer stepNumber;
}
