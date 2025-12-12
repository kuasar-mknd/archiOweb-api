import mongoose from 'mongoose'

const gardenSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true }
  },
  plants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Plant' }],
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true })

// Index pour la recherche géospatiale
gardenSchema.index({ location: '2dsphere' })

const Garden = mongoose.model('Garden', gardenSchema)

export default Garden
