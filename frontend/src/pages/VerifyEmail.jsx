import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { TgLogo } from '../components/shared'
import { api } from '../api'

export default function VerifyEmail() {
  const [params] = useSearchParams()
  const [status, setStatus] = useState('verifying') // verifying | success | error
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token = params.get('token')
    if (!token) {
      setStatus('error')
      setMessage('No verification token found in this link.')
      return
    }
    api.get(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then((data) => {
        setStatus('success')
        setMessage(data.message || 'Email verified successfully.')
      })
      .catch((err) => {
        setStatus('error')
        setMessage(err.message || 'Verification failed. The link may have expired.')
      })
  }, [params])

  return (
    <div style={{
      height: '100%', width: '100%',
      background: 'var(--cream)',
      fontFamily: "'Geist', system-ui, sans-serif",
      color: 'var(--ink)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 24,
      padding: 32,
    }}>
      <TgLogo size={22} />

      <div style={{
        width: '100%', maxWidth: 420,
        background: 'var(--white)',
        border: '1px solid var(--line)',
        borderRadius: 16,
        padding: '36px 40px',
        textAlign: 'center',
      }}>
        {status === 'verifying' && (
          <>
            <div style={{ fontSize: 32, marginBottom: 16 }}>⏳</div>
            <h2 style={{ fontFamily: 'Instrument Serif, serif', fontSize: 26, margin: '0 0 8px' }}>Verifying…</h2>
            <p style={{ fontSize: 14, color: 'var(--ink-2)', margin: 0 }}>Please wait while we verify your email address.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{ fontSize: 32, marginBottom: 16 }}>✅</div>
            <h2 style={{ fontFamily: 'Instrument Serif, serif', fontSize: 26, margin: '0 0 8px' }}>Email verified!</h2>
            <p style={{ fontSize: 14, color: 'var(--ink-2)', margin: '0 0 24px' }}>{message}</p>
            <Link to="/login">
              <button className="pa-btn pa-btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px 16px' }}>
                Sign in →
              </button>
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{ fontSize: 32, marginBottom: 16 }}>❌</div>
            <h2 style={{ fontFamily: 'Instrument Serif, serif', fontSize: 26, margin: '0 0 8px' }}>Verification failed</h2>
            <p style={{ fontSize: 14, color: 'var(--ink-2)', margin: '0 0 24px' }}>{message}</p>
            <Link to="/signup">
              <button className="pa-btn pa-btn-ghost" style={{ width: '100%', justifyContent: 'center', padding: '12px 16px' }}>
                Back to sign up
              </button>
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
