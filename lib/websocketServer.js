import { WebSocketServer } from 'ws'

const wss = new WebSocketServer({ port: 3001 })

console.log('WebSocket server started on port 3001')

export default wss
