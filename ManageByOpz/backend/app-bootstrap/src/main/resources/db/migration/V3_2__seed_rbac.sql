-- Alter roles table to add code and priority
ALTER TABLE roles ADD COLUMN code VARCHAR(100) NULL;
ALTER TABLE roles ADD COLUMN priority INT NOT NULL DEFAULT 0;

-- Alter permissions table to add module and permission_key
ALTER TABLE permissions ADD COLUMN module VARCHAR(100) NULL;
ALTER TABLE permissions ADD COLUMN permission_key VARCHAR(100) NULL;

-- Seed default Roles
INSERT INTO roles (id, tenant_id, name, code, priority, display_name, description, hierarchy_level, system_role, active, created_by, created_at, updated_by, version, deleted) VALUES
(UNHEX('3f66a2a04c7a11edbdc30242ac120002'), 'default', 'Ultra Super Admin', 'ROLE_ULTRA_SUPER_ADMIN', 100, 'Ultra Super Admin', 'Platform Owner / SaaS Owner', 0, 1, 1, 'system', CURRENT_TIMESTAMP, 'system', 0, 0),
(UNHEX('3f66a5024c7a11edbdc30242ac120002'), 'default', 'Super Admin', 'ROLE_SUPER_ADMIN', 80, 'Super Admin', 'Organization Head', 20, 1, 1, 'system', CURRENT_TIMESTAMP, 'system', 0, 0),
(UNHEX('3f66a61a4c7a11edbdc30242ac120002'), 'default', 'Admin', 'ROLE_ADMIN', 60, 'Admin', 'HR Administrator', 40, 1, 1, 'system', CURRENT_TIMESTAMP, 'system', 0, 0),
(UNHEX('3f66a71e4c7a11edbdc30242ac120002'), 'default', 'Employee', 'ROLE_EMPLOYEE', 20, 'Employee', 'End User', 100, 1, 1, 'system', CURRENT_TIMESTAMP, 'system', 0, 0);

-- Seed default Permissions
INSERT INTO permissions (id, tenant_id, name, display_name, module_code, action, resource_type, description, module, permission_key, version, deleted) VALUES
(UNHEX('4a1a00014c7a11edbdc30242ac120002'), 'default', 'employee:create', 'Create Employee', 'employee-twin', 'CREATE', 'employee', 'Create employee twin profiles', 'employee', 'employee:create', 0, 0),
(UNHEX('4a1a00024c7a11edbdc30242ac120002'), 'default', 'employee:update', 'Update Employee', 'employee-twin', 'UPDATE', 'employee', 'Update employee twin profiles', 'employee', 'employee:update', 0, 0),
(UNHEX('4a1a00034c7a11edbdc30242ac120002'), 'default', 'employee:view', 'View Employee', 'employee-twin', 'READ', 'employee', 'View employee twin profiles', 'employee', 'employee:view', 0, 0),
(UNHEX('4a1a00044c7a11edbdc30242ac120002'), 'default', 'employee:delete', 'Delete Employee', 'employee-twin', 'DELETE', 'employee', 'Delete employee twin profiles', 'employee', 'employee:delete', 0, 0),
(UNHEX('4a1a00054c7a11edbdc30242ac120002'), 'default', 'employee:promote', 'Promote Employee', 'employee-twin', 'UPDATE', 'employee', 'Promote employee designation or grade', 'employee', 'employee:promote', 0, 0),
(UNHEX('4a1a00064c7a11edbdc30242ac120002'), 'default', 'employee:transfer', 'Transfer Employee', 'employee-twin', 'UPDATE', 'employee', 'Transfer employee department or location', 'employee', 'employee:transfer', 0, 0),
(UNHEX('4a1a00074c7a11edbdc30242ac120002'), 'default', 'employee:terminate', 'Terminate Employee', 'employee-twin', 'UPDATE', 'employee', 'Terminate employee contract', 'employee', 'employee:terminate', 0, 0),
(UNHEX('4a1a00084c7a11edbdc30242ac120002'), 'default', 'organization:create', 'Create Organization', 'organization-dna', 'CREATE', 'organization', 'Create organizations', 'organization', 'organization:create', 0, 0),
(UNHEX('4a1a00094c7a11edbdc30242ac120002'), 'default', 'organization:update', 'Update Organization', 'organization-dna', 'UPDATE', 'organization', 'Update organizations', 'organization', 'organization:update', 0, 0),
(UNHEX('4a1a000a4c7a11edbdc30242ac120002'), 'default', 'organization:view', 'View Organization', 'organization-dna', 'READ', 'organization', 'View organizations', 'organization', 'organization:view', 0, 0),
(UNHEX('4a1a000b4c7a11edbdc30242ac120002'), 'default', 'organization:delete', 'Delete Organization', 'organization-dna', 'DELETE', 'organization', 'Delete organizations', 'organization', 'organization:delete', 0, 0),
(UNHEX('4a1a000c4c7a11edbdc30242ac120002'), 'default', 'workflow:approve', 'Approve Workflow', 'workflow', 'APPROVE', 'workflow', 'Approve workflow requests', 'workflow', 'workflow:approve', 0, 0),
(UNHEX('4a1a000d4c7a11edbdc30242ac120002'), 'default', 'workflow:reject', 'Reject Workflow', 'workflow', 'REJECT', 'workflow', 'Reject workflow requests', 'workflow', 'workflow:reject', 0, 0),
(UNHEX('4a1a000e4c7a11edbdc30242ac120002'), 'default', 'document:create', 'Create Document', 'document', 'CREATE', 'document', 'Create documents', 'document', 'document:create', 0, 0),
(UNHEX('4a1a000f4c7a11edbdc30242ac120002'), 'default', 'document:view', 'View Document', 'document', 'READ', 'document', 'View documents', 'document', 'document:view', 0, 0),
(UNHEX('4a1a00104c7a11edbdc30242ac120002'), 'default', 'document:update', 'Update Document', 'document', 'UPDATE', 'document', 'Update documents', 'document', 'document:update', 0, 0),
(UNHEX('4a1a00114c7a11edbdc30242ac120002'), 'default', 'analytics:view', 'View Analytics', 'analytics', 'READ', 'analytics', 'View dashboards and reports', 'analytics', 'analytics:view', 0, 0),
(UNHEX('4a1a00124c7a11edbdc30242ac120002'), 'default', 'security:manage', 'Manage Security', 'security', 'MANAGE', 'security', 'Manage platform security and RBAC mapping', 'security', 'security:manage', 0, 0);

