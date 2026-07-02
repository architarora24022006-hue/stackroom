import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import AuthHero from '../components/AuthHero.jsx'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Could not sign in.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="card" style={{
        width: '100%', maxWidth: 840, padding: 0, overflow: 'hidden',
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        boxShadow: '0 25px 70px rgba(76, 29, 149, 0.45), 0 8px 24px rgba(219, 39, 119, 0.25)',
      }}>
        <AuthHero
          eyebrow="welcome back"
          title="Answers grounded in what your team actually knows."
          blurb="Every response here is traced back to the passage it came from — no guesswork, just retrieval you can verify."
        />
        <div style={{ padding: '48px 44px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div className="eyebrow" style={{ marginBottom: 6 }}>sign in</div>
          <h1 style={{ fontSize: 28, marginBottom: 24 }}>Welcome back</h1>
          {error && <div className="error-banner">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button className="btn-primary" type="submit" disabled={submitting} style={{ width: '100%', marginTop: 8 }}>
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
          <p style={{ marginTop: 20, fontSize: 13, color: 'var(--color-ink-soft)' }}>
            New team? <Link to="/register" style={{ color: 'var(--color-accent)', fontWeight: 600 }}>Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
