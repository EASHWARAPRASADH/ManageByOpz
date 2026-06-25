package com.managemyopz.twin.repository;

import com.managemyopz.twin.entity.EmployeeTwin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmployeeTwinRepository extends JpaRepository<EmployeeTwin, UUID> {

    Optional<EmployeeTwin> findByEmployeeCode(String employeeCode);

    Optional<EmployeeTwin> findByWorkEmail(String workEmail);

    @Query("SELECT e FROM EmployeeTwin e WHERE e.deleted = false AND e.tenantId = :tenantId")
    List<EmployeeTwin> findAllActiveByTenant(@Param("tenantId") String tenantId);

    @Query("SELECT e FROM EmployeeTwin e WHERE e.tenantId = :tenantId")
    List<EmployeeTwin> findAllByTenant(@Param("tenantId") String tenantId);

    @Query("SELECT COUNT(e) FROM EmployeeTwin e WHERE e.deleted = false AND e.tenantId = :tenantId")
    long countByTenant(@Param("tenantId") String tenantId);

    boolean existsByEmployeeCodeAndDeletedFalse(String employeeCode);

    @Query(value = "SELECT COUNT(*) FROM employee_twins WHERE employee_code = :employeeCode", nativeQuery = true)
    long existsByEmployeeCodeGlobal(@Param("employeeCode") String employeeCode);

    @Query(value = "SELECT COUNT(*) FROM employee_twins WHERE work_email = :workEmail", nativeQuery = true)
    long existsByWorkEmailGlobal(@Param("workEmail") String workEmail);
}
