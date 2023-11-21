import { WebSocketServer } from 'ws'
import jwt from 'jsonwebtoken'
import { getGardensByUser, getNearbyGardens } from '../services/gardenService.js'
import { getWeatherData } from '../services/weatherService.js'

export const startWebSocketServer = () => {
  const wss = new WebSocketServer({ port: 3001 })

  wss.on('connection', function connection (ws) {
    ws.on('message', async function incoming (message) {
      try {
        const { type, token, latitude, longitude } = JSON.parse(message)

        if (type === 'getMyGardensWeather') {
          // Vérifier le token
          if (!token) {
            ws.send(JSON.stringify({ error: 'No token, authorization denied' }))
            return
          }

          let userId
          try {
            userId = jwt.verify(token, process.env.JWT_SECRET).userId
          } catch (error) {
            console.error(error)
            ws.send(JSON.stringify({ error: 'Token is not valid' }))
            return
          }
          const gardens = await getGardensByUser(userId)
          for (const garden of gardens) {
            const weather = await getWeatherData(garden.location)
            ws.send(JSON.stringify({ gardenId: garden._id, weather }))
          }
        } else if (type === 'getNearbyGardens') {
          const nearbyGardens = await getNearbyGardens(latitude, longitude)
          ws.send(JSON.stringify(nearbyGardens))
        }
      } catch (error) {
        ws.send(JSON.stringify({ error: error.message }))
      }
    })
  })

  console.log('WebSocket server started on port 3001')
}
