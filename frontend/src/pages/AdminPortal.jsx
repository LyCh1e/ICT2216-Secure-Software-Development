import { useState, useEffect } from 'react'
import { Icon } from '../components/shared'
import { PortalTopbar, PortalSide, PortalHead, PortalModal, PortalConfirm } from '../components/portal-shell'
import { PORTAL_TRIALS, PORTAL_COMPANIES, PORTAL_USERS, PORTAL_AUDIT } from '../data/portal'

export default function AdminPortal() {
  const [tab, setTab] = useState('overview')
  const [trials, setTrials] = useState(PORTAL_TRIALS)
  const [users, setUsers] = useState(PORTAL_USERS)
  const [companies, setCompanies] = useState(PORTAL_COMPANIES)

  const NAV = [
    { id: 'overview', label: 'Overview', icon: 'chart' },
    { id: 'trials', label: 'Trials', icon: 'pill', count: trials.length },
    { id: 'users', label: 'Users', icon: 'users', count: users.length },
    { id: 'companies', label: 'Companies', icon: 'bldg', count: companies.length },
    { id: 'audit', label: 'Audit log', icon: 'activity' },
  ]

  return (
    <div className="pa-root">
      <PortalTopbar role="admin" who="admin@trialguard"/>
      <div className="pa-main">
        <PortalSide
          items={NAV}
          value={tab}
          onChange={setTab}
          footer={(
            <div style={{ padding: 14, background: 'var(--ink)', color: 'var(--cream)', borderRadius: 10 }}>
              <div className="pa-mono" style={{ fontSize: 10, letterSpacing: '0.1em', color: 'var(--cream-3)' }}>OPS · L2</div>
              <div style={{ fontSize: 12, marginTop: 4, color: 'var(--cream-3)', lineHeight: 1.45 }}>
                You have full read/write on platform records. Every action is logged.
              </div>
            </div>
          )}
        />
        <div className="pa-content">
          {tab === 'overview' && <AdminOverview trials={trials} users={users} companies={companies} go={setTab}/>}
          {tab === 'trials' && <AdminTrials trials={trials} setTrials={setTrials}/>}
          {tab === 'users' && <AdminUsers users={users} setUsers={setUsers} companies={companies}/>}
          {tab === 'companies' && <AdminCompanies companies={companies} setCompanies={setCompanies} users={users} setUsers={setUsers}/>}
          {tab === 'audit' && <AdminAudit/>}
        </div>
      </div>
    </div>
  )
}

