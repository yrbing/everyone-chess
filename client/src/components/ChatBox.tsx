import { useEffect, useRef, useState } from 'react'
import type React from 'react'
import { useChat } from '@/hooks/useChat'
import './ChatBox.css'

const QUICK_PHRASES = ['GOOD GAME', 'NICE MOVE', 'OOPS', 'REMATCH?']

interface ChatBoxProps {
  incomingChat: { text: string } | null
  sendChat: (text: string) => void
  disabled?: boolean
}

export function ChatBox({
  incomingChat,
  sendChat,
  disabled = false,
}: ChatBoxProps) {
  const { messages, sendMessage } = useChat({
    incomingChat,
    sendChat,
  })
  const [draft, setDraft] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = endRef.current
    if (el?.parentElement)
      el.parentElement.scrollTop = el.parentElement.scrollHeight
  }, [messages])

  function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault()
    if (!draft.trim() || disabled) return
    sendMessage(draft)
    setDraft('')
  }

  return (
    <div className="chat-box">
      <div className="cb-hd">
        <span className="cb-hd-t">CHAT</span>
        <span className="cb-hd-sp" />
        <span className={`cb-dot${disabled ? ' cb-dot--off' : ''}`} />
        <span className="cb-hd-s">{disabled ? 'OFFLINE' : 'ONLINE'}</span>
      </div>

      <div className="cb-log">
        {messages.map((m) => {
          const mine = m.sender === 'me'
          return (
            <div key={m.id} className={`cb-row${mine ? ' cb-row--me' : ''}`}>
              <div className="cb-meta">
                <span className={`cb-who${mine ? ' cb-who--me' : ''}`}>
                  {mine ? 'YOU' : 'OPPONENT'}
                </span>
                <span className="cb-time">{m.time}</span>
              </div>
              <div className={`cb-bub${mine ? ' cb-bub--me' : ''}`}>
                {m.text}
              </div>
            </div>
          )
        })}
        <div ref={endRef} />
      </div>

      <div className="cb-quick">
        {QUICK_PHRASES.map((q) => (
          <button
            type="button"
            key={q}
            className="cb-q"
            disabled={disabled}
            onClick={() => sendMessage(q)}
          >
            {q}
          </button>
        ))}
      </div>

      <form className="cb-form" onSubmit={handleSubmit}>
        <span className="cb-caret">&gt;</span>
        <input
          className="cb-in"
          value={draft}
          maxLength={120}
          disabled={disabled}
          placeholder={disabled ? 'CHAT DISABLED' : 'TYPE MESSAGE'}
          aria-label="Message"
          onChange={(e) => setDraft(e.target.value)}
        />
        <button
          type="submit"
          className="cb-send"
          disabled={disabled || !draft.trim()}
        >
          SEND
        </button>
      </form>
    </div>
  )
}
