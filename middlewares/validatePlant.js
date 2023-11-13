import { body, validationResult } from 'express-validator'
import mongoose from 'mongoose'

// Middleware for validating plant IDs
export const validatePlantId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ message: 'Invalid plant ID' })
  }
  next()
}

// Validation for plant data
export const validatePlantData = [
  body('commonName')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Common name is required and must be under 100 characters')
    .escape(),

  body('scientificName')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Scientific name is required and must be under 100 characters')
    .escape(),

  body('family')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Family is required and must be under 100 characters')
    .escape(),

  body('description')
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be under 500 characters')
    .optional()
    .escape(),

  body('origin')
    .trim()
    .isLength({ max: 100 })
    .withMessage('Origin must be under 100 characters')
    .optional()
    .escape(),

  body('exposure')
    .trim()
    .isIn(['Full Sun', 'Partial Shade', 'Shade'])
    .withMessage('Exposure must be one of the following: Full Sun, Partial Shade, Shade')
    .escape(),

  body('watering')
    .trim()
    .isLength({ max: 100 })
    .withMessage('Watering information must be under 100 characters')
    .optional()
    .escape(),

  body('soilType')
    .trim()
    .isLength({ max: 100 })
    .withMessage('Soil type must be under 100 characters')
    .optional()
    .escape(),

  body('flowerColor')
    .trim()
    .isLength({ max: 50 })
    .withMessage('Flower color must be under 50 characters')
    .optional()
    .escape(),

  body('height')
    .isFloat({ min: 0 })
    .withMessage('Height must be a positive number')
    .optional(),

  body('bloomingSeason')
    .trim()
    .isLength({ max: 100 })
    .withMessage('Blooming season must be under 100 characters')
    .optional()
    .escape(),

  body('plantingSeason')
    .trim()
    .isLength({ max: 100 })
    .withMessage('Planting season must be under 100 characters')
    .optional()
    .escape(),

  body('care')
    .trim()
    .isLength({ max: 500 })
    .withMessage('Care instructions must be under 500 characters')
    .optional()
    .escape(),

  body('imageUrl')
    .trim()
    .isURL()
    .withMessage('Image URL must be a valid URL')
    .optional()
    .escape(),

  body('use')
    .trim()
    .isIn(['Ornamental', 'Groundcover', 'Food', 'Medicinal', 'Fragrance'])
    .withMessage('Use must be one of the following: Ornamental, Groundcover, Food, Medicinal, Fragrance')
    .optional()
    .escape(),
  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    next()
  }
]

// Validation for plant data
export const validatePlantDataUpdate = [
  body('commonName')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Common name is required and must be under 100 characters')
    .optional()
    .escape(),

  body('scientificName')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Scientific name is required and must be under 100 characters')
    .optional()
    .escape(),

  body('family')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Family is required and must be under 100 characters')
    .optional()
    .escape(),

  body('description')
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be under 500 characters')
    .optional()
    .escape(),

  body('origin')
    .trim()
    .isLength({ max: 100 })
    .withMessage('Origin must be under 100 characters')
    .optional()
    .escape(),

  body('exposure')
    .trim()
    .isIn(['Full Sun', 'Partial Shade', 'Shade'])
    .withMessage('Exposure must be one of the following: Full Sun, Partial Shade, Shade')
    .optional()
    .escape(),

  body('watering')
    .trim()
    .isLength({ max: 100 })
    .withMessage('Watering information must be under 100 characters')
    .optional()
    .escape(),

  body('soilType')
    .trim()
    .isLength({ max: 100 })
    .withMessage('Soil type must be under 100 characters')
    .optional()
    .escape(),

  body('flowerColor')
    .trim()
    .isLength({ max: 50 })
    .withMessage('Flower color must be under 50 characters')
    .optional()
    .escape(),

  body('height')
    .isFloat({ min: 0 })
    .withMessage('Height must be a positive number')
    .optional(),

  body('bloomingSeason')
    .trim()
    .isLength({ max: 100 })
    .withMessage('Blooming season must be under 100 characters')
    .optional()
    .escape(),

  body('plantingSeason')
    .trim()
    .isLength({ max: 100 })
    .withMessage('Planting season must be under 100 characters')
    .optional()
    .escape(),

  body('care')
    .trim()
    .isLength({ max: 500 })
    .withMessage('Care instructions must be under 500 characters')
    .optional()
    .escape(),

  body('imageUrl')
    .trim()
    .isURL()
    .withMessage('Image URL must be a valid URL')
    .optional()
    .escape(),

  body('use')
    .trim()
    .isIn(['Ornamental', 'Groundcover', 'Food', 'Medicinal', 'Fragrance'])
    .withMessage('Use must be one of the following: Ornamental, Groundcover, Food, Medicinal, Fragrance')
    .optional()
    .escape(),
  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    next()
  }
]
