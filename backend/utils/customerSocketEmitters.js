// Socket event emitters for customer service calls
import { emitToTenant } from "../configs/socket.js";

/**
 * Emit customer call staff event
 * This is triggered when a customer requests service (payment, help, etc.)
 */
export const emitCustomerCallStaff = (tenantId, callData) => {
  try {
    // Broadcast to all staff members in the tenant
    emitToTenant(tenantId, "staff:customer_call", {
      tableNumber: callData.tableNumber,
      tableId: callData.tableId,
      orderId: callData.orderId,
      requestType: callData.requestType || "payment", // "payment", "service", "help"
      message: callData.message || `Bàn ${callData.tableNumber} cần hỗ trợ thanh toán!`,
      timestamp: new Date().toISOString(),
    });
    
    console.log(`📡 Emitted staff:customer_call for table ${callData.tableNumber} (type: ${callData.requestType || "payment"})`);
  } catch (error) {
    console.error("Failed to emit staff:customer_call event:", error);
  }
};
