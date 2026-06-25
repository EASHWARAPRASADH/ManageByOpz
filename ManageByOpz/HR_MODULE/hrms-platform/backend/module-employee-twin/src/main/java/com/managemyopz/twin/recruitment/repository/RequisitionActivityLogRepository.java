package com.managemyopz.twin.recruitment.repository;

import com.managemyopz.twin.recruitment.entity.RequisitionActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface RequisitionActivityLogRepository extends JpaRepository<RequisitionActivityLog, UUID> {
    List<RequisitionActivityLog> findByRequisitionIdAndTenantIdAndDeletedFalseOrderByCreatedAtDesc(UUID requisitionId, String tenantId);
}
