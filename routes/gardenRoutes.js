import express from 'express'
import { body, param } from 'express-validator'
import {
  createGarden,
  getAllGardens,
  getGardenById,
  updateGarden,
  deleteGarden,
  listPlantsInGarden,
  getGardenAggregation
} from '../controllers/gardenController.js'
import { validate } from '../middlewares/validator.js'
import verifyToken from '../middlewares/verifyToken.js'

const router = express.Router()

// Validations
const gardenValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('location').notEmpty().withMessage('Location is required').isObject(),
  body('location.type').equals('Point').withMessage('Location type must be Point'),
  body('location.coordinates').isArray({ min: 2, max: 2 }).withMessage('Coordinates must be an array of 2 numbers')
]

const gardenIdValidation = [
  param('id').isMongoId().withMessage('Invalid garden ID')
]

// Routes
/**
 * @swagger
 * components:
 *   schemas:
 *     Garden:
 *       type: object
 *       required:
 *         - name
 *         - location
 *         - user
 *       properties:
 *         name:
 *           type: string
 *           description: Le nom du jardin
 *         location:
 *           type: object
 *           properties:
 *             type:
 *               type: string
 *               enum: [Point]
 *             coordinates:
 *               type: array
 *               items:
 *                 type: number
 *           description: GeoJSON Point
 *         user:
 *           type: string
 *           description: ID du propriétaire
 *         plants:
 *           type: array
 *           items:
 *             type: string
 *           description: Liste des IDs des plantes
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/gardens:
 *   post:
 *     summary: Crée un nouveau jardin
 *     tags: [Gardens]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - location
 *             properties:
 *               name:
 *                 type: string
 *               location:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                     enum: [Point]
 *                   coordinates:
 *                     type: array
 *                     items:
 *                       type: number
 *     responses:
 *       201:
 *         description: Garden created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Garden'
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       422:
 *         description: Validation error
 */
router.post('/', verifyToken, validate(gardenValidation), createGarden)

/**
 * @swagger
 * /api/gardens:
 *   get:
 *     summary: Récupère la liste des jardins (avec filtres optionnels)
 *     tags: [Gardens]
 *     parameters:
 *       - in: query
 *         name: lat
 *         schema:
 *           type: number
 *         description: Latitude pour recherche géographique
 *       - in: query
 *         name: lng
 *         schema:
 *           type: number
 *         description: Longitude pour recherche géographique
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           default: 10000
 *         description: Rayon de recherche en mètres
 *     responses:
 *       200:
 *         description: List of gardens
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Garden'
 *       400:
 *         description: Invalid parameters
 */

router.get('/', getAllGardens)

/**
 * @swagger
 * /api/gardens/{id}:
 *   get:
 *     summary: Récupère un jardin par son ID
 *     tags: [Gardens]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Garden details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Garden'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Not owner)
 *       404:
 *         description: Garden not found
 *       422:
 *         description: Invalid ID format
 */
router.get('/:id', verifyToken, validate(gardenIdValidation), getGardenById)

/**
 * @swagger
 * /api/gardens/{id}:
 *   put:
 *     summary: Met à jour un jardin
 *     tags: [Gardens]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Garden'
 *     responses:
 *       200:
 *         description: Garden updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Garden'
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Garden not found
 */
router.put('/:id', verifyToken, validate([...gardenIdValidation, ...gardenValidation]), updateGarden)

/**
 * @swagger
 * /api/gardens/{id}:
 *   delete:
 *     summary: Supprime un jardin
 *     tags: [Gardens]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Garden deleted
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Garden not found
 */
router.delete('/:id', verifyToken, validate(gardenIdValidation), deleteGarden)

/**
 * @swagger
 * /api/gardens/{id}/plants:
 *   get:
 *     summary: Liste les plantes d'un jardin
 *     tags: [Gardens]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of plants
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Plant'
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Garden not found
 */
router.get('/:id/plants', verifyToken, validate(gardenIdValidation), listPlantsInGarden)

/**
 * @swagger
 * /api/gardens/{id}/plants/aggregate:
 *   get:
 *     summary: Agrégation des plantes d'un jardin
 *     tags: [Gardens]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Aggregated plant data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       numberofplants:
 *                         type: integer
 */
router.get('/:id/plants/aggregate', verifyToken, validate(gardenIdValidation), getGardenAggregation)

export default router
