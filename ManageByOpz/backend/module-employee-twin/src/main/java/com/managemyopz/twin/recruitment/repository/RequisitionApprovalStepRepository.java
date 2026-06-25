package com.managemyopz.twin.recruitment.repository;

import com.managemyopz.twin.recruitment.entity.RequisitionApprovalStep;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface RequisitionApprovalStepRepository extends JpaRepository<RequisitionApprovalStep, UUID> {
    List<RequisitionApprovalStep> findByRequisitionIdAndTenantIdAndDeletedFalseOrderByStepOrderAsc(UUID requisitionId, String tenantId);
}
