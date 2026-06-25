package com.managemyopz.security.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Entity @Table(name = "security_audit_log")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class SecurityAuditLog extends BaseEntity {

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "changed_by", nullable = false)
    private User changedBy;

    @Column(name = "target_type", nullable = false)
    private String targetType; // ROLE, USER, MODULE, PAGE, FIELD

    @Column(name = "target_id", nullable = false)
    private UUID targetId;

    @Column(name = "action_type", nullable = false)
    private String actionType; // ADD, REMOVE, UPDATE

    @Column(name = "old_value")
    private String oldValue;

    @Column(name = "new_value")
    private String newValue;

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "timestamp", insertable = false, updatable = false)
    private Instant timestamp;
}
