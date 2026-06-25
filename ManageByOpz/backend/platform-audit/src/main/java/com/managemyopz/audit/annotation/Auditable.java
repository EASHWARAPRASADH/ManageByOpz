package com.managemyopz.audit.annotation;

import com.managemyopz.audit.entity.AuditLog.AuditAction;
import java.lang.annotation.*;

/**
 * @Auditable — Place on any service method to automatically generate audit trail entries.
 *
 * The AuditAspect intercepts methods annotated with this, captures before/after state,
 * and publishes an AuditEvent asynchronously.
 *
 * Usage: @Auditable(module = "leave", action = AuditAction.CREATE, entityType = "LeaveRequest")
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface Auditable {
    String module();
    AuditAction action();
    String entityType();
}
