import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { Constellation } from '../components/Visuals.jsx'

const CARD_ACCENTS = ['#6D28D9', '#DB2777', '#0D9488', '#9333EA', '#CA8A04', '#2563EB']

function repoAccent(id) {
  let hash = 0
  const s = String(id)
  for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) >>> 0
  return CARD_ACCENTS[hash % CARD_ACCENTS.length]
}

export default function Dashboard() {
  const [repositories, setRepositories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [creating, setCreating] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const data = await api.listRepositories()
      setRepositories(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleCreate(e) {
    e.preventDefault()
    setCreating(true)
    setError('')
    try {
      await api.createRepository({ name, description })
      setName('')
      setDescription('')
      setShowForm(false)
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div>
      <div style={{
        background: 'linear-gradient(-45deg, #4C1D95, #7C3AED, #DB2777, #6D28D9)',
        backgroundSize: '300% 300%',
        animation: 'gradientShift 12s ease infinite',
        position: 'relative', overflow: 'hidden',
      }}>
        <Constellation style={{ position: 'absolute', right: -40, top: -60, width: 420, height: 380, opacity: 0.5, animation: 'floatSlow 7s ease-in-out infinite' }} />
        <div className="container" style={{ position: 'relative', padding: '44px 24px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24, flexWrap: 'wrap' }}>
          <div>
            <div className="eyebrow" style={{ color: 'rgba(255,255,255,0.75)', marginBottom: 8 }}>team repositories</div>
            <h1 className="shimmer-text" style={{ fontSize: 32 }}>Your knowledge bases</h1>
            <p style={{ color: 'rgba(255,255,255,0.85)', marginTop: 8, maxWidth: 460, fontSize: 14 }}>
              Each repository is its own indexed set of documents — ask questions and get answers sourced straight from what's inside it.
            </p>
          </div>
          <button
            onClick={() => setShowForm(s => !s)}
            style={{
              background: '#fff', color: 'var(--color-accent)', padding: '11px 20px',
              borderRadius: 'var(--radius-sm)', fontWeight: 700, boxShadow: '0 6px 20px rgba(0,0,0,0.18)',
              flexShrink: 0,
            }}
          >
            {showForm ? 'Cancel' : '+ New repository'}
          </button>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>
        {error && <div className="error-banner">{error}</div>}

        {showForm && (
          <form onSubmit={handleCreate} className="card" style={{ padding: 24, marginBottom: 28, borderTop: '3px solid var(--color-accent)' }}>
            <div className="field">
              <label htmlFor="repoName">Name</label>
              <input id="repoName" type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Billing FAQ" />
            </div>
            <div className="field">
              <label htmlFor="repoDesc">Description</label>
              <textarea id="repoDesc" rows={2} value={description} onChange={e => setDescription(e.target.value)} placeholder="What questions will this repository answer?" />
            </div>
            <button className="btn-primary" type="submit" disabled={creating}>
              {creating ? 'Creating…' : 'Create repository'}
            </button>
          </form>
        )}

        {loading ? (
          <p style={{ color: 'var(--color-ink-soft)' }}>Loading repositories…</p>
        ) : repositories.length === 0 ? (
          <div className="card" style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
            <div style={{ background: 'var(--gradient-brand-soft)', padding: '56px 24px', textAlign: 'center', position: 'relative' }}>
              <Constellation style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.35, filter: 'invert(1) hue-rotate(180deg)' }} />
              <div style={{ position: 'relative' }}>
                <h3 style={{ fontSize: 20, marginBottom: 10 }}>No repositories yet</h3>
                <p style={{ color: 'var(--color-ink-soft)', marginBottom: 20, maxWidth: 380, marginLeft: 'auto', marginRight: 'auto' }}>
                  Create one, upload your team's documents, and start asking questions grounded in real sources.
                </p>
                <button className="btn-primary" onClick={() => setShowForm(true)}>+ New repository</button>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 18 }}>
            {repositories.map(repo => {
              const accent = repoAccent(repo.id)
              return (
                <Link key={repo.id} to={`/repositories/${repo.id}`} style={{ textDecoration: 'none' }}>
                  <div
                    className="card"
                    style={{
                      padding: 20, height: '100%', borderTop: `3px solid ${accent}`,
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lift)' }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-card)' }}
                  >
                    <div style={{
                      width: 34, height: 34, borderRadius: 9, background: `${accent}1a`,
                      color: accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 14,
                    }}>
                      {repo.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <h3 style={{ fontSize: 18, marginBottom: 8 }}>{repo.name}</h3>
                    <p style={{ fontSize: 13, color: 'var(--color-ink-soft)', minHeight: 36 }}>
                      {repo.description || 'No description'}
                    </p>
                    <div className="eyebrow" style={{ marginTop: 14, color: accent }}>
                      {repo.documentCount ?? 0} document{repo.documentCount === 1 ? '' : 's'}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
