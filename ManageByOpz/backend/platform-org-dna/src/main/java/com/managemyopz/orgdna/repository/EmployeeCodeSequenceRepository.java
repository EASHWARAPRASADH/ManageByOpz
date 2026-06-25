package com.managemyopz.orgdna.repository;

import com.managemyopz.orgdna.entity.EmployeeCodeSequence;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmployeeCodeSequenceRepository extends JpaRepository<EmployeeCodeSequence, UUID> {
    Optional<EmployeeCodeSequence> findByOrganizationId(UUID organizationId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM EmployeeCodeSequence s WHERE s.organizationId = :orgId")
    Optional<EmployeeCodeSequence> findByOrganizationIdForUpdate(@Param("orgId") UUID orgId);
}
