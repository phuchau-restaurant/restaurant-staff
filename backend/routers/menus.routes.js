// backend/routers/menus.routes.js
import express from "express";
import { menusController } from "../containers/menusContainer.js";
import { tenantMiddleware } from "../middlewares/tenantMiddleware.js";

const router = express.Router();

// Bắt buộc có TenantID cho mọi route
router.use(tenantMiddleware);

// Routes cho CUSTOMER - chỉ cần tenant ID (đã verify QR ở trang login)
router.get("/", menusController.getAll); // GET api/menus?categoryId=<id>&available=true
router.get("/:id", menusController.getById); // GET api/menus/:id

// Routes cho ADMIN - quản lý menu
router.post("/", menusController.create);
router.put("/:id", menusController.update);
router.delete('/:id', menusController.delete);

export default router;
