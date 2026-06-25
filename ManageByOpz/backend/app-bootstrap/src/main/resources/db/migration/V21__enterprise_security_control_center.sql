-- V21__enterprise_security_control_center.sql
-- Add support for dynamic Data Scope Security rules and extend Field Security rules

CREATE TABLE data_scope_rules (
    id BINARY(16) PRIMARY KEY,
    role_code VARCHAR(100) NOT NULL,
    scope_type VARCHAR(50) NOT NULL,
    rule_text VARCHAR(1000),
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_role_tenant (role_code, tenant_id)
);

-- Seed initial data scope rules for default roles
INSERT INTO data_scope_rules (id, role_code, scope_type, rule_text, tenant_id) VALUES
(UNHEX(REPLACE(UUID(), '-', '')), 'ROLE_ULTRA_SUPER_ADMIN', 'GLOBAL', 'Global unrestricted administrative scope across all tenants.', 'ACME'),
(UNHEX(REPLACE(UUID(), '-', '')), 'ROLE_SUPER_ADMIN', 'TENANT', 'Access restricted to active business tenant boundary.', 'ACME'),
(UNHEX(REPLACE(UUID(), '-', '')), 'ROLE_ADMIN', 'DEPARTMENT', 'Access restricted to employees within their assigned department or office division.', 'ACME'),
(UNHEX(REPLACE(UUID(), '-', '')), 'ROLE_MANAGER', 'DIRECT_REPORTS', 'Can only view/edit records for direct or indirect report hierarchy.', 'ACME'),
(UNHEX(REPLACE(UUID(), '-', '')), 'ROLE_EMPLOYEE', 'SELF_ONLY', 'Access limited strictly to self records and Emergency details.', 'ACME');

-- Extend field_permissions to support granular access types (Hidden, Read Only, Editable, Masked)
ALTER TABLE field_permissions ADD COLUMN access_level VARCHAR(50) NOT NULL DEFAULT 'EDITABLE';

-- Update existing field permissions can_view/can_edit to match new access_level mapping
UPDATE field_permissions SET access_level = 'EDITABLE' WHERE can_view = true AND can_edit = true;
UPDATE field_permissions SET access_level = 'READ_ONLY' WHERE can_view = true AND can_edit = false;
UPDATE field_permissions SET access_level = 'HIDDEN' WHERE can_view = false;
