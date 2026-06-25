package com.managemyopz.security.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

/**
 * User — Authentication entity for the RBAC platform.
 * Represents a login identity linked to an employee twin (if applicable).
 */
@Entity @Table(name = "users")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class User extends BaseEntity {

    @Column(name = "username", nullable = false, unique = true)
    private String username;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Column(name = "employee_id")
    private String employeeId; // Links to EmployeeTwin

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "active", nullable = false)
    private boolean active = true;

    @Column(name = "locked", nullable = false)
    private boolean locked = false;

    @Column(name = "email_verified", nullable = false)
    private boolean emailVerified = false;

    @Column(name = "last_login_at")
    private Instant lastLoginAt;

    @Column(name = "last_login_ip")
    private String lastLoginIp;

    @Column(name = "failed_login_attempts")
    private int failedLoginAttempts = 0;

    @Column(name = "status", nullable = false)
    private String status = "ACTIVE"; // PENDING_ACTIVATION, ACTIVE, LOCKED, DISABLED

    @Column(name = "password_change_required", nullable = false)
    private boolean passwordChangeRequired = false;

    @Column(name = "activated_at")
    private Instant activatedAt;

    @Column(name = "activation_token")
    private String activationToken;

    @Column(name = "activation_token_expiry")
    private Instant activationTokenExpiry;

    @Column(name = "reset_token")
    private String resetToken;

    @Column(name = "reset_token_expiry")
    private Instant resetTokenExpiry;

    @Column(name = "last_password_change_at")
    private Instant lastPasswordChangeAt;

    @Column(name = "activation_sent_at")
    private Instant activationSentAt;

    @Column(name = "account_locked", nullable = false)
    private boolean accountLocked = false;

    @Column(name = "account_locked_at")
    private Instant accountLockedAt;

    @Column(name = "password_expiry_at")
    private Instant passwordExpiryAt;

    @Column(name = "mfa_enabled", nullable = false)
    private boolean mfaEnabled = false;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "user_roles",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles = new HashSet<>();
}
