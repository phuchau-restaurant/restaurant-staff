// backend/utils/jwt.js
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_ACCESS_SECRET || "your-secret-key"; // Use JWT_ACCESS_SECRET from .env
const JWT_EXPIRE = process.env.JWT_ACCESS_EXPIRE || "15m"; // Access token: 15 phút
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key";
const JWT_REFRESH_EXPIRE = process.env.JWT_REFRESH_EXPIRE || "7d"; // Refresh token: 7 ngày

/**
 * Tạo Access JWT token (thời gian ngắn)
 * @param {Object} payload - Dữ liệu cần mã hóa vào token
 * @returns {string} - JWT token
 */
export const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRE });
};

/**
 * Tạo Refresh JWT token (thời gian dài)
 * @param {Object} payload - Dữ liệu cần mã hóa vào refresh token
 * @returns {string} - Refresh JWT token
 */
export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRE,
  });
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
 * Xác minh Refresh JWT token
 * @param {string} token - Refresh JWT token cần xác minh
 * @returns {Object} - Payload từ token nếu hợp lệ
 */
export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  } catch (error) {
    throw new Error(`Refresh token verification failed: ${error.message}`);
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
