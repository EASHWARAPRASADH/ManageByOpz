package com.managemyopz.orgdna.repository;

import com.managemyopz.orgdna.entity.Grade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface GradeRepository extends JpaRepository<Grade, UUID> {
    List<Grade> findByOrganizationId(UUID organizationId);
    List<Grade> findByOrganizationIdAndDeletedFalse(UUID organizationId);
    Optional<Grade> findByIdAndDeletedFalse(UUID id);
    boolean existsByOrganizationIdAndNameAndDeletedFalse(UUID organizationId, String name);
    boolean existsByOrganizationIdAndCodeAndDeletedFalse(UUID organizationId, String code);
    boolean existsByOrganizationIdAndNameIgnoreCaseAndDeletedFalse(UUID organizationId, String name);
    boolean existsByOrganizationIdAndCodeIgnoreCaseAndDeletedFalse(UUID organizationId, String code);
    boolean existsByOrganizationIdAndLevelAndDeletedFalse(UUID organizationId, Integer level);
}
