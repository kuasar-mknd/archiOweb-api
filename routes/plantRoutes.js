import express from 'express'
import {
  createPlant,
  getAllPlants,
  getPlantById,
  updatePlant,
  deletePlant
} from '../controllers/plantController.js'

// Middleware pour vérifier l'authentification
import verifyToken from '../middlewares/verifyToken.js'

const router = express.Router()
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
 *       properties:
 *         commonName:
 *          type: string
 *          description: Le nom commun de la plantes
 *         scientificName:
 *          type: string
 *          description: Le nom scientifique de la plantes
 *         family:
 *          type: string
 *          description: La famille de la plantes
 *         origin:
 *          type: string
 *          description: L'origine de la plantes
 *         exposure:
 *          type: string
 *          description: L'exposition de la plantes
 *          enum: [Full Sun, Partial Shade, Shade]
 *         watering:
 *          type: string
 *          description: L'arrosage de la plantes
 *         soilType:
 *          type: string
 *          description: Le type de sol de la plantes
 *         flowerColor:
 *          type: string
 *          description: La couleur de la fleur de la plantes
 *         height:
 *          type: number
 *          description: La taille de la plantes
 *         bloomingSeason:
 *          type: string
 *          description: La saison de floraison de la plantes
 *         plantingSeason:
 *          type: string
 *          description: La saison de plantation de la plantes
 *         care:
 *          type: string
 *          description: Les soins de la plantes
 *         imageUrl:
 *          type: string
 *          description: L'URL de l'image de la plantes
 *         use:
 *          type: string
 *          description: L'utilisation de la plantes
 *          enum: [Ornamental, Groundcover, Food, Medicinal, Fragrance]
 *         garden:
 *          type: string
 *          description: Le jardin où la plantes est cultivée
 *       example:
 *         commonName: Basilic
 *         scientificName: Ocimum basilicum
 *         family: Lamiaceae
 *         origin: Inde
 *         exposure: Full Sun
 *         watering: 1 fois par semaine
 *         soilType: terreau
 *         flowerColor: blanc
 *         height: 30
 *         bloomingSeason: été
 *         plantingSeason: printemps
 *         care: arroser régulièrement
 *         imageUrl: https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Basil-Basilico-Ocimum_basilicum-albahaca.jpg/1200px-Basil-Basilico-Ocimum_basilicum-albahaca.jpg
 *         use: Food
 *         garden: 60a4d1a6a7b6f8e1e4a0a6d2
 */

