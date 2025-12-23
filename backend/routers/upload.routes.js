import express from 'express';
import uploadController from '../controllers/Supabase/uploadController.js';
import uploadMiddleware from '../middlewares/uploadMiddleware.js';
import { tenantMiddleware } from '../middlewares/tenantMiddleware.js'; 

const router = express.Router();
//POST/api/upload
router.post('/', tenantMiddleware, uploadMiddleware.single('image'), uploadController.upload);
//post multiple files


//update file 

//delete file 
export default router;