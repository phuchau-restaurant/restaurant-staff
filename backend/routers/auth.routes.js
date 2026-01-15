// backend/routers/auth.routes.js
import express from "express";
// Import controller đã được lắp ráp sẵn từ Container
import { authController } from "../containers/authContainer.js";
import { tenantMiddleware } from "../middlewares/tenantMiddleware.js";

const router = express.Router();

// --- ĐỊNH NGHĨA CÁC ROUTE ---

// [POST] /api/auth/login
// Không cần tenantId vì sẽ tự động xác định từ email của user
router.post("/login", authController.login);

// [POST] /api/auth/refresh
// Làm mới access token bằng refresh token
router.post("/refresh", authController.refresh);

// [POST] /api/auth/forgot-password
// Gửi yêu cầu reset password, cần tenantId để tìm đúng user
router.post(
  "/forgot-password",
  tenantMiddleware,
  authController.forgotPassword
);

// [POST] /api/auth/reset-password
// Đặt lại mật khẩu bằng token. Route này không cần tenantId
// vì token đã là duy nhất trên toàn hệ thống.
router.post("/reset-password", authController.resetPassword);

// [POST] /api/auth/logout
// Có thể thêm authentication middleware nếu cần
router.post("/logout", authController.logout);

export default router;
