import mongoose from 'mongoose'
import Plant from '../models/plantModel.js'
import { body, validationResult } from 'express-validator'

// Middleware for validating plant IDs
const validatePlantId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid plant ID' })
  }
  next()
}

// Validation for plant data
const validatePlantData = [
  body('name').trim().isLength({ min: 1 }).withMessage('Name is required'),
  body('species').trim().isLength({ min: 1 }).withMessage('Species is required'),
  // Add more validations as necessary for your Plant model
  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    next()
  }
]

// Create a new plant
export const createPlant = [
  validatePlantData,
  async (req, res) => {
    try {
      const plant = new Plant(req.body)
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
      if (!plant) return res.status(404).json({ message: 'Plant not found' })
      res.json(plant)
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  }
]

// Update a plant
export const updatePlant = [
  validatePlantId,
  validatePlantData,
  async (req, res) => {
    try {
      const plant = await Plant.findByIdAndUpdate(req.params.id, req.body, { new: true })
      if (!plant) return res.status(404).json({ message: 'Plant not found' })
      res.json(plant)
    } catch (error) {
      res.status(400).json({ message: error.message })
    }
  }
]

// Delete a plant
export const deletePlant = [
  validatePlantId,
  async (req, res) => {
    try {
      const plant = await Plant.findByIdAndDelete(req.params.id)
      if (!plant) return res.status(404).json({ message: 'Plant not found' })
      res.status(204).json({ message: 'Plant deleted' })
    } catch (error) {
      res.status(500).json({ message: error.message })
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
