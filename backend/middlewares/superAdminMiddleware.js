// Middleware to check if user is a super admin
import { verifyToken } from "../utils/jwt.js";

export const superAdminMiddleware = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      const error = new Error("No token provided");
      error.statusCode = 401;
      throw error;
    }

    const token = authHeader.split(" ")[1];
    
    // Verify token
    const decoded = verifyToken(token);
    
    // Check if user is super admin
    // Super admins don't have tenantId and have role 'super_admin'
    if (decoded.role !== "super_admin") {
      const error = new Error("Super admin privileges required");
      error.statusCode = 403;
      throw error;
    }

    // Attach user info to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 401;
    }
    next(error);
  }
};
