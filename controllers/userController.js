import User from '../models/userModel.js'
import jwt from 'jsonwebtoken'
import { body, validationResult } from 'express-validator'
import Garden from '../models/gardenModel.js'

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

const sanitizeUserUpdate = (req, res, next) => {
  // Prevent password updates through this route
  delete req.body.password
  next()
}

export const registerUser = [
  validateUserInput,
  async (req, res) => {
    try {
      const userExists = await User.findOne({ identifier: req.body.identifier })
      if (userExists) {
        return res.status(400).json({ message: 'User already exists' })
      }

      const user = new User(req.body)
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
      if (user && (await user.comparePassword(req.body.password))) {
        const token = jwt.sign(
          { userId: user._id },
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
  async (req, res) => {
    try {
      const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true
      }).select('-password')
      if (!user) return res.status(404).json({ message: 'User not found' })
      res.json(user)
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  }
]

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id)
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.status(204).json({ message: 'User deleted' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

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
