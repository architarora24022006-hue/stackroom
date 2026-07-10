import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Navbar() {
  const { user, logout } = useAuth()
  return (
    <header style={{
      borderBottom: '1px solid var(--color-line)',
      background: 'var(--color-surface)',
    }}>
      <div className="container" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 68,
      }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="icon-tile" style={{ width: 34, height: 34, fontSize: 15, background: 'var(--color-ink)' }}>S</div>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 700 }}>Stackroom</span>
              <span className="eyebrow" style={{ fontSize: 10 }}>knowledge base</span>
            </div>
          </div>
        </Link>
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="icon-tile" style={{ width: 30, height: 30, fontSize: 13 }}>
                {user.name?.[0]?.toUpperCase() || '?'}
              </div>
              <span style={{ fontSize: 13 }}>
                <strong>{user.name}</strong>
                <span style={{ color: 'var(--color-ink-soft)' }}> · {user.teamName}</span>
              </span>
            </div>
            <button className="btn-secondary" onClick={logout}>Sign out</button>
          </div>
        )}
      </div>
    </header>
  )
}
