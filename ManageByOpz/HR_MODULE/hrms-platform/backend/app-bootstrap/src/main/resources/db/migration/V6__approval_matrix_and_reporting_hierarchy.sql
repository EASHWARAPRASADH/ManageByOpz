-- V6: Org DNA Extensions - Approval Matrix and Reporting Hierarchy Fields

-- 1. Add reporting hierarchy columns to employee_twins
ALTER TABLE employee_twins
    ADD COLUMN skip_manager_id BINARY(16) NULL,
    ADD COLUMN department_head_id BINARY(16) NULL,
    ADD COLUMN hrbp_id BINARY(16) NULL,
    ADD COLUMN mentor_id BINARY(16) NULL,
    ADD COLUMN buddy_id BINARY(16) NULL,
    ADD CONSTRAINT fk_twin_skip_manager FOREIGN KEY (skip_manager_id) REFERENCES employee_twins(id),
    ADD CONSTRAINT fk_twin_dept_head FOREIGN KEY (department_head_id) REFERENCES employee_twins(id),
    ADD CONSTRAINT fk_twin_hrbp FOREIGN KEY (hrbp_id) REFERENCES employee_twins(id),
    ADD CONSTRAINT fk_twin_mentor FOREIGN KEY (mentor_id) REFERENCES employee_twins(id),
    ADD CONSTRAINT fk_twin_buddy FOREIGN KEY (buddy_id) REFERENCES employee_twins(id);

-- 2. Add category to designations
ALTER TABLE designations
    ADD COLUMN category VARCHAR(100) NULL AFTER code;

-- 3. Add department mapping to cost_centers
ALTER TABLE cost_centers
    ADD COLUMN department_id BINARY(16) NULL,
    ADD CONSTRAINT fk_cost_center_department FOREIGN KEY (department_id) REFERENCES departments(id);

-- 4. Create Approval Matrix table
CREATE TABLE IF NOT EXISTS approval_matrices (
    id BINARY(16) NOT NULL PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    department_id BINARY(16) NULL,
    designation_id BINARY(16) NULL,
    grade_id BINARY(16) NULL,
    approval_type VARCHAR(100) NOT NULL,
    approver_level1_id BINARY(16) NULL,
    approver_level2_id BINARY(16) NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by VARCHAR(255) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255) NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL,
    deleted_by VARCHAR(255) NULL,
    CONSTRAINT fk_matrix_dept FOREIGN KEY (department_id) REFERENCES departments(id),
    CONSTRAINT fk_matrix_designation FOREIGN KEY (designation_id) REFERENCES designations(id),
    CONSTRAINT fk_matrix_grade FOREIGN KEY (grade_id) REFERENCES grades(id),
    CONSTRAINT fk_matrix_approver1 FOREIGN KEY (approver_level1_id) REFERENCES employee_twins(id),
    CONSTRAINT fk_matrix_approver2 FOREIGN KEY (approver_level2_id) REFERENCES employee_twins(id),
    INDEX idx_matrix_tenant (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
