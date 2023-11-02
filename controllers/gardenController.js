import mongoose from 'mongoose'
import Garden from '../models/gardenModel.js'
import { body, validationResult } from 'express-validator'

// Middleware to validate garden data
const validateGarden = [
  body('name').trim().isLength({ min: 1 }).withMessage('Name is required'),
  body('location').trim().isLength({ min: 1 }).withMessage('Location is required'),
  // Add other validations according to your Garden model fields
  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    next()
  }
]

// Middleware to validate garden ID
const validateGardenId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid garden ID' })
  }
  next()
}

// Create a new garden
export const createGarden = [
  validateGarden,
  async (req, res) => {
    try {
      const { name, location } = req.body
      const garden = new Garden({ name, location }) // Utilisez uniquement les champs spécifiquement extraits
      const savedGarden = await garden.save()
      res.status(201).json(savedGarden)
    } catch (error) {
      res.status(400).json({ message: 'Failed to create garden', error: error.message })
    }
  }
]

// Retrieve all gardens
export const getAllGardens = async (req, res) => {
  try {
    const gardens = await Garden.find().populate('plants')
    res.json(gardens)
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve gardens', error: error.message })
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
  validateGardenId,
  validateGarden,
  async (req, res) => {
    try {
      const { name, location } = req.body
      const updatedGarden = await Garden.findByIdAndUpdate(req.params.id, { name, location }, { new: true }) // Utilisez uniquement les champs spécifiquement extraits
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
  validateGardenId,
  async (req, res) => {
    try {
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
  validateGardenId,
  async (req, res) => {
    try {
      const garden = await Garden.findById(req.params.id).populate('plants')
      if (!garden) {
        return res.status(404).json({ message: 'Garden not found' })
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
