package com.managemyopz.twin.recruitment.repository;

import com.managemyopz.twin.recruitment.entity.CandidateNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface CandidateNoteRepository extends JpaRepository<CandidateNote, UUID> {
    List<CandidateNote> findByCandidateIdAndTenantIdAndDeletedFalseOrderByCreatedAtDesc(UUID candidateId, String tenantId);
}