/**
 * @openapi
 * /api/plants:
 *   post:
 *     tags:
 *       - Plants
 *     security:
 *       - BearerAuth: []
 *     summary: Crée une plante
 *     description: This route allows you to register a new plant.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - commonName
 *               - scientificName
 *               - family
 *               - exposure
 *             properties:
 *               commonName:
 *                 type: string
 *                 default: Basilic
 *               scientificName:
 *                 type: string
 *                 default: Ocimum basilicum
 *               family:
 *                 type: string
 *                 default: Lamiaceae
 *               origin:
 *                 type: string
 *                 default: Inde
 *               exposure:
 *                 type: string
 *                 default: Full Sun
 *               watering:
 *                 type: string
 *                 default: 1 fois par semaine
 *               soilType:
 *                 type: string
 *                 default: terreau
 *               flowerColor:
 *                 type: string
 *                 default: blanc
 *               height:
 *                 type: number
 *                 default: 30
 *               bloomingSeason:
 *                 type: string
 *                 default: été
 *               plantingSeason:
 *                 type: string
 *                 default: printemps
 *               care:
 *                 type: string
 *                 default: arroser régulièrement
 *               imageUrl:
 *                 type: string
 *                 default: https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Basil-Basilico-Ocimum_basilicum-albahaca.jpg/1200px-Basil-Basilico-Ocimum_basilicum-albahaca.jpg
 *               use:
 *                 type: string
 *                 default: Food
 *               garden:
 *                 type: string
 *                 default: 60a4d1a6a7b6f8e1e4a0a6d2
 *     responses:
 *       201:
 *         description: Plant registered successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                  type: string
 *                 commonName:
 *                  type: string
 *                 scientificName:
 *                  type: string
 *                 family:
 *                  type: string
 *                 origin:
 *                  type: string
 *                 exposure:
 *                  type: string
 *                 watering:
 *                  type: string
 *                 soilType:
 *                  type: string
 *                 flowerColor:
 *                  type: string
 *                 height:
 *                  type: number
 *                 bloomingSeason:
 *                  type: string
 *                 plantingSeason:
 *                  type: string
 *                 care:
 *                  type: string
 *                 imageUrl:
 *                  type: string
 *                 use:
 *                  type: string
 *                 garden:
 *                  type: string
 *                 createdAt:
 *                  type: string
 *                 updatedAt:
 *                  type: string
 *               example:
 *                 _id: string
 *                 commonName: string
 *                 scientificName: string
 *                 family: string
 *                 origin: string
 *                 exposure: string
 *                 watering: string
 *                 soilType: string
 *                 flowerColor: string
 *                 height: number
 *                 bloomingSeason: string
 *                 plantingSeason: string
 *                 care: string
 *                 imageUrl: string
 *                 use: string
 *                 garden: string
 *                 createdAt: string
 *                 updatedAt: string
 *       400:
 *         description: Bad request, token is not valid.
 *       401:
 *         description: No token, authorization denied.
 *       403:
 *         description: No token, authorization denied.
 *       404:
 *         description: Bad request, token is not valid.
 *       488:
 *         description: Incorrect Content.
 *       500:
 *         description: Internal Server Error.
 */

// Route pour créer une nouvelle plante
router.post('/', verifyToken, createPlant)
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
 *         description: Plants successfully recovered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                  type: string
 *                 commonName:
 *                  type: string
 *                 scientificName:
 *                  type: string
 *                 family:
 *                  type: string
 *                 origin:
 *                  type: string
 *                 exposure:
 *                  type: string
 *                 watering:
 *                  type: string
 *                 soilType:
 *                  type: string
 *                 flowerColor:
 *                  type: string
 *                 height:
 *                  type: number
 *                 bloomingSeason:
 *                  type: string
 *                 plantingSeason:
 *                  type: string
 *                 care:
 *                  type: string
 *                 imageUrl:
 *                  type: string
 *                 use:
 *                  type: string
 *                 garden:
 *                  type: string
 *                 createdAt:
 *                  type: string
 *                 updatedAt:
 *                  type: string
 *               example:
 *                 _id: string
 *                 commonName: string
 *                 scientificName: string
 *                 family: string
 *                 origin: string
 *                 exposure: string
 *                 watering: string
 *                 soilType: string
 *                 flowerColor: string
 *                 height: number
 *                 bloomingSeason: string
 *                 plantingSeason: string
 *                 care: string
 *                 imageUrl: string
 *                 use: string
 *                 garden: string
 *                 createdAt: string
 *                 updatedAt: string
 *       400:
 *         description: Bad request, token is not valid.
 *       401:
 *         description: No token, authorization denied.
 *       500:
 *         description: Internal Server Error.
 */

