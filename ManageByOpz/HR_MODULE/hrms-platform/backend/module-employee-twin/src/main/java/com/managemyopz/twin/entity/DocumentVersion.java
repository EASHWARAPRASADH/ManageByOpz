package com.managemyopz.twin.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "document_versions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentVersion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "document_id", nullable = false)
    private UUID documentId;

    @Column(name = "version_number", nullable = false)
    private Integer versionNumber;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "minio_object_key", nullable = false)
    private String minioObjectKey;

    @Column(name = "file_hash", nullable = false)
    private String fileHash;

    @Column(name = "file_size_bytes", nullable = false)
    private Long fileSizeBytes;

    @Column(name = "mime_type", nullable = false)
    private String mimeType;

    @Column(name = "uploaded_by", nullable = false)
    private String uploadedBy;

    @Column(name = "uploaded_at", nullable = false)
    @Builder.Default
    private Instant uploadedAt = Instant.now();

    @Column(name = "comments")
    private String comments;

    @Column(name = "previous_version_id")
    private UUID previousVersionId;
}
