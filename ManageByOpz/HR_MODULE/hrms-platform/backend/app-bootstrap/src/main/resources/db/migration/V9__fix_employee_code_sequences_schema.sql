-- V9: Drop obsolete last_sequence column from employee_code_sequences
ALTER TABLE employee_code_sequences DROP COLUMN last_sequence;
