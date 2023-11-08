import User from '../models/userModel.js'
import jwt from 'jsonwebtoken'
import { body, validationResult } from 'express-validator'
import Garden from '../models/gardenModel.js'
import bcrypt from 'bcrypt'
import verifyToken from '../middlewares/verifyToken.js'

const checkOwnershipOrRole = (user, resourceUserId) => {
  return user.role === 'admin' || user._id.toString() === resourceUserId.toString()
}

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
      const user = await User.findOne({ identifier: req.body.identifier })
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
      console.error(error)
      res.status(500).json({ message: error.message })
    }
  }
]

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password')
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json(user)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updateUser = [
  sanitizeUserUpdate,
  verifyToken, // Middleware to verify the JWT token
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id)
      if (!user) return res.status(404).json({ message: 'User not found' })

      // Check if the logged-in user has permission to update the user resource
      if (!checkOwnershipOrRole(req.user, user._id)) {
        return res.status(403).json({ message: 'Not authorized to update this user' })
      }

      const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password')
      res.json(updatedUser)
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  }
]

export const deleteUser = [
  verifyToken, // Middleware to verify the JWT token
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id)
      if (!user) return res.status(404).json({ message: 'User not found' })

      // Check if the logged-in user has permission to delete the user resource
      if (!checkOwnershipOrRole(req.user, user._id)) {
        return res.status(403).json({ message: 'Not authorized to delete this user' })
      }

      await User.findByIdAndDelete(req.params.id)
      res.status(204).json({ message: 'User deleted' })
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  }
]

export const listUserGardens = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const gardens = await Garden.find({ userId: user._id })
    res.json(gardens)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
