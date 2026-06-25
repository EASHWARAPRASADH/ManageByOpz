package com.managemyopz.twin.repository;

import com.managemyopz.twin.entity.EmployeeDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EmployeeDocumentRepository extends JpaRepository<EmployeeDocument, UUID> {

    @Query("SELECT d FROM EmployeeDocument d WHERE d.employeeTwin.id = :employeeId AND d.deleted = false")
    List<EmployeeDocument> findAllByEmployeeId(@Param("employeeId") UUID employeeId);

    @Query("SELECT d FROM EmployeeDocument d WHERE d.employeeTwin.id = :employeeId AND d.documentType = :docType AND d.deleted = false")
    List<EmployeeDocument> findAllByEmployeeIdAndType(@Param("employeeId") UUID employeeId, @Param("docType") String docType);
}
