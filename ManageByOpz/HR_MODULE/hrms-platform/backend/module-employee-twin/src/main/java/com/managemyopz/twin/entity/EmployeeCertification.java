package com.managemyopz.twin.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity @Table(name = "employee_certifications")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class EmployeeCertification extends BaseEntity {
    @Column(name = "certification_name", nullable = false) private String certificationName;
    @Column(name = "issuing_authority") private String issuingAuthority;
    @Column(name = "credential_id") private String credentialId;
    @Column(name = "issue_date") private LocalDate issueDate;
    @Column(name = "expiry_date") private LocalDate expiryDate;
    @Column(name = "credential_url") private String credentialUrl;
    @Column(name = "verified") private boolean verified = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_twin_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private EmployeeTwin employeeTwin;
}
