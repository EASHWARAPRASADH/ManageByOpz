package com.managemyopz.twin.repository;

import com.managemyopz.twin.entity.EmployeePhoto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;
import java.util.UUID;

public interface EmployeePhotoRepository extends JpaRepository<EmployeePhoto, UUID> {
    @Query("SELECT ep FROM EmployeePhoto ep WHERE ep.employeeTwin.id = :employeeId AND ep.deleted = false")
    Optional<EmployeePhoto> findByEmployeeId(@Param("employeeId") UUID employeeId);
}
