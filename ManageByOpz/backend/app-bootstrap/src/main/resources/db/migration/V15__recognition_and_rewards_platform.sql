-- V15: Enterprise Recognition & Rewards Platform

CREATE TABLE IF NOT EXISTS recognition_values (
    id BINARY(16) NOT NULL PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(100),
    color VARCHAR(50),
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    weight DOUBLE DEFAULT 1.0,
    created_by VARCHAR(255), created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255), updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0, deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL, deleted_by VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS recognition_types (
    id BINARY(16) NOT NULL PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    default_points INT DEFAULT 50,
    visibility_rules VARCHAR(255) DEFAULT 'PUBLIC',
    approval_rules VARCHAR(255) DEFAULT 'NONE',
    badge_mapping VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_by VARCHAR(255), created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255), updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0, deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL, deleted_by VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS recognition_comments (
    id BINARY(16) NOT NULL PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    recognition_id BINARY(16) NOT NULL,
    employee_id BINARY(16) NOT NULL,
    comment_text TEXT NOT NULL,
    created_by VARCHAR(255), created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255), updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0, deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL, deleted_by VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS recognition_reactions (
    id BINARY(16) NOT NULL PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    recognition_id BINARY(16) NOT NULL,
    employee_id BINARY(16) NOT NULL,
    reaction_type VARCHAR(50) NOT NULL, -- LIKE, CELEBRATE, APPLAUD, INSPIRE
    created_by VARCHAR(255), created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255), updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0, deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL, deleted_by VARCHAR(255),
    UNIQUE KEY uq_rec_emp_react (recognition_id, employee_id, reaction_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS recognition_points_wallets (
    id BINARY(16) NOT NULL PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    employee_id BINARY(16) NOT NULL UNIQUE,
    current_balance INT DEFAULT 0,
    monthly_allocation INT DEFAULT 100,
    used INT DEFAULT 0,
    remaining INT DEFAULT 100,
    expired INT DEFAULT 0,
    created_by VARCHAR(255), created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255), updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0, deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL, deleted_by VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS recognition_points_transactions (
    id BINARY(16) NOT NULL PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    wallet_id BINARY(16) NOT NULL,
    employee_id BINARY(16) NOT NULL,
    transaction_type VARCHAR(50) NOT NULL, -- ALLOCATION, REWARD_REDEMPTION, RECOGNITION_GIVEN, RECOGNITION_RECEIVED, EXPIRATION, MANUAL_ADJUSTMENT
    points INT NOT NULL,
    reason VARCHAR(255),
    reference_id BINARY(16),
    created_by VARCHAR(255), created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255), updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0, deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL, deleted_by VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS reward_catalogs (
    id BINARY(16) NOT NULL PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    cost INT NOT NULL,
    inventory INT DEFAULT 999,
    country VARCHAR(100) DEFAULT 'ALL',
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    tax_applicable BOOLEAN DEFAULT FALSE,
    category VARCHAR(100) DEFAULT 'GIFT_CARD',
    created_by VARCHAR(255), created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255), updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0, deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL, deleted_by VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS reward_redemptions (
    id BINARY(16) NOT NULL PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    employee_id BINARY(16) NOT NULL,
    reward_id BINARY(16) NOT NULL,
    points_used INT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- PENDING, APPROVED, FULFILLED, DELIVERED, REJECTED
    delivery_details TEXT,
    tracking_number VARCHAR(100),
    created_by VARCHAR(255), created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255), updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0, deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL, deleted_by VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS award_programs (
    id BINARY(16) NOT NULL PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL, -- MONTHLY, QUARTERLY, YEARLY, SPECIAL
    active BOOLEAN DEFAULT TRUE,
    budget_limit INT DEFAULT 0,
    created_by VARCHAR(255), created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255), updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0, deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL, deleted_by VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS award_nominations (
    id BINARY(16) NOT NULL PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    program_id BINARY(16) NOT NULL,
    nominee_employee_id BINARY(16) NOT NULL,
    nominator_employee_id BINARY(16) NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- PENDING, UNDER_REVIEW, APPROVED, REJECTED
    evidence_url VARCHAR(255),
    vote_count INT DEFAULT 0,
    score DOUBLE DEFAULT 0.0,
    created_by VARCHAR(255), created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255), updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0, deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL, deleted_by VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed core values
INSERT INTO recognition_values (id, tenant_id, name, code, description, icon, color, status, weight) VALUES
(UUID_TO_BIN(UUID()), 'default', 'Innovation', 'INNOVATION', 'Promotes out-of-the-box thinking and creative problem solving', 'Sparkles', 'indigo', 'ACTIVE', 1.2),
(UUID_TO_BIN(UUID()), 'default', 'Customer First', 'CUSTOMER_FIRST', 'Puts client satisfaction and relationship at the core', 'Heart', 'emerald', 'ACTIVE', 1.2),
(UUID_TO_BIN(UUID()), 'default', 'Integrity', 'INTEGRITY', 'Doing the right thing, always', 'Shield', 'blue', 'ACTIVE', 1.0),
(UUID_TO_BIN(UUID()), 'default', 'Collaboration', 'COLLABORATION', 'Stronger together as one cohesive team', 'Users', 'purple', 'ACTIVE', 1.0),
(UUID_TO_BIN(UUID()), 'default', 'Excellence', 'EXCELLENCE', 'Delivers superior quality and high performance', 'Trophy', 'amber', 'ACTIVE', 1.3);

-- Seed core types
INSERT INTO recognition_types (id, tenant_id, name, code, description, default_points, visibility_rules, approval_rules, badge_mapping, status) VALUES
(UUID_TO_BIN(UUID()), 'default', 'Thank You', 'THANK_YOU', 'Expressing gratitude for support', 50, 'PUBLIC', 'NONE', 'Team Player', 'ACTIVE'),
(UUID_TO_BIN(UUID()), 'default', 'Helping Hand', 'HELPING_HAND', 'Going out of the way to assist others', 100, 'PUBLIC', 'NONE', 'Problem Solver', 'ACTIVE'),
(UUID_TO_BIN(UUID()), 'default', 'Innovation Award', 'INNOVATION_AWARD', 'Rewarding high impact innovative designs', 250, 'PUBLIC', 'MANAGER', 'Super Architect', 'ACTIVE');

-- Alter recognitions table to add new columns
ALTER TABLE recognitions ADD COLUMN recognition_value_id BINARY(16) NULL;
ALTER TABLE recognitions ADD COLUMN tags VARCHAR(255) NULL;
ALTER TABLE recognitions ADD COLUMN project_ref VARCHAR(255) NULL;
ALTER TABLE recognitions ADD COLUMN business_impact TEXT NULL;
