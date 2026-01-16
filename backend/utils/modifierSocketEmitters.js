// Socket event emitters for modifier management
import { emitToTenant, emitToAdmin } from "../configs/socket.js";

/**
 * Emit modifier created event
 */
export const emitModifierCreated = (tenantId, modifierData) => {
  try {
    // Emit to all users in tenant
    emitToTenant(tenantId, "modifier:created", modifierData);

    // Emit to admins for notification
    emitToAdmin(tenantId, "admin:modifier_created", modifierData);

    console.log(`📡 Emitted modifier:created for modifier ${modifierData.id}`);
  } catch (error) {
    console.error("Failed to emit modifier:created event:", error);
  }
};

/**
 * Emit modifier updated event
 */
export const emitModifierUpdated = (tenantId, modifierData) => {
  try {
    // Emit to all users in tenant
    emitToTenant(tenantId, "modifier:updated", modifierData);

    console.log(`📡 Emitted modifier:updated for modifier ${modifierData.id}`);
  } catch (error) {
    console.error("Failed to emit modifier:updated event:", error);
  }
};

/**
 * Emit modifier deleted event
 */
export const emitModifierDeleted = (tenantId, modifierId) => {
  try {
    // Emit to all users in tenant
    emitToTenant(tenantId, "modifier:deleted", { modifierId });

    // Emit to admins for notification
    emitToAdmin(tenantId, "admin:modifier_deleted", { modifierId });

    console.log(`📡 Emitted modifier:deleted for modifier ${modifierId}`);
  } catch (error) {
    console.error("Failed to emit modifier:deleted event:", error);
  }
};
