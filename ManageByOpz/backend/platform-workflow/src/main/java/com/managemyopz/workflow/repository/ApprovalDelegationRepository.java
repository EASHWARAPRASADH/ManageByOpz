package com.managemyopz.workflow.repository;

import com.managemyopz.workflow.entity.ApprovalDelegation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface ApprovalDelegationRepository extends JpaRepository<ApprovalDelegation, UUID> {
    
    @Query("SELECT ad FROM ApprovalDelegation ad WHERE ad.fromEmployeeId = :fromEmployeeId " +
           "AND ad.active = true AND :date BETWEEN ad.startDate AND ad.endDate")
    List<ApprovalDelegation> findActiveDelegation(
        @Param("fromEmployeeId") UUID fromEmployeeId,
        @Param("date") LocalDate date
    );
}
