package com.managemyopz.shared.event;

import lombok.Getter;
import java.util.UUID;

@Getter
public class WorkflowTransitionEvent extends DomainEvent {
    private final String entityType;
    private final UUID entityId;
    private final String status;
    private final int currentStepOrder;
    private final String actor;
    private final String action;
    private final String comments;

    public WorkflowTransitionEvent(String tenantId, String triggeredBy, UUID aggregateId,
                                   String entityType, UUID entityId, String status,
                                   int currentStepOrder, String actor, String action, String comments) {
        super("WORKFLOW_TRANSITION", tenantId, triggeredBy, aggregateId, "WorkflowInstance");
        this.entityType = entityType;
        this.entityId = entityId;
        this.status = status;
        this.currentStepOrder = currentStepOrder;
        this.actor = actor;
        this.action = action;
        this.comments = comments;
    }
}
