import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../components/shared'
import { PortalTopbar, PortalSide, PortalHead, PortalModal, PortalConfirm } from '../components/portal-shell'
import { PORTAL_DOCS } from '../data/portal'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'

export default function PatientPortal() {
  const { auth, logout } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('profile')
  const [profile, setProfile] = useState(null)

  const fetchProfile = useCallback(async () => {
    try {
      const data = await api.get('/api/participant/profile')
      setProfile(data)
    } catch (ex) {
      if (ex.status === 401) { logout(); navigate('/login', { replace: true }) }
    }
  }, [logout, navigate])

  useEffect(() => { fetchProfile() }, [fetchProfile])

  const NAV = [
    { id: 'profile', label: 'Profile', icon: 'users' },
    { id: 'documents', label: 'Documents', icon: 'file' },
    { id: 'trials', label: 'Browse trials', icon: 'pill' },
    { id: 'privacy', label: 'Privacy & consent', icon: 'lock' },
  ]

  return (
    <div className="pa-root">
      <PortalTopbar role="patient" who={auth?.username ?? '…'}/>
      <div className="pa-main">
        <PortalSide
          items={NAV}
          value={tab}
          onChange={setTab}
          footer={(
            <div style={{ padding: 14, background: 'var(--sage-tint)', borderRadius: 10, border: '1px solid var(--sage-soft)' }}>
              <div className="pa-mono" style={{ fontSize: 10, color: 'var(--sage-2)', letterSpacing: '0.1em' }}>PRIVACY MODE</div>
              <div style={{ fontSize: 12, marginTop: 4, color: 'var(--ink-2)', lineHeight: 1.45 }}>
                Your real identity is visible only to you. Researchers see only a pseudonym token.
              </div>
            </div>
          )}
        />
        <div className="pa-content">
          {tab === 'profile'    && <PatientProfile profile={profile} onRefresh={fetchProfile}/>}
          {tab === 'documents'  && <PatientDocuments/>}
          {tab === 'trials'     && <PatientTrials profile={profile} onRefresh={fetchProfile}/>}
          {tab === 'privacy'    && <PatientPrivacy profile={profile} onRefresh={fetchProfile}/>}
        </div>
      </div>
    </div>
  )
}

// ── Profile ────────────────────────────────────────────────────────────────────

