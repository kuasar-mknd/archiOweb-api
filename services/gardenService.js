import Garden from '../models/gardenModel.js'

// Créer un nouveau jardin
export const createGarden = async (gardenData) => {
  try {
    const garden = new Garden(gardenData)
    await garden.save()
    return garden
  } catch (error) {}
}

// Récupérer tous les jardins
export const getAllGardens = async () => {
  try {
    const gardens = await Garden.find()
    return gardens
  } catch (error) {}
}

// Récupérer un jardin par son ID
export const getGardenById = async (gardenId) => {
  try {
    const garden = await Garden.findById(gardenId)
    return garden
  } catch (error) {}
}

// Mettre à jour un jardin par son ID
export const updateGarden = async (gardenId, updateData) => {
  try {
    const updatedGarden = await Garden.findByIdAndUpdate(gardenId, updateData, {
      new: true,
    })
    return updatedGarden
  } catch (error) {}
}

// Supprimer un jardin par son ID
export const deleteGarden = async (gardenId) => {
  try {
    const deletedGarden = await Garden.findByIdAndDelete(gardenId)
    return deletedGarden
  } catch (error) {}
}
