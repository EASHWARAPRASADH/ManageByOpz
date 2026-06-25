package com.managemyopz.twin.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "employee_photos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EmployeePhoto extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_twin_id", nullable = false, unique = true)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private EmployeeTwin employeeTwin;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "original_name", nullable = false)
    private String originalName;

    @Column(name = "mime_type", nullable = false)
    private String mimeType;

    @Column(name = "file_size", nullable = false)
    private Long fileSize;

    @Column(name = "uploaded_by", nullable = false)
    private String uploadedBy;

    @Column(name = "uploaded_at", nullable = false)
    private Instant uploadedAt = Instant.now();

    @Column(name = "checksum", nullable = false)
    private String checksum;

    @Column(name = "storage_path", nullable = false)
    private String storagePath;

    @Column(name = "thumbnail_path")
    private String thumbnailPath;
}
