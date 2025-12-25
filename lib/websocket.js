import { WebSocketServer } from 'ws'
import jwt from 'jsonwebtoken'
import { getGardensByUser, getAllGardens } from '../services/gardenService.js'
import { getWeatherData } from '../services/weatherService.js'

export const startWebSocketServer = (port = 3001) => {
  const wss = new WebSocketServer({ port })

  // Sentinel: Rate Limiting Map
  // Tracks requests per connection to prevent DoS/Abuse
  const rateLimitMap = new Map()

  // Rate Limit Config: 10 requests per minute
  // This is strict but safe for high-cost operations like weather fetching
  const RATE_LIMIT_WINDOW = 60 * 1000
  const MAX_REQUESTS = 10

  wss.on('connection', function connection (ws) {
    // Initialize rate limit counter for this connection
    rateLimitMap.set(ws, { count: 0, startTime: Date.now() })

    ws.on('close', () => {
      // Clean up memory
      rateLimitMap.delete(ws)
    })

    ws.on('message', async function incoming (message) {
      try {
        // Sentinel: Rate Limiting Logic
        const clientLimit = rateLimitMap.get(ws)
        const now = Date.now()

        if (now - clientLimit.startTime > RATE_LIMIT_WINDOW) {
          // Reset window
          clientLimit.count = 0
          clientLimit.startTime = now
        }

        if (clientLimit.count >= MAX_REQUESTS) {
          ws.send(JSON.stringify({ error: 'Too many requests. Please try again later.' }))
          return
        }

        clientLimit.count++

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
          // ⚡ Bolt: Parallelize weather data fetching to reduce latency
          // Previously sequential: 5 gardens * 200ms = 1000ms
          // Now parallel: max(200ms) = ~200ms
          await Promise.all(gardens.map(async (garden) => {
            const weather = await getWeatherData(garden.location)
            ws.send(JSON.stringify({ gardenId: garden._id, weather }))
          }))
        } else if (type === 'getNearbyGardens') {
          if (!token) {
            ws.send(JSON.stringify({ error: 'No token, authorization denied' }))
            return
          }

          let userId
          try {
            userId = jwt.verify(token, process.env.JWT_SECRET).userId
          } catch (error) {
            ws.send(JSON.stringify({ error: 'Token is not valid' }))
            return
          }

          // Sentinel: Use getAllGardens to enforce ownership filtering
          const nearbyGardens = await getAllGardens({ lat: latitude, lng: longitude }, { userId })
          ws.send(JSON.stringify(nearbyGardens))
        }
      } catch (error) {
        ws.send(JSON.stringify({ error: error.message }))
      }
    })
  })

  console.log(`WebSocket server started on port ${port}`)
  return wss
}
