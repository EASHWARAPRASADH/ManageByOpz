-- Migration: V24__create_recruitment_dynamic_architecture.sql

-- 1. Create recruitment_field_groups
CREATE TABLE IF NOT EXISTS recruitment_field_groups (
    id BINARY(16) NOT NULL PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    form_id BINARY(16) NULL,
    group_name VARCHAR(150) NOT NULL,
    display_order INT NOT NULL,
    created_by VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL,
    deleted_by VARCHAR(255),
    effective_date DATETIME(6) NULL,
    CONSTRAINT fk_rec_field_group_form FOREIGN KEY (form_id) REFERENCES form_definition(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Create recruitment_field_definitions
CREATE TABLE IF NOT EXISTS recruitment_field_definitions (
    id BINARY(16) NOT NULL PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    form_id BINARY(16) NULL,
    group_id BINARY(16) NULL,
    field_key VARCHAR(100) NOT NULL,
    field_label VARCHAR(150) NOT NULL,
    field_type VARCHAR(50) NOT NULL,
    required BOOLEAN NOT NULL DEFAULT FALSE,
    visible BOOLEAN NOT NULL DEFAULT TRUE,
    read_only BOOLEAN NOT NULL DEFAULT FALSE,
    default_value VARCHAR(255),
    validation_json TEXT,
    display_order INT NOT NULL,
    created_by VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL,
    deleted_by VARCHAR(255),
    effective_date DATETIME(6) NULL,
    CONSTRAINT fk_rec_field_def_form FOREIGN KEY (form_id) REFERENCES form_definition(id) ON DELETE CASCADE,
    CONSTRAINT fk_rec_field_group FOREIGN KEY (group_id) REFERENCES recruitment_field_groups(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Create recruitment_field_options
CREATE TABLE IF NOT EXISTS recruitment_field_options (
    id BINARY(16) NOT NULL PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    field_definition_id BINARY(16) NOT NULL,
    option_label VARCHAR(150) NOT NULL,
    option_value VARCHAR(150) NOT NULL,
    option_order INT NOT NULL,
    created_by VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL,
    deleted_by VARCHAR(255),
    effective_date DATETIME(6) NULL,
    CONSTRAINT fk_rec_field_opt FOREIGN KEY (field_definition_id) REFERENCES recruitment_field_definitions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Create recruitment_field_values
CREATE TABLE IF NOT EXISTS recruitment_field_values (
    id BINARY(16) NOT NULL PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    entity_id BINARY(16) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    field_definition_id BINARY(16) NOT NULL,
    field_value TEXT,
    created_by VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL,
    deleted_by VARCHAR(255),
    effective_date DATETIME(6) NULL,
    CONSTRAINT fk_rec_field_val FOREIGN KEY (field_definition_id) REFERENCES recruitment_field_definitions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Create requisition_hiring_reasons
CREATE TABLE IF NOT EXISTS requisition_hiring_reasons (
    id BINARY(16) NOT NULL PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    reason_code VARCHAR(100) NOT NULL,
    reason_name VARCHAR(150) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL,
    deleted_by VARCHAR(255),
    effective_date DATETIME(6) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Create skill_master
CREATE TABLE IF NOT EXISTS skill_master (
    id BINARY(16) NOT NULL PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    skill_name VARCHAR(150) NOT NULL,
    category VARCHAR(100),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL,
    deleted_by VARCHAR(255),
    effective_date DATETIME(6) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed default groups
INSERT INTO recruitment_field_groups (id, tenant_id, form_id, group_name, display_order)
VALUES 
(UNHEX('01000000000000000000000000000001'), 'ACME', UNHEX('00000000000000000000000000000001'), 'Role & Team', 1),
(UNHEX('01000000000000000000000000000002'), 'ACME', UNHEX('00000000000000000000000000000001'), 'Candidate Specs', 2),
(UNHEX('01000000000000000000000000000003'), 'ACME', UNHEX('00000000000000000000000000000001'), 'Justification & Budget', 3),
(UNHEX('01000000000000000000000000000004'), 'ACME', UNHEX('00000000000000000000000000000001'), 'Additional Details', 4)
ON DUPLICATE KEY UPDATE group_name=group_name;

-- Seed default field definitions
INSERT INTO recruitment_field_definitions (id, tenant_id, form_id, group_id, field_key, field_label, field_type, required, visible, read_only, default_value, display_order)
VALUES
(UNHEX('10000000000000000000000000000001'), 'ACME', UNHEX('00000000000000000000000000000001'), UNHEX('01000000000000000000000000000003'), 'hiringReason', 'Hiring Reason', 'Dropdown', TRUE, TRUE, FALSE, 'Expansion', 1),
(UNHEX('10000000000000000000000000000002'), 'ACME', UNHEX('00000000000000000000000000000001'), UNHEX('01000000000000000000000000000001'), 'businessUnit', 'Business Unit', 'Dropdown', FALSE, TRUE, FALSE, NULL, 2),
(UNHEX('10000000000000000000000000000003'), 'ACME', UNHEX('00000000000000000000000000000001'), UNHEX('01000000000000000000000000000001'), 'department', 'Department', 'Department Lookup', TRUE, TRUE, FALSE, NULL, 3),
(UNHEX('10000000000000000000000000000004'), 'ACME', UNHEX('00000000000000000000000000000001'), UNHEX('01000000000000000000000000000001'), 'vacancies', 'Headcount Required', 'Number', TRUE, TRUE, FALSE, '1', 4),
(UNHEX('10000000000000000000000000000005'), 'ACME', UNHEX('00000000000000000000000000000001'), UNHEX('01000000000000000000000000000003'), 'budget', 'Annual Budget Limit', 'Currency', TRUE, TRUE, FALSE, NULL, 5),
(UNHEX('10000000000000000000000000000006'), 'ACME', UNHEX('00000000000000000000000000000001'), UNHEX('01000000000000000000000000000003'), 'costCenter', 'Cost Center Code', 'Text', FALSE, TRUE, FALSE, NULL, 6),
(UNHEX('10000000000000000000000000000007'), 'ACME', UNHEX('00000000000000000000000000000001'), UNHEX('01000000000000000000000000000001'), 'positionTitle', 'Position Title', 'Text', TRUE, TRUE, FALSE, NULL, 0)
ON DUPLICATE KEY UPDATE field_label=field_label;

-- Dropdown Options (Hiring Reason)
INSERT INTO recruitment_field_options (id, tenant_id, field_definition_id, option_label, option_value, option_order)
VALUES 
(UNHEX('11000000000000000000000000000001'), 'ACME', UNHEX('10000000000000000000000000000001'), 'New Budgeted Headcount', 'New Budgeted Headcount', 1),
(UNHEX('11000000000000000000000000000002'), 'ACME', UNHEX('10000000000000000000000000000001'), 'Replacement Hires', 'Replacement Hires', 2),
(UNHEX('11000000000000000000000000000003'), 'ACME', UNHEX('10000000000000000000000000000001'), 'Strategic Project Growth', 'Strategic Project Growth', 3);

-- Dropdown Options (Business Unit)
INSERT INTO recruitment_field_options (id, tenant_id, field_definition_id, option_label, option_value, option_order)
VALUES 
(UNHEX('12000000000000000000000000000001'), 'ACME', UNHEX('10000000000000000000000000000002'), 'Corporate HQ', 'Corporate HQ', 1),
(UNHEX('12000000000000000000000000000002'), 'ACME', UNHEX('10000000000000000000000000000002'), 'R&D Labs', 'R&D Labs', 2),
(UNHEX('12000000000000000000000000000003'), 'ACME', UNHEX('10000000000000000000000000000002'), 'Global Operations', 'Global Operations', 3);

-- Seed default hiring reasons
INSERT INTO requisition_hiring_reasons (id, tenant_id, reason_code, reason_name, active)
VALUES
(UNHEX('9a000000000000000000000000000001'), 'ACME', 'REPLACEMENT', 'Replacement Hire', TRUE),
(UNHEX('9a000000000000000000000000000002'), 'ACME', 'EXPANSION', 'Project Expansion', TRUE),
(UNHEX('9a000000000000000000000000000003'), 'ACME', 'CLIENT_REQ', 'Client Requirement', TRUE),
(UNHEX('9a000000000000000000000000000004'), 'ACME', 'CONTRACTOR', 'Contract Resource', TRUE),
(UNHEX('9a000000000000000000000000000005'), 'ACME', 'URGENT', 'Urgent Hiring', TRUE);

-- Seed default skills
INSERT INTO skill_master (id, tenant_id, skill_name, category, active)
VALUES
(UNHEX('9b000000000000000000000000000001'), 'ACME', 'Java', 'Backend', TRUE),
(UNHEX('9b000000000000000000000000000002'), 'ACME', 'Spring Boot', 'Backend', TRUE),
(UNHEX('9b000000000000000000000000000003'), 'ACME', 'React', 'Frontend', TRUE),
(UNHEX('9b000000000000000000000000000004'), 'ACME', 'TypeScript', 'Frontend', TRUE),
(UNHEX('9b000000000000000000000000000005'), 'ACME', 'Kubernetes', 'DevOps', TRUE),
(UNHEX('9b000000000000000000000000000006'), 'ACME', 'AWS', 'DevOps', TRUE),
(UNHEX('9b000000000000000000000000000007'), 'ACME', 'SQL', 'Database', TRUE);
