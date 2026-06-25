package com.managemyopz.orgdna.repository;

import com.managemyopz.orgdna.entity.Organization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrganizationRepository extends JpaRepository<Organization, UUID> {
    Optional<Organization> findByCode(String code);
    Optional<Organization> findByIdAndDeletedFalse(UUID id);
    List<Organization> findByDeletedFalse();
    boolean existsByNameAndDeletedFalse(String name);
    boolean existsByCodeAndDeletedFalse(String code);
    boolean existsByNameIgnoreCaseAndDeletedFalse(String name);
    boolean existsByCodeIgnoreCaseAndDeletedFalse(String code);
}