// Route pour récupérer toutes les plantes
router.get('/', verifyToken, getAllPlants)
/**
 * @swagger
 * /api/plants/{id}:
 *   get:
 *     summary: Récupère une plante spécifique par son ID
 *     tags: [Plants]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la plante
 *     responses:
 *       200:
 *         description: Specific plant successfully recovered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                  type: string
 *                 commonName:
 *                  type: string
 *                 scientificName:
 *                  type: string
 *                 family:
 *                  type: string
 *                 origin:
 *                  type: string
 *                 exposure:
 *                  type: string
 *                 watering:
 *                  type: string
 *                 soilType:
 *                  type: string
 *                 flowerColor:
 *                  type: string
 *                 height:
 *                  type: number
 *                 bloomingSeason:
 *                  type: string
 *                 plantingSeason:
 *                  type: string
 *                 care:
 *                  type: string
 *                 imageUrl:
 *                  type: string
 *                 use:
 *                  type: string
 *                 garden:
 *                  type: string
 *                 createdAt:
 *                  type: string
 *                 updatedAt:
 *                  type: string
 *               example:
 *                 _id: string
 *                 commonName: string
 *                 scientificName: string
 *                 family: string
 *                 origin: string
 *                 exposure: string
 *                 watering: string
 *                 soilType: string
 *                 flowerColor: string
 *                 height: number
 *                 bloomingSeason: string
 *                 plantingSeason: string
 *                 care: string
 *                 imageUrl: string
 *                 use: string
 *                 garden: string
 *                 createdAt: string
 *                 updatedAt: string
 *       500:
 *         description: Internal Server Error.
 *       400:
 *         description: Bad request, token is not valid.
 *       401:
 *         description: No token, authorization denied.
 *       404:
 *         description: Invalid plant ID
 */

// Route pour récupérer une plante spécifique par son ID
router.get('/:id', verifyToken, getPlantById)
/**
 * @swagger
 * /api/plants/{id}:
 *   put:
 *     summary: Met à jour une plante spécifique par son ID
 *     tags: [Plants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la plante
 *         schema:
 *           type: string
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Plant'
 *     responses:
 *       200:
 *         description: Plant update successfully completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                  type: string
 *                 commonName:
 *                  type: string
 *                 scientificName:
 *                  type: string
 *                 family:
 *                  type: string
 *                 origin:
 *                  type: string
 *                 exposure:
 *                  type: string
 *                 watering:
 *                  type: string
 *                 soilType:
 *                  type: string
 *                 flowerColor:
 *                  type: string
 *                 height:
 *                  type: number
 *                 bloomingSeason:
 *                  type: string
 *                 plantingSeason:
 *                  type: string
 *                 care:
 *                  type: string
 *                 imageUrl:
 *                  type: string
 *                 use:
 *                  type: string
 *                 garden:
 *                  type: string
 *                 createdAt:
 *                  type: string
 *                 updatedAt:
 *                  type: string
 *               example:
 *                 _id: string
 *                 commonName: string
 *                 scientificName: string
 *                 family: string
 *                 origin: string
 *                 exposure: string
 *                 watering: string
 *                 soilType: string
 *                 flowerColor: string
 *                 height: number
 *                 bloomingSeason: string
 *                 plantingSeason: string
 *                 care: string
 *                 imageUrl: string
 *                 use: string
 *                 garden: string
 *                 createdAt: string
 *                 updatedAt: string
 *       400:
 *         description: Bad request, token is not valid.
 *       401:
 *         description: No token, authorization denied.
 *       403:
 *         description: Not authorized to update this plant.
 *       404:
 *         description: Invalid plant ID.
 *       488:
 *         description: Incorrect Content.
 *       500:
 *         description: Internal Server Error.
 */

// Route pour mettre à jour une plante spécifique par son ID
router.put('/:id', verifyToken, updatePlant)
/**
 * @swagger
 * /api/plants/{id}:
 *   delete:
 *     summary: Supprime une plante spécifique par son ID
 *     tags: [Plants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la plante
 *         schema:
 *           type: string
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       204:
 *         description: Plante deleted
 *       400:
 *         description: Bad request, token is not valid.
 *       401:
 *         description: No token, authorization denied.
 *       403:
 *         description: Not authorized to delete this plant.
 *       404:
 *         description: Invalid plant ID or Garden not found.
 *       500:
 *        description: Internal Server Error.
 */

// Route pour supprimer une plante spécifique par son ID
router.delete('/:id', verifyToken, deletePlant)

export default router
