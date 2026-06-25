package com.managemyopz.recognition.repository;

import com.managemyopz.recognition.entity.RecognitionValue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RecognitionValueRepository extends JpaRepository<RecognitionValue, UUID> {
    List<RecognitionValue> findByStatus(String status);
    Optional<RecognitionValue> findByCode(String code);
    Optional<RecognitionValue> findByCodeAndTenantId(String code, String tenantId);
}
