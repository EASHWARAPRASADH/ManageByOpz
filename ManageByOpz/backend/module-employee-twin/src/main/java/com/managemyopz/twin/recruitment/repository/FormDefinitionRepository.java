package com.managemyopz.twin.recruitment.repository;

import com.managemyopz.twin.recruitment.entity.FormDefinition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FormDefinitionRepository extends JpaRepository<FormDefinition, UUID> {
    List<FormDefinition> findByTenantIdAndDeletedFalse(String tenantId);
    Optional<FormDefinition> findByIdAndTenantIdAndDeletedFalse(UUID id, String tenantId);
    Optional<FormDefinition> findByTenantIdAndModuleNameAndFormNameAndDeletedFalse(String tenantId, String moduleName, String formName);
}
