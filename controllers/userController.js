import User from '../models/userModel.js'
import jwt from 'jsonwebtoken'
import { body, validationResult } from 'express-validator'
import bcrypt from 'bcrypt'
import verifyToken from '../middlewares/verifyToken.js'
import Garden from '../models/gardenModel.js'
import Plant from '../models/plantModel.js'

/*
const checkOwnershipOrRole = (user, resourceUserId) => {
  return user.role === 'admin' || user._id.toString() === resourceUserId.toString()
}
*/

// Middlewares for validation
const validateUserInput = [
  body('identifier').isEmail().withMessage('A valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  // Add more validations as necessary
  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    next()
  }
]

const sanitizeUserUpdate = [
  // Middleware to sanitize the update request
  (req, res, next) => {
    const updateFields = ['firstName', 'lastName', 'identifier'] // Fields that can be updated
    const updates = {}
    for (const field of updateFields) {
      if (req.body[field]) {
        updates[field] = req.body[field]
      }
    }
    req.body = updates // Only allow updates to specified fields
    next()
  },
  // Prevent password updates through this route
  (req, res, next) => {
    delete req.body.password
    next()
  }
]

export const registerUser = [
  validateUserInput,
  async (req, res) => {
    try {
      const userExists = await User.findOne({ identifier: req.body.identifier })
      if (userExists) {
        return res.status(400).json({ message: 'User already exists' })
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(req.body.password, 10)
      const user = new User({
        ...req.body,
        password: hashedPassword
      })

      await user.save()

      res.status(201).json({ message: 'User created successfully' })
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  }
]

export const loginUser = [
  validateUserInput,
  async (req, res) => {
    try {
      const identifier = req.body.identifier
      const user = await User.findOne({ identifier: { $eq: identifier } })
      if (user && await bcrypt.compare(req.body.password, user.password)) {
        const token = jwt.sign(
          { userId: user._id, identifier: user.identifier },
          process.env.JWT_SECRET,
          { expiresIn: '1h' }
        )

        res.json({ message: 'Auth successful', token })
      } else {
        res.status(401).json({ message: 'Auth failed' })
      }
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  }
]

export const updateUser = [
  sanitizeUserUpdate,
  verifyToken, // Middleware to verify the JWT token
  async (req, res) => {
    try {
      const body = req.body
      const user = await User.findById(req.user.userId)
      if (!user) return res.status(404).json({ message: 'User not found' })
      const updatedUser = await User.findByIdAndUpdate(req.user.userId, body, { new: true }).select('-password')
      res.json(updatedUser)
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  }
]

export const deleteUser = [
  verifyToken,
  async (req, res) => {
    try {
      const user = await User.findById(req.user.userId)
      if (!user) return res.status(404).json({ message: 'User not found' })

      // Trouver tous les jardins associés à l'utilisateur
      const gardens = await Garden.find({ user: req.user.userId })

      // Supprimer chaque jardin associé
      for (const garden of gardens) {
        // Trouver toutes les plantes associées au jardin
        const plants = await Plant.find({ garden: garden._id })

        // Supprimer chaque plante associée
        for (const plant of plants) {
          await Plant.findByIdAndDelete(plant._id)
        }

        // Supprimer le jardin
        await Garden.findByIdAndDelete(garden._id)
      }

      // Supprimer l'utilisateur
      await User.findByIdAndDelete(req.user.userId)

      res.status(204).json({ message: 'User, associated gardens, and plants deleted' })
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error' })
    }
  }
]

export const listUserGardens = [
  verifyToken,
  async (req, res) => {
    try {
      const user = await User.findById(req.user.userId).populate('gardens').select('-password')
      if (!user) {
        return res.status(404).json({ message: 'User not found' })
      }
      res.json(user.gardens)
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  }
]
