-- Migration: V20__dynamic_recruitment_config.sql

-- Form Definitions
CREATE TABLE IF NOT EXISTS form_definition (
    id BINARY(16) NOT NULL PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    module_name VARCHAR(100) NOT NULL,
    form_name VARCHAR(150) NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_by VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL,
    deleted_by VARCHAR(255),
    effective_date DATETIME(6) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Form Sections
CREATE TABLE IF NOT EXISTS form_section (
    id BINARY(16) NOT NULL PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    form_id BINARY(16) NOT NULL,
    section_name VARCHAR(150) NOT NULL,
    display_order INT NOT NULL,
    created_by VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL,
    deleted_by VARCHAR(255),
    effective_date DATETIME(6) NULL,
    CONSTRAINT fk_form_sec_form FOREIGN KEY (form_id) REFERENCES form_definition(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Field Definitions
CREATE TABLE IF NOT EXISTS field_definition (
    id BINARY(16) NOT NULL PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    form_id BINARY(16) NOT NULL,
    field_key VARCHAR(100) NOT NULL,
    field_label VARCHAR(150) NOT NULL,
    field_type VARCHAR(50) NOT NULL,
    required BOOLEAN NOT NULL DEFAULT FALSE,
    visible BOOLEAN NOT NULL DEFAULT TRUE,
    read_only BOOLEAN NOT NULL DEFAULT FALSE,
    default_value VARCHAR(255),
    validation_json TEXT,
    display_order INT NOT NULL,
    created_by VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL,
    deleted_by VARCHAR(255),
    effective_date DATETIME(6) NULL,
    CONSTRAINT fk_field_def_form FOREIGN KEY (form_id) REFERENCES form_definition(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Field Options (For dropdowns/radios)
CREATE TABLE IF NOT EXISTS field_option (
    id BINARY(16) NOT NULL PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    field_definition_id BINARY(16) NOT NULL,
    option_label VARCHAR(150) NOT NULL,
    option_value VARCHAR(150) NOT NULL,
    option_order INT NOT NULL,
    created_by VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL,
    deleted_by VARCHAR(255),
    effective_date DATETIME(6) NULL,
    CONSTRAINT fk_field_opt_def FOREIGN KEY (field_definition_id) REFERENCES field_definition(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Field Values
CREATE TABLE IF NOT EXISTS field_value (
    id BINARY(16) NOT NULL PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    entity_id BINARY(16) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    field_definition_id BINARY(16) NOT NULL,
    field_value TEXT,
    created_by VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL,
    deleted_by VARCHAR(255),
    effective_date DATETIME(6) NULL,
    CONSTRAINT fk_field_val_def FOREIGN KEY (field_definition_id) REFERENCES field_definition(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Recruitment Stages
CREATE TABLE IF NOT EXISTS recruitment_stage (
    id BINARY(16) NOT NULL PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    stage_code VARCHAR(50) NOT NULL,
    stage_name VARCHAR(100) NOT NULL,
    display_order INT NOT NULL,
    stage_color VARCHAR(50),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL,
    deleted_by VARCHAR(255),
    effective_date DATETIME(6) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Interview Types
CREATE TABLE IF NOT EXISTS interview_type (
    id BINARY(16) NOT NULL PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    type_name VARCHAR(100) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL,
    deleted_by VARCHAR(255),
    effective_date DATETIME(6) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Recruitment Sources
CREATE TABLE IF NOT EXISTS recruitment_source (
    id BINARY(16) NOT NULL PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    source_name VARCHAR(100) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL,
    deleted_by VARCHAR(255),
    effective_date DATETIME(6) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Workflow Definitions
CREATE TABLE IF NOT EXISTS workflow_definition (
    id BINARY(16) NOT NULL PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    workflow_name VARCHAR(150) NOT NULL,
    workflow_type VARCHAR(50) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL,
    deleted_by VARCHAR(255),
    effective_date DATETIME(6) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Workflow Steps
CREATE TABLE IF NOT EXISTS workflow_step (
    id BINARY(16) NOT NULL PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    workflow_definition_id BINARY(16) NOT NULL,
    step_name VARCHAR(150) NOT NULL,
    step_order INT NOT NULL,
    approver_role VARCHAR(100) NOT NULL,
    created_by VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL,
    deleted_by VARCHAR(255),
    effective_date DATETIME(6) NULL,
    CONSTRAINT fk_wf_step_def FOREIGN KEY (workflow_definition_id) REFERENCES workflow_definition(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Workflow Assignments
CREATE TABLE IF NOT EXISTS workflow_assignment (
    id BINARY(16) NOT NULL PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    entity_id BINARY(16) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    workflow_definition_id BINARY(16) NOT NULL,
    current_step_index INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'PENDING',
    created_by VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL,
    deleted_by VARCHAR(255),
    effective_date DATETIME(6) NULL,
    CONSTRAINT fk_wf_assign_def FOREIGN KEY (workflow_definition_id) REFERENCES workflow_definition(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Offer Templates
CREATE TABLE IF NOT EXISTS offer_template (
    id BINARY(16) NOT NULL PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    template_name VARCHAR(150) NOT NULL,
    template_type VARCHAR(50) NOT NULL,
    template_html TEXT NOT NULL,
    created_by VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL,
    deleted_by VARCHAR(255),
    effective_date DATETIME(6) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notification Templates
CREATE TABLE IF NOT EXISTS notification_template (
    id BINARY(16) NOT NULL PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    template_name VARCHAR(150) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    channel VARCHAR(50) NOT NULL,
    subject VARCHAR(255),
    content TEXT NOT NULL,
    created_by VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL,
    deleted_by VARCHAR(255),
    effective_date DATETIME(6) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notification Rules
CREATE TABLE IF NOT EXISTS notification_rule (
    id BINARY(16) NOT NULL PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    rule_name VARCHAR(150) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    notification_template_id BINARY(16) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL,
    deleted_by VARCHAR(255),
    effective_date DATETIME(6) NULL,
    CONSTRAINT fk_notif_rule_tpl FOREIGN KEY (notification_template_id) REFERENCES notification_template(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Automation Rules
CREATE TABLE IF NOT EXISTS automation_rule (
    id BINARY(16) NOT NULL PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    rule_name VARCHAR(150) NOT NULL,
    trigger_event VARCHAR(100) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL,
    deleted_by VARCHAR(255),
    effective_date DATETIME(6) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Automation Conditions
CREATE TABLE IF NOT EXISTS automation_condition (
    id BINARY(16) NOT NULL PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    automation_rule_id BINARY(16) NOT NULL,
    field_key VARCHAR(100) NOT NULL,
    operator VARCHAR(50) NOT NULL,
    expected_value VARCHAR(255) NOT NULL,
    created_by VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL,
    deleted_by VARCHAR(255),
    effective_date DATETIME(6) NULL,
    CONSTRAINT fk_auto_cond_rule FOREIGN KEY (automation_rule_id) REFERENCES automation_rule(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Automation Actions
CREATE TABLE IF NOT EXISTS automation_action (
    id BINARY(16) NOT NULL PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    automation_rule_id BINARY(16) NOT NULL,
    action_type VARCHAR(100) NOT NULL,
    action_config TEXT,
    created_by VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL,
    deleted_by VARCHAR(255),
    effective_date DATETIME(6) NULL,
    CONSTRAINT fk_auto_act_rule FOREIGN KEY (automation_rule_id) REFERENCES automation_rule(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── SEED INITIAL ATS METADATA CONFIGURATION FOR ACME TENANT ─────────────────

-- Requisition Form Definition
INSERT INTO form_definition (id, tenant_id, module_name, form_name, status)
VALUES (UNHEX('00000000000000000000000000000001'), 'ACME', 'RECRUITMENT', 'Manpower Requisition Form', 'ACTIVE');

-- Requisition Field Definitions
INSERT INTO field_definition (id, tenant_id, form_id, field_key, field_label, field_type, required, visible, read_only, default_value, display_order)
VALUES 
(UNHEX('10000000000000000000000000000001'), 'ACME', UNHEX('00000000000000000000000000000001'), 'hiringReason', 'Hiring Reason', 'Dropdown', TRUE, TRUE, FALSE, 'Expansion', 1),
(UNHEX('10000000000000000000000000000002'), 'ACME', UNHEX('00000000000000000000000000000001'), 'businessUnit', 'Business Unit', 'Dropdown', FALSE, TRUE, FALSE, NULL, 2),
(UNHEX('10000000000000000000000000000003'), 'ACME', UNHEX('00000000000000000000000000000001'), 'department', 'Department', 'Department Picker', TRUE, TRUE, FALSE, NULL, 3),
(UNHEX('10000000000000000000000000000004'), 'ACME', UNHEX('00000000000000000000000000000001'), 'vacancies', 'Headcount Required', 'Number', TRUE, TRUE, FALSE, '1', 4),
(UNHEX('10000000000000000000000000000005'), 'ACME', UNHEX('00000000000000000000000000000001'), 'budget', 'Annual Budget Limit', 'Currency', TRUE, TRUE, FALSE, NULL, 5),
(UNHEX('10000000000000000000000000000006'), 'ACME', UNHEX('00000000000000000000000000000001'), 'costCenter', 'Cost Center Code', 'Text', FALSE, TRUE, FALSE, NULL, 6),
(UNHEX('10000000000000000000000000000007'), 'ACME', UNHEX('00000000000000000000000000000001'), 'position', 'Target Position Node', 'Position Picker', TRUE, TRUE, FALSE, NULL, 7);

-- Requisition Dropdown Options (Hiring Reason)
INSERT INTO field_option (id, tenant_id, field_definition_id, option_label, option_value, option_order)
VALUES 
(UNHEX('11000000000000000000000000000001'), 'ACME', UNHEX('10000000000000000000000000000001'), 'New Budgeted Headcount', 'New Budgeted Headcount', 1),
(UNHEX('11000000000000000000000000000002'), 'ACME', UNHEX('10000000000000000000000000000001'), 'Replacement Hires', 'Replacement Hires', 2),
(UNHEX('11000000000000000000000000000003'), 'ACME', UNHEX('10000000000000000000000000000001'), 'Strategic Project Growth', 'Strategic Project Growth', 3);

-- Requisition Dropdown Options (Business Unit)
INSERT INTO field_option (id, tenant_id, field_definition_id, option_label, option_value, option_order)
VALUES 
(UNHEX('12000000000000000000000000000001'), 'ACME', UNHEX('10000000000000000000000000000002'), 'Corporate HQ', 'Corporate HQ', 1),
(UNHEX('12000000000000000000000000000002'), 'ACME', UNHEX('10000000000000000000000000000002'), 'R&D Labs', 'R&D Labs', 2),
(UNHEX('12000000000000000000000000000003'), 'ACME', UNHEX('10000000000000000000000000000002'), 'Global Operations', 'Global Operations', 3);

-- Candidate Profile Form Definition
INSERT INTO form_definition (id, tenant_id, module_name, form_name, status)
VALUES (UNHEX('00000000000000000000000000000002'), 'ACME', 'RECRUITMENT', 'Candidate Application Form', 'ACTIVE');

-- Candidate Field Definitions
INSERT INTO field_definition (id, tenant_id, form_id, field_key, field_label, field_type, required, visible, read_only, default_value, display_order)
VALUES 
(UNHEX('20000000000000000000000000000001'), 'ACME', UNHEX('00000000000000000000000000000002'), 'currentCtc', 'Current Annual Salary', 'Currency', FALSE, TRUE, FALSE, NULL, 1),
(UNHEX('20000000000000000000000000000002'), 'ACME', UNHEX('00000000000000000000000000000002'), 'expectedCtc', 'Expected Salary Package', 'Currency', TRUE, TRUE, FALSE, NULL, 2),
(UNHEX('20000000000000000000000000000003'), 'ACME', UNHEX('00000000000000000000000000000002'), 'noticePeriod', 'Notice Period Duration (Days)', 'Number', TRUE, TRUE, FALSE, '30', 3),
(UNHEX('20000000000000000000000000000004'), 'ACME', UNHEX('00000000000000000000000000000002'), 'linkedin', 'LinkedIn Profile URL', 'URL', FALSE, TRUE, FALSE, NULL, 4),
(UNHEX('20000000000000000000000000000005'), 'ACME', UNHEX('00000000000000000000000000000002'), 'github', 'GitHub Handle Profile', 'URL', FALSE, TRUE, FALSE, NULL, 5),
(UNHEX('20000000000000000000000000000006'), 'ACME', UNHEX('00000000000000000000000000000002'), 'visaStatus', 'Work Visa Clearance Status', 'Dropdown', FALSE, TRUE, FALSE, NULL, 6);

-- Candidate Dropdown Options (Visa Status)
INSERT INTO field_option (id, tenant_id, field_definition_id, option_label, option_value, option_order)
VALUES 
(UNHEX('21000000000000000000000000000001'), 'ACME', UNHEX('20000000000000000000000000000006'), 'Citizen / Permanent Resident', 'Citizen/PR', 1),
(UNHEX('21000000000000000000000000000002'), 'ACME', UNHEX('20000000000000000000000000000006'), 'Work Visa Holder (H1B / L1)', 'Visa Sponsor', 2),
(UNHEX('21000000000000000000000000000003'), 'ACME', UNHEX('20000000000000000000000000000006'), 'Student Visa (F1 OPT)', 'Student OPT', 3);

-- Default Recruitment Stages
INSERT INTO recruitment_stage (id, tenant_id, stage_code, stage_name, display_order, stage_color, active)
VALUES 
(UNHEX('30000000000000000000000000000001'), 'ACME', 'APPLIED', 'Application Received', 1, 'bg-slate-50 text-slate-700', TRUE),
(UNHEX('30000000000000000000000000000002'), 'ACME', 'SCREENING', 'Resume Screening', 2, 'bg-blue-50 text-blue-600', TRUE),
(UNHEX('30000000000000000000000000000003'), 'ACME', 'SHORTLISTED', 'Initial Shortlist', 3, 'bg-indigo-50 text-indigo-600', TRUE),
(UNHEX('30000000000000000000000000000004'), 'ACME', 'INTERVIEW', 'Interview Loops', 4, 'bg-purple-50 text-purple-600', TRUE),
(UNHEX('30000000000000000000000000000005'), 'ACME', 'OFFER', 'Compensation Offer', 5, 'bg-amber-50 text-amber-600', TRUE),
(UNHEX('30000000000000000000000000000006'), 'ACME', 'ACCEPTED', 'Offer Accepted', 6, 'bg-emerald-50 text-emerald-600', TRUE);

-- Default Interview Types
INSERT INTO interview_type (id, tenant_id, type_name, active)
VALUES 
(UNHEX('40000000000000000000000000000001'), 'ACME', 'Initial Screen Call', TRUE),
(UNHEX('40000000000000000000000000000002'), 'ACME', 'Technical Coding Evaluation', TRUE),
(UNHEX('40000000000000000000000000000003'), 'ACME', 'System Architecture Panel', TRUE),
(UNHEX('40000000000000000000000000000004'), 'ACME', 'Manager & Core Values Fit', TRUE),
(UNHEX('40000000000000000000000000000005'), 'ACME', 'Executive Director Round', TRUE);

-- Default Recruitment Sources
INSERT INTO recruitment_source (id, tenant_id, source_name, active)
VALUES 
(UNHEX('50000000000000000000000000000001'), 'ACME', 'LinkedIn Recruiter', TRUE),
(UNHEX('50000000000000000000000000000002'), 'ACME', 'Naukri Portal Premium', TRUE),
(UNHEX('50000000000000000000000000000003'), 'ACME', 'Internal Employee Referral', TRUE),
(UNHEX('50000000000000000000000000000004'), 'ACME', 'Public Careers Microsite', TRUE);

-- Default Workflow Configuration (Requisition Approval Process)
INSERT INTO workflow_definition (id, tenant_id, workflow_name, workflow_type, active)
VALUES (UNHEX('60000000000000000000000000000001'), 'ACME', 'Acme Requisition Approval Cycle', 'REQUISITION', TRUE);

INSERT INTO workflow_step (id, tenant_id, workflow_definition_id, step_name, step_order, approver_role)
VALUES 
(UNHEX('61000000000000000000000000000001'), 'ACME', UNHEX('60000000000000000000000000000001'), 'Direct Department Head sign-off', 1, 'ROLE_LINE_MANAGER'),
(UNHEX('61000000000000000000000000000002'), 'ACME', UNHEX('60000000000000000000000000000001'), 'Human Resources VP approval', 2, 'ROLE_HR_ADMIN'),
(UNHEX('61000000000000000000000000000003'), 'ACME', UNHEX('60000000000000000000000000000001'), 'Finance CFO Budget validation', 3, 'ROLE_FINANCE_DIRECTOR');

-- Default Offer Templates
INSERT INTO offer_template (id, tenant_id, template_name, template_type, template_html)
VALUES 
(UNHEX('70000000000000000000000000000001'), 'ACME', 'Standard Full Time Employee Offer', 'FULL_TIME', 
'<h1>Acme Corp Job Offer Letter</h1><p>Dear {{candidate_name}},</p><p>We are delighted to offer you the position of <strong>{{designation}}</strong> at Acme Corp. Your annual gross compensation package will be <strong>${{ctc}}</strong>. Your anticipated date of joining will be <strong>{{joining_date}}</strong>.</p><p>Welcome to the family!</p>'),
(UNHEX('70000000000000000000000000000002'), 'ACME', 'Independent Contractor Engagement Agreement', 'CONTRACT', 
'<h1>Acme Corp Consulting Agreement</h1><p>Dear {{candidate_name}},</p><p>This letter confirms your retention as a contractor for <strong>{{designation}}</strong>. Your fee is set at <strong>${{ctc}}</strong> per annum. Your service commencement date will be <strong>{{joining_date}}</strong>.</p>');

-- Default Notification Template & Rule
INSERT INTO notification_template (id, tenant_id, template_name, event_type, channel, subject, content)
VALUES (UNHEX('80000000000000000000000000000001'), 'ACME', 'Candidate Application Welcome Alert', 'CANDIDATE_APPLIED', 'EMAIL', 'Application Received - Acme Corp', 'Hello {{candidate_name}}, thank you for submitting your application. We will contact you soon.');

INSERT INTO notification_rule (id, tenant_id, rule_name, event_type, notification_template_id, active)
VALUES (UNHEX('81000000000000000000000000000001'), 'ACME', 'Send Welcome Email on Apply', 'CANDIDATE_APPLIED', UNHEX('80000000000000000000000000000001'), TRUE);

-- Default Automation Rule & Action (Acceptance -> Digital Twin)
INSERT INTO automation_rule (id, tenant_id, rule_name, trigger_event, active)
VALUES (UNHEX('90000000000000000000000000000001'), 'ACME', 'Convert Accepted Candidates to Employee Twins', 'STAGE_CHANGE_OFFER_ACCEPTED', TRUE);

INSERT INTO automation_action (id, tenant_id, automation_rule_id, action_type, action_config)
VALUES (UNHEX('91000000000000000000000000000001'), 'ACME', UNHEX('90000000000000000000000000000001'), 'CREATE_EMPLOYEE_TWIN', '{"status":"ACTIVE","assignOnboarding":true}');
