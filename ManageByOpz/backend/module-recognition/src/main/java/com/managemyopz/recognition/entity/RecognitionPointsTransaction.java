package com.managemyopz.recognition.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "recognition_points_transactions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RecognitionPointsTransaction extends BaseEntity {
    @Column(name = "wallet_id", nullable = false)
    private UUID walletId;

    @Column(name = "employee_id", nullable = false)
    private UUID employeeId;

    @Column(name = "transaction_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private TransactionType transactionType;

    @Column(name = "points", nullable = false)
    private int points;

    @Column(name = "reason")
    private String reason;

    @Column(name = "reference_id")
    private UUID referenceId;

    public enum TransactionType { ALLOCATION, REWARD_REDEMPTION, RECOGNITION_GIVEN, RECOGNITION_RECEIVED, EXPIRATION, MANUAL_ADJUSTMENT }
}
