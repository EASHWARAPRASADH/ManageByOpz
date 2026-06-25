package com.managemyopz.recognition.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "recognition_points_wallets")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RecognitionPointsWallet extends BaseEntity {
    @Column(name = "employee_id", nullable = false, unique = true)
    private UUID employeeId;

    @Column(name = "current_balance")
    @Builder.Default
    private int currentBalance = 0;

    @Column(name = "monthly_allocation")
    @Builder.Default
    private int monthlyAllocation = 100;

    @Column(name = "used")
    @Builder.Default
    private int used = 0;

    @Column(name = "remaining")
    @Builder.Default
    private int remaining = 100;

    @Column(name = "expired")
    @Builder.Default
    private int expired = 0;
}
