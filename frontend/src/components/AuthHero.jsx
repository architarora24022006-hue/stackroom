import React from 'react'
import { BrandMark, Constellation } from './Visuals.jsx'

export default function AuthHero({ eyebrow, title, blurb }) {
  return (
    <div style={{
      background: 'linear-gradient(-45deg, #4C1D95, #7C3AED, #DB2777, #6D28D9, #312E81)',
      backgroundSize: '300% 300%',
      animation: 'gradientShift 10s ease infinite',
      color: '#fff',
      padding: '48px 44px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      position: 'relative',
      overflow: 'hidden',
      minHeight: 520,
    }}>
      <Constellation style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%',
        opacity: 0.9, animation: 'floatSlow 8s ease-in-out infinite',
      }} />
      <div className="orb" style={{
        width: 220, height: 220, bottom: -60, right: -60,
        background: 'radial-gradient(circle, #F0ABFC, transparent 70%)',
        animation: 'orbFloat1 9s ease-in-out infinite', position: 'absolute',
      }} />
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ background: 'rgba(255,255,255,0.16)', borderRadius: 10, padding: 4 }}>
          <BrandMark size={26} />
        </div>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 }}>Stackroom</span>
      </div>
      <div style={{ position: 'relative' }}>
        <div className="eyebrow" style={{ color: 'rgba(255,255,255,0.75)', marginBottom: 10 }}>{eyebrow}</div>
        <h2 className="shimmer-text" style={{ fontSize: 34, lineHeight: 1.15, marginBottom: 14, maxWidth: 340 }}>{title}</h2>
        <p style={{ fontSize: 14, lineHeight: 1.6, color: 'rgba(255,255,255,0.82)', maxWidth: 320 }}>{blurb}</p>
      </div>
    </div>
  )
}
