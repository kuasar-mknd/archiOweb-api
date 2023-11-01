import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

const userSchema = new mongoose.Schema(
  {
    identifier: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    birthDate: { type: Date },
    password: { type: String, required: true },
    gardens: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Garden' }] // Supposant que vous avez un modèle Garden
  },
  { timestamps: true }
) // Ajoute automatiquement les champs createdAt et updatedAt

// Avant d'enregistrer le document, cryptez le mot de passe
userSchema.pre('save', async function (next) {
  if (this.isModified('password') || this.isNew) {
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(this.password, salt)
    this.password = hash
  }
  next()
})

// Méthode pour comparer le mot de passe fourni avec le hash enregistré
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

const User = mongoose.model('User', userSchema)

export default User
