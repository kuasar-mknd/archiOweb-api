import WebSocket from 'ws'
import axios from 'axios'

const urlWebSocket = 'ws://localhost:3001'

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

async function createWebSocketConnection (token) {
  const ws = new WebSocket(urlWebSocket)

  ws.on('open', () => {
    console.log('Connected to the server')

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
  const token = await loginUserAndGetToken()
  if (token) {
    createWebSocketConnection(token)
  } else {
    console.log('Échec de la connexion. Impossible d\'obtenir le token.')
  }
}

testWebSocket()
