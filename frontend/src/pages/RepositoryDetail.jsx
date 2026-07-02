import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api/client'
import DocumentUpload from '../components/DocumentUpload.jsx'
import ChatPanel from '../components/ChatPanel.jsx'

export default function RepositoryDetail() {
  const { id } = useParams()
  const [repo, setRepo] = useState(null)
  const [documents, setDocuments] = useState([])
  const [error, setError] = useState('')
  const [tab, setTab] = useState('ask')

  async function loadAll() {
    try {
      const [repoData, docs] = await Promise.all([
        api.getRepository(id),
        api.listDocuments(id),
      ])
      setRepo(repoData)
      setDocuments(docs)
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => { loadAll() }, [id])

  async function handleDeleteDocument(docId) {
    try {
      await api.deleteDocument(id, docId)
      setDocuments(docs => docs.filter(d => d.id !== docId))
    } catch (err) {
      setError(err.message)
    }
  }

  if (!repo) {
    return <div className="container" style={{ paddingTop: 40 }}>{error ? <div className="error-banner">{error}</div> : 'Loading…'}</div>
  }

  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
      <Link to="/" style={{ fontSize: 13, color: 'var(--color-accent)', textDecoration: 'none', fontWeight: 600 }}>&larr; All repositories</Link>
      <div style={{ marginTop: 12, marginBottom: 28 }}>
        <div className="eyebrow" style={{ marginBottom: 6 }}>repository</div>
        <h1 style={{ fontSize: 28, marginBottom: 6 }}>{repo.name}</h1>
        {repo.description && <p style={{ color: 'var(--color-ink-soft)' }}>{repo.description}</p>}
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div style={{ display: 'flex', gap: 6, marginBottom: 24, background: 'var(--color-surface-sunken)', padding: 5, borderRadius: 'var(--radius-md)', width: 'fit-content' }}>
        {['ask', 'documents'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              background: tab === t ? 'var(--color-surface)' : 'transparent',
              padding: '9px 18px',
              borderRadius: 'var(--radius-sm)',
              color: tab === t ? 'var(--color-accent)' : 'var(--color-ink-soft)',
              fontWeight: 600,
              boxShadow: tab === t ? 'var(--shadow-card)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            {t === 'ask' ? 'Ask' : `Documents (${documents.length})`}
          </button>
        ))}
      </div>

      {tab === 'ask' ? (
        <ChatPanel repoId={id} />
      ) : (
        <div>
          <div style={{ marginBottom: 20 }}>
            <DocumentUpload repoId={id} onUploaded={loadAll} />
          </div>
          {documents.length === 0 ? (
            <p style={{ color: 'var(--color-ink-soft)', fontSize: 13 }}>No documents yet. Upload one above to start building this repository's knowledge base.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {documents.map(doc => (
                <div key={doc.id} className="card" style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 30, height: 30, borderRadius: 8, background: 'var(--color-accent-soft)',
                      color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                    }}>
                      {(doc.filename?.split('.').pop() || 'doc').slice(0, 3).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{doc.filename}</div>
                      <div className="eyebrow" style={{ marginTop: 2 }}>
                        {doc.chunkCount ?? 0} chunks · {doc.status || 'indexed'}
                      </div>
                    </div>
                  </div>
                  <button className="btn-danger" onClick={() => handleDeleteDocument(doc.id)}>Remove</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
