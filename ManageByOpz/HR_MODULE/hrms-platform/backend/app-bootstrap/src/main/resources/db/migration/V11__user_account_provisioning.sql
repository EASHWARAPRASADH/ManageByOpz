-- V11: User Account Provisioning & Activation Columns
ALTER TABLE users ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE users ADD COLUMN password_change_required BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN activated_at TIMESTAMP NULL;
ALTER TABLE users ADD COLUMN activation_token VARCHAR(255) NULL;
ALTER TABLE users ADD COLUMN activation_token_expiry TIMESTAMP NULL;
ALTER TABLE users ADD COLUMN reset_token VARCHAR(255) NULL;
ALTER TABLE users ADD COLUMN reset_token_expiry TIMESTAMP NULL;

-- Update existing seeded users to ACTIVE
UPDATE users SET status = 'ACTIVE', email_verified = TRUE;
