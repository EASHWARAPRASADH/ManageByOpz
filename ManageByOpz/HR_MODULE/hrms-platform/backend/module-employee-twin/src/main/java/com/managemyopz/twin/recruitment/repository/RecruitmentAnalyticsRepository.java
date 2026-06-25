package com.managemyopz.twin.recruitment.repository;

import com.managemyopz.twin.recruitment.entity.RecruitmentAnalytics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface RecruitmentAnalyticsRepository extends JpaRepository<RecruitmentAnalytics, UUID> {
    List<RecruitmentAnalytics> findByTenantIdAndDeletedFalse(String tenantId);
}
