// backend/routers/payment.routes.js
import express from "express";
import { paymentController } from "../containers/paymentContainer.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { tenantMiddleware } from "../middlewares/tenantMiddleware.js";

const router = express.Router();

// All routes require authentication and tenant
router.use(authMiddleware);
router.use(tenantMiddleware);

// POST /api/payments - Create invoice
router.post("/", paymentController.createInvoice);

// GET /api/payments/order/:orderId - Get invoice by order ID
router.get("/order/:orderId", paymentController.getInvoiceByOrderId);

// GET /api/payments/:id - Get invoice by payment ID
router.get("/:id", paymentController.getInvoice);

export default router;
