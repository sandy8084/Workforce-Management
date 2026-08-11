const jwt = require('jsonwebtoken');

// Checks if a valid token was sent, and attaches the decoded user info to the request
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided' });
  }

  // Header format is usually: "Bearer <token>"
  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Malformed token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // now every route after this can access req.user.employee_id and req.user.role
    next(); // move on to the actual route handler
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// Checks if the logged-in user's role is allowed to access this route
const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied: insufficient permissions' });
    }
    next();
  };
};

module.exports = { verifyToken, allowRoles };