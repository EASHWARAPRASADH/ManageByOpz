package com.managemyopz.orgdna.repository;

import com.managemyopz.orgdna.entity.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;
import java.util.Optional;

@Repository
public interface TeamRepository extends JpaRepository<Team, UUID> {
    List<Team> findByDepartmentId(UUID departmentId);
    List<Team> findByDepartmentIdAndDeletedFalse(UUID departmentId);
    boolean existsByDepartmentIdAndNameAndDeletedFalse(UUID departmentId, String name);
    boolean existsByDepartmentIdAndCodeAndDeletedFalse(UUID departmentId, String code);
    boolean existsByDepartmentIdAndNameIgnoreCaseAndDeletedFalse(UUID departmentId, String name);
    boolean existsByDepartmentIdAndCodeIgnoreCaseAndDeletedFalse(UUID departmentId, String code);
    Optional<Team> findByIdAndDeletedFalse(UUID id);
    long countByDepartmentIdAndDeletedFalse(UUID departmentId);
}
