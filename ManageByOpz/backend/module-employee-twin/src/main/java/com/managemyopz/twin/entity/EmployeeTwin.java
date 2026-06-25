package com.managemyopz.twin.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * EmployeeTwin — The Aggregate Root of the Employee Digital Twin.
 *
 * This is NOT a normal employee table. This is the enterprise master record
 * that serves as the single source of truth for all HR modules.
 *
 * Every HR module (Leave, Payroll, Performance, etc.) references this entity
 * rather than maintaining its own employee data.
 *
 * The Twin contains:
 * - Identity (name, DOB, gender, nationality)
 * - Contact (email, phone, address, emergency contacts)
 * - Employment DNA (org structure references)
 * - Compliance (PAN, Aadhaar, UAN, ESIC — encrypted)
 * - Banking (account details — encrypted)
 * - Extensions (skills, certifications, documents, relationships, timeline, custom fields)
 */
@Entity @Table(name = "employee_twins", indexes = {
    @Index(name = "idx_twin_employee_code", columnList = "employee_code"),
    @Index(name = "idx_twin_email", columnList = "work_email"),
    @Index(name = "idx_twin_department", columnList = "department_id"),
    @Index(name = "idx_twin_manager", columnList = "manager_id"),
    @Index(name = "idx_twin_status", columnList = "employment_status")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class EmployeeTwin extends BaseEntity {

    // ── Identity ──────────────────────────────────────────
    @Column(name = "employee_code", nullable = false, unique = true)
    private String employeeCode;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "middle_name")
    private String middleName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(name = "display_name")
    private String displayName;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "gender")
    private String gender;

    @Column(name = "nationality")
    private String nationality;

    @Column(name = "marital_status")
    private String maritalStatus;

    @Column(name = "blood_group")
    private String bloodGroup;

    @Column(name = "preferred_language")
    private String preferredLanguage;

    @Column(name = "avatar_url")
    private String avatarUrl;

    // ── Contact ──────────────────────────────────────────
    @Column(name = "work_email", nullable = false, unique = true)
    private String workEmail;

    @Column(name = "personal_email")
    private String personalEmail;

    @Column(name = "work_phone")
    private String workPhone;

    @Column(name = "personal_phone")
    private String personalPhone;

    @Column(name = "work_phone_country_code")
    private String workPhoneCountryCode;

    @Column(name = "work_phone_number")
    private String workPhoneNumber;

    @Column(name = "work_phone_full")
    private String workPhoneFull;

    @Column(name = "personal_phone_country_code")
    private String personalPhoneCountryCode;

    @Column(name = "personal_phone_number")
    private String personalPhoneNumber;

    @Column(name = "personal_phone_full")
    private String personalPhoneFull;

    @Column(name = "current_address", columnDefinition = "TEXT")
    private String currentAddress;

    @Column(name = "permanent_address", columnDefinition = "TEXT")
    private String permanentAddress;

    @Column(name = "emergency_contact_name")
    private String emergencyContactName;

    @Column(name = "emergency_contact_phone")
    private String emergencyContactPhone;

    @Column(name = "emergency_contact_relation")
    private String emergencyContactRelation;

    // ── Employment DNA (Org structure references) ──────────
    @Column(name = "organization_id")
    private UUID organizationId;

    @Column(name = "business_unit_id")
    private UUID businessUnitId;

    @Column(name = "division_id")
    private UUID divisionId;

    @Column(name = "department_id")
    private UUID departmentId;

    @Column(name = "sub_department_id")
    private UUID subDepartmentId;

    @Column(name = "designation_id")
    private UUID designationId;

    @Column(name = "location_id")
    private UUID locationId;

    @Column(name = "grade_id")
    private UUID gradeId;

    @Column(name = "band_id")
    private UUID bandId;

    @Column(name = "cost_center_id")
    private UUID costCenterId;

    @Column(name = "employment_type_id")
    private UUID employmentTypeId;

    @Column(name = "position_id")
    private UUID positionId;

    @Column(name = "manager_id")
    private UUID managerId; // Self-referencing to another EmployeeTwin

    @Column(name = "skip_manager_id")
    private UUID skipManagerId;

    @Column(name = "department_head_id")
    private UUID departmentHeadId;

    @Column(name = "hrbp_id")
    private UUID hrbpId;

    @Column(name = "mentor_id")
    private UUID mentorId;

    @Column(name = "buddy_id")
    private UUID buddyId;

    @Column(name = "date_of_joining")
    private LocalDate dateOfJoining;

    @Column(name = "confirmation_date")
    private LocalDate confirmationDate;

    @Column(name = "probation_end_date")
    private LocalDate probationEndDate;

    @Column(name = "notice_period_days")
    private Integer noticePeriodDays;

    @Column(name = "employment_status", nullable = false)
    @Enumerated(EnumType.STRING)
    private EmploymentStatus employmentStatus = EmploymentStatus.ACTIVE;

    @Column(name = "archive_reason")
    private String archiveReason;

    // ── Compliance (encrypted in production) ──────────────
    @Column(name = "pan_number")
    private String panNumber;

    @Column(name = "aadhaar_number")
    private String aadhaarNumber;

    @Column(name = "uan_number")
    private String uanNumber;

    @Column(name = "esic_number")
    private String esicNumber;

    @Column(name = "passport_number")
    private String passportNumber;

    @Column(name = "passport_expiry")
    private LocalDate passportExpiry;

    // ── Banking ──────────────────────────────────────────
    @Column(name = "bank_name")
    private String bankName;

    @Column(name = "bank_account_number")
    private String bankAccountNumber;

    @Column(name = "bank_ifsc")
    private String bankIfsc;

    @Column(name = "bank_branch")
    private String bankBranch;

    // ── Extensions ──────────────────────────────────────
    @OneToMany(mappedBy = "employeeTwin", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<EmployeeSkill> skills = new ArrayList<>();

    @OneToMany(mappedBy = "employeeTwin", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<EmployeeCertification> certifications = new ArrayList<>();

    @OneToMany(mappedBy = "employeeTwin", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<EmployeeDocument> documents = new ArrayList<>();

    @OneToMany(mappedBy = "employeeTwin", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<EmployeeRelationship> relationships = new ArrayList<>();

    @OneToMany(mappedBy = "employeeTwin", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("eventDate DESC")
    private List<EmployeeTimeline> timeline = new ArrayList<>();

    @OneToMany(mappedBy = "employeeTwin", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<EmployeeCustomField> customFields = new ArrayList<>();

    public enum EmploymentStatus {
        ACTIVE, ON_PROBATION, ON_NOTICE, ON_LEAVE, SUSPENDED, TERMINATED, RETIRED, ABSCONDED, ARCHIVED
    }

    // ── Convenience Methods ──────────────────────────────
    public String getFullName() {
        StringBuilder sb = new StringBuilder(firstName);
        if (middleName != null && !middleName.isBlank()) sb.append(" ").append(middleName);
        sb.append(" ").append(lastName);
        return sb.toString();
    }
}
