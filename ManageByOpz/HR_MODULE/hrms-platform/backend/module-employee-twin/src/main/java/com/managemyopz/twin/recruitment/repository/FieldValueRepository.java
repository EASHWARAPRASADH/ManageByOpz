package com.managemyopz.twin.recruitment.repository;

import com.managemyopz.twin.recruitment.entity.FieldValue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FieldValueRepository extends JpaRepository<FieldValue, UUID> {
    List<FieldValue> findByTenantIdAndEntityIdAndEntityTypeAndDeletedFalse(String tenantId, UUID entityId, String entityType);
    Optional<FieldValue> findByIdAndTenantIdAndDeletedFalse(UUID id, String tenantId);
    Optional<FieldValue> findByTenantIdAndEntityIdAndEntityTypeAndFieldDefinitionIdAndDeletedFalse(String tenantId, UUID entityId, String entityType, UUID fieldDefinitionId);
}
