package com.managemyopz.ticketing.event;

import com.managemyopz.shared.event.DomainEvent;
import java.util.UUID;

public class TicketingDomainEvent extends DomainEvent {

    public TicketingDomainEvent(String eventType, String tenantId, String triggeredBy,
                                 Long aggregateId, String aggregateType) {
        super(eventType, tenantId, triggeredBy, new UUID(0L, aggregateId != null ? aggregateId : 0L), aggregateType);
    }
}
