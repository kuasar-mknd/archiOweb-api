import WebSocket from 'ws'
import axios from 'axios'

const urlWebSocket = 'ws://localhost:3001'
const requestInterval = 60000 // Temps en millisecondes (60000 ms = 1 minute)

async function loginUserAndGetToken () {
  try {
    const response = await axios.post('http://localhost:3000/api/users/login', {
      identifier: 'user@example.com', // Remplacer par les identifiants de test
      password: 'yourSecurePassword' // Remplacer par le mot de passe de test
    })
    return response.data.token
  } catch (error) {
    console.error('Erreur lors de la connexion:', error.message)
    return null
  }
}

function sendRequests (ws, token) {
  const weatherRequest = {
    type: 'getMyGardensWeather',
    token
  }
  ws.send(JSON.stringify(weatherRequest))

  const nearbyGardensRequest = {
    type: 'getNearbyGardens',
    latitude: '48.8566', // Exemple de latitude
    longitude: '2.3522', // Exemple de longitude
    token
  }
  ws.send(JSON.stringify(nearbyGardensRequest))
}

async function createWebSocketConnection (token) {
  const ws = new WebSocket(urlWebSocket)
  ws.on('open', () => {
    console.log('Connected to the server')
    sendRequests(ws, token) // Envoyer les requêtes initiales

    // Planifier l'envoi régulier des requêtes
    setInterval(() => sendRequests(ws, token), requestInterval)
  })

  ws.onmessage = (e) => {
    const message = e.data.toString() // Convertir le buffer en chaîne de caractères
    console.log('Message from server:', message)

    // Vous pouvez ensuite parser le message si c'est du JSON
    try {
      const data = JSON.parse(message)
      console.log(data)
    } catch (error) {
      console.error("Erreur lors de l'analyse du message:", error)
    }
  }

  ws.on('error', (error) => {
    console.error('WebSocket error:', error)
  })

  ws.on('close', () => {
    console.log('Disconnected from the server')
  })
}

async function testWebSocket () {
  // try to connect until we get a token
  let token = null
  while (!token) {
    token = await loginUserAndGetToken()
    if (!token) {
      console.log('Échec de la connexion. Nouvelle tentative dans 10 secondes.')
      await new Promise(resolve => setTimeout(resolve, 10000))
    }
  }
  if (token) {
    createWebSocketConnection(token)
  } else {
    console.log('Échec de la connexion. Impossible d\'obtenir le token.')
  }
}

testWebSocket()
