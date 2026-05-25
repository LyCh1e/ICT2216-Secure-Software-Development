import { useState } from 'react'
import { TG_FAQ, TG_TRIALS } from '../data/landing'

export function TgLogo({ size = 22 }) {
  return (
    <span className="tg-logo">
      <span className="tg-logo-mark" style={{ width: size, height: size }}></span>
      <span>TrialGuard</span>
    </span>
  )
}

export function Icon({ name, size = 18 }) {
  const paths = {
    arrow: <path d="M5 12h14m-5-5 5 5-5 5"/>,
    check: <path d="m5 12 4 4 10-10"/>,
    lock: <><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
    eye: <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></>,
    shield: <path d="M12 3 5 6v6c0 4 3 7.5 7 9 4-1.5 7-5 7-9V6l-7-3Z"/>,
    plus: <path d="M12 5v14M5 12h14"/>,
    minus: <path d="M5 12h14"/>,
    play: <path d="m8 5 12 7-12 7V5Z"/>,
    chev: <path d="m6 9 6 6 6-6"/>,
    x: <path d="M6 6l12 12M18 6 6 18"/>,
    pin: <><path d="M12 22s7-7 7-12a7 7 0 1 0-14 0c0 5 7 12 7 12Z"/><circle cx="12" cy="10" r="2.5"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    cash: <><rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/></>,
    users: <><circle cx="9" cy="9" r="3"/><path d="M3 20a6 6 0 0 1 12 0"/><circle cx="17" cy="8" r="2.5"/><path d="M15 14a5 5 0 0 1 6 6"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>,
    bell: <><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z"/><path d="M10 19a2 2 0 0 0 4 0"/></>,
    help: <><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.5-2.5 2-2.5 4"/><circle cx="12" cy="17" r="0.6" fill="currentColor"/></>,
    upload: <><path d="M12 16V4m0 0-4 4m4-4 4 4"/><path d="M5 16v3a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3"/></>,
    file: <><path d="M6 3h8l4 4v14H6V3Z"/><path d="M14 3v4h4"/></>,
    cal: <><rect x="4" y="5" width="16" height="16" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/></>,
    trash: <><path d="M5 7h14M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/><path d="M6 7l1 13h10l1-13"/></>,
    edit: <><path d="M4 20h4l11-11-4-4L4 16v4Z"/><path d="m13 5 4 4"/></>,
    pause: <><path d="M9 5v14M15 5v14"/></>,
    play2: <path d="m8 5 12 7-12 7V5Z"/>,
    dot3: <><circle cx="6" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="18" cy="12" r="1.2"/></>,
    filter: <path d="M3 5h18l-7 9v6l-4-2v-4L3 5Z"/>,
    plus2: <path d="M12 5v14M5 12h14"/>,
    flag: <><path d="M5 21V4"/><path d="M5 4h12l-2 4 2 4H5"/></>,
    activity: <path d="M3 12h4l3-7 4 14 3-7h4"/>,
    pill: <><rect x="3" y="9" width="18" height="6" rx="3" transform="rotate(-30 12 12)"/><path d="m8.5 8.5 7 7" transform="rotate(-30 12 12)"/></>,
    bldg: <><rect x="4" y="3" width="16" height="18" rx="1"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2"/></>,
    chart: <><path d="M4 20V4"/><path d="M4 20h16"/><rect x="7" y="13" width="3" height="6"/><rect x="12" y="9" width="3" height="10"/><rect x="17" y="5" width="3" height="14"/></>,
    home: <><path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/></>,
    msg: <><path d="M21 12a8 8 0 0 1-12 7l-5 1 1-4a8 8 0 1 1 16-4Z"/></>,
  }
  return (
    <svg className="tg-icn" viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      {paths[name]}
    </svg>
  )
}

export function PhotoSlot({ aspect = '16 / 10', label, style = {}, children }) {
  return (
    <div className="tg-photo" style={{ aspectRatio: aspect, ...style }}>
      {children}
      {label && <span className="label">{label}</span>}
    </div>
  )
}

