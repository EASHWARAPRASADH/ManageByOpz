package com.managemyopz.security.event;

import com.managemyopz.shared.event.DomainEvent;
import lombok.Getter;

import java.util.UUID;

@Getter
public class SecurityDomainEvent extends DomainEvent {

    private final Object details;

    public SecurityDomainEvent(String eventType, String tenantId, String triggeredBy,
                               UUID aggregateId, String aggregateType, Object details) {
        super(eventType, tenantId, triggeredBy, aggregateId, aggregateType);
        this.details = details;
    }
}
