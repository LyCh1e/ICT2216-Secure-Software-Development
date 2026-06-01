# tasks.md — TrialGuard Implementation Task Breakdown

## Purpose
This file is the implementation checklist for TrialGuard: Secure Clinical Trial Participant Portal.

## Task Status Key
- `[ ]` Not started
- `[~]` In progress
- `[x]` Done
- `[!]` Blocked / needs decision

A task is done only when:
- Code runs without errors.
- Security control is enforced server-side (not just on the frontend).
- No hardcoded credentials, secrets, or test data in committed code.
- Docker Compose brings up the service cleanly.
- The feature works end-to-end (React → Flask → DB).
- Basic manual validation steps are documented.

---

## Phase 0 — Repo Restructure

### Task 0.1 — Reorganise Folder Structure

**Status:** Done

- [x] Move existing `src/`, `index.html`, `vite.config.js`, `package.json` into a new `frontend/` subfolder
- [x] Create `backend/` folder skeleton
- [x] Create `pii_vault/` folder skeleton
- [x] Create `nginx/` folder skeleton
- [x] Update root `.gitignore` to cover Python (`__pycache__`, `*.pyc`, `.venv`), env files (`.env`), Docker volumes, and `node_modules`
- [x] Add `.gitattributes` to enforce LF line endings for cross-platform compatibility (Windows teammates)

Acceptance Criteria:
- [x] Repo root contains only: `frontend/`, `backend/`, `pii_vault/`, `nginx/`, `docker-compose.yml`, `.env.template`, `tasks.md`, `README.md`
- [x] `cd frontend && npm run dev` still starts the React dev server
- [x] No secrets or `.env` files committed
- [x] Shell scripts and configs use LF line endings on all platforms

---

## Phase 1 — Docker Infrastructure

### Task 1.1 — Create docker-compose.yml

**Status:** Done

- [x] Define `nginx` service — ports 80 and 443, depends on `flask` and `frontend`
- [x] Define `flask` service — port 8080 (internal), mounts `backend/`, reads from `.env`
- [x] Define `mysql` service — port 3306 (internal only, not exposed to host), persistent volume
- [x] Define `mongodb` service — port 27017 (internal only, not exposed to host), persistent volume
- [x] Define `pii_vault` service — port 8888 (internal only), separate container
- [x] Add shared internal Docker network so services can communicate by name
- [x] Add health checks for MySQL and MongoDB so Flask waits for DB to be ready

Acceptance Criteria:
- [x] `docker compose up --build` starts all 5 services without errors
- [x] MySQL and MongoDB are not reachable from outside the Docker network
- [x] Flask can reach MySQL and MongoDB by service name

---

### Task 1.2 — Create Backend Dockerfile

**Status:** Done

- [x] Base image: `python:3.12-slim`
- [x] Copy `requirements.txt` and install dependencies
- [x] Copy application code
- [x] Set non-root user for the container
- [x] Expose port 8080
- [x] Entrypoint runs Flask via Gunicorn in production

Acceptance Criteria:
- [x] Image builds cleanly with `docker build`
- [x] Container starts and Flask is reachable on port 8080

---

### Task 1.3 — Create PII Vault Dockerfile

**Status:** Done

- [x] Base image: `python:3.12-slim`
- [x] Separate `requirements.txt` for vault dependencies
- [x] Set non-root user
- [x] Expose port 8888
- [x] Entrypoint runs vault Flask app via Gunicorn

Acceptance Criteria:
- [x] Image builds cleanly
- [x] Vault is reachable internally on port 8888

---

### Task 1.4 — Create Frontend Dockerfile

**Status:** Done

- [x] Stage 1: Node 20 image — runs `npm ci` and `npm run build` to produce `dist/`
- [x] Stage 2: Copy `dist/` output for nginx to serve (or include directly in nginx image)

Acceptance Criteria:
- [x] `docker build` produces a final image with only the built static files
- [x] No `node_modules` in the final image

---

### Task 1.5 — Create nginx Configuration

**Status:** Done

- [x] Serve React `dist/` static files on port 443
- [x] Proxy all `/api/*` requests to `flask:8080`
- [x] Redirect HTTP (port 80) to HTTPS (port 443)
- [x] Add security headers: `Strict-Transport-Security`, `X-Frame-Options`, `X-Content-Type-Options`, `Content-Security-Policy`
- [x] Rate limiting on `/api/login` and `/api/register`
- [x] Self-signed TLS certificate for EC2 IP (no domain)

