import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'

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
    <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 8 }}>team repositories</div>
          <h1 style={{ fontSize: 34 }}>Your knowledge bases</h1>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(s => !s)}>
          {showForm ? 'Cancel' : '+ New repository'}
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {showForm && (
        <form onSubmit={handleCreate} className="card" style={{ padding: 24, marginBottom: 28 }}>
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
        <div className="card" style={{ padding: 48, textAlign: 'center' }}>
          <p style={{ color: 'var(--color-ink-soft)', marginBottom: 16 }}>
            No repositories yet. Create one to start uploading documents and asking questions.
          </p>
          <button className="btn-primary" onClick={() => setShowForm(true)}>New repository</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {repositories.map((repo, i) => {
            const palette = ['var(--color-accent)', 'var(--color-stamp)', '#3D5A6C', '#7A4B3A']
            const color = palette[i % palette.length]
            return (
              <Link key={repo.id} to={`/repositories/${repo.id}`} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ padding: 20, height: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                    <div className="icon-tile" style={{ background: color }}>
                      {repo.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <h3 style={{ fontSize: 18 }}>{repo.name}</h3>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--color-ink-soft)', minHeight: 36 }}>
                    {repo.description || 'No description'}
                  </p>
                  <div className="badge" style={{ marginTop: 14 }}>
                    {repo.documentCount ?? 0} document{repo.documentCount === 1 ? '' : 's'}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
