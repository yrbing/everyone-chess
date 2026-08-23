import { useEffect, useRef, useState } from 'react'

export type ChatMessage = {
  id: number
  sender: 'me' | 'opponent'
  text: string
  time: string
}

interface UseChatParams {
  incomingChat: { text: string } | null
  sendChat: (text: string) => void
}

function nowTime() {
  return new Date().toTimeString().slice(0, 5)
}

export function useChat({ incomingChat, sendChat }: UseChatParams) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const nextId = useRef(0)

  useEffect(() => {
    if (!incomingChat) return
    setMessages((prev) => [
      ...prev,
      {
        id: nextId.current++,
        sender: 'opponent',
        text: incomingChat.text,
        time: nowTime(),
      },
    ])
  }, [incomingChat])

  const sendMessage = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return
    setMessages((prev) => [
      ...prev,
      {
        id: nextId.current++,
        sender: 'me',
        text: trimmed,
        time: nowTime(),
      },
    ])
    sendChat(trimmed)
  }

  return { messages, sendMessage }
}
