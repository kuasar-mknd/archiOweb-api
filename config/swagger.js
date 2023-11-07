import swaggerJsdoc from 'swagger-jsdoc'

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Hello World API',
      version: '1.0.0',
      description: 'A simple Express API'
    },
    servers: [
      {
        url: process.env.SERVER_URL
      }
      // Vous pouvez ajouter d'autres serveurs ici, par exemple pour la production
    ]
  }
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
 * @openapi
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
  // apis: ['./routes/*.js'] // chemin vers vos fichiers de routes
}

const swaggerSpec = swaggerJsdoc(options)

export default swaggerSpec
