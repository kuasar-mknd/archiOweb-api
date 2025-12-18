import jwt from 'jsonwebtoken'

const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1] // Assumes token is sent in the Authorization header as "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' })
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET) // Replace 'process.env.JWT_SECRET' with your secret key
    // Add the user from the payload
    req.user = decoded
    next()
  } catch (e) {
    res.status(400).json({ message: 'Bad request, token is not valid' })
  }
}

export default verifyToken
