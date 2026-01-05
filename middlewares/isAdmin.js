const isAdmin = (req, res, next) => {
  // Check if user exists (authenticated) and has the admin role
  if (req.user && req.user.role === 'admin') {
    next() // User is an admin, proceed to the next middleware
  } else {
    res.status(403).json({ message: 'Access denied. User is not an administrator.' })
  }
}

export default isAdmin
