package com.managemyopz.twin.recruitment.repository;

import com.managemyopz.twin.recruitment.entity.WorkflowAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WorkflowAssignmentRepository extends JpaRepository<WorkflowAssignment, UUID> {
    List<WorkflowAssignment> findByTenantIdAndDeletedFalse(String tenantId);
    Optional<WorkflowAssignment> findByIdAndTenantIdAndDeletedFalse(UUID id, String tenantId);
    Optional<WorkflowAssignment> findByTenantIdAndEntityIdAndEntityTypeAndDeletedFalse(String tenantId, UUID entityId, String entityType);
}
