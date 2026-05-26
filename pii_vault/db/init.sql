-- PII Vault isolated database schema
-- Completely separate from the main app database

CREATE DATABASE IF NOT EXISTS pii_vault;
USE pii_vault;

CREATE TABLE IF NOT EXISTS vault_records (
    vault_id            CHAR(36)        PRIMARY KEY DEFAULT (UUID()),
    pseudonym_token     VARCHAR(64)     NOT NULL UNIQUE,
    salt                VARCHAR(64)     NOT NULL,
    -- AES-256 encrypted fields (stored as base64 ciphertext)
    enc_real_name       TEXT            DEFAULT NULL,
    enc_email           TEXT            DEFAULT NULL,
    enc_date_of_birth   TEXT            DEFAULT NULL,
    enc_contact_number  TEXT            DEFAULT NULL,
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    purged_at           DATETIME        DEFAULT NULL
);

CREATE INDEX idx_vault_token ON vault_records(pseudonym_token);

-- Vault app user is created by Docker via MYSQL_USER / MYSQL_PASSWORD env vars.
GRANT SELECT, INSERT, UPDATE ON pii_vault.vault_records TO 'vault_app'@'%';
FLUSH PRIVILEGES;
