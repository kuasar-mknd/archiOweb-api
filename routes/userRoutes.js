import express from 'express'
import {
  registerUser,
  loginUser,
  updateUser,
  deleteUser,
  listUserGardens
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
 *         - birthDate
 *         - password
 *         - gardens
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
 *         birthDate:
 *          type: string
 *          format: date
 *          description: La date de naissance de l'utilisateur
 *         password:
 *           type: string
 *           format: password
 *           description: Le mot de passe de l'utilisateur
 *         gardens:
 *           type: Array
 *           description: Les jardins de l'utilisateur
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
 *     summary: Enregistre un nouvel utilisateur
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
 *               - birthDate
 *               - password
 *             properties:
 *               identifier:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               birthDate:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully.
 *       400:
 *         description: Bad request, user already exists.
 *       488:
 *         description: A valid email is required or password must be at least 6 characters long.
 *       500:
 *         description: Internal Server Error.
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
 *         description: Données d'entrée invalides.
 *       401:
 *         description: Authentification Auth failed.
 *       488:
 *         description: A valid email is required or password must be at least 6 characters long.
 *       500:
 *         description: Internal Server Error.
 */
router.post('/login', loginUser)

/**
 * @swagger
 * /api/users/gardens:
 *   get:
 *     summary: liste les gardens des users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       400:
 *         description: Bad request, token is not valid.
 *       401:
 *         description: No token, authorization denied.
 *       404:
 *         description: User not found.
 *       500:
 *        description: Internal Server Error.
 */

router.get('/gardens', verifyToken, listUserGardens)

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
 *         description: Bad request, token is not valid.
 *       401:
 *         description: No token, authorization denied.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal Server Error.
 */
router.put('/', verifyToken, updateUser)

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
 *         description: User, associated gardens, and plants deleted.
 *       400:
 *         description: Bad request, token is not valid.
 *       401:
 *         description: No token, authorization denied.
 *       404:
 *         description: User not found.
 *       500:
 *        description: Internal Server Error.
 */
router.delete('/', verifyToken, deleteUser)

export default router
