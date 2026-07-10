import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import AuthSidePanel from '../components/AuthSidePanel.jsx'

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
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr' }} className="auth-grid">
      <AuthSidePanel />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)' }}>
        <div style={{ width: 380, maxWidth: '90vw' }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>welcome back</div>
          <h1 style={{ fontSize: 30, marginBottom: 28 }}>Sign in to Stackroom</h1>
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
          <p style={{ marginTop: 24, fontSize: 13, color: 'var(--color-ink-soft)' }}>
            New team? <Link to="/register" style={{ color: 'var(--color-accent)', fontWeight: 600 }}>Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
