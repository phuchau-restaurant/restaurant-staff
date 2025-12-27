//restaurant-staff/backend/routers/upload.routes.js
import express from 'express';
import uploadController from '../controllers/Supabase/uploadController.js';
//import uploadMiddleware from '../middlewares/uploadMiddleware.js';
import { uploadArray } from '../middlewares/uploadMiddleware.js'; // là uploadMiddleware
import { uploadSingle } from '../middlewares/uploadMiddleware.js'; // là uploadMiddleware
import { tenantMiddleware } from '../middlewares/tenantMiddleware.js'; 

const router = express.Router();
//POST/api/upload
router.post('/', tenantMiddleware, uploadSingle, uploadController.upload);

// 1. POST /api/upload/batch (Upload nhiều ảnh)
// Chấp nhận multipart/form-data:
// - images: [file1, file2...]
// - imageUrls: ["http...", "http..."] (hoặc gửi 1 string)
// - folder: "dishes"
router.post('/batch', tenantMiddleware, uploadArray, uploadController.uploadBatch);

// 2. DELETE /api/upload
// Body: { "url": "https://..." }
router.delete('/', tenantMiddleware, uploadController.delete);

// 3. GET /api/upload?folder=dishes
router.get('/', tenantMiddleware, uploadController.list);


export default router;