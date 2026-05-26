import { useState } from 'react'
import { Icon } from '../components/shared'
import { PortalTopbar, PortalSide, PortalHead, PortalModal } from '../components/portal-shell'
import { PORTAL_COHORT, PORTAL_REPORTS } from '../data/portal'

export default function ResearcherPortal() {
  const [tab, setTab] = useState('cohort')
  const [cohort, setCohort] = useState(PORTAL_COHORT)
  const [reports, setReports] = useState(PORTAL_REPORTS)
  const [selectedId, setSelectedId] = useState(PORTAL_COHORT[0].id)
  const selected = cohort.find(p => p.id === selectedId) || cohort[0]

  const NAV = [
    { id: 'cohort', label: 'My cohort', icon: 'users', count: cohort.length + '/5' },
    { id: 'schedule', label: 'Schedule', icon: 'cal' },
    { id: 'reports', label: 'Reports', icon: 'file', count: reports.length },
  ]

  return (
    <div className="pa-root">
      <PortalTopbar role="researcher" who="Dr · Maya Roque"/>
      <div className="pa-main">
        <PortalSide
          items={NAV}
          value={tab}
          onChange={setTab}
          footer={(
            <div style={{ padding: 14, background: 'var(--coral-tint)', borderRadius: 10, border: '1px solid var(--coral-soft)' }}>
              <div className="pa-mono" style={{ fontSize: 10, letterSpacing: '0.1em', color: 'var(--coral-2)' }}>STUDY · NCT-2841</div>
              <div style={{ fontSize: 12, marginTop: 4, color: 'var(--ink-2)', lineHeight: 1.45 }}>
                New sleep medication · Phase II. You manage <strong>{cohort.length}/5</strong> participants.
              </div>
            </div>
          )}
        />
        <div className="pa-content">
          {tab === 'cohort' && <ResearcherCohort
            cohort={cohort} setCohort={setCohort}
            selectedId={selectedId} setSelectedId={setSelectedId}
            selected={selected}
            reports={reports} setReports={setReports}
          />}
          {tab === 'schedule' && <ResearcherSchedule cohort={cohort}/>}
          {tab === 'reports' && <ResearcherReports reports={reports}/>}
        </div>
      </div>
    </div>
  )
}

