import express from 'express';
import { ordersController } from '../containers/ordersContainer.js';
import { tenantMiddleware } from '../middlewares/tenantMiddleware.js';

const router = express.Router();

// Bắt buộc có TenantID
router.use(tenantMiddleware);

// === WAITER ORDER ROUTES (đặt trước routes có :id để tránh conflict) ===
router.get('/my-orders', ordersController.getMyOrders);        // GET /api/orders/my-orders?waiterId=xxx
router.get('/unassigned', ordersController.getUnassignedOrders); // GET /api/orders/unassigned
router.put('/:id/claim', ordersController.claimOrder);         // PUT /api/orders/:id/claim

// === STANDARD ORDER ROUTES ===
router.get('/', ordersController.getAll);
router.post('/', ordersController.create);
router.get('/:id', ordersController.getById);
router.put('/:id', ordersController.update);
router.delete('/:id', ordersController.delete);

export default router;