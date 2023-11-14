import { WebSocketServer } from 'ws'

// Création d'un serveur WebSocket sur le port 3000.
const wss = new WebSocketServer({
  port: 3000
})
// Attend qu'un client se connecte
wss.on('connection', function connection (ws) {
  // Quand on reçoit un message du client, on le note dans la console.
  ws.on('message', function incoming (message) {
    console.log('received: %s', message)
  })
  // Send something to the client.
  ws.send('something')
})