-- Map permissions for ROLE_ULTRA_SUPER_ADMIN (all 18 permissions)
INSERT INTO role_permissions (role_id, permission_id) VALUES
(UNHEX('3f66a2a04c7a11edbdc30242ac120002'), UNHEX('4a1a00014c7a11edbdc30242ac120002')),
(UNHEX('3f66a2a04c7a11edbdc30242ac120002'), UNHEX('4a1a00024c7a11edbdc30242ac120002')),
(UNHEX('3f66a2a04c7a11edbdc30242ac120002'), UNHEX('4a1a00034c7a11edbdc30242ac120002')),
(UNHEX('3f66a2a04c7a11edbdc30242ac120002'), UNHEX('4a1a00044c7a11edbdc30242ac120002')),
(UNHEX('3f66a2a04c7a11edbdc30242ac120002'), UNHEX('4a1a00054c7a11edbdc30242ac120002')),
(UNHEX('3f66a2a04c7a11edbdc30242ac120002'), UNHEX('4a1a00064c7a11edbdc30242ac120002')),
(UNHEX('3f66a2a04c7a11edbdc30242ac120002'), UNHEX('4a1a00074c7a11edbdc30242ac120002')),
(UNHEX('3f66a2a04c7a11edbdc30242ac120002'), UNHEX('4a1a00084c7a11edbdc30242ac120002')),
(UNHEX('3f66a2a04c7a11edbdc30242ac120002'), UNHEX('4a1a00094c7a11edbdc30242ac120002')),
(UNHEX('3f66a2a04c7a11edbdc30242ac120002'), UNHEX('4a1a000a4c7a11edbdc30242ac120002')),
(UNHEX('3f66a2a04c7a11edbdc30242ac120002'), UNHEX('4a1a000b4c7a11edbdc30242ac120002')),
(UNHEX('3f66a2a04c7a11edbdc30242ac120002'), UNHEX('4a1a000c4c7a11edbdc30242ac120002')),
(UNHEX('3f66a2a04c7a11edbdc30242ac120002'), UNHEX('4a1a000d4c7a11edbdc30242ac120002')),
(UNHEX('3f66a2a04c7a11edbdc30242ac120002'), UNHEX('4a1a000e4c7a11edbdc30242ac120002')),
(UNHEX('3f66a2a04c7a11edbdc30242ac120002'), UNHEX('4a1a000f4c7a11edbdc30242ac120002')),
(UNHEX('3f66a2a04c7a11edbdc30242ac120002'), UNHEX('4a1a00104c7a11edbdc30242ac120002')),
(UNHEX('3f66a2a04c7a11edbdc30242ac120002'), UNHEX('4a1a00114c7a11edbdc30242ac120002')),
(UNHEX('3f66a2a04c7a11edbdc30242ac120002'), UNHEX('4a1a00124c7a11edbdc30242ac120002'));

