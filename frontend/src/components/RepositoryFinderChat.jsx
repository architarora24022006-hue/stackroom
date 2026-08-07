import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'

export default function RepositoryFinderChat() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! Ask me anything — I'll find the right repository and answer it directly." }
  ])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [pendingQuestion, setPendingQuestion] = useState(null)
  const [lastRepo, setLastRepo] = useState(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  async function handleSend(e) {
    e.preventDefault()
    const text = input.trim()
    if (!text || sending) return

    const history = messages.map(m => ({ role: m.role, content: m.content }))
    const questionForThisTurn = pendingQuestion ?? text

    setMessages(prev => [...prev, { role: 'user', content: text }])
    setInput('')
    setSending(true)

    try {
      const routing = await api.findRepository(text, history)

      if (routing.resolved && routing.repositoryId) {
        setMessages(prev => [...prev, { role: 'assistant', content: routing.reply }])
        setLastRepo({ id: routing.repositoryId, name: routing.repositoryName })

        const answer = await api.askQuestion(routing.repositoryId, questionForThisTurn)
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: answer.answer,
          sources: answer.sources,
        }])
        setPendingQuestion(null)
      } else {
        setPendingQuestion(questionForThisTurn)
        setMessages(prev => [...prev, { role: 'assistant', content: routing.reply }])
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, something went wrong. Try again in a moment." }])
    } finally {
      setSending(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="btn-primary"
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 40,
          borderRadius: '999px', padding: '14px 20px',
          boxShadow: '0 4px 16px rgba(30,42,34,0.25)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}
      >
        <span style={{ fontSize: 16 }}>💬</span> Ask anything
      </button>
    )
  }

  return (
    <div
      className="card"
      style={{
        position: 'fixed', bottom: 24, right: 24, zIndex: 40,
        width: 360, maxWidth: '90vw', height: 480, maxHeight: '78vh',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}
    >
      <div style={{
        padding: '14px 16px', borderBottom: '1px solid var(--color-line)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'var(--color-accent)', color: '#fff',
      }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>Ask anything</div>
          <div style={{ fontSize: 11, opacity: 0.8 }}>finds the right repository, then answers</div>
        </div>
        <button onClick={() => setOpen(false)} style={{ background: 'transparent', color: '#fff', fontSize: 18, padding: 4, lineHeight: 1 }}>
          ✕
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start', gap: 6 }}>
            <div
              style={{
                maxWidth: '85%',
                background: m.role === 'user' ? 'var(--color-accent)' : 'var(--color-surface-sunken)',
                color: m.role === 'user' ? '#fff' : 'var(--color-ink)',
                padding: '9px 12px', borderRadius: 10, fontSize: 13.5, lineHeight: 1.4, whiteSpace: 'pre-wrap',
              }}
            >
              {m.content}
            </div>
            {m.sources && m.sources.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, maxWidth: '85%' }}>
                {m.sources.map((s, si) => (
                  <span key={si} className="badge" style={{ fontSize: 10 }}>
                    {s.documentName} · {Math.round(s.similarity * 100)}%
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}

        {lastRepo && !sending && (
          <button className="btn-secondary" style={{ alignSelf: 'flex-start', fontSize: 12 }} onClick={() => navigate(`/repositories/${lastRepo.id}`)}>
            Open {lastRepo.name} →
          </button>
        )}

        {sending && <div style={{ alignSelf: 'flex-start', fontSize: 12.5, color: 'var(--color-ink-soft)' }}>Thinking…</div>}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} style={{ padding: 10, borderTop: '1px solid var(--color-line)', display: 'flex', gap: 8 }}>
        <input
          type="text"
          placeholder="Ask a question…"
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={sending}
          style={{ fontSize: 13.5 }}
        />
        <button className="btn-primary" type="submit" disabled={sending || !input.trim()} style={{ padding: '8px 14px' }}>
          →
        </button>
      </form>
    </div>
  )
}
