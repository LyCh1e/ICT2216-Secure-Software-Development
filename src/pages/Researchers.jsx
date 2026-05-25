import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon, PhotoSlot } from '../components/shared'
import { SubpageNav, SubpageHero, SubpageFooter } from '../components/subpage-shell'

const TABS = {
  recruit: {
    title: 'Reach a verified, pre-screened cohort',
    body: 'Patients on TrialGuard have already passed identity + age + safety screening. Post your protocol, and pre-matched participants apply against your IRB criteria automatically.',
    kpi: [['38k', 'Pseudonymous patients'], ['72h', 'Median time-to-first-applicant'], ['12', 'Therapeutic areas']],
  },
  manage: {
    title: 'Manage your cohort without ever seeing a real name',
    body: 'A researcher account is scoped to one sponsor and up to 5 active participants per study. Schedule meetings, upload reports, message via a pseudonymous relay — and remove participants when needed.',
    kpi: [['5', 'Patients per researcher'], ['0', 'Identifying fields visible'], ['100%', 'Of messages metadata-stripped']],
  },
  comply: {
    title: 'Compliance, baked in',
    body: 'Every data access is cryptographically logged. Every consent decision has a timestamped audit trail. Export-ready records for FDA inspections, IRB reviews, or sponsor audits.',
    kpi: [['SOC 2', 'Type II'], ['HIPAA', 'Aligned'], ['GDPR', 'DPA on request']],
  },
}

