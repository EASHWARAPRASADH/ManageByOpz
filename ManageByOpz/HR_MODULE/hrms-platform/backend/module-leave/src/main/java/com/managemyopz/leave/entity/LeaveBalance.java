package com.managemyopz.leave.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity @Table(name = "leave_balances")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class LeaveBalance extends BaseEntity {
    @Column(name = "employee_id", nullable = false) private UUID employeeId;
    @Column(name = "leave_type_id", nullable = false) private UUID leaveTypeId;
    @Column(name = "year", nullable = false) private int year;
    @Column(name = "total_allocated") private double totalAllocated;
    @Column(name = "total_used") private double totalUsed;
    @Column(name = "total_pending") private double totalPending;
    @Column(name = "carried_forward") private double carriedForward;
    @Column(name = "balance") private double balance;
}
