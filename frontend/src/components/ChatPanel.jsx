import React, { useState } from 'react'
import { api } from '../api/client'

function ScoreStamp({ score }) {
  const pct = Math.round(score * 100)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{
        width: 46, height: 46, borderRadius: '50%',
        border: '2px solid var(--color-stamp)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--color-stamp)', fontFamily: 'var(--font-mono)',
        fontSize: 12, fontWeight: 500, flexShrink: 0,
        transform: 'rotate(-6deg)',
      }}>
        {pct}%
      </div>
    </div>
  )
}

export default function ChatPanel({ repoId }) {
  const [question, setQuestion] = useState('')
  const [exchanges, setExchanges] = useState([])
  const [asking, setAsking] = useState(false)
  const [error, setError] = useState('')

  async function handleAsk(e) {
    e.preventDefault()
    if (!question.trim()) return
    setAsking(true)
    setError('')
    const q = question
    setQuestion('')
    try {
      const result = await api.askQuestion(repoId, q)
      setExchanges(prev => [...prev, { question: q, answer: result.answer, sources: result.sources || [] }])
    } catch (err) {
      setError(err.message)
    } finally {
      setAsking(false)
    }
  }

  return (
    <div>
      {error && <div className="error-banner">{error}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 20 }}>
        {exchanges.length === 0 && (
          <p style={{ color: 'var(--color-ink-soft)', fontSize: 13 }}>
            Ask a question about the documents in this repository. Answers are grounded in retrieved passages, shown as sources below each answer.
          </p>
        )}
        {exchanges.map((ex, i) => (
          <div key={i}>
            <div className="eyebrow" style={{ marginBottom: 4 }}>question</div>
            <p style={{ fontWeight: 500, marginBottom: 10 }}>{ex.question}</p>
            <div className="card" style={{ padding: 16, background: 'var(--color-accent-soft)', border: 'none' }}>
              <p style={{ whiteSpace: 'pre-wrap' }}>{ex.answer}</p>
            </div>
            {ex.sources.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <div className="eyebrow" style={{ marginBottom: 8 }}>sources</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {ex.sources.map((src, si) => (
                    <div key={si} className="card" style={{ padding: 14, display: 'flex', gap: 14, alignItems: 'center' }}>
                      <ScoreStamp score={src.similarity} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>{src.documentName}</div>
                        <div style={{ fontSize: 12, color: 'var(--color-ink-soft)', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                          {src.excerpt}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleAsk} style={{ display: 'flex', gap: 10 }}>
        <input
          type="text"
          placeholder="Ask a question about this repository…"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          disabled={asking}
        />
        <button className="btn-primary" type="submit" disabled={asking || !question.trim()}>
          {asking ? 'Thinking…' : 'Ask'}
        </button>
      </form>
    </div>
  )
}
