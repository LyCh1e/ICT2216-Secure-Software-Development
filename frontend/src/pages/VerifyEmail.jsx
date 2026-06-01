import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { TgLogo, Icon } from '../components/shared'
import { api } from '../api'

export default function VerifyEmail() {
  const [params] = useSearchParams()
  const [stage, setStage] = useState('verifying')
  const [email, setEmail] = useState('')
  const [resendDone, setResendDone] = useState(false)

  useEffect(() => {
    const token = params.get('token')
    if (!token) { setStage('invalid'); return }

    api.get(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(() => setStage('success'))
      .catch((err) => {
        const msg = (err.message ?? '').toLowerCase()
        setStage(msg.includes('expired') ? 'expired' : 'invalid')
      })
  }, [params])

  async function handleResend() {
    if (!email.trim()) return
    try {
      await api.post('/api/auth/resend-verification', { email: email.trim().toLowerCase() })
    } catch {
      // always show success to avoid email enumeration
    }
    setResendDone(true)
  }

  return (
    <div style={{
      minHeight: '100%', display: 'flex', flexDirection: 'column',
      background: 'var(--cream)', fontFamily: "'Geist', system-ui, sans-serif", color: 'var(--ink)'
    }}>
      {/* top bar */}
      <div style={{ padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}><TgLogo /></Link>
        <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>
          Need help? <span className="pa-link">hello@trialguard.health</span>
        </span>
      </div>

      {/* center card */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <div style={{ width: '100%', maxWidth: 560 }}>
          {stage === 'verifying' && <VerifyState
            tone="neutral"
            icon="lock"
            spin
            eyebrow="VERIFYING"
            title="Confirming your email..."
            body="Hang tight — we're checking the secure link from your inbox. This usually takes a second." />
          }

          {stage === 'success' &&
            <div className="tg-card" style={{ padding: 0, overflow: 'hidden', background: 'var(--white)' }}>
              <div style={{ background: 'linear-gradient(160deg, var(--sage-tint), var(--coral-tint))', padding: '36px 36px 28px', textAlign: 'center' }}>
                <span style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--white)', color: 'var(--sage-2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px -8px rgba(15,42,51,0.3)' }}>
                  <Icon name="check" size={30} />
                </span>
                <div className="pa-mono" style={{ fontSize: 11, letterSpacing: '0.16em', color: 'var(--sage-2)', marginTop: 18 }}>EMAIL VERIFIED</div>
                <h1 style={{ fontFamily: 'Instrument Serif, serif', fontSize: 40, lineHeight: 1.08, margin: '8px 0 0', letterSpacing: '-0.01em' }}>
                  You're all set.
                </h1>
              </div>
              <div style={{ padding: 32 }}>
                <p style={{ fontSize: 15, color: 'var(--ink-2)', textAlign: 'center', margin: '0 0 24px', lineHeight: 1.6 }}>
                  Your email is confirmed and your account is active. You can now sign in and start exploring trials.
                </p>
                <Link to="/login" className="pa-btn pa-btn-primary" style={{ width: '100%', boxSizing: 'border-box', justifyContent: 'center', padding: '14px 18px', textDecoration: 'none' }}>
                  Go to sign in <Icon name="arrow" size={16} />
                </Link>
                <Link to="/trials" className="pa-btn pa-btn-ghost" style={{ width: '100%', boxSizing: 'border-box', justifyContent: 'center', padding: '12px 18px', marginTop: 10, textDecoration: 'none' }}>
                  Browse active trials first
                </Link>
              </div>
            </div>
          }

          {stage === 'expired' && <VerifyState
            tone="warn"
            icon="clock"
            eyebrow="LINK EXPIRED"
            title="That link has expired."
            body="For your security, verification links are only valid for 24 hours. No problem — enter your email below and we'll send a fresh one."
            actions={resendDone
              ? <p style={{ textAlign: 'center', color: 'var(--sage-2)', fontSize: 14 }}>Check your inbox — a new link is on its way.</p>
              : <>
                  <input
                    className="pa-input"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={{ marginBottom: 10 }}
                  />
                  <button className="pa-btn pa-btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px 18px' }} onClick={handleResend}>
                    <Icon name="upload" size={16} /> Resend verification email
                  </button>
                  <Link to="/login" className="pa-btn pa-btn-ghost" style={{ width: '100%', justifyContent: 'center', padding: '12px 18px', marginTop: 10, textDecoration: 'none' }}>
                    Back to sign in
                  </Link>
                </>
            } />
          }

          {stage === 'invalid' && <VerifyState
            tone="danger"
            icon="x"
            eyebrow="LINK INVALID"
            title="We couldn't verify this link."
            body="The link may be incomplete or already used. Try clicking it again from your email, or request a new one."
            actions={resendDone
              ? <p style={{ textAlign: 'center', color: 'var(--sage-2)', fontSize: 14 }}>Check your inbox — a new link is on its way.</p>
              : <>
                  <input
                    className="pa-input"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={{ marginBottom: 10 }}
                  />
                  <button className="pa-btn pa-btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px 18px' }} onClick={handleResend}>
                    <Icon name="upload" size={16} /> Send a new link
                  </button>
                  <Link to="/" className="pa-btn pa-btn-ghost" style={{ width: '100%', justifyContent: 'center', padding: '12px 18px', marginTop: 10, textDecoration: 'none' }}>
                    Return home
                  </Link>
                </>
            } />
          }

          {/* footer reassurance */}
          <div style={{ marginTop: 24, textAlign: 'center', fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.6 }}>
            <Icon name="shield" size={13} /> &nbsp;We only used your email to confirm sign-up. It's never shared with researchers.
          </div>
        </div>
      </div>
    </div>
  )
}

function VerifyState({ tone, icon, eyebrow, title, body, actions, spin }) {
  const toneMap = {
    neutral: ['var(--cream-2)', 'var(--ink-2)'],
    warn:    ['#FBEFD2', '#7C5A14'],
    danger:  ['#F8DEDD', '#8E2A28'],
  }
  const [bg, fg] = toneMap[tone] ?? toneMap.neutral
  return (
    <div className="tg-card" style={{ background: 'var(--white)', textAlign: 'center', padding: '40px 36px' }}>
      <span style={{ width: 60, height: 60, borderRadius: '50%', background: bg, color: fg, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={spin ? { animation: 'tg-spin 1s linear infinite', display: 'inline-flex' } : {}}>
          <Icon name={icon} size={26} />
        </span>
      </span>
      <div className="pa-mono" style={{ fontSize: 11, letterSpacing: '0.16em', color: fg, marginTop: 18 }}>{eyebrow}</div>
      <h1 style={{ fontFamily: 'Instrument Serif, serif', fontSize: 36, lineHeight: 1.1, margin: '8px 0 12px', letterSpacing: '-0.01em' }}>{title}</h1>
      <p style={{ fontSize: 15, color: 'var(--ink-2)', maxWidth: '44ch', margin: '0 auto', lineHeight: 1.6 }}>{body}</p>
      {actions && <div style={{ marginTop: 26 }}>{actions}</div>}
    </div>
  )
}
