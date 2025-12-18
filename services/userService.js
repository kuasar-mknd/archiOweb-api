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

// Pre-computed hash with cost 10 to mitigate timing attacks (User Enumeration)
const DUMMY_HASH = '$2b$10$CpKfxnNBcbnlYOwHlj6AHOKo2eEVwfmtGzceFLXeiSyu5QoHF/mp6'

export const authenticateUser = async (identifier, password) => {
  const user = await User.findOne({ identifier: { $eq: identifier } })

  // Sentinel: Mitigation for Timing Attack (User Enumeration)
  // We always execute bcrypt.compare to ensure the response time is consistent
  // regardless of whether the user exists or not.
  const passwordToCompare = user ? user.password : DUMMY_HASH
  const isMatch = await bcrypt.compare(password, passwordToCompare)

  if (!user || !isMatch) {
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
  // Filter allowed fields to prevent arbitrary updates/injection
  // Explicitly excluding 'password' and 'role' (if it existed) by omitting them from this list
  const allowedUpdates = ['firstName', 'lastName', 'birthDate', 'identifier']
  const filteredUpdateData = Object.keys(updateData)
    .filter(key => allowedUpdates.includes(key))
    .reduce((obj, key) => {
      obj[key] = updateData[key]
      return obj
    }, {})

  const user = await User.findByIdAndUpdate(userId, filteredUpdateData, { new: true, runValidators: true })
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

export const fetchUserById = async (userId, requestingUser) => {
  const user = await User.findById(userId)
  if (!user) {
    throw new AppError('User not found', 404)
  }
  const userResponse = user.toObject()
  delete userResponse.password

  // If requestingUser is NOT the owner AND NOT admin, filter sensitive data
  // requestingUser.userId is from the token
  if (requestingUser.userId !== userId.toString() && requestingUser.role !== 'admin') {
    delete userResponse.identifier
    delete userResponse.birthDate
    delete userResponse.updatedAt
  }

  return userResponse
}
