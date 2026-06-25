package com.managemyopz.workflow.repository;

import com.managemyopz.workflow.entity.WorkflowInstance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WorkflowInstanceRepository extends JpaRepository<WorkflowInstance, UUID> {
    Optional<WorkflowInstance> findByEntityTypeAndEntityIdAndDeletedFalse(String entityType, UUID entityId);
}
