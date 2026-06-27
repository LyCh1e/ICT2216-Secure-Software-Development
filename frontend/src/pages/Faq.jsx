import { useState } from 'react'
import { Icon } from '../components/shared'
import { SubpageNav, SubpageHero, SubpageFooter } from '../components/subpage-shell'

const FAQ_GROUPS = [
  {
    id: 'getting-started',
    label: 'Getting started',
    items: [
      { q: 'Who can sign up for TrialGuard?', a: 'Anyone 18 or older can create a pseudonym ID. Some individual trials accept younger participants with a guardian; those will say so clearly on the trial page.' },
      { q: 'How long does signup take?', a: 'About 60 seconds for the pseudonym ID. The optional 30-second screener and any document uploads happen later, only if you choose.' },
      { q: 'Do I need to provide my real name?', a: 'You enter it once during signup so it can be stored in your encrypted vault — it is visible only to you. Researchers, admins, and TrialGuard staff never see it.' },
      { q: 'Is there a mobile app?', a: 'TrialGuard runs in any modern browser, mobile included. A dedicated iOS/Android app is on our roadmap for the second half of 2026.' },
    ],
  },
  {
    id: 'trials',
    label: 'Joining trials',
    items: [
      { q: 'How are trials verified?', a: 'Every sponsor is checked against the FDA and EMA registries, and the trial protocol must have a current IRB approval letter on file. We display the approval ID and the institution on each trial page.' },
      { q: 'What does paid vs. unpaid mean?', a: 'Paid trials offer a stipend covering your time and travel — listed in plain dollars on each trial card. Unpaid trials are typically observational studies (surveys, journals) with very little time commitment.' },
      { q: 'How are risk levels decided?', a: 'Risk is mapped to the FDA risk-based monitoring framework. Minimal risk means survey-style observation; Low/Medium are typical for interventional studies of approved or well-characterised treatments; High is reserved for first-in-human or experimental dosing.' },
      { q: 'Can I join more than one trial?', a: 'Yes, as long as the protocols don\'t conflict. Our system warns you if a new application would overlap a study you\'re already enrolled in.' },
      { q: 'What if a trial is far from me?', a: 'Many trials are fully remote or hybrid. Use the location and remote filters on the Active Trials page. Travel reimbursement, when offered, is listed in the trial detail.' },
    ],
  },
  {
    id: 'privacy',
    label: 'Privacy & consent',
    items: [
      { q: 'How does TrialGuard keep me anonymous?', a: 'Your name, contact, and demographics are encrypted in a vault you alone can decrypt. Researchers receive only your pseudonym ID and the specific fields you consent to share for that study.' },
      { q: 'Can researchers contact me directly?', a: 'No. All communication runs through a pseudonymous relay that strips identity headers and metadata. Researchers can message your pseudonym; the platform delivers it to you.' },
      { q: 'Can I withdraw after enrolling?', a: 'Yes, at any time, without a reason. You also choose whether your already-submitted data is retained pseudonymously for the study, or scheduled for deletion — your decision is recorded with a timestamp.' },
      { q: 'What happens if TrialGuard is hacked?', a: 'Even in a worst-case breach, an attacker would obtain only ciphertext for identity vaults — the decryption keys never leave participant devices. Our incident-response policy commits to 72-hour notification.' },
    ],
  },
  {
    id: 'support',
    label: 'Support, money & complaints',
    items: [
      { q: 'Is there compensation for participation?', a: 'Most paid trials offer a stipend covering your time and travel. Amounts are listed up front, in plain dollars, before you consent. TrialGuard does not take a cut of stipends.' },
      { q: 'How are stipends paid?', a: 'Sponsors send stipends via prepaid card. You can have the card mailed to a P.O. box or pickup location of your choice; we never receive your mailing address.' },
      { q: 'Who can I talk to with questions?', a: 'Each trial has a dedicated coordinator reachable through the relay. Average response time is under 8 hours. For platform questions, hello@trialguard.health replies within one business day.' },
      { q: 'How do I file a complaint?', a: 'In-product Settings → Report an issue. You can also email hello@trialguard.health, or contact your country\'s health-data regulator directly — we will assist with information requests.' },
    ],
  },
  {
    id: 'researchers',
    label: 'For researchers & sponsors',
    items: [
      { q: 'How do I list a trial?', a: 'Your sponsor organisation must first be verified by a TrialGuard admin. Once verified, your admin can provision researcher accounts that publish trials under your sponsor.' },
      { q: 'Can researchers see real patient names?', a: 'No. The researcher console only ever shows pseudonym IDs and the data points each participant has consented to share with that specific study.' },
      { q: 'How many participants can one researcher manage?', a: 'Up to five active participants per researcher per study. Larger trials staff multiple researchers, each with their own scoped cohort.' },
      { q: 'What does it cost?', a: 'A flat publication fee per trial plus a capped recruitment success fee. See For Researchers → Pricing for the breakdown.' },
    ],
  },
]

