package com.managemyopz.workflow.repository;

import com.managemyopz.workflow.entity.ApprovalTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface ApprovalTransactionRepository extends JpaRepository<ApprovalTransaction, UUID> {
    List<ApprovalTransaction> findByEntityTypeAndEntityIdOrderByActedAtAsc(String entityType, UUID entityId);
}
