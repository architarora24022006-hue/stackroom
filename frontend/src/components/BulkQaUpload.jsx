import React, { useRef, useState } from 'react'
import { api } from '../api/client'

export default function BulkQaUpload({ repoId }) {
  const inputRef = useRef(null)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function handleFile(files) {
    const file = files?.[0]
    if (!file) return
    setProcessing(true)
    setError('')
    setDone(false)
    try {
      const { blob, filename } = await api.bulkAsk(repoId, file)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
      setDone(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setProcessing(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="card" style={{ padding: 18, marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 3 }}>Bulk question answering</div>
          <div style={{ fontSize: 12.5, color: 'var(--color-ink-soft)' }}>
            Upload an Excel file with a "Question" column — get it back with an "Answer" column filled in.
          </div>
        </div>
        <button
          className="btn-secondary"
          onClick={() => inputRef.current?.click()}
          disabled={processing}
          style={{ flexShrink: 0 }}
        >
          {processing ? 'Answering…' : 'Upload questions'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          style={{ display: 'none' }}
          onChange={e => handleFile(e.target.files)}
        />
      </div>
      {error && <div className="error-banner" style={{ marginTop: 12 }}>{error}</div>}
      {done && !error && (
        <div className="badge" style={{ marginTop: 12 }}>Answered file downloaded</div>
      )}
    </div>
  )
}
