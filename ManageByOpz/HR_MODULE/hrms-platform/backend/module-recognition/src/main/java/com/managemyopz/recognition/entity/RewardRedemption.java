package com.managemyopz.recognition.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "reward_redemptions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RewardRedemption extends BaseEntity {
    @Column(name = "employee_id", nullable = false)
    private UUID employeeId;

    @Column(name = "reward_id", nullable = false)
    private UUID rewardId;

    @Column(name = "points_used", nullable = false)
    private int pointsUsed;

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private RedemptionStatus status = RedemptionStatus.PENDING;

    @Column(name = "delivery_details", columnDefinition = "TEXT")
    private String deliveryDetails;

    @Column(name = "tracking_number")
    private String trackingNumber;

    public enum RedemptionStatus { PENDING, APPROVED, FULFILLED, DELIVERED, REJECTED }
}