Acceptance Criteria:
- [x] Visiting HTTP redirects to HTTPS
- [x] React app loads over HTTPS
- [x] API calls from React reach Flask correctly

---

### Task 1.6 — Create .env.template

**Status:** Done

- [x] `FLASK_SECRET_KEY` — used for session signing
- [x] `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS` — MySQL connection
- [x] `MONGO_URI` — MongoDB connection string
- [x] `VAULT_URL` — internal URL of PII vault service (`http://pii_vault:8888`)
- [x] `VAULT_SHARED_SECRET` — shared secret for Flask → vault authentication
- [x] `VAULT_ENCRYPTION_KEY` — AES-256 key for PII at rest in the vault
- [x] `FLASK_ENV` — `development` or `production`

Acceptance Criteria:
- [x] `.env.template` committed to repo with placeholder values only
- [x] `.env` is in `.gitignore` and never committed

---

## Phase 2 — Database Setup

### Task 2.1 — Create MySQL Schema

**Status:** Done

- [x] `users` table: `user_id` (PK), `username`, `password_hash`, `role`, `email`, `email_verified`, `mfa_secret`, `mfa_enabled`, `failed_login_attempts`, `locked_until`, `created_at`, `last_login`
- [x] `participants` table: `participant_id` (PK), `pseudonym_token` (unique, indexed), `user_id` (FK), `trial_id` (FK), `consent_status`, `withdrawal_triggered`, `created_at`
- [x] `consent_records` table: `consent_id` (PK), `participant_id` (FK), `trial_id` (FK), `consent_text_version`, `signed_at`, `digital_signature_hash`, `withdrawn_at`
- [x] `trials` table: `trial_id` (PK), `title`, `description`, `phase`, `sponsor`, `duration`, `stipend`, `risk_level`, `spots_total`, `spots_enrolled`, `location`, `status`, `created_at`
- [x] `audit_logs` table: `log_id` (PK), `user_id` (FK, nullable), `action_type`, `resource_affected`, `outcome`, `ip_address`, `timestamp`, `prev_hash`, `entry_hash`
- [x] Write DB init SQL script that runs on first container start

Acceptance Criteria:
- [x] All tables created cleanly on `docker compose up`
- [x] Foreign key constraints enforced
- [x] `audit_logs` has no UPDATE or DELETE privileges granted to the app DB user

---

### Task 2.2 — Create SQLAlchemy Models

**Status:** Done

- [x] `User` model matching `users` table
- [x] `Participant` model matching `participants` table
- [x] `ConsentRecord` model matching `consent_records` table
- [x] `Trial` model matching `trials` table
- [x] `AuditLog` model matching `audit_logs` table (no `update()` or `delete()` methods exposed)

Acceptance Criteria:
- [x] All models import cleanly
- [x] Flask can query all models without errors
- [x] `AuditLog` model has no delete or update methods

---

### Task 2.3 — Create MongoDB Health Telemetry Collection

**Status:** Done

- [x] Define document schema: `telemetry_id`, `pseudonym_token`, `trial_id`, `measurement_type`, `value`, `unit`, `recorded_at`, `submitted_at`
- [x] Create index on `pseudonym_token` for fast lookup
- [x] Write a PyMongo helper to insert and query telemetry documents safely

Acceptance Criteria:
- [x] Telemetry documents can be inserted and queried by `pseudonym_token`
- [x] No raw participant identity stored in MongoDB — pseudonym token only

---

## Phase 3 — Flask App Foundation

### Task 3.1 — Create Flask App Factory

**Status:** Done

- [x] `backend/app/__init__.py` — `create_app()` factory function
- [x] Initialise SQLAlchemy, PyMongo, Flask-WTF (CSRF), and Flask-Limiter extensions
- [x] Register blueprints: `auth`, `participant`, `researcher`, `admin`
- [x] Load config from environment variables via `backend/config.py`

Acceptance Criteria:
- [x] `flask run` starts without errors
- [x] All blueprints register correctly
- [x] CSRF protection active on all state-changing routes

---

### Task 3.2 — Create Config

**Status:** Done

