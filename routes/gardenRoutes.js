import express from 'express'
import {
  createGarden,
  getAllGardens,
  getGardenById,
  updateGarden,
  listPlantsInGarden,
  deleteGarden,
  getGardenAggregation
} from '../controllers/gardenController.js'

// Middleware pour vérifier l'authentification
import verifyToken from '../middlewares/verifyToken.js'

const router = express.Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     Garden:
 *       type: object
 *       required:
 *         - name
 *         - location
 *       properties:
 *         name:
 *           type: string
 *           description: Le nom du jardin
 *         location:
 *           type: Point
 *           coordinates: [longitude, latitude]
 *           description: La localisation du jardin en coordonnées GPS
 *       example:
 *         name: potagé
 *         location: { type: Point, coordinates: [41.40338, 2.17403]}
 */

/**
 * @openapi
 * /api/gardens:
 *   post:
 *     tags:
 *       - Gardens
 *     security:
 *       - BearerAuth: []
 *     summary: Crée un jardin
 *     description: This route allows you to register a new garden.
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
 *                 default: potagé
 *                 description: Le nom du jardin
 *               location:
 *                 type: string
 *                 default: { type: Point, coordinates: [41.40338, 2.17403]}
 *                 description: La localisation du jardin en coordonnées GPS
 *     responses:
 *       200:
 *         description: Details of garden registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 plants:
 *                   type: [string]
 *                 user:
 *                  type: string
 *                 createdAt:
 *                   type: string
 *                 updatedAt:
 *                   type: string
 *                 location:
 *                   type: Point
 *               example:
 *                 location: { type: Point, coordinates: [number, number]}
 *                 _id: string
 *                 name: string
 *                 plants: [string]
 *                 user: string
 *                 createdAt: string
 *                 updatedAt: string
 *       201:
 *         description: Graden registered successfully.
 *       400:
 *         description: Bad request, token is not valid.
 *       401:
 *         description: No token, authorization denied.
 *       488:
 *         description: Incorrect content.
 *       500:
 *         description: Internal Server Error.
 */

// Route pour créer un nouveau jardin
router.post('/', verifyToken, createGarden)
/**
 * @swagger
 * /api/gardens/:
 *   get:
 *     summary: Récupère la liste de tous les jardins
 *     tags: [Gardens]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Numéro de la page à récupérer
 *     responses:
 *       200:
 *         description: Garden list successfully retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 plants:
 *                   type: [string]
 *                 user:
 *                  type: string
 *                 createdAt:
 *                   type: string
 *                 updatedAt:
 *                   type: string
 *                 location:
 *                   type: Point
 *               example:
 *                 location: { type: Point, coordinates: [number, number]}
 *                 _id: string
 *                 name: string
 *                 plants: [string]
 *                 user: string
 *                 createdAt: string
 *                 updatedAt: string
 *       400:
 *        description: Bad request,Invalid latitude or longitude.
 *       500:
 *         description: Internal Server Error.
 *
 */

// Route pour récupérer tous les jardins
router.get('/', getAllGardens)
/**
 * @swagger
 * /api/gardens/{id}:
 *   get:
 *     summary: Récupère les détails d'un jardin par son ID
 *     tags: [Gardens]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du jardin
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
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 plants:
 *                   type: [string]
 *                 user:
 *                  type: string
 *                 createdAt:
 *                   type: string
 *                 updatedAt:
 *                   type: string
 *                 location:
 *                   type: Point
 *               example:
 *                 location: { type: Point, coordinates: [number, number]}
 *                 _id: string
 *                 name: string
 *                 plants: [string]
 *                 user: string
 *                 createdAt: string
 *                 updatedAt: string
 *       404:
 *         description: Garden not found, Invalid garden ID.
 *       500:
 *         description: Internal Server Error.
 */

// Route pour récupérer un jardin spécifique par son ID
router.get('/:id', getGardenById)

/**
 * @swagger
 * /api/gardens/{id}:
 *   put:
 *     summary: Met à jour les informations d'un jardin
 *     tags: [Gardens]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID unique du jardin
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               name:
 *                 type: string
 *                 default: potagé
 *                 description: Le nom du jardin
 *               location:
 *                 type: string
 *                 default: { type: Point, coordinates: [41.40338, 2.17403]}
 *                 description: La localisation du jardin en coordonnées GPS
 *     responses:
 *       200:
 *         description: Modification successfull
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 plants:
 *                   type: [string]
 *                 user:
 *                  type: string
 *                 createdAt:
 *                   type: string
 *                 updatedAt:
 *                   type: string
 *                 location:
 *                   type: Point
 *               example:
 *                 location: { type: Point, coordinates: [number, number]}
 *                 _id: string
 *                 name: string
 *                 plants: [string]
 *                 user: string
 *                 createdAt: string
 *                 updatedAt: string
 *       400:
 *         description: Bad request, token is not valid.
 *       401:
 *         description: No token, authorization denied.
 *       403:
 *         description: Not authorized to update this garden.
 *       404:
 *         description: Garden not found, Invalid garden ID.
 *       500:
 *         description: Internal Server Error.
 */

// Route pour mettre à jour un jardin spécifique par son ID
router.put('/:id', verifyToken, updateGarden)

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
 *         description: ID unique du jardin
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       204:
 *         description: Garden successfully deleted
 *       400:
 *         description: Bad request, token is not valid.
 *       401:
 *         description: No token, authorization denied.
 *       403:
 *         description: Not authorized to delete this garden.
 *       404:
 *         description: Garden not found, Invalid garden ID.
 *       500:
 *        description: Internal Server Error.
 */

// Route pour supprimer un jardin spécifique par son ID
router.delete('/:id', verifyToken, deleteGarden)

/**
 * @swagger
 * /api/gardens/{id}/plants:
 *   get:
 *     summary: Récupère les plantes d'un jardin
 *     tags: [Gardens]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du jardin
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Return plants in garden
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
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
 *                 _id:
 *                  type: string
 *                 createdAt:
 *                  type: string
 *                 updatedAt:
 *                  type: string
 *               example:
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
 *                 _id: string
 *                 createdAt: string
 *                 updatedAt: string
 *       400:
 *         description: Bad request,Token is not valid.
 *       401:
 *         description: No token, authorization denied.
 *       403:
 *         description: Not authorized to get plants in this garden.
 *       404:
 *         description: Garden not found, Invalid garden ID.
 *       500:
 *         description: Internal Server Error.
 */

// Route pour récupérer les plantes d'un jardin
router.get('/:id/plants', verifyToken, listPlantsInGarden)

/**
 * @swagger
 * /api/gardens/{id}/plants/aggregate:
 *   get:
 *     summary: Récupère l'aggrégation des plantes d'un jardin
 *     tags: [Gardens]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du jardin
 *         schema:
 *           type: string
 *     responses:
*       200:
 *         description: Return plants in garden aggregation by name and number of plants
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                  type: string
 *                 name:
 *                  type: string
 *                 numberofplants:
 *                  type: number
 *               example:
 *                _id: string
 *                name: string
 *                numberofplants: number
 *       400:
 *         description: Bad request,Token is not valid.
 *       401:
 *         description: No token, authorization denied.
 *       403:
 *         description: Not authorized to get plants in this garden.
 *       404:
 *         description: Garden not found, Invalid garden ID.
 *       500:
 *         description: Internal Server Error (Not authorized to get the plants from this garden).
 */

// Route pour récupérer aggrégation des plantes d'un jardin
router.get('/:id/plants/aggregate', verifyToken, getGardenAggregation)

export default router
