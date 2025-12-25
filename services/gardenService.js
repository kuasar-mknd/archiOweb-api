import Garden from '../models/gardenModel.js'
import User from '../models/userModel.js'
import Plant from '../models/plantModel.js'
import AppError from '../utils/AppError.js'
import mongoose from 'mongoose'

const isOwnerOrAdmin = (userRequesting, resourceOwnerId) => {
  // Current isAdmin middleware implementation returns true (disabled)
  // But we implement logic: user must be admin OR owner
  if (userRequesting.role === 'admin') return true
  return userRequesting.userId.toString() === resourceOwnerId.toString()
}

export const createGarden = async (gardenData, userId) => {
  const { name, location } = gardenData
  
  const userObject = await User.findById(userId)
  if (!userObject) {
    throw new AppError('User not found', 404)
  }

  const garden = new Garden({
    name,
    location,
    user: userId
  })

  const savedGarden = await garden.save()
  
  userObject.gardens.push(savedGarden._id)
  await userObject.save()

  return savedGarden
}

export const getAllGardens = async (queryFilters, userRequesting) => {
  const { page = 1, lat, lng, radius = 10000 } = queryFilters
  const pageSize = 10
  const skip = (page - 1) * pageSize
  
  const query = {}

  // Sentinel: Enforce ownership/privacy
  // Only return gardens owned by the user (or all if admin)
  if (!userRequesting || userRequesting.role !== 'admin') {
    if (userRequesting) {
      query.user = userRequesting.userId
    } else {
      // Should not happen if route is protected, but safe default
      throw new AppError('Authentication required', 401)
    }
  }

  if (lat && lng) {
    // Basic validation is done in controller/validator, but safe here too
    query.location = {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(lat), parseFloat(lng)]
        },
        $maxDistance: radius
      }
    }
  }

  const gardens = await Garden.find(query).skip(skip).limit(pageSize).lean()
  return gardens
}

export const getGardenById = async (gardenId, userRequesting) => {
  const garden = await Garden.findById(gardenId).lean()
  if (!garden) {
    throw new AppError('Garden not found', 404)
  }

  if (!isOwnerOrAdmin(userRequesting, garden.user)) {
    throw new AppError('Not authorized to access this garden', 403)
  }

  // ⚡ Bolt: Optimize by querying Plant collection directly using index.
  // This avoids populating the potentially stale 'plants' array in Garden doc.
  garden.plants = await Plant.find({ garden: gardenId }).lean()

  return garden
}

export const updateGarden = async (gardenId, updateData, userRequesting) => {
  // ⚡ Bolt: Optimized to select only 'user' field for auth check
  const garden = await Garden.findById(gardenId).select('user').lean()
  if (!garden) {
    throw new AppError('Garden not found', 404)
  }

  if (!isOwnerOrAdmin(userRequesting, garden.user)) {
    throw new AppError('Not authorized to update this garden', 403)
  }

  // Update allowed fields with white-listing and validation
  const update = {};
  if (typeof updateData.name === "string") {
    update.name = updateData.name;
  } else if ('name' in updateData) {
    throw new AppError('Invalid name: must be string', 400);
  }
  if (updateData.location !== undefined) {
    // location should be object with [expected structure] (e.g., GeoJSON Point), but NOT contain MongoDB operators
    if (typeof updateData.location === "object" && updateData.location !== null && !Object.keys(updateData.location).some(key => key.startsWith('$'))) {
      update.location = updateData.location;
    } else {
      throw new AppError('Invalid location', 400);
    }
  }
  if (Object.keys(update).length === 0) {
    throw new AppError('No valid fields to update', 400);
  }
  const updatedGarden = await Garden.findByIdAndUpdate(
    gardenId,
    { $set: update },
    { new: true, runValidators: true }
  )
  return updatedGarden
}

export const deleteGarden = async (gardenId, userRequesting) => {
  // ⚡ Bolt: Optimized to select only 'user' field for auth check
  const garden = await Garden.findById(gardenId).select('user').lean()
  if (!garden) {
    throw new AppError('Garden not found', 404)
  }

  if (!isOwnerOrAdmin(userRequesting, garden.user)) {
    throw new AppError('Not authorized to delete this garden', 403)
  }

  // Delete plants
  await Plant.deleteMany({ garden: gardenId })
  
  // Delete garden
  await Garden.findByIdAndDelete(gardenId)
}

export const listPlantsInGarden = async (gardenId, userRequesting) => {
  // ⚡ Bolt: Optimized to select only 'user' field for auth check
  const garden = await Garden.findById(gardenId).select('user').lean()
  if (!garden) {
    throw new AppError('Garden not found', 404)
  }

  // Access control? Original controller had it.
  if (!isOwnerOrAdmin(userRequesting, garden.user)) {
    throw new AppError('Not authorized to get the plants from this garden', 403)
  }

  return await Plant.find({ garden: gardenId }).lean()
}

export const getGardenAggregation = async (gardenId, userRequesting) => {
  // Check existence and auth first (as per original logic logic)
  // ⚡ Bolt: Optimized to select only 'user' field for auth check
  const garden = await Garden.findById(gardenId).select('user').lean()
  if (!garden) {
    // If original logic check auth first, we need garden first to know owner.
    // Original controller: findById then check auth.
    throw new AppError('Garden not found', 404)
  }
  
  if (!isOwnerOrAdmin(userRequesting, garden.user)) {
    throw new AppError('Not authorized to get the plants from this garden', 403)
  }

  const { ObjectId } = mongoose.Types
  
  // ⚡ Bolt: Optimization - Use direct aggregation on Plant collection using index
  // instead of $lookup on Garden.plants array. This is faster and avoids issues with stale array data.
  const aggregation = await Plant.aggregate([
    { $match: { garden: new ObjectId(gardenId) } },
    {
      $group: {
        _id: '$commonName',
        numberofplants: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        name: '$_id',
        numberofplants: 1
      }
    }
  ])

  return aggregation
}


export const getGardensByUser = async (userId) => {
  return await Garden.find({ user: userId }).lean()
}
