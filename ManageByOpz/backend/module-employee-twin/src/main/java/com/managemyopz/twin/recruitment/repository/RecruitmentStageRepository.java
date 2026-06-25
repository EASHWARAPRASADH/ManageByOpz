package com.managemyopz.twin.recruitment.repository;

import com.managemyopz.twin.recruitment.entity.RecruitmentStage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RecruitmentStageRepository extends JpaRepository<RecruitmentStage, UUID> {
    List<RecruitmentStage> findByTenantIdAndDeletedFalseOrderByDisplayOrderAsc(String tenantId);
    Optional<RecruitmentStage> findByIdAndTenantIdAndDeletedFalse(UUID id, String tenantId);
}
