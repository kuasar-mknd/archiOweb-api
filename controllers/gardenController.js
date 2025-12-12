import * as gardenService from '../services/gardenService.js'
import { sendResponse } from '../utils/responseHandler.js'

// Create a new garden
export const createGarden = async (req, res, next) => {
  try {
    const garden = await gardenService.createGarden(req.body, req.user.userId)
    sendResponse(res, 201, garden)
  } catch (error) {
    next(error)
  }
}

// Retrieve all gardens
export const getAllGardens = async (req, res, next) => {
  try {
    const gardens = await gardenService.getAllGardens(req.query)
    sendResponse(res, 200, gardens)
  } catch (error) {
    next(error)
  }
}

// Retrieve a single garden by ID TO DO : ajout authentification
export const getGardenById = async (req, res, next) => {
  try {
    const garden = await gardenService.getGardenById(req.params.id)
    sendResponse(res, 200, garden)
  } catch (error) {
    next(error)
  }
}

// Update a garden
export const updateGarden = async (req, res, next) => {
  try {
    const updatedGarden = await gardenService.updateGarden(req.params.id, req.body, req.user)
    sendResponse(res, 200, updatedGarden)
  } catch (error) {
    next(error)
  }
}

// Delete a garden
export const deleteGarden = async (req, res, next) => {
  try {
    await gardenService.deleteGarden(req.params.id, req.user)
    sendResponse(res, 204, null)
  } catch (error) {
    next(error)
  }
}

// List the plants in a garden (gardenId)
export const listPlantsInGarden = async (req, res, next) => {
  try {
    const plants = await gardenService.listPlantsInGarden(req.params.id, req.user)
    sendResponse(res, 200, plants)
  } catch (error) {
    next(error)
  }
}

export const getGardenAggregation = async (req, res, next) => {
  try {
    const aggregation = await gardenService.getGardenAggregation(req.params.id, req.user)
    sendResponse(res, 200, aggregation)
  } catch (error) {
    next(error)
  }
}

// Export all controller functions
export default {
  createGarden,
  getAllGardens,
  getGardenById,
  updateGarden,
  deleteGarden,
  listPlantsInGarden,
  getGardenAggregation
}

function isNumeric (value) {
  return !isNaN(value) && isFinite(value)
}
