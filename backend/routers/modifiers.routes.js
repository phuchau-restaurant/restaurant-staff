// backend/routers/modifiers.routes.js
import express from "express";
import { modifierGroupsController } from "../containers/modifierGroupsContainer.js";
import { tenantMiddleware } from "../middlewares/tenantMiddleware.js";

const router = express.Router();

// Bắt buộc có TenantID cho mọi route
router.use(tenantMiddleware);

// ==================== MODIFIER GROUPS ROUTES ====================

// [GET] /api/admin/menu/modifier-groups - Lấy danh sách modifier groups
router.get("/modifier-groups", modifierGroupsController.getAll);

// [GET] /api/admin/menu/modifier-groups/:id - Lấy chi tiết modifier group
router.get("/modifier-groups/:id", modifierGroupsController.getById);

// [POST] /api/admin/menu/modifier-groups - Tạo modifier group mới
router.post("/modifier-groups", modifierGroupsController.create);

// [PUT] /api/admin/menu/modifier-groups/:id - Cập nhật modifier group
router.put("/modifier-groups/:id", modifierGroupsController.update);

// [DELETE] /api/admin/menu/modifier-groups/:id - Xóa modifier group
router.delete("/modifier-groups/:id", modifierGroupsController.delete);

// [PATCH] /api/admin/menu/modifier-groups/:id/status - Toggle trạng thái
router.patch("/modifier-groups/:id/status", modifierGroupsController.toggleStatus);

// ==================== MODIFIER OPTIONS ROUTES ====================

// [POST] /api/admin/menu/modifier-groups/:id/options - Tạo option trong group
router.post("/modifier-groups/:id/options", modifierGroupsController.createOption);

// [PUT] /api/admin/menu/modifier-options/:id - Cập nhật option
router.put("/modifier-options/:id", modifierGroupsController.updateOption);

// [DELETE] /api/admin/menu/modifier-options/:id - Xóa option
router.delete("/modifier-options/:id", modifierGroupsController.deleteOption);

export default router;
