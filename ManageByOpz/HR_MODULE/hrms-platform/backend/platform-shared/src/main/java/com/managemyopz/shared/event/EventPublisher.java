package com.managemyopz.shared.event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

/**
 * EventPublisher — Centralized event publishing gateway.
 *
 * All modules use this to publish domain events instead of directly
 * using ApplicationEventPublisher. This provides a single point for:
 * - Logging all events
 * - Future: routing to Kafka instead of Spring Events
 * - Future: event store for event sourcing
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class EventPublisher {

    private final ApplicationEventPublisher applicationEventPublisher;

    /**
     * Publishes a domain event to all registered listeners.
     *
     * @param event The domain event to publish
     */
    public void publish(DomainEvent event) {
        log.info("Publishing event: type={}, aggregateId={}, tenantId={}, eventId={}",
                event.getEventType(),
                event.getAggregateId(),
                event.getTenantId(),
                event.getEventId());
        applicationEventPublisher.publishEvent(event);
    }
}
