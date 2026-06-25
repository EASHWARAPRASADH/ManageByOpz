package com.managemyopz.twin.recruitment.repository;

import com.managemyopz.twin.recruitment.entity.InterviewType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InterviewTypeRepository extends JpaRepository<InterviewType, UUID> {
    List<InterviewType> findByTenantIdAndDeletedFalse(String tenantId);
    Optional<InterviewType> findByIdAndTenantIdAndDeletedFalse(UUID id, String tenantId);
}
