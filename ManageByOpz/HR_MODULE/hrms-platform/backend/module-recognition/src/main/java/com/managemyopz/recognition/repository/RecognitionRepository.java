package com.managemyopz.recognition.repository;

import com.managemyopz.recognition.entity.Recognition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface RecognitionRepository extends JpaRepository<Recognition, UUID> {
    List<Recognition> findByReceiverEmployeeIdOrderByCreatedAtDesc(UUID receiverEmployeeId);
    List<Recognition> findByGiverEmployeeIdOrderByCreatedAtDesc(UUID giverEmployeeId);
    List<Recognition> findByApprovedTrueOrderByCreatedAtDesc();
}
