// backend/routers/categories.routes.js
import express from 'express';
import CategoriesController from '../controllers/Categories/categoriesController.js';

const router = express.Router();

/**
 * Định nghĩa các Routes cho Categories
 * Base URL: /api/categories (sẽ được cấu hình bên server.js)
 */

// Lấy danh sách (GET /api/categories)
// Có thể thêm query: ?active=true
// Yêu cầu Header: x-tenant-id
router.get('/', (req, res) => CategoriesController.getAll(req, res));

// Lấy chi tiết (GET /api/categories/:id)
router.get('/:id', (req, res) => CategoriesController.getById(req, res));

// Tạo mới (POST /api/categories)
router.post('/', (req, res) => CategoriesController.create(req, res));

// Cập nhật (PUT /api/categories/:id)
router.put('/:id', (req, res) => CategoriesController.update(req, res));

// Xóa (DELETE /api/categories/:id)
router.delete('/:id', (req, res) => CategoriesController.delete(req, res));

export default router;