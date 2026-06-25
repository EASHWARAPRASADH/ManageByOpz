package com.managemyopz.recognition.repository;

import com.managemyopz.recognition.entity.AwardNomination;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface AwardNominationRepository extends JpaRepository<AwardNomination, UUID> {
    List<AwardNomination> findByProgramId(UUID programId);
    List<AwardNomination> findByNomineeEmployeeId(UUID nomineeEmployeeId);
}
