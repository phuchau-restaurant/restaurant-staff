// backend/routers/report.routes.js
import express from "express";
import { reportController } from "../containers/reportContainer.js";
import { tenantMiddleware } from "../middlewares/tenantMiddleware.js";

const router = express.Router();

// Bắt buộc có TenantID
router.use(tenantMiddleware);

// Revenue reports
router.get("/revenue", reportController.getRevenue);
router.get("/revenue/range", reportController.getRevenueRange);
router.get("/peak-hours", reportController.getPeakHours);

// Best sellers
router.get("/best-sellers", reportController.getBestSellers);

// Dashboard summary
router.get("/summary", reportController.getSummary);

export default router;
