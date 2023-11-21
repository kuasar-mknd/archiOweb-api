import Garden from '../models/gardenModel.js' // Remplacez par le chemin réel de votre modèle de jardin

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
    return await Garden.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [longitude, latitude] },
          $maxDistance: radius
        }
      }
    })
  } catch (error) {
    throw new Error('Erreur lors de la récupération des jardins à proximité.')
  }
}
