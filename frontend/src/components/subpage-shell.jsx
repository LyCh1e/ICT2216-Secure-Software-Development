import { Link, useNavigate } from 'react-router-dom'
import { TgLogo, Icon } from './shared'
import { useAuth } from '../context/AuthContext'
import { api } from '../api'

const ROLE_PATHS = { participant: '/patient', researcher: '/researcher', admin: '/admin' }
const ROLE_LABELS = { participant: 'Patient Portal', researcher: 'Researcher Portal', admin: 'Admin Portal' }

const NAV_LINKS = [
  ['How it works', '/#how'],
  ['Active trials', '/trials'],
  ['Privacy', '/privacy'],
  ['For researchers', '/researchers'],
  ['FAQ', '/faq'],
]

export function SubpageNav({ active }) {
  const { auth, logout } = useAuth()
  const navigate = useNavigate()
  async function handleLogout() {
    try { await api.post('/api/auth/logout') } catch {}
    logout()
    navigate('/login', { replace: true })
  }
  return (
    <nav className="tg-nav">
      <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}><TgLogo /></Link>
      <div className="tg-nav-links">
        {NAV_LINKS.map(([label, to]) => (
          <Link
            key={label}
            to={to}
            style={{
              color: active === label ? 'var(--ink)' : 'var(--ink-2)',
              fontWeight: active === label ? 500 : 400,
              textDecoration: 'none',
            }}
          >
            {label}
          </Link>
        ))}
      </div>
      <div className="tg-nav-actions" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        {auth ? (
          <>
            <Link to={ROLE_PATHS[auth.role] ?? '/login'} className="tg-btn tg-btn-primary" style={{ padding: '10px 18px', fontSize: 14, textDecoration: 'none' }}>
              {ROLE_LABELS[auth.role] ?? 'Dashboard'} <Icon name="arrow" size={14}/>
            </Link>
            <button onClick={handleLogout} title="Sign out" style={{ appearance: 'none', border: 0, cursor: 'pointer', width: 32, height: 32, borderRadius: 8, background: 'transparent', color: 'var(--ink-2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="lock" size={16}/>
            </button>
            <div className="tg-nav-user" style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 10, borderLeft: '1px solid var(--line)' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, fontWeight: 500 }}>{auth.username}</div>
                <div style={{ fontFamily: 'Geist Mono, monospace', fontSize: 10, color: 'var(--ink-3)' }}>{auth.role === 'participant' ? 'participant' : auth.role === 'admin' ? 'admin · L2' : 'cohort lead'}</div>
              </div>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--sage)', color: 'var(--cream)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Geist Mono, monospace', fontSize: 11, border: '1px solid var(--sage-2)' }}>
                {auth.username?.slice(0, 2).toUpperCase()}
              </div>
            </div>
          </>
        ) : (
          <>
            <Link to="/login" className="tg-btn tg-btn-ghost" style={{ padding: '10px 16px', fontSize: 14, textDecoration: 'none' }}>Sign in</Link>
            <Link to="/signup" className="tg-btn tg-btn-primary" style={{ padding: '10px 18px', fontSize: 14, textDecoration: 'none' }}>Get a pseudonym</Link>
          </>
        )}
      </div>
    </nav>
  )
}

export function SubpageHero({ eyebrow, title, sub, right }) {
  return (
    <section style={{ padding: 'calc(var(--tg-pad-y) * 0.85) var(--tg-pad-x) calc(var(--tg-pad-y) * 0.6)', borderBottom: '1px solid var(--line)' }}>
      <div className="tg-subpage-hero-grid" style={{ display: 'grid', gridTemplateColumns: right ? '1.4fr 1fr' : '1fr', gap: 64, alignItems: 'flex-end' }}>
        <div>
          <span className="tg-eyebrow"><span className="dot"></span>{eyebrow}</span>
          <h1 className="tg-serif" style={{ fontSize: 'clamp(48px, 5.6vw, 80px)', lineHeight: 1.04, letterSpacing: '-0.015em', margin: '20px 0 18px' }}>
            {title}
          </h1>
          <p style={{ fontSize: 'calc(19px * var(--tg-text-scale))', color: 'var(--ink-2)', maxWidth: '52ch', lineHeight: 1.55 }}>
            {sub}
          </p>
        </div>
        {right}
      </div>
    </section>
  )
}

export function SubpageFooter() {
  return (
    <>
      <section style={{ padding: 'var(--tg-pad-y) var(--tg-pad-x)', background: 'var(--coral-tint)' }}>
        <div className="tg-cta-block" style={{ maxWidth: 760 }}>
          <h2 className="tg-serif" style={{ fontSize: 'clamp(36px, 4.2vw, 56px)', lineHeight: 1.05 }}>
            Be a participant — not a profile.
          </h2>
          <p style={{ fontSize: 17, color: 'var(--ink-2)', marginTop: 16, maxWidth: '52ch' }}>
            Create a pseudonym ID in 60 seconds. Browse trials without putting your name on a thing.
          </p>
          <div style={{ marginTop: 26, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link to="/signup" className="tg-btn tg-btn-coral" style={{ padding: '14px 22px', textDecoration: 'none' }}>
              Get a pseudonym <Icon name="arrow" size={16} />
            </Link>
            <Link to="/" className="tg-btn tg-btn-ghost" style={{ padding: '14px 22px', textDecoration: 'none' }}>
              Back to overview
            </Link>
          </div>
        </div>
      </section>
      <footer style={{ padding: '40px var(--tg-pad-x)', borderTop: '1px solid var(--line)', textAlign: 'center' }}>
        <div className="tg-mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.06em' }}>© 2026 TRIALGUARD</div>
      </footer>
    </>
  )
}
