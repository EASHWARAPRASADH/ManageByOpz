package com.managemyopz.twin.recruitment.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "manpower_requisitions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Requisition extends BaseEntity {

    @Column(name = "req_number", nullable = false, unique = true)
    private String reqNumber;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "job_title")
    private String jobTitle;

    @Column(name = "department")
    private String department;

    @Column(name = "sub_department")
    private String subDepartment;

    @Column(name = "business_unit")
    private String businessUnit;

    @Column(name = "location")
    private String location;

    @Column(name = "reporting_manager")
    private String reportingManager;

    @Column(name = "designation")
    private String designation;

    @Column(name = "grade")
    private String grade;

    @Column(name = "band")
    private String band;

    @Column(name = "employment_type")
    private String employmentType;

    @Column(name = "work_mode")
    private String workMode;

    @Column(name = "vacancies", nullable = false)
    private Integer vacancies;

    @Column(name = "min_experience")
    private Integer minExperience;

    @Column(name = "max_experience")
    private Integer maxExperience;

    @Column(name = "budget")
    private BigDecimal budget;

    @Column(name = "min_budget")
    private BigDecimal minBudget;

    @Column(name = "max_budget")
    private BigDecimal maxBudget;

    @Column(name = "cost_center")
    private String costCenter;

    @Column(name = "required_skills", columnDefinition = "TEXT")
    private String requiredSkills;

    @Column(name = "preferred_skills", columnDefinition = "TEXT")
    private String preferredSkills;

    @Column(name = "certifications", columnDefinition = "TEXT")
    private String certifications;

    @Column(name = "languages")
    private String languages;

    @Column(name = "education")
    private String education;

    @Column(name = "hiring_reason", columnDefinition = "TEXT")
    private String hiringReason;

    @Column(name = "expected_joining_date")
    private LocalDate expectedJoiningDate;

    @Column(name = "priority")
    private String priority = "MEDIUM"; // LOW, MEDIUM, HIGH, CRITICAL

    @Column(name = "status")
    private String status = "DRAFT"; // DRAFT, PENDING_APPROVAL, APPROVED, REJECTED, ON_HOLD, CANCELLED

    @Column(name = "reason_for_hiring")
    private String reasonForHiring;

    @Column(name = "replacement_employee")
    private String replacementEmployee;

    @Column(name = "replacement_employee_id")
    private String replacementEmployeeId;

    @Column(name = "replacement_date")
    private LocalDate replacementDate;

    @Column(name = "business_justification", columnDefinition = "TEXT")
    private String businessJustification;

    @Column(name = "project_name")
    private String projectName;

    @Column(name = "expected_business_impact", columnDefinition = "TEXT")
    private String expectedBusinessImpact;

    @Column(name = "revenue_impact")
    private String revenueImpact;

    @Column(name = "risk_not_filled", columnDefinition = "TEXT")
    private String riskNotFilled;

    @Column(name = "additional_notes", columnDefinition = "TEXT")
    private String additionalNotes;

    @OneToMany(mappedBy = "requisition", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RequisitionApproval> approvals = new ArrayList<>();
}
