package com.managemyopz.audit.listener;

import com.managemyopz.audit.entity.AuditLog;
import com.managemyopz.audit.service.AuditService;
import com.managemyopz.shared.event.DomainEvent;
import com.managemyopz.shared.entity.TenantContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class AuditEventListener {

    private final AuditService auditService;

    @EventListener
    public void onDomainEvent(DomainEvent event) {
        log.info("Domain Event captured for auditing: eventType={}, aggregateType={}, aggregateId={}",
                event.getEventType(), event.getAggregateType(), event.getAggregateId());

        // Set tenant context for the async/current thread
        TenantContext.setCurrentTenant(event.getTenantId());
        TenantContext.setCurrentUser(event.getTriggeredBy());
        TenantContext.setCurrentRole("SYSTEM");

        AuditLog.AuditAction action = AuditLog.AuditAction.UPDATE;
        String eventType = event.getEventType();
        if (eventType != null) {
            if (eventType.contains("CREATED") || eventType.contains("CREATE")) {
                action = AuditLog.AuditAction.CREATE;
            } else if (eventType.contains("DELETED") || eventType.contains("DELETE")) {
                action = AuditLog.AuditAction.DELETE;
            }
        }

        String moduleCode = "EMPLOYEE_TWIN"; // Default module code for HR events
        if (eventType != null && eventType.startsWith("LEAVE")) {
            moduleCode = "LEAVE";
        }

        auditService.recordAudit(
                event.getTenantId(),
                moduleCode,
                event.getAggregateType(),
                event.getAggregateId() != null ? event.getAggregateId().toString() : null,
                action,
                null, // before snapshot (optional)
                event, // after snapshot (store the event itself as JSON)
                event.getCorrelationId() != null ? event.getCorrelationId().toString() : null,
                event.getTriggeredBy(),
                "SYSTEM"
        );
    }
}
