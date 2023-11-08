const isAdmin = (req, res, next) => {
  // Assuming the user's role is attached to the request in the verifyToken middleware
  if (req.user && req.user.role === 'admin') {
    next() // User is an admin, proceed to the next middleware
  } else {
    res.status(403).json({ message: 'Access denied. User is not an administrator.' })
  }
}

export default isAdmin
