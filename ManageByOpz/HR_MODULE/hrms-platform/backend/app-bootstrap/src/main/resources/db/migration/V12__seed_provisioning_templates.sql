-- V12: Seed Welcome / Activation Email Template

INSERT INTO notification_templates (id, tenant_id, code, name, channel, subject_template, body_template, module_code, active, created_by, created_at, version)
VALUES (
    UNHEX(REPLACE(UUID(), '-', '')),
    'ACME',
    'WELCOME_ACTIVATION',
    'Welcome and Account Activation',
    'EMAIL',
    'Welcome to Acme Corporation - Activate Your Account',
    'Hello {{employeeName}},\n\nWelcome to the organization! An employee profile has been created for you with employee code {{employeeCode}}.\n\nPlease click the link below to set up your password and activate your account:\n\n{{activationLink}}\n\nThis activation link is valid for 24 hours.\n\nBest Regards,\nHuman Resources Team\nAcme Corporation',
    'SECURITY',
    TRUE,
    'SYSTEM',
    CURRENT_TIMESTAMP,
    1
);
