// backend/src/routers/categories.routes.js
import express from "express";
// Import controller đã được lắp ráp sẵn (đã có service & repo bên trong) từ Container
import { categoriesController } from "../containers/categoriesContainer.js";
import { tenantMiddleware } from "../middlewares/tenantMiddleware.js";
import { errorMiddleware } from "../middlewares/errorMiddleware.js";
const router = express.Router();

// Áp dụng middleware cho TOÀN BỘ các route bên dưới
router.use(tenantMiddleware);

// --- ĐỊNH NGHĨA CÁC ROUTE ---

// 1. Lấy danh sách (có thể kèm filter ?status=active|inactive)
// [GET] /api/categories
router.get("/", categoriesController.getAll);

// 2. Lấy chi tiết một category theo ID
// [GET] /api/categories/:id
router.get("/:id", categoriesController.getById);

// 3. Tạo mới
// [POST] /api/categories
router.post("/", categoriesController.create);

// 4. Cập nhật thông tin (Cần ID để biết sửa cái nào)
// [PUT] /api/categories/:id
router.put("/:id", categoriesController.update);

// 5. Xóa vĩnh viễn (phải đặt trước route /:id để tránh conflict)
// [DELETE] /api/categories/:id/permanent
router.delete("/:id/permanent", categoriesController.deletePermanent);

// 6. Xóa mềm (Soft delete - set is_active = false)
// [DELETE] /api/categories/:id
router.delete("/:id", categoriesController.delete);

export default router;
