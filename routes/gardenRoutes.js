import express from 'express'
import {
  createGarden,
  getAllGardens,
  getGardenById,
  updateGarden,
  listPlantsInGarden,
  deleteGarden
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
 *         - plants
 *         - user
 *       properties:
 *         name:
 *           type: string
 *           description: Le nom du jardin
 *         location:
 *           type: Point
 *           coordinates: [longitude, latitude]
 *           description: La localisation du jardin en coordonnées GPS
 *         plants:
 *          type: Array
 *          description: Les plantes du jardin
 *         user:
 *           type: string
 *           description: L'utilisateur du jardin
 *       example:
 *         name: potagé
 *         location: { type: Point, coordinates: [41.40338, 2.17403]}
 *         plants: [Ocimum basilicum, Mentha spicata, Rosmarinus officinalis]
 *         user: John Doe
 */

/**
 * @openapi
 * /api/gardens:
 *   post:
 *     tags:
 *       - Gardens
 *     security:
 *       - bearerAuth: []
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
 *               - plants
 *               - user
 *             properties:
 *               name:
 *                 type: string
 *               location:
 *                 type: string
 *               plants:
 *                 type: string
 *               user:
 *                 type: string
 *     responses:
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
 * /api/gardens:
 *   get:
 *     summary: Récupère la liste de tous les jardins
 *     tags: [Gardens]
 *     responses:
 *       400:
 *        description: Bad request,Invalid latitude or longitude.
 *       500:
 *         description: Internal Server Error.

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
 *               $ref: '#/components/schemas/Garden'
 *       404:
 *         description: Garden not found, Invalid garden ID.
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
 *       - bearerAuth: []
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
 *             $ref: '#/components/schemas/Garden'
 *     responses:
 *       200:
 *         description: Updated garden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Garden'
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
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID unique du jardin
 *         schema:
 *           type: string
 *     responses:
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

// Route pour récupérer les plantes d'un jardin
router.get('/:id/plants', verifyToken, listPlantsInGarden)

export default router
