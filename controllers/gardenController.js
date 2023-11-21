import Garden from '../models/gardenModel.js'
import User from '../models/userModel.js'
import mongoose from 'mongoose'
import Plant from '../models/plantModel.js'

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
      res.status(400).json({ message: 'Failed to create garden', error: error.message })
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
            coordinates: [parseFloat(lng), parseFloat(lat)] // longitude, latitude
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

// Retrieve a single garden by ID
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

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid garden ID' })
      }
      const garden = await Garden.findById(id)
      if (!garden) {
        return res.status(404).json({ message: 'Garden not found' })
      }
      if (!isAdmin(req.user) || garden.user.toString() !== req.user.userId.toString()) {
        return res.status(403).json({ message: 'Not authorized to update this garden' })
      }

      const updatedGarden = await Garden.findByIdAndUpdate(id, { name, location }, { new: true })
      if (!updatedGarden) {
        return res.status(404).json({ message: 'Garden not found' })
      }
      res.json(updatedGarden)
    } catch (error) {
      res.status(400).json({ message: 'Failed to update garden', error: error.message })
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
      if (!garden) {
        return res.status(404).json({ message: 'Garden not found' })
      }

      if (!isAdmin(req.user) && garden.user.toString() !== req.user.userId.toString()) {
        return res.status(403).json({ message: 'Not authorized to delete this garden' })
      }

      // Trouver toutes les plantes associées au jardin
      const plants = await Plant.find({ garden: req.params.id })

      // Supprimer chaque plante associée
      for (const plant of plants) {
        await Plant.findByIdAndDelete(plant._id)
      }

      // Supprimer le jardin
      const deletedGarden = await Garden.findByIdAndDelete(req.params.id)

      if (!deletedGarden) {
        return res.status(404).json({ message: 'Garden not found' })
      }

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
      if (!garden) {
        return res.status(404).json({ message: 'Garden not found' })
      }
      if (!isAdmin(req.user) || garden.user.toString() !== req.user.userId.toString()) {
        return res.status(403).json({ message: 'Not authorized to get the plants from this garden' })
      }
      res.json(garden.plants)
    } catch (error) {
      res.status(500).json({ message: 'Failed to list plants', error: error.message })
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
  listPlantsInGarden
}

function isNumeric (value) {
  return !isNaN(value) && isFinite(value)
}
