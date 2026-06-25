package com.managemyopz.shared.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.FilterDef;
import org.hibernate.annotations.ParamDef;

import java.time.Instant;

/**
 * BaseLongEntity — The foundation of every Long-identity entity in the platform.
 *
 * Provides:
 * - Long primary key (auto-increment)
 * - Multi-tenant isolation via tenantId
 * - Full audit trail (createdBy, updatedBy, timestamps)
 * - Optimistic locking via @Version
 * - Soft delete support
 *
 * The Hibernate filter ensures tenant isolation at the query level.
 */
@Getter
@Setter
@MappedSuperclass
@Filter(name = "tenantFilter", condition = "tenant_id = :tenantId")
public abstract class BaseLongEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false, nullable = false)
    private Long id;

    @Column(name = "tenant_id", nullable = false, updatable = false)
    private String tenantId;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_by")
    private String updatedBy;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @Version
    @Column(name = "version")
    private Long version;

    @Column(name = "deleted", nullable = false)
    private boolean deleted = false;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    @Column(name = "deleted_by")
    private String deletedBy;

    @Column(name = "effective_date")
    private Instant effectiveDate;

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
        if (this.effectiveDate == null) {
            this.effectiveDate = Instant.now();
        }
        if (this.tenantId == null) {
            this.tenantId = TenantContext.getCurrentTenant();
            if (this.tenantId == null || this.tenantId.isBlank()) {
                this.tenantId = "default";
            }
        }
        String currentUser = TenantContext.getCurrentUser();
        if (currentUser != null && this.createdBy == null) {
            this.createdBy = currentUser;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
        String currentUser = TenantContext.getCurrentUser();
        if (currentUser != null) {
            this.updatedBy = currentUser;
        }
    }

    /**
     * Soft delete — marks entity as deleted without physical removal.
     */
    public void softDelete(String deletedBy) {
        this.deleted = true;
        this.deletedAt = Instant.now();
        this.deletedBy = deletedBy;
    }

    public Boolean getArchived() {
        return this.deleted;
    }

    public void setArchived(Boolean archived) {
        this.deleted = archived != null && archived;
    }

    public Instant getArchivedAt() {
        return this.deletedAt;
    }

    public void setArchivedAt(Instant archivedAt) {
        this.deletedAt = archivedAt;
    }

    public String getArchivedBy() {
        return this.deletedBy;
    }

    public void setArchivedBy(String archivedBy) {
        this.deletedBy = archivedBy;
    }

    public void archive() {
        this.deleted = true;
        this.deletedAt = Instant.now();
        String currentUser = TenantContext.getCurrentUser();
        this.deletedBy = currentUser != null ? currentUser : "system";
        try {
            java.lang.reflect.Method setActive = this.getClass().getMethod("setActive", boolean.class);
            setActive.invoke(this, false);
        } catch (Exception e) {
            // ignore
        }
    }

    public void restore() {
        this.deleted = false;
        this.deletedAt = null;
        this.deletedBy = null;
        try {
            java.lang.reflect.Method setActive = this.getClass().getMethod("setActive", boolean.class);
            setActive.invoke(this, true);
        } catch (Exception e) {
            // ignore
        }
    }

    public void deactivate() {
        try {
            java.lang.reflect.Method setActive = this.getClass().getMethod("setActive", boolean.class);
            setActive.invoke(this, false);
        } catch (Exception e) {
            // ignore
        }
    }

    public void activate() {
        try {
            java.lang.reflect.Method setActive = this.getClass().getMethod("setActive", boolean.class);
            setActive.invoke(this, true);
        } catch (Exception e) {
            // ignore
        }
    }
}
