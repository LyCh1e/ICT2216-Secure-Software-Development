import { Link } from 'react-router-dom'
import { Icon, TgLogo } from './shared'

export function PortalTopbar({ role, who, search = true }) {
  const roleLabel = { patient: 'PATIENT', admin: 'ADMIN', researcher: 'RESEARCHER' }[role]
  const initials = who.split(/[-\s]/).slice(0, 2).map(s => s[0]).join('').toUpperCase()
  return (
    <div className="pa-topbar">
      <div className="pa-topbar-left">
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}><TgLogo size={20}/></Link>
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
        <button className="pa-iconbtn" title="Notifications"><Icon name="bell" size={16}/></button>
        <button className="pa-iconbtn" title="Help"><Icon name="help" size={16}/></button>
        <Link to="/login" className="pa-iconbtn" title="Sign out" style={{ textDecoration: 'none' }}><Icon name="lock" size={16}/></Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 12, borderLeft: '1px solid var(--line)' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, fontWeight: 500 }}>{who}</div>
            <div className="pa-mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>{role === 'patient' ? 'pseudonym' : role === 'admin' ? 'admin · L2' : 'cohort lead'}</div>
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
      {right}
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