function ResearcherCohort({ cohort, setCohort, selectedId, setSelectedId, selected, reports, setReports }) {
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [removeOpen, setRemoveOpen] = useState(false)
  const [removeReason, setRemoveReason] = useState('completed')
  const [meeting, setMeeting] = useState({ kind: 'Check-in', date: '2026-05-29', time: '10:00', notes: '' })
  const [newReport, setNewReport] = useState({ title: '', kind: 'PDF' })

  function scheduleMeeting() {
    setCohort(cohort.map(p => p.id === selected.id ? { ...p, nextVisit: `${meeting.date.slice(5)} · ${meeting.time}` } : p))
    setScheduleOpen(false)
  }

  function uploadReport() {
    if (!newReport.title) return
    const id = 'RPT-' + (88 + reports.length + 1)
    setReports([{ id, title: newReport.title, patient: selected.id, date: 'Just now', size: '0.9 MB', kind: newReport.kind }, ...reports])
    setNewReport({ title: '', kind: 'PDF' })
    setUploadOpen(false)
  }

  function removeFromTrial() {
    setCohort(cohort.filter(p => p.id !== selected.id))
    setRemoveOpen(false)
    const next = cohort.find(p => p.id !== selected.id)
    if (next) setSelectedId(next.id)
  }

  return (
    <>
      <PortalHead
        title="My cohort"
        sub={`Up to 5 participants per researcher per study. Currently managing ${cohort.length}.`}
        right={(
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="pa-btn pa-btn-ghost"><Icon name="msg" size={14}/> Message cohort</button>
            <button className="pa-btn pa-btn-primary" onClick={() => setUploadOpen(true)}><Icon name="upload" size={14}/> Upload report</button>
          </div>
        )}
      />
      <div className="pa-content-body" style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 18, alignItems: 'flex-start' }}>
        <div style={{ display: 'grid', gap: 8 }}>
          {cohort.map(p => {
            const sel = p.id === selectedId
            return (
              <button key={p.id} onClick={() => setSelectedId(p.id)} className="pa-card"
                style={{
                  textAlign: 'left', cursor: 'pointer', padding: 14,
                  borderColor: sel ? 'var(--sage)' : 'var(--line)',
                  background: sel ? 'var(--sage-tint)' : 'var(--white)',
                  display: 'flex', flexDirection: 'column', gap: 8,
                  fontFamily: 'inherit',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="pa-mono" style={{ fontSize: 12 }}>{p.id}</span>
                  <span className={'pa-pill ' + (p.status === 'Active' ? 'success' : p.status === 'At-risk' ? 'danger' : 'warn')}><span className="dot"></span>{p.status}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{p.age} · {p.sex} · joined {p.joined.slice(5)}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: 'var(--ink-3)' }}>Adherence</span>
                  <span style={{ color: 'var(--ink-2)', fontFamily: 'Geist Mono, monospace' }}>{p.adherence != null ? p.adherence + '%' : '—'}</span>
                </div>
                <div style={{ height: 4, background: 'var(--cream-2)', borderRadius: 999 }}>
                  <div style={{ height: '100%', width: (p.adherence ?? 0) + '%', background: p.adherence == null ? 'var(--line)' : p.adherence > 80 ? 'var(--sage)' : p.adherence > 60 ? '#D8A24A' : '#C75A57', borderRadius: 999 }}></div>
                </div>
                {p.flags.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {p.flags.map((f, i) => <span key={i} className="pa-pill warn" style={{ fontSize: 9 }}><Icon name="flag" size={10}/>{f}</span>)}
                  </div>
                )}
              </button>
            )
          })}
          {cohort.length < 5 && (
            <button className="pa-card" style={{ borderStyle: 'dashed', textAlign: 'center', cursor: 'pointer', color: 'var(--ink-3)', fontSize: 13, padding: 18, background: 'transparent' }}>
              <Icon name="plus2" size={14}/> Add participant ({5 - cohort.length} slot{5 - cohort.length === 1 ? '' : 's'} free)
            </button>
          )}
        </div>

        {selected ? (
          <div style={{ display: 'grid', gap: 14 }}>
            <div className="pa-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div className="pa-mono" style={{ fontSize: 12, color: 'var(--ink-3)' }}>{selected.id}</div>
                  <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: 28, lineHeight: 1.1, marginTop: 2 }}>Participant detail</div>
                  <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 4 }}>{selected.age} · {selected.sex} · trial {selected.trial} · joined {selected.joined}</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="pa-btn pa-btn-ghost" onClick={() => setScheduleOpen(true)}><Icon name="cal" size={14}/> Schedule</button>
                  <button className="pa-btn pa-btn-danger" onClick={() => setRemoveOpen(true)}><Icon name="trash" size={14}/> Remove from trial</button>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginTop: 18 }}>
                {[
                  ['Status', selected.status],
                  ['Adherence', selected.adherence != null ? selected.adherence + '%' : '—'],
                  ['Last self-report', selected.lastReport],
                  ['Next visit', selected.nextVisit],
                ].map(([k, v]) => (
                  <div key={k} style={{ borderLeft: '1px solid var(--line)', paddingLeft: 14 }}>
                    <div className="pa-mono" style={{ fontSize: 10, letterSpacing: '0.08em', color: 'var(--ink-3)' }}>{k.toUpperCase()}</div>
                    <div style={{ fontSize: 16, marginTop: 6 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14 }}>
              <div className="pa-card">
                <div className="pa-card-head">
                  <div className="pa-card-title">Notes & flags</div>
                  <button className="pa-btn pa-btn-link"><Icon name="edit" size={12}/> Edit</button>
                </div>
                <p style={{ margin: 0, fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.6 }}>{selected.notes}</p>
                {selected.flags.length > 0 && (
                  <>
                    <div className="pa-divider"></div>
                    <div className="pa-mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.08em', marginBottom: 8 }}>ACTIVE FLAGS</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {selected.flags.map((f, i) => <span key={i} className="pa-pill warn"><Icon name="flag" size={10}/>{f}</span>)}
                    </div>
                  </>
                )}
              </div>

              <div className="pa-card">
                <div className="pa-card-head">
                  <div className="pa-card-title">Reports for {selected.id}</div>
                  <button className="pa-btn pa-btn-link" onClick={() => setUploadOpen(true)}><Icon name="upload" size={12}/> New</button>
                </div>
                {reports.filter(r => r.patient === selected.id).length === 0 ? (
                  <div style={{ fontSize: 13, color: 'var(--ink-3)', padding: 14, background: 'var(--cream-2)', borderRadius: 8 }}>No reports yet for this participant.</div>
                ) : (
                  <div style={{ display: 'grid', gap: 8 }}>
                    {reports.filter(r => r.patient === selected.id).map(r => (
                      <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', border: '1px solid var(--line)', borderRadius: 8, background: 'var(--white)' }}>
                        <span style={{ width: 30, height: 30, borderRadius: 6, background: 'var(--coral-tint)', color: 'var(--coral-2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="file" size={14}/></span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 500 }}>{r.title}</div>
                          <div className="pa-mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{r.kind} · {r.size} · {r.date}</div>
                        </div>
                        <button className="pa-iconbtn"><Icon name="eye" size={14}/></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="pa-empty">Cohort empty. Add a participant to begin.</div>
        )}
      </div>

      <PortalModal
        open={scheduleOpen}
        title={`Schedule a meeting · ${selected?.id}`}
        onClose={() => setScheduleOpen(false)}
        footer={(
          <>
            <button className="pa-btn pa-btn-ghost" onClick={() => setScheduleOpen(false)}>Cancel</button>
            <button className="pa-btn pa-btn-primary" onClick={scheduleMeeting}><Icon name="cal" size={14}/> Send invite</button>
          </>
        )}
      >
        <div className="pa-row pa-row-2" style={{ gap: 14 }}>
          <div className="pa-field">
            <label className="pa-label">Meeting type</label>
            <select className="pa-select" value={meeting.kind} onChange={(e) => setMeeting({ ...meeting, kind: e.target.value })}>
              <option>Check-in</option><option>In-person visit</option><option>Telemedicine</option><option>Lab draw</option><option>Trial onboarding</option>
            </select>
          </div>
          <div className="pa-field">
            <label className="pa-label">Date</label>
            <input type="date" className="pa-input" value={meeting.date} onChange={(e) => setMeeting({ ...meeting, date: e.target.value })}/>
          </div>
          <div className="pa-field">
            <label className="pa-label">Time</label>
            <input type="time" className="pa-input" value={meeting.time} onChange={(e) => setMeeting({ ...meeting, time: e.target.value })}/>
          </div>
          <div className="pa-field">
            <label className="pa-label">Duration</label>
            <select className="pa-select"><option>30 minutes</option><option>45 minutes</option><option>1 hour</option></select>
          </div>
        </div>
        <div className="pa-field" style={{ marginTop: 14 }}>
          <label className="pa-label">Note to participant (optional)</label>
          <textarea className="pa-textarea" placeholder="Sent through pseudonymous relay. Identity headers stripped." value={meeting.notes} onChange={(e) => setMeeting({ ...meeting, notes: e.target.value })}></textarea>
        </div>
      </PortalModal>

      <PortalModal
        open={uploadOpen}
        title="Upload a report"
        onClose={() => setUploadOpen(false)}
        footer={(
          <>
            <button className="pa-btn pa-btn-ghost" onClick={() => setUploadOpen(false)}>Cancel</button>
            <button className="pa-btn pa-btn-primary" onClick={uploadReport}><Icon name="upload" size={14}/> Upload</button>
          </>
        )}
      >
        <div className="pa-field" style={{ marginBottom: 14 }}>
          <label className="pa-label">For participant</label>
          <input className="pa-input pa-mono" value={selected?.id || ''} readOnly style={{ background: 'var(--cream-2)' }}/>
        </div>
        <div className="pa-row pa-row-2" style={{ gap: 14 }}>
          <div className="pa-field">
            <label className="pa-label">Title</label>
            <input className="pa-input" placeholder="e.g. Visit 5 — adherence summary" value={newReport.title} onChange={(e) => setNewReport({ ...newReport, title: e.target.value })}/>
          </div>
          <div className="pa-field">
            <label className="pa-label">Kind</label>
            <select className="pa-select" value={newReport.kind} onChange={(e) => setNewReport({ ...newReport, kind: e.target.value })}>
              <option>PDF</option><option>DCM</option><option>CSV</option><option>DOCX</option>
            </select>
          </div>
        </div>
        <div className="pa-drop" style={{ marginTop: 14, padding: 22 }}>
          <Icon name="upload" size={18}/>
          <div style={{ fontSize: 13, marginTop: 8 }}>Drop the file here · up to 50 MB</div>
        </div>
      </PortalModal>

      <PortalModal
        open={removeOpen}
        title={`Remove ${selected?.id} from trial?`}
        onClose={() => setRemoveOpen(false)}
        footer={(
          <>
            <button className="pa-btn pa-btn-ghost" onClick={() => setRemoveOpen(false)}>Cancel</button>
            <button className="pa-btn pa-btn-danger" onClick={removeFromTrial}><Icon name="trash" size={14}/> Remove participant</button>
          </>
        )}
      >
        <p style={{ margin: 0, fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.5 }}>
          The participant will be removed from your cohort and notified through the pseudonymous relay. Choose a reason — this is recorded in the audit log and shapes the retention policy for their data.
        </p>
        <div style={{ display: 'grid', gap: 8, marginTop: 16 }}>
          {[
            ['completed', 'Completed the trial', 'Data retained pseudonymously per protocol.'],
            ['withdrew', 'Withdrew voluntarily', 'Data deleted or retained per their consent record.'],
            ['uncooperative', 'Uncooperative / non-adherent', 'Flag added to participant record; data retained per IRB rules.'],
            ['ineligible', 'Found ineligible mid-trial', 'Reviewed by sponsor; data quarantined.'],
            ['safety', 'Removed for safety reasons', 'Triggers automatic AE report to sponsor + IRB.'],
          ].map(([id, label, sub]) => (
            <label key={id} style={{ display: 'flex', gap: 10, padding: 12, border: '1px solid ' + (removeReason === id ? 'var(--sage)' : 'var(--line-2)'), borderRadius: 10, cursor: 'pointer', background: removeReason === id ? 'var(--sage-tint)' : 'var(--white)' }}>
              <input type="radio" name="reason" checked={removeReason === id} onChange={() => setRemoveReason(id)}/>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{label}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{sub}</div>
              </div>
            </label>
          ))}
        </div>
      </PortalModal>
    </>
  )
}

function ResearcherSchedule({ cohort }) {
  const upcoming = cohort.filter(p => p.nextVisit && p.nextVisit !== 'Unscheduled')
  return (
    <>
      <PortalHead
        title="Schedule"
        sub="Upcoming visits, check-ins, and meetings with your cohort. Click any entry to message via pseudonymous relay."
        right={<button className="pa-btn pa-btn-primary"><Icon name="plus2" size={14}/> New meeting</button>}
      />
      <div className="pa-content-body">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 18 }}>
          {['Mon · May 25', 'Tue · May 26', 'Wed · May 27', 'Thu · May 28', 'Fri · May 29'].map((d) => {
            const evs = upcoming.filter((p) => p.nextVisit.startsWith(d.slice(0, 3)))
            return (
              <div key={d} className="pa-card" style={{ padding: 14, minHeight: 220 }}>
                <div className="pa-mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.06em' }}>{d.toUpperCase()}</div>
                <div style={{ display: 'grid', gap: 6, marginTop: 12 }}>
                  {evs.length === 0 && <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>No events</div>}
                  {evs.map(p => (
                    <div key={p.id} style={{ padding: 10, borderRadius: 8, background: 'var(--sage-tint)', border: '1px solid var(--sage-soft)' }}>
                      <div className="pa-mono" style={{ fontSize: 11 }}>{p.id}</div>
                      <div style={{ fontSize: 12, marginTop: 2, color: 'var(--ink-2)' }}>{p.nextVisit.split(' · ')[1]}</div>
                      <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>Check-in</div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        <div className="pa-card">
          <div className="pa-card-head">
            <div className="pa-card-title">All upcoming · this study</div>
            <span className="pa-mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{upcoming.length} scheduled</span>
          </div>
          <table className="pa-table">
            <thead><tr><th>When</th><th>Participant</th><th>Type</th><th>Channel</th><th></th></tr></thead>
            <tbody>
              {upcoming.map(p => (
                <tr key={p.id}>
                  <td className="pa-mono">{p.nextVisit}</td>
                  <td className="pa-mono">{p.id}</td>
                  <td>Check-in</td>
                  <td><span className="pa-pill info">Telemedicine</span></td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button className="pa-btn pa-btn-ghost pa-btn-sm"><Icon name="edit" size={12}/> Edit</button>
                    <button className="pa-btn pa-btn-ghost pa-btn-sm" style={{ marginLeft: 6 }}><Icon name="msg" size={12}/> Message</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

function ResearcherReports({ reports }) {
  return (
    <>
      <PortalHead
        title="Reports"
        sub="Documents you've uploaded for participants in this study. Only sponsors with consented access can view."
        right={<button className="pa-btn pa-btn-primary"><Icon name="upload" size={14}/> Upload report</button>}
      />
      <div className="pa-content-body">
        <div className="pa-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="pa-table">
            <thead><tr><th>ID</th><th>Title</th><th>Participant</th><th>Kind</th><th>Size</th><th>Uploaded</th><th></th></tr></thead>
            <tbody>
              {reports.map(r => (
                <tr key={r.id}>
                  <td className="pa-mono">{r.id}</td>
                  <td>{r.title}</td>
                  <td className="pa-mono">{r.patient}</td>
                  <td><span className="pa-pill muted">{r.kind}</span></td>
                  <td>{r.size}</td>
                  <td style={{ color: 'var(--ink-3)' }}>{r.date}</td>
                  <td><button className="pa-btn pa-btn-ghost pa-btn-sm"><Icon name="eye" size={12}/> Open</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
