// backend/routers/menus.routes.js
import express from "express";
import { menusController } from "../containers/menusContainer.js";
import { tenantMiddleware } from "../middlewares/tenantMiddleware.js";
import { verifyQRTokenMiddleware } from "../middlewares/qrTokenMiddleware.js";

const router = express.Router();

// Routes cho CUSTOMER - yêu cầu QR token
router.get("/", verifyQRTokenMiddleware, menusController.getAll); // GET api/menus?token=xxx&categoryId=<id>&available=true
router.get("/:id", verifyQRTokenMiddleware, menusController.getById); // GET api/menus/:id?token=xxx

// Routes cho ADMIN - yêu cầu tenant ID (không cần QR token)
// Bắt buộc phải có Tenant ID cho mọi thao tác quản lý menu
router.post("/", tenantMiddleware, menusController.create);
router.put("/:id", tenantMiddleware, menusController.update);
//router.delete('/:id', tenantMiddleware, menusController.delete);

export default router;