function AdminOverview({ trials, users, companies, go }) {
  const active = trials.filter(t => t.status === 'Recruiting').length
  const patients = users.filter(u => u.role === 'Patient').length
  const researchers = users.filter(u => u.role.startsWith('Researcher')).length
  return (
    <>
      <PortalHead title="Platform overview" sub="Live counts across users, trials, and verified sponsors. Drill into any tile."/>
      <div className="pa-content-body">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 18 }}>
          {[
            { k: active, l: 'Active trials', d: '+3 this week', cls: 'up', go: 'trials' },
            { k: patients, l: 'Patients', d: '+12 today', cls: 'up', go: 'users' },
            { k: researchers, l: 'Researchers', d: 'no change', cls: '', go: 'users' },
            { k: companies.length, l: 'Verified sponsors', d: '1 pending', cls: 'down', go: 'companies' },
          ].map((s, i) => (
            <div key={i} className="pa-stat" style={{ cursor: 'pointer' }} onClick={() => go(s.go)}>
              <div className="pa-stat-k">{s.k}</div>
              <div className="pa-stat-l">{s.l}</div>
              <div className={'pa-stat-delta ' + s.cls}>{s.d}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18 }}>
          <div className="pa-card">
            <div className="pa-card-head">
              <div>
                <div className="pa-card-title">Trials currently recruiting</div>
                <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>Click any row to inspect, pause, or remove.</div>
              </div>
              <button className="pa-btn pa-btn-link" onClick={() => go('trials')}>See all <Icon name="arrow" size={12}/></button>
            </div>
            <table className="pa-table">
              <thead><tr><th>ID</th><th>Study</th><th>Sponsor</th><th>Risk</th><th>Enrolled</th></tr></thead>
              <tbody>
                {trials.slice(0, 5).map(t => (
                  <tr key={t.id}>
                    <td className="pa-mono">{t.id}</td>
                    <td>{t.plain}</td>
                    <td>{t.sponsor}</td>
                    <td><span className="pa-risk" data-level={t.risk.toLowerCase()}>{t.risk}</span></td>
                    <td>{t.enrolled} / {t.enrolled + t.spots}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pa-card">
            <div className="pa-card-head">
              <div>
                <div className="pa-card-title">Recent activity</div>
                <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>Last 5 admin actions, today.</div>
              </div>
              <button className="pa-btn pa-btn-link" onClick={() => go('audit')}>Full log</button>
            </div>
            <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 0 }}>
              {PORTAL_AUDIT.map((a, i) => (
                <li key={i} style={{ display: 'grid', gridTemplateColumns: '54px 1fr', gap: 10, padding: '10px 0', borderTop: i === 0 ? 'none' : '1px solid var(--line)' }}>
                  <span className="pa-mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{a.t}</span>
                  <div>
                    <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>{a.what}</div>
                    <div className="pa-mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 2 }}>{a.who} · {a.tag.toUpperCase()}</div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </>
  )
}

function AdminTrials({ trials, setTrials }) {
  const [filter, setFilter] = useState('all')
  const [toRemove, setToRemove] = useState(null)

  const filtered = trials.filter(t => filter === 'all' || (filter === 'paid' ? t.paid : !t.paid))

  return (
    <>
      <PortalHead
        title="Trials"
        sub="All studies currently on TrialGuard. Pause, remove, or open audit history per trial."
        right={(
          <div className="pa-tabs">
            <button className="pa-tab" data-active={filter === 'all'} onClick={() => setFilter('all')}>All</button>
            <button className="pa-tab" data-active={filter === 'paid'} onClick={() => setFilter('paid')}>Paid</button>
            <button className="pa-tab" data-active={filter === 'unpaid'} onClick={() => setFilter('unpaid')}>Unpaid</button>
          </div>
        )}
      />
      <div className="pa-content-body">
        <div className="pa-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="pa-table">
            <thead>
              <tr>
                <th>ID</th><th>Study</th><th>Sponsor</th><th>Type</th><th>Risk</th><th>Enrolled</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id}>
                  <td className="pa-mono">{t.id}</td>
                  <td>
                    <div style={{ fontWeight: 500, color: 'var(--ink)' }}>{t.plain}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{t.clinical}</div>
                  </td>
                  <td>{t.sponsor}</td>
                  <td><span className={'pa-pill ' + (t.paid ? 'info' : 'muted')}>{t.paid ? 'Paid' : 'Unpaid'}</span></td>
                  <td><span className="pa-risk" data-level={t.risk.toLowerCase()}>{t.risk}</span></td>
                  <td>{t.enrolled} / {t.enrolled + t.spots}</td>
                  <td><span className="pa-pill success"><span className="dot"></span>{t.status}</span></td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button className="pa-btn pa-btn-ghost pa-btn-sm"><Icon name="pause" size={12}/> Pause</button>
                    <button className="pa-btn pa-btn-danger pa-btn-sm" style={{ marginLeft: 6 }} onClick={() => setToRemove(t)}><Icon name="trash" size={12}/> Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 14, fontSize: 12, color: 'var(--ink-3)', display: 'flex', justifyContent: 'space-between' }}>
          <span>Showing {filtered.length} of {trials.length}. Removing a trial unpublishes it for all participants; data retention follows the sponsor's IRB policy.</span>
          <span className="pa-mono">refreshed 14:02</span>
        </div>
      </div>

      <PortalConfirm
        open={!!toRemove}
        title={toRemove ? `Remove ${toRemove.id}?` : ''}
        body={toRemove ? `"${toRemove.plain}" will be unpublished immediately. ${toRemove.enrolled} enrolled participants will be notified within 24 hours. This action is logged with your admin ID.` : ''}
        confirmLabel="Remove trial"
        danger
        onConfirm={() => setTrials(trials.filter(t => t.id !== toRemove.id))}
        onClose={() => setToRemove(null)}
      />
    </>
  )
}

