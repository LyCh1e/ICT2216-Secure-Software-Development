import { useState } from 'react'
import { Icon } from '../components/shared'
import { PortalTopbar, PortalSide, PortalHead, PortalModal } from '../components/portal-shell'
import { PORTAL_DOCS, PORTAL_TRIALS } from '../data/portal'

export default function PatientPortal() {
  const [tab, setTab] = useState('profile')
  const NAV = [
    { id: 'profile', label: 'Profile', icon: 'users' },
    { id: 'documents', label: 'Documents', icon: 'file' },
    { id: 'trials', label: 'Browse trials', icon: 'pill' },
    { id: 'privacy', label: 'Privacy & consent', icon: 'lock' },
  ]

  return (
    <div className="pa-root">
      <PortalTopbar role="patient" who="PT-4F8A-2K"/>
      <div className="pa-main">
        <PortalSide
          items={NAV}
          value={tab}
          onChange={setTab}
          footer={(
            <div style={{ padding: 14, background: 'var(--sage-tint)', borderRadius: 10, border: '1px solid var(--sage-soft)' }}>
              <div className="pa-mono" style={{ fontSize: 10, color: 'var(--sage-2)', letterSpacing: '0.1em' }}>PRIVACY MODE</div>
              <div style={{ fontSize: 12, marginTop: 4, color: 'var(--ink-2)', lineHeight: 1.45 }}>
                Your real name is visible only to you. Researchers see only your pseudonym.
              </div>
            </div>
          )}
        />
        <div className="pa-content">
          {tab === 'profile' && <PatientProfile/>}
          {tab === 'documents' && <PatientDocuments/>}
          {tab === 'trials' && <PatientTrials/>}
          {tab === 'privacy' && <PatientPrivacy/>}
        </div>
      </div>
    </div>
  )
}

