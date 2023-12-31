import Garden from '../models/gardenModel.js'
import User from '../models/userModel.js'
import Plant from '../models/plantModel.js'
import mongoose from 'mongoose'

// middleware imports
import verifyToken from '../middlewares/verifyToken.js'
import { validateGardenId, validateGarden } from '../middlewares/validateGarden.js'
import isAdmin from '../middlewares/isAdmin.js'

// Create a new garden
export const createGarden = [
  verifyToken,
  validateGarden,
  async (req, res) => {
    try {
      const { name, location } = req.body
      const user = req.user.userId
      const userObject = await User.findById(user)
      const garden = new Garden({
        name,
        location,
        user
      })
      const savedGarden = await garden.save()
      userObject.gardens.push(savedGarden._id)
      await userObject.save()

      res.status(201).json(savedGarden)
    } catch (error) {
      res.status(500).json({ message: 'Failed to create garden', error: error.message })
    }
  }
]

// Retrieve all gardens
export const getAllGardens = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const pageSize = 10 // Fixed page size
    const skip = (page - 1) * pageSize

    const query = {}
    const { lat, lng, radius = 10000 } = req.query // radius in meters, defaulting to 10km

    // If latitude and longitude are provided, use them to filter gardens
    if (lat && lng) {
      // Validate lat and lng
      if (!isNumeric(lat) || !isNumeric(lng)) {
        return res.status(400).json({ message: 'Invalid latitude or longitude' })
      }

      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lat), parseFloat(lng)] // longitude, latitude
          },
          $maxDistance: radius
        }
      }
    }

    const gardens = await Garden.find(query).skip(skip).limit(pageSize)
    res.json(gardens)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Retrieve a single garden by ID TO DO : ajout authentification
export const getGardenById = [
  validateGardenId,
  async (req, res) => {
    try {
      const garden = await Garden.findById(req.params.id).populate('plants')
      if (!garden) {
        return res.status(404).json({ message: 'Garden not found' })
      }
      res.json(garden)
    } catch (error) {
      res.status(500).json({ message: 'Failed to retrieve garden', error: error.message })
    }
  }
]

// Update a garden
export const updateGarden = [
  verifyToken,
  validateGardenId,
  validateGarden,
  async (req, res) => {
    try {
      const { id } = req.params
      const { name, location } = req.body
      const garden = await Garden.findById(id)
      if (!isAdmin(req.user) || garden.user.toString() !== req.user.userId.toString()) {
        return res.status(403).json({ message: 'Not authorized to update this garden' })
      }

      const updatedGarden = await Garden.findByIdAndUpdate(id, { name, location }, { new: true })
      res.json(updatedGarden)
    } catch (error) {
      res.status(500).json({ message: 'Failed to update garden', error: error.message })
    }
  }
]

// Delete a garden
export const deleteGarden = [
  verifyToken,
  validateGardenId,
  async (req, res) => {
    try {
      const garden = await Garden.findById(req.params.id)

      if (!isAdmin(req.user) || garden.user.toString() !== req.user.userId.toString()) {
        return res.status(403).json({ message: 'Not authorized to delete this garden' })
      }

      // Trouver toutes les plantes associées au jardin
      const plants = await Plant.find({ garden: req.params.id })

      // Supprimer chaque plante associée au jardin supprimé
      for (const plant of plants) {
        await Plant.findByIdAndDelete(plant._id)
      }

      // Supprimer le jardin
      await Garden.findByIdAndDelete(req.params.id)

      res.status(204).send()
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete garden', error: error.message })
    }
  }
]

// List the plants in a garden (gardenId)
export const listPlantsInGarden = [
  verifyToken,
  validateGardenId,
  async (req, res) => {
    try {
      const garden = await Garden.findById(req.params.id).populate('plants')
      if (!isAdmin(req.user) || garden.user.toString() !== req.user.userId.toString()) {
        return res.status(403).json({ message: 'Not authorized to get the plants from this garden' })
      }
      res.json(garden.plants)
    } catch (error) {
      res.status(500).json({ message: 'Failed to list plants', error: error.message })
    }
  }
]

export const getGardenAggregation = [
  verifyToken,
  validateGardenId,
  async (req, res) => {
    try {
      const { ObjectId } = mongoose.Types
      const gardenId = new ObjectId(req.params.id)
      const garden = await Garden.findById(req.params.id).populate('plants')
      if (!isAdmin(req.user) || garden.user.toString() !== req.user.userId.toString()) {
        return res.status(403).json({ message: 'Not authorized to get the plants from this garden' })
      }
      const aggregation = await Garden.aggregate([
        {
          $match: { _id: gardenId }
        },
        {
          $lookup: {
            from: Plant.collection.name,
            localField: '_id',
            foreignField: 'garden',
            as: 'plants'
          }
        },
        {
          $project: {
            name: 1,
            numberOfPlants: { $size: '$plants' }
          }
        }
      ])

      res.json(aggregation)
    } catch (error) {
      res.status(500).send({ message: 'Not authorized to get the plants from this garden' })
    }
  }
]

// Export all controller functions
export default {
  createGarden,
  getAllGardens,
  getGardenById,
  updateGarden,
  deleteGarden,
  listPlantsInGarden,
  getGardenAggregation
}

function isNumeric (value) {
  return !isNaN(value) && isFinite(value)
}
