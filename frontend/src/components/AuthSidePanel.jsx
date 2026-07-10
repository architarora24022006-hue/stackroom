import React from 'react'

export default function AuthSidePanel() {
  return (
    <div
      className="auth-side-panel"
      style={{
        background: 'var(--color-accent)',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '48px 56px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22 }}>Stackroom</div>
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <h2 style={{ fontSize: 34, color: '#fff', lineHeight: 1.15, marginBottom: 16, maxWidth: 380 }}>
          Every answer, traced back to its source.
        </h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', maxWidth: 340, lineHeight: 1.6 }}>
          Upload your team's documents, ask questions in plain language, and get answers grounded
          in exactly the passages that support them.
        </p>
      </div>

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: 10 }}>
        <span className="badge" style={{ background: 'rgba(255,255,255,0.14)', color: '#fff' }}>semantic search</span>
        <span className="badge" style={{ background: 'rgba(255,255,255,0.14)', color: '#fff' }}>cited answers</span>
      </div>

      {/* Decorative stacked "index card" illustration */}
      <svg
        viewBox="0 0 400 400"
        style={{ position: 'absolute', right: -60, top: '38%', width: 320, opacity: 0.9, zIndex: 0 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <g transform="rotate(-8 200 200)">
          <rect x="60" y="150" width="230" height="140" rx="8" fill="rgba(255,255,255,0.10)" />
        </g>
        <g transform="rotate(4 200 200)">
          <rect x="70" y="120" width="230" height="140" rx="8" fill="rgba(255,255,255,0.16)" />
        </g>
        <g>
          <rect x="80" y="95" width="230" height="140" rx="8" fill="rgba(255,255,255,0.94)" />
          <rect x="102" y="120" width="150" height="10" rx="5" fill="var(--color-accent)" opacity="0.35" />
          <rect x="102" y="142" width="186" height="8" rx="4" fill="var(--color-ink)" opacity="0.18" />
          <rect x="102" y="160" width="186" height="8" rx="4" fill="var(--color-ink)" opacity="0.18" />
          <rect x="102" y="178" width="120" height="8" rx="4" fill="var(--color-ink)" opacity="0.18" />
          <circle cx="255" cy="200" r="22" fill="none" stroke="var(--color-stamp)" strokeWidth="2.5" />
          <text x="255" y="205" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="11" fill="var(--color-stamp)" fontWeight="600">92%</text>
        </g>
      </svg>
    </div>
  )
}
