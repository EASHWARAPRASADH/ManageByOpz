package com.managemyopz.twin.recruitment.repository;

import com.managemyopz.twin.recruitment.entity.WorkflowStep;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository("recruitmentWorkflowStepRepository")
public interface WorkflowStepRepository extends JpaRepository<WorkflowStep, UUID> {
    List<WorkflowStep> findByTenantIdAndWorkflowDefinitionIdAndDeletedFalseOrderByStepOrderAsc(String tenantId, UUID workflowDefinitionId);
    Optional<WorkflowStep> findByIdAndTenantIdAndDeletedFalse(UUID id, String tenantId);
}
