-- Seed LEAVE_REQUEST_CREATE Permission
INSERT INTO permissions (id, tenant_id, name, display_name, module_code, action, resource_type, description, module, permission_key, version, deleted) VALUES
(UNHEX('5a1a00064c7a11edbdc30242ac120002'), 'default', 'LEAVE_REQUEST_CREATE', 'Create Leave Request', 'leave', 'CREATE', 'leave', 'Permission to create/submit leave requests', 'leave', 'LEAVE_REQUEST_CREATE', 0, 0);

-- Map permission for ROLE_EMPLOYEE
INSERT INTO role_permissions (role_id, permission_id) VALUES
(UNHEX('3f66a71e4c7a11edbdc30242ac120002'), UNHEX('5a1a00064c7a11edbdc30242ac120002'));

-- Map permission for ROLE_ADMIN
INSERT INTO role_permissions (role_id, permission_id) VALUES
(UNHEX('3f66a61a4c7a11edbdc30242ac120002'), UNHEX('5a1a00064c7a11edbdc30242ac120002'));

-- Map permission for ROLE_SUPER_ADMIN
INSERT INTO role_permissions (role_id, permission_id) VALUES
(UNHEX('3f66a5024c7a11edbdc30242ac120002'), UNHEX('5a1a00064c7a11edbdc30242ac120002'));
