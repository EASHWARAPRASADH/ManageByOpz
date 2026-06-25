package com.managemyopz.orgdna.repository;

import com.managemyopz.orgdna.entity.CostCenter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CostCenterRepository extends JpaRepository<CostCenter, UUID> {
    List<CostCenter> findByOrganizationId(UUID organizationId);
    List<CostCenter> findByOrganizationIdAndDeletedFalse(UUID organizationId);
    Optional<CostCenter> findByIdAndDeletedFalse(UUID id);
    boolean existsByOrganizationIdAndNameAndDeletedFalse(UUID organizationId, String name);
    boolean existsByOrganizationIdAndCodeAndDeletedFalse(UUID organizationId, String code);
    boolean existsByOrganizationIdAndNameIgnoreCaseAndDeletedFalse(UUID organizationId, String name);
    boolean existsByOrganizationIdAndCodeIgnoreCaseAndDeletedFalse(UUID organizationId, String code);
}
