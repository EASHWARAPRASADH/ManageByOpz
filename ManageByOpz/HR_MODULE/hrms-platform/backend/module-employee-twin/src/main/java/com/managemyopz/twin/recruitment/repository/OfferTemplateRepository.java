package com.managemyopz.twin.recruitment.repository;

import com.managemyopz.twin.recruitment.entity.OfferTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OfferTemplateRepository extends JpaRepository<OfferTemplate, UUID> {
    List<OfferTemplate> findByTenantIdAndDeletedFalse(String tenantId);
    Optional<OfferTemplate> findByIdAndTenantIdAndDeletedFalse(UUID id, String tenantId);
    Optional<OfferTemplate> findByTenantIdAndTemplateTypeAndDeletedFalse(String tenantId, String templateType);
}
