package com.managemyopz.twin.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

/**
 * EmployeeDocument — Document vault entry.
 * Supports versioning, expiry tracking, verification, and OCR readiness.
 * Actual file is stored in MinIO; this entity holds metadata.
 */
@Entity @Table(name = "employee_documents")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class EmployeeDocument extends BaseEntity {
    @Column(name = "document_type", nullable = false) private String documentType;
    @Column(name = "document_name", nullable = false) private String documentName;
    @Column(name = "file_path") private String filePath; // MinIO object path
    @Column(name = "file_size") private Long fileSize;
    @Column(name = "mime_type") private String mimeType;
    @Column(name = "version_number") private int versionNumber = 1;
    @Column(name = "expiry_date") private LocalDate expiryDate;
    @Column(name = "verification_status") @Enumerated(EnumType.STRING)
    private VerificationStatus verificationStatus = VerificationStatus.PENDING;
    @Column(name = "verified_by") private String verifiedBy;
    @Column(name = "ocr_extracted_text", columnDefinition = "TEXT") private String ocrExtractedText;
    @Column(name = "digital_signature") private String digitalSignature;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_twin_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private EmployeeTwin employeeTwin;

    public enum VerificationStatus { PENDING, VERIFIED, REJECTED, EXPIRED }
}
