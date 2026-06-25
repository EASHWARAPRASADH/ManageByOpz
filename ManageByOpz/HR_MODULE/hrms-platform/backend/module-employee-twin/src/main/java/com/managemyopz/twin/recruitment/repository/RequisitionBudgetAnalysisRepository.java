package com.managemyopz.twin.recruitment.repository;

import com.managemyopz.twin.recruitment.entity.RequisitionBudgetAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RequisitionBudgetAnalysisRepository extends JpaRepository<RequisitionBudgetAnalysis, UUID> {
    Optional<RequisitionBudgetAnalysis> findByRequisitionIdAndTenantIdAndDeletedFalse(UUID requisitionId, String tenantId);
}
