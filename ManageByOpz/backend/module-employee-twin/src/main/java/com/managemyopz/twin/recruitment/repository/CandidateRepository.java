package com.managemyopz.twin.recruitment.repository;

import com.managemyopz.twin.recruitment.entity.Candidate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CandidateRepository extends JpaRepository<Candidate, UUID> {
    List<Candidate> findByTenantIdAndDeletedFalse(String tenantId);
    Optional<Candidate> findByIdAndTenantIdAndDeletedFalse(UUID id, String tenantId);
    List<Candidate> findByTenantIdAndStatusAndDeletedFalse(String tenantId, String status);
}
