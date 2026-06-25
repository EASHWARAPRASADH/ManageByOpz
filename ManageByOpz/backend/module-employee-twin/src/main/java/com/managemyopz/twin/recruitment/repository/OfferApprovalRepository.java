package com.managemyopz.twin.recruitment.repository;

import com.managemyopz.twin.recruitment.entity.OfferApproval;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface OfferApprovalRepository extends JpaRepository<OfferApproval, UUID> {
    List<OfferApproval> findByOfferIdAndTenantIdAndDeletedFalseOrderByStepNumberAsc(UUID offerId, String tenantId);
}
