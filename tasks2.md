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

**Status:** Not Started

- [x] Install Fail2ban: `sudo apt install fail2ban -y`
- [x] Create `/etc/fail2ban/jail.local` — enable SSH jail, ban after 5 failures for 1 hour
- [x] Enable and start Fail2ban service
- [x] Verify SSH jail is active: `sudo fail2ban-client status sshd`

Acceptance Criteria:
- [x] `sudo fail2ban-client status sshd` shows jail is active
- [x] Fail2ban service is enabled on boot (`sudo systemctl is-enabled fail2ban`)

---

### Task 12.4 — Automatic Security Updates on EC2

**Status:** Not Started

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

**Status:** In Progress [~]

- [x] Confirm `SESSION_COOKIE_HTTPONLY=True` in Flask config (prevents JS access to session cookie)
- [ ] Confirm `SESSION_COOKIE_SECURE=True` (cookie only transmitted over HTTPS)
- [x] Confirm `SESSION_COOKIE_SAMESITE='Strict'` (blocks cross-site request inclusion)
- [x] Verify flags in browser DevTools → Application → Cookies, or with: `curl -sk -c - https://18.223.111.152/api/auth/login`

Acceptance Criteria:
- [ ] Response `Set-Cookie` header includes `HttpOnly; Secure; SameSite=Strict`

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

**Status:** Not Started

- [ ] Verify Flask → MySQL connection uses SSL/TLS (`ssl_ca`, `ssl_cert` in SQLAlchemy URI or connection args)
- [ ] Verify pii_vault → vault_db connection uses SSL/TLS
- [ ] If plaintext, add `ssl_args` to SQLAlchemy engine and regenerate MySQL user with `REQUIRE SSL`
- [ ] Confirm MongoDB connection string includes `tls=true` if used for sensitive data

Acceptance Criteria:
- [ ] `SHOW STATUS LIKE 'Ssl_cipher'` inside MySQL container returns a non-empty cipher name

---

### Task 13.5 — PII Masking in API Responses

**Status:** Not Started

- [ ] Audit all `GET` API responses — confirm email, phone, and NRIC are never returned in full
- [ ] Apply display-layer masking where full values are not needed (e.g., `j***@example.com`)
- [ ] Confirm that PII fields in the MongoDB PII vault are not returned directly to the frontend — pii_vault API should only return lookup tokens

Acceptance Criteria:
- [ ] GET `/api/admin/users` returns masked or omitted PII fields (not full email/NRIC)
- [ ] pii_vault responses contain tokens, not plaintext PII

---

## Phase 14 — Integrity Controls (CIA Pillar 2)

*Framework source: Secure Design Implementation — Integrity Design (salted hashing, bcrypt NFR, referential integrity, resource locking).*

### Task 14.1 — bcrypt Cost Factor NFR Verification

**Status:** Not Started

- [ ] Locate bcrypt cost factor in `backend/app/` config (should be `cost=12`)
- [ ] Time a single bcrypt hash on the EC2 instance: `python3 -c "import bcrypt, time; s=time.time(); bcrypt.hashpw(b'test', bcrypt.gensalt(12)); print(time.time()-s)"`
- [ ] Document: cost=12, measured latency=___ ms on t2.micro/EC2 — confirm < 300 ms
- [ ] Record NFR: "bcrypt cost factor 12 — authentication completes in < 300 ms on EC2 target hardware; per-guess cost > 100 ms for an attacker"

Acceptance Criteria:
- [ ] Cost factor 12 confirmed in code
- [ ] Authentication latency measured and documented in this file

---

### Task 14.2 — Audit Log Hash Chain Integrity Check

**Status:** Not Started

- [ ] Verify that the audit log hash chain script/function exists in the codebase
- [ ] Run the hash chain verification against the live MySQL database: confirm no broken links
- [ ] Add a scheduled job or admin endpoint to run the chain check periodically
- [ ] Confirm audit log table is not writable by the Flask DB user (INSERT only, no UPDATE/DELETE)

Acceptance Criteria:
- [ ] Hash chain verification passes on live DB: zero broken links
- [ ] Flask DB user has INSERT but not UPDATE/DELETE on `audit_log` table

---

