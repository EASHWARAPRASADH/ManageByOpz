package com.managemyopz.audit.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

/**
 * AuditLog — Immutable audit trail record.
 *
 * Captures every significant action across all modules with:
 * - Before/After JSON snapshots for change tracking
 * - Full user, role, tenant, and IP context
 * - Module and entity identification for filtering
 *
 * This table is append-only. Records are NEVER updated or deleted.
 */
@Entity @Table(name = "audit_log", indexes = {
    @Index(name = "idx_audit_tenant", columnList = "tenant_id"),
    @Index(name = "idx_audit_entity", columnList = "entity_type, entity_id"),
    @Index(name = "idx_audit_user", columnList = "performed_by"),
    @Index(name = "idx_audit_action", columnList = "action"),
    @Index(name = "idx_audit_timestamp", columnList = "performed_at")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AuditLog extends BaseEntity {

    @Column(name = "module_code", nullable = false)
    private String moduleCode;

    @Column(name = "entity_type", nullable = false)
    private String entityType;

    @Column(name = "entity_id")
    private String entityId;

    @Column(name = "action", nullable = false)
    @Enumerated(EnumType.STRING)
    private AuditAction action;

    @Column(name = "before_json", columnDefinition = "JSON")
    private String beforeJson;

    @Column(name = "after_json", columnDefinition = "JSON")
    private String afterJson;

    @Column(name = "change_summary", columnDefinition = "TEXT")
    private String changeSummary;

    @Column(name = "performed_by", nullable = false)
    private String performedBy;

    @Column(name = "performed_by_role")
    private String performedByRole;

    @Column(name = "performed_at", nullable = false)
    private Instant performedAt;

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "user_agent")
    private String userAgent;

    @Column(name = "correlation_id")
    private String correlationId;

    public enum AuditAction {
        CREATE, UPDATE, DELETE, APPROVE, REJECT, LOGIN, LOGOUT, EXPORT, IMPORT, VIEW, DOWNLOAD,
        LOGIN_SUCCESS, LOGIN_FAILED, USER_CREATED, ACCOUNT_ACTIVATED, PASSWORD_RESET,
        PASSWORD_CHANGED, ACCOUNT_LOCKED, ACCOUNT_UNLOCKED, ROLE_CHANGED,
        ACCOUNT_DISABLED, ACCOUNT_ENABLED
    }
}
