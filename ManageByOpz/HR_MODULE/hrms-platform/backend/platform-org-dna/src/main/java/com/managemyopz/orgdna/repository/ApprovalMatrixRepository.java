package com.managemyopz.orgdna.repository;

import com.managemyopz.orgdna.entity.ApprovalMatrix;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ApprovalMatrixRepository extends JpaRepository<ApprovalMatrix, UUID> {

    List<ApprovalMatrix> findByTenantIdAndDeletedFalse(String tenantId);

    Optional<ApprovalMatrix> findByIdAndDeletedFalse(UUID id);

    @Query("SELECT am FROM ApprovalMatrix am WHERE am.tenantId = :tenantId AND am.deleted = false " +
           "AND (:departmentId IS NULL OR am.departmentId = :departmentId) " +
           "AND (:designationId IS NULL OR am.designationId = :designationId) " +
           "AND (:gradeId IS NULL OR am.gradeId = :gradeId) " +
           "AND am.approvalType = :approvalType")
    List<ApprovalMatrix> findMatchingRules(
        @Param("tenantId") String tenantId,
        @Param("departmentId") UUID departmentId,
        @Param("designationId") UUID designationId,
        @Param("gradeId") UUID gradeId,
        @Param("approvalType") String approvalType
    );

    long countByDepartmentIdAndDeletedFalse(UUID departmentId);
    long countByDesignationIdAndDeletedFalse(UUID designationId);
    long countByGradeIdAndDeletedFalse(UUID gradeId);
}
