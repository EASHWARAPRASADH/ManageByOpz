package com.managemyopz.leave.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity @Table(name = "leave_types")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class LeaveType extends BaseEntity {
    @Column(name = "name", nullable = false) private String name;
    @Column(name = "code", nullable = false) private String code;
    @Column(name = "description") private String description;
    @Column(name = "default_days") private double defaultDays;
    @Column(name = "carry_forward_allowed") private boolean carryForwardAllowed;
    @Column(name = "max_carry_forward_days") private double maxCarryForwardDays;
    @Column(name = "encashment_allowed") private boolean encashmentAllowed;
    @Column(name = "half_day_allowed") private boolean halfDayAllowed;
    @Column(name = "negative_balance_allowed") private boolean negativeBalanceAllowed;
    @Column(name = "requires_approval") private boolean requiresApproval = true;
    @Column(name = "requires_document") private boolean requiresDocument;
    @Column(name = "min_days_notice") private int minDaysNotice;
    @Column(name = "max_consecutive_days") private int maxConsecutiveDays;
    @Column(name = "active") private boolean active = true;
    @Column(name = "leave_policy_id") private UUID leavePolicyId;
    @Column(name = "category") private String category;
    @Column(name = "gender_eligibility") private String genderEligibility;
}
