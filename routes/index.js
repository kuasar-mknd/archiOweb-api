import express from 'express'
const router = express.Router()

// Route d'accueil qui peut servir de point d'entrée pour la documentation de l'API
router.get('/', (req, res) => {
  res.json({
    message: "Bienvenue sur l'API HomeGarden",
    documentation_url: 'http://api.homegarden.com/doc',
  })
})

export default router
