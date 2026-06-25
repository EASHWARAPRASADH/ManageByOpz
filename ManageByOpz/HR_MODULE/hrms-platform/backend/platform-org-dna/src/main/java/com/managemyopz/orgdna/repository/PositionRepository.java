package com.managemyopz.orgdna.repository;

import com.managemyopz.orgdna.entity.Position;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PositionRepository extends JpaRepository<Position, UUID> {
    List<Position> findByTenantIdAndDeletedFalse(String tenantId);
    Optional<Position> findByIdAndDeletedFalse(UUID id);
    long countByDepartmentIdAndDeletedFalse(UUID departmentId);
    long countByLocationIdAndDeletedFalse(UUID locationId);
    long countByGradeIdAndDeletedFalse(UUID gradeId);
    long countByBandIdAndDeletedFalse(UUID bandId);
}
