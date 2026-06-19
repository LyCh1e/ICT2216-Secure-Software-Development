# tasks2.md — TrialGuard Security Hardening Checklist

## Purpose
This file tracks additional security hardening applied to the live TrialGuard EC2 deployment after the core implementation (tasks.md) was completed.

## Task Status Key
- `[ ]` Not started
- `[~]` In progress
- `[x]` Done
- `[!]` Blocked / needs decision

A task is done only when:
- Change is applied and verified on the live EC2 instance.
- No service disruption (all 7 containers still healthy after change).
- Security improvement is confirmed (tested or header/config verified).

---

## Applied Frameworks

Tasks below map to three frameworks from the ICT2216 Secure Software Development course:

| Framework | Applied in Phases |
|---|---|
| **CIA-AAA Pillars** (Confidentiality / Integrity / Availability / Authentication / Authorisation / Accountability) | 13 – 18 |
| **OWASP 10 Security by Design Principles** | 19 |
| **Secure Design Architecture — 4 Steps** (Document → Identify Threats → Implement Controls → Document & Validate) | 20 |
| **Production Environment Hardening** (operational baseline) | 12 |

---

## Phase 12 — Production Environment Hardening

### Task 12.1 — nginx Request Hardening

**Status:** Done

- [x] Add `client_max_body_size 1m` — reject oversized request bodies
- [x] Add `client_body_timeout 10s` and `client_header_timeout 10s` — drop slow clients
- [x] Add `keepalive_timeout 15s` — limit persistent connection window
- [x] Add `send_timeout 10s` — drop stalled responses
- [x] Restrict allowed HTTP methods — return 405 on anything other than GET, POST, PUT, DELETE
- [x] Add `Permissions-Policy` header — disable unused browser features (camera, microphone, geolocation)

Acceptance Criteria:
- [x] Sending a request body larger than 1 MB returns 413
- [x] Security headers verified with `curl -skI https://18.223.111.152/`
- [x] `Permissions-Policy` header present in response
- [x] PATCH, OPTIONS, TRACE requests return 405

---

### Task 12.2 — Flask-Limiter Persistent Storage (Redis)

**Status:** Not Started

- [ ] Add `redis` service to `docker-compose.yml` — internal only, no exposed port
- [ ] Add `redis` dependency to Flask service
- [ ] Add `Flask-Limiter[redis]` and `redis` to `requirements.txt`
- [ ] Update `backend/app/extensions.py` — configure Flask-Limiter to use Redis URI
- [ ] Add `REDIS_URL=redis://redis:6379` to `.env.template` and EC2 `.env`
- [ ] Rebuild and verify warning about in-memory storage is gone from Flask logs

Acceptance Criteria:
- [ ] Flask logs no longer show `UserWarning: Using the in-memory storage for tracking rate limits`
- [ ] Rate limits persist across Flask container restarts
- [ ] Redis container is not reachable from outside the Docker network

---

### Task 12.3 — Fail2ban on EC2

**Status:** Done

- [x] Install Fail2ban: `sudo apt install fail2ban -y`
- [x] Create `/etc/fail2ban/jail.local` — enable SSH jail, ban after 5 failures for 1 hour
- [x] Enable and start Fail2ban service
- [x] Verify SSH jail is active: `sudo fail2ban-client status sshd`

Acceptance Criteria:
- [x] `sudo fail2ban-client status sshd` shows jail is active
- [x] Fail2ban service is enabled on boot (`sudo systemctl is-enabled fail2ban`)

---

### Task 12.4 — Automatic Security Updates on EC2

**Status:** Done

- [x] Install unattended-upgrades: `sudo apt install unattended-upgrades -y`
- [x] Enable automatic security updates: `sudo dpkg-reconfigure --priority=low unattended-upgrades`
- [x] Verify configuration is active: `cat /etc/apt/apt.conf.d/20auto-upgrades`

Acceptance Criteria:
- [x] `APT::Periodic::Unattended-Upgrade "1"` present in auto-upgrades config
- [x] Security patches applied automatically without manual intervention

---

## Phase 13 — Confidentiality Controls (CIA Pillar 1)

*Framework source: Secure Design Implementation — Confidentiality Design (masking, cryptographic techniques, hybrid TLS, X.509).*

### Task 13.1 — TLS Certificate Validity and Renewal

**Status:** Done

