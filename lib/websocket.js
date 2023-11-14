import { WebSocketServer } from 'ws'

async function fetchJsonMeteoFromApi (url) {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching data: ', error)
    return null
  }
}

// Exemple d'utilisation
const apiUrl = 'https://www.prevision-meteo.ch/services/json/lat=46.5194190lng=6.6337000' // Remplacez avec votre URL réelle
fetchJsonMeteoFromApi(apiUrl)
  .then(data => console.log(data))
  .catch(error => console.error(error))

// Création d'un serveur WebSocket sur le port 3001.
const wss = new WebSocketServer({
  port: 3001
})

// Attend qu'un client se connecte
wss.on('connection', function connection (ws) {
  console.log('Un client est connecté.')

  // Envoyer un message de "bonjour" au client
  ws.send('Bonjour')

  // Quand on reçoit un message du client, on le note dans la console.
  ws.on('message', function incoming (message) {
    console.log('reçu: %s', message)
  })
})

export default { fetchJsonMeteoFromApi, wss }
