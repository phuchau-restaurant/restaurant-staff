// backend/routers/admin.routes.js  
import express from "express";
import { adminController } from "../containers/adminContainer.js";
import { tablesController } from "../containers/tablesContainer.js";
import { tenantMiddleware } from "../middlewares/tenantMiddleware.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Xác thực QR token (public route cho customer - KHÔNG CẦN AUTH)
router.post("/qr/verify", adminController.verifyQRToken);

// Bắt buộc có TenantID và phải đăng nhập cho các routes còn lại
router.use(tenantMiddleware);

// --- TABLES ROUTES ---
// GET All (Filter by location, status)
router.get("/tables", tablesController.getAll);

// GET by id
router.get("/tables/:id", tablesController.getById);

// POST Create
router.post("/tables", tablesController.create);

// PUT Update (Full update or partial)
router.put("/tables/:id", tablesController.update);

// PATCH Status (only)
router.patch("/tables/:id/status", tablesController.updateStatus);

router.use(authMiddleware);

// Tạo QR code cho bàn (chỉ admin)
router.post("/tables/:id/qr/generate", adminController.generateTableQR);

// Download QR code (PNG hoặc PDF)
router.get("/tables/:id/qr/download", adminController.downloadTableQR);

// Download tất cả QR codes (ZIP chứa PNG + PDF)
router.get("/tables/qr/download-all", adminController.downloadAllTableQR);

export default router;
