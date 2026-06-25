package com.managemyopz.orgdna.repository;

import com.managemyopz.orgdna.entity.Location;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LocationRepository extends JpaRepository<Location, UUID> {
    List<Location> findByOrganizationId(UUID organizationId);
    List<Location> findByOrganizationIdAndDeletedFalse(UUID organizationId);
    Optional<Location> findByIdAndDeletedFalse(UUID id);
    boolean existsByOrganizationIdAndNameAndDeletedFalse(UUID organizationId, String name);
    boolean existsByOrganizationIdAndCodeAndDeletedFalse(UUID organizationId, String code);
    boolean existsByOrganizationIdAndNameIgnoreCaseAndDeletedFalse(UUID organizationId, String name);
    boolean existsByOrganizationIdAndCodeIgnoreCaseAndDeletedFalse(UUID organizationId, String code);
}
