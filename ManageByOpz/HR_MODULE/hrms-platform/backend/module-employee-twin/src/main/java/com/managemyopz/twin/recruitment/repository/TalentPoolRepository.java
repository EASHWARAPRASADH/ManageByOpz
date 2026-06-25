package com.managemyopz.twin.recruitment.repository;

import com.managemyopz.twin.recruitment.entity.TalentPool;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TalentPoolRepository extends JpaRepository<TalentPool, UUID> {
    List<TalentPool> findByTenantIdAndDeletedFalse(String tenantId);
    Optional<TalentPool> findByIdAndTenantIdAndDeletedFalse(UUID id, String tenantId);
}
