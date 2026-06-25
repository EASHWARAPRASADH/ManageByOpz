package com.managemyopz.twin.recruitment.repository;

import com.managemyopz.twin.recruitment.entity.RequisitionDraft;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RequisitionDraftRepository extends JpaRepository<RequisitionDraft, UUID> {
    Optional<RequisitionDraft> findByUserIdAndTenantIdAndDeletedFalse(String userId, String tenantId);
}
