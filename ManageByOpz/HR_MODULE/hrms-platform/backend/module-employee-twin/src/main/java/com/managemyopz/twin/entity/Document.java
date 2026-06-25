package com.managemyopz.twin.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Document extends BaseEntity {

    @Column(name = "entity_type", nullable = false)
    private String entityType;

    @Column(name = "entity_id", nullable = false)
    private UUID entityId;

    @Column(name = "document_category", nullable = false)
    private String documentCategory;

    @Column(name = "current_version_id")
    private UUID currentVersionId;

    @Column(name = "status", nullable = false)
    @Builder.Default
    private String status = "ACTIVE";

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "current_version_id", referencedColumnName = "id", insertable = false, updatable = false)
    private DocumentVersion currentVersion;
}
