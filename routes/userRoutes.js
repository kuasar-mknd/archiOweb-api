import express from 'express'
import {
  registerUser,
  loginUser,
  getUserById,
  updateUser,
  deleteUser,
} from '../controllers/userController.js'

// Middleware pour vérifier l'authentification
import { verifyToken } from '../services/authService.js'

const router = express.Router()

// Route pour l'inscription d'un nouvel utilisateur
router.post('/register', registerUser)

// Route pour l'authentification de l'utilisateur
router.post('/login', loginUser)

// Route pour récupérer un utilisateur par ID
router.get('/:id', verifyToken, getUserById)

// Route pour mettre à jour un utilisateur
router.put('/:id', verifyToken, updateUser)

// Route pour supprimer un utilisateur
router.delete('/:id', verifyToken, deleteUser)

export default router
