// Webhook Controller for receiving notifications from Customer Backend
class WebhookController {
  /**
   * Receive order created notification from Customer Backend
   * POST /api/webhooks/order-created
   */
  orderCreated = async (req, res, next) => {
    try {
      const { orderId, tableId, tableNumber, displayOrder, totalAmount, itemCount, tenantId } = req.body;

      // Validate required fields
      if (!orderId || !tenantId) {
        return res.status(400).json({
          success: false,
          message: "orderId and tenantId are required"
        });
      }

      // Import socket emitter
      const { emitToTenant } = await import("../configs/socket.js");

      // Emit socket event to waiters in this tenant
      emitToTenant(tenantId, "order:created", {
        orderId,
        tableId,
        tableNumber,
        displayOrder,
        totalAmount,
        itemCount,
        status: "Unsubmit", // Customer orders start as Unsubmit
        timestamp: new Date().toISOString(),
      });

      console.log(`📡 [Webhook] Emitted order:created for order ${orderId} via webhook`);

      return res.status(200).json({
        success: true,
        message: "Order notification sent to waiters"
      });
    } catch (error) {
      console.error("Webhook error:", error);
      next(error);
    }
  };

  /**
   * Receive order updated notification from Customer Backend
   * POST /api/webhooks/order-updated
   */
  orderUpdated = async (req, res, next) => {
    try {
      const { orderId, tableId, tableNumber, displayOrder, newItemCount, newTotalAmount, tenantId } = req.body;

      if (!orderId || !tenantId) {
        return res.status(400).json({
          success: false,
          message: "orderId and tenantId are required"
        });
      }

      const { emitToTenant } = await import("../configs/socket.js");

      emitToTenant(tenantId, "order:updated", {
        orderId,
        tableId,
        tableNumber,
        displayOrder,
        newItemCount,
        totalAmount: newTotalAmount,
        timestamp: new Date().toISOString(),
      });

      console.log(`📡 [Webhook] Emitted order:updated for order ${orderId} via webhook`);

      return res.status(200).json({
        success: true,
        message: "Order update notification sent to waiters"
      });
    } catch (error) {
      console.error("Webhook error:", error);
      next(error);
    }
  };
}

export default WebhookController;
