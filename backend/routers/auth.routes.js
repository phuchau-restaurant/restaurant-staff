// backend/routers/auth.routes.js
import express from "express";
// Import controller đã được lắp ráp sẵn từ Container
import { authController } from "../containers/authContainer.js";

const router = express.Router();

// --- ĐỊNH NGHĨA CÁC ROUTE ---

// [POST] /api/auth/login
// Không cần tenantMiddleware vì đây là công khai (public route)
router.post("/login", authController.login);

// [POST] /api/auth/logout
// Có thể thêm authentication middleware nếu cần
router.post("/logout", authController.logout);

export default router;
