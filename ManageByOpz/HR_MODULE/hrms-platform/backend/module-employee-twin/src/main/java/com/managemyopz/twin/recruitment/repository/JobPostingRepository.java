package com.managemyopz.twin.recruitment.repository;

import com.managemyopz.twin.recruitment.entity.JobPosting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JobPostingRepository extends JpaRepository<JobPosting, UUID> {
    List<JobPosting> findByTenantIdAndDeletedFalse(String tenantId);
    Optional<JobPosting> findByIdAndTenantIdAndDeletedFalse(UUID id, String tenantId);
    List<JobPosting> findByTenantIdAndStatusAndDeletedFalse(String tenantId, String status);
}
