import express from 'express'
import {
  registerUser,
  loginUser,
  getUserById,
  updateUser,
  deleteUser
} from '../controllers/userController.js'

// Middleware pour vérifier l'authentification
import verifyToken from '../middlewares/verifyToken.js'

const router = express.Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - identifier
 *         - firstName
 *         - lastName
 *         - password
 *       properties:
 *         identifier:
 *           type: string
 *           description: L'identifiant unique de l'utilisateur
 *         firstName:
 *           type: string
 *           description: Le prénom d'utilisateur
 *         lastName:
 *           type: string
 *           format: email
 *           description: Le nom d'utilisateur
 *         password:
 *           type: string
 *           format: password
 *           description: Le mot de passe de l'utilisateur
 *       example:
 *         idendifier: johndoe@example.com
 *         firstName: john
 *         lastName: doe
 *         password: password123
 */

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     tags:
 *       - Users
 *     summary: Register a new user
 *     description: This route allows you to register a new user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - identifier
 *               - firstName
 *               - lastName
 *               - password
 *             properties:
 *               identifier:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully.
 *       400:
 *         description: Bad request.
 */
router.post('/register', registerUser)

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Authentifie un utilisateur et retourne un token
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - identifier
 *               - password
 *             properties:
 *               identifier:
 *                 type: string
 *                 description: Email ou nom d'utilisateur pour l'authentification
 *               password:
 *                 type: string
 *                 description: Mot de passe pour l'authentification
 *     responses:
 *       200:
 *         description: Authentification réussie, token retourné
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: Token JWT pour authentification
 *       400:
 *         description: Données d'entrée invalides
 *       401:
 *         description: Authentification échouée
 */
router.post('/login', loginUser)

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Récupère les détails d'un utilisateur par son ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID unique de l'utilisateur
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Détails de l'utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Utilisateur non trouvé
 */
router.get('/:id', verifyToken, getUserById)

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Met à jour les informations d'un utilisateur
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID unique de l'utilisateur
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: Utilisateur mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Erreur dans la mise à jour
 *       404:
 *         description: Utilisateur non trouvé
 */
router.put('/:id', verifyToken, updateUser)

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Supprime un utilisateur
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID unique de l'utilisateur
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Utilisateur supprimé avec succès
 *       400:
 *         description: Erreur dans la suppression
 *       404:
 *         description: Utilisateur non trouvé
 */
router.delete('/:id', verifyToken, deleteUser)

export default router