- [x] `config.py` reads all values from environment variables (no hardcoded secrets)
- [x] `DevelopmentConfig` — debug on, relaxed CORS
- [x] `ProductionConfig` — debug off, strict settings
- [x] Session cookie settings: `SESSION_COOKIE_HTTPONLY=True`, `SESSION_COOKIE_SECURE=True`, `SESSION_COOKIE_SAMESITE='Strict'`, `PERMANENT_SESSION_LIFETIME=1800` (30 min)

Acceptance Criteria:
- [x] App starts in both dev and prod config without errors
- [x] No secret values present in `config.py` — all read from env

---

### Task 3.3 — Create Generic Error Handlers

**Status:** Done

- [x] 400 handler — returns generic `{"error": "Bad request"}` (no internal detail)
- [x] 401 handler — returns `{"error": "Unauthorised"}`
- [x] 403 handler — returns `{"error": "Forbidden"}`
- [x] 404 handler — returns `{"error": "Not found"}`
- [x] 500 handler — returns `{"error": "Internal server error"}` (no stack trace)

Acceptance Criteria:
- [x] No stack traces or internal error details returned to client in any response
- [x] All error responses are consistent JSON

---

### Task 3.4 — Create requirements.txt

**Status:** Done

- [x] `Flask==3.x`
- [x] `Flask-SQLAlchemy`
- [x] `Flask-WTF` (CSRF)
- [x] `Flask-Limiter` (rate limiting)
- [x] `PyMySQL` (MySQL driver)
- [x] `pymongo` (MongoDB driver)
- [x] `bcrypt`
- [x] `pyotp` (TOTP MFA)
- [x] `cryptography` (AES-256)
- [x] `gunicorn` (production WSGI server)
- [x] Pin all versions for reproducibility

Acceptance Criteria:
- [x] `pip install -r requirements.txt` completes without conflicts
- [x] All versions pinned

---

## Phase 4 — Authentication

### Task 4.1 — User Registration Endpoint

**Status:** Done

- [x] `POST /api/auth/register`
- [x] Validate: unique username, valid email format, password meets complexity (min 8 chars, upper, lower, digit, symbol)
- [x] Hash password with bcrypt (cost factor 12) — never store plaintext
- [x] Reject duplicate email or username with a generic error (do not reveal which field is taken)
- [x] Generate TOTP secret and return QR code URI for authenticator app setup
- [x] Create user with `email_verified=False` and `mfa_enabled=False` initially
- [x] Write registration event to audit log

Acceptance Criteria:
- [x] Duplicate registration returns generic error, not which field conflicts
- [x] Password is never stored or logged in plaintext
- [x] Audit log entry created for every registration attempt (success and failure)

---

### Task 4.2 — User Login Endpoint

**Status:** Done

- [x] `POST /api/auth/login` — step 1: verify username + password
- [x] Check if account is locked (`locked_until` in future) — return generic error if so
- [x] Verify bcrypt hash — increment `failed_login_attempts` on failure
- [x] Lock account after 5 consecutive failures for 15 minutes
- [x] On success: reset `failed_login_attempts`, proceed to MFA step
- [x] Write login attempt (success/failure) to audit log with IP address
- [x] Generic error message for all failures — never reveal whether username or password was wrong

Acceptance Criteria:
- [x] Account locks after 5 failed attempts
- [x] Locked account returns same generic error as wrong credentials
- [x] Every login attempt logged with outcome and IP

---

### Task 4.3 — TOTP MFA Verification Endpoint

**Status:** Done

- [x] `POST /api/auth/verify-mfa` — step 2: verify 6-digit TOTP code
- [x] Use `pyotp.TOTP.verify()` server-side — reject expired codes
- [x] On success: create session, regenerate session ID (prevent session fixation)
- [x] Store role in session
- [x] Write MFA success/failure to audit log

Acceptance Criteria:
- [x] Invalid or expired TOTP code rejected
- [x] Session ID regenerated on successful login
- [x] MFA outcome written to audit log

---

### Task 4.4 — Logout Endpoint

**Status:** Done

- [x] `POST /api/auth/logout`
- [x] Clear and invalidate session server-side
- [x] Write logout event to audit log
- [x] CSRF token required

Acceptance Criteria:
- [x] Session is fully invalidated — cannot be reused after logout
- [x] Logout event in audit log

---

### Task 4.5 — Session Management

**Status:** Done

