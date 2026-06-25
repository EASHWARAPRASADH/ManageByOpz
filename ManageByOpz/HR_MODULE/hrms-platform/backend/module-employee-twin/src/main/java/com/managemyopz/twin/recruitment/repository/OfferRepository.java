package com.managemyopz.twin.recruitment.repository;

import com.managemyopz.twin.recruitment.entity.Offer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OfferRepository extends JpaRepository<Offer, UUID> {
    List<Offer> findByTenantIdAndDeletedFalse(String tenantId);
    Optional<Offer> findByIdAndTenantIdAndDeletedFalse(UUID id, String tenantId);
    Optional<Offer> findByCandidateIdAndTenantIdAndDeletedFalse(UUID candidateId, String tenantId);
}
