import cron from 'node-cron'
import Garden from '../models/gardenModel.js'
import { updateNearbyGardensWeather, notifyClientsOfWeatherChange } from '../services/gardenService.js'

// Exécutez cette tâche toutes les heures
export const cronUpdateGarden = () => {
  console.log('Mise à jour de la météo des jardins...')
  cron.schedule('*/10 * * * * *', async () => {
    try {
      console.log('Début de la mise à jour de la météo des jardins...')

      const gardens = await Garden.find()
      for (const garden of gardens) {
        if (!garden.weather || !garden.weather.lastUpdated || new Date() - garden.weather.lastUpdated > 10000) {
          console.log('Mise à jour de la météo du jardin', garden._id)
          await updateNearbyGardensWeather(garden)
          await notifyClientsOfWeatherChange(garden._id)
        }
      }

      console.log('Mise à jour terminée.')
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la météo des jardins:', error)
    }
  })
  console.log('Mise à jour de la météo des jardins planifiée.')
}
