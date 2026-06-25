-- V2: Workflow Engine + Notification Platform

CREATE TABLE IF NOT EXISTS workflow_definitions (
    id BINARY(16) NOT NULL PRIMARY KEY, tenant_id VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL, code VARCHAR(100) NOT NULL UNIQUE,
    module_code VARCHAR(100) NOT NULL, entity_type VARCHAR(100) NOT NULL,
    description TEXT, version_number INT NOT NULL DEFAULT 1,
    active BOOLEAN NOT NULL DEFAULT TRUE, sla_hours INT,
    auto_approve_on_sla_breach BOOLEAN DEFAULT FALSE, allow_delegation BOOLEAN DEFAULT TRUE,
    created_by VARCHAR(255), created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255), updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0, deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL, deleted_by VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS workflow_steps (
    id BINARY(16) NOT NULL PRIMARY KEY, tenant_id VARCHAR(100) NOT NULL,
    workflow_definition_id BINARY(16) NOT NULL, name VARCHAR(255) NOT NULL,
    step_order INT NOT NULL, step_type VARCHAR(50) NOT NULL,
    approver_type VARCHAR(50) NOT NULL, approver_value VARCHAR(255),
    sla_hours INT, escalation_to VARCHAR(255), required_approvals INT DEFAULT 1,
    created_by VARCHAR(255), created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255), updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0, deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL, deleted_by VARCHAR(255),
    FOREIGN KEY (workflow_definition_id) REFERENCES workflow_definitions(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS workflow_instances (
    id BINARY(16) NOT NULL PRIMARY KEY, tenant_id VARCHAR(100) NOT NULL,
    workflow_definition_id BINARY(16) NOT NULL, entity_type VARCHAR(100) NOT NULL,
    entity_id BINARY(16) NOT NULL, initiated_by VARCHAR(255) NOT NULL,
    current_step_order INT DEFAULT 1, status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    started_at TIMESTAMP NULL, completed_at TIMESTAMP NULL, sla_deadline TIMESTAMP NULL,
    created_by VARCHAR(255), created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255), updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0, deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL, deleted_by VARCHAR(255),
    FOREIGN KEY (workflow_definition_id) REFERENCES workflow_definitions(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS workflow_transitions (
    id BINARY(16) NOT NULL PRIMARY KEY, tenant_id VARCHAR(100) NOT NULL,
    workflow_instance_id BINARY(16) NOT NULL, step_order INT,
    action VARCHAR(50) NOT NULL, acted_by VARCHAR(255) NOT NULL,
    acted_at TIMESTAMP NOT NULL, comments TEXT, delegated_to VARCHAR(255),
    created_by VARCHAR(255), created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255), updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0, deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL, deleted_by VARCHAR(255),
    FOREIGN KEY (workflow_instance_id) REFERENCES workflow_instances(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS notification_templates (
    id BINARY(16) NOT NULL PRIMARY KEY, tenant_id VARCHAR(100) NOT NULL,
    code VARCHAR(100) NOT NULL UNIQUE, name VARCHAR(255) NOT NULL,
    channel VARCHAR(50) NOT NULL, subject_template VARCHAR(500),
    body_template TEXT NOT NULL, module_code VARCHAR(100),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by VARCHAR(255), created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255), updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0, deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL, deleted_by VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS notifications (
    id BINARY(16) NOT NULL PRIMARY KEY, tenant_id VARCHAR(100) NOT NULL,
    recipient_user_id VARCHAR(100), recipient_email VARCHAR(255),
    recipient_phone VARCHAR(50), channel VARCHAR(50) NOT NULL,
    template_code VARCHAR(100), subject VARCHAR(500),
    body TEXT NOT NULL, status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    sent_at TIMESTAMP NULL, read_at TIMESTAMP NULL, retry_count INT DEFAULT 0,
    error_message TEXT, module_code VARCHAR(100),
    reference_type VARCHAR(100), reference_id VARCHAR(100),
    created_by VARCHAR(255), created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255), updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0, deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL, deleted_by VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
