import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../components/shared'
import { SubpageNav, SubpageHero, SubpageFooter } from '../components/subpage-shell'

const TG_TRIALS_FULL = [
  { id: 'NCT-2841', plain: 'New sleep medication', clinical: 'Phase II · Insomnia disorder', duration: '12 weeks', stipend: '$1,200', spots: 47, location: 'Remote + 2 in-person', tag: 'Sleep', sponsor: 'Helix Therapeutics', risk: 'Low', paid: true },
  { id: 'NCT-3017', plain: 'Migraine prevention device', clinical: 'Phase III · Chronic migraine', duration: '6 months', stipend: '$2,400', spots: 12, location: 'Boston, MA', tag: 'Neurology', sponsor: 'Arden Bio', risk: 'Medium', paid: true },
  { id: 'NCT-1929', plain: 'Anxiety therapy program', clinical: 'Phase II · GAD adjunctive', duration: '8 weeks', stipend: '$900', spots: 31, location: 'Fully remote', tag: 'Mental health', sponsor: 'Northbrook Labs', risk: 'Low', paid: true },
  { id: 'NCT-4402', plain: 'Type-2 diabetes nutrition', clinical: 'Phase IV · T2DM lifestyle', duration: '16 weeks', stipend: '$1,600', spots: 22, location: 'Chicago, IL', tag: 'Metabolic', sponsor: 'Solwin Pharma', risk: 'Medium', paid: true },
  { id: 'NCT-5512', plain: 'Experimental oncology infusion', clinical: 'Phase I · Solid tumor', duration: '24 weeks', stipend: '$4,800', spots: 6, location: 'Houston, TX', tag: 'Oncology', sponsor: 'Arden Bio', risk: 'High', paid: true },
  { id: 'NCT-6107', plain: 'Asthma inhaler comparison', clinical: 'Phase III · Mild–moderate asthma', duration: '14 weeks', stipend: '$1,400', spots: 38, location: 'Atlanta, GA', tag: 'Respiratory', sponsor: 'Helix Therapeutics', risk: 'Low', paid: true },
  { id: 'NCT-3344', plain: 'Post-stroke rehabilitation app', clinical: 'Phase II · Mild stroke recovery', duration: '20 weeks', stipend: '$2,000', spots: 18, location: 'Remote + weekly visits', tag: 'Neurology', sponsor: 'Verity Health', risk: 'Medium', paid: true },
  { id: 'NCT-7711', plain: 'Vitamin D & mood research', clinical: 'Phase IV · Seasonal affective', duration: '12 weeks', stipend: '$700', spots: 64, location: 'Fully remote', tag: 'Mental health', sponsor: 'Northbrook Labs', risk: 'Minimal', paid: true },
  { id: 'OBS-7710', plain: 'Long-term migraine journal', clinical: 'Observational · 12 months', duration: '12 months', stipend: 'Unpaid', spots: 200, location: 'Fully remote', tag: 'Neurology', sponsor: 'Verity Health', risk: 'Minimal', paid: false },
  { id: 'OBS-2244', plain: 'Sleep habits survey', clinical: 'Observational · 4 weeks', duration: '4 weeks', stipend: 'Unpaid', spots: 500, location: 'Fully remote', tag: 'Sleep', sponsor: 'Helix Therapeutics', risk: 'Minimal', paid: false },
  { id: 'OBS-9081', plain: 'Mental wellness check-in study', clinical: 'Observational · 8 weeks', duration: '8 weeks', stipend: 'Unpaid', spots: 150, location: 'Fully remote', tag: 'Mental health', sponsor: 'Northbrook Labs', risk: 'Minimal', paid: false },
  { id: 'OBS-3399', plain: 'Walking & blood-sugar registry', clinical: 'Observational · 6 months', duration: '6 months', stipend: 'Unpaid', spots: 320, location: 'Fully remote', tag: 'Metabolic', sponsor: 'Solwin Pharma', risk: 'Minimal', paid: false },
]

const AREAS = ['All', ...Array.from(new Set(TG_TRIALS_FULL.map(t => t.tag)))]