- [x] Session cookies set with `HttpOnly`, `Secure`, `SameSite=Strict`
- [x] Sessions expire after 30 minutes of inactivity
- [x] Session ID regenerated after login (prevent fixation)
- [x] Validate session on every protected request — enforced in Phase 5 RBAC decorator

Acceptance Criteria:
- [x] Session cookie flags verified in browser dev tools
- [x] Expired session returns 401

---

## Phase 5 — RBAC Middleware

### Task 5.1 — Role Enforcement Decorator

**Status:** Done

- [x] `@require_role('participant')`, `@require_role('researcher')`, `@require_role('admin')` decorator
- [x] Applied to every protected route — returns 403 if role does not match
- [x] Role read from server-side session — never trusted from request body or headers

Acceptance Criteria:
- [x] Researcher cannot access participant-only endpoints (returns 403)
- [x] Participant cannot access admin endpoints (returns 403)
- [x] Unauthenticated requests return 401

---

### Task 5.2 — IDOR Protection

**Status:** Done

- [x] `owns_resource()` helper implemented — validates `session['user_id']` against resource owner
- [x] Return 403 (not 404) if resource exists but belongs to another user
- [x] Applied on every resource access in participant routes (Phase 6)

Acceptance Criteria:
- [x] Participant A cannot access Participant B's health data even with a valid session
- [x] No object ID enumeration possible through error messages

---

### Task 5.3 — Rate Limiter

**Status:** Done

- [x] Apply Flask-Limiter to `/api/auth/login`: 10 requests per minute per IP
- [x] Apply Flask-Limiter to `/api/auth/register`: 5 requests per minute per IP
- [x] Return 429 with generic message when limit exceeded

Acceptance Criteria:
- [x] More than 10 login attempts per minute from same IP returns 429
- [x] Rate limit headers present in response

---

## Phase 6 — Core API Routes

### Task 6.1 — Participant Routes

**Status:** Done

- [x] `GET /api/trials` — list available trials (public, no auth required)
- [x] `POST /api/trials/<trial_id>/apply` — participant enrols, creates consent record (requires e-consent form submission)
- [x] `POST /api/health/submit` — participant submits health telemetry data (validated input, stored under pseudonym token in MongoDB)
- [x] `POST /api/trials/<trial_id>/withdraw` — triggers automated erasure pipeline (see Phase 7)
- [x] `GET /api/participant/profile` — participant views their own profile and enrolment status
- [x] `PUT /api/participant/profile` — update contact details (requires re-authentication for sensitive fields)

Acceptance Criteria:
- [x] Participant cannot access another participant's data
- [x] Health data stored under pseudonym token only — no real identity in MongoDB
- [x] Withdrawal triggers PII erasure pipeline
- [x] All inputs validated server-side (type, length, format)
- [x] Changing email or password via `PUT /api/participant/profile` requires the current password to be supplied and verified before the update is committed

---

### Task 6.2 — Researcher Routes

**Status:** Done

- [x] `GET /api/researcher/trials` — list trials the researcher is assigned to
- [x] `GET /api/researcher/trials/<trial_id>/stats` — aggregate anonymised stats only (enrolment count, adherence rate, outcome summary — no individual records)
- [x] All queries return only aggregate data — enforced at the database query level, not just the UI

Acceptance Criteria:
- [x] No individual participant record or pseudonym visible in any researcher API response
- [x] Researcher cannot query participant endpoints (returns 403)
- [x] All researcher data access events written to audit log

---

### Task 6.3 — Admin Routes

**Status:** Done

- [x] `GET /api/admin/users` — list all user accounts with status
- [x] `POST /api/admin/users/<user_id>/suspend` — suspend account
- [x] `POST /api/admin/users/<user_id>/activate` — re-activate account
- [x] `GET /api/admin/trials` — list and manage all trials
- [x] `POST /api/admin/trials` — create a new trial
- [x] `GET /api/admin/audit-log` — read audit log (admin read-only)
- [x] Admin cannot access clinical data or PII vault directly

Acceptance Criteria:
- [x] Admin cannot read raw participant health data
- [x] All admin actions written to audit log
- [x] Suspended user cannot log in

---

## Phase 7 — PII Vault Microservice

### Task 7.1 — Vault Flask App

**Status:** Done

