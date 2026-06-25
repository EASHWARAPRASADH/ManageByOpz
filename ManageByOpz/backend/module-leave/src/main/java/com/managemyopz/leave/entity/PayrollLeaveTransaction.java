package com.managemyopz.leave.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "payroll_leave_transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PayrollLeaveTransaction extends BaseEntity {

    @Column(name = "employee_id", nullable = false)
    private UUID employeeId;

    @Column(name = "leave_type", nullable = false)
    private String leaveType; // E.g., "APPROVED_LEAVE", "LOP", "ENCASHMENT"

    @Column(name = "days", nullable = false)
    private double days;

    @Column(name = "amount", nullable = false)
    private double amount = 0.0;

    @Column(name = "payroll_month", nullable = false)
    private String payrollMonth; // E.g., "2026-06"
}
