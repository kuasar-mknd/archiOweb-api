import Plant from '../models/plantModel.js'

// Ajouter une nouvelle plante
export const addPlant = async (plantData) => {
  try {
    const plant = new Plant(plantData)
    await plant.save()
    return plant
  } catch (error) {
    // Gérer l'erreur comme il se doit
  }
}

// Obtenir la liste de toutes les plantes
export const getAllPlants = async () => {
  try {
    const plants = await Plant.find()
    return plants
  } catch (error) {}
}

// Obtenir une plante par son ID
export const getPlantById = async (plantId) => {
  try {
    const plant = await Plant.findById(plantId)
    return plant
  } catch (error) {}
}

// Mettre à jour une plante par son ID
export const updatePlant = async (plantId, updateData) => {
  try {
    const updatedPlant = await Plant.findByIdAndUpdate(plantId, updateData, {
      new: true,
    })
    return updatedPlant
  } catch (error) {}
}

// Supprimer une plante par son ID
export const deletePlant = async (plantId) => {
  try {
    const deletedPlant = await Plant.findByIdAndDelete(plantId)
    return deletedPlant
  } catch (error) {}
}

// Vous pouvez également ajouter d'autres services spécifiques, comme la recherche de plantes par certains critères
export const findPlantsByCriteria = async (criteria) => {
  try {
    const plants = await Plant.find(criteria)
    return plants
  } catch (error) {}
}
