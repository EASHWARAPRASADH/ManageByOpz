-- Migration: V22__manpower_requisition_phase1.sql

-- Rename requisitions to manpower_requisitions
RENAME TABLE requisitions TO manpower_requisitions;

-- Add new enterprise columns to manpower_requisitions
ALTER TABLE manpower_requisitions 
    ADD COLUMN job_title VARCHAR(150) AFTER title,
    ADD COLUMN sub_department VARCHAR(100) AFTER department,
    ADD COLUMN reporting_manager VARCHAR(150) AFTER location,
    ADD COLUMN work_mode VARCHAR(50) AFTER employment_type,
    ADD COLUMN reason_for_hiring VARCHAR(100) AFTER priority,
    ADD COLUMN replacement_employee VARCHAR(150) AFTER reason_for_hiring,
    ADD COLUMN replacement_employee_id VARCHAR(50) AFTER replacement_employee,
    ADD COLUMN replacement_date DATE AFTER replacement_employee_id,
    ADD COLUMN min_experience INT AFTER vacancies,
    ADD COLUMN max_experience INT AFTER min_experience,
    ADD COLUMN min_budget DECIMAL(15,2) AFTER budget,
    ADD COLUMN max_budget DECIMAL(15,2) AFTER min_budget,
    ADD COLUMN cost_center VARCHAR(100) AFTER max_budget,
    ADD COLUMN required_skills TEXT AFTER cost_center,
    ADD COLUMN preferred_skills TEXT AFTER required_skills,
    ADD COLUMN certifications TEXT AFTER preferred_skills,
    ADD COLUMN languages VARCHAR(255) AFTER certifications,
    ADD COLUMN education VARCHAR(255) AFTER languages,
    ADD COLUMN business_justification TEXT AFTER education,
    ADD COLUMN project_name VARCHAR(150) AFTER business_justification,
    ADD COLUMN expected_business_impact TEXT AFTER project_name,
    ADD COLUMN revenue_impact VARCHAR(150) AFTER expected_business_impact,
    ADD COLUMN risk_not_filled TEXT AFTER revenue_impact,
    ADD COLUMN additional_notes TEXT AFTER risk_not_filled;

-- Create requisition_approval_steps table to track detailed multi-stage workflow approvals
CREATE TABLE IF NOT EXISTS requisition_approval_steps (
    id BINARY(16) NOT NULL PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    requisition_id BINARY(16) NOT NULL,
    step_name VARCHAR(150) NOT NULL,
    step_order INT NOT NULL,
    approver_role VARCHAR(100),
    approver_name VARCHAR(150),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED, ON_HOLD, DELEGATED, CHANGES_REQUESTED
    comments TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_approval_step_req FOREIGN KEY (requisition_id) REFERENCES manpower_requisitions(id) ON DELETE CASCADE,
    INDEX idx_approval_steps_req (requisition_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create requisition_attachments table
CREATE TABLE IF NOT EXISTS requisition_attachments (
    id BINARY(16) NOT NULL PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    requisition_id BINARY(16) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100),
    file_url VARCHAR(255) NOT NULL,
    file_size BIGINT,
    created_by VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_attachment_req FOREIGN KEY (requisition_id) REFERENCES manpower_requisitions(id) ON DELETE CASCADE,
    INDEX idx_attachments_req (requisition_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create requisition_comments table
CREATE TABLE IF NOT EXISTS requisition_comments (
    id BINARY(16) NOT NULL PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    requisition_id BINARY(16) NOT NULL,
    comment_text TEXT NOT NULL,
    author_name VARCHAR(150),
    created_by VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_comment_req FOREIGN KEY (requisition_id) REFERENCES manpower_requisitions(id) ON DELETE CASCADE,
    INDEX idx_comments_req (requisition_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create requisition_activity_logs table for comprehensive audit trails
CREATE TABLE IF NOT EXISTS requisition_activity_logs (
    id BINARY(16) NOT NULL PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    requisition_id BINARY(16) NOT NULL,
    activity_type VARCHAR(100) NOT NULL, -- CREATE, EDIT, SUBMIT, APPROVE, REJECT, COMMENT_ADDED, ATTACHMENT_UPLOADED
    description TEXT,
    ip_address VARCHAR(50),
    created_by VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_act_log_req FOREIGN KEY (requisition_id) REFERENCES manpower_requisitions(id) ON DELETE CASCADE,
    INDEX idx_act_logs_req (requisition_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create requisition_custom_fields table for dynamic forms configuration
CREATE TABLE IF NOT EXISTS requisition_custom_fields (
    id BINARY(16) NOT NULL PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    field_key VARCHAR(100) NOT NULL,
    field_label VARCHAR(150) NOT NULL,
    field_type VARCHAR(50) NOT NULL, -- Text, Number, Dropdown, Date, Currency
    required BOOLEAN NOT NULL DEFAULT FALSE,
    display_order INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create requisition_custom_values table to store custom properties
CREATE TABLE IF NOT EXISTS requisition_custom_values (
    id BINARY(16) NOT NULL PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    requisition_id BINARY(16) NOT NULL,
    field_key VARCHAR(100) NOT NULL,
    field_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_custom_val_req FOREIGN KEY (requisition_id) REFERENCES manpower_requisitions(id) ON DELETE CASCADE,
    INDEX idx_custom_vals_req (requisition_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create requisition_drafts table for auto-save support
CREATE TABLE IF NOT EXISTS requisition_drafts (
    id BINARY(16) NOT NULL PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    user_id VARCHAR(100) NOT NULL,
    draft_data TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create requisition_budget_analysis table to display hiring request vs budget KPIs
CREATE TABLE IF NOT EXISTS requisition_budget_analysis (
    id BINARY(16) NOT NULL PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    requisition_id BINARY(16) NOT NULL,
    dept_headcount INT DEFAULT 0,
    open_positions INT DEFAULT 0,
    budget_consumed DECIMAL(15,2) DEFAULT 0.00,
    budget_available DECIMAL(15,2) DEFAULT 0.00,
    requested_budget DECIMAL(15,2) DEFAULT 0.00,
    projected_budget DECIMAL(15,2) DEFAULT 0.00,
    CONSTRAINT fk_budget_analysis_req FOREIGN KEY (requisition_id) REFERENCES manpower_requisitions(id) ON DELETE CASCADE,
    INDEX idx_budget_analysis_req (requisition_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
