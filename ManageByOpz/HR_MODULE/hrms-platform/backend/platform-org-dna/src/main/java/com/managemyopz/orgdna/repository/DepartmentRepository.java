package com.managemyopz.orgdna.repository;

import com.managemyopz.orgdna.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, UUID> {
    List<Department> findByDivisionId(UUID divisionId);
    List<Department> findByDivisionIdAndDeletedFalse(UUID divisionId);
    Optional<Department> findByIdAndDeletedFalse(UUID id);
    boolean existsByDivisionIdAndNameAndDeletedFalse(UUID divisionId, String name);
    boolean existsByDivisionIdAndCodeAndDeletedFalse(UUID divisionId, String code);
    boolean existsByDivisionIdAndNameIgnoreCaseAndDeletedFalse(UUID divisionId, String name);
    boolean existsByDivisionIdAndCodeIgnoreCaseAndDeletedFalse(UUID divisionId, String code);
    long countByDivisionIdAndDeletedFalse(UUID divisionId);
}
