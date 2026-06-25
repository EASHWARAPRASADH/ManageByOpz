package com.managemyopz.recognition.repository;

import com.managemyopz.recognition.entity.AwardProgram;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface AwardProgramRepository extends JpaRepository<AwardProgram, UUID> {
    List<AwardProgram> findByActive(boolean active);
}
