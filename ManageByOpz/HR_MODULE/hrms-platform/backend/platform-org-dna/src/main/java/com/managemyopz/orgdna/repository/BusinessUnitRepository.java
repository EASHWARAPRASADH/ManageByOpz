package com.managemyopz.orgdna.repository;

import com.managemyopz.orgdna.entity.BusinessUnit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BusinessUnitRepository extends JpaRepository<BusinessUnit, UUID> {
    List<BusinessUnit> findByOrganizationId(UUID organizationId);
    List<BusinessUnit> findByOrganizationIdAndDeletedFalse(UUID organizationId);
    Optional<BusinessUnit> findByIdAndDeletedFalse(UUID id);
    boolean existsByOrganizationIdAndNameAndDeletedFalse(UUID organizationId, String name);
    boolean existsByOrganizationIdAndCodeAndDeletedFalse(UUID organizationId, String code);
    boolean existsByOrganizationIdAndNameIgnoreCaseAndDeletedFalse(UUID organizationId, String name);
    boolean existsByOrganizationIdAndCodeIgnoreCaseAndDeletedFalse(UUID organizationId, String code);
}
