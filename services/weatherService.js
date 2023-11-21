import axios from 'axios'

export const getWeatherData = async (location) => {
  try {
    const [longitude, latitude] = location.coordinates

    // Requête pour les prévisions météo horaires
    const response = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,cloudcover,precipitation&current_weather=true`)
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

    return {
      temperature: currentTemperature,
      skyCondition,
      precipitationNext48h: totalPrecipitation
    }
  } catch (error) {
    throw new Error('Erreur lors de la récupération des données météorologiques.')
  }
}
