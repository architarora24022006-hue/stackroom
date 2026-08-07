import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api/client'
import DocumentUpload from '../components/DocumentUpload.jsx'
import ChatPanel from '../components/ChatPanel.jsx'
import BulkQaUpload from '../components/BulkQaUpload.jsx'

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
      <Link to="/" style={{ fontSize: 13, color: 'var(--color-ink-soft)', textDecoration: 'none' }}>&larr; All repositories</Link>
      <div style={{ marginTop: 12, marginBottom: 28 }}>
        <div className="eyebrow" style={{ marginBottom: 8 }}>repository</div>
        <h1 style={{ fontSize: 32, marginBottom: 8 }}>{repo.name}</h1>
        {repo.description && <p style={{ color: 'var(--color-ink-soft)' }}>{repo.description}</p>}
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '2px solid var(--color-line)' }}>
        {['ask', 'documents'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              background: 'transparent',
              padding: '10px 16px',
              marginBottom: -2,
              borderBottom: tab === t ? '2px solid var(--color-accent)' : '2px solid transparent',
              color: tab === t ? 'var(--color-ink)' : 'var(--color-ink-soft)',
              fontWeight: tab === t ? 700 : 500,
              borderRadius: 0,
            }}
          >
            {t === 'ask' ? 'Ask' : `Documents (${documents.length})`}
          </button>
        ))}
      </div>

      {tab === 'ask' ? (
        <div>
          <BulkQaUpload repoId={id} />
          <ChatPanel repoId={id} />
        </div>
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
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{doc.filename}</div>
                    <div className="eyebrow" style={{ marginTop: 2 }}>
                      {doc.chunkCount ?? 0} chunks · {doc.status || 'indexed'}
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
