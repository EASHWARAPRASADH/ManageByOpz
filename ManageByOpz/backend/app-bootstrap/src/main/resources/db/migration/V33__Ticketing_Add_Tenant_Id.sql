CREATE TABLE IF NOT EXISTS company_email_configs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL DEFAULT 'default',
    company_name VARCHAR(255) NOT NULL,
    email_address VARCHAR(255) NOT NULL UNIQUE,
    smtp_host VARCHAR(255) NOT NULL,
    smtp_port INT NOT NULL,
    smtp_user VARCHAR(255) NOT NULL,
    smtp_pass VARCHAR(255) NOT NULL,
    imap_host VARCHAR(255) NOT NULL,
    imap_port INT NOT NULL,
    imap_user VARCHAR(255) NOT NULL,
    imap_pass VARCHAR(255) NOT NULL,
    encryption VARCHAR(20) DEFAULT 'TLS',
    is_active TINYINT(1) DEFAULT 1,
    is_default TINYINT(1) DEFAULT 0,
    created_by VARCHAR(255) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255) NULL,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0,
    deleted TINYINT(1) NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP NULL,
    deleted_by VARCHAR(255) NULL,
    effective_date TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS email_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL DEFAULT 'default',
    ticket_id BIGINT NULL,
    ticket_number VARCHAR(255) NULL,
    direction VARCHAR(20) NOT NULL,
    recipient VARCHAR(255) NULL,
    sender VARCHAR(255) NULL,
    subject VARCHAR(255) NULL,
    body_preview TEXT NULL,
    message_id VARCHAR(255) NULL,
    in_reply_to VARCHAR(255) NULL,
    references_header TEXT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'pending',
    error_message TEXT NULL,
    email_type VARCHAR(50) DEFAULT 'notification',
    config_id BIGINT NULL,
    sent_at TIMESTAMP NULL,
    received_at TIMESTAMP NULL,
    created_by VARCHAR(255) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255) NULL,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0,
    deleted TINYINT(1) NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP NULL,
    deleted_by VARCHAR(255) NULL,
    effective_date TIMESTAMP NULL,
    INDEX idx_el_ticket (ticket_id),
    INDEX idx_el_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS message_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL DEFAULT 'default',
    user_id VARCHAR(128) NOT NULL,
    user_name VARCHAR(255) NULL,
    message_type VARCHAR(50) NOT NULL,
    recipient VARCHAR(255) NULL,
    message_content TEXT NULL,
    sent_at TIMESTAMP NULL,
    created_by VARCHAR(255) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255) NULL,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0,
    deleted TINYINT(1) NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP NULL,
    deleted_by VARCHAR(255) NULL,
    effective_date TIMESTAMP NULL,
    INDEX idx_msghist_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS notifications_queue (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL DEFAULT 'default',
    event_type VARCHAR(255) NOT NULL,
    ticket_id BIGINT NULL,
    ticket_number VARCHAR(64) NULL,
    recipient VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NULL,
    body_html LONGTEXT NULL,
    status VARCHAR(30) DEFAULT 'pending',
    priority INT DEFAULT 3,
    retry_count INT DEFAULT 0,
    max_retries INT DEFAULT 5,
    next_retry_at TIMESTAMP NULL,
    error_message TEXT NULL,
    config_id BIGINT NULL,
    metadata_json TEXT NULL,
    processed_at TIMESTAMP NULL,
    created_by VARCHAR(255) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255) NULL,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0,
    deleted TINYINT(1) NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP NULL,
    deleted_by VARCHAR(255) NULL,
    effective_date TIMESTAMP NULL,
    INDEX idx_nq_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS sla_breaches (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL DEFAULT 'default',
    record_id VARCHAR(128) NOT NULL,
    record_type VARCHAR(50) NOT NULL,
    assigned_user VARCHAR(128) NOT NULL,
    assigned_user_name VARCHAR(255) NULL,
    sla_name VARCHAR(100) NOT NULL,
    sla_target VARCHAR(100) NULL,
    actual_time_taken VARCHAR(100) NULL,
    breach_duration VARCHAR(100) NULL,
    breach_timeslot VARCHAR(100) NULL,
    breach_timestamp VARCHAR(100) NULL,
    status VARCHAR(50) DEFAULT 'active',
    created_by VARCHAR(255) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255) NULL,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0,
    deleted TINYINT(1) NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP NULL,
    deleted_by VARCHAR(255) NULL,
    effective_date TIMESTAMP NULL,
    INDEX idx_slabr_record (record_id),
    INDEX idx_slabr_user (assigned_user)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS ticket_custom_fields (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL DEFAULT 'default',
    ticket_id VARCHAR(128) NOT NULL,
    category_id BIGINT NOT NULL,
    category_name VARCHAR(255) NOT NULL,
    value_text VARCHAR(255) NOT NULL,
    created_by VARCHAR(255) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255) NULL,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0,
    deleted TINYINT(1) NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP NULL,
    deleted_by VARCHAR(255) NULL,
    effective_date TIMESTAMP NULL,
    INDEX idx_tcf_ticket (ticket_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE approvals ADD COLUMN tenant_id VARCHAR(100) NOT NULL DEFAULT 'default';
ALTER TABLE assets ADD COLUMN tenant_id VARCHAR(100) NOT NULL DEFAULT 'default';
ALTER TABLE assignment_groups ADD COLUMN tenant_id VARCHAR(100) NOT NULL DEFAULT 'default';
ALTER TABLE call_activities ADD COLUMN tenant_id VARCHAR(100) NOT NULL DEFAULT 'default';
ALTER TABLE call_logs ADD COLUMN tenant_id VARCHAR(100) NOT NULL DEFAULT 'default';
ALTER TABLE call_notes ADD COLUMN tenant_id VARCHAR(100) NOT NULL DEFAULT 'default';
ALTER TABLE categories ADD COLUMN tenant_id VARCHAR(100) NOT NULL DEFAULT 'default';
ALTER TABLE comments ADD COLUMN tenant_id VARCHAR(100) NOT NULL DEFAULT 'default';
-- ALTER TABLE company_email_configs ADD COLUMN tenant_id VARCHAR(100) NOT NULL DEFAULT 'default';
ALTER TABLE ticketing_departments ADD COLUMN tenant_id VARCHAR(100) NOT NULL DEFAULT 'default';
-- ALTER TABLE email_logs ADD COLUMN tenant_id VARCHAR(100) NOT NULL DEFAULT 'default';
-- ALTER TABLE message_history ADD COLUMN tenant_id VARCHAR(100) NOT NULL DEFAULT 'default';
ALTER TABLE ticketing_notifications ADD COLUMN tenant_id VARCHAR(100) NOT NULL DEFAULT 'default';
-- ALTER TABLE notifications_queue ADD COLUMN tenant_id VARCHAR(100) NOT NULL DEFAULT 'default';
ALTER TABLE ticketing_roles ADD COLUMN tenant_id VARCHAR(100) NOT NULL DEFAULT 'default';
-- ALTER TABLE sla_breaches ADD COLUMN tenant_id VARCHAR(100) NOT NULL DEFAULT 'default';
ALTER TABLE sla_policies ADD COLUMN tenant_id VARCHAR(100) NOT NULL DEFAULT 'default';
ALTER TABLE tickets ADD COLUMN tenant_id VARCHAR(100) NOT NULL DEFAULT 'default';
ALTER TABLE ticket_activities ADD COLUMN tenant_id VARCHAR(100) NOT NULL DEFAULT 'default';
-- ALTER TABLE ticket_custom_fields ADD COLUMN tenant_id VARCHAR(100) NOT NULL DEFAULT 'default';
ALTER TABLE time_cards ADD COLUMN tenant_id VARCHAR(100) NOT NULL DEFAULT 'default';
ALTER TABLE timesheets ADD COLUMN tenant_id VARCHAR(100) NOT NULL DEFAULT 'default';
ALTER TABLE ticketing_users ADD COLUMN tenant_id VARCHAR(100) NOT NULL DEFAULT 'default';

-- Add indices on tenant_id for high-performance query execution
CREATE INDEX idx_tickets_tenant ON tickets(tenant_id);
CREATE INDEX idx_users_tenant ON ticketing_users(tenant_id);
CREATE INDEX idx_timesheets_tenant ON timesheets(tenant_id);
CREATE INDEX idx_time_cards_tenant ON time_cards(tenant_id);
CREATE INDEX idx_comments_tenant ON comments(tenant_id);
CREATE INDEX idx_sla_policies_tenant ON sla_policies(tenant_id);
CREATE INDEX idx_sla_breaches_tenant ON sla_breaches(tenant_id);
CREATE INDEX idx_approvals_tenant ON approvals(tenant_id);
CREATE INDEX idx_assets_tenant ON assets(tenant_id);
