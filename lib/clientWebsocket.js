import WebSocket from 'ws'

const url = 'ws://localhost:3001' // Remplacez par l'URL de votre serveur WebSocket
const connection = new WebSocket(url)

connection.onopen = () => {
  console.log('Connected to the server')
  // Envoyer un message au serveur WebSocket
  connection.send('Hello from the client!')
}

connection.onerror = (error) => {
  console.error(`WebSocket error: ${error}`)
}

connection.onmessage = (e) => {
  console.log(e.data)
}

connection.onclose = () => {
  console.log('Connection closed')
}
