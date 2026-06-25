package com.managemyopz.workflow.repository;

import com.managemyopz.workflow.entity.WorkflowTransition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface WorkflowTransitionRepository extends JpaRepository<WorkflowTransition, UUID> {
}
