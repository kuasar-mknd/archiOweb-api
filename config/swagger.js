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
  },
  apis: ['./routes/*.js'] // chemin vers vos fichiers de routes
}

const swaggerSpec = swaggerJsdoc(options)

export default swaggerSpec
