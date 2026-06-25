package com.managemyopz.orgdna.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

/**
 * Organization — Root aggregate for the Organization DNA platform.
 * Every tenant has exactly one Organization record. All organizational
 * structure elements (BU, Division, Department, etc.) are children of this entity.
 */
@Entity
@Table(name = "organizations")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class Organization extends BaseEntity {

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "code", nullable = false, unique = true)
    private String code;

    @Column(name = "legal_name")
    private String legalName;

    @Column(name = "registration_number")
    private String registrationNumber;

    @Column(name = "tax_id")
    private String taxId;

    @Column(name = "industry")
    private String industry;

    @Column(name = "website")
    private String website;

    @Column(name = "logo_url")
    private String logoUrl;

    @Column(name = "primary_email")
    private String primaryEmail;

    @Column(name = "primary_phone")
    private String primaryPhone;

    @Column(name = "address", columnDefinition = "TEXT")
    private String address;

    @Column(name = "country")
    private String country;

    @Column(name = "currency")
    private String currency;

    @Column(name = "timezone")
    private String timezone;

    @Column(name = "date_format")
    private String dateFormat;

    @Column(name = "fiscal_year_start")
    private Integer fiscalYearStart; // Month (1-12)

    @Column(name = "email_domain")
    private String emailDomain;

    @Column(name = "employee_code_template")
    private String employeeCodeTemplate;

    @Column(name = "employee_code_prefix")
    private String employeeCodePrefix;

    @Column(name = "sequence_length")
    private Integer sequenceLength = 6;

    @Column(name = "starting_sequence_number")
    private Integer startingSequenceNumber = 1;

    @Column(name = "employee_code_pattern")
    private String employeeCodePattern = "{ORG}-{SEQ:6}";

    @Column(name = "weekend_policy")
    private String weekendPolicy = "Saturday + Sunday";

    @Column(name = "active", nullable = false)
    private boolean active = true;

    @OneToMany(mappedBy = "organization", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonManagedReference("org-bus")
    private List<BusinessUnit> businessUnits = new ArrayList<>();

    @OneToMany(mappedBy = "organization", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonManagedReference("org-locs")
    private List<Location> locations = new ArrayList<>();

    @OneToMany(mappedBy = "organization", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonManagedReference("org-grades")
    private List<Grade> grades = new ArrayList<>();

    @OneToMany(mappedBy = "organization", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonManagedReference("org-bands")
    private List<Band> bands = new ArrayList<>();

    @OneToMany(mappedBy = "organization", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonManagedReference("org-desigs")
    private List<Designation> designations = new ArrayList<>();

    @OneToMany(mappedBy = "organization", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonManagedReference("org-ccs")
    private List<CostCenter> costCenters = new ArrayList<>();

    @OneToMany(mappedBy = "organization", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonManagedReference("org-employment-types")
    private List<EmploymentType> employmentTypes = new ArrayList<>();
}
