-- Seed default roles if not exists
INSERT IGNORE INTO roles (id, tenant_id, name, code, priority, display_name, description, hierarchy_level, system_role, active, created_by, created_at, updated_by, version, deleted) VALUES
(UNHEX('3f66a2a04c7a11edbdc30242ac120002'), 'SYSTEM', 'Ultra Super Admin', 'ROLE_ULTRA_SUPER_ADMIN', 100, 'Ultra Super Admin', 'Platform Owner / SaaS Owner', 0, 1, 1, 'system', CURRENT_TIMESTAMP, 'system', 0, 0),
(UNHEX('3f66a5024c7a11edbdc30242ac120002'), 'ACME', 'Super Admin', 'ROLE_SUPER_ADMIN', 80, 'Super Admin', 'Organization Head', 20, 1, 1, 'system', CURRENT_TIMESTAMP, 'system', 0, 0),
(UNHEX('3f66a61a4c7a11edbdc30242ac120002'), 'ACME', 'Admin', 'ROLE_ADMIN', 60, 'Admin', 'HR Administrator', 40, 1, 1, 'system', CURRENT_TIMESTAMP, 'system', 0, 0),
(UNHEX('3f66a71e4c7a11edbdc30242ac120002'), 'ACME', 'Employee', 'ROLE_EMPLOYEE', 20, 'Employee', 'End User', 100, 1, 1, 'system', CURRENT_TIMESTAMP, 'system', 0, 0);

-- Seed users
INSERT INTO users (id, tenant_id, username, email, password_hash, first_name, last_name, employee_id, active, locked, email_verified, created_by, created_at, updated_by, version, deleted) VALUES
-- Ultra Super Admin
(UNHEX('00000000000000000000000000000001'), 'SYSTEM', 'ultra.admin@managemyopz.com', 'ultra.admin@managemyopz.com', '$2b$10$SO7mGXLqrhDS/rEwAVMZZOFM1lbGKMD9omQGkF1kSRAU/mJpDyOei', 'Platform', 'Owner', 'EMP001', 1, 0, 1, 'system', CURRENT_TIMESTAMP, 'system', 0, 0),
-- Super Admin
(UNHEX('00000000000000000000000000000002'), 'ACME', 'super.admin@managemyopz.com', 'super.admin@managemyopz.com', '$2b$10$SO7mGXLqrhDS/rEwAVMZZOFM1lbGKMD9omQGkF1kSRAU/mJpDyOei', 'Acme Corporation', 'Owner', 'EMP002', 1, 0, 1, 'system', CURRENT_TIMESTAMP, 'system', 0, 0),
-- Admin
(UNHEX('00000000000000000000000000000003'), 'ACME', 'admin@managemyopz.com', 'admin@managemyopz.com', '$2b$10$SO7mGXLqrhDS/rEwAVMZZOFM1lbGKMD9omQGkF1kSRAU/mJpDyOei', 'HR', 'Administrator', 'EMP003', 1, 0, 1, 'system', CURRENT_TIMESTAMP, 'system', 0, 0),
-- Employee
(UNHEX('00000000000000000000000000000004'), 'ACME', 'employee@managemyopz.com', 'employee@managemyopz.com', '$2b$10$SO7mGXLqrhDS/rEwAVMZZOFM1lbGKMD9omQGkF1kSRAU/mJpDyOei', 'John', 'Employee', 'EMP004', 1, 0, 1, 'system', CURRENT_TIMESTAMP, 'system', 0, 0);

-- Map user_roles
INSERT INTO user_roles (user_id, role_id) VALUES
(UNHEX('00000000000000000000000000000001'), UNHEX('3f66a2a04c7a11edbdc30242ac120002')),
(UNHEX('00000000000000000000000000000002'), UNHEX('3f66a5024c7a11edbdc30242ac120002')),
(UNHEX('00000000000000000000000000000003'), UNHEX('3f66a61a4c7a11edbdc30242ac120002')),
(UNHEX('00000000000000000000000000000004'), UNHEX('3f66a71e4c7a11edbdc30242ac120002'));