export default function Researchers() {
  const [tab, setTab] = useState('recruit')
  const t = TABS[tab]

  return (
    <div className="tg-root">
      <SubpageNav active="For researchers" />

      <SubpageHero
        eyebrow="For pharmaceutical researchers"
        title="Recruit faster. From a cohort that actually wants to help."
        sub="TrialGuard sits between your study team and a verified pool of pseudonymous patients. You get a motivated, pre-screened cohort; they get a portal that respects their privacy. Both sides win."
        right={(
          <div className="tg-card" style={{ background: 'var(--ink)', color: 'var(--cream)', borderColor: 'var(--ink)' }}>
            <div className="tg-mono" style={{ fontSize: 11, letterSpacing: '0.1em', color: 'var(--cream-3)' }}>BY THE NUMBERS</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginTop: 14 }}>
              {[['142', 'Active trials'], ['38k', 'Patients'], ['12', 'Therapeutic areas'], ['8h', 'Avg coordinator reply']].map(([k, v]) => (
                <div key={v}>
                  <div className="tg-serif" style={{ fontSize: 36, lineHeight: 1, color: 'var(--coral)' }}>{k}</div>
                  <div style={{ fontSize: 12, color: 'var(--cream-3)', marginTop: 6 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      />

      {/* PILLARS */}
      <section style={{ padding: 'var(--tg-pad-y) var(--tg-pad-x)' }}>
        <div style={{ display: 'flex', gap: 6, padding: 6, background: 'var(--white)', borderRadius: 999, border: '1px solid var(--line)', width: 'fit-content' }}>
          {[['recruit', 'Recruit'], ['manage', 'Manage cohort'], ['comply', 'Stay compliant']].map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} className="tg-btn"
              style={{
                padding: '10px 22px', fontSize: 14, borderRadius: 999,
                background: tab === k ? 'var(--ink)' : 'transparent',
                color: tab === k ? 'var(--cream)' : 'var(--ink-2)',
              }}>{l}</button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 64, marginTop: 36, alignItems: 'flex-start' }}>
          <div>
            <h2 className="tg-serif" style={{ fontSize: 'clamp(32px, 3.6vw, 46px)', lineHeight: 1.1, margin: 0 }}>{t.title}</h2>
            <p style={{ color: 'var(--ink-2)', fontSize: 17, marginTop: 18, maxWidth: '54ch' }}>{t.body}</p>
            <div style={{ display: 'flex', gap: 40, marginTop: 28, flexWrap: 'wrap' }}>
              {t.kpi.map(([k, v]) => (
                <div key={v}>
                  <div className="tg-serif" style={{ fontSize: 44, lineHeight: 1, color: 'var(--coral)' }}>{k}</div>
                  <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 6 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
          <PhotoSlot aspect="4 / 5" label="screenshot · researcher cohort dashboard" />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: 'var(--tg-pad-y) var(--tg-pad-x)', background: 'var(--cream-2)' }}>
        <span className="tg-eyebrow"><span className="dot"></span>How partnering works</span>
        <h2 className="tg-serif" style={{ fontSize: 'clamp(32px, 3.6vw, 46px)', lineHeight: 1.1, marginTop: 14, maxWidth: '20ch' }}>
          From sponsor agreement to first enrolled participant.
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--tg-gap)', marginTop: 40 }}>
          {[
            { n: '01', t: 'Sponsor verification', s: 'We confirm your organisation against FDA/EMA registries. Typically 3–5 business days.' },
            { n: '02', t: 'Researcher provisioning', s: 'Our admin team provisions researcher accounts for your study team, scoped to your sponsor.' },
            { n: '03', t: 'Protocol & IRB upload', s: 'Drop your protocol and IRB approval letter. We map inclusion/exclusion criteria to our screener.' },
            { n: '04', t: 'Cohort assembly', s: 'Pre-matched patients see your trial, apply, consent, enroll. You get pseudonymous IDs only.' },
          ].map(s => (
            <div key={s.n} className="tg-card">
              <div className="tg-mono" style={{ fontSize: 12, color: 'var(--coral)', letterSpacing: '0.1em' }}>STEP {s.n}</div>
              <div className="tg-serif" style={{ fontSize: 22, marginTop: 8, lineHeight: 1.2 }}>{s.t}</div>
              <p style={{ color: 'var(--ink-2)', fontSize: 14, marginTop: 10 }}>{s.s}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WHAT YOU CAN / CAN'T DO */}
      <section style={{ padding: 'var(--tg-pad-y) var(--tg-pad-x)' }}>
        <span className="tg-eyebrow"><span className="dot"></span>The researcher console</span>
        <h2 className="tg-serif" style={{ fontSize: 'clamp(32px, 3.6vw, 46px)', lineHeight: 1.1, marginTop: 14, maxWidth: '24ch' }}>
          What a researcher account can and can't do.
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--tg-gap)', marginTop: 32 }}>
          <div className="tg-card" style={{ background: 'var(--sage-tint)', borderColor: 'var(--sage-soft)' }}>
            <div className="tg-mono" style={{ fontSize: 11, letterSpacing: '0.1em', color: 'var(--sage-2)' }}>CAN DO</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '14px 0 0', display: 'grid', gap: 10 }}>
              {[
                'See pseudonym IDs of cohort participants',
                'Schedule meetings, lab draws, telemed visits',
                'Upload reports against a participant ID',
                'Message participants via pseudonymous relay',
                'Remove a participant (with logged reason)',
                'View aggregated, cohort-level analytics',
                'Export consented study data',
              ].map(item => (
                <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: 'var(--ink-2)' }}>
                  <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--sage)', color: 'var(--cream)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                    <Icon name="check" size={12} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="tg-card" style={{ background: 'var(--coral-tint)', borderColor: 'var(--coral-soft)' }}>
            <div className="tg-mono" style={{ fontSize: 11, letterSpacing: '0.1em', color: 'var(--coral-2)' }}>CAN NOT DO</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '14px 0 0', display: 'grid', gap: 10 }}>
              {[
                'See any patient\'s real name, address, or contact',
                'Decrypt a patient\'s identity vault',
                'See patients outside their assigned cohort (max 5)',
                'See data points the patient hasn\'t released',
                'Contact a patient through any channel but the relay',
                'Re-identify patients by joining external datasets',
                'Edit or delete the audit log',
              ].map(item => (
                <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: 'var(--ink-2)' }}>
                  <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--coral)', color: 'var(--white)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                    <Icon name="x" size={12} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section style={{ padding: 'var(--tg-pad-y) var(--tg-pad-x)', background: 'var(--ink)', color: 'var(--cream)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.2fr', gap: 64 }}>
          <div>
            <span className="tg-eyebrow" style={{ color: 'var(--cream-3)' }}><span className="dot"></span>Pricing, in plain terms</span>
            <h2 className="tg-serif" style={{ fontSize: 'clamp(32px, 3.6vw, 46px)', lineHeight: 1.1, marginTop: 14 }}>
              Flat per-trial fee. No participant fees, ever.
            </h2>
            <p style={{ color: 'var(--cream-3)', fontSize: 15, marginTop: 14, maxWidth: '40ch' }}>
              Patients are never charged. Sponsors pay a per-trial publication fee plus a small recruitment success fee — capped per cohort.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--tg-gap)' }}>
            {[
              { n: 'Observational', p: '$3,500', sub: 'per study', items: ['Unlimited applicants', 'Up to 500 enrolled', 'Standard support'] },
              { n: 'Interventional', p: '$12,000', sub: 'per trial', items: ['Up to 200 enrolled', 'Up to 40 researcher seats', 'Priority support'] },
              { n: 'Enterprise', p: 'Talk to us', sub: 'multi-trial', items: ['Annual contract', 'Custom DPA & SLAs', 'Dedicated success team'] },
            ].map(tier => (
              <div key={tier.n} style={{ padding: 24, background: 'rgba(255,255,255,0.04)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="tg-mono" style={{ fontSize: 11, letterSpacing: '0.1em', color: 'var(--cream-3)' }}>{tier.n.toUpperCase()}</div>
                <div className="tg-serif" style={{ fontSize: 38, marginTop: 10, color: 'var(--coral)' }}>{tier.p}</div>
                <div style={{ fontSize: 12, color: 'var(--cream-3)', marginTop: 4 }}>{tier.sub}</div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '18px 0 0', display: 'grid', gap: 8 }}>
                  {tier.items.map(item => (
                    <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--cream)' }}>
                      <span style={{ color: 'var(--sage-soft)' }}>·</span>{item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: 'var(--tg-pad-y) var(--tg-pad-x)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 64, alignItems: 'center' }}>
          <div>
            <h2 className="tg-serif" style={{ fontSize: 'clamp(36px, 4.2vw, 56px)', lineHeight: 1.05 }}>
              Have a protocol in hand? Let's talk.
            </h2>
            <p style={{ fontSize: 17, color: 'var(--ink-2)', marginTop: 18, maxWidth: '52ch' }}>
              Send us your trial details and we'll come back within two business days with a sponsor-verification timeline, fit assessment, and an estimated time-to-cohort.
            </p>
            <div style={{ marginTop: 28, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <a href="mailto:sponsors@trialguard.health" className="tg-btn tg-btn-primary" style={{ padding: '14px 22px', textDecoration: 'none' }}>
                Request a demo <Icon name="arrow" size={16} />
              </a>
              <Link to="/login" className="tg-btn tg-btn-ghost" style={{ padding: '14px 22px', textDecoration: 'none' }}>
                Researcher sign-in
              </Link>
            </div>
          </div>
          <div className="tg-card" style={{ background: 'var(--cream-2)' }}>
            <div className="tg-mono" style={{ fontSize: 11, letterSpacing: '0.1em', color: 'var(--ink-3)' }}>VERIFIED SPONSORS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 14 }}>
              {['Helix Therapeutics', 'Arden Bio', 'Northbrook Labs', 'Solwin Pharma', 'Verity Health'].map(n => (
                <div key={n} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderTop: '1px solid var(--line)' }}>
                  <span style={{ fontFamily: 'Instrument Serif, serif', fontSize: 20 }}>{n}</span>
                  <span className="tg-chip sage"><Icon name="check" size={10} /> Verified</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <SubpageFooter />
    </div>
  )
}