export function FaqList({ items = TG_FAQ }) {
  const [open, setOpen] = useState(0)
  return (
    <div className="tg-acc">
      {items.map((it, i) => {
        const isOpen = open === i
        return (
          <div className="tg-acc-item" key={i} data-open={isOpen ? '' : undefined}>
            <button className="tg-acc-head" onClick={() => setOpen(isOpen ? -1 : i)} aria-expanded={isOpen}>
              <span style={{ paddingRight: 24 }}>{it.q}</span>
              <span className="tg-acc-icon" aria-hidden="true">
                <Icon name={isOpen ? 'minus' : 'plus'} size={14} />
              </span>
            </button>
            <div className="tg-acc-body" style={{ maxHeight: isOpen ? 280 : 0, transition: 'max-height 280ms ease' }}>
              <div className="tg-acc-body-inner">{it.a}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function EmailCapture({ variant = 'ink', placeholder = 'pseudonym@anymail.com', cta = 'Get a pseudonym ID' }) {
  const [email, setEmail] = useState('')
  const [state, setState] = useState('idle')
  const [error, setError] = useState('')

  function submit(e) {
    e.preventDefault()
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    if (!ok) { setState('error'); setError(email ? 'That doesn\'t look like a valid email.' : 'Add an email so we can send your pseudonym.'); return }
    setState('sent'); setError('')
  }

  const btnClass = variant === 'coral' ? 'tg-btn tg-btn-coral' : variant === 'sage' ? 'tg-btn tg-btn-sage' : 'tg-btn tg-btn-primary'

  if (state === 'sent') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', background: 'var(--sage-tint)', borderRadius: 14, border: '1px solid var(--sage-soft)', color: 'var(--sage-2)' }}>
        <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--sage)', color: 'var(--cream)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="check" size={16}/>
        </span>
        <div>
          <div style={{ fontWeight: 500 }}>Check your inbox — pseudonym ID sent.</div>
          <div className="tg-mono" style={{ fontSize: 12, opacity: 0.8 }}>We won't use this email for anything else.</div>
        </div>
      </div>
    )
  }
  return (
    <form onSubmit={submit} noValidate>
      <div style={{ display: 'flex', gap: 10, alignItems: 'stretch', flexWrap: 'wrap' }}>
        <input
          className={'tg-input' + (state === 'error' ? ' error' : '')}
          type="email"
          placeholder={placeholder}
          value={email}
          onChange={(e) => { setEmail(e.target.value); if (state === 'error') setState('idle') }}
          style={{ flex: '1 1 240px', minWidth: 220 }}
          aria-label="Email"
        />
        <button type="submit" className={btnClass}>
          {cta}
          <Icon name="arrow" size={16}/>
        </button>
      </div>
      <div style={{ minHeight: 22, marginTop: 8, fontSize: 13, color: state === 'error' ? 'var(--coral-2)' : 'var(--ink-3)' }}>
        {state === 'error' ? error : 'Only an email — your name is never collected.'}
      </div>
    </form>
  )
}

const ELIG_Q = [
  { q: 'How old are you?', plain: 'Most studies require 18+. We only share this if a study needs it.', opts: ['Under 18', '18 – 39', '40 – 64', '65 +'] },
  { q: 'What area is most relevant to you?', plain: 'Pick what you\'d most consider participating in.', opts: ['Sleep & insomnia', 'Mental health', 'Migraine / neuro', 'Metabolic / diabetes'] },
  { q: 'How would you like to participate?', plain: 'Many studies are fully remote — but not all.', opts: ['Fully remote only', 'Hybrid, occasional visits', 'In-person near me', 'Open to anything'] },
]

export function EligibilityQuiz({ compact = false }) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState([null, null, null])
  const done = step >= ELIG_Q.length
  const pct = done ? 100 : Math.round((step / ELIG_Q.length) * 100)

  function pick(idx) {
    const next = [...answers]; next[step] = idx; setAnswers(next)
    setTimeout(() => setStep((s) => s + 1), 240)
  }
  function reset() { setStep(0); setAnswers([null, null, null]) }

  return (
    <div className="tg-card" style={{ padding: compact ? 22 : 30 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <span className="tg-eyebrow"><span className="dot"></span>Eligibility check · 30 sec</span>
        <span className="tg-mono" style={{ fontSize: 12, color: 'var(--ink-3)' }}>{done ? 'complete' : `${step + 1} / ${ELIG_Q.length}`}</span>
      </div>
      <div className="tg-elig-bar" aria-hidden="true"><div style={{ width: pct + '%' }}></div></div>

      {!done && (
        <div style={{ marginTop: 22 }}>
          <div className="tg-serif" style={{ fontSize: compact ? 24 : 28, lineHeight: 1.15 }}>{ELIG_Q[step].q}</div>
          <div style={{ color: 'var(--ink-3)', fontSize: 13, marginTop: 6 }}>{ELIG_Q[step].plain}</div>
          <div style={{ display: 'grid', gap: 10, marginTop: 18 }}>
            {ELIG_Q[step].opts.map((o, i) => (
              <button
                key={i}
                className="tg-elig-option"
                data-selected={answers[step] === i}
                onClick={() => pick(i)}
              >
                <span>{o}</span>
                <span className="kbd">{i + 1}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {done && (
        <div style={{ marginTop: 22 }}>
          <div className="tg-chip sage" style={{ marginBottom: 12 }}><Icon name="check" size={12}/>{' '}MATCHES FOUND</div>
          <div className="tg-serif" style={{ fontSize: compact ? 26 : 30, lineHeight: 1.15 }}>4 trials may fit your answers.</div>
          <div style={{ color: 'var(--ink-3)', fontSize: 14, marginTop: 6, maxWidth: '50ch' }}>
            Create a pseudonym to see them. No commitment — you can browse anonymously and never enroll if nothing's a fit.
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
            <button className="tg-btn tg-btn-primary">Get my pseudonym ID <Icon name="arrow" size={16}/></button>
            <button className="tg-btn tg-btn-ghost" onClick={reset}>Start over</button>
          </div>
        </div>
      )}
    </div>
  )
}

export function Modal({ open, onClose, children }) {
  if (!open) return null
  return (
    <div className="tg-modal-bg" onClick={onClose}>
      <div className="tg-modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
          <span className="tg-eyebrow"><span className="dot"></span>TRIALGUARD · 2 MIN OVERVIEW</span>
          <button onClick={onClose} className="tg-btn tg-btn-ghost" style={{ padding: '8px 10px' }} aria-label="Close"><Icon name="x" size={14}/></button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function TrialCard({ trial, tone = 'cream' }) {
  return (
    <div className="tg-card" style={{ background: tone === 'sage' ? 'var(--sage-tint)' : tone === 'coral' ? 'var(--coral-tint)' : 'var(--white)', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div>
          <span className="tg-mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.08em' }}>{trial.id}</span>
          <div className="tg-serif" style={{ fontSize: 22, lineHeight: 1.15, marginTop: 4 }}>{trial.plain}</div>
          <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 2 }}>{trial.clinical}</div>
        </div>
        <span className="tg-chip">{trial.tag}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, fontSize: 13 }}>
        <div><div style={{ color: 'var(--ink-3)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Duration</div><div style={{ marginTop: 4 }}>{trial.duration}</div></div>
        <div><div style={{ color: 'var(--ink-3)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Stipend</div><div style={{ marginTop: 4 }}>{trial.stipend}</div></div>
        <div><div style={{ color: 'var(--ink-3)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Spots left</div><div style={{ marginTop: 4 }}>{trial.spots}</div></div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--line)', paddingTop: 12 }}>
        <span style={{ fontSize: 13, color: 'var(--ink-2)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Icon name="pin" size={14}/>{trial.location}
        </span>
        <button className="tg-btn tg-btn-ghost" style={{ padding: '8px 14px', fontSize: 13 }}>View <Icon name="arrow" size={14}/></button>
      </div>
    </div>
  )
}
