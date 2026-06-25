-- ══════════════════════════════════════════════════════════════
-- ManageMyOpz HR Platform — V1: Platform Foundation Tables
-- Organization DNA + RBAC + Audit + Workflow + Notification + Module Registry
-- ══════════════════════════════════════════════════════════════

-- ── Organization DNA ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS organizations (
    id BINARY(16) NOT NULL PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    legal_name VARCHAR(255),
    registration_number VARCHAR(100),
    tax_id VARCHAR(100),
    industry VARCHAR(100),
    website VARCHAR(255),
    logo_url VARCHAR(500),
    primary_email VARCHAR(255),
    primary_phone VARCHAR(50),
    address TEXT,
    country VARCHAR(100),
    currency VARCHAR(10),
    timezone VARCHAR(50),
    date_format VARCHAR(20),
    fiscal_year_start INT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL,
    deleted_by VARCHAR(255),
    INDEX idx_org_tenant (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS business_units (
    id BINARY(16) NOT NULL PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    organization_id BINARY(16) NOT NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    description TEXT,
    head_employee_id BINARY(16),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by VARCHAR(255), created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255), updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0, deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL, deleted_by VARCHAR(255),
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    INDEX idx_bu_tenant (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS divisions (
    id BINARY(16) NOT NULL PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    business_unit_id BINARY(16) NOT NULL,
    name VARCHAR(255) NOT NULL, code VARCHAR(50) NOT NULL,
    description TEXT, head_employee_id BINARY(16), active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by VARCHAR(255), created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255), updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0, deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL, deleted_by VARCHAR(255),
    FOREIGN KEY (business_unit_id) REFERENCES business_units(id),
    INDEX idx_div_tenant (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS departments (
    id BINARY(16) NOT NULL PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    division_id BINARY(16) NOT NULL,
    name VARCHAR(255) NOT NULL, code VARCHAR(50) NOT NULL,
    description TEXT, head_employee_id BINARY(16), active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by VARCHAR(255), created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255), updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0, deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL, deleted_by VARCHAR(255),
    FOREIGN KEY (division_id) REFERENCES divisions(id),
    INDEX idx_dept_tenant (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sub_departments (
    id BINARY(16) NOT NULL PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    department_id BINARY(16) NOT NULL,
    name VARCHAR(255) NOT NULL, code VARCHAR(50) NOT NULL,
    description TEXT, head_employee_id BINARY(16), active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by VARCHAR(255), created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255), updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0, deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL, deleted_by VARCHAR(255),
    FOREIGN KEY (department_id) REFERENCES departments(id),
    INDEX idx_subdept_tenant (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS locations (
    id BINARY(16) NOT NULL PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    organization_id BINARY(16) NOT NULL,
    name VARCHAR(255) NOT NULL, code VARCHAR(50) NOT NULL,
    address TEXT, city VARCHAR(100), state VARCHAR(100), country VARCHAR(100),
    postal_code VARCHAR(20), timezone VARCHAR(50), location_type VARCHAR(50),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by VARCHAR(255), created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255), updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0, deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL, deleted_by VARCHAR(255),
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    INDEX idx_loc_tenant (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS grades (
    id BINARY(16) NOT NULL PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    organization_id BINARY(16) NOT NULL,
    name VARCHAR(255) NOT NULL, code VARCHAR(50) NOT NULL,
    level INT, description TEXT, active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by VARCHAR(255), created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255), updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0, deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL, deleted_by VARCHAR(255),
    FOREIGN KEY (organization_id) REFERENCES organizations(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS bands (
    id BINARY(16) NOT NULL PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    organization_id BINARY(16) NOT NULL,
    name VARCHAR(255) NOT NULL, code VARCHAR(50) NOT NULL,
    min_salary DOUBLE, max_salary DOUBLE, currency VARCHAR(10),
    description TEXT, active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by VARCHAR(255), created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255), updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0, deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL, deleted_by VARCHAR(255),
    FOREIGN KEY (organization_id) REFERENCES organizations(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS designations (
    id BINARY(16) NOT NULL PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    organization_id BINARY(16) NOT NULL,
    name VARCHAR(255) NOT NULL, code VARCHAR(50) NOT NULL,
    level INT, job_family VARCHAR(100), description TEXT, active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by VARCHAR(255), created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255), updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0, deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL, deleted_by VARCHAR(255),
    FOREIGN KEY (organization_id) REFERENCES organizations(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cost_centers (
    id BINARY(16) NOT NULL PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    organization_id BINARY(16) NOT NULL,
    name VARCHAR(255) NOT NULL, code VARCHAR(50) NOT NULL,
    description TEXT, budget DOUBLE, currency VARCHAR(10), active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by VARCHAR(255), created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255), updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0, deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL, deleted_by VARCHAR(255),
    FOREIGN KEY (organization_id) REFERENCES organizations(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS employment_types (
    id BINARY(16) NOT NULL PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    organization_id BINARY(16) NOT NULL,
    name VARCHAR(255) NOT NULL, code VARCHAR(50) NOT NULL,
    description TEXT, probation_days INT, notice_period_days INT, active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by VARCHAR(255), created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255), updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0, deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL, deleted_by VARCHAR(255),
    FOREIGN KEY (organization_id) REFERENCES organizations(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── RBAC Platform ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS roles (
    id BINARY(16) NOT NULL PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(255),
    description TEXT,
    hierarchy_level INT NOT NULL DEFAULT 100,
    system_role BOOLEAN NOT NULL DEFAULT FALSE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by VARCHAR(255), created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255), updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0, deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL, deleted_by VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS permissions (
    id BINARY(16) NOT NULL PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(255),
    module_code VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    resource_type VARCHAR(100),
    field_name VARCHAR(100),
    description TEXT,
    created_by VARCHAR(255), created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255), updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0, deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL, deleted_by VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS users (
    id BINARY(16) NOT NULL PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(500) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    employee_id VARCHAR(100),
    avatar_url VARCHAR(500),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    locked BOOLEAN NOT NULL DEFAULT FALSE,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    last_login_at TIMESTAMP NULL,
    last_login_ip VARCHAR(50),
    failed_login_attempts INT DEFAULT 0,
    password_changed_at TIMESTAMP NULL,
    created_by VARCHAR(255), created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255), updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0, deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL, deleted_by VARCHAR(255),
    INDEX idx_user_tenant (tenant_id),
    INDEX idx_user_employee (employee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_roles (
    user_id BINARY(16) NOT NULL,
    role_id BINARY(16) NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (role_id) REFERENCES roles(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id BINARY(16) NOT NULL,
    permission_id BINARY(16) NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id),
    FOREIGN KEY (permission_id) REFERENCES permissions(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Audit Platform ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS audit_log (
    id BINARY(16) NOT NULL PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    module_code VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100),
    action VARCHAR(50) NOT NULL,
    before_json JSON,
    after_json JSON,
    change_summary TEXT,
    performed_by VARCHAR(255) NOT NULL,
    performed_by_role VARCHAR(100),
    performed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(50),
    user_agent VARCHAR(500),
    correlation_id VARCHAR(100),
    created_by VARCHAR(255), created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255), updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0, deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL, deleted_by VARCHAR(255),
    INDEX idx_audit_tenant (tenant_id),
    INDEX idx_audit_entity (entity_type, entity_id),
    INDEX idx_audit_user (performed_by),
    INDEX idx_audit_action (action),
    INDEX idx_audit_timestamp (performed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Module Registry ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS module_registry (
    id BINARY(16) NOT NULL PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    module_code VARCHAR(100) NOT NULL UNIQUE,
    module_name VARCHAR(255) NOT NULL,
    description TEXT,
    module_version VARCHAR(20) NOT NULL,
    module_type VARCHAR(50) NOT NULL,
    icon VARCHAR(100),
    route VARCHAR(255),
    api_prefix VARCHAR(255),
    display_order INT DEFAULT 0,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    requires_license BOOLEAN NOT NULL DEFAULT FALSE,
    dependencies VARCHAR(500),
    created_by VARCHAR(255), created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255), updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0, deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL, deleted_by VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