function CreateResearcherModal({ open, onClose, companies, prefillCompanyId, onCreate }) {
  const verified = companies.filter(c => c.status === 'Verified')
  const [form, setForm] = useState({ name: '', email: '', company: prefillCompanyId || (verified[0] && verified[0].id) || '', role: 'Researcher' })
  const [err, setErr] = useState('')

  useEffect(() => {
    if (open) {
      setForm({ name: '', email: '', company: prefillCompanyId || (verified[0] && verified[0].id) || '', role: 'Researcher' })
      setErr('')
    }
  }, [open, prefillCompanyId])

  function submit() {
    if (!form.name.trim()) { setErr('Researcher name is required.'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) { setErr('A valid work email is required — the invite is sent here.'); return }
    if (!form.company) { setErr('Pick a verified pharmaceutical company.'); return }
    setErr('')
    onCreate(form)
    onClose()
  }

  const co = companies.find(c => c.id === form.company)

  return (
    <PortalModal
      open={open}
      title="Create a researcher account"
      onClose={onClose}
      width={620}
      footer={(
        <>
          <button className="pa-btn pa-btn-ghost" onClick={onClose}>Cancel</button>
          <button className="pa-btn pa-btn-primary" onClick={submit}><Icon name="check" size={14}/> Create &amp; send invite</button>
        </>
      )}
    >
      <p style={{ margin: '0 0 18px', fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.55 }}>
        Provisions a researcher account scoped to a single pharmaceutical company. The researcher receives an email invite, sets a password, and lands on their cohort console after 2FA enrollment.
      </p>
      <div className="pa-row pa-row-2" style={{ gap: 14 }}>
        <div className="pa-field">
          <label className="pa-label">Researcher full name</label>
          <input className="pa-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Dr Maya Roque"/>
        </div>
        <div className="pa-field">
          <label className="pa-label">Work email</label>
          <input className="pa-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="name@company.com"/>
          <div className="pa-help">Invite link expires in 72 hours.</div>
        </div>
      </div>
      <div className="pa-row pa-row-2" style={{ gap: 14, marginTop: 14 }}>
        <div className="pa-field">
          <label className="pa-label">Pharmaceutical company</label>
          <select className="pa-select" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })}>
            {verified.length === 0 && <option value="">No verified companies</option>}
            {verified.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <div className="pa-help">Only verified sponsors can have researchers.</div>
        </div>
        <div className="pa-field">
          <label className="pa-label">Access scope</label>
          <select className="pa-select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option>Researcher</option>
            <option>Researcher · lead</option>
            <option>Researcher · read-only</option>
          </select>
          <div className="pa-help">Lead can add/remove patients from cohorts. Read-only sees data only.</div>
        </div>
      </div>
      {co && (
        <div style={{ marginTop: 18, padding: 14, background: 'var(--sage-tint)', border: '1px solid var(--sage-soft)', borderRadius: 10, fontSize: 13, color: 'var(--ink-2)' }}>
          <div className="pa-mono" style={{ fontSize: 11, letterSpacing: '0.08em', color: 'var(--sage-2)' }}>WILL HAVE ACCESS TO</div>
          <div style={{ marginTop: 6 }}>{co.trials} trial{co.trials === 1 ? '' : 's'} under <strong>{co.name}</strong> · cohort of up to 5 patients per study · pseudonymous messaging relay · report uploads</div>
        </div>
      )}
      {err && <div style={{ marginTop: 12, fontSize: 13, color: '#C75A57' }}>{err}</div>}
    </PortalModal>
  )
}

