import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../components/shared'
import { PortalTopbar, PortalSide, PortalHead, PortalModal, PortalConfirm } from '../components/portal-shell'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'

export default function AdminPortal() {
  const { auth, logout } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('overview')
  const [users, setUsers] = useState([])
  const [trials, setTrials] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [loadingTrials, setLoadingTrials] = useState(true)

  const fetchUsers = useCallback(async () => {
    try {
      const data = await api.get('/api/admin/users')
      setUsers(data)
    } catch (ex) {
      if (ex.status === 401) { logout(); navigate('/login', { replace: true }) }
    } finally {
      setLoadingUsers(false)
    }
  }, [logout, navigate])

  const fetchTrials = useCallback(async () => {
    try {
      const data = await api.get('/api/admin/trials')
      setTrials(data)
    } catch {}
    finally { setLoadingTrials(false) }
  }, [])

  useEffect(() => { fetchUsers(); fetchTrials() }, [fetchUsers, fetchTrials])

  const NAV = [
    { id: 'overview',  label: 'Overview',  icon: 'chart' },
    { id: 'trials',    label: 'Trials',    icon: 'pill',     count: loadingTrials ? '…' : trials.length },
    { id: 'users',     label: 'Users',     icon: 'users',    count: loadingUsers  ? '…' : users.length  },
    { id: 'audit',     label: 'Audit log', icon: 'activity' },
  ]

  return (
    <div className="pa-root">
      <PortalTopbar role="admin" who={auth?.username ?? '…'}/>
      <div className="pa-main">
        <PortalSide
          items={NAV}
          value={tab}
          onChange={setTab}
          footer={(
            <div style={{ padding: 14, background: 'var(--ink)', color: 'var(--cream)', borderRadius: 10 }}>
              <div className="pa-mono" style={{ fontSize: 10, letterSpacing: '0.1em', color: 'var(--cream-3)' }}>ADMIN · L2</div>
              <div style={{ fontSize: 12, marginTop: 4, color: 'var(--cream-3)', lineHeight: 1.45 }}>
                Full read/write on platform records. Every action is logged.
              </div>
            </div>
          )}
        />
        <div className="pa-content">
          {tab === 'overview' && <AdminOverview users={users} trials={trials} go={setTab}/>}
          {tab === 'trials'   && <AdminTrials   trials={trials} onRefresh={fetchTrials}/>}
          {tab === 'users'    && <AdminUsers    users={users}   onRefresh={fetchUsers}/>}
          {tab === 'audit'    && <AdminAudit/>}
        </div>
      </div>
    </div>
  )
}

// ── Overview ───────────────────────────────────────────────────────────────────