export default function Trials() {
  const [paid, setPaid] = useState('all')
  const [risk, setRisk] = useState('any')
  const [area, setArea] = useState('All')
  const [search, setSearch] = useState('')

  const filtered = TG_TRIALS_FULL.filter(t => {
    if (paid !== 'all' && (paid === 'paid' ? !t.paid : t.paid)) return false
    if (risk !== 'any' && t.risk.toLowerCase() !== risk) return false
    if (area !== 'All' && t.tag !== area) return false
    if (search && !(t.plain + t.id + t.sponsor).toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="tg-root">
      <SubpageNav active="Active trials" />

      <SubpageHero
        eyebrow={`142 active · ${filtered.length} shown`}
        title="Verified clinical trials, currently recruiting."
        sub="Every study below has a confirmed IRB approval letter on file and an active sponsor verified against FDA & EMA registries. Filter by what fits your time, location, and risk tolerance."
        right={(
          <div className="tg-card" style={{ background: 'var(--white)' }}>
            <div className="tg-eyebrow" style={{ marginBottom: 10 }}><span className="dot"></span>BEFORE YOU APPLY</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10, fontSize: 14, color: 'var(--ink-2)' }}>
              {[
                'You always browse anonymously',
                'No personal data shared until you consent',
                'Withdraw any time — your call',
              ].map(item => (
                <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--sage)', color: 'var(--cream)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="check" size={13} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      />

      {/* FILTERS */}
      <section style={{ padding: '32px var(--tg-pad-x) 0' }}>
        <div className="tg-filters-row" style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 999, flex: '1 1 300px', maxWidth: 420 }}>
            <Icon name="search" size={14} />
            <input
              placeholder="Search by study, sponsor, or NCT ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ flex: 1, border: 0, background: 'transparent', outline: 'none', font: 'inherit', fontSize: 14, color: 'var(--ink)' }}
            />
          </div>

          <div style={{ display: 'flex', gap: 6, padding: 4, background: 'var(--white)', borderRadius: 999, border: '1px solid var(--line)' }}>
            {[['all', 'All'], ['paid', 'Paid'], ['unpaid', 'Unpaid']].map(([k, l]) => (
              <button key={k} onClick={() => setPaid(k)} className="tg-btn"
                style={{
                  padding: '8px 14px', fontSize: 13, borderRadius: 999,
                  background: paid === k ? 'var(--ink)' : 'transparent',
                  color: paid === k ? 'var(--cream)' : 'var(--ink-2)',
                }}>{l}</button>
            ))}
          </div>

          <select className="pa-select" style={{ width: 'auto', borderRadius: 999, padding: '10px 16px' }} value={area} onChange={(e) => setArea(e.target.value)}>
            {AREAS.map(a => <option key={a}>{a}</option>)}
          </select>
        </div>
        <div className="tg-filters-row" style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 18 }}>
          <span className="tg-mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.08em' }}>RISK</span>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['any', 'minimal', 'low', 'medium', 'high'].map(r => (
              <button key={r} className="pa-chip-pick" data-on={risk === r} onClick={() => setRisk(r)}>
                {r === 'any' ? 'Any' : r[0].toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* TABLE */}
      <section style={{ padding: '0 var(--tg-pad-x) var(--tg-pad-y)' }}>
        {filtered.length === 0 ? (
          <div className="pa-empty">
            <Icon name="search" size={20} />
            <div style={{ marginTop: 10, color: 'var(--ink-2)', fontSize: 14 }}>No trials match your filters. Try clearing one.</div>
          </div>
        ) : (
          <><div className="tg-trials-table" style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--tg-radius)', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '90px 2fr 1.1fr 0.8fr 0.8fr 0.8fr 0.8fr 110px', padding: '14px 22px', background: 'var(--cream-2)', borderBottom: '1px solid var(--line)', fontFamily: 'Geist Mono, monospace', fontSize: 11, letterSpacing: '0.08em', color: 'var(--ink-3)', textTransform: 'uppercase' }}>
              <span>ID</span><span>Study</span><span>Sponsor</span><span>Length</span><span>Stipend</span><span>Risk</span><span>Location</span><span>Action</span>
            </div>
            {filtered.map((t, i) => (
              <div key={t.id} style={{ display: 'grid', gridTemplateColumns: '90px 2fr 1.1fr 0.8fr 0.8fr 0.8fr 0.8fr 110px', padding: '18px 22px', borderTop: i === 0 ? 'none' : '1px solid var(--line)', alignItems: 'center', fontSize: 14 }}>
                <span className="tg-mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{t.id}</span>
                <div>
                  <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: 20, lineHeight: 1.15 }}>{t.plain}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{t.clinical}</div>
                </div>
                <span style={{ color: 'var(--ink-2)', fontSize: 13 }}>{t.sponsor}</span>
                <span style={{ color: 'var(--ink-2)', fontSize: 13 }}>{t.duration}</span>
                <span style={{ fontSize: 13, color: t.paid ? 'var(--ink)' : 'var(--ink-3)' }}>{t.stipend}</span>
                <span><span className="pa-risk" data-level={t.risk.toLowerCase()}>{t.risk}</span></span>
                <span style={{ color: 'var(--ink-2)', fontSize: 12 }}>{t.location}</span>
                <Link to="/signup" className="tg-btn tg-btn-ghost" style={{ padding: '6px 14px', fontSize: 12, textDecoration: 'none' }}>
                  Apply <Icon name="arrow" size={12} />
                </Link>
              </div>
            ))}
          </div>
          {/* Mobile cards */}
          <div className="tg-trials-cards" style={{ display: 'none' }}>
            {filtered.map((t) => (
              <div key={t.id} className="tg-card" style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: 20, lineHeight: 1.15 }}>{t.plain}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{t.clinical}</div>
                  </div>
                  <span className="pa-risk" data-level={t.risk.toLowerCase()}>{t.risk}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13, color: 'var(--ink-2)', margin: '12px 0' }}>
                  <span><strong>Sponsor:</strong> {t.sponsor}</span>
                  <span><strong>Length:</strong> {t.duration}</span>
                  <span><strong>Stipend:</strong> {t.stipend}</span>
                  <span><strong>Location:</strong> {t.location}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                  <span className="tg-mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{t.id} · {t.spots} spots</span>
                  <Link to="/signup" className="tg-btn tg-btn-ghost" style={{ padding: '8px 16px', fontSize: 13, textDecoration: 'none' }}>
                    Apply <Icon name="arrow" size={12} />
                  </Link>
                </div>
              </div>
            ))}
          </div></>
        )}
        <div style={{ marginTop: 18, display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--ink-3)' }}>
          <span>Showing <strong>{filtered.length}</strong> of {TG_TRIALS_FULL.length}. Filters update live; no info is stored until you create a pseudonym.</span>
          <span className="tg-mono">refreshed today</span>
        </div>
      </section>

      <SubpageFooter />
    </div>
  )
}
