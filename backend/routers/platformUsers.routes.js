// backend/routers/platformUsers.routes.js
import { Router } from "express";
import { platformUsersController } from "../containers/platformUsersContainer.js";
import { superAdminMiddleware } from "../middlewares/superAdminMiddleware.js";

const router = Router();

// Public routes (không cần auth)
router.post("/auth/login", platformUsersController.login);

// Protected routes (cần super admin auth)
router.get("/admins", superAdminMiddleware, platformUsersController.getAllSuperAdmins);
router.post("/admins", superAdminMiddleware, platformUsersController.createSuperAdmin);
router.put("/admins/password", superAdminMiddleware, platformUsersController.changePassword);
router.delete("/admins/:id", superAdminMiddleware, platformUsersController.deleteSuperAdmin);

// Tenant management
router.get("/tenants", superAdminMiddleware, platformUsersController.getAllTenants);
router.post("/tenants", superAdminMiddleware, platformUsersController.createTenant);
router.post("/tenants/:tenantId/admin", superAdminMiddleware, platformUsersController.createFirstAdmin);

export default router;
