import express from 'express';
import {
  createGarden,
  getAllGardens,
  getGardenById,
  updateGarden,
  deleteGarden
} from '../controllers/gardenController.js';

// Middleware pour vérifier l'authentification
import { verifyToken } from '../services/authService.js';

const router = express.Router();

// Route pour créer un nouveau jardin
router.post('/', verifyToken, createGarden);

// Route pour récupérer tous les jardins
router.get('/', getAllGardens);

// Route pour récupérer un jardin spécifique par son ID
router.get('/:id', getGardenById);

// Route pour mettre à jour un jardin spécifique par son ID
router.put('/:id', verifyToken, updateGarden);

// Route pour supprimer un jardin spécifique par son ID
router.delete('/:id', verifyToken, deleteGarden);

export default router;
