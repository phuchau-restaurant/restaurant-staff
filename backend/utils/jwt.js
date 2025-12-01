// backend/utils/jwt.js
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"; // TODO: Set in .env
const JWT_EXPIRE = process.env.JWT_EXPIRE || "7d";

/**
 * Tạo JWT token
 * @param {Object} payload - Dữ liệu cần mã hóa vào token
 * @returns {string} - JWT token
 */
export const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRE });
};

/**
 * Xác minh JWT token
 * @param {string} token - JWT token cần xác minh
 * @returns {Object} - Payload từ token nếu hợp lệ
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error(`Token verification failed: ${error.message}`);
  }
};

/**
 * Giải mã token mà không xác minh (chỉ để lấy dữ liệu)
 * @param {string} token - JWT token
 * @returns {Object} - Payload từ token
 */
export const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    throw new Error(`Token decode failed: ${error.message}`);
  }
};
