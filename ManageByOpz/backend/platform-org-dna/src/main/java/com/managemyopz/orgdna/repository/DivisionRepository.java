package com.managemyopz.orgdna.repository;

import com.managemyopz.orgdna.entity.Division;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DivisionRepository extends JpaRepository<Division, UUID> {
    List<Division> findByBusinessUnitId(UUID businessUnitId);
    List<Division> findByBusinessUnitIdAndDeletedFalse(UUID businessUnitId);
    Optional<Division> findByIdAndDeletedFalse(UUID id);
    boolean existsByBusinessUnitIdAndNameAndDeletedFalse(UUID businessUnitId, String name);
    boolean existsByBusinessUnitIdAndCodeAndDeletedFalse(UUID businessUnitId, String code);
    boolean existsByBusinessUnitIdAndNameIgnoreCaseAndDeletedFalse(UUID businessUnitId, String name);
    boolean existsByBusinessUnitIdAndCodeIgnoreCaseAndDeletedFalse(UUID businessUnitId, String code);
    long countByBusinessUnitIdAndDeletedFalse(UUID businessUnitId);
}
