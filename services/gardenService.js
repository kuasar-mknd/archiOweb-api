import Garden from '../models/gardenModel.js' // Remplacez par le chemin réel de votre modèle de jardin
import { getWeatherData } from './weatherService.js'
import wss from '../lib/websocketServer.js'

export const getGardensByUser = async (userId) => {
  try {
    // Récupère tous les jardins appartenant à un utilisateur
    return await Garden.find({ user: userId })
  } catch (error) {
    throw new Error('Erreur lors de la récupération des jardins de l’utilisateur.')
  }
}

export const getNearbyGardens = async (latitude, longitude) => {
  try {
    const radius = 10000 // Par exemple, 10 km
    const query = {}
    query.location = {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(latitude), parseFloat(longitude)] // longitude, latitude
        },
        $maxDistance: radius
      }
    }
    return await Garden.find(query)
  } catch (error) {
    throw new Error('Erreur lors de la récupération des jardins à proximité.')
  }
}

export const updateNearbyGardensWeather = async (originGarden) => {
  const [longitude, latitude] = originGarden.location.coordinates
  const weatherData = await getWeatherData(originGarden.location)

  await Garden.updateOne(
    { _id: originGarden._id },
    { $set: { weather: weatherData } }
  )

  const nearbyGardens = await Garden.find({
    location: {
      $nearSphere: {
        $geometry: { type: 'Point', coordinates: [longitude, latitude] },
        $maxDistance: 1000
      }
    },
    _id: { $ne: originGarden._id }
  })

  for (const garden of nearbyGardens) {
    await Garden.updateOne(
      { _id: garden._id },
      { $set: { weather: weatherData } }
    )
  }
}

export const notifyClientsOfWeatherChange = async (gardenId) => {
  const garden = await Garden.findById(gardenId)
  if (!garden) return

  await updateNearbyGardensWeather(garden)

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'weatherUpdate', gardenId: garden._id, weather: garden.weather }))
    }
  })
}
