import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Icon, TgLogo } from '../components/shared'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'

function AuthFrame({ children, brand }) {
  return (
    <div className="tg-auth-frame" style={{
      height: '100%', width: '100%',
      background: 'var(--cream)',
      fontFamily: "'Geist', system-ui, sans-serif",
      color: 'var(--ink)',
      display: 'grid',
      gridTemplateColumns: '1.1fr 1fr',
    }}>
      <div className="tg-auth-form" style={{ display: 'flex', flexDirection: 'column', padding: '32px 56px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}><TgLogo size={22}/></Link>
          <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>
            Need help? <span className="pa-link">hello@trialguard.health</span>
          </span>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: 440 }}>
            {children}
          </div>
        </div>
        <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>
          <span className="pa-mono">© 2026 TRIALGUARD</span>
        </div>
      </div>
      <div className="tg-auth-brand" style={{
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

const ROLE_PATHS = { participant: '/patient', researcher: '/researcher', admin: '/admin' }

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [id, setId] = useState('')
  const [pass, setPass] = useState('')
  const [twoFa, setTwoFa] = useState('')
  const [stage, setStage] = useState('creds')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  async function submitCreds(e) {
    e?.preventDefault?.()
    if (!id.trim()) { setErr('Enter your email or username.'); return }
    if (!pass) { setErr('Password is required.'); return }
    setErr('')
    setLoading(true)
    try {
      await api.post('/api/auth/login', { identifier: id.trim(), password: pass })
      setStage('2fa')
    } catch (ex) {
      setErr(ex.status === 429 ? 'Too many attempts — wait a minute and try again.' : ex.status === 403 ? 'Please verify your email address before logging in.' : 'Invalid credentials.')
    } finally {
      setLoading(false)
    }
  }

  async function submit2fa(e) {
    e?.preventDefault?.()
    if (!/^\d{6}$/.test(twoFa.trim())) { setErr('Enter the 6-digit code from your authenticator.'); return }
    setErr('')
    setLoading(true)
    try {
      const data = await api.post('/api/auth/verify-mfa', { code: twoFa.trim() })
      login(data.role, id.trim())
      navigate(ROLE_PATHS[data.role] ?? '/login', { replace: true })
    } catch (ex) {
      setErr(ex.status === 429 ? 'Too many attempts — wait a minute and try again.' : 'Invalid or expired MFA code.')
    } finally {
      setLoading(false)
    }
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
                ['users', 'Patients', 'with a username + password'],
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
            NEW PATIENT? <Link className="pa-link" to="/signup">CREATE AN ACCOUNT →</Link>
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
            Sign in with your email or username. MFA required for all accounts.
          </p>
          <AuthField
            label="Email or username"
            value={id}
            onChange={(v) => { setId(v); setErr('') }}
            placeholder="you@email.com  ·  or  ·  your_username"
          />
          <AuthField
            label="Password"
            type="password"
            value={pass}
            onChange={(v) => { setPass(v); setErr('') }}
            placeholder="••••••••••"
            error={err}
          />
          <button
            className="pa-btn pa-btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '12px 16px', marginTop: 4 }}
            type="submit"
            disabled={loading}
          >
            {loading ? 'Checking…' : <><span>Continue</span> <Icon name="arrow" size={14}/></>}
          </button>
          <div style={{ fontSize: 13, color: 'var(--ink-3)', textAlign: 'center', marginTop: 22 }}>
            New to TrialGuard? <Link className="pa-link" to="/signup">Create an account →</Link>
          </div>
        </form>
      )}

      {stage === '2fa' && (
        <form onSubmit={submit2fa} noValidate>
          <button
            type="button"
            className="pa-btn pa-btn-link"
            style={{ marginBottom: 16, padding: '4px 6px', marginLeft: -6 }}
            onClick={() => { setStage('creds'); setErr('') }}
          >
            ← Back
          </button>
          <h1 style={{ fontFamily: 'Instrument Serif, serif', fontSize: 36, lineHeight: 1.1, margin: '0 0 8px', letterSpacing: '-0.01em' }}>
            Two-factor required.
          </h1>
          <p style={{ fontSize: 14, color: 'var(--ink-2)', margin: '0 0 24px' }}>
            Enter the 6-digit code from your authenticator app for <span className="pa-mono">{id}</span>.
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
          <button
            className="pa-btn pa-btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '12px 16px' }}
            type="submit"
            disabled={loading}
          >
            {loading ? 'Verifying…' : <><span>Sign in</span> <Icon name="arrow" size={14}/></>}
          </button>
        </form>
      )}
    </AuthFrame>
  )
}
