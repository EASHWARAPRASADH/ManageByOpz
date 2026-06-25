-- Procedure to add columns safely and idempotently
DROP PROCEDURE IF EXISTS add_column_if_not_exists;
DELIMITER //
CREATE PROCEDURE add_column_if_not_exists(
    IN tableName VARCHAR(64),
    IN columnName VARCHAR(64),
    IN columnDesc VARCHAR(255)
)
BEGIN
    DECLARE col_exists INT DEFAULT 0;
    SELECT COUNT(*) INTO col_exists
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = tableName
      AND column_name = columnName;
    IF col_exists = 0 THEN
        SET @sql_stmt = CONCAT('ALTER TABLE ', tableName, ' ADD COLUMN ', columnName, ' ', columnDesc);
        PREPARE stmt FROM @sql_stmt;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END //
DELIMITER ;

-- Apply to security_roles
CALL add_column_if_not_exists('security_roles', 'created_at', 'DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP');
CALL add_column_if_not_exists('security_roles', 'updated_at', 'DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
CALL add_column_if_not_exists('security_roles', 'version', 'BIGINT DEFAULT 0');
CALL add_column_if_not_exists('security_roles', 'deleted', 'BIT DEFAULT 0 NOT NULL');
CALL add_column_if_not_exists('security_roles', 'deleted_at', 'DATETIME NULL');
CALL add_column_if_not_exists('security_roles', 'deleted_by', 'VARCHAR(255) NULL');
CALL add_column_if_not_exists('security_roles', 'effective_date', 'DATETIME DEFAULT CURRENT_TIMESTAMP');
CALL add_column_if_not_exists('security_roles', 'created_by', 'VARCHAR(255) NULL');
CALL add_column_if_not_exists('security_roles', 'updated_by', 'VARCHAR(255) NULL');

-- Apply to security_modules
CALL add_column_if_not_exists('security_modules', 'tenant_id', 'VARCHAR(255) NOT NULL DEFAULT \'default\'');
CALL add_column_if_not_exists('security_modules', 'created_at', 'DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP');
CALL add_column_if_not_exists('security_modules', 'updated_at', 'DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
CALL add_column_if_not_exists('security_modules', 'version', 'BIGINT DEFAULT 0');
CALL add_column_if_not_exists('security_modules', 'deleted', 'BIT DEFAULT 0 NOT NULL');
CALL add_column_if_not_exists('security_modules', 'deleted_at', 'DATETIME NULL');
CALL add_column_if_not_exists('security_modules', 'deleted_by', 'VARCHAR(255) NULL');
CALL add_column_if_not_exists('security_modules', 'effective_date', 'DATETIME DEFAULT CURRENT_TIMESTAMP');
CALL add_column_if_not_exists('security_modules', 'created_by', 'VARCHAR(255) NULL');
CALL add_column_if_not_exists('security_modules', 'updated_by', 'VARCHAR(255) NULL');

-- Apply to security_pages
CALL add_column_if_not_exists('security_pages', 'tenant_id', 'VARCHAR(255) NOT NULL DEFAULT \'default\'');
CALL add_column_if_not_exists('security_pages', 'created_at', 'DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP');
CALL add_column_if_not_exists('security_pages', 'updated_at', 'DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
CALL add_column_if_not_exists('security_pages', 'version', 'BIGINT DEFAULT 0');
CALL add_column_if_not_exists('security_pages', 'deleted', 'BIT DEFAULT 0 NOT NULL');
CALL add_column_if_not_exists('security_pages', 'deleted_at', 'DATETIME NULL');
CALL add_column_if_not_exists('security_pages', 'deleted_by', 'VARCHAR(255) NULL');
CALL add_column_if_not_exists('security_pages', 'effective_date', 'DATETIME DEFAULT CURRENT_TIMESTAMP');
CALL add_column_if_not_exists('security_pages', 'created_by', 'VARCHAR(255) NULL');
CALL add_column_if_not_exists('security_pages', 'updated_by', 'VARCHAR(255) NULL');

-- Apply to security_permissions
CALL add_column_if_not_exists('security_permissions', 'tenant_id', 'VARCHAR(255) NOT NULL DEFAULT \'default\'');
CALL add_column_if_not_exists('security_permissions', 'created_at', 'DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP');
CALL add_column_if_not_exists('security_permissions', 'updated_at', 'DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
CALL add_column_if_not_exists('security_permissions', 'version', 'BIGINT DEFAULT 0');
CALL add_column_if_not_exists('security_permissions', 'deleted', 'BIT DEFAULT 0 NOT NULL');
CALL add_column_if_not_exists('security_permissions', 'deleted_at', 'DATETIME NULL');
CALL add_column_if_not_exists('security_permissions', 'deleted_by', 'VARCHAR(255) NULL');
CALL add_column_if_not_exists('security_permissions', 'effective_date', 'DATETIME DEFAULT CURRENT_TIMESTAMP');
CALL add_column_if_not_exists('security_permissions', 'created_by', 'VARCHAR(255) NULL');
CALL add_column_if_not_exists('security_permissions', 'updated_by', 'VARCHAR(255) NULL');

-- Drop procedure
DROP PROCEDURE IF EXISTS add_column_if_not_exists;

-- Add archive_reason to employee_twins idempotently
DROP PROCEDURE IF EXISTS add_archive_reason;
DELIMITER //
CREATE PROCEDURE add_archive_reason()
BEGIN
    DECLARE col_exists INT DEFAULT 0;
    SELECT COUNT(*) INTO col_exists
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'employee_twins'
      AND column_name = 'archive_reason';
    IF col_exists = 0 THEN
        ALTER TABLE employee_twins ADD COLUMN archive_reason VARCHAR(255) DEFAULT NULL;
    END IF;
END //
DELIMITER ;
CALL add_archive_reason();
DROP PROCEDURE add_archive_reason;

-- Insert new permissions for archive and restore into security_permissions
INSERT IGNORE INTO security_permissions (id, permission_code, permission_name, category, tenant_id, deleted, version) VALUES
(UNHEX('4a1a00204c7a11edbdc30242ac120002'), 'ARCHIVE', 'Archive', 'Action', 'default', 0, 0),
(UNHEX('4a1a00214c7a11edbdc30242ac120002'), 'RESTORE', 'Restore', 'Action', 'default', 0, 0);

-- Map permissions for ROLE_ULTRA_SUPER_ADMIN (to Employee Directory page)
INSERT IGNORE INTO role_permissions (role_id, page_id, permission_id) VALUES
(UNHEX('3f66a2a04c7a11edbdc30242ac120002'), UNHEX('22edbdc30242ac120002000000000002'), UNHEX('4a1a00204c7a11edbdc30242ac120002')),
(UNHEX('3f66a2a04c7a11edbdc30242ac120002'), UNHEX('22edbdc30242ac120002000000000002'), UNHEX('4a1a00214c7a11edbdc30242ac120002'));

-- Map permissions for ROLE_SUPER_ADMIN (to Employee Directory page)
INSERT IGNORE INTO role_permissions (role_id, page_id, permission_id) VALUES
(UNHEX('3f66a5024c7a11edbdc30242ac120002'), UNHEX('22edbdc30242ac120002000000000002'), UNHEX('4a1a00204c7a11edbdc30242ac120002')),
(UNHEX('3f66a5024c7a11edbdc30242ac120002'), UNHEX('22edbdc30242ac120002000000000002'), UNHEX('4a1a00214c7a11edbdc30242ac120002'));

-- Map permissions for ROLE_ADMIN (to Employee Directory page)
INSERT IGNORE INTO role_permissions (role_id, page_id, permission_id) VALUES
(UNHEX('3f66a61a4c7a11edbdc30242ac120002'), UNHEX('22edbdc30242ac120002000000000002'), UNHEX('4a1a00204c7a11edbdc30242ac120002')),
(UNHEX('3f66a61a4c7a11edbdc30242ac120002'), UNHEX('22edbdc30242ac120002000000000002'), UNHEX('4a1a00214c7a11edbdc30242ac120002'));