### Task 14.3 — Database Referential Integrity Constraints

**Status:** Not Started

- [ ] Confirm foreign key constraints are defined in MySQL schema (not just in application code)
- [ ] Run `SHOW CREATE TABLE <table>` for all tables — check for `FOREIGN KEY` clauses
- [ ] Confirm MySQL uses InnoDB engine (the only MySQL engine that enforces FKs)
- [ ] Verify user deactivation uses `active=False` flag pattern — not `DELETE` — to preserve FK references and audit history

Acceptance Criteria:
- [ ] All FK relationships defined at the database level, not only in SQLAlchemy models
- [ ] `SELECT * FROM users WHERE active=false` returns deactivated accounts (not deleted rows)

---

### Task 14.4 — Input Validation at All Trust Boundaries

**Status:** Not Started

- [ ] Audit Flask API endpoints — every route that accepts user input must validate before processing
- [ ] Confirm all SQL queries use SQLAlchemy parameterised queries or ORM (no string concatenation)
- [ ] Confirm all MongoDB queries escape user-supplied operators (`$where`, `$gt` injection)
- [ ] Confirm all form inputs are validated server-side (not only frontend JS validation)

Acceptance Criteria:
- [ ] `grep -r "execute(" backend/` returns only parameterised calls (no f-string or `.format()` SQL)
- [ ] Sending `{"password": {"$gt": ""}}` to `/api/auth/login` returns 400 or 401, not 200

---

## Phase 15 — Availability Controls (CIA Pillar 3)

*Framework source: Secure Design Implementation — Availability Design (replication, failover, horizontal scaling, health checks).*

### Task 15.1 — Container Health Check Verification

**Status:** Not Started

- [ ] Confirm `healthcheck` blocks are defined in `docker-compose.yml` for: flask, pii_vault, mysql, vault_db, mongodb, nginx, db-backup
- [ ] Verify nginx depends on `flask: service_healthy` (nginx waits for Flask before accepting traffic)
- [ ] Run `docker compose ps` on EC2 — all 7 containers must show `(healthy)` status

Acceptance Criteria:
- [ ] `docker compose ps` output shows `healthy` for all 7 services

---

### Task 15.2 — Backup and Restore Test

**Status:** Not Started

- [ ] Confirm db-backup service is running and producing dumps: `ls -lh /var/lib/docker/volumes/trialguard_db_backups/_data/`
- [ ] Verify rotation: at most 7 backup files are retained
- [ ] Perform a restore test: spin up a temporary MySQL container, restore from the latest dump, confirm data integrity
- [ ] Document recovery procedure in a runbook comment in this file

Acceptance Criteria:
- [ ] Latest backup file exists and is newer than 24 hours
- [ ] Restore test succeeds — at least one user and one trial record is recoverable
- [ ] Rotation: no more than 7 dump files present

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

**Status:** Not Started

- [ ] Confirm two-step login flow is enforced: no full session issued until TOTP verified
- [ ] Verify intermediate session key (`mfa_pending_user_id`) is cleared after MFA verification
- [ ] Confirm `session.clear()` is called before issuing the real session (prevent session fixation)
- [ ] Test: attempt to access a protected route after completing step 1 (password) but before step 2 (TOTP) — must return 401

Acceptance Criteria:
- [ ] Accessing `/api/trials` with only a partial (post-password, pre-TOTP) session returns 401

---

### Task 16.2 — Session Expiry and Management

**Status:** Not Started

- [ ] Confirm `PERMANENT_SESSION_LIFETIME` is configured in Flask (recommend ≤ 30 minutes idle)
- [ ] Confirm logout endpoint calls `session.clear()` and `session.modified = True`
- [ ] Confirm login audit event is written to the hash-chain audit log on every successful login

Acceptance Criteria:
- [ ] Session expires after configured idle period — accessing a protected route after expiry returns 401
- [ ] Logout clears the session — subsequent requests with the old cookie return 401

---

### Task 16.3 — Account Lockout Verification

**Status:** Not Started

- [ ] Confirm lockout triggers after 5 consecutive failed login attempts
- [ ] Confirm lockout duration is 15 minutes
- [ ] Confirm error response is generic — must not reveal whether the failure is a wrong password, locked account, or non-existent user (timing oracle prevention)
- [ ] Confirm failed login attempts are recorded in the audit log

