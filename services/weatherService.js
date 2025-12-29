import axios from 'axios'

// ⚡ Bolt: Cache for weather data to prevent redundant external API calls
// Key: "latitude,longitude", Value: { timestamp, data }
const weatherCache = new Map()
const CACHE_TTL = 15 * 60 * 1000 // 15 minutes
const MAX_CACHE_SIZE = 100 // Prevent memory leaks

export const getWeatherData = async (location) => {
  try {
    const [longitude, latitude] = location.coordinates
    const cacheKey = `${latitude},${longitude}`

    // ⚡ Bolt: Check cache before making request
    const cached = weatherCache.get(cacheKey)
    if (cached) {
      const now = Date.now()
      if (now - cached.timestamp < CACHE_TTL) {
        // ⚡ Bolt: LRU Policy - Refresh entry position
        // Delete and re-set moves the key to the end of the Map (most recently used)
        weatherCache.delete(cacheKey)
        weatherCache.set(cacheKey, cached)
        // console.log(`DEBUG: Cache HIT for ${cacheKey}. Moved to end.`)

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

    // ⚡ Bolt: Smart Cache Eviction (LRU)
    // Instead of clearing the whole cache when full (performance cliff),
    // we remove the oldest entry (first key in Map) to make space.
    if (weatherCache.size >= MAX_CACHE_SIZE) {
      // Map.keys() returns an iterator in insertion order.
      // The first item is the oldest (Least Recently Used because we re-insert on access).
      const oldestKey = weatherCache.keys().next().value
      // console.log(`DEBUG: Cache FULL. Evicting oldest: ${oldestKey}`)
      weatherCache.delete(oldestKey)
    }

    weatherCache.set(cacheKey, {
      timestamp: Date.now(),
      data: result
    })

    // Return a copy
    return { ...result }
  } catch (error) {
    // If axios timeout error, we can handle it specifically if needed,
    // but generic error is fine for now as per original code structure
    throw new Error('Erreur lors de la récupération des données météorologiques.')
  }
}
