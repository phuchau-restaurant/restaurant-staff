// Socket event emitters for QR management
import { emitToTenant, emitToAdmin } from "../configs/socket.js";

/**
 * Emit QR code generated/regenerated event
 */
export const emitQRGenerated = (tenantId, qrData) => {
  try {
    // Emit to all users in tenant
    emitToTenant(tenantId, "qr:generated", qrData);

    // Emit to admins for notification
    emitToAdmin(tenantId, "admin:qr_generated", qrData);

    console.log(`📡 Emitted qr:generated for table ${qrData.tableId}`);
  } catch (error) {
    console.error("Failed to emit qr:generated event:", error);
  }
};

/**
 * Emit QR code deleted event (if applicable)
 */
export const emitQRDeleted = (tenantId, tableId) => {
  try {
    // Emit to all users in tenant
    emitToTenant(tenantId, "qr:deleted", { tableId });

    // Emit to admins for notification
    emitToAdmin(tenantId, "admin:qr_deleted", { tableId });

    console.log(`📡 Emitted qr:deleted for table ${tableId}`);
  } catch (error) {
    console.error("Failed to emit qr:deleted event:", error);
  }
};
