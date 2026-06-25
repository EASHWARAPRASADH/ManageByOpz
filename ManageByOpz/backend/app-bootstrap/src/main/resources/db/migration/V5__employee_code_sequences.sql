-- V5: Employee Code Sequences Table
CREATE TABLE IF NOT EXISTS employee_code_sequences (
    organization_id BINARY(16) NOT NULL PRIMARY KEY,
    last_sequence INT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
