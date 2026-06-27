import { useNavigate } from 'react-router-dom'
import { Icon, TgLogo } from './shared'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'

export function PortalTopbar({ role, who, search = true }) {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const roleLabel = { patient: 'PATIENT', admin: 'ADMIN', researcher: 'RESEARCHER' }[role]
  const initials = who.split(/[-\s]/).slice(0, 2).map(s => s[0]).join('').toUpperCase()

  async function handleLogout() {
    try { await api.post('/api/auth/logout') } catch { /* session may already be gone */ }
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="pa-topbar">
      <div className="pa-topbar-left">
        <a href="/" style={{ textDecoration: 'none', color: 'inherit' }}><TgLogo size={20}/></a>
        <span className={'pa-role-chip ' + role}>
          <span style={{ width: 6, height: 6, borderRadius: 50, background: 'currentColor' }}></span>
          {roleLabel}
        </span>
      </div>
      <div className="pa-topbar-right">
        {search && (
          <div className="pa-search">
            <Icon name="search" size={14}/>
            <input placeholder={role === 'patient' ? 'Search trials, documents…' : role === 'admin' ? 'Search users, trials, sponsors…' : 'Search cohort, reports…'}/>
            <span className="pa-kbd">⌘K</span>
          </div>
        )}
        <span className="pa-topbar-icons">
          <button className="pa-iconbtn" title="Notifications"><Icon name="bell" size={16}/></button>
          <button className="pa-iconbtn" title="Help"><Icon name="help" size={16}/></button>
        </span>
        <button className="pa-iconbtn" title="Sign out" onClick={handleLogout}><Icon name="lock" size={16}/></button>
        <div className="pa-topbar-user" style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 12, borderLeft: '1px solid var(--line)' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, fontWeight: 500 }}>{who}</div>
            <div className="pa-mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>{role === 'patient' ? 'participant' : role === 'admin' ? 'admin · L2' : 'cohort lead'}</div>
          </div>
          <div className={'pa-avatar ' + role}>{initials.slice(0, 2)}</div>
        </div>
      </div>
    </div>
  )
}

export function PortalSide({ items, value, onChange, footer }) {
  return (
    <aside className="pa-side">
      <div className="pa-side-label">WORKSPACE</div>
      {items.map((it) => (
        <button
          key={it.id}
          className="pa-nav-item"
          data-active={value === it.id}
          onClick={() => onChange(it.id)}
        >
          <Icon name={it.icon} size={16}/>
          <span>{it.label}</span>
          {it.count != null && <span className="count">{it.count}</span>}
        </button>
      ))}
      <div style={{ flex: 1 }}></div>
      {footer}
    </aside>
  )
}

export function PortalHead({ title, sub, right }) {
  return (
    <div className="pa-content-head">
      <div>
        <h1 className="pa-content-title">{title}</h1>
        {sub && <div className="pa-content-sub">{sub}</div>}
      </div>
      {right && <div className="pa-content-head-right">{right}</div>}
    </div>
  )
}

export function PortalModal({ open, title, onClose, footer, children, width = 560 }) {
  if (!open) return null
  return (
    <div className="pa-modal-bg" onClick={onClose}>
      <div className="pa-modal" style={{ maxWidth: width }} onClick={(e) => e.stopPropagation()}>
        <div className="pa-modal-head">
          <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: 22, lineHeight: 1.1 }}>{title}</div>
          <button className="pa-iconbtn" onClick={onClose}><Icon name="x" size={14}/></button>
        </div>
        <div className="pa-modal-body">{children}</div>
        {footer && <div className="pa-modal-foot">{footer}</div>}
      </div>
    </div>
  )
}

export function PortalConfirm({ open, title, body, danger, confirmLabel, onConfirm, onClose }) {
  return (
    <PortalModal
      open={open}
      title={title}
      onClose={onClose}
      footer={(
        <>
          <button className="pa-btn pa-btn-ghost" onClick={onClose}>Cancel</button>
          <button className={'pa-btn ' + (danger ? 'pa-btn-danger' : 'pa-btn-primary')} onClick={() => { onConfirm(); onClose() }}>{confirmLabel}</button>
        </>
      )}
    >
      <p style={{ margin: 0, color: 'var(--ink-2)', fontSize: 14, lineHeight: 1.55 }}>{body}</p>
    </PortalModal>
  )
}