Acceptance Criteria:
- [ ] 6 rapid POST `/api/auth/login` calls with wrong password → 6th returns same 401 with no extra detail
- [ ] Account remains locked for 15 minutes; unlocks automatically after

---

### Task 16.4 — Admin Account Creation Model

**Status:** Not Started

- [ ] Confirm no hard-coded admin credentials exist in the database seed script or source code
- [ ] Confirm the initial admin account is created via a setup/registration endpoint — not pre-seeded with a default password
- [ ] Scan codebase for literal strings like `admin`, `password`, `123456` that may be default credentials: `grep -r "admin" backend/ --include="*.py" | grep -i "password\|default"`

Acceptance Criteria:
- [ ] No default credentials found in codebase or DB seed
- [ ] Admin account creation requires explicit password input (installation-wizard model)

---

## Phase 17 — Authorisation Controls (AAA Pillar 2)

*Framework source: Secure Design Implementation — Authorisation Design (RBAC, Data Access Control Matrix, least privilege, separation of duties).*

### Task 17.1 — RBAC Roles Audit

**Status:** Not Started

- [ ] Document the Data Access Control Matrix for TrialGuard roles (Admin / Researcher / Participant):

| Data | Admin | Researcher | Participant |
|---|---|---|---|
| User accounts | CRUD | Read (own) | Read (own only) |
| Trial records | CRUD | CRUD (own) | Read (enrolled only) |
| Participant data | CRUD | Read | Read (own only) |
| Audit log | Read | — | — |
| Compliance report | Read | — | — |

- [ ] Verify each row above is enforced in Flask route decorators / middleware
- [ ] Confirm no role can access another user's data by changing a URL parameter (IDOR check)

Acceptance Criteria:
- [ ] IDOR test: authenticated as Participant A, access `/api/trials/<trial_owned_by_admin>` → 403
- [ ] IDOR test: change user ID in request to another user's ID → 403

---

### Task 17.2 — Database Service Account Least Privilege

**Status:** Not Started

- [ ] Confirm Flask DB user is NOT the MySQL root account
- [ ] Run `SHOW GRANTS FOR 'flask_user'@'%'` — list actual permissions
- [ ] Remove any unnecessary grants (e.g., DROP, CREATE, GRANT OPTION)
- [ ] Flask DB user should have: SELECT, INSERT, UPDATE, DELETE on the application database only
- [ ] Audit log table: Flask DB user should have INSERT only (no UPDATE/DELETE — append-only)

Acceptance Criteria:
- [ ] Flask DB user grants confirmed — no root-level or DDL permissions
- [ ] Audit log table: INSERT only for Flask DB user

---

### Task 17.3 — Flask Container Runs as Non-Root

**Status:** Not Started

- [ ] Inspect Dockerfile: confirm a non-root user is created and set with `USER`
- [ ] Verify in running container: `docker exec trialguard-flask-1 whoami` — must not return `root`
- [ ] Apply the same check to the pii_vault container

Acceptance Criteria:
- [ ] `docker exec trialguard-flask-1 whoami` returns a non-root username
- [ ] `docker exec trialguard-pii_vault-1 whoami` returns a non-root username

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

- [ ] Inspect Flask application logs on EC2: `docker logs trialguard-flask-1 2>&1 | head -100`
- [ ] Confirm no passwords, TOTP codes, session tokens, or full email addresses appear in stdout
- [ ] Inspect pii_vault logs: `docker logs trialguard-pii_vault-1 2>&1 | head -100`
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
- [ ] `docker inspect trialguard-flask-1 | grep -A5 LogConfig` shows json-file driver with size limit
- [ ] Retention policy documented above

---

## Phase 19 — OWASP Design Principles Audit

*Framework source: Security by Design Principles — 10 OWASP principles (McGraw 2006; OWASP Development Guide).*

Each item below is a verification checkpoint — confirm the principle is upheld in the live deployment.

### Task 19.1 — Minimise Attack Surface

- [ ] Run `docker exec trialguard-nginx-1 nginx -T | grep "location"` — list all exposed endpoints
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