function PatientProfile({ profile, onRefresh }) {
  const [email, setEmail] = useState('')
  const [newPass, setNewPass] = useState('')
  const [currentPass, setCurrentPass] = useState('')
  const [err, setErr] = useState('')
  const [toast, setToast] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => { if (profile) setEmail(profile.email ?? '') }, [profile])

  async function save() {
    if (!email && !newPass) return
    if (!currentPass) { setErr('Current password is required to save changes.'); return }
    setErr('')
    setLoading(true)
    try {
      const body = { current_password: currentPass }
      if (email !== profile.email) body.email = email
      if (newPass) body.password = newPass
      await api.put('/api/participant/profile', body)
      setToast('Saved.')
      setCurrentPass('')
      setNewPass('')
      setTimeout(() => setToast(''), 2400)
      onRefresh()
    } catch (ex) {
      setErr(ex.message || 'Save failed.')
    } finally {
      setLoading(false)
    }
  }

  if (!profile) return <div className="pa-content-body"><div className="pa-empty">Loading…</div></div>

  return (
    <>
      <PortalHead
        title="Your profile"
        sub="Visible only to you. Researchers see only a pseudonym token."
        right={(
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {toast && <span className="pa-toast"><Icon name="check" size={14}/> {toast}</span>}
            <button className="pa-btn pa-btn-ghost" onClick={() => { setEmail(profile.email); setNewPass(''); setCurrentPass(''); setErr('') }}>Cancel</button>
            <button className="pa-btn pa-btn-primary" onClick={save} disabled={loading}>
              <Icon name="check" size={14}/> {loading ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        )}
      />
      <div className="pa-content-body">
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20 }}>
          <div style={{ display: 'grid', gap: 20 }}>
            <div className="pa-card">
              <div className="pa-card-head">
                <div>
                  <div className="pa-card-title">Account</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>Email and password changes require your current password.</div>
                </div>
                <span className="pa-pill success"><span className="dot"></span>Private to you</span>
              </div>
              <div className="pa-row pa-row-2">
                <div className="pa-field">
                  <label className="pa-label">Username</label>
                  <input className="pa-input" value={profile.username} readOnly style={{ background: 'var(--cream-2)', cursor: 'not-allowed' }}/>
                  <div className="pa-help">Username cannot be changed.</div>
                </div>
                <div className="pa-field">
                  <label className="pa-label">Email</label>
                  <input className="pa-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)}/>
                  <div className="pa-help">Never shared with researchers.</div>
                </div>
              </div>
              <div className="pa-row pa-row-2" style={{ marginTop: 14 }}>
                <div className="pa-field">
                  <label className="pa-label">New password <span style={{ color: 'var(--ink-3)', fontWeight: 400 }}>(optional)</span></label>
                  <input className="pa-input" type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} placeholder="Leave blank to keep current"/>
                </div>
                <div className="pa-field">
                  <label className="pa-label">Current password</label>
                  <input className="pa-input" type="password" value={currentPass} onChange={(e) => { setCurrentPass(e.target.value); setErr('') }} placeholder="Required to save changes"/>
                  {err && <div className="pa-help" style={{ color: '#C75A57' }}>{err}</div>}
                </div>
              </div>
            </div>

            <div className="pa-card">
              <div className="pa-card-title" style={{ marginBottom: 10 }}>Account details</div>
              <div style={{ display: 'grid', gap: 10, fontSize: 13 }}>
                {[
                  ['Role', profile.role],
                  ['Email verified', profile.email_verified ? 'Yes' : 'No'],
                  ['MFA enabled', profile.mfa_enabled ? 'Yes' : 'No'],
                  ['Member since', profile.created_at?.slice(0, 10)],
                  ['Last login', profile.last_login?.slice(0, 19).replace('T', ' ') ?? '—'],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '1px solid var(--line)' }}>
                    <span style={{ color: 'var(--ink-3)' }}>{k}</span>
                    <span className="pa-mono" style={{ fontSize: 12 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gap: 20 }}>
            <div className="pa-card" style={{ background: 'var(--sage-tint)', borderColor: 'var(--sage-soft)' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--white)', color: 'var(--sage-2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="lock" size={16}/>
                </span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--sage-2)' }}>Anonymity guarantee</div>
                  <div style={{ fontSize: 12, marginTop: 6, color: 'var(--ink-2)', lineHeight: 1.55 }}>
                    Your email and contact details are stored encrypted in an isolated vault. Trial sponsors, researchers, and admins cannot decrypt it.
                  </div>
                </div>
              </div>
            </div>
            <div className="pa-card">
              <div className="pa-card-title" style={{ marginBottom: 14 }}>Enrolment status</div>
              {profile.participant ? (
                <div style={{ display: 'grid', gap: 10, fontSize: 13 }}>
                  {[
                    ['Trial', profile.participant.trial_id],
                    ['Status', profile.participant.consent_status],
                    ['Withdrawn', profile.participant.withdrawal_triggered ? 'Yes' : 'No'],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '1px solid var(--line)' }}>
                      <span style={{ color: 'var(--ink-3)' }}>{k}</span>
                      <span>{v}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>Not enrolled in any trial yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// ── Documents (static — not in Phase 9 scope) ─────────────────────────────────

function PatientDocuments() {
  const [docs, setDocs] = useState(PORTAL_DOCS)
  const [drag, setDrag] = useState(false)

  function fakeUpload() {
    const newDoc = { id: 'DOC-00' + (docs.length + 1), name: 'Medical history — uploaded.pdf', kind: 'PDF', size: '1.4 MB', uploaded: 'Just now', tag: 'Medical history' }
    setDocs([newDoc, ...docs])
  }
  function remove(id) { setDocs(docs.filter(d => d.id !== id)) }

  return (
    <>
      <PortalHead
        title="Documents"
        sub="Upload your medical history, labs, and referrals. Researchers can only see documents you share into a specific study."
        right={<button className="pa-btn pa-btn-primary" onClick={fakeUpload}><Icon name="upload" size={14}/> Upload document</button>}
      />
      <div className="pa-content-body">
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20 }}>
          <div>
            <div
              className="pa-drop"
              style={drag ? { borderColor: 'var(--sage)', background: 'var(--sage-tint)' } : {}}
              onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => { e.preventDefault(); setDrag(false); fakeUpload() }}
              onClick={fakeUpload}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--sage-tint)', color: 'var(--sage-2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="upload" size={18}/>
                </span>
                <div style={{ fontSize: 15, color: 'var(--ink)' }}>Drop a file, or <span className="pa-link">browse</span></div>
                <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>PDF, JPG, PNG · up to 50 MB · encrypted on upload</div>
              </div>
            </div>
            <div style={{ marginTop: 24, marginBottom: 10, fontSize: 14, fontWeight: 500 }}>Your documents</div>
            <div style={{ display: 'grid', gap: 8 }}>
              {docs.map(d => (
                <div key={d.id} className="pa-doc">
                  <div className="pa-doc-icn"><Icon name="file" size={16}/></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-3)' }}><span className="pa-mono">{d.kind}</span> · {d.size} · uploaded {d.uploaded}</div>
                  </div>
                  <span className="pa-pill muted">{d.tag}</span>
                  <button className="pa-iconbtn" title="Remove" onClick={() => remove(d.id)}><Icon name="trash" size={14}/></button>
                </div>
              ))}
            </div>
          </div>
          <div className="pa-card">
            <div className="pa-card-title" style={{ marginBottom: 12 }}>Who can see these?</div>
            <p style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.55, margin: 0 }}>
              Documents stay in your vault by default. When you apply to a study, you decide which documents — if any — to attach.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

