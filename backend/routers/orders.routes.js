import express from 'express';
import { ordersController } from '../containers/ordersContainer.js';
import { tenantMiddleware } from '../middlewares/tenantMiddleware.js';

const router = express.Router();

// Bắt buộc có TenantID
router.use(tenantMiddleware);

router.get('/', ordersController.getAll);
router.post('/', ordersController.create);
router.get('/:id', ordersController.getById);
router.put('/:id', ordersController.update);
router.delete('/:id', ordersController.delete);

export default router;