-- Map permissions for ROLE_SUPER_ADMIN (15 permissions - cannot create/delete organization, cannot delete employee twin directly in UAT without check)
INSERT INTO role_permissions (role_id, permission_id) VALUES
(UNHEX('3f66a5024c7a11edbdc30242ac120002'), UNHEX('4a1a00014c7a11edbdc30242ac120002')), -- employee:create
(UNHEX('3f66a5024c7a11edbdc30242ac120002'), UNHEX('4a1a00024c7a11edbdc30242ac120002')), -- employee:update
(UNHEX('3f66a5024c7a11edbdc30242ac120002'), UNHEX('4a1a00034c7a11edbdc30242ac120002')), -- employee:view
(UNHEX('3f66a5024c7a11edbdc30242ac120002'), UNHEX('4a1a00044c7a11edbdc30242ac120002')), -- employee:delete
(UNHEX('3f66a5024c7a11edbdc30242ac120002'), UNHEX('4a1a00054c7a11edbdc30242ac120002')), -- employee:promote
(UNHEX('3f66a5024c7a11edbdc30242ac120002'), UNHEX('4a1a00064c7a11edbdc30242ac120002')), -- employee:transfer
(UNHEX('3f66a5024c7a11edbdc30242ac120002'), UNHEX('4a1a00074c7a11edbdc30242ac120002')), -- employee:terminate
(UNHEX('3f66a5024c7a11edbdc30242ac120002'), UNHEX('4a1a00094c7a11edbdc30242ac120002')), -- organization:update
(UNHEX('3f66a5024c7a11edbdc30242ac120002'), UNHEX('4a1a000a4c7a11edbdc30242ac120002')), -- organization:view
(UNHEX('3f66a5024c7a11edbdc30242ac120002'), UNHEX('4a1a000c4c7a11edbdc30242ac120002')), -- workflow:approve
(UNHEX('3f66a5024c7a11edbdc30242ac120002'), UNHEX('4a1a000d4c7a11edbdc30242ac120002')), -- workflow:reject
(UNHEX('3f66a5024c7a11edbdc30242ac120002'), UNHEX('4a1a000e4c7a11edbdc30242ac120002')), -- document:create
(UNHEX('3f66a5024c7a11edbdc30242ac120002'), UNHEX('4a1a000f4c7a11edbdc30242ac120002')), -- document:view
(UNHEX('3f66a5024c7a11edbdc30242ac120002'), UNHEX('4a1a00104c7a11edbdc30242ac120002')), -- document:update
(UNHEX('3f66a5024c7a11edbdc30242ac120002'), UNHEX('4a1a00114c7a11edbdc30242ac120002')), -- analytics:view
(UNHEX('3f66a5024c7a11edbdc30242ac120002'), UNHEX('4a1a00124c7a11edbdc30242ac120002')); -- security:manage

-- Map permissions for ROLE_ADMIN (12 permissions - no terminate, delete, security, or org modifications)
INSERT INTO role_permissions (role_id, permission_id) VALUES
(UNHEX('3f66a61a4c7a11edbdc30242ac120002'), UNHEX('4a1a00014c7a11edbdc30242ac120002')), -- employee:create
(UNHEX('3f66a61a4c7a11edbdc30242ac120002'), UNHEX('4a1a00024c7a11edbdc30242ac120002')), -- employee:update
(UNHEX('3f66a61a4c7a11edbdc30242ac120002'), UNHEX('4a1a00034c7a11edbdc30242ac120002')), -- employee:view
(UNHEX('3f66a61a4c7a11edbdc30242ac120002'), UNHEX('4a1a00054c7a11edbdc30242ac120002')), -- employee:promote
(UNHEX('3f66a61a4c7a11edbdc30242ac120002'), UNHEX('4a1a00064c7a11edbdc30242ac120002')), -- employee:transfer
(UNHEX('3f66a61a4c7a11edbdc30242ac120002'), UNHEX('4a1a000a4c7a11edbdc30242ac120002')), -- organization:view
(UNHEX('3f66a61a4c7a11edbdc30242ac120002'), UNHEX('4a1a000c4c7a11edbdc30242ac120002')), -- workflow:approve
(UNHEX('3f66a61a4c7a11edbdc30242ac120002'), UNHEX('4a1a000d4c7a11edbdc30242ac120002')), -- workflow:reject
(UNHEX('3f66a61a4c7a11edbdc30242ac120002'), UNHEX('4a1a000e4c7a11edbdc30242ac120002')), -- document:create
(UNHEX('3f66a61a4c7a11edbdc30242ac120002'), UNHEX('4a1a000f4c7a11edbdc30242ac120002')), -- document:view
(UNHEX('3f66a61a4c7a11edbdc30242ac120002'), UNHEX('4a1a00104c7a11edbdc30242ac120002')), -- document:update
(UNHEX('3f66a61a4c7a11edbdc30242ac120002'), UNHEX('4a1a00114c7a11edbdc30242ac120002')); -- analytics:view

-- Map permissions for ROLE_EMPLOYEE (4 permissions)
INSERT INTO role_permissions (role_id, permission_id) VALUES
(UNHEX('3f66a71e4c7a11edbdc30242ac120002'), UNHEX('4a1a00034c7a11edbdc30242ac120002')), -- employee:view (own profile view)
(UNHEX('3f66a71e4c7a11edbdc30242ac120002'), UNHEX('4a1a000e4c7a11edbdc30242ac120002')), -- document:create
(UNHEX('3f66a71e4c7a11edbdc30242ac120002'), UNHEX('4a1a000f4c7a11edbdc30242ac120002')), -- document:view
(UNHEX('3f66a71e4c7a11edbdc30242ac120002'), UNHEX('4a1a00104c7a11edbdc30242ac120002')); -- document:update
