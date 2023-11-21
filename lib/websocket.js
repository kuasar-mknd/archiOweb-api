import { WebSocketServer } from 'ws'
import fetchJsonMeteoFromApi from './apiMeteo.js'

function startWebSocketServer () {
  const wss = new WebSocketServer({ port: 3001 })
  wss.on('connection', function connection (ws) {
    console.log('Un client est connecté.')
    ws.send('Bonjour')

    ws.on('message', async function incoming (data) {
      console.log('reçu les données: %s', data)
      const { latitude, longitude } = JSON.parse(data)
      const url = `https://www.prevision-meteo.ch/services/json/lat=${latitude}lng=${longitude}`
      ws.send('Recherche de la météo...')
      fetchJsonMeteoFromApi(url)
        .then(data => {
          if (data) {
            ws.send(JSON.stringify(data))
          }
        })
        .catch(error => console.error(error))
    })
  })

  return wss
}

export default startWebSocketServer
