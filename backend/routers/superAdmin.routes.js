// Routes for Super Admin
import express from "express";
import { superAdminController } from "../containers/superAdminContainer.js";
import { superAdminMiddleware } from "../middlewares/superAdminMiddleware.js";

const router = express.Router();

// All routes require super admin authentication
router.use(superAdminMiddleware);

// Admin management routes
router.get("/admins", superAdminController.getAllAdmins);
router.get("/admins/:id", superAdminController.getAdminById);
router.post("/admins", superAdminController.createAdmin);
router.put("/admins/:id", superAdminController.updateAdmin);
router.delete("/admins/:id", superAdminController.deleteAdmin);

export default router;
