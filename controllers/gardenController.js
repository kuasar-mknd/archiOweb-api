import Garden from '../models/gardenModel.js'

// Créer un nouveau jardin
export const createGarden = async (req, res) => {
  try {
    const garden = new Garden(req.body)
    const savedGarden = await garden.save()
    res.status(201).json(savedGarden)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

// Récupérer tous les jardins
export const getAllGardens = async (req, res) => {
  try {
    const gardens = await Garden.find().populate('plants')
    res.json(gardens)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Récupérer un seul jardin par ID
export const getGardenById = async (req, res) => {
  try {
    const garden = await Garden.findById(req.params.id).populate('plants')
    if (!garden) return res.status(404).json({ message: 'Garden not found' })
    res.json(garden)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Mettre à jour un jardin
export const updateGarden = async (req, res) => {
  try {
    const garden = await Garden.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    })
    if (!garden) return res.status(404).json({ message: 'Garden not found' })
    res.json(garden)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

// Supprimer un jardin
export const deleteGarden = async (req, res) => {
  try {
    const garden = await Garden.findByIdAndDelete(req.params.id)
    if (!garden) return res.status(404).json({ message: 'Garden not found' })
    res.status(204).json({ message: 'Garden deleted' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// **Lister les plantes d'un jardin (gardenId)** : Cette fonction renvoie la liste des plantes associées à un jardin donné en utilisant son identifiant (gardenId).
export const listPlantsInGarden = async (req, res) => {
  try {
    const garden = await Garden.findById(req.params.id).populate('plants')
    if (!garden) {
      return res.status(404).json({ message: 'Garden not found' })
    }
    const plants = garden.plants // Récupérer la liste des plantes du jardin
    res.json(plants)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
