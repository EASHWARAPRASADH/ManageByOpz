package com.managemyopz.leave.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "leave_policy_rules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LeavePolicyRule extends BaseEntity {

    @Column(name = "policy_id", nullable = false)
    private UUID policyId;

    @Column(name = "leave_type_id", nullable = false)
    private UUID leaveTypeId;

    @Column(name = "allocated_days", nullable = false)
    private double allocatedDays;

    @Column(name = "accrual_method", nullable = false)
    private String accrualMethod; // E.g., "YEARLY", "MONTHLY"

    @Column(name = "carry_forward_limit", nullable = false)
    private double carryForwardLimit;

    @Column(name = "encashment_allowed", nullable = false)
    private boolean encashmentAllowed = false;

    @Column(name = "negative_balance_allowed", nullable = false)
    private boolean negativeBalanceAllowed = false;

    @Column(name = "sandwich_enabled", nullable = false)
    private boolean sandwichEnabled = false;

    @Column(name = "prefix_enabled", nullable = false)
    private boolean prefixEnabled = false;

    @Column(name = "suffix_enabled", nullable = false)
    private boolean suffixEnabled = false;

    @Column(name = "probation_restricted", nullable = false)
    private boolean probationRestricted = false;

    @Column(name = "notice_period_restricted", nullable = false)
    private boolean noticePeriodRestricted = false;

    @Column(name = "max_consecutive_days")
    private Double maxConsecutiveDays;

    @Column(name = "min_days_notice")
    private Integer minDaysNotice;

    @Column(name = "notice_period")
    private Integer noticePeriod;

    @Column(name = "min_service_days")
    private Integer minServiceDays;

    @Column(name = "attachment_required", nullable = false)
    private boolean attachmentRequired = false;

    @Column(name = "half_day_allowed", nullable = false)
    private boolean halfDayAllowed = false;

    @Column(name = "gender_eligibility")
    private String genderEligibility = "ALL";

    @Column(name = "employment_type_eligibility")
    private String employmentTypeEligibility = "ALL";
}
