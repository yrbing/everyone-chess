import { useCallback, useEffect, useRef, useState } from 'react'
import type { ClientMessage, ServerMessage } from '@everyone-chess/shared'

const WS_URL = import.meta.env.VITE_WS_URL ?? 'ws://localhost:3001'

export function useGameSocket(onMessage: (message: ServerMessage) => void) {
  const socketRef = useRef<WebSocket | null>(null)
  const onMessageRef = useRef(onMessage)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    onMessageRef.current = onMessage
  }, [onMessage])

  useEffect(() => {
    const socket = new WebSocket(WS_URL)
    socketRef.current = socket

    socket.onopen = () => {
      setConnected(true)
    }

    socket.onmessage = (e) => {
      console.log('received ws message:', e.data)
      onMessageRef.current(JSON.parse(e.data))
    }

    socket.onclose = () => {
      setConnected(false)
    }

    socket.onerror = () => {
      console.error('WebSocket error')
    }

    return () => {
      socket.close()
    }
  }, [])

  const send = useCallback((message: ClientMessage) => {
    console.log('sending ws message:', message, socketRef.current?.readyState)
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message))
    }
  }, [])

  const createRoom = useCallback(
    (color: 'white' | 'black') => send({ type: 'create', color }),
    [send],
  )

  const joinRoom = useCallback(
    (code: string) => send({ type: 'join', code }),
    [send],
  )

  const sendMove = useCallback(
    (move: { from: string; to: string; promotion?: string }) =>
      send({ type: 'move', ...move }),
    [send],
  )

  const sendChat = useCallback(
    (text: string) => send({ type: 'chat', text }),
    [send],
  )

  return { createRoom, joinRoom, sendMove, sendChat, connected }
}
