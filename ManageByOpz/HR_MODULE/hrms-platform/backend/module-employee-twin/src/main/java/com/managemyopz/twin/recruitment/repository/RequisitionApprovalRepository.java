package com.managemyopz.twin.recruitment.repository;

import com.managemyopz.twin.recruitment.entity.RequisitionApproval;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface RequisitionApprovalRepository extends JpaRepository<RequisitionApproval, UUID> {
    List<RequisitionApproval> findByRequisitionIdAndTenantIdAndDeletedFalseOrderByStepNumberAsc(UUID requisitionId, String tenantId);
}
