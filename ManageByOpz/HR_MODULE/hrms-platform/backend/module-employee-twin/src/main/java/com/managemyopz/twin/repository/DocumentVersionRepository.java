package com.managemyopz.twin.repository;

import com.managemyopz.twin.entity.DocumentVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DocumentVersionRepository extends JpaRepository<DocumentVersion, UUID> {

    @Query("SELECT v FROM DocumentVersion v WHERE v.documentId = :documentId ORDER BY v.versionNumber DESC")
    List<DocumentVersion> findAllByDocumentIdOrderByVersionNumberDesc(@Param("documentId") UUID documentId);

    @Query("SELECT v FROM DocumentVersion v WHERE v.documentId = :documentId AND v.versionNumber = :versionNumber")
    List<DocumentVersion> findByDocumentIdAndVersionNumber(@Param("documentId") UUID documentId, @Param("versionNumber") Integer versionNumber);
}
