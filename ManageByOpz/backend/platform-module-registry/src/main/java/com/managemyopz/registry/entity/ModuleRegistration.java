package com.managemyopz.registry.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

/**
 * ModuleRegistration — Tracks every installed module in the platform.
 *
 * The Module Registry is the plug-in system backbone. Adding a new HR module
 * requires only: 1) Flyway migration, 2) ModuleRegistrar implementation.
 * The platform auto-discovers modules at startup.
 */
@Entity @Table(name = "module_registry")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ModuleRegistration extends BaseEntity {

    @Column(name = "module_code", nullable = false, unique = true)
    private String moduleCode;

    @Column(name = "module_name", nullable = false)
    private String moduleName;

    @Column(name = "description")
    private String description;

    @Column(name = "module_version", nullable = false)
    private String moduleVersion;

    @Column(name = "module_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private ModuleType moduleType;

    @Column(name = "icon")
    private String icon;

    @Column(name = "route")
    private String route; // Frontend route path

    @Column(name = "api_prefix")
    private String apiPrefix; // Backend API prefix

    @Column(name = "display_order")
    private int displayOrder;

    @Column(name = "enabled", nullable = false)
    private boolean enabled = true;

    @Column(name = "requires_license")
    private boolean requiresLicense = false;

    @Column(name = "dependencies")
    private String dependencies; // Comma-separated module codes

    public enum ModuleType {
        PLATFORM, CORE, EXTENSION, MARKETPLACE
    }
}
