import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import AuthHero from '../components/AuthHero.jsx'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [teamName, setTeamName] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await register(name, email, password, teamName)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Could not create your account.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="card" style={{
        width: '100%', maxWidth: 880, padding: 0, overflow: 'hidden',
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        boxShadow: '0 25px 70px rgba(76, 29, 149, 0.45), 0 8px 24px rgba(219, 39, 119, 0.25)',
      }}>
        <AuthHero
          eyebrow="new team"
          title="Turn scattered docs into a searchable, cited knowledge base."
          blurb="Upload what your team already has. Stackroom chunks, embeds, and indexes it so anyone can ask a question and get a sourced answer."
        />
        <div style={{ padding: '48px 44px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div className="eyebrow" style={{ marginBottom: 6 }}>set up your team</div>
          <h1 style={{ fontSize: 28, marginBottom: 24 }}>Create your workspace</h1>
          {error && <div className="error-banner">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="teamName">Team name</label>
              <input id="teamName" type="text" value={teamName} onChange={e => setTeamName(e.target.value)} required autoFocus />
            </div>
            <div className="field">
              <label htmlFor="name">Your name</label>
              <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} minLength={8} required />
            </div>
            <button className="btn-primary" type="submit" disabled={submitting} style={{ width: '100%', marginTop: 8 }}>
              {submitting ? 'Creating…' : 'Create account'}
            </button>
          </form>
          <p style={{ marginTop: 20, fontSize: 13, color: 'var(--color-ink-soft)' }}>
            Already have a team? <Link to="/login" style={{ color: 'var(--color-accent)', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
