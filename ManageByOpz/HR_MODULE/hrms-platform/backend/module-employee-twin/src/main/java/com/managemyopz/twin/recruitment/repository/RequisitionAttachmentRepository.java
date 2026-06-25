package com.managemyopz.twin.recruitment.repository;

import com.managemyopz.twin.recruitment.entity.RequisitionAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface RequisitionAttachmentRepository extends JpaRepository<RequisitionAttachment, UUID> {
    List<RequisitionAttachment> findByRequisitionIdAndTenantIdAndDeletedFalse(UUID requisitionId, String tenantId);
}
