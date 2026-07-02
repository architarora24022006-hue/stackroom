import React from 'react'

/* Rounded gradient mark with a tiny 3-node graph — stands in for
   "documents (nodes) linked by retrieval (edges)" wherever the
   Stackroom wordmark appears. */
export function BrandMark({ size = 34 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <defs>
        <linearGradient id="brandGrad" x1="0" y1="0" x2="34" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#6D28D9" />
          <stop offset="0.55" stopColor="#9333EA" />
          <stop offset="1" stopColor="#DB2777" />
        </linearGradient>
      </defs>
      <rect width="34" height="34" rx="10" fill="url(#brandGrad)" />
      <line x1="11" y1="13" x2="22" y2="10" stroke="rgba(255,255,255,0.65)" strokeWidth="1.4" />
      <line x1="11" y1="13" x2="20" y2="23" stroke="rgba(255,255,255,0.65)" strokeWidth="1.4" />
      <line x1="22" y1="10" x2="20" y2="23" stroke="rgba(255,255,255,0.4)" strokeWidth="1.4" />
      <circle cx="11" cy="13" r="3" fill="#fff" />
      <circle cx="22" cy="10" r="2.2" fill="#fff" />
      <circle cx="20" cy="23" r="2.6" fill="#fff" />
    </svg>
  )
}

/* Ambient network-of-nodes decoration, the recurring signature
   motif standing for the vector index underneath every repository.
   Purely decorative; used sparingly (auth hero, empty states). */
export function Constellation({ className, style }) {
  const nodes = [
    { x: 40, y: 60, r: 5 }, { x: 150, y: 30, r: 3.5 }, { x: 250, y: 90, r: 6 },
    { x: 90, y: 160, r: 4 }, { x: 210, y: 190, r: 3.5 }, { x: 320, y: 150, r: 5 },
    { x: 300, y: 40, r: 3 }, { x: 60, y: 250, r: 4.5 }, { x: 180, y: 280, r: 3 },
  ]
  const edges = [[0,1],[1,2],[0,3],[1,3],[2,4],[3,4],[4,5],[2,6],[3,7],[4,8],[7,8]]
  return (
    <svg viewBox="0 0 360 320" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <g stroke="rgba(255,255,255,0.28)" strokeWidth="1">
        {edges.map(([a, b], i) => (
          <line key={i} x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y} />
        ))}
      </g>
      {nodes.map((n, i) => (
        <circle
          key={i}
          cx={n.x}
          cy={n.y}
          r={n.r}
          fill="#fff"
          style={{
            opacity: 0.8,
            animation: `pulseGlow ${3 + (i % 4)}s ease-in-out infinite`,
            animationDelay: `${i * 0.3}s`,
          }}
        />
      ))}
    </svg>
  )
}

/* Radial "confidence ring" — the signature element of the Q&A view.
   Replaces a plain percentage with a scored arc so relevance is felt
   visually, not just read. */
export function ScoreRing({ score, size = 46 }) {
  const pct = Math.max(0, Math.min(1, score || 0))
  const stroke = 3.5
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset = c * (1 - pct)
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-stamp-soft)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="var(--color-stamp)" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: 'var(--color-stamp)',
      }}>
        {Math.round(pct * 100)}
      </div>
    </div>
  )
}
