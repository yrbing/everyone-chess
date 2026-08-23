import { WebSocketServer, WebSocket } from 'ws'
import type { ClientMessage, ServerMessage } from '@everyone-chess/shared'

// This is a simple WebSocket server that manages chess games between two players.
// It keeps track of rooms, where each room has a white player and optionally a black player.
type Room = { white?: WebSocket; black?: WebSocket }
// The rooms map stores the active game rooms, keyed by a unique room code.
const rooms = new Map<string, Room>()

// Generates a random 4-character room code consisting of uppercase letters and numbers.
function makeRoomCode(): string {
  return Math.random().toString(36).slice(2, 6).toUpperCase()
}

// Sends a message to a WebSocket client by serializing the message object to JSON.
function send(socket: WebSocket, message: ServerMessage) {
  socket.send(JSON.stringify(message))
}

// - findRoom is a linear scan over all rooms by socket identity —
// fine at this scale, and it avoids storing a second "socket → room" index that you'd have to keep in sync.
function findRoom(socket: WebSocket): [string, Room] | undefined {
  for (const [code, room] of rooms) {
    if (room.white === socket || room.black === socket) return [code, room]
  }
  return undefined
}

const port = Number(process.env.PORT) || 3001
const wss = new WebSocketServer({ port })

wss.on('connection', (socket) => {
  socket.on('message', (data) => {
    const message: ClientMessage = JSON.parse(data.toString())

    switch (message.type) {
      case 'create': {
        const code = makeRoomCode()
        if (message.color === 'white') {
          rooms.set(code, { white: socket })
        } else {
          rooms.set(code, { black: socket })
        }
        send(socket, { type: 'created', code })
        console.log(`Room created: ${code}`)
        break
      }
      case 'join': {
        const room = rooms.get(message.code)
        if (!room) {
          send(socket, { type: 'error', message: 'Room not found' })
        } else if (room.white && room.black) {
          send(socket, { type: 'error', message: 'Room is full' })
        } else if (room.white === socket || room.black === socket) {
          send(socket, {
            type: 'error',
            message: 'You are already in this room',
          })
        } else {
          if (!room.white) {
            room.white = socket
          }
          if (!room.black) {
            room.black = socket
          }
          send(room.white, { type: 'start', color: 'white' })
          send(room.black, { type: 'start', color: 'black' })
          console.log(`Room joined: ${message.code}`)
        }
        break
      }
      case 'move': {
        const found = findRoom(socket)
        if (!found) {
          send(socket, { type: 'error', message: 'Not in a room' })
          break
        }
        const [code, room] = found
        const opponent = room.white === socket ? room.black : room.white
        if (!opponent) {
          send(socket, { type: 'error', message: 'No opponent' })
          break
        }
        send(opponent, {
          type: 'move',
          from: message.from,
          to: message.to,
          promotion: message.promotion,
        })
        console.log(`Move in room ${code}: ${message.from} -> ${message.to}`)
        break
      }
      case 'chat': {
        const found = findRoom(socket)
        console.log(`receive chat: ${message.text}`)
        if (!found) {
          send(socket, { type: 'error', message: 'Not in a room' })
          break
        }
        const [_, room] = found
        const opponent = room.white === socket ? room.black : room.white
        if (opponent) {
          send(opponent, { type: 'chat', text: message.text })
        }
        console.log(`send chat: ${message.text}`)
        break
      }
      default: {
        const found = findRoom(socket)
        if (!found) {
          send(socket, { type: 'error', message: 'Not in a room' })
        }
        break
      }
    }
  })

  socket.on('close', () => {
    const found = findRoom(socket)
    if (!found) {
      return
    }
    const [code, room] = found
    if (code) {
      const opponent = room.white === socket ? room.black : room.white
      if (opponent) {
        send(opponent, { type: 'opponentLeft' })
      }
      rooms.delete(code)
      console.log(`Room deleted: ${code}`)
    }
  })
})

const externalUrl = process.env.RENDER_EXTERNAL_URL
const displayUrl = externalUrl
  ? externalUrl.replace('https://', 'wss://')
  : `ws://localhost:${port}`

console.log(`listening on ${displayUrl}`)