function PatientProfile() {
  const [form, setForm] = useState({
    name: 'Riley Carver',
    age: '34',
    sex: 'Female',
    issues: ['Insomnia', 'Migraine'],
  })
  const [issuesOpen, setIssuesOpen] = useState(true)
  const [savedToast, setSavedToast] = useState(false)

  const ALL_ISSUES = ['Insomnia', 'Migraine', 'Anxiety', 'Depression', 'Type-2 diabetes', 'Hypertension', 'Asthma', 'Chronic pain', 'GERD']

  function update(k, v) { setForm(f => ({ ...f, [k]: v })) }
  function toggleIssue(i) {
    setForm(f => ({ ...f, issues: f.issues.includes(i) ? f.issues.filter(x => x !== i) : [...f.issues, i] }))
  }
  function save() {
    setSavedToast(true)
    setTimeout(() => setSavedToast(false), 2400)
  }

  return (
    <>
      <PortalHead
        title="Your profile"
        sub="Visible only to you. Each study requests only the specific fields it needs — you approve them one at a time."
        right={(
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {savedToast && (
              <span className="pa-toast"><Icon name="check" size={14}/> Saved · researchers still only see your pseudonym.</span>
            )}
            <button className="pa-btn pa-btn-ghost">Cancel</button>
            <button className="pa-btn pa-btn-primary" onClick={save}><Icon name="check" size={14}/> Save changes</button>
          </div>
        )}
      />
      <div className="pa-content-body">
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20 }}>
          <div style={{ display: 'grid', gap: 20 }}>
            <div className="pa-card">
              <div className="pa-card-head">
                <div>
                  <div className="pa-card-title">Identity</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>Never shared with researchers.</div>
                </div>
                <span className="pa-pill success"><span className="dot"></span>Private to you</span>
              </div>
              <div className="pa-row pa-row-2">
                <div className="pa-field">
                  <label className="pa-label">Legal name</label>
                  <input className="pa-input" value={form.name} onChange={(e) => update('name', e.target.value)}/>
                  <div className="pa-help">Stored in your encrypted vault — never visible to a study team.</div>
                </div>
                <div className="pa-field">
                  <label className="pa-label">Pseudonym ID</label>
                  <input className="pa-input pa-mono" value="PT-4F8A-2K" readOnly style={{ background: 'var(--cream-2)', cursor: 'not-allowed' }}/>
                  <div className="pa-help">This is what researchers see. Auto-generated, immutable.</div>
                </div>
              </div>
              <div className="pa-row pa-row-2" style={{ marginTop: 14 }}>
                <div className="pa-field">
                  <label className="pa-label">Age</label>
                  <input className="pa-input" value={form.age} onChange={(e) => update('age', e.target.value)} inputMode="numeric"/>
                </div>
                <div className="pa-field">
                  <label className="pa-label">Sex at birth</label>
                  <select className="pa-select" value={form.sex} onChange={(e) => update('sex', e.target.value)}>
                    <option>Female</option><option>Male</option><option>Intersex</option><option>Prefer not to say</option>
                  </select>
                  <div className="pa-help">Required by most trials for safe dosing. Shared only on consent.</div>
                </div>
              </div>
            </div>

            <div className="pa-card">
              <div className="pa-card-head">
                <div>
                  <div className="pa-card-title">Medical issues</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>List below, or upload your medical history in Documents.</div>
                </div>
                <button className="pa-btn pa-btn-link" onClick={() => setIssuesOpen(!issuesOpen)}>{issuesOpen ? 'Hide' : 'Show'}</button>
              </div>
              {issuesOpen && (
                <>
                  <label className="pa-label">Conditions you've been diagnosed with</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
                    {ALL_ISSUES.map(i => (
                      <button key={i} className="pa-chip-pick" data-on={form.issues.includes(i)} onClick={() => toggleIssue(i)}>
                        {form.issues.includes(i) && <Icon name="check" size={12}/>}
                        {i}
                      </button>
                    ))}
                  </div>
                  <label className="pa-label">Other notes (optional)</label>
                  <textarea className="pa-textarea" placeholder="Anything else a study coordinator should know — medications, allergies, recent procedures…"></textarea>
                </>
              )}
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
                    Your name, address, and contact details stay encrypted in a vault keyed to <span className="pa-mono">PT-4F8A-2K</span>. Trial sponsors, researchers, and admins cannot decrypt it — only you can.
                  </div>
                </div>
              </div>
            </div>

            <div className="pa-card">
              <div className="pa-card-title" style={{ marginBottom: 14 }}>Permission summary</div>
              <div style={{ display: 'grid', gap: 10 }}>
                {[
                  ['Real name', 'Visible only to you', 'success'],
                  ['Age', 'Shared per consent', 'info'],
                  ['Sex at birth', 'Shared per consent', 'info'],
                  ['Medical issues', 'Shared per study', 'info'],
                  ['Uploaded documents', 'Shared per study', 'info'],
                ].map(([k, v, p]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderTop: '1px solid var(--line)' }}>
                    <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>{k}</span>
                    <span className={'pa-pill ' + p}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ fontSize: 11, color: 'var(--ink-3)', textAlign: 'center' }}>
              Need to delete everything? <span className="pa-link">Request full erasure →</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

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
                <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>PDF, JPG, PNG, DICOM · up to 50 MB · encrypted on upload</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 10 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>Your documents</div>
              <div className="pa-mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{docs.length} files · {docs.reduce((n, d) => n + parseFloat(d.size), 0).toFixed(1)} MB total</div>
            </div>
            <div style={{ display: 'grid', gap: 8 }}>
              {docs.map(d => (
                <div key={d.id} className="pa-doc">
                  <div className="pa-doc-icn"><Icon name="file" size={16}/></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>
                      <span className="pa-mono">{d.kind}</span> · {d.size} · uploaded {d.uploaded}
                    </div>
                  </div>
                  <span className="pa-pill muted">{d.tag}</span>
                  <button className="pa-iconbtn" title="Preview"><Icon name="eye" size={14}/></button>
                  <button className="pa-iconbtn" title="Remove" onClick={() => remove(d.id)}><Icon name="trash" size={14}/></button>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gap: 20 }}>
            <div className="pa-card">
              <div className="pa-card-title" style={{ marginBottom: 12 }}>Who can see these?</div>
              <p style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.55, margin: 0 }}>
                Documents stay in your vault by default. When you apply to a study, you'll be asked which documents — if any — to attach to that application. The researcher only sees what you attach.
              </p>
              <div className="pa-divider"></div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', display: 'grid', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Currently shared</span><span className="pa-mono">0 / {docs.length}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Encryption</span><span className="pa-mono">AES-256-GCM</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Vault key</span><span className="pa-mono">derived from passphrase</span></div>
              </div>
            </div>

            <div className="pa-card" style={{ background: 'var(--coral-tint)', borderColor: 'var(--coral-soft)' }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--coral-2)' }}>Tip · One file is enough</div>
              <p style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 6, lineHeight: 1.5 }}>
                Most studies just need a one-page recent medical summary from your primary care physician. You don't have to upload every record.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function PatientTrials() {
  const [paid, setPaid] = useState('all')
  const [risk, setRisk] = useState('any')
  const [area, setArea] = useState('All')

  const areas = ['All', ...Array.from(new Set(PORTAL_TRIALS.map(t => t.tag)))]

  const filtered = PORTAL_TRIALS.filter(t =>
    (paid === 'all' || (paid === 'paid' ? t.paid : !t.paid)) &&
    (risk === 'any' || t.risk.toLowerCase() === risk) &&
    (area === 'All' || t.tag === area)
  )

  return (
    <>
      <PortalHead
        title="Browse trials"
        sub={`${filtered.length} of ${PORTAL_TRIALS.length} verified trials match your filters. Paid trials show a risk level — read it carefully.`}
        right={(
          <div className="pa-tabs">
            <button className="pa-tab" data-active={paid === 'all'} onClick={() => setPaid('all')}>All</button>
            <button className="pa-tab" data-active={paid === 'paid'} onClick={() => setPaid('paid')}>Paid</button>
            <button className="pa-tab" data-active={paid === 'unpaid'} onClick={() => setPaid('unpaid')}>Unpaid</button>
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
          <span style={{ width: 1, height: 22, background: 'var(--line)', margin: '0 8px' }}></span>
          <span className="pa-mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.1em' }}>AREA</span>
          <select className="pa-select" style={{ width: 'auto' }} value={area} onChange={(e) => setArea(e.target.value)}>
            {areas.map(a => <option key={a}>{a}</option>)}
          </select>
          <div style={{ flex: 1 }}></div>
          <span className="pa-mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>Sort: Newest →</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          {filtered.map(t => (
            <div key={t.id} className="pa-card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div>
                  <div className="pa-mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{t.id} · {t.sponsor}</div>
                  <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: 22, lineHeight: 1.15, marginTop: 2 }}>{t.plain}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{t.clinical}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                  <span className={'pa-pill ' + (t.paid ? 'success' : 'muted')}>{t.paid ? 'Paid · ' + t.stipend : 'Unpaid'}</span>
                  <span className="pa-risk" data-level={t.risk.toLowerCase()}>{t.risk} risk</span>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, fontSize: 12 }}>
                <div><div style={{ color: 'var(--ink-3)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Duration</div><div style={{ marginTop: 2 }}>{t.duration}</div></div>
                <div><div style={{ color: 'var(--ink-3)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Location</div><div style={{ marginTop: 2 }}>{t.location}</div></div>
                <div><div style={{ color: 'var(--ink-3)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Spots left</div><div style={{ marginTop: 2 }}>{t.spots}</div></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--line)', paddingTop: 12 }}>
                <span className="pa-pill muted">{t.tag}</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="pa-btn pa-btn-ghost pa-btn-sm">Details</button>
                  <button className="pa-btn pa-btn-primary pa-btn-sm">Apply <Icon name="arrow" size={12}/></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

function PatientPrivacy() {
  return (
    <>
      <PortalHead title="Privacy & consent" sub="See what you've shared with each active study, and revoke at any time."/>
      <div className="pa-content-body">
        <div className="pa-empty">
          <Icon name="lock" size={20}/>
          <div style={{ marginTop: 10, color: 'var(--ink-2)', fontSize: 14 }}>No active consents yet. Apply to a trial to see them here.</div>
        </div>
      </div>
    </>
  )
}
