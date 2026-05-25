# TrialGuard

A secure clinical trial participant portal built as a front-end prototype for ICT2216 Secure Software Development. TrialGuard demonstrates privacy-by-design principles by letting patients participate in medical research under a pseudonymous ID — researchers never see their real identity.

## What it demonstrates

- **Pseudonymous identity** — patients receive a generated ID (e.g. `PT-4F8A-2K`) at signup; researchers only ever see this token
- **Granular consent** — participants approve each data point shared, per study
- **Role separation** — three distinct portals (Patient / Researcher / Admin) with different access scopes
- **Secure auth flow** — unified login with 2FA step, pseudonym vs email detection, and hardware key / SSO stubs
- **Audit logging** — every admin action is recorded in the audit trail

> This is a front-end prototype. All data is in-memory (no backend). Authentication flows are simulated.

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Build tool | [Vite](https://vitejs.dev) v6 |
| UI library | React 18 |
| Routing | React Router v6 |
| Styling | CSS custom properties (no CSS framework) |
| Language | JavaScript (JSX) |

---

## Installation

**Prerequisites:** Node.js 18 or later.

```bash
# 1. Clone the repo
git clone <repo-url>
cd ICT2216-Secure-Software-Development

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Other commands

```bash
npm run build     # Production build → dist/
npm run preview   # Preview the production build locally
```

---

## Navigating the prototype

All portals are accessible directly from the login screen — no real credentials are required.

| URL | Description |
|-----|-------------|
| `/` | Public landing page — trial listings, eligibility quiz, FAQ |
| `/signup` | 3-step patient signup — email → passphrase → pseudonym reveal |
| `/login` | Unified login for all roles (patient pseudonym or staff email) |
| `/patient` | Patient dashboard — enrolled trials, documents, privacy controls |
| `/researcher` | Researcher console — cohort management, scheduling, reports |
| `/admin` | Admin console — trial oversight, user management, audit log |

### Quick access

From the login screen (`/login`):
1. Enter any email (e.g. `admin@example.com`) and any password
2. Enter any 6-digit code at the 2FA step (e.g. `123456`)
3. Select **Admin console** or **Researcher console**

For the patient portal, enter a pseudonym ID in the format `PT-XXXX-XX` (e.g. `PT-4F8A-2K`) and any password, then any 6-digit 2FA code — it routes directly to `/patient`.

---

## Project structure

```
index.html                  ← Vite entry point
vite.config.js
package.json
.gitignore
src/
  main.jsx                  ← ReactDOM entry + BrowserRouter
  App.jsx                   ← Route definitions
  styles/
    global.css              ← Design tokens + reset + landing styles
    portal.css              ← Portal UI component styles
  data/
    landing.js              ← Public page data (trials, FAQ, stats, quotes)
    portal.js               ← Portal data (cohort, reports, users, audit log)
  components/
    shared.jsx              ← Shared UI (TgLogo, Icon, TrialCard, EligibilityQuiz…)
    portal-shell.jsx        ← Portal chrome (Topbar, Sidebar, PortalModal…)
  pages/
    Landing.jsx             ← Public marketing + trial discovery page
    Login.jsx               ← Unified login (creds → 2FA → role picker)
    Signup.jsx              ← 3-step patient registration wizard
    PatientPortal.jsx       ← Patient dashboard (trials, documents, privacy)
    AdminPortal.jsx         ← Admin console (trials, users, companies, audit)
    ResearcherPortal.jsx    ← Researcher console (cohort, schedule, reports)
.claude/
  project-log.md            ← Development session log
```

---

## Portals at a glance

### Patient portal (`/patient`)
- Overview of enrolled trial with visit schedule and adherence tracking
- Document vault — consent forms, results, lab reports
- Privacy controls — per-study data sharing toggles and withdrawal

### Researcher portal (`/researcher`)
- Cohort view — master-detail list of up to 5 participants with adherence bars and flags
- Schedule — weekly calendar of upcoming visits and check-ins
- Reports — upload and manage participant documents (PDF, DCM, CSV, DOCX)

### Admin portal (`/admin`)
- Trial overview — all active studies with enrollment progress
- User management — patient and researcher accounts
- Company registry — verified sponsor organisations
- Audit log — timestamped record of every action

---

## Security concepts illustrated

| Concept | Where |
|---------|-------|
| Pseudonymisation | Signup flow; patient ID shown to researchers only as `PT-XXXX-XX` |
| Principle of least privilege | Separate `/patient`, `/researcher`, `/admin` routes with scoped data |
| Granular consent | Patient portal privacy tab — per-study data toggles |
| Audit trail | Admin portal audit log tab |
| Defence in depth | 2FA step in login flow; passphrase-derived vault described in signup |
| Fail securely | Auth errors show generic messages, not specific failure reasons |
