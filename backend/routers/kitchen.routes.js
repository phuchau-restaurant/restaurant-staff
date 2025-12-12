import express from 'express';
import { ordersController } from '../containers/ordersContainer.js';
import { tenantMiddleware } from '../middlewares/tenantMiddleware.js';

const router = express.Router();

// Bắt buộc có TenantID
router.use(tenantMiddleware);

// GET /api/kitchen/orders/?categoryId=<id> & orderStatus=<orderStatus> & itemStatus=<itemStatus>
router.get('/orders', ordersController.getForKitchen);

//PUT /api/kitchen/orders/:orderId/:orderDetailId
router.put('/orders/:orderId/:orderDetailId', ordersController.updateOrderDetailStatus);

export default router;