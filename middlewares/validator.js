import { validationResult } from 'express-validator'
import AppError from '../utils/AppError.js'

export const validate = (validations) => {
  return async (req, res, next) => {
    // Exécute toutes les validations
    await Promise.all(validations.map(validation => validation.run(req)))

    const errors = validationResult(req)
    if (errors.isEmpty()) {
      return next()
    }

    // Extraction des messages d'erreur
    const extractedErrors = []
    errors.array().map(err => extractedErrors.push({ [err.path]: err.msg }))

    // On renvoie une erreur 422 Unprocessable Entity standardisée
    // Note: On pourrait aussi passer le tableau d'erreurs détaillé dans l'objet Error si on le modifie
    const message = 'Validation Error'
    const error = new AppError(message, 422)
    error.errors = extractedErrors
    
    // Pour l'instant, notre errorHandler ne gère pas error.errors spécifiquement pour l'affichage JSON détaillé
    // On va modifier errorHandler pour inclure les détails si présents
    return next(error)
  }
}