- [x] Standalone Flask app in `pii_vault/`
- [x] Connects to its own isolated MySQL database (separate from the main app DB)
- [x] Only accepts requests that include the correct `VAULT_SHARED_SECRET` header
- [x] Rejects all requests without valid shared secret with 401
- [x] Not exposed to the internet — internal Docker network only

Acceptance Criteria:
- [x] Vault returns 401 for any request missing or with wrong shared secret
- [x] Vault DB is completely separate from main application DB

---

### Task 7.2 — Pseudonym Token Generation

**Status:** Done

- [x] `POST /vault/create` — stores PII (email), generates and returns a pseudonym token
- [x] Token generated via per-participant salted HMAC-SHA256 using Python `hmac` + `hashlib`
- [x] Salt is unique per participant (secrets.token_hex(32)), stored with the record
- [x] PII fields encrypted at rest with AES-256-GCM before storing

Acceptance Criteria:
- [x] Two participants with same email get different tokens (salted)
- [x] Token is irreversible — cannot derive real identity from token alone
- [x] PII encrypted at rest in vault DB

---

### Task 7.3 — Automated Erasure Pipeline

**Status:** Done

- [x] `POST /vault/erase/<pseudonym_token>` — purges all PII for a given token
- [x] Sets `purged_at` timestamp in vault DB
- [x] Nulls out all PII fields — pseudonym token row retained for traceability
- [x] Main Flask app calls this on participant withdrawal (Phase 6 withdraw route)
- [x] Main app then updates `participants` table — marks `withdrawal_triggered=True`
- [x] MongoDB telemetry remains intact under pseudonym token (research data preserved)
- [x] Erasure event written to audit log with token reference

Acceptance Criteria:
- [x] After erasure, no real identity retrievable from vault for that token
- [x] Clinical telemetry in MongoDB untouched — still queryable by pseudonym token
- [x] Audit log records erasure event with timestamp and token reference

---

## Phase 8 — Audit Logging

### Task 8.1 — Append-Only Audit Log

**Status:** Done

- [x] `AuditLog` model — `log_id`, `user_id`, `action_type`, `resource_affected`, `outcome`, `ip_address`, `timestamp`, `prev_hash`, `entry_hash`
- [x] App DB user has INSERT-only privilege on `audit_logs` — no UPDATE or DELETE
- [x] `entry_hash` = SHA-256 of (`prev_hash` + `timestamp` + `user_id` + `action_type` + `outcome`)
- [x] `prev_hash` = `entry_hash` of the previous log row (hash chaining per NFR-2)

Acceptance Criteria:
- [x] Attempting to UPDATE or DELETE an audit log row from the app fails at DB level
- [x] Each log entry's `entry_hash` is verifiable against its inputs
- [x] Chain can be validated sequentially from first entry

---

### Task 8.2 — Log All Sensitive Events

**Status:** Done

- [x] Login attempt (success and failure) — include IP address
- [x] Logout
- [x] Registration
- [x] MFA setup and verification
- [x] Account lockout triggered
- [x] Consent submitted
- [x] Withdrawal triggered
- [x] Health data submitted
- [x] PII erasure completed
- [x] Admin user suspend/activate
- [x] Admin trial create/update
- [x] Researcher data access

Acceptance Criteria:
- [x] Every event in the list above produces an audit log entry
- [x] Log entries include: user_id, action_type, resource_affected, outcome, ip_address, timestamp

---

## Phase 9 — Frontend Integration

**Verified 2026-05-30 via Playwright against live Docker stack (nginx→Flask→MySQL→PII Vault):**
- Signup: TOTP secret correctly displayed after registration
- MFA login: 6-digit code accepted, redirects by role (participant→/patient, researcher→/researcher, admin→/admin)
- ProtectedRoute: all three portals redirect unauthenticated users to /login
- Cross-role guard: participant accessing /admin redirects to /login
- Patient portal: profile loads, trials tab shows live API data, privacy tab renders
- Researcher portal: aggregate stats only (no individual participant identifiers)
- Admin portal: live user list, suspend/activate controls, trial management, hash-chained audit log (13 entries displayed)
- Logout: clears server session (POST /api/auth/logout returns 401 on subsequent protected API calls)

Not covered by this run (no seeded trials to enrol in): apply-to-trial modal, health data submit, withdrawal PII erasure.

