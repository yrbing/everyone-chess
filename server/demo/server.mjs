import { WebSocketServer } from 'ws'

const wss = new WebSocketServer({ port: 3001 })
const clients = new Set()

wss.on('connection', (socket) => {
  console.log('client connected, total:', clients.size + 1)
  clients.add(socket)

  socket.on('message', (data) => {
    console.log('received:', data.toString())
    for (const client of clients) {
      client.send(data.toString())
    }
  })

  socket.on('close', () => {
    clients.delete(socket)
    console.log('client disconnected, total:', clients.size)
  })
})

console.log('listening on ws://localhost:3001')
