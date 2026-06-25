package com.managemyopz.twin.recruitment.repository;

import com.managemyopz.twin.recruitment.entity.WorkflowDefinition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository("recruitmentWorkflowDefinitionRepository")
public interface WorkflowDefinitionRepository extends JpaRepository<WorkflowDefinition, UUID> {
    List<WorkflowDefinition> findByTenantIdAndDeletedFalse(String tenantId);
    Optional<WorkflowDefinition> findByIdAndTenantIdAndDeletedFalse(UUID id, String tenantId);
}
