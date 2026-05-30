import { useState, Fragment } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Icon, TgLogo } from '../components/shared'
import { api } from '../api'

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
        <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>
          <span className="pa-mono">© 2026 TRIALGUARD</span>
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

function AuthField({ label, type = 'text', value, onChange, placeholder, help, error, mono }) {
  return (
    <div className="pa-field" style={{ marginBottom: 16 }}>
      <label className="pa-label">{label}</label>
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

export default function Signup() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [step1Err, setStep1Err] = useState('')
  const [pass, setPass] = useState('')
  const [pass2, setPass2] = useState('')
  const [passErr, setPassErr] = useState('')
  const [agree, setAgree] = useState(false)
  const [loading, setLoading] = useState(false)
  const [totpUri, setTotpUri] = useState('')
  const [totpSecret, setTotpSecret] = useState('')

  function strength(p) {
    let s = 0
    if (p.length >= 8) s++
    if (p.length >= 12) s++
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++
    if (/\d/.test(p)) s++
    if (/[^A-Za-z0-9]/.test(p)) s++
    return s
  }
  const sLevel = strength(pass)
  const sLabel = ['Too short', 'Weak', 'Okay', 'Good', 'Strong', 'Excellent'][sLevel]
  const sColor = ['var(--line-2)', '#C75A57', '#D8A24A', 'var(--coral)', 'var(--sage)', 'var(--sage-2)'][sLevel]

  function validateStep1() {
    if (!/^[a-zA-Z0-9_]{3,64}$/.test(username.trim())) {
      setStep1Err('Username must be 3–64 characters: letters, numbers, underscores only.')
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setStep1Err('Please enter a valid email address.')
      return false
    }
    setStep1Err('')
    return true
  }

  async function next() {
    if (step === 1) {
      if (!validateStep1()) return
      setStep(2)
    } else if (step === 2) {
      if (sLevel < 3) { setPassErr('Choose a stronger password — 12+ characters with letters, numbers, and a symbol.'); return }
      if (pass !== pass2) { setPassErr('Passwords don\'t match.'); return }
      if (!agree) { setPassErr('You must agree to the privacy terms.'); return }
      setPassErr('')
      setLoading(true)
      try {
        const data = await api.post('/api/auth/register', {
          username: username.trim(),
          email: email.trim().toLowerCase(),
          password: pass,
        })
        const uri = data.totp_uri || ''
        setTotpUri(uri)
        try {
          const secret = new URL(uri).searchParams.get('secret') || ''
          setTotpSecret(secret)
        } catch {
          setTotpSecret('')
        }
        setStep(3)
      } catch (ex) {
        setPassErr(ex.message || 'Registration failed. Please try again.')
      } finally {
        setLoading(false)
      }
    }
  }

  function copySecret() {
    navigator.clipboard.writeText(totpSecret).catch(() => {})
  }

  return (
    <AuthFrame
      brand={(
        <>
          <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: 44, lineHeight: 1.05, letterSpacing: '-0.01em', maxWidth: 480 }}>
            Be a participant. Not a profile.
          </div>
          <div style={{ display: 'grid', gap: 12, maxWidth: 360 }}>
            {[
              ['Pseudonymous by default', 'Researchers see only a token. We hold your identity in an encrypted vault.'],
              ['Granular consent', 'Approve every shared data point, study by study.'],
              ['Reversible', 'Withdraw at any time. We delete what you ask us to.'],
            ].map(([t, s]) => (
              <div key={t} style={{ display: 'flex', gap: 12 }}>
                <span style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--white)', color: 'var(--sage-2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name="check" size={14}/>
                </span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>{t}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-2)' }}>{s}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ fontFamily: 'Geist Mono, monospace', fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.06em' }}>
            SECURE · PSEUDONYMOUS · CONSENT-FIRST
          </div>
        </>
      )}
    >
      {/* progress */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {[1, 2, 3].map(n => (
            <Fragment key={n}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%',
                background: step >= n ? 'var(--sage)' : 'var(--white)',
                color: step >= n ? 'var(--cream)' : 'var(--ink-3)',
                border: '1px solid ' + (step >= n ? 'var(--sage)' : 'var(--line-2)'),
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontFamily: 'Geist Mono, monospace',
              }}>{step > n ? <Icon name="check" size={12}/> : n}</div>
              {n < 3 && <div style={{ flex: 1, height: 1, background: step > n ? 'var(--sage)' : 'var(--line)' }}></div>}
            </Fragment>
          ))}
        </div>
        <div className="pa-mono" style={{ fontSize: 11, letterSpacing: '0.1em', color: 'var(--ink-3)', marginTop: 10 }}>
          STEP {step} OF 3 · {['ACCOUNT', 'PASSWORD', 'AUTHENTICATOR'][step - 1]}
        </div>
      </div>

      {step === 1 && (
        <>
          <h1 style={{ fontFamily: 'Instrument Serif, serif', fontSize: 38, lineHeight: 1.1, margin: '0 0 8px', letterSpacing: '-0.01em' }}>
            Create your account.
          </h1>
          <p style={{ fontSize: 14, color: 'var(--ink-2)', margin: '0 0 24px' }}>
            Your email is used only for account recovery. Researchers never see it.
          </p>
          <AuthField
            label="Username"
            value={username}
            onChange={(v) => { setUsername(v); setStep1Err('') }}
            placeholder="your_username"
            help="3–64 characters, letters, numbers, underscores."
          />
          <AuthField
            label="Email"
            type="email"
            value={email}
            onChange={(v) => { setEmail(v); setStep1Err('') }}
            placeholder="you@anymail.com"
            error={step1Err}
            help={!step1Err ? 'A throwaway email is fine — never shared with researchers.' : undefined}
          />
          <button className="pa-btn pa-btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px 16px', marginTop: 8 }} onClick={next}>
            Continue <Icon name="arrow" size={14}/>
          </button>
          <div style={{ fontSize: 13, color: 'var(--ink-3)', textAlign: 'center', marginTop: 18 }}>
            Already have an account? <Link className="pa-link" to="/login">Sign in →</Link>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <h1 style={{ fontFamily: 'Instrument Serif, serif', fontSize: 38, lineHeight: 1.1, margin: '0 0 8px', letterSpacing: '-0.01em' }}>
            Set a password.
          </h1>
          <p style={{ fontSize: 14, color: 'var(--ink-2)', margin: '0 0 24px' }}>
            Use at least 12 characters with upper, lower, a number, and a symbol. <strong>Write it down somewhere safe.</strong>
          </p>
          <AuthField
            label="Password"
            type="password"
            value={pass}
            onChange={(v) => { setPass(v); setPassErr('') }}
            placeholder="At least 12 characters"
          />
          {pass.length > 0 && (
            <div style={{ marginTop: -10, marginBottom: 14 }}>
              <div style={{ display: 'flex', gap: 4 }}>
                {[0, 1, 2, 3, 4].map(i => (
                  <div key={i} style={{ flex: 1, height: 4, borderRadius: 999, background: i < sLevel ? sColor : 'var(--cream-2)' }}></div>
                ))}
              </div>
              <div className="pa-mono" style={{ fontSize: 11, color: sColor, marginTop: 6, letterSpacing: '0.08em' }}>{sLabel.toUpperCase()}</div>
            </div>
          )}
          <AuthField
            label="Confirm password"
            type="password"
            value={pass2}
            onChange={(v) => { setPass2(v); setPassErr('') }}
            placeholder="Type it again"
            error={passErr}
          />
          <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13, color: 'var(--ink-2)', cursor: 'pointer', margin: '4px 0 18px' }}>
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} style={{ marginTop: 3, accentColor: 'var(--sage)' }}/>
            <span>I agree to the <span className="pa-link">privacy policy</span> and <span className="pa-link">terms of service</span>.</span>
          </label>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="pa-btn pa-btn-ghost" onClick={() => setStep(1)}>Back</button>
            <button
              className="pa-btn pa-btn-primary"
              style={{ flex: 1, justifyContent: 'center', padding: '12px 16px' }}
              onClick={next}
              disabled={loading}
            >
              {loading ? 'Creating account…' : <><span>Create account</span> <Icon name="arrow" size={14}/></>}
            </button>
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <span className="pa-pill success" style={{ marginBottom: 16 }}><span className="dot"></span>ACCOUNT CREATED</span>
          <h1 style={{ fontFamily: 'Instrument Serif, serif', fontSize: 38, lineHeight: 1.1, margin: '0 0 8px', letterSpacing: '-0.01em' }}>
            Set up your authenticator.
          </h1>
          <p style={{ fontSize: 14, color: 'var(--ink-2)', margin: '0 0 22px' }}>
            Scan this key in your authenticator app (Google Authenticator, Authy, etc.) or paste the full URI. MFA is required to sign in.
          </p>
          {totpSecret && (
            <div style={{ padding: 20, background: 'var(--ink)', color: 'var(--cream)', borderRadius: 14, marginBottom: 16 }}>
              <div className="pa-mono" style={{ fontSize: 10, letterSpacing: '0.16em', color: 'var(--cream-3)' }}>TOTP SECRET KEY</div>
              <div className="pa-mono" style={{ fontSize: 18, marginTop: 10, letterSpacing: '0.12em', wordBreak: 'break-all' }}>{totpSecret}</div>
              <div style={{ fontSize: 12, color: 'var(--cream-3)', marginTop: 10 }}>Enter this key manually in your authenticator app.</div>
            </div>
          )}
          <div style={{ display: 'grid', gap: 8, marginBottom: 22 }}>
            {totpSecret && (
              <button className="pa-btn pa-btn-ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={copySecret}>
                <Icon name="file" size={14}/> Copy secret key
              </button>
            )}
          </div>
          <button
            className="pa-btn pa-btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '12px 16px' }}
            onClick={() => navigate('/login')}
          >
            Go to sign in <Icon name="arrow" size={14}/>
          </button>
        </>
      )}
    </AuthFrame>
  )
}
