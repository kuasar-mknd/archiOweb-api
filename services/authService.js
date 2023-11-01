import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

// Middleware pour vérifier le token JWT
export const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1] // Bearer <token>
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.userData = decoded
    next()
  } catch (error) {
    return res.status(401).json({
      message: 'Authentification échouée'
    })
  }
}

// Fonction pour générer un token JWT
export const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '1h' } // ou une autre durée selon vos besoins
  )
}

// Fonction pour hacher un mot de passe
export const hashPassword = async (password, saltRounds = 10) => {
  return await bcrypt.hash(password, saltRounds)
}

// Fonction pour comparer un mot de passe non haché avec un mot de passe haché
export const comparePassword = async (candidatePassword, userPassword) => {
  return await bcrypt.compare(candidatePassword, userPassword)
}
