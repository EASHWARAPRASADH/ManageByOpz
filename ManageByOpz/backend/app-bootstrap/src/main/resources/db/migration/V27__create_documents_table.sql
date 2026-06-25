-- V27: Create documents and document_versions tables for unified vault and contextual uploads
CREATE TABLE IF NOT EXISTS documents (
  id                 BINARY(16) PRIMARY KEY,
  tenant_id          VARCHAR(100) NOT NULL,
  entity_type        VARCHAR(40) NOT NULL,
  entity_id          BINARY(16) NOT NULL,
  document_category  VARCHAR(60) NOT NULL,
  current_version_id BINARY(16) NULL,
  status             VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  created_by         VARCHAR(255) NOT NULL,
  created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_by         VARCHAR(255) NULL,
  updated_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted            BOOLEAN NOT NULL DEFAULT FALSE,
  INDEX idx_doc_tenant (tenant_id),
  INDEX idx_entity (entity_type, entity_id),
  INDEX idx_category (document_category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS document_versions (
  id                  BINARY(16) PRIMARY KEY,
  document_id         BINARY(16) NOT NULL,
  version_number       INT NOT NULL,
  file_name           VARCHAR(255) NOT NULL,
  minio_object_key     VARCHAR(500) NOT NULL,
  file_hash           VARCHAR(64) NOT NULL,
  file_size_bytes     BIGINT NOT NULL,
  mime_type           VARCHAR(100) NOT NULL,
  uploaded_by         VARCHAR(255) NOT NULL,
  uploaded_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  comments            VARCHAR(500) NULL,
  previous_version_id BINARY(16) NULL,
  FOREIGN KEY (document_id) REFERENCES documents(id),
  INDEX idx_document (document_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