// ── Trials ─────────────────────────────────────────────────────────────────────

function PatientTrials({ profile, onRefresh }) {
  const [trials, setTrials] = useState([])
  const [loadingTrials, setLoadingTrials] = useState(true)
  const [risk, setRisk] = useState('any')
  const [applyTrial, setApplyTrial] = useState(null)
  const [consentVersion, setConsentVersion] = useState('v1.0')
  const [digitalSig, setDigitalSig] = useState('')
  const [applyErr, setApplyErr] = useState('')
  const [applyLoading, setApplyLoading] = useState(false)
  const [healthOpen, setHealthOpen] = useState(false)
  const [health, setHealth] = useState({ measurement_type: '', value: '', unit: '', recorded_at: '' })
  const [healthErr, setHealthErr] = useState('')
  const [healthLoading, setHealthLoading] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    api.get('/api/trials')
      .then(setTrials)
      .catch(() => {})
      .finally(() => setLoadingTrials(false))
  }, [])

  const enrolled = profile?.participant?.consent_status === 'active' ? profile.participant : null

  const filtered = trials.filter(t =>
    risk === 'any' || t.risk_level === risk
  )

  async function applyToTrial() {
    if (!digitalSig.trim()) { setApplyErr('Enter your full name as a digital signature.'); return }
    setApplyErr('')
    setApplyLoading(true)
    try {
      await api.post(`/api/trials/${applyTrial.trial_id}/apply`, {
        consent_text_version: consentVersion,
        digital_signature: digitalSig.trim(),
      })
      setApplyTrial(null)
      setDigitalSig('')
      setToast('Enrolled successfully!')
      setTimeout(() => setToast(''), 3000)
      onRefresh()
    } catch (ex) {
      setApplyErr(ex.message || 'Enrolment failed.')
    } finally {
      setApplyLoading(false)
    }
  }

  async function submitHealth() {
    const val = parseFloat(health.value)
    if (!health.measurement_type || isNaN(val) || !health.unit || !health.recorded_at) {
      setHealthErr('All fields are required.')
      return
    }
    setHealthErr('')
    setHealthLoading(true)
    try {
      const recorded_at = health.recorded_at.length === 16
        ? health.recorded_at + ':00'
        : health.recorded_at
      await api.post('/api/health/submit', {
        measurement_type: health.measurement_type,
        value: val,
        unit: health.unit,
        recorded_at,
      })
      setHealthOpen(false)
      setHealth({ measurement_type: '', value: '', unit: '', recorded_at: '' })
      setToast('Health data submitted.')
      setTimeout(() => setToast(''), 3000)
    } catch (ex) {
      setHealthErr(ex.message || 'Submission failed.')
    } finally {
      setHealthLoading(false)
    }
  }

  return (
    <>
      <PortalHead
        title="Browse trials"
        sub={loadingTrials ? 'Loading…' : `${filtered.length} of ${trials.length} trials match your filters.`}
        right={(
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {toast && <span className="pa-toast"><Icon name="check" size={14}/> {toast}</span>}
            {enrolled && (
              <button className="pa-btn pa-btn-ghost" onClick={() => setHealthOpen(true)}>
                <Icon name="activity" size={14}/> Submit health data
              </button>
            )}
          </div>
        )}
      />
      <div className="pa-content-body">
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 18, flexWrap: 'wrap' }}>
          <span className="pa-mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.1em' }}>RISK</span>
          {['any', 'minimal', 'low', 'medium', 'high'].map(r => (
            <button key={r} className="pa-chip-pick" data-on={risk === r} onClick={() => setRisk(r)}>
              {r === 'any' ? 'Any' : r[0].toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>

        {loadingTrials ? (
          <div className="pa-empty">Loading trials…</div>
        ) : filtered.length === 0 ? (
          <div className="pa-empty"><Icon name="pill" size={20}/><div style={{ marginTop: 10 }}>No trials match your filters.</div></div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
            {filtered.map(t => {
              const isEnrolled = enrolled?.trial_id === t.trial_id
              const spotsLeft = t.spots_total - t.spots_enrolled
              return (
                <div key={t.trial_id} className="pa-card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <div>
                      <div className="pa-mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{t.sponsor}</div>
                      <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: 22, lineHeight: 1.15, marginTop: 2 }}>{t.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{t.phase}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                      <span className={'pa-pill ' + (t.stipend !== 'Unpaid' ? 'success' : 'muted')}>{t.stipend !== 'Unpaid' ? 'Paid · ' + t.stipend : 'Unpaid'}</span>
                      <span className="pa-risk" data-level={t.risk_level}>{t.risk_level} risk</span>
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5 }}>{t.description?.slice(0, 120)}{t.description?.length > 120 ? '…' : ''}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, fontSize: 12 }}>
                    <div><div style={{ color: 'var(--ink-3)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Duration</div><div style={{ marginTop: 2 }}>{t.duration}</div></div>
                    <div><div style={{ color: 'var(--ink-3)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Location</div><div style={{ marginTop: 2 }}>{t.location}</div></div>
                    <div><div style={{ color: 'var(--ink-3)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Spots left</div><div style={{ marginTop: 2 }}>{spotsLeft}</div></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--line)', paddingTop: 12 }}>
                    {isEnrolled ? (
                      <span className="pa-pill success"><span className="dot"></span>Enrolled</span>
                    ) : enrolled ? (
                      <span className="pa-pill muted">Already enrolled in another trial</span>
                    ) : spotsLeft <= 0 ? (
                      <span className="pa-pill muted">Full</span>
                    ) : (
                      <button className="pa-btn pa-btn-primary pa-btn-sm" onClick={() => { setApplyTrial(t); setApplyErr(''); setDigitalSig('') }}>
                        Apply <Icon name="arrow" size={12}/>
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Apply modal */}
      <PortalModal
        open={!!applyTrial}
        title={applyTrial ? `Apply to ${applyTrial.title}` : ''}
        onClose={() => setApplyTrial(null)}
        footer={(
          <>
            <button className="pa-btn pa-btn-ghost" onClick={() => setApplyTrial(null)}>Cancel</button>
            <button className="pa-btn pa-btn-primary" onClick={applyToTrial} disabled={applyLoading}>
              {applyLoading ? 'Enrolling…' : 'Confirm and enrol'}
            </button>
          </>
        )}
      >
        <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.55 }}>
          By applying you consent to this trial's data usage terms. Your identity will be pseudonymised before being shared with the research team.
        </p>
        <div className="pa-field" style={{ marginBottom: 14 }}>
          <label className="pa-label">Consent form version</label>
          <input className="pa-input pa-mono" value={consentVersion} onChange={(e) => setConsentVersion(e.target.value)}/>
        </div>
        <div className="pa-field">
          <label className="pa-label">Digital signature — type your full name</label>
          <input className="pa-input" value={digitalSig} onChange={(e) => { setDigitalSig(e.target.value); setApplyErr('') }} placeholder="e.g. Jane Smith"/>
          {applyErr && <div className="pa-help" style={{ color: '#C75A57' }}>{applyErr}</div>}
        </div>
      </PortalModal>

      {/* Health data modal */}
      <PortalModal
        open={healthOpen}
        title="Submit health data"
        onClose={() => setHealthOpen(false)}
        footer={(
          <>
            <button className="pa-btn pa-btn-ghost" onClick={() => setHealthOpen(false)}>Cancel</button>
            <button className="pa-btn pa-btn-primary" onClick={submitHealth} disabled={healthLoading}>
              {healthLoading ? 'Submitting…' : 'Submit'}
            </button>
          </>
        )}
      >
        <div className="pa-row pa-row-2" style={{ gap: 14 }}>
          <div className="pa-field">
            <label className="pa-label">Measurement type</label>
            <input className="pa-input" value={health.measurement_type} onChange={(e) => setHealth({ ...health, measurement_type: e.target.value })} placeholder="e.g. heart_rate"/>
          </div>
          <div className="pa-field">
            <label className="pa-label">Value</label>
            <input className="pa-input" type="number" step="any" value={health.value} onChange={(e) => setHealth({ ...health, value: e.target.value })} placeholder="e.g. 72"/>
          </div>
          <div className="pa-field">
            <label className="pa-label">Unit</label>
            <input className="pa-input" value={health.unit} onChange={(e) => setHealth({ ...health, unit: e.target.value })} placeholder="e.g. bpm"/>
          </div>
          <div className="pa-field">
            <label className="pa-label">Recorded at</label>
            <input className="pa-input" type="datetime-local" value={health.recorded_at} onChange={(e) => setHealth({ ...health, recorded_at: e.target.value })}/>
          </div>
        </div>
        {healthErr && <div style={{ marginTop: 8, fontSize: 13, color: '#C75A57' }}>{healthErr}</div>}
      </PortalModal>
    </>
  )
}

// ── Privacy & consent ──────────────────────────────────────────────────────────

function PatientPrivacy({ profile, onRefresh }) {
  const [withdrawOpen, setWithdrawOpen] = useState(false)
  const [withdrawLoading, setWithdrawLoading] = useState(false)
  const [err, setErr] = useState('')
  const [toast, setToast] = useState('')

  const participant = profile?.participant

  async function withdraw() {
    if (!participant) return
    setWithdrawLoading(true)
    setErr('')
    try {
      await api.post(`/api/trials/${participant.trial_id}/withdraw`)
      setWithdrawOpen(false)
      setToast('Withdrawal processed. Your personal data has been erased.')
      setTimeout(() => setToast(''), 5000)
      onRefresh()
    } catch (ex) {
      setErr(ex.message || 'Withdrawal failed.')
    } finally {
      setWithdrawLoading(false)
    }
  }

  return (
    <>
      <PortalHead title="Privacy & consent" sub="See your active consents and withdraw at any time."/>
      <div className="pa-content-body">
        {toast && <div className="pa-toast" style={{ marginBottom: 16 }}><Icon name="check" size={14}/> {toast}</div>}

        {!participant ? (
          <div className="pa-empty">
            <Icon name="lock" size={20}/>
            <div style={{ marginTop: 10, color: 'var(--ink-2)', fontSize: 14 }}>No active consents yet. Apply to a trial to see them here.</div>
          </div>
        ) : (
          <div style={{ maxWidth: 600 }}>
            <div className="pa-card">
              <div className="pa-card-head">
                <div>
                  <div className="pa-card-title">Active consent</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>Trial: <span className="pa-mono">{participant.trial_id}</span></div>
                </div>
                <span className={'pa-pill ' + (participant.consent_status === 'active' ? 'success' : participant.consent_status === 'withdrawn' ? 'muted' : 'warn')}>
                  <span className="dot"></span>{participant.consent_status}
                </span>
              </div>
              <div className="pa-divider"></div>
              <div style={{ display: 'grid', gap: 10, fontSize: 13, marginBottom: 20 }}>
                {[
                  ['Participant ID', participant.participant_id],
                  ['Consent status', participant.consent_status],
                  ['Withdrawal triggered', participant.withdrawal_triggered ? 'Yes — PII erased' : 'No'],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '1px solid var(--line)' }}>
                    <span style={{ color: 'var(--ink-3)' }}>{k}</span>
                    <span className="pa-mono" style={{ fontSize: 12 }}>{v}</span>
                  </div>
                ))}
              </div>
              {participant.consent_status === 'active' && !participant.withdrawal_triggered && (
                <>
                  {err && <div style={{ marginBottom: 12, fontSize: 13, color: '#C75A57' }}>{err}</div>}
                  <button className="pa-btn pa-btn-danger" onClick={() => setWithdrawOpen(true)}>
                    <Icon name="trash" size={14}/> Withdraw from trial
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <PortalConfirm
        open={withdrawOpen}
        title="Withdraw from trial?"
        body="This will permanently erase your personal data from our vault. Clinical telemetry collected so far will be retained under your pseudonym token as required by research protocols. This cannot be undone."
        confirmLabel={withdrawLoading ? 'Withdrawing…' : 'Withdraw and erase my data'}
        danger
        onConfirm={withdraw}
        onClose={() => setWithdrawOpen(false)}
      />
    </>
  )
}
