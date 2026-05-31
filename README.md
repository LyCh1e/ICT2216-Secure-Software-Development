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

**Prerequisites:** Docker Desktop (or Docker Engine + Compose plugin) and Python 3.

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

# 4. Start everything and open the browser
python start.py
```

`start.py` runs `docker compose up -d --build`, waits for the stack to become reachable, then opens `https://localhost` in your browser automatically. Accept the self-signed cert warning on first visit.

### Manual commands

```bash
docker compose up --build   # start in foreground (logs streamed to terminal)
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
start.py                    ← One-command launcher (builds, starts, opens browser)
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

The app is deployed on a school-provided EC2 instance.

**Live URL:** https://18.223.111.152/ — self-signed cert, accept the browser warning on first visit.

### Pushing a new local build to EC2

The EC2 instance does not have direct GitHub access, so updates are pushed manually via `git archive` + `scp`.

**Prerequisites:** SSH key and EC2 connection details provided separately by the course coordinator. On Windows, fix key permissions once:
```powershell
icacls <path\to\key.pem> /inheritance:r /grant:r "%USERNAME%:F"
```

```powershell
# 1. Set variables (Windows PowerShell — fill in your own values)
$PEM  = "<path\to\key.pem>"
$HOST = "<user>@<ec2-ip>"

# 2. Create a tarball of the latest commit and upload it
git archive --format=tar HEAD -o "$env:TEMP\trialguard.tar"
scp -i $PEM "$env:TEMP\trialguard.tar" "${HOST}:~/trialguard.tar"

# 3. Extract on EC2 (overwrites tracked files; .env and certs are preserved separately)
ssh -i $PEM $HOST "cd ~/ICT2216-Secure-Software-Development && tar xf ~/trialguard.tar && echo done"

# 4. If docker-compose.yml or nginx config changed, push it directly too:
scp -i $PEM docker-compose.yml "${HOST}:~/ICT2216-Secure-Software-Development/docker-compose.yml"

# 5. Force-rebuild frontend (no cache), force-remove stale containers, purge volume, restart, this is if the frontend changes do not appear
ssh -i $PEM $HOST @"
cd ~/ICT2216-Secure-Software-Development
docker compose build --no-cache frontend-build
docker compose stop nginx frontend-build
docker ps -a --filter volume=ict2216-secure-software-development_frontend_dist --format '{{.ID}}' | xargs -r docker rm -f
docker volume rm ict2216-secure-software-development_frontend_dist 2>/dev/null || true
docker compose up -d
"@

# Note: Use .\deploy.ps1 to run all steps automatically (reads EC2-Access\ for credentials)
```

**Certs are not in git** — push them once on a fresh instance:
```powershell
# Fix ownership if Docker created the dir as root on first start
ssh -i $PEM $HOST "sudo chown <user>:<user> ~/ICT2216-Secure-Software-Development/nginx/certs"
scp -i $PEM nginx\certs\cert.pem "${HOST}:~/ICT2216-Secure-Software-Development/nginx/certs/cert.pem"
scp -i $PEM nginx\certs\key.pem  "${HOST}:~/ICT2216-Secure-Software-Development/nginx/certs/key.pem"
```

**`.env` is not in git** — push it once and it persists on EC2:
```powershell
scp -i $PEM .env "${HOST}:~/ICT2216-Secure-Software-Development/.env"
```

See Phase 11 in `tasks.md` for the full deployment checklist.
