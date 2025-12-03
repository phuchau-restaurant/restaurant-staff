// backend/routers/users.routes.js
import express from "express";
// Import controller đã được lắp ráp sẵn (đã có service & repo bên trong) từ Container
import { usersController } from "../containers/usersContainer.js";
import { tenantMiddleware } from "../middlewares/tenantMiddleware.js";
import { errorMiddleware } from "../middlewares/errorMiddleware.js";
const router = express.Router();

// Áp dụng middleware cho TOÀN BỘ các route bên dưới
router.use(tenantMiddleware);

// --- ĐỊNH NGHĨA CÁC ROUTE ---

// 1. Lấy danh sách (có thể kèm filter ?active=true)
// [GET] /api/users
router.get("/", usersController.getAll);

// 2. Lấy chi tiết một user theo ID
// [GET] /api/users/:id
router.get("/:id", usersController.getById);

// 3. Tạo mới
// [POST] /api/users
router.post("/", usersController.create);

// 4. Cập nhật thông tin (Cần ID để biết sửa cái nào)
// [PUT] /api/users/:id
router.put("/:id", usersController.update);

// 5. Xóa (Cần ID để biết xóa cái nào)
// [DELETE] /api/users/:id
router.delete("/:id", usersController.delete);

export default router;
