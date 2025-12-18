import * as plantService from '../services/plantService.js'
import { sendResponse } from '../utils/responseHandler.js'

export const createPlant = async (req, res, next) => {
  try {
    // req.user contains { userId, role }
    // We pass req.user.userId as the creator ID, and req.user object for auth check
    if (req.file) {
      req.body.imageUrl = req.file.path
    }
    const plant = await plantService.createPlant(req.body, req.user.userId, req.user)
    sendResponse(res, 201, plant)
  } catch (error) {
    next(error)
  }
}

export const getAllPlants = async (req, res, next) => {
  try {
    const plants = await plantService.getAllPlants(req.user)
    sendResponse(res, 200, plants)
  } catch (error) {
    next(error)
  }
}

export const getPlantById = async (req, res, next) => {
  try {
    const plant = await plantService.getPlantById(req.params.id)
    sendResponse(res, 200, plant)
  } catch (error) {
    next(error)
  }
}

export const updatePlant = async (req, res, next) => {
  try {
    if (req.file) {
      req.body.imageUrl = req.file.path
    }
    const updatedPlant = await plantService.updatePlant(req.params.id, req.body, req.user)
    sendResponse(res, 200, updatedPlant)
  } catch (error) {
    next(error)
  }
}

export const deletePlant = async (req, res, next) => {
  try {
    await plantService.deletePlant(req.params.id, req.user)
    sendResponse(res, 204, null)
  } catch (error) {
    next(error)
  }
}

export default {
  createPlant,
  getAllPlants,
  getPlantById,
  updatePlant,
  deletePlant
}
