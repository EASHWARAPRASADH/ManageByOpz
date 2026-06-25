package com.managemyopz.leave.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "comp_off_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CompOffRequest extends BaseEntity {

    @Column(name = "employee_id", nullable = false)
    private UUID employeeId;

    @Column(name = "work_date", nullable = false)
    private LocalDate workDate;

    @Column(name = "hours_worked", nullable = false)
    private double hoursWorked;

    @Column(name = "reason", columnDefinition = "TEXT")
    private String reason;

    @Column(name = "status", nullable = false)
    private String status; // PENDING, APPROVED, REJECTED

    @Column(name = "approved_by")
    private String approvedBy;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;
}
