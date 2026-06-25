-- Seed Leave Permissions
INSERT INTO permissions (id, tenant_id, name, display_name, module_code, action, resource_type, description, module, permission_key, version, deleted) VALUES
(UNHEX('5a1a00014c7a11edbdc30242ac120002'), 'default', 'LEAVE_VIEW', 'View Leave Portal', 'leave', 'READ', 'leave', 'Permission to view own leave portal', 'leave', 'LEAVE_VIEW', 0, 0),
(UNHEX('5a1a00024c7a11edbdc30242ac120002'), 'default', 'LEAVE_APPLY', 'Apply Leave', 'leave', 'CREATE', 'leave', 'Permission to apply for leaves', 'leave', 'LEAVE_APPLY', 0, 0),
(UNHEX('5a1a00034c7a11edbdc30242ac120002'), 'default', 'LEAVE_CANCEL', 'Cancel Leave Request', 'leave', 'DELETE', 'leave', 'Permission to cancel pending leave requests', 'leave', 'LEAVE_CANCEL', 0, 0),
(UNHEX('5a1a00044c7a11edbdc30242ac120002'), 'default', 'LEAVE_BALANCE_VIEW', 'View Leave Balances', 'leave', 'READ', 'leave', 'Permission to view own leave balances', 'leave', 'LEAVE_BALANCE_VIEW', 0, 0),
(UNHEX('5a1a00054c7a11edbdc30242ac120002'), 'default', 'LEAVE_HISTORY_VIEW', 'View Leave Request History', 'leave', 'READ', 'leave', 'Permission to view own leave request history', 'leave', 'LEAVE_HISTORY_VIEW', 0, 0);

-- Map permissions for ROLE_EMPLOYEE (all 5 leave permissions)
INSERT INTO role_permissions (role_id, permission_id) VALUES
(UNHEX('3f66a71e4c7a11edbdc30242ac120002'), UNHEX('5a1a00014c7a11edbdc30242ac120002')),
(UNHEX('3f66a71e4c7a11edbdc30242ac120002'), UNHEX('5a1a00024c7a11edbdc30242ac120002')),
(UNHEX('3f66a71e4c7a11edbdc30242ac120002'), UNHEX('5a1a00034c7a11edbdc30242ac120002')),
(UNHEX('3f66a71e4c7a11edbdc30242ac120002'), UNHEX('5a1a00044c7a11edbdc30242ac120002')),
(UNHEX('3f66a71e4c7a11edbdc30242ac120002'), UNHEX('5a1a00054c7a11edbdc30242ac120002'));

-- Map permissions for ROLE_ADMIN (also gets these leave permissions)
INSERT INTO role_permissions (role_id, permission_id) VALUES
(UNHEX('3f66a61a4c7a11edbdc30242ac120002'), UNHEX('5a1a00014c7a11edbdc30242ac120002')),
(UNHEX('3f66a61a4c7a11edbdc30242ac120002'), UNHEX('5a1a00024c7a11edbdc30242ac120002')),
(UNHEX('3f66a61a4c7a11edbdc30242ac120002'), UNHEX('5a1a00034c7a11edbdc30242ac120002')),
(UNHEX('3f66a61a4c7a11edbdc30242ac120002'), UNHEX('5a1a00044c7a11edbdc30242ac120002')),
(UNHEX('3f66a61a4c7a11edbdc30242ac120002'), UNHEX('5a1a00054c7a11edbdc30242ac120002'));

-- Map permissions for ROLE_SUPER_ADMIN (gets these leave permissions)
INSERT INTO role_permissions (role_id, permission_id) VALUES
(UNHEX('3f66a5024c7a11edbdc30242ac120002'), UNHEX('5a1a00014c7a11edbdc30242ac120002')),
(UNHEX('3f66a5024c7a11edbdc30242ac120002'), UNHEX('5a1a00024c7a11edbdc30242ac120002')),
(UNHEX('3f66a5024c7a11edbdc30242ac120002'), UNHEX('5a1a00034c7a11edbdc30242ac120002')),
(UNHEX('3f66a5024c7a11edbdc30242ac120002'), UNHEX('5a1a00044c7a11edbdc30242ac120002')),
(UNHEX('3f66a5024c7a11edbdc30242ac120002'), UNHEX('5a1a00054c7a11edbdc30242ac120002'));
