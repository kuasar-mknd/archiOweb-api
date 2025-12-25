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

export const getAllPlants = async (userRequesting) => {
  // Sentinel: Broken Access Control Fix
  // Only return plants from gardens owned by the user (or all if admin)
  if (userRequesting && userRequesting.role === 'admin') {
    // ⚡ Bolt: Use lean() for performance
    return await Plant.find().lean()
  }

  // ⚡ Bolt: Use lean() for performance
  const userGardens = await Garden.find({ user: userRequesting.userId }).select('_id').lean()
  const gardenIds = userGardens.map(g => g._id)

  // ⚡ Bolt: Use lean() for performance
  return await Plant.find({ garden: { $in: gardenIds } }).lean()
}

export const getPlantById = async (plantId, userRequesting) => {
  // ⚡ Bolt: Use lean() for performance
  const plant = await Plant.findById(plantId).lean()
  if (!plant) {
    throw new AppError('Plant not found', 404)
  }

  // Sentinel: Broken Access Control Fix
  // Check if the user is authorized to view this plant (must be owner of the garden or admin)
  if (userRequesting) {
    // ⚡ Bolt: Optimized to select only 'user' field for auth check
    const garden = await Garden.findById(plant.garden).select('user').lean()
    if (garden && !isOwnerOrAdmin(userRequesting, garden.user)) {
      throw new AppError('Not authorized to view this plant', 403)
    }
  }

  return plant
}

export const updatePlant = async (plantId, updateData, userRequesting) => {
  // ⚡ Bolt: Use lean() for performance - we only need the doc for checks
  const plant = await Plant.findById(plantId).lean()
  if (!plant) {
    throw new AppError('Plant not found', 404)
  }

  // ⚡ Bolt: Optimized to select only 'user' field for auth check
  const garden = await Garden.findById(plant.garden).select('user').lean()
  if (!garden) {
    throw new AppError('Garden not found associated with this plant', 404)
  }

  if (!isOwnerOrAdmin(userRequesting, garden.user)) {
    throw new AppError('Not authorized to update this plant', 403)
  }

  // Filter allowed fields to prevent arbitrary updates/injection
  const allowedUpdates = ['commonName', 'scientificName', 'family', 'exposure', 'garden']
  const filteredUpdateData = Object.keys(updateData)
    .filter(key => allowedUpdates.includes(key))
    .reduce((obj, key) => {
      obj[key] = updateData[key]
      return obj
    }, {})

  // ⚡ Bolt: Use lean() for performance
  const updatedPlant = await Plant.findByIdAndUpdate(plantId, filteredUpdateData, { new: true, runValidators: true }).lean()
  return updatedPlant
}

export const deletePlant = async (plantId, userRequesting) => {
  // ⚡ Bolt: Use lean() for performance
  const plant = await Plant.findById(plantId).lean()
  if (!plant) {
    throw new AppError('Plant not found', 404)
  }
  
  // ⚡ Bolt: Optimized to select only 'user' field for auth check
  const garden = await Garden.findById(plant.garden).select('user').lean()
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