function AdminOverview({ users, trials, go }) {
  const active    = trials.filter(t => t.status === 'recruiting').length
  const patients  = users.filter(u => u.role === 'participant').length
  const suspended = users.filter(u => u.suspended).length

  return (
    <>
      <PortalHead title="Platform overview" sub="Live counts across users and trials."/>
      <div className="pa-content-body">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 18 }}>
          {[
            { k: active,            l: 'Active trials',    go: 'trials' },
            { k: patients,          l: 'Participants',      go: 'users'  },
            { k: users.length,      l: 'Total users',       go: 'users'  },
            { k: suspended,         l: 'Suspended accounts',go: 'users'  },
          ].map((s, i) => (
            <div key={i} className="pa-stat" style={{ cursor: 'pointer' }} onClick={() => go(s.go)}>
              <div className="pa-stat-k">{s.k}</div>
              <div className="pa-stat-l">{s.l}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18 }}>
          <div className="pa-card">
            <div className="pa-card-head">
              <div>
                <div className="pa-card-title">Trials currently recruiting</div>
              </div>
              <button className="pa-btn pa-btn-link" onClick={() => go('trials')}>See all <Icon name="arrow" size={12}/></button>
            </div>
            <table className="pa-table">
              <thead><tr><th>Title</th><th>Sponsor</th><th>Phase</th><th>Enrolled</th></tr></thead>
              <tbody>
                {trials.filter(t => t.status === 'recruiting').slice(0, 5).map(t => (
                  <tr key={t.trial_id}>
                    <td>{t.title}</td>
                    <td>{t.sponsor}</td>
                    <td>{t.phase}</td>
                    <td>{t.spots_enrolled} / {t.spots_total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pa-card">
            <div className="pa-card-head">
              <div>
                <div className="pa-card-title">Recent audit events</div>
              </div>
              <button className="pa-btn pa-btn-link" onClick={() => go('audit')}>Full log</button>
            </div>
            <RecentAudit/>
          </div>
        </div>
      </div>
    </>
  )
}

function RecentAudit() {
  const [logs, setLogs] = useState([])
  useEffect(() => {
    api.get('/api/admin/audit-log?per_page=5')
      .then(data => setLogs(data.logs ?? []))
      .catch(() => {})
  }, [])
  return (
    <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 0 }}>
      {logs.map((a, i) => (
        <li key={a.log_id} style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2, padding: '10px 0', borderTop: i === 0 ? 'none' : '1px solid var(--line)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>{a.action_type}</span>
            <span className={'pa-pill ' + (a.outcome === 'success' ? 'success' : 'danger')}>{a.outcome}</span>
          </div>
          <div className="pa-mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>{a.timestamp?.slice(0, 19).replace('T', ' ')} · {a.ip_address}</div>
        </li>
      ))}
    </ol>
  )
}

// ── Trials ─────────────────────────────────────────────────────────────────────

function AdminTrials({ trials, onRefresh }) {
  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', phase: '', sponsor: '', duration: '', stipend: 'Unpaid', risk_level: 'minimal', spots_total: '', location: '' })
  const [formErr, setFormErr] = useState('')
  const [createLoading, setCreateLoading] = useState(false)
  const [toast, setToast] = useState('')

  async function createTrial() {
    if (!form.title || !form.description || !form.phase || !form.sponsor || !form.duration || !form.spots_total || !form.location) {
      setFormErr('All fields except stipend are required.')
      return
    }
    setFormErr('')
    setCreateLoading(true)
    try {
      await api.post('/api/admin/trials', { ...form, spots_total: parseInt(form.spots_total, 10) })
      setCreateOpen(false)
      setForm({ title: '', description: '', phase: '', sponsor: '', duration: '', stipend: 'Unpaid', risk_level: 'minimal', spots_total: '', location: '' })
      setToast('Trial created.')
      setTimeout(() => setToast(''), 3000)
      onRefresh()
    } catch (ex) {
      setFormErr(ex.message || 'Failed to create trial.')
    } finally {
      setCreateLoading(false)
    }
  }

  return (
    <>
      <PortalHead
        title="Trials"
        sub="All trials currently on TrialGuard."
        right={(
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {toast && <span className="pa-toast"><Icon name="check" size={14}/> {toast}</span>}
            <button className="pa-btn pa-btn-primary" onClick={() => setCreateOpen(true)}>
              <Icon name="plus2" size={14}/> Create trial
            </button>
          </div>
        )}
      />
      <div className="pa-content-body">
        <div className="pa-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="pa-table">
            <thead>
              <tr><th>Title</th><th>Sponsor</th><th>Phase</th><th>Risk</th><th>Enrolled</th><th>Status</th></tr>
            </thead>
            <tbody>
              {trials.map(t => (
                <tr key={t.trial_id}>
                  <td style={{ fontWeight: 500 }}>{t.title}</td>
                  <td>{t.sponsor}</td>
                  <td>{t.phase}</td>
                  <td><span className="pa-risk" data-level={t.risk_level}>{t.risk_level}</span></td>
                  <td>{t.spots_enrolled} / {t.spots_total}</td>
                  <td><span className={'pa-pill ' + (t.status === 'recruiting' ? 'success' : 'muted')}><span className="dot"></span>{t.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <PortalModal
        open={createOpen}
        title="Create a new trial"
        onClose={() => setCreateOpen(false)}
        width={640}
        footer={(
          <>
            <button className="pa-btn pa-btn-ghost" onClick={() => setCreateOpen(false)}>Cancel</button>
            <button className="pa-btn pa-btn-primary" onClick={createTrial} disabled={createLoading}>
              {createLoading ? 'Creating…' : <><Icon name="check" size={14}/> Create trial</>}
            </button>
          </>
        )}
      >
        <div className="pa-row pa-row-2" style={{ gap: 14 }}>
          <div className="pa-field">
            <label className="pa-label">Title</label>
            <input className="pa-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. New sleep medication"/>
          </div>
          <div className="pa-field">
            <label className="pa-label">Sponsor</label>
            <input className="pa-input" value={form.sponsor} onChange={(e) => setForm({ ...form, sponsor: e.target.value })} placeholder="e.g. Helix Therapeutics"/>
          </div>
          <div className="pa-field">
            <label className="pa-label">Phase</label>
            <input className="pa-input" value={form.phase} onChange={(e) => setForm({ ...form, phase: e.target.value })} placeholder="e.g. Phase II"/>
          </div>
          <div className="pa-field">
            <label className="pa-label">Risk level</label>
            <select className="pa-select" value={form.risk_level} onChange={(e) => setForm({ ...form, risk_level: e.target.value })}>
              <option value="minimal">Minimal</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="pa-field">
            <label className="pa-label">Duration</label>
            <input className="pa-input" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="e.g. 12 weeks"/>
          </div>
          <div className="pa-field">
            <label className="pa-label">Spots total</label>
            <input className="pa-input" type="number" value={form.spots_total} onChange={(e) => setForm({ ...form, spots_total: e.target.value })} placeholder="e.g. 50"/>
          </div>
          <div className="pa-field">
            <label className="pa-label">Location</label>
            <input className="pa-input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Remote / Boston, MA"/>
          </div>
          <div className="pa-field">
            <label className="pa-label">Stipend</label>
            <input className="pa-input" value={form.stipend} onChange={(e) => setForm({ ...form, stipend: e.target.value })} placeholder="e.g. $1,200 or Unpaid"/>
          </div>
        </div>
        <div className="pa-field" style={{ marginTop: 14 }}>
          <label className="pa-label">Description</label>
          <textarea className="pa-textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Trial description…" rows={3}/>
        </div>
        {formErr && <div style={{ marginTop: 10, fontSize: 13, color: '#C75A57' }}>{formErr}</div>}
      </PortalModal>
    </>
  )
}

// ── Users ──────────────────────────────────────────────────────────────────────

function AdminUsers({ users, onRefresh }) {
  const [toAct, setToAct] = useState(null)
  const [actLoading, setActLoading] = useState(false)
  const [filter, setFilter] = useState('all')
  const [toast, setToast] = useState('')
  const [roleTarget, setRoleTarget] = useState(null)
  const [roleLoading, setRoleLoading] = useState(false)

  async function applyAction() {
    if (!toAct) return
    setActLoading(true)
    try {
      const endpoint = toAct.action === 'suspend'
        ? `/api/admin/users/${toAct.user.user_id}/suspend`
        : `/api/admin/users/${toAct.user.user_id}/activate`
      await api.post(endpoint)
      setToast(`${toAct.action === 'suspend' ? 'Suspended' : 'Activated'}: ${toAct.user.username}`)
      setTimeout(() => setToast(''), 3000)
      onRefresh()
    } catch (ex) {
      setToast(ex.message || 'Action failed.')
    } finally {
      setActLoading(false)
      setToAct(null)
    }
  }

  async function applyRoleChange() {
    if (!roleTarget) return
    setRoleLoading(true)
    try {
      await api.post(`/api/admin/users/${roleTarget.user.user_id}/role`, { role: roleTarget.role })
      setToast(`Role updated: ${roleTarget.user.username} → ${roleTarget.role}`)
      setTimeout(() => setToast(''), 3000)
      onRefresh()
    } catch (ex) {
      setToast(ex.message || 'Role change failed.')
    } finally {
      setRoleLoading(false)
      setRoleTarget(null)
    }
  }

  const filtered = users.filter(u =>
    filter === 'all' ||
    (filter === 'participant' && u.role === 'participant') ||
    (filter === 'researcher'  && u.role === 'researcher')  ||
    (filter === 'suspended'   && u.suspended)
  )

  return (
    <>
      <PortalHead
        title="Users"
        sub="All registered accounts. Suspend prevents login; activate restores access."
        right={(
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {toast && <span className="pa-toast"><Icon name="check" size={14}/> {toast}</span>}
            <div className="pa-tabs">
              {['all', 'participant', 'researcher', 'suspended'].map(f => (
                <button key={f} className="pa-tab" data-active={filter === f} onClick={() => setFilter(f)}>
                  {f[0].toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}
      />
      <div className="pa-content-body">
        <div className="pa-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="pa-table">
            <thead><tr><th>Username</th><th>Email</th><th>Role</th><th>Joined</th><th>Last login</th><th>MFA</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.user_id}>
                  <td className="pa-mono">{u.username}</td>
                  <td style={{ color: 'var(--ink-3)', fontSize: 12 }}>{u.email}</td>
                  <td>
                    <select
                      className="pa-select"
                      style={{ fontSize: 11, padding: '2px 6px', height: 'auto' }}
                      value={u.role}
                      onChange={(e) => setRoleTarget({ user: u, role: e.target.value })}
                    >
                      <option value="participant">participant</option>
                      <option value="researcher">researcher</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td style={{ color: 'var(--ink-3)' }}>{u.created_at?.slice(0, 10)}</td>
                  <td style={{ color: 'var(--ink-3)', fontSize: 12 }}>{u.last_login?.slice(0, 19).replace('T', ' ') ?? '—'}</td>
                  <td>{u.mfa_enabled ? <span className="pa-pill success">On</span> : <span className="pa-pill muted">Off</span>}</td>
                  <td>
                    <span className={'pa-pill ' + (u.suspended ? 'warn' : 'success')}>
                      <span className="dot"></span>{u.suspended ? 'Suspended' : 'Active'}
                    </span>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {u.suspended ? (
                      <button className="pa-btn pa-btn-ghost pa-btn-sm" onClick={() => setToAct({ user: u, action: 'activate' })}>
                        <Icon name="play2" size={12}/> Activate
                      </button>
                    ) : (
                      <button className="pa-btn pa-btn-danger pa-btn-sm" onClick={() => setToAct({ user: u, action: 'suspend' })}>
                        <Icon name="pause" size={12}/> Suspend
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <PortalConfirm
        open={!!toAct}
        title={toAct ? `${toAct.action === 'suspend' ? 'Suspend' : 'Activate'} ${toAct.user?.username}?` : ''}
        body={toAct?.action === 'suspend'
          ? 'Suspending this account prevents the user from signing in. They can be reactivated at any time.'
          : 'Reactivating this account restores the user\'s ability to sign in.'}
        confirmLabel={actLoading ? 'Working…' : (toAct?.action === 'suspend' ? 'Suspend account' : 'Activate account')}
        danger={toAct?.action === 'suspend'}
        onConfirm={applyAction}
        onClose={() => setToAct(null)}
      />

      <PortalConfirm
        open={!!roleTarget}
        title={roleTarget ? `Change role for ${roleTarget.user?.username}?` : ''}
        body={roleTarget ? `This will change their role to "${roleTarget.role}". They will be redirected to the appropriate portal on next login.` : ''}
        confirmLabel={roleLoading ? 'Saving…' : 'Change role'}
        danger={false}
        onConfirm={applyRoleChange}
        onClose={() => setRoleTarget(null)}
      />
    </>
  )
}

// ── Audit log ──────────────────────────────────────────────────────────────────

function AdminAudit() {
  const [logs, setLogs] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const perPage = 50

  useEffect(() => {
    setLoading(true)
    api.get(`/api/admin/audit-log?page=${page}&per_page=${perPage}`)
      .then(data => {
        setLogs(data.logs ?? [])
        setTotal(data.total ?? 0)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [page])

  const totalPages = Math.ceil(total / perPage)

  return (
    <>
      <PortalHead
        title="Audit log"
        sub={`Append-only, hash-chained record of every sensitive action. ${total} total entries.`}
        right={(
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12, color: 'var(--ink-3)' }}>
            <button className="pa-btn pa-btn-ghost pa-btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
            <span className="pa-mono">Page {page} of {totalPages || 1}</span>
            <button className="pa-btn pa-btn-ghost pa-btn-sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
          </div>
        )}
      />
      <div className="pa-content-body">
        <div className="pa-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="pa-table">
            <thead>
              <tr><th>Time</th><th>User</th><th>Action</th><th>Resource</th><th>Outcome</th><th>IP</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--ink-3)', padding: 24 }}>Loading…</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--ink-3)', padding: 24 }}>No log entries.</td></tr>
              ) : logs.map(l => (
                <tr key={l.log_id}>
                  <td className="pa-mono" style={{ fontSize: 11 }}>{l.timestamp?.slice(0, 19).replace('T', ' ')}</td>
                  <td className="pa-mono" style={{ fontSize: 11 }}>{l.user_id ?? '—'}</td>
                  <td>{l.action_type}</td>
                  <td style={{ color: 'var(--ink-3)', fontSize: 12, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.resource_affected ?? '—'}</td>
                  <td><span className={'pa-pill ' + (l.outcome === 'success' ? 'success' : 'danger')}>{l.outcome}</span></td>
                  <td className="pa-mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{l.ip_address ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
