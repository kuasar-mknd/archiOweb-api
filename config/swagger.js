import swaggerJsdoc from 'swagger-jsdoc'

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Home Garden API',
      version: '1.0.0',
      description: 'A simple Express API'
    },
    servers: [
      {
        url: process.env.SERVER_URL
      }
      // Vous pouvez ajouter d'autres serveurs ici, par exemple pour la production
    ],
    components: {
      securitySchemes: {
        BearerAuth: { // Nom du schéma de sécurité
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT' // Précisez ici le format du token, JWT dans cet exemple
        }
      }
    }
  },
  apis: ['./routes/*.js'] // chemin vers vos fichiers de routes
}

const swaggerSpec = swaggerJsdoc(options)

export default swaggerSpec
