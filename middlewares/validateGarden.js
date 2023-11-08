// gardenMiddleware.js
import { body, validationResult } from 'express-validator'
import mongoose from 'mongoose'

export const validateGarden = [
  body('name').trim().isLength({ min: 1 }).withMessage('Name is required'),
  body('location.type').trim().isIn(['Point']).withMessage('Location type must be "Point"'),
  body('location.coordinates').isArray().withMessage('Location coordinates must be an array'),
  body('location.coordinates.*').isNumeric().withMessage('Location coordinates must be numbers'),
  // Add other validations as necessary
  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    next()
  }
]

export const validateGardenId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid garden ID' })
  }
  next()
}
