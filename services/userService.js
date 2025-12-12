import User from '../models/userModel.js'
import Garden from '../models/gardenModel.js'
import Plant from '../models/plantModel.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import AppError from '../utils/AppError.js'

export const createUser = async (userData) => {
  const { identifier, password, firstName, lastName, birthDate } = userData

  const userExists = await User.findOne({ identifier: { $eq: identifier } })
  if (userExists) {
    throw new AppError('User already exists', 400)
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  const user = new User({
    identifier,
    password: hashedPassword,
    firstName,
    lastName,
    birthDate
  })

  await user.save()
  // Ne pas retourner le mot de passe
  const userResponse = user.toObject()
  delete userResponse.password
  return userResponse
}

export const authenticateUser = async (identifier, password) => {
  const user = await User.findOne({ identifier: { $eq: identifier } })
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError('Auth failed', 401)
  }

  const token = jwt.sign(
    { userId: user._id, identifier: user.identifier },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  )

  return { token }
}

export const updateUser = async (userId, updateData) => {
  // Empêcher la mise à jour du mot de passe via cette route si nécessaire (déjà filtré par contrôleur/validateur idéalement)
  delete updateData.password

  const user = await User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true })
  if (!user) {
    throw new AppError('User not found', 404)
  }
  
  const userResponse = user.toObject()
  delete userResponse.password
  return userResponse
}

export const deleteUser = async (userId) => {
  const user = await User.findById(userId)
  if (!user) {
    throw new AppError('User not found', 404)
  }

  // Suppression en cascade (Jardins et Plantes)
  // Note: Idéalement, ceci devrait être dans un hook 'pre remove' Mongoose ou une transaction
  const gardens = await Garden.find({ user: userId })
  
  // Suppression des plantes de chaque jardin
  for (const garden of gardens) {
    await Plant.deleteMany({ garden: garden._id })
  }
  // Suppression des jardins
  await Garden.deleteMany({ user: userId })
  
  // Suppression de l'utilisateur
  await User.findByIdAndDelete(userId)
}

export const getUserGardens = async (userId) => {
  const user = await User.findById(userId).populate('gardens')
  if (!user) {
    throw new AppError('User not found', 404)
  }
  return user.gardens
}
