-- V13: Extend users table with advanced security details
ALTER TABLE users ADD COLUMN last_password_change_at TIMESTAMP NULL;
ALTER TABLE users ADD COLUMN activation_sent_at TIMESTAMP NULL;
ALTER TABLE users ADD COLUMN account_locked BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN account_locked_at TIMESTAMP NULL;
ALTER TABLE users ADD COLUMN password_expiry_at TIMESTAMP NULL;
ALTER TABLE users ADD COLUMN mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE;
