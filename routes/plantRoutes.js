import express from 'express'
import { body, param } from 'express-validator'
import {
  createPlant,
  getAllPlants,
  getPlantById,
  updatePlant,
  deletePlant
} from '../controllers/plantController.js'
import { validate } from '../middlewares/validator.js'
import verifyToken from '../middlewares/verifyToken.js'

const router = express.Router()

// Validation Rules
const plantValidation = [
  body('commonName').notEmpty().withMessage('Common name is required'),
  body('scientificName').notEmpty().withMessage('Scientific name is required'),
  body('family').notEmpty().withMessage('Family is required'),
  body('exposure').isIn(['Full Sun', 'Partial Shade', 'Shade']).withMessage('Invalid exposure'),
  body('garden').isMongoId().withMessage('Invalid garden ID')
]

const plantIdValidation = [
  param('id').isMongoId().withMessage('Invalid plant ID')
]

/**
 * @swagger
 * components:
 *   schemas:
 *     Plant:
 *       type: object
 *       required:
 *         - commonName
 *         - scientificName
 *         - family
 *         - exposure
 *         - garden
 *       properties:
 *         commonName:
 *           type: string
 *           description: Le nom commun de la plante
 *         scientificName:
 *           type: string
 *           description: Le nom scientifique de la plante
 *         family:
 *           type: string
 *           description: La famille de la plante
 *         description:
 *           type: string
 *           description: Description de la plante
 *         origin:
 *           type: string
 *           description: L'origine de la plante
 *         exposure:
 *           type: string
 *           enum: [Full Sun, Partial Shade, Shade]
 *           description: L'exposition requise pour la plante
 *         watering:
 *           type: string
 *           description: Les besoins en arrosage de la plante
 *         soilType:
 *           type: string
 *           description: Le type de sol requis pour la plante
 *         flowerColor:
 *           type: string
 *           description: La couleur des fleurs de la plante
 *         height:
 *           type: number
 *           description: La hauteur de la plante
 *         bloomingSeason:
 *           type: string
 *           description: La saison de floraison de la plante
 *         plantingSeason:
 *           type: string
 *           description: La saison de plantation de la plante
 *         care:
 *           type: string
 *           description: Les soins spécifiques pour la plante
 *         imageUrl:
 *           type: string
 *           description: L'URL de l'image de la plante
 *         use:
 *           type: string
 *           enum: [Ornamental, Groundcover, Food, Medicinal, Fragrance]
 *           description: L'utilisation de la plante
 *         garden:
 *           type: string
 *           description: L'ID du jardin auquel la plante appartient
 */

/**
 * @openapi
 * /api/plants:
 *   post:
 *     tags:
 *       - Plants
 *     security:
 *       - BearerAuth: []
 *     summary: Crée une nouvelle plante
 *     description: Permet de créer une nouvelle plante dans un jardin.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Plant'
 *     responses:
 *       201:
 *         description: Plant created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Plant'
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request.
 *       401:
 *         description: No token, authorization denied.
 *       403:
 *         description: Not authorized to add plants to this garden.
 *       404:
 *         description: Garden not found.
 *       422:
 *         description: Validation error.
 *       500:
 *         description: Internal Server Error.
 */
router.post('/', verifyToken, validate(plantValidation), createPlant)

/**
 * @swagger
 * /api/plants:
 *   get:
 *     summary: Récupère la liste de toutes les plantes
 *     tags: [Plants]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of plants successfully retrieved
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
 *       401:
 *         description: No token, authorization denied.
 *       500:
 *         description: Internal Server Error.
 */
router.get('/', verifyToken, getAllPlants)

/**
 * @swagger
 * /api/plants/{id}:
 *   get:
 *     summary: Récupère les détails d'une plante par son ID
 *     tags: [Plants]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la plante
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Plant details successfully retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Plant'
 *       400:
 *         description: Bad request (invalid ID).
 *       401:
 *         description: No token, authorization denied.
 *       404:
 *         description: Plant not found.
 *       422:
 *         description: Validation error (invalid ID format).
 *       500:
 *         description: Internal Server Error.
 */
router.get('/:id', verifyToken, validate(plantIdValidation), getPlantById)

/**
 * @swagger
 * /api/plants/{id}:
 *   put:
 *     summary: Met à jour les informations d'une plante
 *     tags: [Plants]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la plante à mettre à jour
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Plant'
 *     responses:
 *       200:
 *         description: Plant updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Plant'
 *       400:
 *         description: Bad request.
 *       401:
 *         description: No token, authorization denied.
 *       403:
 *         description: Not authorized to update this plant.
 *       404:
 *         description: Plant not found or Garden not found.
 *       422:
 *         description: Validation error.
 *       500:
 *         description: Internal Server Error.
 */
router.put('/:id', verifyToken, validate([...plantIdValidation, ...plantValidation]), updatePlant)

/**
 * @swagger
 * /api/plants/{id}:
 *   delete:
 *     summary: Supprime une plante
 *     tags: [Plants]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la plante à supprimer
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Plant deleted successfully
 *       400:
 *         description: Bad request.
 *       401:
 *         description: No token, authorization denied.
 *       403:
 *         description: Not authorized to delete this plant.
 *       404:
 *         description: Plant not found or Garden not found.
 *       422:
 *         description: Validation error (invalid ID format).
 *       500:
 *         description: Internal Server Error.
 */
router.delete('/:id', verifyToken, validate(plantIdValidation), deletePlant)

export default router
