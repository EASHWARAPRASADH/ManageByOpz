-- V4__Add_Password_Reset_Required.sql
-- Adds the password_reset_required column to the users table for security standardization.

ALTER TABLE ticketing_users ADD COLUMN password_reset_required BOOLEAN DEFAULT FALSE NOT NULL;
