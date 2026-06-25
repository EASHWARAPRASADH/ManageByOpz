-- Migration: Create tables for Phase 1 - Global Dashboard Builder with Binary UUIDs matching BaseEntity

CREATE TABLE IF NOT EXISTS dashboard_widgets (
    id VARCHAR(36) PRIMARY KEY,
    widget_key VARCHAR(50) NOT NULL UNIQUE,
    default_title VARCHAR(100) NOT NULL,
    default_w INT NOT NULL,
    default_h INT NOT NULL,
    min_w INT DEFAULT 1,
    min_h INT DEFAULT 1,
    component_name VARCHAR(100) NOT NULL,
    active BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS dashboard_layouts (
    id BINARY(16) NOT NULL PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    user_id BINARY(16) NOT NULL,
    layout_name VARCHAR(100) DEFAULT 'Default',
    is_active BOOLEAN DEFAULT TRUE,
    created_by VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL,
    deleted_by VARCHAR(255),
    CONSTRAINT fk_dashboard_layout_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_layout_tenant (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS dashboard_preferences (
    id BINARY(16) NOT NULL PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    layout_id BINARY(16) NOT NULL,
    widget_id VARCHAR(36) NOT NULL,
    position_x INT NOT NULL,
    position_y INT NOT NULL,
    width INT NOT NULL,
    height INT NOT NULL,
    custom_title VARCHAR(255),
    is_visible BOOLEAN DEFAULT TRUE,
    created_by VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL,
    deleted_by VARCHAR(255),
    CONSTRAINT fk_pref_layout FOREIGN KEY (layout_id) REFERENCES dashboard_layouts(id) ON DELETE CASCADE,
    CONSTRAINT fk_pref_widget FOREIGN KEY (widget_id) REFERENCES dashboard_widgets(id) ON DELETE CASCADE,
    INDEX idx_pref_tenant (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed some default widgets
INSERT INTO dashboard_widgets (id, widget_key, default_title, default_w, default_h, min_w, min_h, component_name, active) VALUES
('w-1', 'headcount', 'Headcount Breakdown', 4, 3, 2, 2, 'HeadcountWidget', 1),
('w-2', 'leave_balance', 'My Leave Balances', 4, 2, 2, 1, 'LeaveBalanceWidget', 1),
('w-3', 'attendance', 'Today Attendance Status', 4, 2, 2, 1, 'AttendanceWidget', 1),
('w-4', 'recognition', 'Recent Recognition Feed', 4, 3, 2, 2, 'RecognitionWidget', 1),
('w-5', 'pending_approvals', 'My Pending Approvals', 4, 2, 2, 1, 'PendingApprovalsWidget', 1),
('w-6', 'workforce_health', 'Workforce Health Index', 4, 2, 2, 1, 'WorkforceHealthWidget', 1),
('w-7', 'burnout_risk', 'Burnout Risk Alerts', 4, 2, 2, 1, 'BurnoutRiskWidget', 1);
