// backend/routers/restaurantInfo.routes.js
import express from "express";
import { restaurantInfoController } from "../containers/restaurantInfoContainer.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { tenantMiddleware } from "../middlewares/tenantMiddleware.js";

const router = express.Router();

// All routes require authentication and tenant context
router.use(authMiddleware);
router.use(tenantMiddleware);

// [GET] /api/restaurant - Get restaurant info (all authenticated users can view)
router.get("/", restaurantInfoController.get);

// [PUT] /api/restaurant - Update restaurant info
// TODO: Add authorizeRoles middleware properly if needed
router.put("/", restaurantInfoController.update);

// [PATCH] /api/restaurant/logo - Update logo only
router.patch("/logo", restaurantInfoController.updateLogo);

export default router;
