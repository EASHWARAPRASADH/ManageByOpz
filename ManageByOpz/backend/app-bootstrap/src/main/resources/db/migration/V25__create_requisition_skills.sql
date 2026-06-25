-- Migration: V25__create_requisition_skills.sql

CREATE TABLE IF NOT EXISTS requisition_skills (
    id BINARY(16) NOT NULL PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    requisition_id BINARY(16) NOT NULL,
    skill_id BINARY(16) NOT NULL,
    skill_name VARCHAR(150) NOT NULL,
    is_required BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_req_skills_req FOREIGN KEY (requisition_id) REFERENCES manpower_requisitions(id) ON DELETE CASCADE,
    CONSTRAINT fk_req_skills_skill FOREIGN KEY (skill_id) REFERENCES skill_master(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
