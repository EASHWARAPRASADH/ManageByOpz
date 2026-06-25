package com.managemyopz.twin.recruitment.repository;

import com.managemyopz.twin.recruitment.entity.CandidateActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface CandidateActivityRepository extends JpaRepository<CandidateActivity, UUID> {
    List<CandidateActivity> findByCandidateIdAndTenantIdAndDeletedFalseOrderByCreatedAtDesc(UUID candidateId, String tenantId);
}