function AdminUsers({ users, setUsers, companies }) {
  const [toAct, setToAct] = useState(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [filter, setFilter] = useState('all')
  const [toast, setToast] = useState('')

  function createResearcher(f) {
    const co = companies.find(c => c.id === f.company)
    const num = (users.filter(u => u.id.startsWith('RS-')).length + 1).toString().padStart(3, '0')
    const id = 'RS-' + 'CDFGH'[(users.length) % 5] + num
    setUsers([{ id, joined: 'Just now', role: f.role + ' · ' + (co ? co.name : ''), status: 'Active', trials: 0, lastSeen: 'pending' }, ...users])
    setToast(`Invite sent to ${f.email}. Researcher ${id} created under ${co ? co.name : 'company'}.`)
    setTimeout(() => setToast(''), 4000)
  }

  function apply() {
    if (!toAct) return
    if (toAct.action === 'pause') {
      setUsers(users.map(u => u.id === toAct.user.id ? { ...u, status: u.status === 'Paused' ? 'Active' : 'Paused' } : u))
    } else {
      setUsers(users.filter(u => u.id !== toAct.user.id))
    }
  }

  return (
    <>
      <PortalHead
        title="Users"
        sub="Pseudonymous user accounts. Pause locks login; delete erases the account record. Researchers are provisioned here per pharmaceutical company."
        right={(
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div className="pa-tabs">
              <button className="pa-tab" data-active={filter === 'all'} onClick={() => setFilter('all')}>All</button>
              <button className="pa-tab" data-active={filter === 'patient'} onClick={() => setFilter('patient')}>Patients</button>
              <button className="pa-tab" data-active={filter === 'researcher'} onClick={() => setFilter('researcher')}>Researchers</button>
            </div>
            <button className="pa-btn pa-btn-primary" onClick={() => setCreateOpen(true)}><Icon name="plus2" size={14}/> Create researcher</button>
          </div>
        )}
      />
      <div className="pa-content-body">
        {toast && <div className="pa-toast" style={{ marginBottom: 14 }}><Icon name="check" size={14}/> {toast}</div>}
        <div className="pa-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="pa-table">
            <thead><tr><th>ID</th><th>Role</th><th>Joined</th><th>Trials</th><th>Last seen</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {users.filter(u => filter === 'all' || (filter === 'patient' ? u.role === 'Patient' : u.role.startsWith('Researcher'))).map(u => (
                <tr key={u.id}>
                  <td className="pa-mono">{u.id}</td>
                  <td>{u.role}</td>
                  <td>{u.joined}</td>
                  <td>{u.trials}</td>
                  <td style={{ color: 'var(--ink-3)' }}>{u.lastSeen}</td>
                  <td>
                    <span className={'pa-pill ' + (u.status === 'Active' ? 'success' : u.status === 'Paused' ? 'warn' : 'muted')}>
                      <span className="dot"></span>{u.status}
                    </span>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button className="pa-btn pa-btn-ghost pa-btn-sm" onClick={() => setToAct({ user: u, action: 'pause' })}>
                      <Icon name={u.status === 'Paused' ? 'play2' : 'pause'} size={12}/> {u.status === 'Paused' ? 'Reactivate' : 'Pause'}
                    </button>
                    <button className="pa-btn pa-btn-danger pa-btn-sm" style={{ marginLeft: 6 }} onClick={() => setToAct({ user: u, action: 'delete' })}>
                      <Icon name="trash" size={12}/> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <PortalConfirm
        open={!!toAct}
        title={toAct ? (toAct.action === 'pause' ? `${toAct.user.status === 'Paused' ? 'Reactivate' : 'Pause'} ${toAct.user.id}?` : `Delete ${toAct.user.id}?`) : ''}
        body={toAct ? (
          toAct.action === 'pause'
            ? 'Pausing prevents the user from signing in or appearing in researcher cohorts. They can be reactivated at any time.'
            : 'Permanently deletes the account record and triggers automatic vault wipe. All non-trial-retained data is purged. This cannot be undone.'
        ) : ''}
        confirmLabel={toAct?.action === 'pause' ? (toAct.user.status === 'Paused' ? 'Reactivate' : 'Pause account') : 'Delete account'}
        danger={toAct?.action === 'delete'}
        onConfirm={apply}
        onClose={() => setToAct(null)}
      />
      <CreateResearcherModal open={createOpen} onClose={() => setCreateOpen(false)} companies={companies} onCreate={createResearcher}/>
    </>
  )
}

function AdminCompanies({ companies, setCompanies, users, setUsers }) {
  const [createForCo, setCreateForCo] = useState(null)
  const [toast, setToast] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [toRemove, setToRemove] = useState(null)
  const [newCo, setNewCo] = useState({ name: '', contact: '' })

  function createResearcher(f) {
    const co = companies.find(c => c.id === f.company)
    const num = (users.filter(u => u.id.startsWith('RS-')).length + 1).toString().padStart(3, '0')
    const id = 'RS-' + 'CDFGH'[(users.length) % 5] + num
    setUsers([{ id, joined: 'Just now', role: f.role + ' · ' + (co ? co.name : ''), status: 'Active', trials: 0, lastSeen: 'pending' }, ...users])
    setToast(`Invite sent to ${f.email}. Researcher ${id} created under ${co ? co.name : 'company'}.`)
    setTimeout(() => setToast(''), 4000)
  }

  function add() {
    if (!newCo.name) return
    const id = 'CO-' + String(100 + companies.length).padStart(3, '0')
    setCompanies([{ id, name: newCo.name, verifiedOn: 'Just now', trials: 0, contact: newCo.contact || '—', status: 'Pending' }, ...companies])
    setNewCo({ name: '', contact: '' })
    setAddOpen(false)
  }

  return (
    <>
      <PortalHead
        title="Pharmaceutical companies"
        sub="Sponsors permitted to publish trials. Verification is required before any trial they post becomes visible to patients."
        right={<button className="pa-btn pa-btn-primary" onClick={() => setAddOpen(true)}><Icon name="plus2" size={14}/> Add company</button>}
      />
      <div className="pa-content-body">
        {toast && <div className="pa-toast" style={{ marginBottom: 14 }}><Icon name="check" size={14}/> {toast}</div>}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          {companies.map(c => (
            <div key={c.id} className="pa-card" style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--cream-2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-2)', flexShrink: 0 }}>
                <Icon name="bldg" size={20}/>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 500 }}>{c.name}</div>
                    <div className="pa-mono" style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>{c.id} · {c.contact}</div>
                  </div>
                  <span className={'pa-pill ' + (c.status === 'Verified' ? 'success' : 'warn')}><span className="dot"></span>{c.status}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--line)' }}>
                  <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--ink-3)' }}>
                    <span>Verified <span style={{ color: 'var(--ink-2)' }}>{c.verifiedOn}</span></span>
                    <span>Active trials <span style={{ color: 'var(--ink-2)' }}>{c.trials}</span></span>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="pa-btn pa-btn-ghost pa-btn-sm" disabled={c.status !== 'Verified'} onClick={() => setCreateForCo(c.id)} style={c.status !== 'Verified' ? { opacity: 0.4, cursor: 'not-allowed' } : {}}><Icon name="plus2" size={12}/> Add researcher</button>
                    <button className="pa-btn pa-btn-ghost pa-btn-sm"><Icon name="edit" size={12}/> Edit</button>
                    <button className="pa-btn pa-btn-danger pa-btn-sm" onClick={() => setToRemove(c)}><Icon name="trash" size={12}/> Remove</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <PortalModal
        open={addOpen}
        title="Add a pharmaceutical company"
        onClose={() => setAddOpen(false)}
        footer={(
          <>
            <button className="pa-btn pa-btn-ghost" onClick={() => setAddOpen(false)}>Cancel</button>
            <button className="pa-btn pa-btn-primary" onClick={add}><Icon name="check" size={14}/> Add &amp; request verification</button>
          </>
        )}
      >
        <div className="pa-row" style={{ gap: 14 }}>
          <div className="pa-field">
            <label className="pa-label">Company name</label>
            <input className="pa-input" value={newCo.name} onChange={(e) => setNewCo({ ...newCo, name: e.target.value })} placeholder="e.g. Quinton Biosciences"/>
          </div>
          <div className="pa-field">
            <label className="pa-label">Primary contact email</label>
            <input className="pa-input" type="email" value={newCo.contact} onChange={(e) => setNewCo({ ...newCo, contact: e.target.value })} placeholder="ops@company.com"/>
            <div className="pa-help">Verification request is sent here. Trial publishing is blocked until verified against FDA/EMA registries.</div>
          </div>
        </div>
      </PortalModal>

      <PortalConfirm
        open={!!toRemove}
        title={toRemove ? `Remove ${toRemove.name}?` : ''}
        body={toRemove ? `${toRemove.trials} of their trials will be unpublished immediately. Researchers under this sponsor will lose access on next login.` : ''}
        confirmLabel="Remove company"
        danger
        onConfirm={() => setCompanies(companies.filter(c => c.id !== toRemove.id))}
        onClose={() => setToRemove(null)}
      />
      <CreateResearcherModal
        open={!!createForCo}
        prefillCompanyId={createForCo}
        companies={companies}
        onClose={() => setCreateForCo(null)}
        onCreate={createResearcher}
      />
    </>
  )
}

function AdminAudit() {
  return (
    <>
      <PortalHead title="Audit log" sub="Cryptographically-signed record of every admin action. Append-only."/>
      <div className="pa-content-body">
        <div className="pa-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="pa-table">
            <thead><tr><th>Time</th><th>Actor</th><th>Action</th><th>Category</th><th>Hash</th></tr></thead>
            <tbody>
              {PORTAL_AUDIT.concat(PORTAL_AUDIT).map((a, i) => (
                <tr key={i}>
                  <td className="pa-mono">{a.t} · today</td>
                  <td className="pa-mono" style={{ fontSize: 12 }}>{a.who}</td>
                  <td>{a.what}</td>
                  <td><span className="pa-pill muted">{a.tag}</span></td>
                  <td className="pa-mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>0x{(i * 37 + 1003).toString(16)}…b7</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
