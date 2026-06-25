package com.managemyopz.twin.recruitment.repository;

import com.managemyopz.twin.recruitment.entity.RecruitmentSource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RecruitmentSourceRepository extends JpaRepository<RecruitmentSource, UUID> {
    List<RecruitmentSource> findByTenantIdAndDeletedFalse(String tenantId);
    Optional<RecruitmentSource> findByIdAndTenantIdAndDeletedFalse(UUID id, String tenantId);
}
