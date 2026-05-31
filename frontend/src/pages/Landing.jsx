import { useState } from 'react'
import lockprofileImg from '../../media/lock-icon.jpg'
import relaxImg from '../../media/relax.png'
import { Link } from 'react-router-dom'
import { TgLogo, Icon, PhotoSlot, FaqList, EmailCapture, EligibilityQuiz, Modal, TrialCard } from '../components/shared'
import { TG_TRIALS, TG_STEPS, TG_STATS, TG_QUOTES } from '../data/landing'

export default function Landing() {
  const [modal, setModal] = useState(false)
  return (
    <div className="tg-root" data-variant="editorial">
      {/* NAV */}
      <nav className="tg-nav">
        <TgLogo/>
        <div className="tg-nav-links">
          <a href="#how" style={{ textDecoration: 'none', color: 'inherit' }}>How it works</a>
          <Link to="/trials" style={{ textDecoration: 'none', color: 'inherit' }}>Active trials</Link>
          <Link to="/privacy" style={{ textDecoration: 'none', color: 'inherit' }}>Privacy</Link>
          <Link to="/researchers" style={{ textDecoration: 'none', color: 'inherit' }}>For researchers</Link>
          <Link to="/faq" style={{ textDecoration: 'none', color: 'inherit' }}>FAQ</Link>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/login" className="tg-btn tg-btn-ghost" style={{ padding: '10px 16px', fontSize: 14, textDecoration: 'none' }}>Sign in</Link>
          <Link to="/signup" className="tg-btn tg-btn-primary" style={{ padding: '10px 18px', fontSize: 14, textDecoration: 'none' }}>Get a pseudonym</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ padding: 'calc(var(--tg-pad-y) * 0.9) var(--tg-pad-x) var(--tg-pad-y)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: 64, alignItems: 'center' }}>
          <div>
            <span className="tg-eyebrow"><span className="dot"></span>Anonymous · IRB-verified · Patient-first</span>
            <h1 className="tg-serif" style={{ fontSize: 'clamp(56px, 6.4vw, 96px)', lineHeight: 1.02, letterSpacing: '-0.015em', margin: '20px 0 24px' }}>
              Join a clinical trial<br/>without giving up<br/><em style={{ color: 'var(--coral)' }}>who you are.</em>
            </h1>
            <p style={{ fontSize: 'calc(20px * var(--tg-text-scale))', color: 'var(--ink-2)', maxWidth: '52ch', lineHeight: 1.55 }}>
              TrialGuard is a participant portal for medical research. You browse, qualify, and enroll under a pseudonymous ID — only the data each study needs is ever shared, and only after you consent.
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 32, alignItems: 'center', flexWrap: 'wrap' }}>
              <Link to="/signup" className="tg-btn tg-btn-primary" style={{ padding: '16px 24px', textDecoration: 'none' }}>
                Take the eligibility check
                <Icon name="arrow" size={16}/>
              </Link>
              <button className="tg-btn tg-btn-ghost" onClick={() => setModal(true)} style={{ padding: '16px 22px' }}>
                <Icon name="play" size={14}/> Watch a 2-min overview
              </button>
            </div>
            <div style={{ marginTop: 36, display: 'flex', gap: 28, flexWrap: 'wrap', alignItems: 'center', color: 'var(--ink-3)', fontSize: 13 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><span className="tg-pulse"></span>142 active trials this week</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><Icon name="shield" size={14}/> HIPAA + GDPR aligned</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><Icon name="users" size={14}/> 38k pseudonymous participants</span>
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <img src={lockprofileImg} alt="Researcher and participant" style={{ width: '100%', aspectRatio: '1 / 1', objectFit: 'cover', borderRadius: 'calc(var(--tg-radius) * 2)', display: 'block' }} />
            <div className="tg-card" style={{ position: 'absolute', left: -40, bottom: 30, width: 280, padding: 18, boxShadow: '0 18px 40px -16px rgba(28,24,20,0.25)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--sage-tint)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--sage-2)' }}><Icon name="lock" size={16}/></span>
                <div>
                  <div className="tg-mono" style={{ fontSize: 11, letterSpacing: '0.08em', color: 'var(--ink-3)' }}>YOUR PSEUDONYM</div>
                  <div className="tg-mono" style={{ fontSize: 18, letterSpacing: '0.04em' }}>PT-4F8A-2K</div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>This is the only thing researchers see.</div>
            </div>
          </div>
        </div>
      </section>

      {/* STORY */}
      <section style={{ padding: 'var(--tg-pad-y) var(--tg-pad-x)', background: 'var(--cream-2)' }}>
        <div style={{ maxWidth: 880 }}>
          <span className="tg-eyebrow"><span className="dot"></span>What this actually means</span>
          <h2 className="tg-serif" style={{ fontSize: 'clamp(36px, 4.2vw, 56px)', lineHeight: 1.1, margin: '14px 0 22px' }}>
            Real research depends on real people. The way that data gets collected shouldn't feel like a tradeoff.
          </h2>
          <p style={{ fontSize: 'calc(19px * var(--tg-text-scale))', color: 'var(--ink-2)', maxWidth: '60ch', lineHeight: 1.6 }}>
            Most participant portals ask for your name, your email, your insurance, and a list of medications — before you've agreed to anything. TrialGuard inverts that. You sign up with a pseudonym; each study requests the specific data it needs; you say yes or no, one item at a time.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--tg-gap)', marginTop: 56 }}>
          {TG_STATS.map((s, i) => (
            <div key={i} style={{ paddingTop: 20, borderTop: '1px solid var(--line-2)' }}>
              <div className="tg-serif" style={{ fontSize: 'clamp(42px, 4.2vw, 56px)', lineHeight: 1 }}>{s.k}</div>
              <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 8 }}>{s.v}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={{ padding: 'var(--tg-pad-y) var(--tg-pad-x)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '0.7fr 1.3fr', gap: 80 }}>
          <div style={{ position: 'sticky', top: 100, alignSelf: 'flex-start' }}>
            <span className="tg-eyebrow"><span className="dot"></span>How it works</span>
            <h2 className="tg-serif" style={{ fontSize: 'clamp(36px, 4vw, 52px)', lineHeight: 1.08, margin: '14px 0 18px' }}>
              Four small steps, and you're in.
            </h2>
            <p style={{ color: 'var(--ink-2)', fontSize: 16, maxWidth: '36ch' }}>
              Typical onboarding takes under nine minutes. You can stop, walk away, and come back later — your progress is saved against your pseudonym, not your name.
            </p>
          </div>
          <div>
            {TG_STEPS.map((step, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: 24, padding: '28px 0', borderTop: '1px solid var(--line)' }}>
                <div className="tg-serif" style={{ fontSize: 44, color: 'var(--coral)', lineHeight: 1 }}>{step.n}</div>
                <div>
                  <div className="tg-serif" style={{ fontSize: 26, lineHeight: 1.15 }}>{step.label}</div>
                  <p style={{ color: 'var(--ink-2)', marginTop: 8, fontSize: 15, maxWidth: '54ch' }}>{step.plain}</p>
                  <p className="tg-mono" style={{ color: 'var(--ink-3)', marginTop: 6, fontSize: 12, letterSpacing: '0.04em' }}>{step.clinical}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ELIGIBILITY + TRIALS */}
      <section style={{ padding: 'var(--tg-pad-y) var(--tg-pad-x)', background: 'var(--sage-tint)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'start' }}>
          <div>
            <span className="tg-eyebrow"><span className="dot"></span>30-second screener</span>
            <h2 className="tg-serif" style={{ fontSize: 'clamp(34px, 3.6vw, 48px)', lineHeight: 1.1, margin: '14px 0 18px' }}>
              See if anything fits, before you sign up.
            </h2>
            <p style={{ color: 'var(--ink-2)', fontSize: 16, maxWidth: '44ch' }}>
              Three multiple-choice questions. We don't save anything to a profile yet — answers stay in your browser until you decide.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '28px 0 0', display: 'grid', gap: 10, color: 'var(--ink-2)', fontSize: 15 }}>
              {['No name or email required for the screener', 'Each question can be skipped', 'Results are visible only to you'].map((t, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--sage)', color: 'var(--cream)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="check" size={14}/></span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <EligibilityQuiz/>
        </div>

        <div style={{ marginTop: 72 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
            <h3 className="tg-serif" style={{ fontSize: 32 }}>A sample of what's active right now</h3>
            <a className="tg-link">Browse all 142 trials <Icon name="arrow" size={14}/></a>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--tg-gap)' }}>
            {TG_TRIALS.slice(0, 4).map((t) => <TrialCard key={t.id} trial={t}/>)}
          </div>
        </div>
      </section>

      {/* PRIVACY DETAIL */}
      <section style={{ padding: 'var(--tg-pad-y) var(--tg-pad-x)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 80, alignItems: 'center' }}>
          <img src={relaxImg} alt="Person reading on a sunlit sofa" style={{ width: '100%', aspectRatio: '3 / 2', objectFit: 'cover', borderRadius: 'calc(var(--tg-radius) * 2)', display: 'block' }} />
          <div>
            <span className="tg-eyebrow"><span className="dot"></span>Quietly, by default</span>
            <h2 className="tg-serif" style={{ fontSize: 'clamp(34px, 3.6vw, 48px)', lineHeight: 1.1, margin: '14px 0 22px' }}>
              Built so the careful thing is also the easy thing.
            </h2>
            <p style={{ color: 'var(--ink-2)', fontSize: 17, maxWidth: '54ch', marginBottom: 24 }}>
              Every consent screen is plain English. Every data request is shown line-by-line, with the option to share, skip, or redact. Withdraw at any time and your records get deleted or pseudonymized — your call, on the same screen.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
              {[
                { i: 'lock', t: 'End-to-end encrypted vault', s: 'Real identity never visible to research teams.' },
                { i: 'eye', t: 'Granular data consent', s: 'Approve or skip each data point individually.' },
                { i: 'shield', t: 'IRB-attested studies only', s: 'Every protocol has a verified approval letter.' },
                { i: 'clock', t: 'Revocable, anytime', s: 'One click to pause or fully withdraw.' },
              ].map((f, i) => (
                <div key={i} style={{ display: 'flex', gap: 14 }}>
                  <span style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--cream-2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={f.i} size={16}/></span>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 500 }}>{f.t}</div>
                    <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 2 }}>{f.s}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* QUOTES */}
      <section style={{ padding: 'var(--tg-pad-y) var(--tg-pad-x)', background: 'var(--ink)', color: 'var(--cream)' }}>
        <span className="tg-eyebrow" style={{ color: 'var(--cream-3)' }}><span className="dot"></span>In their words</span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 48, marginTop: 24 }}>
          {TG_QUOTES.map((q, i) => (
            <blockquote key={i} style={{ margin: 0 }}>
              <p className="tg-serif" style={{ fontSize: 'clamp(26px, 2.4vw, 34px)', lineHeight: 1.25, color: 'var(--cream)' }}>"{q.text}"</p>
              <div style={{ marginTop: 22, display: 'flex', alignItems: 'center', gap: 12 }}>
                <span className="tg-mono" style={{ fontSize: 12, background: 'rgba(255,255,255,0.08)', padding: '6px 10px', borderRadius: 999, letterSpacing: '0.06em' }}>{q.who}</span>
                <span style={{ fontSize: 13, color: 'var(--cream-3)' }}>{q.tag}</span>
              </div>
            </blockquote>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: 'var(--tg-pad-y) var(--tg-pad-x)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '0.7fr 1.3fr', gap: 80 }}>
          <div>
            <span className="tg-eyebrow"><span className="dot"></span>Plain answers</span>
            <h2 className="tg-serif" style={{ fontSize: 'clamp(34px, 3.6vw, 48px)', lineHeight: 1.1, margin: '14px 0 18px' }}>
              Questions we hear most often.
            </h2>
            <p style={{ color: 'var(--ink-2)', fontSize: 15 }}>
              Still wondering something? Email <span className="tg-mono">hello@trialguard.health</span> — replies inside one business day.
            </p>
          </div>
          <FaqList/>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: 'var(--tg-pad-y) var(--tg-pad-x)', background: 'var(--coral-tint)' }}>
        <div style={{ maxWidth: 760 }}>
          <h2 className="tg-serif" style={{ fontSize: 'clamp(40px, 4.6vw, 64px)', lineHeight: 1.05 }}>
            Be a participant — not a profile.
          </h2>
          <p style={{ fontSize: 18, color: 'var(--ink-2)', marginTop: 18, maxWidth: '52ch' }}>
            Get your pseudonym, run the 30-second screener, and browse trials with zero personal info on file. Cancel anytime; we keep nothing you didn't consent to.
          </p>
          <div style={{ marginTop: 28, maxWidth: 520 }}>
            <EmailCapture variant="coral" cta="Send my pseudonym"/>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '48px var(--tg-pad-x)', borderTop: '1px solid var(--line)', textAlign: 'center' }}>
        <div className="tg-mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.06em' }}>© 2026 TRIALGUARD</div>
      </footer>

      <Modal open={modal} onClose={() => setModal(false)}>
        <PhotoSlot aspect="16 / 9" label="video · 2-min product overview"/>
        <p style={{ marginTop: 18, color: 'var(--ink-2)' }}>
          A short walkthrough: creating a pseudonym, running the screener, and consenting to share specific data points with a study coordinator.
        </p>
      </Modal>
    </div>
  )
}
