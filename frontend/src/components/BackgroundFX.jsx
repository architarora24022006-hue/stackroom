import React from 'react'

/* Full-screen floating gradient orbs + sparkle field, fixed behind
   everything. Purely decorative, ignores pointer events. */
export default function BackgroundFX() {
  const sparkles = React.useMemo(() => (
    Array.from({ length: 24 }, (_, i) => ({
      id: i,
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: 2 + Math.random() * 3,
      delay: Math.random() * 4,
      duration: 2 + Math.random() * 3,
    }))
  ), [])

  return (
    <>
      <div className="orb" style={{
        width: 480, height: 480, top: '-10%', left: '-8%',
        background: 'radial-gradient(circle, #F0ABFC, transparent 70%)',
        animation: 'orbFloat1 14s ease-in-out infinite',
      }} />
      <div className="orb" style={{
        width: 560, height: 560, top: '30%', right: '-12%',
        background: 'radial-gradient(circle, #818CF8, transparent 70%)',
        animation: 'orbFloat2 18s ease-in-out infinite',
      }} />
      <div className="orb" style={{
        width: 420, height: 420, bottom: '-10%', left: '20%',
        background: 'radial-gradient(circle, #FB7185, transparent 70%)',
        animation: 'orbFloat3 16s ease-in-out infinite',
      }} />
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        {sparkles.map(s => (
          <div
            key={s.id}
            style={{
              position: 'absolute',
              top: `${s.top}%`,
              left: `${s.left}%`,
              width: s.size,
              height: s.size,
              borderRadius: '50%',
              background: '#fff',
              boxShadow: '0 0 8px 2px rgba(255,255,255,0.8)',
              animation: `sparkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
            }}
          />
        ))}
      </div>
    </>
  )
}
