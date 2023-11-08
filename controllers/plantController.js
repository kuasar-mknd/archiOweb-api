import Plant from '../models/plantModel.js'
import Garden from '../models/gardenModel.js' // Import the Garden model

// middleware imports
import verifyToken from '../middlewares/verifyToken.js'
import isAdmin from '../middlewares/isAdmin.js'
import { validatePlantId, validatePlantData } from '../middlewares/validatePlant.js'

// Create a new plant
export const createPlant = [
  verifyToken,
  validatePlantData,
  async (req, res) => {
    try {
      const bodyGarden = req.body.garden
      const garden = await Garden.findById({ $eq: bodyGarden })
      if (!garden) {
        return res.status(404).json({ message: 'Garden not found' })
      }
      if (!garden.user.equals(req.user._id) && !isAdmin(req.user)) {
        return res.status(403).json({ message: 'Not authorized to add plants to this garden' })
      }
      const plant = new Plant({ ...req.body, user: req.user._id })
      const savedPlant = await plant.save()
      res.status(201).json(savedPlant)
    } catch (error) {
      res.status(400).json({ message: error.message })
    }
  }
]

// Retrieve all plants
export const getAllPlants = async (req, res) => {
  try {
    const plants = await Plant.find()
    res.json(plants)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Retrieve a single plant by ID
export const getPlantById = [
  validatePlantId,
  async (req, res) => {
    try {
      const plant = await Plant.findById(req.params.id)
      if (!plant) {
        return res.status(404).json({ message: 'Plant not found' })
      }
      res.json(plant)
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  }
]

// Update a plant
export const updatePlant = [
  verifyToken,
  validatePlantId,
  validatePlantData,
  async (req, res) => {
    try {
      const plant = await Plant.findById(req.params.id)
      if (!plant) {
        return res.status(404).json({ message: 'Plant not found' })
      }
      if (!plant.garden.equals(req.user._id) && !isAdmin(req.user)) {
        return res.status(403).json({ message: 'Not authorized to update this plant' })
      }
      const body = req.body
      const updatedPlant = await Plant.findByIdAndUpdate(req.params.id, { $eq: body }, { new: true })
      res.json(updatedPlant)
    } catch (error) {
      res.status(400).json({ message: 'Failed to update plant', error: error.message })
    }
  }
]

// Delete a plant
export const deletePlant = [
  verifyToken,
  validatePlantId,
  async (req, res) => {
    try {
      const plant = await Plant.findById(req.params.id)
      if (!plant) {
        return res.status(404).json({ message: 'Plant not found' })
      }
      if (!plant.garden.equals(req.user._id) && !isAdmin(req.user)) {
        return res.status(403).json({ message: 'Not authorized to delete this plant' })
      }
      await Plant.findByIdAndDelete(req.params.id)
      res.status(204).json({ message: 'Plant deleted' })
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete plant', error: error.message })
    }
  }
]

// Export all controller functions
export default {
  createPlant,
  getAllPlants,
  getPlantById,
  updatePlant,
  deletePlant
}
