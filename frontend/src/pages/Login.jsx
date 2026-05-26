import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Icon, TgLogo } from '../components/shared'

function AuthFrame({ children, brand }) {
  return (
    <div style={{
      height: '100%', width: '100%',
      background: 'var(--cream)',
      fontFamily: "'Geist', system-ui, sans-serif",
      color: 'var(--ink)',
      display: 'grid',
      gridTemplateColumns: '1.1fr 1fr',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', padding: '32px 56px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <TgLogo size={22}/>
          <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>
            Need help? <span className="pa-link">hello@trialguard.health</span>
          </span>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: 440 }}>
            {children}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--ink-3)' }}>
          <span className="pa-mono">© 2026 TRIALGUARD · HIPAA · GDPR · SOC 2</span>
          <div style={{ display: 'flex', gap: 18 }}>
            <a className="pa-link">Privacy</a>
            <a className="pa-link">Terms</a>
            <a className="pa-link">Security</a>
          </div>
        </div>
      </div>
      <div style={{
        background: 'linear-gradient(160deg, var(--sage-tint), var(--coral-tint))',
        position: 'relative', overflow: 'hidden',
        padding: '40px',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      }}>
        {brand}
      </div>
    </div>
  )
}

function AuthField({ label, type = 'text', value, onChange, placeholder, help, error, right, mono }) {
  return (
    <div className="pa-field" style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <label className="pa-label">{label}</label>
        {right}
      </div>
      <input
        className={'pa-input' + (mono ? ' pa-mono' : '') + (error ? ' error' : '')}
        type={type}
        value={value ?? ''}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        style={mono ? { fontFamily: 'Geist Mono, monospace', letterSpacing: '0.04em' } : {}}
      />
      {(help || error) && <div className="pa-help" style={{ color: error ? '#C75A57' : 'var(--ink-3)' }}>{error || help}</div>}
    </div>
  )
}

