package com.managemyopz.leave.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "comp_off_wallets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CompOffWallet extends BaseEntity {

    @Column(name = "employee_id", nullable = false)
    private UUID employeeId;

    @Column(name = "available_days", nullable = false)
    private double availableDays = 0.0;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;
}
