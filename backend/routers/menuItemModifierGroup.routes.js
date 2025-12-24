// backend/routers/menuItemModifierGroup.routes.js
import express from "express";
import { menuItemModifierGroupController } from "../containers/menuItemModifierGroupContainer.js";

const router = express.Router();

// Thêm liên kết
router.post("/", menuItemModifierGroupController.addLink);
// Xóa liên kết
router.delete("/", menuItemModifierGroupController.removeLink);
// Tìm kiếm liên kết (có thể chỉ truyền dishId để lấy hết group liên quan)
router.get("/", menuItemModifierGroupController.findLink);

export default router;
