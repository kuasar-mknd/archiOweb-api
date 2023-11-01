import User from '../models/userModel.js'
import { hashPassword, comparePassword } from './authService.js'

// Enregistrer un nouvel utilisateur
export const registerUser = async (userData) => {
  try {
    userData.password = await hashPassword(userData.password)
    const user = new User(userData)
    await user.save()
    return user
  } catch (error) {}
}

// Authentifier un utilisateur
export const authenticateUser = async (email, password) => {
  try {
    const user = await User.findOne({ email })
    if (!user) {
      throw new Error('Utilisateur non trouvé.')
    }
    const isMatch = await comparePassword(password, user.password)
    if (!isMatch) {
      throw new Error('Mot de passe incorrect.')
    }
    return user
  } catch (error) {}
}

// Récupérer un utilisateur par son ID
export const getUserById = async (userId) => {
  try {
    const user = await User.findById(userId)
    return user
  } catch (error) {}
}

// Mettre à jour un utilisateur par son ID
export const updateUser = async (userId, updateData) => {
  try {
    if (updateData.password) {
      updateData.password = await hashPassword(updateData.password)
    }
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true
    })
    return updatedUser
  } catch (error) {}
}

// Supprimer un utilisateur par son ID
export const deleteUser = async (userId) => {
  try {
    const deletedUser = await User.findByIdAndDelete(userId)
    return deletedUser
  } catch (error) {}
}
