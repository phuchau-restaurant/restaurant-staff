// backend/middlewares/authMiddleware.js
import { verifyToken } from "../utils/jwt.js";

/**
 * Middleware kiểm tra JWT token
 * Lấy token từ header Authorization: Bearer <token>
 */
export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      const error = new Error("Missing or invalid authorization header");
      error.statusCode = 401;
      throw error;
    }

    // Tách token từ "Bearer <token>"
    const token = authHeader.substring(7);

    // Xác minh token
    const decoded = verifyToken(token);

    // Gắn user info vào request để sử dụng ở controller
    req.user = decoded;
    req.userId = decoded.id;

    next();
  } catch (error) {
    if (!error.statusCode) error.statusCode = 401;
    next(error);
  }
};
