import WebSocket from 'ws'

function createWebSocketConnection () {
  const url = 'ws://localhost:3001' // Remplacez par l'URL de votre serveur WebSocket
  const connection = new WebSocket(url)

  connection.onopen = () => {
    console.log('Connected to the server')
    connection.send(sendUserLocation(connection))
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

  return connection
}

function sendUserLocation (connection) {
  if (!navigator.geolocation) {
    console.log("La géolocalisation n'est pas prise en charge par ce navigateur. Envoie de coordonnées par défaut.")
    const latTest = 46.5194190
    const longTest = 6.6337000

    connection.send(JSON.stringify({ latTest, longTest }))
    return
  }

  function success (position) {
    const latitude = position.coords.latitude
    const longitude = position.coords.longitude

    // Envoie les coordonnées au serveur WebSocket
    connection.send(JSON.stringify({ latitude, longitude }))
  }

  function error () {
    console.warn('Impossible de récupérer votre position')
  }

  navigator.geolocation.getCurrentPosition(success, error)
}

createWebSocketConnection()

export default createWebSocketConnection
