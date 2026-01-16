// Socket event emitters for tables management
import { emitToTenant, emitToAdmin } from "../configs/socket.js";

/**
 * Emit table created event
 */
export const emitTableCreated = (tenantId, tableData) => {
  try {
    // Emit to all users in tenant
    emitToTenant(tenantId, "table:created", tableData);

    // Emit to admins for notification
    emitToAdmin(tenantId, "admin:table_created", tableData);

    console.log(`📡 Emitted table:created for table ${tableData.tableId}`);
  } catch (error) {
    console.error("Failed to emit table:created event:", error);
  }
};

/**
 * Emit table updated event
 */
export const emitTableUpdated = (tenantId, tableData) => {
  try {
    // Emit to all users in tenant
    emitToTenant(tenantId, "table:updated", tableData);

    console.log(`📡 Emitted table:updated for table ${tableData.tableId}`);
  } catch (error) {
    console.error("Failed to emit table:updated event:", error);
  }
};

/**
 * Emit table deleted event
 */
export const emitTableDeleted = (tenantId, tableId) => {
  try {
    // Emit to all users in tenant
    emitToTenant(tenantId, "table:deleted", { tableId });

    // Emit to admins for notification
    emitToAdmin(tenantId, "admin:table_deleted", { tableId });

    console.log(`📡 Emitted table:deleted for table ${tableId}`);
  } catch (error) {
    console.error("Failed to emit table:deleted event:", error);
  }
};

/**
 * Emit table status changed event
 */
export const emitTableStatusChanged = (tenantId, tableData) => {
  try {
    // Emit to all users in tenant
    emitToTenant(tenantId, "table:updated", tableData);

    console.log(
      `📡 Emitted table:updated (status changed) for table ${tableData.tableId}`
    );
  } catch (error) {
    console.error("Failed to emit table status changed event:", error);
  }
};

/**
 * Emit QR code regenerated event
 */
export const emitQRRegenerated = (tenantId, tableData) => {
  try {
    // Emit to all users in tenant
    emitToTenant(tenantId, "table:qr_regenerated", tableData);

    // Emit to admins for notification
    emitToAdmin(tenantId, "admin:qr_regenerated", tableData);

    console.log(
      `📡 Emitted table:qr_regenerated for table ${tableData.tableId}`
    );
  } catch (error) {
    console.error("Failed to emit table:qr_regenerated event:", error);
  }
};
