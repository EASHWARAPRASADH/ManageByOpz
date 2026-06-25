package com.managemyopz.twin.recruitment.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "candidates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Candidate extends BaseEntity {

    @Column(name = "candidate_code", unique = true)
    private String candidateCode;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "email", nullable = false)
    private String email;

    @Column(name = "phone")
    private String phone;

    @Column(name = "location")
    private String location;

    @Column(name = "current_company")
    private String currentCompany;

    @Column(name = "current_designation")
    private String currentDesignation;

    @Column(name = "experience_years")
    private BigDecimal experienceYears;

    @Column(name = "current_salary")
    private BigDecimal currentSalary;

    @Column(name = "expected_salary")
    private BigDecimal expectedSalary;

    @Column(name = "notice_period_days")
    private Integer noticePeriodDays;

    @Column(name = "source")
    private String source;

    @Column(name = "skills", columnDefinition = "TEXT")
    private String skills;

    @Column(name = "resume_url")
    private String resumeUrl;

    @Column(name = "status")
    private String status = "APPLIED"; // APPLIED, SCREENING, SHORTLISTED, L1_INTERVIEW, L2_INTERVIEW, MANAGER_ROUND, HR_ROUND, OFFER, ACCEPTED, JOINED, REJECTED

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "job_posting_id")
    private JobPosting jobPosting;

    @OneToMany(mappedBy = "candidate", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CandidateDocument> documents = new ArrayList<>();

    @OneToMany(mappedBy = "candidate", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CandidateNote> notes = new ArrayList<>();

    @OneToMany(mappedBy = "candidate", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CandidateActivity> activities = new ArrayList<>();
}
