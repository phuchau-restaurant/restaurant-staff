// backend/routers/appSettings.routes.js
import express from 'express';
import { appSettingsController } from '../containers/appSettingsContainer.js';
import { tenantMiddleware } from '../middlewares/tenantMiddleware.js';

const router = express.Router();

router.use(tenantMiddleware);

// Routes
router.get('/', appSettingsController.getAll); //Get/api/settings?category='Main course'
router.get('/:id', appSettingsController.getById);
router.post('/', appSettingsController.create);
router.put('/:id', appSettingsController.update);
//router.delete('/:id', appSettingsController.delete);

export default router;