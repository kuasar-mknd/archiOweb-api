import * as userService from '../services/userService.js'
import { sendResponse } from '../utils/responseHandler.js'
import { body, validationResult } from 'express-validator'
import verifyToken from '../middlewares/verifyToken.js'

// Middlewares for validation
const validateUserInput = [
  body('identifier').isEmail().withMessage('A valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  // Add more validations as necessary
  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
     // Utilisation de la structure d'erreur standardisée
     // Le middleware global ou responseHandler gèrera le format
     // Ici on retourne directement pour valider le test qui attend 422
      return res.status(422).json({ 
        success: false, 
        message: 'Validation failed', 
        errors: errors.array() 
      })
    }
    next()
  }
]

const sanitizeUserUpdate = [
  (req, res, next) => {
    const updateFields = ['firstName', 'lastName', 'identifier']
    const updates = {}
    for (const field of updateFields) {
      if (req.body[field]) {
        updates[field] = req.body[field]
      }
    }
    req.body = updates
    next()
  },
  (req, res, next) => {
    delete req.body.password
    next()
  }
]

export const registerUser = [
  validateUserInput,
  async (req, res, next) => {
    try {
      const user = await userService.createUser(req.body)
      sendResponse(res, 201, user, 'User created successfully')
    } catch (error) {
      next(error)
    }
  }
]

export const getUserById = async (req, res, next) => {
  try {
    const user = await userService.fetchUserById(req.params.id, req.user)
    sendResponse(res, 200, user)
  } catch (error) {
    next(error)
  }
}

export const loginUser = [
  validateUserInput,
  async (req, res, next) => {
    try {
      const { identifier, password } = req.body
      const result = await userService.authenticateUser(identifier, password)
      sendResponse(res, 200, result, 'Auth successful')
    } catch (error) {
      next(error)
    }
  }
]

export const updateUser = [
  sanitizeUserUpdate,
  verifyToken,
  async (req, res, next) => {
    try {
      const updatedUser = await userService.updateUser(req.user.userId, req.body)
      sendResponse(res, 200, updatedUser)
    } catch (error) {
      next(error)
    }
  }
]

export const deleteUser = [
  verifyToken,
  async (req, res, next) => {
    try {
      await userService.deleteUser(req.user.userId)
      sendResponse(res, 204, null, 'User, associated gardens, and plants deleted')
    } catch (error) {
      next(error)
    }
  }
]

export const listUserGardens = [
  verifyToken,
  async (req, res, next) => {
    try {
      const gardens = await userService.getUserGardens(req.user.userId)
      sendResponse(res, 200, gardens)
    } catch (error) {
      next(error)
    }
  }
]
