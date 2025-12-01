// backend/routers/auth.routes.js
import express from "express";
// Import controller đã được lắp ráp sẵn từ Container
import { authController } from "../containers/authContainer.js";
import { tenantMiddleware } from "../middlewares/tenantMiddleware.js";

const router = express.Router();

// --- ĐỊNH NGHĨA CÁC ROUTE ---

// [POST] /api/auth/login
// Cần tenantId để biết đăng nhập vào nhà hàng nào
router.post("/login", tenantMiddleware, authController.login);

// [POST] /api/auth/forgot-password
// Gửi yêu cầu reset password, cần tenantId để tìm đúng user
router.post("/forgot-password", tenantMiddleware, authController.forgotPassword);

// [POST] /api/auth/reset-password
// Đặt lại mật khẩu bằng token. Route này không cần tenantId
// vì token đã là duy nhất trên toàn hệ thống.
router.post("/reset-password", authController.resetPassword);

// [POST] /api/auth/logout
// Có thể thêm authentication middleware nếu cần
router.post("/logout", authController.logout);

export default router;
