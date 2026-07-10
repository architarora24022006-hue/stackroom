import React, { useRef, useState } from 'react'
import { api } from '../api/client'

export default function DocumentUpload({ repoId, onUploaded }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

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
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div>
      <div
        className="card"
        style={{
          padding: 24,
          textAlign: 'center',
          borderStyle: 'dashed',
          cursor: 'pointer',
          background: 'var(--color-surface-sunken)',
        }}
        onClick={() => inputRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => {
          e.preventDefault()
          handleFiles(e.dataTransfer.files)
        }}
      >
        <p style={{ fontSize: 13, color: 'var(--color-ink-soft)', marginBottom: 4 }}>
          {uploading ? 'Ingesting…' : 'Drop a document here, or click to browse'}
        </p>
        <p className="eyebrow">.txt · .md · .csv · .xlsx · .xls</p>
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
