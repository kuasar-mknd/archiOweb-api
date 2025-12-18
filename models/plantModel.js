import mongoose from 'mongoose'

const plantSchema = new mongoose.Schema(
  {
    commonName: { type: String, required: true },
    scientificName: { type: String, required: true },
    family: { type: String, required: true },
    description: String,
    origin: String, // Vous pouvez éventuellement créer un schéma séparé pour l'origine si c'est une liste prédéfinie
    exposure: {
      type: String,
      enum: ['Full Sun', 'Partial Shade', 'Shade'],
      required: true
    },
    watering: String,
    soilType: String,
    flowerColor: String,
    height: Number,
    bloomingSeason: String,
    plantingSeason: String,
    care: String,
    imageUrl: String, // Stocke l'URL d'une image de la plante
    use: {
      type: String,
      enum: [
        'Ornamental',
        'Groundcover',
        'Food',
        'Medicinal',
        'Fragrance'
      ]
    },
    // Index added for performance: filtering plants by garden is a frequent operation
    garden: { type: mongoose.Schema.Types.ObjectId, ref: 'Garden', index: true } // Lien vers le jardin où la plante est cultivée
  },
  {
    timestamps: true // Ajoute les champs createdAt et updatedAt
  }
)

const Plant = mongoose.model('Plant', plantSchema)

export default Plant
