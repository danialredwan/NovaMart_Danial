const jwt = require("jsonwebtoken");
const User = require("../models/User");

// --- Middleware 1: Protect ---
// This checks if the user is logged in by verifying their JWT token.
// Any route wrapped with this will require a valid token.
const protect = async (req, res, next) => {
  let token;

  // JWT is sent in the Authorization header as: "Bearer <token>"
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      // Extract just the token part (after "Bearer ")
      token = req.headers.authorization.split(" ")[1];

      // Verify the token using our secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach the logged-in user's data to the request (excluding password)
      req.user = await User.findById(decoded.id).select("-password");

      next(); // Move on to the actual route handler
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, invalid token" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token provided" });
  }
};

// --- Middleware 2: Role Check ---
// This restricts a route to specific roles only.
// Usage example: authorizeRoles("admin") or authorizeRoles("admin", "vendor")
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Only ${roles.join(", ")} can access this route.`,
      });
    }
    next();
  };
};

module.exports = { protect, authorizeRoles };
