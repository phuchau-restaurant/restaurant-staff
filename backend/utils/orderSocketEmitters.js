// Socket event emitters for orders
import { emitToTenant, emitToKitchen, emitToAdmin } from "../configs/socket.js";

/**
 * Emit order created event
 */
export const emitOrderCreated = (tenantId, orderData) => {
  try {
    // Emit to all users in tenant
    emitToTenant(tenantId, "order:created", orderData);

    // CHỈ emit to kitchen nếu đơn đã ở trạng thái Approved (waiter đã claim)
    // Không thông báo bếp khi đơn mới tạo (Unsubmit)
    if (orderData.status === "Approved") {
      emitToKitchen(tenantId, "kitchen:new_order", orderData);
    }

    console.log(`📡 Emitted order:created for order ${orderData.orderId} (status: ${orderData.status})`);
  } catch (error) {
    console.error("Failed to emit order:created event:", error);
  }
};

/**
 * Emit order status updated event
 */
export const emitOrderUpdated = (tenantId, orderData) => {
  try {
    // Emit to all users in tenant
    emitToTenant(tenantId, "order:updated", orderData);

    // Emit to kitchen khi đơn chuyển sang Approved (Waiter claim đơn)
    if (orderData.status === "Approved") {
      emitToKitchen(tenantId, "kitchen:new_order", orderData);
    }

    // Gọi nhân viên phục vụ khi đơn chuyển sang Served
    if (orderData.status === "Served") {
      emitWaiterCall(tenantId, {
        orderId: orderData.orderId,
        tableNumber: orderData.tableNumber,
        waiterId: orderData.waiterId, // Include waiterId for targeted notification
        message: `Bàn ${orderData.tableNumber} - Đơn #${orderData.orderId} đã sẵn sàng!`,
      });
    }

    // If order is completed or cancelled, notify admins
    if (orderData.status === "Completed" || orderData.status === "Cancelled") {
      emitToAdmin(tenantId, "admin:order_status_changed", orderData);
    }

    console.log(`📡 Emitted order:updated for order ${orderData.orderId} (status: ${orderData.status})`);
  } catch (error) {
    console.error("Failed to emit order:updated event:", error);
  }
};

/**
 * Emit waiter call event (when kitchen calls waiter for pickup)
 * Only the waiter assigned to this order should receive the notification
 */
export const emitWaiterCall = (tenantId, callData) => {
  try {
    // Include waiterId so frontend can filter to only notify the assigned waiter
    emitToTenant(tenantId, "waiter:call", {
      ...callData,
      waiterId: callData.waiterId, // Ensure waiterId is included
    });
    console.log(`📡 Emitted waiter:call for order ${callData.orderId} (waiter: ${callData.waiterId})`);
  } catch (error) {
    console.error("Failed to emit waiter:call event:", error);
  }
};

/**
 * Emit order detail (dish) status updated event
 */
export const emitOrderDetailUpdated = (tenantId, detailData) => {
  try {
    // Emit to all users in tenant
    emitToTenant(tenantId, "order_detail:updated", detailData);

    // Emit to kitchen if status is cooking/ready
    if (detailData.status === "Ready" || detailData.status === "Cooking") {
      emitToKitchen(tenantId, "kitchen:dish_status_changed", detailData);
    }

    console.log(
      `📡 Emitted order_detail:updated for detail ${detailData.orderDetailId}`
    );
  } catch (error) {
    console.error("Failed to emit order_detail:updated event:", error);
  }
};

/**
 * Emit order deleted event
 */
export const emitOrderDeleted = (tenantId, orderId) => {
  try {
    emitToTenant(tenantId, "order:deleted", { orderId });

    console.log(`📡 Emitted order:deleted for order ${orderId}`);
  } catch (error) {
    console.error("Failed to emit order:deleted event:", error);
  }
};