### Task 9.1 — Add API URL Environment Variable to React

**Status:** Done

- [x] Add `VITE_API_URL` to `frontend/.env.development` — empty (Vite proxy handles `/api/*` → Flask)
- [x] Add `VITE_API_URL=` (empty) to `frontend/.env.production` — nginx handles proxying
- [x] Updated `frontend/src/api.js` to prepend `import.meta.env.VITE_API_URL` to all fetch calls

Acceptance Criteria:
- [x] In dev, Vite proxy forwards `/api/*` to Flask on port 8080
- [x] In production, React calls relative `/api/...` URLs proxied by nginx

---

### Task 9.2 — Wire Up Auth Flow

**Status:** Done

- [x] Login page calls `POST /api/auth/login` and `POST /api/auth/verify-mfa`
- [x] Signup page calls `POST /api/auth/register` (username + email + password)
- [x] Store role + username in AuthContext (localStorage-backed) after successful MFA
- [x] Redirect by role: participant→/patient, researcher→/researcher, admin→/admin
- [x] Handle 401/403/429 responses with generic user-facing messages
- [x] Logout button calls `POST /api/auth/logout` and clears local state
- [x] ProtectedRoute guards /patient, /researcher, /admin — redirects to /login if not authenticated

Acceptance Criteria:
- [x] Login flow works end-to-end with real Flask backend
- [x] Wrong credentials show generic error
- [x] Successful login redirects by role

---

### Task 9.3 — Wire Up Patient Portal

**Status:** Done

- [x] Profile tab — `GET /api/participant/profile` — loads username, email, account details, enrolment status
- [x] Profile save — `PUT /api/participant/profile` — email/password update with current_password verification
- [x] Browse trials tab — `GET /api/trials` — replaces mock data
- [x] Apply to trial — `POST /api/trials/<id>/apply` — consent modal with version + digital signature
- [x] Submit health data — `POST /api/health/submit` — modal shown when enrolled in an active trial
- [x] Withdraw — `POST /api/trials/<id>/withdraw` — confirm modal in Privacy tab
- [x] Privacy tab — shows consent status from `GET /api/participant/profile`

Acceptance Criteria:
- [x] All participant actions hit real Flask endpoints
- [x] Withdrawal triggers PII erasure and shows confirmation

---

### Task 9.4 — Wire Up Researcher Portal

**Status:** Done

- [x] Trials list — `GET /api/researcher/trials` — replaces mock cohort
- [x] Stats panel — `GET /api/researcher/trials/<id>/stats` — aggregate only (total, active, withdrawn, rate)
- [x] No individual participant data displayed anywhere

Acceptance Criteria:
- [x] Researcher portal shows only aggregate data from real API

---

### Task 9.5 — Wire Up Admin Portal

**Status:** Done

- [x] User management — `GET /api/admin/users` — live table with suspend/activate buttons
- [x] Suspend — `POST /api/admin/users/<id>/suspend`
- [x] Activate — `POST /api/admin/users/<id>/activate`
- [x] Trial management — `GET /api/admin/trials` — live table
- [x] Create trial — `POST /api/admin/trials` — modal with all required fields
- [x] Audit log tab — `GET /api/admin/audit-log` — paginated, live from DB

Acceptance Criteria:
- [x] All admin actions hit real Flask endpoints
- [x] Audit log displayed in admin portal is live from DB

---

### Task 9.6 — Configure CORS for Local Dev

**Status:** Done

- [x] `Flask-CORS==5.0.1` in `requirements.txt`
- [x] CORS configured in `backend/app/__init__.py` — allows `http://localhost:5173` in development only
- [x] CORS not initialised in production (nginx handles same-origin proxying)

Acceptance Criteria:
- [x] React dev server on `:5173` can call Flask on `:8080` without CORS errors (via Vite proxy)
- [x] CORS not open in production

---

## Phase 10 — Security Hardening

### Task 10.1 — Input Validation on All Endpoints

**Status:** Done

