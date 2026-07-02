import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { BrandMark } from './Visuals.jsx'

export default function Navbar() {
  const { user, logout } = useAuth()
  return (
    <header className="glass-panel" style={{
      borderBottom: '1px solid rgba(255,255,255,0.4)',
      position: 'sticky', top: 0, zIndex: 10,
      boxShadow: '0 4px 24px rgba(76, 29, 149, 0.15)',
    }}>
      <div className="container" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 68,
      }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <BrandMark />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 700, lineHeight: 1 }}>Stackroom</span>
              <span className="eyebrow" style={{ fontSize: 10 }}>knowledge base</span>
            </div>
          </div>
        </Link>
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{user.name}</div>
              <div className="eyebrow" style={{ fontSize: 10 }}>{user.teamName}</div>
            </div>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'var(--gradient-brand)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-display)',
            }}>
              {user.name?.[0]?.toUpperCase() || '?'}
            </div>
            <button className="btn-secondary" onClick={logout}>Sign out</button>
          </div>
        )}
      </div>
    </header>
  )
}
