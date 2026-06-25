package com.managemyopz.recognition.repository;

import com.managemyopz.recognition.entity.RecognitionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RecognitionTypeRepository extends JpaRepository<RecognitionType, UUID> {
    List<RecognitionType> findByStatus(String status);
    Optional<RecognitionType> findByCode(String code);
    Optional<RecognitionType> findByCodeAndTenantId(String code, String tenantId);
}
