import axios from 'axios'

// ⚡ Bolt: Cache for weather data to prevent redundant external API calls
// Key: "latitude,longitude", Value: { timestamp, data }
const weatherCache = new Map()
const CACHE_TTL = 15 * 60 * 1000 // 15 minutes
const MAX_CACHE_SIZE = 100 // Prevent memory leaks

export const getWeatherData = async (location) => {
  try {
    // Sentinel: Input Validation
    if (!location || !location.coordinates) {
      throw new Error('Invalid location data')
    }

    if (!Array.isArray(location.coordinates) || location.coordinates.length !== 2) {
      throw new Error('Invalid coordinates format')
    }

    const [longitude, latitude] = location.coordinates

    if (typeof longitude !== 'number' || typeof latitude !== 'number' || isNaN(longitude) || isNaN(latitude)) {
      throw new Error('Invalid coordinates values')
    }

    if (latitude < -90 || latitude > 90) {
      throw new Error('Latitude must be between -90 and 90')
    }

    if (longitude < -180 || longitude > 180) {
      throw new Error('Longitude must be between -180 and 180')
    }

    const cacheKey = `${latitude},${longitude}`

    // ⚡ Bolt: Check cache before making request
    const cached = weatherCache.get(cacheKey)
    if (cached) {
      const now = Date.now()
      if (now - cached.timestamp < CACHE_TTL) {
        // Return a copy to prevent mutation of cached state
        return { ...cached.data }
      }
      // Cache expired, remove it
      weatherCache.delete(cacheKey)
    }

    // Requête pour les prévisions météo horaires
    // Sentinel: Added timeout (5s) to prevent DoS/resource exhaustion
    const response = await axios.get(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,cloudcover,precipitation&current_weather=true`,
      { timeout: 5000 }
    )
    const data = response.data

    // Conditions météorologiques actuelles
    const currentWeather = data.current_weather
    const currentTemperature = currentWeather.temperature
    const cloudCover = currentWeather.cloudcover

    // Déterminer l'état du ciel actuel
    let skyCondition = 'Inconnu'
    if (cloudCover < 20) {
      skyCondition = 'Ciel dégagé'
    } else if (cloudCover < 50) {
      skyCondition = 'Partiellement nuageux'
    } else if (cloudCover < 80) {
      skyCondition = 'Nuageux'
    } else {
      skyCondition = 'Très nuageux'
    }

    // Prévisions de précipitations pour les prochaines 48 heures
    const hourlyForecast = data.hourly
    const precipitationForecast = hourlyForecast.precipitation
    const totalPrecipitation = precipitationForecast.reduce((acc, val) => acc + val, 0)

    const result = {
      temperature: currentTemperature,
      skyCondition,
      precipitationNext48h: totalPrecipitation
    }

    // ⚡ Bolt: Store in cache
    // Simple eviction policy: if full, clear everything (safe and simple for now)
    // A more complex LRU is overkill for this specific "small improvement" task
    if (weatherCache.size >= MAX_CACHE_SIZE) {
      weatherCache.clear()
    }

    weatherCache.set(cacheKey, {
      timestamp: Date.now(),
      data: result
    })

    // Return a copy
    return { ...result }
  } catch (error) {
    // Sentinel: Re-throw validation errors to caller
    if (error.message.startsWith('Invalid') || error.message.includes('must be between')) {
      throw error
    }
    // If axios timeout error, we can handle it specifically if needed,
    // but generic error is fine for now as per original code structure
    throw new Error('Erreur lors de la récupération des données météorologiques.')
  }
}
