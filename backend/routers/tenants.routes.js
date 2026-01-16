// backend/routers/tenants.routes.js
import express from "express";
import { tenantsController } from "../containers/tenantsContainer.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { tenantMiddleware } from "../middlewares/tenantMiddleware.js";

const router = express.Router();

// All routes require authentication and tenant context
router.use(authMiddleware);
router.use(tenantMiddleware);

// [GET] /api/tenants - Get tenant info
router.get("/", tenantsController.get);

// [PUT] /api/tenants - Update tenant info
router.put("/", tenantsController.update);

// [PATCH] /api/tenants/logo - Update logo only
router.patch("/logo", tenantsController.updateLogo);

export default router;
