-- V7: Org DNA Phase 2 - Advanced Structure Engine, Numbering, Positions, Approval V2

-- 1. Alter organizations table to include numbering configuration
ALTER TABLE organizations
    ADD COLUMN employee_code_prefix VARCHAR(50) NULL,
    ADD COLUMN sequence_length INT NULL DEFAULT 6,
    ADD COLUMN starting_sequence_number INT NULL DEFAULT 1,
    ADD COLUMN employee_code_pattern VARCHAR(100) NULL DEFAULT '{ORG}-{SEQ:6}';

-- 2. Drop and recreate employee_code_sequences table to support Phase 2 fields
DROP TABLE IF EXISTS employee_code_sequences;
CREATE TABLE employee_code_sequences (
    id BINARY(16) NOT NULL PRIMARY KEY,
    organization_id BINARY(16) NOT NULL,
    prefix VARCHAR(50) NULL,
    current_sequence INT NOT NULL DEFAULT 0,
    sequence_length INT NOT NULL DEFAULT 6,
    pattern VARCHAR(100) NOT NULL DEFAULT '{ORG}-{SEQ:6}',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_sequence_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Alter approval_matrices table to support Version 2 (Levels 3 & 4, Approver Types, Location/Employment conditions)
ALTER TABLE approval_matrices
    ADD COLUMN approver_level1_type VARCHAR(100) NULL,
    ADD COLUMN approver_level2_type VARCHAR(100) NULL,
    ADD COLUMN approver_level3_id BINARY(16) NULL,
    ADD COLUMN approver_level3_type VARCHAR(100) NULL,
    ADD COLUMN approver_level4_id BINARY(16) NULL,
    ADD COLUMN approver_level4_type VARCHAR(100) NULL,
    ADD COLUMN location_id BINARY(16) NULL,
    ADD COLUMN employment_type_id BINARY(16) NULL,
    ADD COLUMN min_amount DECIMAL(15,2) NULL,
    ADD COLUMN max_amount DECIMAL(15,2) NULL,
    ADD CONSTRAINT fk_matrix_approver3 FOREIGN KEY (approver_level3_id) REFERENCES employee_twins(id),
    ADD CONSTRAINT fk_matrix_approver4 FOREIGN KEY (approver_level4_id) REFERENCES employee_twins(id),
    ADD CONSTRAINT fk_matrix_location FOREIGN KEY (location_id) REFERENCES locations(id),
    ADD CONSTRAINT fk_matrix_emp_type FOREIGN KEY (employment_type_id) REFERENCES employment_types(id);

-- 4. Create positions table for Position Management
CREATE TABLE IF NOT EXISTS positions (
    id BINARY(16) NOT NULL PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    department_id BINARY(16) NULL,
    grade_id BINARY(16) NULL,
    band_id BINARY(16) NULL,
    location_id BINARY(16) NULL,
    reports_to_position_id BINARY(16) NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    budgeted BOOLEAN NOT NULL DEFAULT TRUE,
    vacant BOOLEAN NOT NULL DEFAULT TRUE,
    filled BOOLEAN NOT NULL DEFAULT FALSE,
    created_by VARCHAR(255) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255) NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL,
    deleted_by VARCHAR(255) NULL,
    CONSTRAINT fk_position_dept FOREIGN KEY (department_id) REFERENCES departments(id),
    CONSTRAINT fk_position_grade FOREIGN KEY (grade_id) REFERENCES grades(id),
    CONSTRAINT fk_position_band FOREIGN KEY (band_id) REFERENCES bands(id),
    CONSTRAINT fk_position_location FOREIGN KEY (location_id) REFERENCES locations(id),
    CONSTRAINT fk_position_reports_to FOREIGN KEY (reports_to_position_id) REFERENCES positions(id),
    INDEX idx_position_tenant (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Add position_id link to employee_twins
ALTER TABLE employee_twins
    ADD COLUMN position_id BINARY(16) NULL,
    ADD CONSTRAINT fk_twin_position FOREIGN KEY (position_id) REFERENCES positions(id);
