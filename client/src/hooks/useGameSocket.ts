import { useCallback, useEffect, useRef } from 'react'
import type { ClientMessage, ServerMessage } from '@everyone-chess/shared'

const WS_URL = import.meta.env.VITE_WS_URL ?? 'ws://localhost:3001'

export function useGameSocket(onMessage: (message: ServerMessage) => void) {
  const socketRef = useRef<WebSocket | null>(null)
  const onMessageRef = useRef(onMessage)

  useEffect(() => {
    onMessageRef.current = onMessage
  }, [onMessage])

  useEffect(() => {
    const socket = new WebSocket(WS_URL)
    socketRef.current = socket

    socket.onmessage = (e) => {
      console.log('received ws message:', e.data)
      onMessageRef.current(JSON.parse(e.data))
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

  const createRoom = useCallback(() => send({ type: 'create' }), [send])

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

  return { createRoom, joinRoom, sendMove, sendChat }
}
