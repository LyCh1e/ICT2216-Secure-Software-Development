-- TrialGuard main application database schema
-- Runs automatically on first docker compose up

CREATE DATABASE IF NOT EXISTS trialguard;
USE trialguard;

CREATE TABLE IF NOT EXISTS users (
    user_id         CHAR(36)        PRIMARY KEY DEFAULT (UUID()),
    username        VARCHAR(64)     NOT NULL UNIQUE,
    email           VARCHAR(254)    NOT NULL UNIQUE,
    password_hash   VARCHAR(255)    NOT NULL,
    role            ENUM('participant', 'researcher', 'admin') NOT NULL,
    email_verified  BOOLEAN         NOT NULL DEFAULT FALSE,
    mfa_secret      VARCHAR(64)     DEFAULT NULL,
    mfa_enabled     BOOLEAN         NOT NULL DEFAULT FALSE,
    failed_login_attempts TINYINT UNSIGNED NOT NULL DEFAULT 0,
    locked_until    DATETIME        DEFAULT NULL,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login      DATETIME        DEFAULT NULL,
    verify_token    VARCHAR(64)     DEFAULT NULL,
    verify_token_expires DATETIME   DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS trials (
    trial_id        CHAR(36)        PRIMARY KEY DEFAULT (UUID()),
    title           VARCHAR(255)    NOT NULL,
    description     TEXT            NOT NULL,
    phase           VARCHAR(32)     NOT NULL,
    sponsor         VARCHAR(255)    NOT NULL,
    duration        VARCHAR(64)     NOT NULL,
    stipend         VARCHAR(64)     NOT NULL DEFAULT 'Unpaid',
    risk_level      ENUM('minimal', 'low', 'medium', 'high') NOT NULL,
    spots_total     SMALLINT UNSIGNED NOT NULL,
    spots_enrolled  SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    location        VARCHAR(255)    NOT NULL,
    status          ENUM('recruiting', 'closed', 'completed') NOT NULL DEFAULT 'recruiting',
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS participants (
    participant_id      CHAR(36)    PRIMARY KEY DEFAULT (UUID()),
    pseudonym_token     VARCHAR(64) NOT NULL UNIQUE,
    user_id             CHAR(36)    NOT NULL,
    trial_id            CHAR(36)    NOT NULL,
    consent_status      ENUM('pending', 'active', 'withdrawn') NOT NULL DEFAULT 'pending',
    withdrawal_triggered BOOLEAN    NOT NULL DEFAULT FALSE,
    created_at          DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_participant_user  FOREIGN KEY (user_id)  REFERENCES users(user_id)  ON DELETE RESTRICT,
    CONSTRAINT fk_participant_trial FOREIGN KEY (trial_id) REFERENCES trials(trial_id) ON DELETE RESTRICT
);

CREATE INDEX idx_participants_pseudonym ON participants(pseudonym_token);
CREATE INDEX idx_participants_user      ON participants(user_id);

CREATE TABLE IF NOT EXISTS consent_records (
    consent_id              CHAR(36)    PRIMARY KEY DEFAULT (UUID()),
    participant_id          CHAR(36)    NOT NULL,
    trial_id                CHAR(36)    NOT NULL,
    consent_text_version    VARCHAR(64) NOT NULL,
    signed_at               DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    digital_signature_hash  VARCHAR(128) NOT NULL,
    withdrawn_at            DATETIME    DEFAULT NULL,
    CONSTRAINT fk_consent_participant FOREIGN KEY (participant_id) REFERENCES participants(participant_id) ON DELETE RESTRICT,
    CONSTRAINT fk_consent_trial       FOREIGN KEY (trial_id)       REFERENCES trials(trial_id)            ON DELETE RESTRICT
);

-- Audit log: app DB user has INSERT only — no UPDATE or DELETE.
-- Enforced via GRANT in the user setup below.
CREATE TABLE IF NOT EXISTS audit_logs (
    log_id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    user_id             CHAR(36)        DEFAULT NULL,
    action_type         VARCHAR(64)     NOT NULL,
    resource_affected   VARCHAR(255)    DEFAULT NULL,
    outcome             ENUM('success', 'failure') NOT NULL,
    ip_address          VARCHAR(45)     DEFAULT NULL,
    timestamp           DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    prev_hash           VARCHAR(64)     DEFAULT NULL,
    entry_hash          VARCHAR(64)     NOT NULL
);

-- App user is created by Docker via MYSQL_USER / MYSQL_PASSWORD env vars.
-- Grant least-privilege here (runs as root on first start).
GRANT SELECT, INSERT, UPDATE, DELETE ON trialguard.users           TO 'tg_app'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON trialguard.trials          TO 'tg_app'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON trialguard.participants    TO 'tg_app'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON trialguard.consent_records TO 'tg_app'@'%';
GRANT SELECT, INSERT                 ON trialguard.audit_logs      TO 'tg_app'@'%';
FLUSH PRIVILEGES;
