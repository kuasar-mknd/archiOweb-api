import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    identifier: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    birthDate: { type: Date },
    password: { type: String, required: true, select: false },
    gardens: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Garden' }] // Supposant que vous avez un modèle Garden
  },
  { timestamps: true }
)

const User = mongoose.model('User', userSchema)

export default User
