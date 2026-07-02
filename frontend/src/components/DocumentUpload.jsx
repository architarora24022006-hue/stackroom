import React, { useRef, useState } from 'react'
import { api } from '../api/client'

function UploadIcon({ active }) {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
      <rect x="1" y="1" width="28" height="28" rx="8" fill={active ? 'var(--color-accent)' : 'var(--color-accent-soft)'} style={{ transition: 'fill 0.15s ease' }} />
      <path d="M15 20V10M15 10L10.5 14.5M15 10L19.5 14.5" stroke={active ? '#fff' : 'var(--color-accent)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'stroke 0.15s ease' }} />
    </svg>
  )
}

export default function DocumentUpload({ repoId, onUploaded }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)

  async function handleFiles(files) {
    if (!files || files.length === 0) return
    setUploading(true)
    setError('')
    try {
      for (const file of files) {
        await api.uploadDocument(repoId, file)
      }
      onUploaded()
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
      setDragging(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const active = dragging || uploading

  return (
    <div>
      <div
        className="card"
        style={{
          padding: 28,
          textAlign: 'center',
          borderStyle: 'dashed',
          borderWidth: 2,
          borderColor: active ? 'var(--color-accent)' : 'var(--color-line)',
          cursor: 'pointer',
          background: active ? 'var(--color-accent-soft)' : 'var(--color-surface-sunken)',
          transition: 'all 0.15s ease',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
        }}
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => {
          e.preventDefault()
          handleFiles(e.dataTransfer.files)
        }}
      >
        <UploadIcon active={active} />
        <p style={{ fontSize: 13, color: 'var(--color-ink-soft)', margin: 0, fontWeight: 500 }}>
          {uploading ? 'Ingesting…' : 'Drop a document here, or click to browse'}
        </p>
        <p className="eyebrow" style={{ margin: 0 }}>.txt · .md · .csv · .xlsx · .xls</p>
        <input
          ref={inputRef}
          type="file"
          accept=".txt,.md,.csv,.xlsx,.xls"
          style={{ display: 'none' }}
          onChange={e => handleFiles(e.target.files)}
        />
      </div>
      {error && <div className="error-banner" style={{ marginTop: 12 }}>{error}</div>}
    </div>
  )
}
