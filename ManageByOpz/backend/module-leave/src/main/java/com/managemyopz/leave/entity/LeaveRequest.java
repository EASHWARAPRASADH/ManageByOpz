package com.managemyopz.leave.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.UUID;

/**
 * LeaveRequest — Core entity for the Leave Management module.
 * Integrates with Workflow Engine for approval and Notification for alerts.
 */
@Entity @Table(name = "leave_requests")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LeaveRequest extends BaseEntity {

    @Column(name = "employee_id", nullable = false) private UUID employeeId;
    @Column(name = "leave_type_id", nullable = false) private UUID leaveTypeId;
    @Column(name = "start_date", nullable = false) private LocalDate startDate;
    @Column(name = "end_date", nullable = false) private LocalDate endDate;
    @Column(name = "days_count", nullable = false) private double daysCount;
    @Column(name = "half_day") private boolean halfDay;
    @Column(name = "half_day_type") private String halfDayType; // FIRST_HALF, SECOND_HALF
    @Column(name = "reason", columnDefinition = "TEXT") private String reason;
    @Column(name = "status", nullable = false) @Enumerated(EnumType.STRING)
    private LeaveStatus status = LeaveStatus.PENDING;
    @Column(name = "approved_by") private String approvedBy;
    @Column(name = "rejection_reason") private String rejectionReason;
    @Column(name = "workflow_instance_id") private UUID workflowInstanceId;
    @Column(name = "cancellation_reason") private String cancellationReason;

    public enum LeaveStatus { DRAFT, PENDING, PENDING_L1, PENDING_L2, PENDING_L3, APPROVED, REJECTED, CANCELLED, AUTO_APPROVED }
}
