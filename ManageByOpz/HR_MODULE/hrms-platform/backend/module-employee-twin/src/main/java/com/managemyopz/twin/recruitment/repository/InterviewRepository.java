package com.managemyopz.twin.recruitment.repository;

import com.managemyopz.twin.recruitment.entity.Interview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InterviewRepository extends JpaRepository<Interview, UUID> {
    List<Interview> findByTenantIdAndDeletedFalse(String tenantId);
    Optional<Interview> findByIdAndTenantIdAndDeletedFalse(UUID id, String tenantId);
    List<Interview> findByCandidateIdAndTenantIdAndDeletedFalse(UUID candidateId, String tenantId);
}
