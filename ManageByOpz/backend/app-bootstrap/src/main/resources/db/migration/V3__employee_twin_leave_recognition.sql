-- V3: Employee Digital Twin + Leave + Recognition

CREATE TABLE IF NOT EXISTS employee_twins (
    id BINARY(16) NOT NULL PRIMARY KEY, tenant_id VARCHAR(100) NOT NULL,
    employee_code VARCHAR(50) NOT NULL UNIQUE, first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100), last_name VARCHAR(100) NOT NULL, display_name VARCHAR(255),
    date_of_birth DATE, gender VARCHAR(20), nationality VARCHAR(100),
    marital_status VARCHAR(50), blood_group VARCHAR(10), preferred_language VARCHAR(50),
    avatar_url VARCHAR(500),
    work_email VARCHAR(255) NOT NULL UNIQUE, personal_email VARCHAR(255),
    work_phone VARCHAR(50), personal_phone VARCHAR(50),
    current_address TEXT, permanent_address TEXT,
    emergency_contact_name VARCHAR(255), emergency_contact_phone VARCHAR(50),
    emergency_contact_relation VARCHAR(100),
    organization_id BINARY(16), business_unit_id BINARY(16), division_id BINARY(16),
    department_id BINARY(16), sub_department_id BINARY(16), designation_id BINARY(16),
    location_id BINARY(16), grade_id BINARY(16), band_id BINARY(16),
    cost_center_id BINARY(16), employment_type_id BINARY(16), manager_id BINARY(16),
    date_of_joining DATE, confirmation_date DATE, probation_end_date DATE,
    notice_period_days INT, employment_status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    pan_number VARCHAR(20), aadhaar_number VARCHAR(20), uan_number VARCHAR(30),
    esic_number VARCHAR(30), passport_number VARCHAR(30), passport_expiry DATE,
    bank_name VARCHAR(255), bank_account_number VARCHAR(50), bank_ifsc VARCHAR(20),
    bank_branch VARCHAR(255),
    created_by VARCHAR(255), created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255), updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0, deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL, deleted_by VARCHAR(255),
    INDEX idx_twin_tenant (tenant_id), INDEX idx_twin_code (employee_code),
    INDEX idx_twin_email (work_email), INDEX idx_twin_dept (department_id),
    INDEX idx_twin_mgr (manager_id), INDEX idx_twin_status (employment_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS employee_skills (
    id BINARY(16) NOT NULL PRIMARY KEY, tenant_id VARCHAR(100) NOT NULL,
    employee_twin_id BINARY(16) NOT NULL, skill_name VARCHAR(255) NOT NULL,
    skill_category VARCHAR(50), proficiency_level VARCHAR(50),
    years_of_experience DOUBLE, self_rating INT, manager_rating INT,
    verified BOOLEAN DEFAULT FALSE,
    created_by VARCHAR(255), created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255), updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0, deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL, deleted_by VARCHAR(255),
    FOREIGN KEY (employee_twin_id) REFERENCES employee_twins(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS employee_certifications (
    id BINARY(16) NOT NULL PRIMARY KEY, tenant_id VARCHAR(100) NOT NULL,
    employee_twin_id BINARY(16) NOT NULL, certification_name VARCHAR(255) NOT NULL,
    issuing_authority VARCHAR(255), credential_id VARCHAR(100),
    issue_date DATE, expiry_date DATE, credential_url VARCHAR(500),
    verified BOOLEAN DEFAULT FALSE,
    created_by VARCHAR(255), created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255), updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0, deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL, deleted_by VARCHAR(255),
    FOREIGN KEY (employee_twin_id) REFERENCES employee_twins(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS employee_documents (
    id BINARY(16) NOT NULL PRIMARY KEY, tenant_id VARCHAR(100) NOT NULL,
    employee_twin_id BINARY(16) NOT NULL, document_type VARCHAR(100) NOT NULL,
    document_name VARCHAR(255) NOT NULL, file_path VARCHAR(500), file_size BIGINT,
    mime_type VARCHAR(100), version_number INT DEFAULT 1, expiry_date DATE,
    verification_status VARCHAR(50) DEFAULT 'PENDING', verified_by VARCHAR(255),
    ocr_extracted_text TEXT, digital_signature VARCHAR(500),
    created_by VARCHAR(255), created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255), updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0, deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL, deleted_by VARCHAR(255),
    FOREIGN KEY (employee_twin_id) REFERENCES employee_twins(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS employee_relationships (
    id BINARY(16) NOT NULL PRIMARY KEY, tenant_id VARCHAR(100) NOT NULL,
    employee_twin_id BINARY(16) NOT NULL, relationship_type VARCHAR(50) NOT NULL,
    related_employee_id BINARY(16) NOT NULL,
    effective_from DATE, effective_to DATE, is_primary BOOLEAN DEFAULT FALSE, notes TEXT,
    created_by VARCHAR(255), created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255), updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0, deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL, deleted_by VARCHAR(255),
    FOREIGN KEY (employee_twin_id) REFERENCES employee_twins(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS employee_timeline (
    id BINARY(16) NOT NULL PRIMARY KEY, tenant_id VARCHAR(100) NOT NULL,
    employee_twin_id BINARY(16) NOT NULL, event_type VARCHAR(50) NOT NULL,
    event_date DATE NOT NULL, title VARCHAR(255) NOT NULL, description TEXT,
    metadata_json JSON, triggered_by VARCHAR(255),
    created_by VARCHAR(255), created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255), updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0, deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL, deleted_by VARCHAR(255),
    FOREIGN KEY (employee_twin_id) REFERENCES employee_twins(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS employee_custom_fields (
    id BINARY(16) NOT NULL PRIMARY KEY, tenant_id VARCHAR(100) NOT NULL,
    employee_twin_id BINARY(16) NOT NULL, field_key VARCHAR(100) NOT NULL,
    field_value TEXT, field_type VARCHAR(50), field_group VARCHAR(100), display_order INT DEFAULT 0,
    created_by VARCHAR(255), created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255), updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0, deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL, deleted_by VARCHAR(255),
    FOREIGN KEY (employee_twin_id) REFERENCES employee_twins(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Leave Management
CREATE TABLE IF NOT EXISTS leave_types (
    id BINARY(16) NOT NULL PRIMARY KEY, tenant_id VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL, code VARCHAR(50) NOT NULL, description TEXT,
    default_days DOUBLE, carry_forward_allowed BOOLEAN DEFAULT FALSE,
    max_carry_forward_days DOUBLE DEFAULT 0, encashment_allowed BOOLEAN DEFAULT FALSE,
    half_day_allowed BOOLEAN DEFAULT TRUE, negative_balance_allowed BOOLEAN DEFAULT FALSE,
    requires_approval BOOLEAN DEFAULT TRUE, requires_document BOOLEAN DEFAULT FALSE,
    min_days_notice INT DEFAULT 0, max_consecutive_days INT DEFAULT 0,
    active BOOLEAN DEFAULT TRUE, leave_policy_id BINARY(16),
    created_by VARCHAR(255), created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255), updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0, deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL, deleted_by VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS leave_balances (
    id BINARY(16) NOT NULL PRIMARY KEY, tenant_id VARCHAR(100) NOT NULL,
    employee_id BINARY(16) NOT NULL, leave_type_id BINARY(16) NOT NULL,
    year INT NOT NULL, total_allocated DOUBLE DEFAULT 0, total_used DOUBLE DEFAULT 0,
    total_pending DOUBLE DEFAULT 0, carried_forward DOUBLE DEFAULT 0, balance DOUBLE DEFAULT 0,
    created_by VARCHAR(255), created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255), updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0, deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL, deleted_by VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS leave_requests (
    id BINARY(16) NOT NULL PRIMARY KEY, tenant_id VARCHAR(100) NOT NULL,
    employee_id BINARY(16) NOT NULL, leave_type_id BINARY(16) NOT NULL,
    start_date DATE NOT NULL, end_date DATE NOT NULL, days_count DOUBLE NOT NULL,
    half_day BOOLEAN DEFAULT FALSE, half_day_type VARCHAR(20),
    reason TEXT, status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    approved_by VARCHAR(255), rejection_reason TEXT,
    workflow_instance_id BINARY(16), cancellation_reason TEXT,
    created_by VARCHAR(255), created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255), updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0, deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL, deleted_by VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Recognition
CREATE TABLE IF NOT EXISTS recognitions (
    id BINARY(16) NOT NULL PRIMARY KEY, tenant_id VARCHAR(100) NOT NULL,
    giver_employee_id BINARY(16) NOT NULL, receiver_employee_id BINARY(16) NOT NULL,
    recognition_type VARCHAR(50) NOT NULL, title VARCHAR(255) NOT NULL,
    message TEXT, points INT DEFAULT 0, badge_id BINARY(16), award_id BINARY(16),
    visibility VARCHAR(50) DEFAULT 'PUBLIC', approved BOOLEAN DEFAULT TRUE,
    created_by VARCHAR(255), created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255), updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0, deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL, deleted_by VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
