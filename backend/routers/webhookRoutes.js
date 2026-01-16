// Webhook routes for receiving notifications from external systems (Customer Backend)
import express from "express";
import WebhookController from "../controllers/webhookController.js";

const router = express.Router();
const webhookController = new WebhookController();

/**
 * POST /api/webhooks/order-created
 * Receive order created notification from Customer Backend
 */
router.post("/order-created", webhookController.orderCreated);

/**
 * POST /api/webhooks/order-updated  
 * Receive order updated notification from Customer Backend
 */
router.post("/order-updated", webhookController.orderUpdated);

export default router;
