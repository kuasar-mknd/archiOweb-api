// gardenMiddleware.js
import { body, validationResult } from 'express-validator'
import mongoose from 'mongoose'

export const validateGarden = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Name is required and must be under 50 characters')
    .escape(),

  body('location.type')
    .trim()
    .isIn(['Point'])
    .withMessage('Location type must be "Point"')
    .escape(),

  body('location.coordinates')
    .isArray()
    .withMessage('Location coordinates must be an array')
    .custom((value) => {
      if (value.length !== 2 || !value.every(num => typeof num === 'number')) {
        throw new Error('Location coordinates must be an array of two numbers')
      }
      return true
    }),

  body('location.coordinates.*')
    .isNumeric()
    .withMessage('Location coordinates must be numeric')
    .isFloat({ min: -180, max: 180 }),
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
    console.log('Invalid garden ID')
    return res.status(404).json({ message: 'Invalid garden ID' })
  }
  next()
}
