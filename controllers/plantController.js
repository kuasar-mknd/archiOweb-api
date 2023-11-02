import mongoose from 'mongoose'
import Plant from '../models/plantModel.js'

// Middleware pour valider l'ID de la plante
const validatePlantId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid plant ID' })
  }
  next()
}

// Créer une nouvelle plante
export const createPlant = async (req, res) => {
  try {
    const plant = new Plant(req.body)
    const savedPlant = await plant.save()
    res.status(201).json(savedPlant)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

// Récupérer toutes les plantes
export const getAllPlants = async (req, res) => {
  try {
    const plants = await Plant.find()
    res.json(plants)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Récupérer une seule plante par ID
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

// Mettre à jour une plante
export const updatePlant = [
  validatePlantId,
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

// Supprimer une plante
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

// Exporter toutes les fonctions du contrôleur
export default {
  createPlant,
  getAllPlants,
  getPlantById,
  updatePlant,
  deletePlant
}
