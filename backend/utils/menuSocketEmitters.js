// Socket event emitters for menu management
import { emitToTenant, emitToAdmin } from "../configs/socket.js";

/**
 * Emit menu created event
 */
export const emitMenuCreated = (tenantId, menuData) => {
  try {
    // Emit to all users in tenant
    emitToTenant(tenantId, "menu:created", menuData);

    // Emit to admins for notification
    emitToAdmin(tenantId, "admin:menu_created", menuData);

    console.log(`📡 Emitted menu:created for menu ${menuData.id}`);
  } catch (error) {
    console.error("Failed to emit menu:created event:", error);
  }
};

/**
 * Emit menu updated event
 */
export const emitMenuUpdated = (tenantId, menuData) => {
  try {
    // Emit to all users in tenant
    emitToTenant(tenantId, "menu:updated", menuData);

    console.log(`📡 Emitted menu:updated for menu ${menuData.id}`);
  } catch (error) {
    console.error("Failed to emit menu:updated event:", error);
  }
};

/**
 * Emit menu deleted event
 */
export const emitMenuDeleted = (tenantId, menuId) => {
  try {
    // Emit to all users in tenant
    emitToTenant(tenantId, "menu:deleted", { menuId });

    // Emit to admins for notification
    emitToAdmin(tenantId, "admin:menu_deleted", { menuId });

    console.log(`📡 Emitted menu:deleted for menu ${menuId}`);
  } catch (error) {
    console.error("Failed to emit menu:deleted event:", error);
  }
};