export default function Login() {
  const navigate = useNavigate()
  const [id, setId] = useState('')
  const [pass, setPass] = useState('')
  const [twoFa, setTwoFa] = useState('')
  const [stage, setStage] = useState('creds')
  const [err, setErr] = useState('')

  const isPseudo = /^PT-[A-F0-9]{4}-[A-Z0-9]{2}$/i.test(id.trim())
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(id.trim())

  function submitCreds(e) {
    e?.preventDefault?.()
    if (!id.trim()) { setErr('Enter your email or pseudonym ID.'); return }
    if (!isPseudo && !isEmail) { setErr('That doesn\'t look like an email or a pseudonym ID (PT-XXXX-XX).'); return }
    if (!pass) { setErr('Password is required.'); return }
    setErr('')
    setStage('2fa')
  }

  function submit2fa(e) {
    e?.preventDefault?.()
    if (!/^\d{6}$/.test(twoFa.trim())) { setErr('Enter the 6-digit code from your authenticator.'); return }
    setErr('')
    if (isPseudo) { navigate('/patient'); return }
    setStage('pick')
  }

  return (
    <AuthFrame
      brand={(
        <>
          <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: 44, lineHeight: 1.05, letterSpacing: '-0.01em', maxWidth: 480 }}>
            One door in. <em style={{ color: 'var(--sage-2)' }}>Yours by design.</em>
          </div>
          <div className="pa-card" style={{ background: 'rgba(255,255,255,0.65)', borderColor: 'var(--line)', maxWidth: 380, padding: 22 }}>
            <div className="pa-mono" style={{ fontSize: 11, letterSpacing: '0.1em', color: 'var(--ink-3)' }}>WHO SIGNS IN HERE</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0 0', display: 'grid', gap: 10, fontSize: 13, color: 'var(--ink-2)' }}>
              {[
                ['users', 'Patients', 'with a pseudonym ID + passphrase'],
                ['shield', 'Admins', 'with a work email + password'],
                ['pill', 'Researchers', 'with a work email + password'],
              ].map(([icn, who, how]) => (
                <li key={who} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--white)', color: 'var(--sage-2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={icn} size={13}/>
                  </span>
                  <span><strong>{who}</strong> — {how}</span>
                </li>
              ))}
            </ul>
            <div className="pa-divider"></div>
            <div style={{ display: 'grid', gap: 8, fontSize: 12, color: 'var(--ink-3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>2FA</span><span style={{ color: 'var(--sage-2)' }}>Required for everyone</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Audit</span><span>Every sign-in logged</span></div>
            </div>
          </div>
          <div className="pa-mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.06em' }}>
            NEW PATIENT? <Link className="pa-link" to="/signup">CREATE A PSEUDONYM →</Link>
          </div>
        </>
      )}
    >
      {stage === 'creds' && (
        <form onSubmit={submitCreds} noValidate>
          <h1 style={{ fontFamily: 'Instrument Serif, serif', fontSize: 40, lineHeight: 1.1, margin: '0 0 8px', letterSpacing: '-0.01em' }}>
            Sign in to TrialGuard.
          </h1>
          <p style={{ fontSize: 14, color: 'var(--ink-2)', margin: '0 0 28px' }}>
            Patients sign in with a pseudonym ID. Staff sign in with a work email. Same screen for everyone.
          </p>
          <AuthField
            label="Email or pseudonym ID"
            value={id}
            onChange={(v) => { setId(v); setErr('') }}
            placeholder="you@email.com  ·  or  ·  PT-XXXX-XX"
            mono={isPseudo}
            right={id && (
              <span className="pa-mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>
                {isPseudo ? 'patient' : isEmail ? 'staff' : ''}
              </span>
            )}
          />
          <AuthField
            label={isPseudo ? 'Passphrase' : 'Password'}
            type="password"
            value={pass}
            onChange={(v) => { setPass(v); setErr('') }}
            placeholder="••••••••••"
            right={<a className="pa-link" style={{ fontSize: 12 }}>Forgot?</a>}
            error={err}
          />
          <button className="pa-btn pa-btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px 16px', marginTop: 4 }} type="submit">
            Continue <Icon name="arrow" size={14}/>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0', color: 'var(--ink-3)', fontSize: 12 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--line)' }}></div>
            OR
            <div style={{ flex: 1, height: 1, background: 'var(--line)' }}></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button type="button" className="pa-btn pa-btn-ghost" style={{ justifyContent: 'center' }}>
              <Icon name="lock" size={14}/> Hardware key
            </button>
            <button type="button" className="pa-btn pa-btn-ghost" style={{ justifyContent: 'center' }}>
              <Icon name="bldg" size={14}/> SSO
            </button>
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-3)', textAlign: 'center', marginTop: 22 }}>
            New to TrialGuard? <Link className="pa-link" to="/signup">Create a pseudonym →</Link>
          </div>
        </form>
      )}

      {stage === 'pick' && (
        <div>
          <h1 style={{ fontFamily: 'Instrument Serif, serif', fontSize: 36, lineHeight: 1.1, margin: '0 0 8px', letterSpacing: '-0.01em' }}>
            Open your console.
          </h1>
          <p style={{ fontSize: 14, color: 'var(--ink-2)', margin: '0 0 24px' }}>
            Your account has access to multiple consoles in this demo. Pick where to land.
          </p>
          <div style={{ display: 'grid', gap: 10 }}>
            <Link to="/admin" className="pa-btn pa-btn-ink" style={{ justifyContent: 'space-between', padding: '14px 18px', textDecoration: 'none' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                <Icon name="shield" size={16}/> <strong>Admin console</strong>
              </span>
              <Icon name="arrow" size={14}/>
            </Link>
            <Link to="/researcher" className="pa-btn pa-btn-primary" style={{ justifyContent: 'space-between', padding: '14px 18px', background: 'var(--coral)', textDecoration: 'none' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                <Icon name="users" size={16}/> <strong>Researcher console</strong>
              </span>
              <Icon name="arrow" size={14}/>
            </Link>
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-3)', textAlign: 'center', marginTop: 18 }}>
            Wrong session? <Link className="pa-link" to="/login">Start over</Link>
          </div>
        </div>
      )}

      {stage === '2fa' && (
        <form onSubmit={submit2fa} noValidate>
          <button type="button" className="pa-btn pa-btn-link" style={{ marginBottom: 16, padding: '4px 6px', marginLeft: -6 }} onClick={() => { setStage('creds'); setErr('') }}>
            ← Back
          </button>
          <h1 style={{ fontFamily: 'Instrument Serif, serif', fontSize: 36, lineHeight: 1.1, margin: '0 0 8px', letterSpacing: '-0.01em' }}>
            Two-factor required.
          </h1>
          <p style={{ fontSize: 14, color: 'var(--ink-2)', margin: '0 0 24px' }}>
            We've pushed a 6-digit code to your authenticator app for <span className="pa-mono">{id}</span>.
          </p>
          <AuthField
            label="Authenticator code"
            value={twoFa}
            onChange={(v) => { setTwoFa(v.replace(/\D/g, '').slice(0, 6)); setErr('') }}
            placeholder="123 456"
            mono
            error={err}
            help="Code expires in 30 seconds."
          />
          <button className="pa-btn pa-btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px 16px' }} type="submit">
            Sign in <Icon name="arrow" size={14}/>
          </button>
          <div style={{ fontSize: 12, color: 'var(--ink-3)', textAlign: 'center', marginTop: 16 }}>
            Lost access to your authenticator? <a className="pa-link">Use a backup code →</a>
          </div>
        </form>
      )}
    </AuthFrame>
  )
}
