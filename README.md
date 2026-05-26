# TrialGuard

A secure clinical trial participant portal built for ICT2216 Secure Software Development. TrialGuard implements privacy-by-design principles — participants enrol under a pseudonymous ID, researchers never see real identities, and all sensitive actions are logged in a tamper-evident audit trail.

## Architecture

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite 6 |
| Backend | Python Flask 3 (Gunicorn) |
| App database | MySQL 8.0 (structured data, sessions, audit log) |
| Health telemetry | MongoDB 7.0 (time-series health data, pseudonym-keyed) |
| PII vault | Isolated Flask microservice + separate MySQL DB |
| Reverse proxy | nginx 1.27 (HTTPS termination, rate limiting, security headers) |
| Containerisation | Docker + Docker Compose |

All services run in an internal Docker network. Only nginx is exposed to the internet (ports 80 and 443). MySQL, MongoDB, and the PII vault are never reachable from outside the container network.

## Security controls

| Control | Implementation |
|---------|---------------|
| Pseudonymisation | Per-participant salted HMAC-SHA256 token; real identity stored only in isolated PII vault |
| Authentication | bcrypt (cost 12) passwords + TOTP MFA (pyotp) |
| Account lockout | 5 failed attempts → 15-minute lockout |
| Session security | HttpOnly, Secure, SameSite=Strict cookies; 30-min inactivity timeout; session ID regenerated on login |
| RBAC | Server-side role enforcement on every endpoint; three roles: participant, researcher, admin |
| IDOR protection | Every resource access validated against session user_id |
| CSRF protection | Flask-WTF on all state-changing requests |
| Rate limiting | 10 req/min on login, 5 req/min on register (nginx + Flask-Limiter) |
| Audit log | Append-only, tamper-evident hash chain (SHA-256 prev_hash chaining); INSERT-only DB privilege |
| PII erasure | Automated erasure pipeline on participant withdrawal; vault nulls all PII fields |
| HTTPS | Self-signed TLS on nginx; HTTP → HTTPS redirect enforced |
| Security headers | HSTS, X-Frame-Options DENY, X-Content-Type-Options nosniff, CSP default-src 'self', Referrer-Policy no-referrer |

## Quick start (Docker)

**Prerequisites:** Docker Desktop (or Docker Engine + Compose plugin).

```bash
# 1. Clone the repo
git clone <repo-url>
cd ICT2216-Secure-Software-Development

# 2. Create your .env from the template
cp .env.template .env
# Edit .env — fill in all secrets (see .env.template for required vars)

# 3. Generate a self-signed TLS cert for nginx
mkdir -p nginx/certs
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/certs/key.pem \
  -out nginx/certs/cert.pem \
  -subj "/CN=localhost"

# 4. Start all services
docker compose up --build
```

The app will be available at `https://localhost` (accept the self-signed cert warning).

### Other commands

```bash
docker compose down         # stop all services
docker compose down -v      # stop and wipe all DB volumes
docker compose logs -f      # stream logs from all containers
```

## Frontend dev (without Docker)

```bash
cd frontend
npm install
npm run dev     # starts Vite dev server at http://localhost:5173
```

Set `VITE_API_URL=http://localhost:8080` in `frontend/.env.development` to point at a locally running Flask instance.

## Backend dev (without Docker)

```bash
cd ICT2216-Secure-Software-Development

# Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate

# Install all Python dependencies (backend + pii_vault)
pip install -r requirements.txt
```

Set the required environment variables from `.env.template` before running Flask directly.

## Project structure

```
docker-compose.yml          ← All 6 services
.env.template               ← Required environment variables (copy to .env)
requirements.txt            ← Python dependencies (backend + pii_vault)
tasks.md                    ← Implementation checklist

frontend/                   ← React 18 + Vite 6
  src/
    pages/                  ← Landing, Login, Signup, PatientPortal, ResearcherPortal, AdminPortal
    components/             ← Shared UI, portal shell
    data/                   ← Static seed data for UI prototype
    styles/                 ← CSS custom properties

backend/                    ← Flask app
  app/
    __init__.py             ← App factory (create_app)
    extensions.py           ← SQLAlchemy, PyMongo, CSRF, Limiter, CORS
    models/models.py        ← User, Trial, Participant, ConsentRecord, AuditLog
    routes/
      auth.py               ← /api/auth — register, login, MFA, logout
      participant.py        ← /api — participant endpoints
      researcher.py         ← /api/researcher — aggregate stats only
      admin.py              ← /api/admin — user/trial management, audit log
  db/init.sql               ← MySQL schema (runs on first container start)
  config.py                 ← Dev/prod config from environment variables

pii_vault/                  ← Isolated PII microservice
  app.py                    ← Vault Flask app (shared-secret auth)
  db/init.sql               ← Vault MySQL schema

nginx/
  nginx.conf                ← Reverse proxy, TLS, rate limiting, security headers
  Dockerfile
```

## Roles

| Role | Portal | Access |
|------|--------|--------|
| Participant | `/patient` | Own profile, enrolled trials, health data submission, withdrawal |
| Researcher | `/researcher` | Aggregate trial stats only — no individual records |
| Admin | `/admin` | User management, trial management, audit log (read-only on clinical data) |

## Deployment

The app is deployed on a school-provided EC2 instance. See Phase 11 in `tasks.md` for the full deployment checklist.