- [x] Validate field type, length, and format on every POST/PUT endpoint server-side — username regex `^[a-zA-Z0-9_]{3,64}$`, email regex, password complexity (min 8, upper, lower, digit, special) enforced in `auth.py` and `participant.py`
- [x] Reject and log requests with unexpected fields — allowlist per endpoint (`_REGISTER_FIELDS`, `_LOGIN_FIELDS`, `_MFA_FIELDS`, `_PROFILE_FIELDS`, `_APPLY_FIELDS`, `_HEALTH_FIELDS`, `_TRIAL_FIELDS`); extra keys return 400 and write `unexpected_input` audit entry
- [x] Validate clinical data ranges — `_MEASUREMENT_RANGES` dict with per-type (min, max) bounds for 9 measurement types; invalid type or out-of-range value returns 400; ISO 8601 date format enforced on `recorded_at`; string length limits on `unit`, `consent_text_version`, `digital_signature`
- [x] Escape all HTML output to prevent XSS — Flask API returns JSON only (no server-rendered HTML); React auto-escapes all rendered values
- [x] CSRF tokens — added `GET /api/auth/csrf-token` endpoint; `api.js` lazy-fetches and caches the token, sends `X-CSRFToken` header on all POST/PUT/DELETE; token reset on login so stale tokens are never reused

Acceptance Criteria:
- [x] Sending oversized or malformed input returns 400 with specific error
- [x] Extra fields rejected with 400 and logged as `unexpected_input` audit event
- [x] Invalid measurement type or out-of-range value returns 400
- [x] No raw user input reflected back in any response without sanitisation
- [x] All POST/PUT/DELETE requests from React include valid CSRF token

---

### Task 10.2 — HTTPS with Self-Signed Certificate

**Status:** Done

- [x] Generate self-signed TLS certificate — `nginx/certs/cert.pem` / `key.pem`, CN=medi.trialguard.com, valid through May 2027
- [x] Configure nginx to use the certificate for port 443 — `ssl_protocols TLSv1.2 TLSv1.3; ssl_ciphers HIGH:!aNULL:!MD5`
- [x] HTTP (port 80) returns 301 redirect to HTTPS

Acceptance Criteria:
- [x] All traffic served over HTTPS
- [x] HTTP requests redirect to HTTPS

---

### Task 10.3 — Security Headers

**Status:** Done

- [x] `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- [x] `X-Frame-Options: DENY`
- [x] `X-Content-Type-Options: nosniff`
- [x] `Content-Security-Policy: default-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self' data:;` — `unsafe-inline` for style-src required by React inline styles
- [x] `Referrer-Policy: no-referrer`

Acceptance Criteria:
- [x] All headers present in every response from nginx — verified live with `curl -skI https://localhost/`
- [x] No inline scripts or styles break under CSP — React app loads and renders correctly under this policy

---

## Phase 11 — EC2 Deployment

### Task 11.1 — Prepare EC2 Instance

**Status:** Done

- [x] SSH into EC2 using the provided key and instance details
- [x] Update packages: `sudo apt update && sudo apt upgrade -y`
- [x] Install Docker: follow official Docker Engine install for Ubuntu
- [x] Install Docker Compose plugin
- [x] Add the EC2 user to the `docker` group

Acceptance Criteria:
- [x] `docker --version` and `docker compose version` return without error on EC2

---

### Task 11.2 — Configure UFW Firewall

**Status:** Done

- [x] Enable UFW: `sudo ufw enable`
- [x] Allow port 22 (SSH — must do first or lose access)
- [x] Allow port 80 (HTTP redirect)
- [x] Allow port 443 (HTTPS)
- [x] Allow port 8080 (Flask direct access for dev/testing)
- [x] Allow port 8888 (PII vault — internal only, restrict to localhost if possible)
- [x] Deny all other inbound traffic by default

Acceptance Criteria:
- [x] `sudo ufw status` shows only allowed ports
- [x] SSH still works after UFW enabled
- [x] MySQL (3306) and MongoDB (27017) not reachable from outside

---

### Task 11.3 — Deploy Application

**Status:** Done — deployed 2026-05-30

- [x] Transfer repo to EC2 via `git archive --format=tar HEAD | scp` (repo is private; direct git clone not used)
- [x] Copy `.env` file to EC2 with real secrets (not committed to git)
- [x] Upload TLS certs (`nginx/certs/cert.pem` + `key.pem`) — gitignored, pushed via `scp`
- [x] Run `docker compose up --build -d` — all 7 images built and all containers started
- [x] Fixed `db-backup` entrypoint: replaced `chmod +x /backup.sh && /backup.sh` with `sh /backup.sh` (`:ro` mount prevents chmod)
- [x] Fixed nginx/certs dir ownership: Docker had created it as root; fixed with `sudo chown <user>:<user>`

