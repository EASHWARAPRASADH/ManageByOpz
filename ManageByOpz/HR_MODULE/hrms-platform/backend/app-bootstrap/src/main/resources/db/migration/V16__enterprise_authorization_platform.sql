-- V16__enterprise_authorization_platform.sql

-- Drop old tables that conflict or are being replaced
DROP TABLE IF EXISTS role_permissions;
DROP TABLE IF EXISTS permissions;

-- Create security_roles table
CREATE TABLE security_roles (
    id BINARY(16) NOT NULL PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    role_code VARCHAR(100) NOT NULL UNIQUE,
    role_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_system_role BOOLEAN NOT NULL DEFAULT FALSE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed default security roles (matching previous IDs to keep existing user_roles relationships intact)
INSERT INTO security_roles (id, tenant_id, role_code, role_name, description, is_system_role, active) VALUES
(UNHEX('3f66a2a04c7a11edbdc30242ac120002'), 'SYSTEM', 'ROLE_ULTRA_SUPER_ADMIN', 'Ultra Super Admin', 'Platform Owner / SaaS Owner', TRUE, TRUE),
(UNHEX('3f66a5024c7a11edbdc30242ac120002'), 'ACME', 'ROLE_SUPER_ADMIN', 'Super Admin', 'Organization Head', TRUE, TRUE),
(UNHEX('3f66a61a4c7a11edbdc30242ac120002'), 'ACME', 'ROLE_ADMIN', 'Admin', 'HR Administrator', TRUE, TRUE),
(UNHEX('3f66a71e4c7a11edbdc30242ac120002'), 'ACME', 'ROLE_EMPLOYEE', 'Employee', 'End User', TRUE, TRUE),
(UNHEX('3f66a71e4c7a11edbdc30242ac120003'), 'ACME', 'ROLE_MANAGER', 'Manager', 'Team Manager', TRUE, TRUE);

-- Adjust user_roles foreign key constraint to point to security_roles
ALTER TABLE user_roles DROP FOREIGN KEY user_roles_ibfk_2;
ALTER TABLE user_roles ADD CONSTRAINT fk_user_roles_security_roles FOREIGN KEY (role_id) REFERENCES security_roles(id) ON DELETE CASCADE;

-- Drop old roles table (since security_roles replaces it)
DROP TABLE IF EXISTS roles;

-- Create security_modules table
CREATE TABLE security_modules (
    id BINARY(16) NOT NULL PRIMARY KEY,
    module_code VARCHAR(100) NOT NULL UNIQUE,
    module_name VARCHAR(100) NOT NULL,
    icon VARCHAR(100),
    display_order INT NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Seed modules
INSERT INTO security_modules (id, module_code, module_name, icon, display_order, active) VALUES
(UNHEX('11edbdc30242ac120002000000000001'), 'DASHBOARD', 'Dashboard', 'LayoutDashboard', 10, TRUE),
(UNHEX('11edbdc30242ac120002000000000002'), 'EMPLOYEE', 'Employee Directory', 'Users', 20, TRUE),
(UNHEX('11edbdc30242ac120002000000000003'), 'ORG_DNA', 'Organization DNA', 'Building2', 30, TRUE),
(UNHEX('11edbdc30242ac120002000000000004'), 'ONBOARDING', 'Onboarding', 'GitPullRequest', 40, TRUE),
(UNHEX('11edbdc30242ac120002000000000005'), 'LEAVE', 'Leave Management', 'Calendar', 50, TRUE),
(UNHEX('11edbdc30242ac120002000000000006'), 'APPROVALS', 'My Approvals', 'ClipboardCheck', 60, TRUE),
(UNHEX('11edbdc30242ac120002000000000007'), 'RECOGNITION', 'Recognition & Rewards', 'Award', 70, TRUE),
(UNHEX('11edbdc30242ac120002000000000008'), 'ANALYTICS', 'Analytics', 'BarChart3', 80, TRUE),
(UNHEX('11edbdc30242ac120002000000000009'), 'PAYROLL', 'Payroll', 'CreditCard', 90, TRUE),
(UNHEX('11edbdc30242ac12000200000000000a'), 'RECRUITMENT', 'Recruitment', 'Users', 100, TRUE),
(UNHEX('11edbdc30242ac12000200000000000b'), 'LMS', 'LMS', 'FileText', 110, TRUE);

-- Create security_pages table
CREATE TABLE security_pages (
    id BINARY(16) NOT NULL PRIMARY KEY,
    module_id BINARY(16) NOT NULL,
    page_code VARCHAR(100) NOT NULL UNIQUE,
    page_name VARCHAR(100) NOT NULL,
    route_path VARCHAR(255) NOT NULL,
    component_name VARCHAR(100),
    menu_visible BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INT NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (module_id) REFERENCES security_modules(id) ON DELETE CASCADE
);

-- Seed pages
INSERT INTO security_pages (id, module_id, page_code, page_name, route_path, component_name, menu_visible, display_order, active) VALUES
(UNHEX('22edbdc30242ac120002000000000001'), UNHEX('11edbdc30242ac120002000000000001'), 'DASHBOARD_PAGE', 'Dashboard', '/dashboard', 'DashboardScreen', TRUE, 10, TRUE),
(UNHEX('22edbdc30242ac120002000000000002'), UNHEX('11edbdc30242ac120002000000000002'), 'EMPLOYEE_DIRECTORY', 'Employee Directory', '/employees', 'EmployeeDirectoryScreen', TRUE, 20, TRUE),
(UNHEX('22edbdc30242ac120002000000000003'), UNHEX('11edbdc30242ac120002000000000003'), 'ORG_DNA_PAGE', 'Organization DNA', '/org-dna', 'OrgDnaScreen', TRUE, 30, TRUE),
(UNHEX('22edbdc30242ac120002000000000004'), UNHEX('11edbdc30242ac120002000000000004'), 'ONBOARDING_PAGE', 'Onboarding', '/onboarding', 'OnboardingScreen', TRUE, 40, TRUE),
(UNHEX('22edbdc30242ac120002000000000005'), UNHEX('11edbdc30242ac120002000000000005'), 'LEAVE_MANAGEMENT', 'Leave Management', '/leave', 'LeaveScreen', TRUE, 50, TRUE),
(UNHEX('22edbdc30242ac120002000000000006'), UNHEX('11edbdc30242ac120002000000000006'), 'MY_APPROVALS', 'My Approvals', '/approvals', 'ApprovalsScreen', TRUE, 60, TRUE),
(UNHEX('22edbdc30242ac120002000000000007'), UNHEX('11edbdc30242ac120002000000000007'), 'RECOGNITION_PAGE', 'Recognition & Rewards', '/recognition', 'RecognitionScreen', TRUE, 70, TRUE),
(UNHEX('22edbdc30242ac120002000000000008'), UNHEX('11edbdc30242ac120002000000000008'), 'ANALYTICS_PAGE', 'Analytics', '/analytics', 'AnalyticsScreen', TRUE, 80, TRUE);

-- Create security_permissions table
CREATE TABLE security_permissions (
    id BINARY(16) NOT NULL PRIMARY KEY,
    permission_code VARCHAR(100) NOT NULL UNIQUE,
    permission_name VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL
);

-- Seed permissions
INSERT INTO security_permissions (id, permission_code, permission_name, category) VALUES
(UNHEX('33edbdc30242ac120002000000000001'), 'VIEW', 'View', 'Action'),
(UNHEX('33edbdc30242ac120002000000000002'), 'CREATE', 'Create', 'Action'),
(UNHEX('33edbdc30242ac120002000000000003'), 'EDIT', 'Edit', 'Action'),
(UNHEX('33edbdc30242ac120002000000000004'), 'DELETE', 'Delete', 'Action'),
(UNHEX('33edbdc30242ac120002000000000005'), 'APPROVE', 'Approve', 'Action'),
(UNHEX('33edbdc30242ac120002000000000006'), 'REJECT', 'Reject', 'Action'),
(UNHEX('33edbdc30242ac120002000000000007'), 'EXPORT', 'Export', 'Action'),
(UNHEX('33edbdc30242ac120002000000000008'), 'IMPORT', 'Import', 'Action'),
(UNHEX('33edbdc30242ac120002000000000009'), 'PRINT', 'Print', 'Action'),
(UNHEX('33edbdc30242ac12000200000000000a'), 'ASSIGN', 'Assign', 'Action'),
(UNHEX('33edbdc30242ac12000200000000000b'), 'MANAGE', 'Manage', 'Action'),
(UNHEX('33edbdc30242ac12000200000000000c'), 'CONFIGURE', 'Configure', 'Action');

-- Create role_permissions table mapping role to page and action permissions
CREATE TABLE role_permissions (
    role_id BINARY(16) NOT NULL,
    page_id BINARY(16) NOT NULL,
    permission_id BINARY(16) NOT NULL,
    PRIMARY KEY (role_id, page_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES security_roles(id) ON DELETE CASCADE,
    FOREIGN KEY (page_id) REFERENCES security_pages(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES security_permissions(id) ON DELETE CASCADE
);

-- Create user_permissions table for user specific overrides
CREATE TABLE user_permissions (
    user_id BINARY(16) NOT NULL,
    page_id BINARY(16) NOT NULL,
    permission_id BINARY(16) NOT NULL,
    allow BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (user_id, page_id, permission_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (page_id) REFERENCES security_pages(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES security_permissions(id) ON DELETE CASCADE
);

-- Create field_permissions table for Phase 5 Field Level Security
CREATE TABLE field_permissions (
    id BINARY(16) NOT NULL PRIMARY KEY,
    role_id BINARY(16),
    user_id BINARY(16),
    field_name VARCHAR(100) NOT NULL,
    can_view BOOLEAN NOT NULL DEFAULT FALSE,
    can_edit BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (role_id) REFERENCES security_roles(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Seed Field Permissions
-- HR Admin (ROLE_ADMIN) can view salary and performance rating
-- Manager (ROLE_MANAGER) can view performance rating but not salary
-- Employee (ROLE_EMPLOYEE) can only view own via specific override logic in code
INSERT INTO field_permissions (id, role_id, field_name, can_view, can_edit) VALUES
(UNHEX('55edbdc30242ac120002000000000001'), UNHEX('3f66a61a4c7a11edbdc30242ac120002'), 'salary', TRUE, TRUE),
(UNHEX('55edbdc30242ac120002000000000002'), UNHEX('3f66a61a4c7a11edbdc30242ac120002'), 'performance_rating', TRUE, TRUE),
(UNHEX('55edbdc30242ac120002000000000003'), UNHEX('3f66a71e4c7a11edbdc30242ac120003'), 'performance_rating', TRUE, FALSE);

-- Create security_audit_log table for Phase 8 Tracking permission changes
CREATE TABLE security_audit_log (
    id BINARY(16) NOT NULL PRIMARY KEY,
    changed_by BINARY(16) NOT NULL,
    target_type VARCHAR(50) NOT NULL, -- ROLE, USER, MODULE, PAGE, FIELD
    target_id BINARY(16) NOT NULL,
    action_type VARCHAR(50) NOT NULL, -- ADD, REMOVE, UPDATE
    old_value TEXT,
    new_value TEXT,
    ip_address VARCHAR(50),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Seed default role permissions (Ultra Super Admin gets all permissions across all pages)
-- Let's construct insertion statements for Ultra Super Admin (UNHEX('3f66a2a04c7a11edbdc30242ac120002'))
-- Pages: 22edbdc30242ac120002000000000001 to 0008
-- Permissions: 33edbdc30242ac120002000000000001 to 000c
DELIMITER $$
CREATE PROCEDURE seed_ultra_admin_permissions()
BEGIN
    DECLARE page_num INT DEFAULT 1;
    DECLARE perm_num INT DEFAULT 1;
    DECLARE page_hex VARCHAR(32);
    DECLARE perm_hex VARCHAR(32);
    
    WHILE page_num <= 8 DO
        SET page_hex = CONCAT('22edbdc30242ac12000200000000000', page_num);
        SET perm_num = 1;
        WHILE perm_num <= 12 DO
            IF perm_num < 10 THEN
                SET perm_hex = CONCAT('33edbdc30242ac12000200000000000', perm_num);
            ELSE
                IF perm_num = 10 THEN
                    SET perm_hex = '33edbdc30242ac12000200000000000a';
                ELSEIF perm_num = 11 THEN
                    SET perm_hex = '33edbdc30242ac12000200000000000b';
                ELSE
                    SET perm_hex = '33edbdc30242ac12000200000000000c';
                END IF;
            END IF;
            
            INSERT IGNORE INTO role_permissions (role_id, page_id, permission_id) 
            VALUES (UNHEX('3f66a2a04c7a11edbdc30242ac120002'), UNHEX(page_hex), UNHEX(perm_hex));
            
            SET perm_num = perm_num + 1;
        END WHILE;
        SET page_num = page_num + 1;
    END WHILE;
END$$
DELIMITER ;

CALL seed_ultra_admin_permissions();
DROP PROCEDURE seed_ultra_admin_permissions;

-- Seed default role permissions for Admin role (ROLE_ADMIN): view, create, edit for EMPLOYEE, LEAVE, RECOGNITION, etc.
INSERT INTO role_permissions (role_id, page_id, permission_id) VALUES
-- Dashboard: VIEW
(UNHEX('3f66a61a4c7a11edbdc30242ac120002'), UNHEX('22edbdc30242ac120002000000000001'), UNHEX('33edbdc30242ac120002000000000001')),
-- Employee Directory: VIEW, CREATE, EDIT
(UNHEX('3f66a61a4c7a11edbdc30242ac120002'), UNHEX('22edbdc30242ac120002000000000002'), UNHEX('33edbdc30242ac120002000000000001')),
(UNHEX('3f66a61a4c7a11edbdc30242ac120002'), UNHEX('22edbdc30242ac120002000000000002'), UNHEX('33edbdc30242ac120002000000000002')),
(UNHEX('3f66a61a4c7a11edbdc30242ac120002'), UNHEX('22edbdc30242ac120002000000000002'), UNHEX('33edbdc30242ac120002000000000003')),
-- Leave Management: VIEW, CREATE, EDIT, APPROVE, REJECT
(UNHEX('3f66a61a4c7a11edbdc30242ac120002'), UNHEX('22edbdc30242ac120002000000000005'), UNHEX('33edbdc30242ac120002000000000001')),
(UNHEX('3f66a61a4c7a11edbdc30242ac120002'), UNHEX('22edbdc30242ac120002000000000005'), UNHEX('33edbdc30242ac120002000000000002')),
(UNHEX('3f66a61a4c7a11edbdc30242ac120002'), UNHEX('22edbdc30242ac120002000000000005'), UNHEX('33edbdc30242ac120002000000000003')),
(UNHEX('3f66a61a4c7a11edbdc30242ac120002'), UNHEX('22edbdc30242ac120002000000000005'), UNHEX('33edbdc30242ac120002000000000005')),
(UNHEX('3f66a61a4c7a11edbdc30242ac120002'), UNHEX('22edbdc30242ac120002000000000005'), UNHEX('33edbdc30242ac120002000000000006'));
