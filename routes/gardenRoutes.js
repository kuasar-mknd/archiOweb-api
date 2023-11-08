import express from 'express'
import {
  createGarden,
  getAllGardens,
  getGardenById,
  updateGarden,
  deleteGarden
} from '../controllers/gardenController.js'

// Middleware pour vérifier l'authentification
import { verifyToken } from '../services/authService.js'

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
 *     summary: Register a new garden
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
 *         description: Bad request.
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
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Détails du jardin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Garden'
 *       404:
 *         description: Jardin non trouvé
 */

// Route pour récupérer un jardin spécifique par son ID
router.get('/:id', getGardenById)

/**
 * @swagger
 * /api/gardens/{id}:
 *   put:
 *     summary: Met à jour les informations d'un jardin
 *     tags: [Gardens]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID unique du jardin
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Garden'
 *     responses:
 *       200:
 *         description: Jardin mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Garden'
 *       400:
 *         description: Erreur dans la mise à jour
 *       404:
 *         description: Jardin non trouvé
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
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID unique du jardin
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Jardin supprimé avec succès
 *       400:
 *         description: Erreur dans la suppression
 *       404:
 *         description: Jardin non trouvé
 *       500:
 *        description: Internal Server Error.
 */

// Route pour supprimer un jardin spécifique par son ID
router.delete('/:id', verifyToken, deleteGarden)

export default router
