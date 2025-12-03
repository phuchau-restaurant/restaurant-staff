// backend/routers/menus.routes.js
import express from 'express';
import { menusController } from '../containers/menusContainer.js';
import { tenantMiddleware } from '../middlewares/tenantMiddleware.js';

const router = express.Router();

// Bắt buộc phải có Tenant ID cho mọi thao tác menu
router.use(tenantMiddleware);

// Định nghĩa routes
router.get('/', menusController.getAll);
router.get('/:id', menusController.getById);
router.post('/', menusController.create);
router.put('/:id', menusController.update);
router.delete('/:id', menusController.delete);

export default router;