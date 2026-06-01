# tasks2.0.md — TrialGuard Security Hardening Checklist

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

## Phase 12 — Production Hardening

### Task 12.1 — Set FLASK_ENV to Production

**Status:** Not Started

- [ ] Change `FLASK_ENV=development` to `FLASK_ENV=production` in `.env` on EC2
- [ ] Restart Flask container to apply change
- [ ] Verify debug mode is off — Flask error responses should not include stack traces
- [ ] Verify `SESSION_COOKIE_SECURE=True` is active (only enforced in ProductionConfig)

Acceptance Criteria:
- [ ] `FLASK_ENV=production` confirmed in container env (`docker exec trialguard-flask-1 env | grep FLASK_ENV`)
- [ ] Triggering a 500 error returns `{"error": "Internal server error"}` with no stack trace

---

### Task 12.2 — nginx Request Hardening

**Status:** Not Started

- [ ] Add `client_max_body_size 1m` — reject oversized request bodies
- [ ] Add `client_body_timeout 10s` and `client_header_timeout 10s` — drop slow clients
- [ ] Add `keepalive_timeout 15s` — limit persistent connection window
- [ ] Add `send_timeout 10s` — drop stalled responses
- [ ] Restrict allowed HTTP methods — return 405 on anything other than GET, POST, PUT, DELETE
- [ ] Add `Permissions-Policy` header — disable unused browser features (camera, microphone, geolocation)

Acceptance Criteria:
- [ ] Sending a request body larger than 1 MB returns 413
- [ ] Security headers verified with `curl -skI https://18.223.111.152/`
- [ ] `Permissions-Policy` header present in response
- [ ] PATCH, OPTIONS, TRACE requests return 405

---

### Task 12.3 — Flask-Limiter Persistent Storage (Redis)

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

### Task 12.4 — Fail2ban on EC2

**Status:** Not Started

- [ ] Install Fail2ban: `sudo apt install fail2ban -y`
- [ ] Create `/etc/fail2ban/jail.local` — enable SSH jail, ban after 5 failures for 1 hour
- [ ] Enable and start Fail2ban service
- [ ] Verify SSH jail is active: `sudo fail2ban-client status sshd`

Acceptance Criteria:
- [ ] `sudo fail2ban-client status sshd` shows jail is active
- [ ] Fail2ban service is enabled on boot (`sudo systemctl is-enabled fail2ban`)

---

### Task 12.5 — Automatic Security Updates on EC2

**Status:** Not Started

- [ ] Install unattended-upgrades: `sudo apt install unattended-upgrades -y`
- [ ] Enable automatic security updates: `sudo dpkg-reconfigure --priority=low unattended-upgrades`
- [ ] Verify configuration is active: `cat /etc/apt/apt.conf.d/20auto-upgrades`

Acceptance Criteria:
- [ ] `APT::Periodic::Unattended-Upgrade "1"` present in auto-upgrades config
- [ ] Security patches applied automatically without manual intervention

---

## Priority Summary

### Must Do
- [ ] Task 12.1 — FLASK_ENV production (debug mode is a critical gap on live server)
- [ ] Task 12.2 — nginx hardening (timeouts, size limits, Permissions-Policy)

### Should Do
- [ ] Task 12.3 — Redis-backed rate limiting (rate limits currently reset on restart)
- [ ] Task 12.4 — Fail2ban (SSH brute force protection)

### Nice to Have
- [ ] Task 12.5 — Automatic security updates (reduces manual patching burden)
