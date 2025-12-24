import express from 'express';
import { menuItemPhotoController } from '../containers/menuItemPhotoContainer.js';
import { tenantMiddleware } from '../middlewares/tenantMiddleware.js';
import { uploadArray } from '../middlewares/uploadMiddleware.js'; // Import middleware upload

const router = express.Router();

router.use(tenantMiddleware);

// 1. Upload one/multiple photos
// Endpoint: POST /api/admin/menu/items/photos
// Yêu cầu Body (Form-data): { images: [Files], dishId: "123" }
router.post('/photos', uploadArray, menuItemPhotoController.upload);

// 2. Remove photo
// Endpoint: DELETE /api/admin/menu/items/photos/:id
router.delete('/photos/:id', menuItemPhotoController.delete);

// 3. Set primary photo
// Endpoint: PATCH /api/admin/menu/items/photos/:id
router.patch('/photos/:id', menuItemPhotoController.setPrimary);

// 4. Get primary photo
// Endpoint: GET /api/admin/menu/items/photos/primary
// Yêu cầu Body (JSON/Form): { "dishId": 123 }
router.get('/photos/primary', menuItemPhotoController.getPrimary);

export default router;