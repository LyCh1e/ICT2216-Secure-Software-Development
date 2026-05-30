import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../components/shared'
import { PortalTopbar, PortalSide, PortalHead } from '../components/portal-shell'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'

export default function ResearcherPortal() {
  const { auth, logout } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('stats')
  const [trials, setTrials] = useState([])
  const [loadingTrials, setLoadingTrials] = useState(true)
  const [selectedId, setSelectedId] = useState(null)

  useEffect(() => {
    api.get('/api/researcher/trials')
      .then(data => {
        setTrials(data)
        if (data.length > 0) setSelectedId(data[0].trial_id)
      })
      .catch(ex => {
        if (ex.status === 401) { logout(); navigate('/login', { replace: true }) }
      })
      .finally(() => setLoadingTrials(false))
  }, [logout, navigate])

  const NAV = [
    { id: 'stats', label: 'Trial stats', icon: 'chart', count: trials.length },
    { id: 'schedule', label: 'Schedule', icon: 'cal' },
    { id: 'reports', label: 'Reports', icon: 'file' },
  ]

  return (
    <div className="pa-root">
      <PortalTopbar role="researcher" who={auth?.username ?? '…'}/>
      <div className="pa-main">
        <PortalSide
          items={NAV}
          value={tab}
          onChange={setTab}
          footer={(
            <div style={{ padding: 14, background: 'var(--coral-tint)', borderRadius: 10, border: '1px solid var(--coral-soft)' }}>
              <div className="pa-mono" style={{ fontSize: 10, letterSpacing: '0.1em', color: 'var(--coral-2)' }}>DATA ACCESS</div>
              <div style={{ fontSize: 12, marginTop: 4, color: 'var(--ink-2)', lineHeight: 1.45 }}>
                You see <strong>aggregate stats only</strong>. Individual participant identities are never exposed.
              </div>
            </div>
          )}
        />
        <div className="pa-content">
          {tab === 'stats'    && <ResearcherStats trials={trials} loading={loadingTrials} selectedId={selectedId} setSelectedId={setSelectedId}/>}
          {tab === 'schedule' && <ResearcherSchedule/>}
          {tab === 'reports'  && <ResearcherReports/>}
        </div>
      </div>
    </div>
  )
}

function ResearcherStats({ trials, loading, selectedId, setSelectedId }) {
  const [stats, setStats] = useState(null)
  const [loadingStats, setLoadingStats] = useState(false)

  useEffect(() => {
    if (!selectedId) return
    setLoadingStats(true)
    api.get(`/api/researcher/trials/${selectedId}/stats`)
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoadingStats(false))
  }, [selectedId])

  const selected = trials.find(t => t.trial_id === selectedId)

  return (
    <>
      <PortalHead
        title="Trial stats"
        sub="Aggregate data only. No individual participant records or identifiers are ever exposed."
      />
      <div className="pa-content-body" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 18, alignItems: 'flex-start' }}>
        {/* Trial list */}
        <div style={{ display: 'grid', gap: 8 }}>
          {loading ? (
            <div style={{ fontSize: 13, color: 'var(--ink-3)', padding: 16 }}>Loading trials…</div>
          ) : trials.length === 0 ? (
            <div style={{ fontSize: 13, color: 'var(--ink-3)', padding: 16 }}>No trials assigned.</div>
          ) : trials.map(t => (
            <button
              key={t.trial_id}
              onClick={() => setSelectedId(t.trial_id)}
              className="pa-card"
              style={{
                textAlign: 'left', cursor: 'pointer', padding: 14,
                borderColor: selectedId === t.trial_id ? 'var(--coral)' : 'var(--line)',
                background: selectedId === t.trial_id ? 'var(--coral-tint)' : 'var(--white)',
                display: 'flex', flexDirection: 'column', gap: 6,
                fontFamily: 'inherit',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="pa-mono" style={{ fontSize: 11 }}>{t.trial_id}</span>
                <span className={'pa-pill ' + (t.status === 'recruiting' ? 'success' : 'muted')}>
                  <span className="dot"></span>{t.status}
                </span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.3 }}>{t.title}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{t.sponsor} · {t.phase}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>
                <span>Enrolled</span>
                <span className="pa-mono">{t.spots_enrolled} / {t.spots_total}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Stats panel */}
        {!selected ? (
          <div className="pa-empty">Select a trial to view aggregate statistics.</div>
        ) : loadingStats ? (
          <div className="pa-empty">Loading stats…</div>
        ) : stats ? (
          <div style={{ display: 'grid', gap: 16 }}>
            <div className="pa-card">
              <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: 26, lineHeight: 1.15 }}>{stats.title}</div>
              <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 4 }}>{selected.sponsor} · {selected.phase}</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginTop: 20 }}>
                {[
                  ['Total enrolled', stats.total_enrolled],
                  ['Active', stats.active_participants],
                  ['Withdrawn', stats.withdrawn_participants],
                  ['Withdrawal rate', stats.withdrawal_rate + '%'],
                ].map(([k, v]) => (
                  <div key={k} style={{ borderLeft: '2px solid var(--coral)', paddingLeft: 14 }}>
                    <div className="pa-mono" style={{ fontSize: 10, letterSpacing: '0.08em', color: 'var(--ink-3)', textTransform: 'uppercase' }}>{k}</div>
                    <div style={{ fontSize: 28, fontWeight: 600, marginTop: 6, fontFamily: 'Geist Mono, monospace' }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pa-card" style={{ background: 'var(--coral-tint)', borderColor: 'var(--coral-soft)' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--white)', color: 'var(--coral-2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name="lock" size={14}/>
                </span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--coral-2)' }}>Aggregate data only</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 4, lineHeight: 1.5 }}>
                    These statistics are computed server-side from anonymised records. Individual participant identifiers, ages, or health readings are never returned to this interface.
                  </div>
                </div>
              </div>
            </div>

            <div className="pa-card">
              <div className="pa-card-title" style={{ marginBottom: 12 }}>Trial details</div>
              <div style={{ display: 'grid', gap: 8, fontSize: 13 }}>
                {[
                  ['Status', selected.status],
                  ['Risk level', selected.risk_level ?? '—'],
                  ['Spots total', selected.spots_total],
                  ['Spots enrolled', selected.spots_enrolled],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '1px solid var(--line)' }}>
                    <span style={{ color: 'var(--ink-3)' }}>{k}</span>
                    <span className="pa-mono" style={{ fontSize: 12 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="pa-empty">Failed to load stats.</div>
        )}
      </div>
    </>
  )
}

function ResearcherSchedule() {
  return (
    <>
      <PortalHead title="Schedule" sub="Upcoming check-ins and meetings. Feature coming soon."/>
      <div className="pa-content-body">
        <div className="pa-empty"><Icon name="cal" size={20}/><div style={{ marginTop: 10, fontSize: 14, color: 'var(--ink-2)' }}>Schedule management is not yet available.</div></div>
      </div>
    </>
  )
}

function ResearcherReports() {
  return (
    <>
      <PortalHead title="Reports" sub="Uploaded study reports. Feature coming soon."/>
      <div className="pa-content-body">
        <div className="pa-empty"><Icon name="file" size={20}/><div style={{ marginTop: 10, fontSize: 14, color: 'var(--ink-2)' }}>Report management is not yet available.</div></div>
      </div>
    </>
  )
}
