import { body, validationResult } from 'express-validator'
import mongoose from 'mongoose'

// Middleware for validating plant IDs
export const validatePlantId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid plant ID' })
  }
  next()
}

// Validation for plant data
export const validatePlantData = [
  body('commonName').trim().isLength({ min: 1 }).withMessage('Common name is required'),
  body('scientificName').trim().isLength({ min: 1 }).withMessage('Scientific name is required'),
  // Add more validations as necessary for your Plant model
  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    next()
  }
]