export default function Faq() {
  const [search, setSearch] = useState('')
  const [openId, setOpenId] = useState(null)

  const filtered = FAQ_GROUPS.map(g => ({
    ...g,
    items: g.items.filter(it => {
      if (!search) return true
      const q = search.toLowerCase()
      return (it.q + ' ' + it.a).toLowerCase().includes(q)
    }),
  })).filter(g => g.items.length > 0)

  const totalHits = filtered.reduce((n, g) => n + g.items.length, 0)

  return (
    <div className="tg-root">
      <SubpageNav active="FAQ" />

      <SubpageHero
        eyebrow="Frequently asked"
        title="The questions we hear most, answered honestly."
        sub="If you can't find what you're looking for here, email hello@trialguard.health — a human writes back within one business day."
        right={(
          <div style={{ display: 'grid', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', background: 'var(--white)', border: '1px solid var(--line-2)', borderRadius: 'var(--tg-radius)' }}>
              <Icon name="search" size={16} />
              <input
                placeholder="Search the FAQ…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ flex: 1, border: 0, outline: 'none', font: 'inherit', fontSize: 15, background: 'transparent', color: 'var(--ink)' }}
              />
            </div>
            {search && (
              <div className="tg-mono" style={{ fontSize: 12, color: 'var(--ink-3)' }}>
                {totalHits} match{totalHits === 1 ? '' : 'es'} for "{search}"
              </div>
            )}
          </div>
        )}
      />

      <section style={{ padding: 'var(--tg-pad-y) var(--tg-pad-x)' }}>
        {filtered.length === 0 ? (
          <div className="pa-empty">
            <Icon name="search" size={20} />
            <div style={{ marginTop: 10, color: 'var(--ink-2)', fontSize: 14 }}>No matches for "{search}". Try a different keyword, or email us.</div>
          </div>
        ) : (
          <div className="tg-faq-grid" style={{ display: 'grid', gridTemplateColumns: '0.4fr 1.6fr', gap: 64 }}>
            <aside className="tg-faq-sidebar">
              <div className="tg-mono" style={{ fontSize: 11, letterSpacing: '0.1em', color: 'var(--ink-3)', marginBottom: 14 }}>BROWSE BY TOPIC</div>
              <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 4 }}>
                {filtered.map(g => (
                  <li key={g.id}>
                    <a
                      href={'#' + g.id}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: 8, color: 'var(--ink-2)', fontSize: 14, textDecoration: 'none' }}
                      onMouseOver={(e) => e.currentTarget.style.background = 'var(--cream-2)'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <span>{g.label}</span>
                      <span className="tg-mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{g.items.length}</span>
                    </a>
                  </li>
                ))}
              </ol>
              <div style={{ marginTop: 28, padding: 18, background: 'var(--coral-tint)', border: '1px solid var(--coral-soft)', borderRadius: 'var(--tg-radius)' }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--coral-2)' }}>Still stuck?</div>
                <p style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 6, lineHeight: 1.5 }}>
                  Reach a human at <span className="tg-mono">hello@trialguard.health</span> — replies inside one business day.
                </p>
              </div>
            </aside>

            <div style={{ display: 'grid', gap: 56 }}>
              {filtered.map(g => (
                <div key={g.id} id={g.id}>
                  <h2 className="tg-serif" style={{ fontSize: 'clamp(28px, 3.2vw, 38px)', lineHeight: 1.1, marginBottom: 18 }}>{g.label}</h2>
                  <div className="tg-acc">
                    {g.items.map((it, i) => {
                      const id = g.id + '.' + i
                      const isOpen = openId === id
                      return (
                        <div className="tg-acc-item" key={id} data-open={isOpen ? '' : undefined}>
                          <button className="tg-acc-head" onClick={() => setOpenId(isOpen ? null : id)} aria-expanded={isOpen}>
                            <span style={{ paddingRight: 24 }}>{it.q}</span>
                            <span className="tg-acc-icon">
                              <Icon name={isOpen ? 'minus' : 'plus'} size={14} />
                            </span>
                          </button>
                          <div className="tg-acc-body" style={{ maxHeight: isOpen ? 400 : 0, transition: 'max-height 280ms ease' }}>
                            <div className="tg-acc-body-inner">{it.a}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <SubpageFooter />
    </div>
  )
}
