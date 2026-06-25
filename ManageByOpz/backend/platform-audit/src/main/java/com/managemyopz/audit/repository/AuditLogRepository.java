package com.managemyopz.audit.repository;

import com.managemyopz.audit.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {

    Page<AuditLog> findByTenantIdAndModuleCodeOrderByPerformedAtDesc(
            String tenantId, String moduleCode, Pageable pageable);

    Page<AuditLog> findByTenantIdAndEntityTypeAndEntityIdOrderByPerformedAtDesc(
            String tenantId, String entityType, String entityId, Pageable pageable);

    Page<AuditLog> findByTenantIdOrderByPerformedAtDesc(String tenantId, Pageable pageable);
}
