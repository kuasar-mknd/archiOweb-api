import Garden from '../models/gardenModel.js'
import mongoose from 'mongoose'
import { body, validationResult } from 'express-validator'

// Middleware pour valider les données de jardin
const validateGarden = [
  body('name').trim().isLength({ min: 1 }).withMessage('Name is required'),
  body('location').trim().isLength({ min: 1 }).withMessage('Location is required'),
  // Ajoutez d'autres validations selon les champs de votre modèle Garden
  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    next()
  }
]

// Middleware pour valider l'ID du jardin
const validateGardenId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid garden ID' })
  }
  next()
}

// Créer un nouveau jardin
export const createGarden = [
  validateGarden,
  async (req, res) => {
    try {
      const garden = new Garden(req.body)
      const savedGarden = await garden.save()
      res.status(201).json(savedGarden)
    } catch (error) {
      res.status(400).json({ message: 'Failed to create garden' })
    }
  }
]

// Récupérer tous les jardins
export const getAllGardens = async (req, res) => {
  try {
    const gardens = await Garden.find().populate('plants')
    res.json(gardens)
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve gardens' })
  }
}

// Récupérer un seul jardin par ID
export const getGardenById = async (req, res) => {
  try {
    const garden = await Garden.findById(req.params.id).populate('plants')
    if (!garden) {
      return res.status(404).json({ message: 'Garden not found' })
    }
    res.json(garden)
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve garden' })
  }
}

// Mettre à jour un jardin
export const updateGarden = [
  validateGardenId,
  validateGarden,
  async (req, res) => {
    try {
      const updatedGarden = await Garden.findByIdAndUpdate(req.params.id, req.body, { new: true })
      if (!updatedGarden) {
        return res.status(404).json({ message: 'Garden not found' })
      }
      res.json(updatedGarden)
    } catch (error) {
      res.status(400).json({ message: 'Failed to update garden' })
    }
  }
]

// Supprimer un jardin
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
      res.status(500).json({ message: 'Failed to delete garden' })
    }
  }
]

// **Lister les plantes d'un jardin (gardenId)**
export const listPlantsInGarden = async (req, res) => {
  try {
    const garden = await Garden.findById(req.params.id).populate('plants')
    if (!garden) {
      return res.status(404).json({ message: 'Garden not found' })
    }
    res.json(garden.plants)
  } catch (error) {
    res.status(500).json({ message: 'Failed to list plants' })
  }
}
