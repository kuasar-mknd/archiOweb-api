import Plant from '../models/plantModel.js'
import Garden from '../models/gardenModel.js' // Import the Garden model

// middleware imports
import verifyToken from '../middlewares/verifyToken.js'
import isAdmin from '../middlewares/isAdmin.js'
import { validatePlantId, validatePlantData, validatePlantDataUpdate } from '../middlewares/validatePlant.js'

// Create a new plant
export const createPlant = [
  verifyToken,
  validatePlantData,
  async (req, res) => {
    try {
      const bodyGarden = req.body.garden
      const garden = await Garden.findById(bodyGarden)
      if (req.file) {
        req.body.imageUrl = req.file.path // URL de l'image
      }
      if (!garden) {
        return res.status(404).json({ message: 'Garden not found' })
      }
      if (!isAdmin(req.user) || garden.user.toString() !== req.user.userId.toString()) {
        return res.status(403).json({ message: 'Not authorized to add plants to this garden' })
      }
      const plant = new Plant({ ...req.body, user: req.user._id })
      const savedPlant = await plant.save()

      // Ajouter la plante créée à la liste des plantes du jardin
      garden.plants.push(savedPlant._id)
      await garden.save() // Sauvegarder les modifications du jardin

      res.status(201).json(savedPlant)
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  }
]

// Retrieve all plants TO DO AUTH & TEST
export const getAllPlants = [
  verifyToken,
  async (req, res) => {
    try {
      const plants = await Plant.find()
      res.json(plants)
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  }]

// Retrieve a single plant by ID
export const getPlantById = [
  verifyToken,
  validatePlantId,
  async (req, res) => {
    try {
      const { id } = req.params
      const plant = await Plant.findById(id)
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
  validatePlantDataUpdate,
  async (req, res) => {
    try {
      const body = req.body
      const plant = await Plant.findById(req.params.id)
      const garden = await Garden.findById(plant.garden)
      if (req.file) {
        req.body.imageUrl = req.file.path // URL de l'image
      }
      if (!garden) {
        return res.status(404).json({ message: 'Garden not found' })
      }
      if (!isAdmin(req.user) || garden.user.toString() !== req.user.userId.toString()) {
        return res.status(403).json({ message: 'Not authorized to update this plant' })
      }
      const updatedPlant = await Plant.findByIdAndUpdate(req.params.id, body, { new: true })
      res.json(updatedPlant)
    } catch (error) {
      res.status(500).json({ message: 'Failed to update plant', error: error.message })
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
      const garden = await Garden.findById(plant.garden)
      if (!garden) {
        return res.status(404).json({ message: 'Garden not found' })
      }
      if (!isAdmin(req.user) || garden.user.toString() !== req.user.userId.toString()) {
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
