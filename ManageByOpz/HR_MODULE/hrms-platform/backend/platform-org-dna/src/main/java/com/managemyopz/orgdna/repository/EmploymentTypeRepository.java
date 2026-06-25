package com.managemyopz.orgdna.repository;

import com.managemyopz.orgdna.entity.EmploymentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmploymentTypeRepository extends JpaRepository<EmploymentType, UUID> {
    List<EmploymentType> findByOrganizationId(UUID organizationId);
    List<EmploymentType> findByOrganizationIdAndDeletedFalse(UUID organizationId);
    Optional<EmploymentType> findByIdAndDeletedFalse(UUID id);
    boolean existsByOrganizationIdAndNameAndDeletedFalse(UUID organizationId, String name);
    boolean existsByOrganizationIdAndCodeAndDeletedFalse(UUID organizationId, String code);
    boolean existsByOrganizationIdAndNameIgnoreCaseAndDeletedFalse(UUID organizationId, String name);
    boolean existsByOrganizationIdAndCodeIgnoreCaseAndDeletedFalse(UUID organizationId, String code);
}
