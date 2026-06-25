package com.managemyopz.twin.recruitment.repository;

import com.managemyopz.twin.recruitment.entity.RequisitionHiringReason;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RequisitionHiringReasonRepository extends JpaRepository<RequisitionHiringReason, UUID> {
    List<RequisitionHiringReason> findByTenantIdAndDeletedFalse(String tenantId);
    Optional<RequisitionHiringReason> findByIdAndTenantIdAndDeletedFalse(UUID id, String tenantId);
}
