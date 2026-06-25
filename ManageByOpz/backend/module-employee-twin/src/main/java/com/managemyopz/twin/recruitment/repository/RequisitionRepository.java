package com.managemyopz.twin.recruitment.repository;

import com.managemyopz.twin.recruitment.entity.Requisition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RequisitionRepository extends JpaRepository<Requisition, UUID> {
    List<Requisition> findByTenantIdAndDeletedFalse(String tenantId);
    Optional<Requisition> findByIdAndTenantIdAndDeletedFalse(UUID id, String tenantId);
    Optional<Requisition> findByReqNumberAndTenantIdAndDeletedFalse(String reqNumber, String tenantId);
}