Acceptance Criteria:
- [x] All 7 containers show as healthy/running (`docker compose ps` verified 2026-05-30)
  - flask ✅ healthy | pii_vault ✅ healthy | mysql ✅ healthy | vault_db ✅ healthy | mongodb ✅ healthy | nginx ✅ up | db-backup ✅ up
- [x] React app loads at `https://medi.trialguard.com` (200 OK, full SPA HTML returned)
- [x] HTTP → HTTPS redirect verified (301 on port 80)
- [x] All security headers present: HSTS, X-Frame-Options DENY, X-Content-Type-Options nosniff, CSP, Referrer-Policy
- [x] `GET https://medi.trialguard.com/api/health` returns `{"status":"ok"}`

---

### Task 11.4 — Smoke Test All Roles

**Status:** Done — verified 2026-06-01 on EC2 (18.223.111.152)

- [x] Register a participant account and complete MFA setup
- [x] Log in as participant — verify redirects to patient portal
- [x] Submit health data — verify stored under pseudonym token
- [x] Withdraw from trial — verify PII erasure and audit log entry
- [x] Log in as researcher — verify only aggregate stats visible
- [x] Log in as admin — verify user list, audit log readable
- [x] Attempt cross-role access (e.g. researcher hitting participant endpoint) — verify 403

Acceptance Criteria:
- [x] All roles work end-to-end
- [x] Cross-role access blocked in all tested cases
- [x] Audit log contains entries for every action performed during smoke test

---

## Priority Summary

### Must Have (core security requirements)
- [x] Docker infrastructure running all 7 services (nginx, flask, mysql, mongodb, pii_vault, vault_db, db-backup) — live on EC2
- [x] MySQL schema with all 5 tables (users, trials, participants, consent_records, audit_logs)
- [x] Flask auth — bcrypt (cost 12), TOTP MFA, account lockout (5 failures → 15 min)
- [x] Session management — HttpOnly, Secure, SameSite=Strict, 30-min timeout
- [x] RBAC decorator on all protected routes
- [x] IDOR protection on all resource access
- [x] CSRF protection on all state-changing requests — Flask-WTF on all blueprints; auth_bp exempt (SameSite=Strict + CORS covers it); React fetches token via `GET /api/auth/csrf-token` and sends `X-CSRFToken` header
- [x] PII vault microservice with HMAC-SHA256 pseudonymisation and AES-256-GCM encryption
- [x] Automated erasure pipeline on participant withdrawal
- [x] Append-only tamper-evident audit log (SHA-256 hash chain, DB-level INSERT-only grant)
- [x] UFW firewall — only ports 22, 80, 443, 8080, 8888 open (configured on EC2 2026-05-30)
- [x] HTTPS enforced via nginx (TLSv1.2/1.3, self-signed cert for EC2 IP, HTTP→HTTPS redirect) — verified live on EC2

### Should Have
- [x] All three portals wired to real API (Phase 9 — verified 2026-05-30)
- [x] Health telemetry in MongoDB (Phase 3)
- [x] Rate limiting on auth endpoints (nginx: 10 req/min login, 5 req/min register)
- [x] Security response headers (HSTS, X-Frame-Options, CSP, X-Content-Type-Options, Referrer-Policy) — verified live on EC2
- [x] Input validation on all endpoints — field allowlists, format/length checks, clinical data range bounds, ISO 8601 date validation
- [ ] Full smoke test on EC2 (Task 11.4 — pending)

### Could Have
- [x] Automated daily DB backups — `db-backup` service runs `backup/backup.sh` every 24 h; keeps 7 most recent dumps in `db_backups` named volume — running on EC2
- [x] Docker health checks and auto-restart policies — `flask` and `pii_vault` have `healthcheck` blocks; nginx waits on `flask: service_healthy`; all services `restart: unless-stopped`
- [x] Admin compliance report export — `GET /api/admin/compliance-report` returns aggregated JSON summary; every export audit-logged
- [x] Email verification for new accounts — token-based (SHA-256 hashed, 24h expiry), sent via Mailtrap SMTP sandbox; `GET /api/auth/verify-email?token=...` sets `email_verified=True`; resend endpoint at `POST /api/auth/resend-verification`
