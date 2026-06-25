package com.managemyopz.audit.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.managemyopz.audit.entity.AuditLog;
import com.managemyopz.audit.repository.AuditLogRepository;
import com.managemyopz.shared.entity.TenantContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

/**
 * AuditService — Core service for recording audit trail entries.
 *
 * Audit writes are:
 * - Asynchronous (don't block the main request)
 * - In a separate transaction (audit must succeed even if main tx fails)
 * - Idempotent (correlationId prevents duplicates)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;
    private final ObjectMapper objectMapper;

    @Async
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void recordAudit(String tenantId, String moduleCode, String entityType, String entityId,
                           AuditLog.AuditAction action, Object before, Object after,
                           String correlationId, String performedBy, String performedByRole) {
        try {
            AuditLog entry = AuditLog.builder()
                    .moduleCode(moduleCode)
                    .entityType(entityType)
                    .entityId(entityId)
                    .action(action)
                    .beforeJson(before != null ? objectMapper.writeValueAsString(before) : null)
                    .afterJson(after != null ? objectMapper.writeValueAsString(after) : null)
                    .performedBy(performedBy != null ? performedBy : "system")
                    .performedByRole(performedByRole != null ? performedByRole : "SYSTEM")
                    .performedAt(Instant.now())
                    .correlationId(correlationId)
                    .build();
            entry.setTenantId(tenantId != null ? tenantId : "default");
            entry.setCreatedBy(performedBy != null ? performedBy : "system");

            auditLogRepository.save(entry);
            log.debug("Audit recorded: module={}, action={}, entity={}#{}",
                    moduleCode, action, entityType, entityId);
        } catch (Exception e) {
            log.error("Failed to record audit entry", e);
        }
    }
}
