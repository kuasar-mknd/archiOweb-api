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
 *           format: string
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
 *                 default:  john@gmail.com
 *               firstName:
 *                 type: string
 *                 default: john
 *               lastName:
 *                 type: string
 *                 default: doe
 *               birthDate:
 *                 type: string
 *                 default: 1990-01-01
 *               password:
 *                 type: string
 *                 default: password123
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
 *                 default:  john@gmail.com
 *                 description: Email ou nom d'utilisateur pour l'authentification
 *               password:
 *                 type: string
 *                 default: password123
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
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Authentification réussie, token retourné
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id :
 *                  type: string
 *                 name:
 *                  type: string
 *                 plants:
 *                  type: array
 *                 items:
 *                  type: string
 *                 user:
 *                  type: string
 *                 createdAt:
 *                  type: string
 *                 updatedAt:
 *                  type: string
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
 *       404:
 *         description: User not found.
 *       500:
 *        description: Internal Server Error.
 */

router.get('/gardens', verifyToken, listUserGardens)

/**
 * @swagger
 * /api/users:
 *   put:
 *     summary: Met à jour les informations d'un utilisateur
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               identifier:
 *                 type: string
 *                 example:  john@gmail.com
 *               firstName:
 *                 type: string
 *                 example: john
 *               lastName:
 *                 type: string
 *                 example: doe
 *               birthDate:
 *                 type: string
 *                 example: 1990-01-01
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Authentification réussie, token retourné
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id :
 *                  type: string
 *                 identifier:
 *                  type: string
 *                 firstName:
 *                  type: string
 *                 lastName:
 *                  type: string
 *                 birthDate:
 *                  type: string
 *                 gardens:
 *                  type: array
 *                  items:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                 updatedAt:
 *                   type: string
 *               example:
 *                 location: { type: Point, coordinates: [string, string]}
 *                 _id: string
 *                 identifier: string
 *                 firstName: string
 *                 lastName: string
 *                 birthDate: string
 *                 gardens: [string]
 *                 createdAt: string
 *                 updatedAt: string
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
 * /api/users:
 *   delete:
 *     summary: Supprime un utilisateur
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
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
