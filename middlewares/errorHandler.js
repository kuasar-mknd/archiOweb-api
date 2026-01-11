import { sendResponse } from '../utils/responseHandler.js'

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500
  err.status = err.status || 'error'

  if (process.env.NODE_ENV === 'development') {
    console.error('ERROR 💥', err)
  }

  // Si c'est une erreur opérationnelle connue (AppError), on renvoie le message
  if (err.isOperational) {
    const response = {
      success: false,
      status: err.status,
      message: err.message
    }
    if (err.errors) response.errors = err.errors
    return res.status(err.statusCode).json(response)
  }

  // Erreurs Mongoose de validation
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message)
    return res.status(400).json({
      success: false,
      status: 'fail',
      message: 'Validation Error',
      errors: messages
    })
  }

  // Erreurs Mongoose de duplication (E11000)
  if (err.code === 11000) {
    // Sentinel: Removed value leakage to prevent User Enumeration and Information Disclosure
    // Old: message: `Duplicate field value: ${value}. Please use another value.`
    return res.status(400).json({
      success: false,
      status: 'fail',
      message: 'Duplicate field value. Please use another value.'
    })
  }

  // Erreurs Mongoose CastError (mauvais ID)
  if (err.name === 'CastError') {
    // Sentinel: Removed value leakage to prevent Reflected XSS and Internal Path Disclosure
    // Old: message: `Invalid ${err.path}: ${err.value}.`
    return res.status(400).json({
      success: false,
      status: 'fail',
      message: `Invalid value for field ${err.path}.`
    })
  }

  // Erreur générique serveur (on ne fuite pas les détails en prod)
  return res.status(500).json({
    success: false,
    status: 'error',
    message: 'Something went very wrong!'
  })
}

export default errorHandler
