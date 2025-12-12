import Plant from '../models/plantModel.js'
import Garden from '../models/gardenModel.js'
import AppError from '../utils/AppError.js'

const isOwnerOrAdmin = (userRequesting, resourceOwnerId) => {
  if (userRequesting.role === 'admin') return true
  return userRequesting.userId.toString() === resourceOwnerId.toString()
}

export const createPlant = async (plantData, userId, userRequesting) => {
  const { garden: gardenId } = plantData

  if (typeof gardenId !== "string") {
    throw new AppError('Invalid garden ID', 400)
  }

  const garden = await Garden.findById(gardenId)
  if (!garden) {
    throw new AppError('Garden not found', 404)
  }

  // Check if user is authorized to add plants to this garden
  // The original controller checked: if (!isAdmin(req.user) || garden.user.toString() !== req.user.userId.toString())
  // Here userId is passed from createPlant arg (req.user._id used for creation usually)
  // userRequesting object contains { userId, role }
  
  if (!isOwnerOrAdmin(userRequesting, garden.user)) {
    throw new AppError('Not authorized to add plants to this garden', 403)
  }

  const plant = new Plant({
    ...plantData,
    user: userId // The creator of the plant (usually the same as garden owner but maybe not technically enforced?)
  })

  const savedPlant = await plant.save()

  // Add plant to garden's list
  garden.plants.push(savedPlant._id)
  await garden.save()

  return savedPlant
}

export const getAllPlants = async () => {
  return await Plant.find()
}

export const getPlantById = async (plantId) => {
  const plant = await Plant.findById(plantId)
  if (!plant) {
    throw new AppError('Plant not found', 404)
  }
  return plant
}

export const updatePlant = async (plantId, updateData, userRequesting) => {
  const plant = await Plant.findById(plantId)
  if (!plant) {
    throw new AppError('Plant not found', 404)
  }

  const garden = await Garden.findById(plant.garden)
  if (!garden) {
    throw new AppError('Garden not found associated with this plant', 404)
  }

  if (!isOwnerOrAdmin(userRequesting, garden.user)) {
    throw new AppError('Not authorized to update this plant', 403)
  }

  const updatedPlant = await Plant.findByIdAndUpdate(plantId, updateData, { new: true, runValidators: true })
  return updatedPlant
}

export const deletePlant = async (plantId, userRequesting) => {
  const plant = await Plant.findById(plantId)
  if (!plant) {
    throw new AppError('Plant not found', 404)
  }
  
  const garden = await Garden.findById(plant.garden)
  if (!garden) {
     // If garden is missing, maybe just delete the plant? Or error?
     // Original controller returns 404 Garden not found
     throw new AppError('Garden not found', 404)
  }

  if (!isOwnerOrAdmin(userRequesting, garden.user)) {
    throw new AppError('Not authorized to delete this plant', 403)
  }

  await Plant.findByIdAndDelete(plantId)
}
