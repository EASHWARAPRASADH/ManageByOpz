package com.managemyopz.shared.event;

import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

/**
 * DomainEvent — Base class for all domain events in the platform.
 *
 * Every module publishes domain events through Spring's ApplicationEventPublisher.
 * Events carry metadata for:
 * - Correlation (eventId, correlationId)
 * - Multi-tenancy (tenantId)
 * - Audit trail (triggeredBy, occurredAt)
 * - Future Kafka readiness (eventType, version)
 *
 * All event listeners are idempotent — they check eventId to prevent duplicate processing.
 */
@Getter
public abstract class DomainEvent {

    private final UUID eventId;
    private final String eventType;
    private final int eventVersion;
    private final Instant occurredAt;
    private final String tenantId;
    private final String triggeredBy;
    private final UUID correlationId;
    private final UUID aggregateId;
    private final String aggregateType;

    protected DomainEvent(String eventType, String tenantId, String triggeredBy,
                          UUID aggregateId, String aggregateType) {
        this.eventId = UUID.randomUUID();
        this.eventType = eventType;
        this.eventVersion = 1;
        this.occurredAt = Instant.now();
        this.tenantId = tenantId;
        this.triggeredBy = triggeredBy;
        this.correlationId = UUID.randomUUID();
        this.aggregateId = aggregateId;
        this.aggregateType = aggregateType;
    }

    protected DomainEvent(String eventType, int eventVersion, String tenantId,
                          String triggeredBy, UUID aggregateId, String aggregateType,
                          UUID correlationId) {
        this.eventId = UUID.randomUUID();
        this.eventType = eventType;
        this.eventVersion = eventVersion;
        this.occurredAt = Instant.now();
        this.tenantId = tenantId;
        this.triggeredBy = triggeredBy;
        this.correlationId = correlationId;
        this.aggregateId = aggregateId;
        this.aggregateType = aggregateType;
    }
}
