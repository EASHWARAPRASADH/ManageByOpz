package com.managemyopz.twin.recruitment.repository;

import com.managemyopz.twin.recruitment.entity.FieldDefinition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FieldDefinitionRepository extends JpaRepository<FieldDefinition, UUID> {
    List<FieldDefinition> findByTenantIdAndFormIdAndDeletedFalseOrderByDisplayOrderAsc(String tenantId, UUID formId);
    Optional<FieldDefinition> findByIdAndTenantIdAndDeletedFalse(UUID id, String tenantId);
}
