import express from 'express'
import {
  createPlant,
  getAllPlants,
  getPlantById,
  updatePlant,
  deletePlant,
} from '../controllers/plantController.js'

// Middleware pour vérifier l'authentification
import { verifyToken } from '../services/authService.js'

const router = express.Router()

// Route pour créer une nouvelle plante
router.post('/', verifyToken, createPlant)

// Route pour récupérer toutes les plantes
router.get('/', getAllPlants)

// Route pour récupérer une plante spécifique par son ID
router.get('/:id', getPlantById)

// Route pour mettre à jour une plante spécifique par son ID
router.put('/:id', verifyToken, updatePlant)

// Route pour supprimer une plante spécifique par son ID
router.delete('/:id', verifyToken, deletePlant)

export default router
