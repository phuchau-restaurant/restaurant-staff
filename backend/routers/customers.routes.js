// backend/src/routers/categories.routes.js
import express from 'express';
// Import controller đã được lắp ráp sẵn (đã có service & repo bên trong) từ Container
import { customersController } from '../containers/customersContainer.js'; 
import { tenantMiddleware } from '../middlewares/tenantMiddleware.js';
const router = express.Router();


// Áp dụng middleware cho TOÀN BỘ các route bên dưới
router.use(tenantMiddleware);


router.get('/', customersController.getAll);
router.get('/:id', customersController.getById);
router.post('/login', customersController.findByPhoneNumberLogin);
router.post('/', customersController.create);
router.put('/:id', customersController.update);
router.delete('/:id', customersController.delete);

export default router;