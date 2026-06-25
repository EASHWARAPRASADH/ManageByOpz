package com.managemyopz.twin.repository;

import com.managemyopz.twin.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DocumentRepository extends JpaRepository<Document, UUID> {

    @Query("SELECT d FROM Document d WHERE d.entityType = :entityType AND d.entityId = :entityId AND d.deleted = false")
    List<Document> findAllByEntityTypeAndEntityId(@Param("entityType") String entityType, @Param("entityId") UUID entityId);

    @Query("SELECT d FROM Document d WHERE d.entityType = :entityType AND d.entityId = :entityId AND d.documentCategory = :category AND d.deleted = false")
    Optional<Document> findByEntityTypeAndEntityIdAndCategory(@Param("entityType") String entityType, @Param("entityId") UUID entityId, @Param("category") String category);

    @Query("SELECT d FROM Document d WHERE d.deleted = false")
    List<Document> findAllActive();
}