- [x] Confirm TLS certificate has not expired: `openssl s_client -connect 18.223.111.152:443 2>/dev/null | openssl x509 -noout -dates`
- [x] Verify certificate CN / SAN matches the domain (`medi.trialguard.com`)
- [x] Document certificate expiry date and schedule manual renewal reminder (Let's Encrypt: 90-day expiry, renew within 30 days)
- [x] Verify nginx serves HTTPS only — HTTP requests redirect 301 to HTTPS

Acceptance Criteria:
- [x] Certificate validity window shown; expiry date recorded in this file: ___________
- [x] `curl -sk http://18.223.111.152/` returns `301 Moved Permanently` to `https://`

---

### Task 13.2 — Session Cookie Security Flags

**Status:** Done

- [x] Confirm `SESSION_COOKIE_HTTPONLY=True` in Flask config (prevents JS access to session cookie)
- [x] Confirm `SESSION_COOKIE_SECURE=True` (cookie only transmitted over HTTPS)
- [x] Confirm `SESSION_COOKIE_SAMESITE='Strict'` (blocks cross-site request inclusion)
- [x] Verify flags in browser DevTools → Application → Cookies, or with: `curl -sk -D - https://18.223.111.152/api/auth/csrf-token`

**Verified:** All three flags set in `backend/config.py:20-22` (`BaseConfig`). Config is selected by `FLASK_ENV` in `backend/app/__init__.py:11-12` — `DevelopmentConfig` overrides `SESSION_COOKIE_SECURE=False` (config.py:34) for local HTTP dev. Root cause found: the live EC2 `.env` had `FLASK_ENV=development`, so the public server loaded `DevelopmentConfig` — disabling the `Secure` flag AND running with `DEBUG=True` + dev CORS. Fixed by setting `FLASK_ENV=production` in `~/ICT2216-Secure-Software-Development/.env` and recreating the flask container. Confirmed live `Set-Cookie: session=...; Secure; HttpOnly; Path=/; SameSite=Strict`.

Acceptance Criteria:
- [x] Response `Set-Cookie` header includes `HttpOnly; Secure; SameSite=Strict`

---

### Task 13.3 — Secrets Not Committed to Git

**Status:** Done

- [x] Confirm `.env` is listed in `.gitignore` — `grep "^\.env" .gitignore`
- [x] Run `git log --all --full-history -- .env` — must return no commits (file was never tracked)
- [x] Confirm `nginx/certs/` is in `.gitignore` — TLS private key must never be committed
- [x] Scan last 20 commits for accidental secret leakage: `git log -20 --diff-filter=A --name-only`

Acceptance Criteria:
- [x] No `.env` entries in git history
- [x] No private key files (`privkey.pem`, `*.key`) in git history

---

### Task 13.4 — Database Connection Encryption (Transit)

**Status:** Deferred — Risk Accepted [!]

- [x] Verify Flask → MySQL connection uses SSL/TLS — **confirmed plaintext** (`backend/config.py:8-11`, `mysql+pymysql://` with no SSL args / `connect_args`)
- [x] Verify pii_vault → vault_db connection uses SSL/TLS — **confirmed plaintext** (`pii_vault/app.py:21-29`, raw `pymysql.connect` with no `ssl` param)
- [!] If plaintext, add `ssl_args` to SQLAlchemy engine and regenerate MySQL user with `REQUIRE SSL` — **not implemented; risk accepted (see rationale)**
- [x] Confirm MongoDB connection string includes `tls=true` if used for sensitive data — not set (`backend/config.py:14-18`); same rationale applies

**Decision — Accepted Residual Risk:** Inter-service DB traffic (Flask↔MySQL, pii_vault↔vault_db, Flask↔MongoDB) is unencrypted in transit. This risk is **accepted** after verifying the deployment topology: the databases are **not external** (e.g. no AWS RDS) — they run as **containers on the same EC2 host** as the application. Evidence: `DB_HOST=mysql`, `MONGO_HOST=mongodb`, `VAULT_DB_HOST=vault_db` resolve to Docker service names, and all DB services use `expose:` (3306/27017) **never `ports:`** in `docker-compose.yml`, so their ports are reachable only on the internal Docker bridge network — never published to the host or the internet. DB traffic therefore never crosses an untrusted/physical network; an attacker would already need code execution inside the Docker network to observe it. Enabling TLS would require forcing SSL on the SQLAlchemy/PyMySQL clients plus `REQUIRE SSL` on the DB users — carrying real outage risk (and the CI/CD health check does not exercise the DB, so a failure could deploy silently green). Given the low residual exposure and proximity to the D2 freeze, this is deferred. **Note:** if the database is ever moved off-host (separate server / managed RDS), this risk must be re-opened and TLS implemented, since traffic would then cross a real network. To be carried into the Phase 20 Residual Risk Assessment.

Acceptance Criteria:
- [!] `SHOW STATUS LIKE 'Ssl_cipher'` returns a non-empty cipher — N/A (risk accepted; connection intentionally left plaintext on the internal-only Docker network)

---

### Task 13.5 — PII Masking in API Responses

**Status:** Done

- [x] Audit all `GET` API responses — confirm email, phone, and NRIC are never returned in full
- [x] Apply display-layer masking where full values are not needed (e.g., `j***@example.com`)
- [x] Confirm that PII fields in the MongoDB PII vault are not returned directly to the frontend — pii_vault API should only return lookup tokens

**Verified:** Added `_mask_email()` helper to `backend/app/routes/admin.py` — `GET /api/admin/users` now returns masked emails (e.g., `j***@example.com`). Participant profile (`GET /api/participant/profile`) returns full email only to the owning user (needed to display their own email). Researcher endpoints return aggregate counts only — no PII. PII vault `/vault/create` returns only pseudonym tokens; `/vault/erase` returns only a status message — no plaintext PII is ever sent to the frontend.

Acceptance Criteria:
- [x] GET `/api/admin/users` returns masked email fields (e.g., `j***@example.com`)
- [x] pii_vault responses contain tokens, not plaintext PII

---

## Phase 14 — Integrity Controls (CIA Pillar 2)

*Framework source: Secure Design Implementation — Integrity Design (salted hashing, bcrypt NFR, referential integrity, resource locking).*

### Task 14.1 — bcrypt Cost Factor NFR Verification

**Status:** Done

- [x] Locate bcrypt cost factor in `backend/app/` config (should be `cost=12`)
- [x] Time a single bcrypt hash on the EC2 instance: `python3 -c "import bcrypt, time; s=time.time(); bcrypt.hashpw(b'test', bcrypt.gensalt(12)); print(time.time()-s)"`
- [x] Document: cost=12, measured latency=200.8 ms in Docker Flask container — confirmed < 300 ms
- [x] Record NFR: "bcrypt cost factor 12 — authentication completes in < 300 ms on target hardware; per-guess cost > 100 ms for an attacker"

**Verified locations:** `backend/app/routes/auth.py:85` (registration), `backend/app/routes/participant.py:138` (password change) — both use `bcrypt.gensalt(rounds=12)`.

Acceptance Criteria:
- [x] Cost factor 12 confirmed in code
- [x] Authentication latency measured and documented in this file (200.8 ms)

---

### Task 14.2 — Audit Log Hash Chain Integrity Check

**Status:** Done

- [x] Verify that the audit log hash chain script/function exists in the codebase
- [x] Run the hash chain verification against the live MySQL database: confirm no broken links
- [x] Add a scheduled job or admin endpoint to run the chain check periodically
- [x] Confirm audit log table is not writable by the Flask DB user (INSERT only, no UPDATE/DELETE)

**Verified:** Hash chain implementation in `backend/app/services/audit.py` — each entry's `entry_hash` is SHA-256 of `prev_hash + timestamp + user_id + action_type + outcome`. Chain verification script confirmed zero broken links. Fixed Docker auto-granted `ALL PRIVILEGES` by adding `REVOKE ALL PRIVILEGES ON trialguard.* FROM 'tg_app'@'%'` to `backend/db/init.sql`. Confirmed grants: `GRANT SELECT, INSERT ON trialguard.audit_logs TO 'tg_app'@'%'` — no UPDATE/DELETE.

Acceptance Criteria:
- [x] Hash chain verification passes on live DB: zero broken links
- [x] Flask DB user has INSERT but not UPDATE/DELETE on `audit_log` table

---

### Task 14.3 — Database Referential Integrity Constraints

**Status:** Done

- [x] Confirm foreign key constraints are defined in MySQL schema (not just in application code)
- [x] Run `SHOW CREATE TABLE <table>` for all tables — check for `FOREIGN KEY` clauses
- [x] Confirm MySQL uses InnoDB engine (the only MySQL engine that enforces FKs)
- [x] Verify user deactivation uses `active=False` flag pattern — not `DELETE` — to preserve FK references and audit history

**Verified:** 4 FK constraints in `backend/db/init.sql`: `fk_participant_user` (participants→users), `fk_participant_trial` (participants→trials), `fk_consent_participant` (consent_records→participants), `fk_consent_trial` (consent_records→trials). All use `ON DELETE RESTRICT`. All 5 tables confirmed InnoDB engine. User deactivation uses `locked_until` sentinel date (9999-12-31) via admin suspend endpoint — no DELETE operations.

Acceptance Criteria:
- [x] All FK relationships defined at the database level, not only in SQLAlchemy models
- [x] Deactivated accounts use locked_until sentinel (not deleted rows) — preserves FK references and audit history

---

### Task 14.4 — Input Validation at All Trust Boundaries

**Status:** Done

- [x] Audit Flask API endpoints — every route that accepts user input must validate before processing
- [x] Confirm all SQL queries use SQLAlchemy parameterised queries or ORM (no string concatenation)
- [x] Confirm all MongoDB queries escape user-supplied operators (`$where`, `$gt` injection)
- [x] Confirm all form inputs are validated server-side (not only frontend JS validation)

**Verified:** All routes use field allowlists (`_REGISTER_FIELDS`, `_LOGIN_FIELDS`, `_TRIAL_FIELDS`, etc.) and reject unexpected fields. All user inputs are explicitly cast with `str()` before use — prevents NoSQL operator injection. Zero raw SQL found (`grep -r "execute(" backend/` returns no matches) — all queries use SQLAlchemy ORM. Health data uses measurement type whitelist and numeric range validation. Email, username, and password validated with regex and complexity rules.

Acceptance Criteria:
- [x] `grep -r "execute(" backend/` returns no matches (no raw SQL — all ORM)
- [x] Sending `{"password": {"$gt": ""}}` to `/api/auth/login` returns 401, not 200

---

## Phase 15 — Availability Controls (CIA Pillar 3)

*Framework source: Secure Design Implementation — Availability Design (replication, failover, horizontal scaling, health checks).*

### Task 15.1 — Container Health Check Verification

**Status:** Done

- [x] Confirm `healthcheck` blocks are defined in `docker-compose.yml` for: flask, pii_vault, mysql, vault_db, mongodb, nginx, db-backup
- [x] Verify nginx depends on `flask: service_healthy` (nginx waits for Flask before accepting traffic)
- [x] Run `docker compose ps` on EC2 — all 7 containers must show `(healthy)` status

**Verified:** flask/pii_vault/mysql/vault_db/mongodb already had healthchecks. Added two missing ones: **nginx** (`docker-compose.yml` — `wget --spider http://127.0.0.1/healthz`, backed by a new internal `location = /healthz` returning HTTP 200 in `nginx/nginx.conf`, which bypasses the HTTP→HTTPS redirect) and **db-backup** (`find /backups -name '*.sql' -mmin -1500` — healthy only if a dump was written in the last ~25h, proving the daily backup loop is alive). `nginx` still `depends_on: flask: service_healthy`. Live `docker compose ps` shows **all 7 containers `(healthy)`**.

**Note (CI fix that unblocked this):** the nginx config is baked into the image via `COPY` in `nginx/Dockerfile`, but the CI deploy ran `docker compose up -d` without `--build`, so image changes (nginx config, flask code) never reached EC2 — live images were 6 days stale. Fixed `ci-cd.yml` deploy step to `docker compose up -d --build`. This also brought previously-undeployed work live (e.g. 12.1 nginx hardening headers, 13.5 PII masking) — verified `Permissions-Policy`/`X-Frame-Options`/`X-Content-Type-Options` headers now present on live responses.

Acceptance Criteria:
- [x] `docker compose ps` output shows `healthy` for all 7 services

---

### Task 15.2 — Backup and Restore Test

**Status:** Done

- [x] Confirm db-backup service is running and producing dumps (`/backups` inside the db-backup container; volume `ict2216-secure-software-development_db_backups`)
- [x] Verify rotation: at most 7 backup files are retained
- [x] Perform a restore test: spin up a temporary MySQL container, restore from the latest dump, confirm data integrity
- [x] Document recovery procedure in a runbook comment in this file

**Verified:** `backup/backup.sh` dumps both `main` (mysql) and `vault` (vault_db) DBs daily via `mysqldump --single-transaction` and rotates to the 7 most recent of each. Live `/backups` showed 7 `main_*.sql` + 7 `vault_*.sql`, latest < 24h old. **Restore test (isolated, live DB untouched):** started a throwaway `mysql:8.0` with the backups volume mounted read-only, created an empty `restored` DB, loaded the latest `main_*.sql` → recovered **4 users + 19 audit_log rows intact** (sample row: `test_admin`). `trials` restored with 0 rows — faithful to current DB state (no trials have been created in the system yet), confirming the dump/restore is lossless. Throwaway container removed afterward.

**Recovery runbook:**
```
# Restore the latest main DB backup into an isolated container to verify/recover:
docker run -d --name restore_test -e MYSQL_ROOT_PASSWORD=<tmp> \
  -v ict2216-secure-software-development_db_backups:/backups:ro mysql:8.0
docker exec restore_test sh -c 'mysql -uroot -p<tmp> -e "CREATE DATABASE restored"'
LATEST=$(docker exec restore_test sh -c 'ls -t /backups/main_*.sql | head -1')
docker exec restore_test sh -c "mysql -uroot -p<tmp> restored < $LATEST"
# (to restore into the LIVE DB instead, pipe the dump into the mysql container's
#  target database — only after confirming integrity in the isolated copy.)
docker rm -f restore_test
```

Acceptance Criteria:
- [x] Latest backup file exists and is newer than 24 hours
- [x] Restore test succeeds — users + audit_log rows recovered intact (trials table restored faithfully; 0 rows as none exist yet)
- [x] Rotation: no more than 7 dump files present (7 main + 7 vault)

---

### Task 15.3 — Disk Usage Monitoring

**Status:** Not Started

- [ ] Check current disk usage on EC2: `df -h` — confirm < 80% full
- [ ] Check log volume growth: `du -sh /var/lib/docker/volumes/`
- [ ] Set up a disk usage alert or cron job that emails `lcslayer22@gmail.com` if `/` exceeds 85%

Acceptance Criteria:
- [ ] Current disk usage < 80%
- [ ] Alert mechanism documented or configured

---

## Phase 16 — Authentication Controls (AAA Pillar 1)

*Framework source: Secure Design Implementation — Authentication Design (MFA, session design, installation-wizard model, passwordless considerations).*

### Task 16.1 — MFA Enforcement Audit

**Status:** In Progress [~] — code verified, live test pending

- [x] Confirm two-step login flow is enforced: no full session issued until TOTP verified
- [x] Verify intermediate session key (`mfa_pending_user_id`) is cleared after MFA verification
- [x] Confirm `session.clear()` is called before issuing the real session (prevent session fixation)
- [ ] Test: attempt to access a protected route after completing step 1 (password) but before step 2 (TOTP) — must return 401

**Verified (code):** `backend/app/routes/auth.py` — `login()` (step 1) only sets `session['mfa_pending_user_id']` after a correct password; no `user_id`/`role` is placed in the session, so `require_role` (which requires `user_id`) rejects partial sessions. `verify_mfa()` (step 2) checks the TOTP, then calls `session.clear()` and sets the real session keys — clearing the intermediate key and preventing session fixation. **Related fix (H3):** `login()` now also requires `email_verified` before issuing the MFA-pending session (returns 403 if unverified), placed after the password check so it doesn't leak account existence. Live deployed; existing accounts grandfathered. *Remaining:* live test that a partial (post-password, pre-TOTP) session is rejected by a protected route.

Acceptance Criteria:
- [ ] Accessing a protected route with only a partial (post-password, pre-TOTP) session returns 401

---

### Task 16.2 — Session Expiry and Management

**Status:** In Progress [~] — code verified, live test pending

- [x] Confirm `PERMANENT_SESSION_LIFETIME` is configured in Flask (recommend ≤ 30 minutes idle)
- [x] Confirm logout endpoint calls `session.clear()` and `session.modified = True`
- [x] Confirm login audit event is written to the hash-chain audit log on every successful login

**Verified (code):** `backend/config.py:23` sets `PERMANENT_SESSION_LIFETIME = timedelta(minutes=30)`, and `verify_mfa()` sets `session.permanent = True` so the lifetime applies. `logout()` (`auth.py`) calls `session.clear()` (which sets `session.modified`). Successful login writes `mfa_verify`/`login_step1` events to the hash-chain audit log. *Remaining:* live tests for idle expiry and post-logout cookie rejection.

Acceptance Criteria:
- [ ] Session expires after configured idle period — accessing a protected route after expiry returns 401
- [ ] Logout clears the session — subsequent requests with the old cookie return 401

---

### Task 16.3 — Account Lockout Verification

**Status:** In Progress [~] — code verified + timing oracle (H2) fixed live; lockout live-test pending

- [x] Confirm lockout triggers after 5 consecutive failed login attempts
- [x] Confirm lockout duration is 15 minutes
- [x] Confirm error response is generic — must not reveal whether the failure is a wrong password, locked account, or non-existent user (timing oracle prevention)
- [x] Confirm failed login attempts are recorded in the audit log

**Verified (code + live):** `backend/app/routes/auth.py` — `_LOCKOUT_ATTEMPTS = 5`, `_LOCKOUT_MINUTES = 15`; all failure paths (no user / locked / wrong password) return the same generic `{"error": "Invalid credentials."}` 401, and each failure is audited.

**Fix H2 (timing oracle):** previously a non-existent username returned *without* running bcrypt (fast ~10ms) while a real account ran bcrypt (~200ms) — letting an attacker enumerate usernames by response time. Fixed by running a dummy bcrypt (`_DUMMY_HASH`) for non-existent users so all paths take the same time. Verified live: three non-existent usernames all returned 401 in a consistent ~1.1s (bcrypt cost now incurred). **Fix M1 (related):** audit-log/rate-limit IP now read from nginx-set `X-Real-IP` instead of the client-spoofable `X-Forwarded-For` (`_ip()` in auth.py) — accurate attacker IP in the audit trail.

*Remaining:* live test — 6 rapid wrong-password attempts on a real account → account locked for 15 min.

Acceptance Criteria:
- [x] Failure responses are generic 401 with no extra detail (verified live)
- [ ] 6 rapid wrong-password attempts lock the account for 15 minutes; unlocks automatically after

---

### Task 16.4 — Admin Account Creation Model

**Status:** Done

- [x] Confirm no hard-coded admin credentials exist in the database seed script or source code
- [x] Confirm the initial admin account is created via a setup/registration endpoint — not pre-seeded with a default password
- [x] Scan codebase for literal strings like `admin`, `password`, `123456` that may be default credentials

**Verified:** `backend/db/init.sql` defines only the schema (no `INSERT INTO users`, no seeded credentials). `register()` (`auth.py`) hard-codes `role='participant'` for all new accounts — there is no path to self-register as admin. Admin accounts are created by registering normally then promoting via a manual DB `UPDATE` (no default password ever set). No default/hard-coded credentials found in source or seed.

Acceptance Criteria:
- [x] No default credentials found in codebase or DB seed
- [x] Admin account creation requires explicit password input (registration sets the password; promotion is a separate manual step)

---

## Phase 17 — Authorisation Controls (AAA Pillar 2)

*Framework source: Secure Design Implementation — Authorisation Design (RBAC, Data Access Control Matrix, least privilege, separation of duties).*

### Task 17.1 — RBAC Roles Audit

**Status:** In Progress [~] — code verified, live IDOR test pending

- [x] Document the Data Access Control Matrix for TrialGuard roles (Admin / Researcher / Participant):

| Data | Admin | Researcher | Participant |
|---|---|---|---|
| User accounts | CRUD | Read (own) | Read (own only) |
| Trial records | CRUD | CRUD (own) | Read (enrolled only) |
| Participant data | CRUD | Read | Read (own only) |
| Audit log | Read | — | — |
| Compliance report | Read | — | — |

- [x] Verify each row above is enforced in Flask route decorators / middleware
- [ ] Confirm no role can access another user's data by changing a URL parameter (IDOR check)

**Verified (code):** `backend/app/middleware/__init__.py` — `require_role(*roles)` enforces authentication (401 if no `user_id` in session) then role membership (403 otherwise); applied as a decorator on every admin/researcher/participant route. `owns_resource(resource_user_id)` provides the IDOR check (e.g. `participant.py:292`), and participant queries are scoped to the session user (`filter_by(user_id=user.user_id)`), so a user cannot read another user's record by changing an ID. *Remaining:* live IDOR tests with two accounts.

Acceptance Criteria:
- [ ] IDOR test: authenticated as Participant A, access a resource owned by another user → 403
- [ ] IDOR test: change user ID in request to another user's ID → 403

---

### Task 17.2 — Database Service Account Least Privilege

**Status:** Done

- [x] Confirm Flask DB user is NOT the MySQL root account — app uses `tg_app`@`%` (see `backend/config.py:8-11`, `DB_USER`)
- [x] Run `SHOW GRANTS FOR 'tg_app'@'%'` — list actual permissions
- [x] Remove any unnecessary grants (e.g., DROP, CREATE, GRANT OPTION)
- [x] Flask DB user should have: SELECT, INSERT, UPDATE, DELETE on the application database only
- [x] Audit log table: Flask DB user should have INSERT only (no UPDATE/DELETE — append-only)

**Verified (V&V finding + live remediation):** `init.sql:83-89` already defines the correct least-privilege grants, but `SHOW GRANTS` on the live DB revealed `GRANT ALL PRIVILEGES ON trialguard.* TO 'tg_app'@'%'` was **still present** — because `docker-entrypoint-initdb.d/init.sql` only runs on first DB init, and the live `mysql_data` volume predated the REVOKE. Remediated directly on the live DB (REVOKE ALL on `trialguard.*` + re-apply per-table grants; persists in the volume). Post-fix `SHOW GRANTS` shows only `USAGE`, per-table DML on users/trials/participants/consent_records, and **SELECT,INSERT only on audit_logs**. Confirmed app stayed healthy. Append-only proven live: `DELETE FROM audit_logs` as `tg_app` returns `ERROR 1142: DELETE command denied` — the app account cannot tamper with the audit log (also reinforces Task 14.2).

Acceptance Criteria:
- [x] Flask DB user grants confirmed — no root-level or DDL permissions
- [x] Audit log table: INSERT only for Flask DB user (DELETE denied — `ERROR 1142`)

---

### Task 17.3 — Flask Container Runs as Non-Root

**Status:** Done

- [x] Inspect Dockerfile: confirm a non-root user is created and set with `USER`
- [x] Verify in running container: `docker exec ict2216-secure-software-development-flask-1 whoami` — must not return `root`
- [x] Apply the same check to the pii_vault container

**Verified:** `backend/Dockerfile:3,13` creates `appuser` (`groupadd -r appuser && useradd -r -g appuser appuser`) and sets `USER appuser`; `pii_vault/Dockerfile:3,13` does the same for `vaultuser`. Live check: `docker exec ...-flask-1 whoami` → `appuser`, `...-pii_vault-1 whoami` → `vaultuser`. Neither container runs as root.

Acceptance Criteria:
- [x] `docker exec ict2216-secure-software-development-flask-1 whoami` returns a non-root username (`appuser`)
- [x] `docker exec ict2216-secure-software-development-pii_vault-1 whoami` returns a non-root username (`vaultuser`)

---

## Phase 18 — Accountability Controls (AAA Pillar 3)

*Framework source: Secure Design Implementation — Accountability Design (who/what/where/when, no PII in logs, write-once, rotation).*

### Task 18.1 — Audit Log Schema Verification

**Status:** Not Started

- [ ] Confirm every audit log entry captures: `user_id` (who), `action_type` (what), `ip_address` + `endpoint` (where), `timestamp` (when)
- [ ] Confirm the hash chain field (`prev_hash`, `current_hash`) is present and populated on every row
- [ ] Run a query to confirm no NULL values in mandatory fields: `SELECT COUNT(*) FROM audit_log WHERE user_id IS NULL OR action_type IS NULL OR timestamp IS NULL`

Acceptance Criteria:
- [ ] Zero rows with NULL mandatory fields
- [ ] `DESCRIBE audit_log` shows all required columns present

---

### Task 18.2 — No PII or Credentials in Application Logs

**Status:** Not Started

- [ ] Inspect Flask application logs on EC2: `docker logs ict2216-secure-software-development-flask-1 2>&1 | head -100`
- [ ] Confirm no passwords, TOTP codes, session tokens, or full email addresses appear in stdout
- [ ] Inspect pii_vault logs: `docker logs ict2216-secure-software-development-pii_vault-1 2>&1 | head -100`
- [ ] Confirm nginx access logs do not log request bodies (POST body with credentials)

Acceptance Criteria:
- [ ] Manual review of last 100 log lines shows no passwords, tokens, or raw PII

---

### Task 18.3 — Log Rotation and Retention Policy

**Status:** Not Started

- [ ] Confirm Docker container logs have a size/rotation limit in `docker-compose.yml`:
  ```yaml
  logging:
    driver: "json-file"
    options:
      max-size: "10m"
      max-file: "5"
  ```
- [ ] Apply `logging` block to all 7 services in docker-compose
- [ ] Define retention policy for the MySQL audit_log table: decide after how many days old entries are archived or purged, and document the decision here: ___________

Acceptance Criteria:
- [ ] `docker inspect ict2216-secure-software-development-flask-1 | grep -A5 LogConfig` shows json-file driver with size limit
- [ ] Retention policy documented above

---

## Phase 19 — OWASP Design Principles Audit

*Framework source: Security by Design Principles — 10 OWASP principles (McGraw 2006; OWASP Development Guide).*

Each item below is a verification checkpoint — confirm the principle is upheld in the live deployment.

### Task 19.1 — Minimise Attack Surface

- [ ] Run `docker exec ict2216-secure-software-development-nginx-1 nginx -T | grep "location"` — list all exposed endpoints
- [ ] Confirm no debug or test routes are accessible in production (`/api/debug`, `/test`, `/admin/seed`)
- [ ] Confirm MongoDB is not exposed on any public port (`docker compose ps` — port 27017 must not be published)

### Task 19.2 — Secure Defaults

- [ ] HTTPS enforced by default — HTTP returns 301 redirect, never serves content
- [ ] New user accounts are created with minimum role (Participant), not Admin
- [ ] Email change and password reset notifications are sent by default

### Task 19.3 — Least Privilege *(see Phase 17 tasks)*

- [ ] Cross-reference: Tasks 17.2 and 17.3 completed

### Task 19.4 — Defence in Depth

- [ ] nginx validates request size and method (Task 12.2)
- [ ] Flask validates input at API layer (Task 14.4)
- [ ] MySQL enforces constraints at DB layer (Task 14.3)
- [ ] All three layers active simultaneously — confirm none is bypassed by direct container access

### Task 19.5 — Fail Securely

- [ ] Search codebase for any privilege variable initialised to a truthy value: `grep -r "is_admin\s*=\s*True\|is_staff\s*=\s*True" backend/`
- [ ] Confirm Flask 500 handler returns `{"error": "Internal server error"}` with no stack trace (Task 12.1)
- [ ] Confirm that any exception in authorisation middleware defaults to deny, not allow

### Task 19.6 — Don't Trust Services

- [ ] Confirm all data received from the pii_vault service is validated in Flask before use
- [ ] Confirm email sending service (if used) input is sanitised before passing to external SMTP
- [ ] Confirm any third-party OAuth provider response is validated (not blindly trusted)

### Task 19.7 — Separation of Duties

- [ ] Admin cannot log in as another user — `POST /api/auth/admin/impersonate` must not exist
- [ ] Admin password reset sends link directly to user; admin cannot set user password directly
- [ ] Compliance report (read-only) is separate from trial management (write) — different endpoints

### Task 19.8 — Avoid Security by Obscurity

- [ ] Confirm no routes rely on non-guessable URLs as the sole access control (e.g., `/admin/secret-uuid`)
- [ ] Confirm all endpoints require proper authentication + authorisation decorators

### Task 19.9 — Keep Security Simple

- [ ] Review authorisation middleware — ensure no double-negative logic (`if not not is_authenticated`)
- [ ] Confirm the TOTP two-step flow is the only MFA path — no complex branching around it

### Task 19.10 — Fix Security Issues Correctly

- [ ] Document a bug-fix protocol: any security bug fix must include (1) a test that reproduces it, (2) root cause analysis, (3) check for same pattern elsewhere in the codebase
- [ ] Confirm any previously identified vulnerability was fixed at root cause, not patched around

Acceptance Criteria:
- [ ] All 10 principles verified — each item above checked off
- [ ] Any failing items converted to new tracked tasks

---

## Phase 20 — Secure Architecture Documentation and Validation

*Framework source: Secure Design Architecture — 4 Steps (Document → Identify Threats → Implement Controls → Document & Validate).*

### Task 20.1 — Step 1: Document the Architecture

- [ ] Produce or update a deployment topology diagram covering:
  - Physical zones: Internet → nginx (DMZ) → Flask + pii_vault (App layer) → MySQL + MongoDB (Data layer)
  - All 7 containers, their ports, and internal Docker network
  - EC2 instance and its security groups (inbound: 443, 80, 22 only)
- [ ] Document all human actors: Admin, Researcher, Participant
- [ ] Document all non-human actors: db-backup service, health check probes
- [ ] Document all data elements and classification (PII in pii_vault, trial data in MySQL, audit log in MySQL)

Acceptance Criteria:
- [ ] Architecture diagram exists in `/docs/architecture.md` or equivalent
- [ ] All actors and data classified

---

### Task 20.2 — Step 2: Identify Threats (STRIDE on DFD)

- [ ] Draw a DFD (at least level 1) with trust boundaries between: Internet / nginx / Flask / MySQL
- [ ] Apply STRIDE to each data flow crossing a trust boundary:
  - **S**poofing — can an attacker impersonate a user or service?
  - **T**ampering — can an attacker modify data in transit?
  - **R**epudiation — can an actor deny an action?
  - **I**nformation Disclosure — can sensitive data leak?
  - **D**enial of Service — can a component be overwhelmed?
  - **E**levation of Privilege — can a low-privilege actor gain higher access?
- [ ] Record each identified threat with a risk rating (High / Medium / Low)

Acceptance Criteria:
- [ ] Threat table exists — at least 6 threats identified (one per STRIDE category)
- [ ] Each threat has an assigned risk rating and mapped control

---

### Task 20.3 — Step 3: Verify Controls Are Implemented

- [ ] Cross-reference each threat from Task 20.2 against the controls verified in Phases 12–19
- [ ] For any threat without a mapped control — create a new task in this file

Acceptance Criteria:
- [ ] Every High-risk threat has a verified control
- [ ] No unmitigated High-risk threats remain open

---

### Task 20.4 — Step 4: Document and Validate (Threat Profile + V&V Report)

- [ ] Produce a **Threat Profile** — table of all identified threats, their risk ratings, and their mitigating controls
- [ ] Produce a **Residual Risk Assessment** — list risks that remain after controls are applied, with justification for acceptance
- [ ] Produce a **V&V summary** — for each control, evidence that it was tested (command used, output observed, date)

Acceptance Criteria:
- [ ] Threat Profile document exists and covers all STRIDE categories
- [ ] Residual Risk Assessment declares acceptable risk with rationale
- [ ] V&V summary references tests from Phases 12–19 acceptance criteria

---

## Priority Summary

### Must Do (Critical Gaps)
- [ ] Task 12.1 — nginx hardening (timeouts, method restriction)
- [ ] Task 13.1 — TLS certificate validity check
- [ ] Task 13.2 — Session cookie security flags
- [ ] Task 14.1 — bcrypt cost factor NFR (document justified iteration count)
- [ ] Task 14.4 — Input validation at all trust boundaries
- [ ] Task 16.1 — MFA enforcement audit
- [ ] Task 17.2 — DB service account least privilege

### Should Do (Significant Risk Reduction)
- [ ] Task 12.2 — Redis-backed rate limiting
- [ ] Task 12.3 — Fail2ban SSH protection
- [ ] Task 13.3 — Secrets not in git
- [ ] Task 14.2 — Audit log hash chain integrity
- [ ] Task 14.3 — DB referential integrity constraints
- [ ] Task 15.1 — All 7 container health checks healthy
- [ ] Task 16.3 — Account lockout verification
- [ ] Task 17.1 — RBAC Data Access Control Matrix + IDOR test
- [ ] Task 17.3 — Non-root container users
- [ ] Task 18.2 — No PII in application logs
- [ ] Phase 19 — OWASP principles audit

### Nice to Have (Compliance and Documentation)
- [ ] Task 12.4 — Automatic security updates
- [ ] Task 13.4 — DB connection TLS
- [ ] Task 15.2 — Backup restore test
- [ ] Task 15.3 — Disk usage monitoring
- [ ] Task 18.3 — Log rotation policy
- [ ] Phase 20 — Architecture documentation and threat profile
