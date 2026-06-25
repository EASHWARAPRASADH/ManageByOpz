package com.managemyopz.recognition.repository;

import com.managemyopz.recognition.entity.RecognitionPointsTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface RecognitionPointsTransactionRepository extends JpaRepository<RecognitionPointsTransaction, UUID> {
    List<RecognitionPointsTransaction> findByEmployeeIdOrderByCreatedAtDesc(UUID employeeId);
}
