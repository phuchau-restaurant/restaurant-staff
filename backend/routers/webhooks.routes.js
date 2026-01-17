import express from "express";
import { getIO } from "../configs/socket.js";

const router = express.Router();

/**
 * POST /api/webhooks/new-order
 * Nhận thông báo từ Customer Backend khi có đơn hàng mới
 */
router.post("/new-order", (req, res) => {
  try {
    const { event, data, timestamp } = req.body;

    // Validate webhook source để tránh spam
    const source = req.headers["x-webhook-source"];
    if (source !== "customer-backend") {
      console.warn("⚠️  Invalid webhook source:", source);
      return res.status(403).json({
        success: false,
        error: "Invalid webhook source",
      });
    }

    // Validate tenant ID (security)
    const tenantId = req.headers["x-tenant-id"];
    if (!tenantId) {
      console.warn("⚠️  Missing tenant ID in webhook");
      return res.status(400).json({
        success: false,
        error: "Missing tenant ID",
      });
    }

    console.log("📨 Webhook received: NEW ORDER", {
      orderId: data.orderId,
      tableNumber: data.tableNumber,
      totalAmount: data.totalAmount,
      tenantId: tenantId,
    });

    // Emit socket event to all waiters
    const io = getIO();
    io.to("waiters").emit("order:created", data);

    console.log("✅ Socket emitted to waiters:", data.orderId);

    res.status(200).json({
      success: true,
      message: "Webhook processed successfully",
      orderId: data.orderId,
    });
  } catch (error) {
    console.error("❌ Webhook processing error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/webhooks/order-submitted
 * Nhận thông báo khi customer submit đơn
 */
router.post("/order-submitted", (req, res) => {
  try {
    const { event, data, timestamp } = req.body;

    const source = req.headers["x-webhook-source"];
    if (source !== "customer-backend") {
      return res.status(403).json({
        success: false,
        error: "Invalid webhook source",
      });
    }

    const tenantId = req.headers["x-tenant-id"];
    if (!tenantId) {
      return res.status(400).json({
        success: false,
        error: "Missing tenant ID",
      });
    }

    console.log("📨 Webhook received: ORDER SUBMITTED", {
      orderId: data.orderId,
      tableNumber: data.tableNumber,
      status: data.status,
    });

    const io = getIO();
    io.to("waiters").emit("order:submitted", data);

    console.log("✅ Socket emitted to waiters: order submitted", data.orderId);

    res.status(200).json({
      success: true,
      message: "Webhook processed successfully",
      orderId: data.orderId,
    });
  } catch (error) {
    console.error("❌ Webhook processing error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/webhooks/payment-request
 * Nhận thông báo khi customer yêu cầu thanh toán
 */
router.post("/payment-request", (req, res) => {
  try {
    const { event, data, timestamp } = req.body;

    // Validate webhook source
    const source = req.headers["x-webhook-source"];
    if (source !== "customer-backend") {
      console.warn("⚠️  Invalid webhook source:", source);
      return res.status(403).json({
        success: false,
        error: "Invalid webhook source",
      });
    }

    // Validate tenant ID
    const tenantId = req.headers["x-tenant-id"];
    if (!tenantId) {
      console.warn("⚠️  Missing tenant ID in webhook");
      return res.status(400).json({
        success: false,
        error: "Missing tenant ID",
      });
    }

    console.log("💰 Webhook received: PAYMENT REQUEST", {
      requestId: data.requestId,
      tableNumber: data.tableNumber,
      orderId: data.orderId,
      tenantId: tenantId,
    });

    // Emit socket event to all waiters
    const io = getIO();
    io.to("waiters").emit("payment_request", data);

    console.log(
      "✅ Socket emitted to waiters: payment request",
      data.requestId
    );

    res.status(200).json({
      success: true,
      message: "Payment request webhook processed successfully",
      requestId: data.requestId,
    });
  } catch (error) {
    console.error("❌ Webhook processing error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
