// Middleware to check if user is a super admin
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "super-admin-secret-key";

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

    // Verify token with super admin secret
    const decoded = jwt.verify(token, JWT_SECRET);

    // Check if user is super admin
    if (decoded.role !== "super_admin" || decoded.type !== "platform_admin") {
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
    if (error.name === "TokenExpiredError") {
      error.message = "Token đã hết hạn";
      error.statusCode = 401;
    } else if (!error.statusCode) {
      error.statusCode = 401;
    }
    next(error);
  }
};
