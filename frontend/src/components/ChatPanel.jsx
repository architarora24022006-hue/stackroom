import React, { useState } from 'react'
import { api } from '../api/client'
import { ScoreRing, Constellation } from './Visuals.jsx'

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

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 20 }}>
        {exchanges.length === 0 && (
          <div className="card" style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
            <div style={{ background: 'var(--gradient-brand-soft)', padding: '40px 24px', textAlign: 'center', position: 'relative' }}>
              <Constellation style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.3, filter: 'invert(1) hue-rotate(180deg)' }} />
              <p style={{ position: 'relative', color: 'var(--color-ink-soft)', fontSize: 13, maxWidth: 380, margin: '0 auto' }}>
                Ask a question about the documents in this repository. Answers are grounded in retrieved passages, shown as scored sources below each answer.
              </p>
            </div>
          </div>
        )}
        {exchanges.map((ex, i) => (
          <div key={i}>
            <div className="eyebrow" style={{ marginBottom: 4 }}>question</div>
            <p style={{ fontWeight: 600, fontSize: 16, marginBottom: 10, fontFamily: 'var(--font-display)' }}>{ex.question}</p>
            <div className="card" style={{ padding: 18, background: 'var(--color-surface)', borderLeft: '3px solid var(--color-accent)', boxShadow: 'none' }}>
              <p style={{ whiteSpace: 'pre-wrap' }}>{ex.answer}</p>
            </div>
            {ex.sources.length > 0 && (
              <div style={{ marginTop: 14 }}>
                <div className="eyebrow" style={{ marginBottom: 8 }}>sources</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {ex.sources.map((src, si) => (
                    <div key={si} className="card" style={{ padding: 14, display: 'flex', gap: 14, alignItems: 'center' }}>
                      <ScoreRing score={src.similarity} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{src.documentName}</div>
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

      <form onSubmit={handleAsk} style={{ display: 'flex', gap: 10, position: 'sticky', bottom: 20 }}>
        <input
          type="text"
          placeholder="Ask a question about this repository…"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          disabled={asking}
          style={{ boxShadow: 'var(--shadow-card)' }}
        />
        <button className="btn-primary" type="submit" disabled={asking || !question.trim()} style={{ flexShrink: 0 }}>
          {asking ? 'Thinking…' : 'Ask'}
        </button>
      </form>
    </div>
  )
}
