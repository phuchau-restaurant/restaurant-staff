import express from 'express';
import { ordersController } from '../containers/ordersContainer.js';
import { tenantMiddleware } from '../middlewares/tenantMiddleware.js';

const router = express.Router();

// Bắt buộc có TenantID
router.use(tenantMiddleware);

// === KITCHEN (đặt trước /:id để tránh conflict) ===
router.get('/kitchen', ordersController.getForKitchen);  // GET /api/orders/kitchen?status=...

// === ORDER CRUD ===
router.get('/', ordersController.getAll);            // GET /api/orders?status=...&waiterId=...
router.post('/', ordersController.create);           // POST /api/orders
router.get('/:id', ordersController.getById);        // GET /api/orders/:id
router.put('/:id', ordersController.update);         // PUT /api/orders/:id (full update + claim via waiterId)
router.delete('/:id', ordersController.delete);      // DELETE /api/orders/:id

// === ITEM STATUS UPDATE ===
// PATCH /api/orders/:orderId/items/:orderDetailId - Cập nhật status món ăn
router.patch('/:orderId/items/:orderDetailId', ordersController.updateOrderDetailStatus);

export default router;

