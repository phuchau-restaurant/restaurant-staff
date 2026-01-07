// Socket event emitters for users/staff management
import { emitToTenant, emitToAdmin } from "../configs/socket.js";

/**
 * Emit user created event
 */
export const emitUserCreated = (tenantId, userData) => {
  try {
    // Emit to all users in tenant
    emitToTenant(tenantId, "user:created", userData);

    // Emit to admins for notification
    emitToAdmin(tenantId, "admin:user_created", userData);

    console.log(`📡 Emitted user:created for user ${userData.userId}`);
  } catch (error) {
    console.error("Failed to emit user:created event:", error);
  }
};

/**
 * Emit user updated event
 */
export const emitUserUpdated = (tenantId, userData) => {
  try {
    // Emit to all users in tenant
    emitToTenant(tenantId, "user:updated", userData);

    // Emit to admins for notification
    emitToAdmin(tenantId, "admin:user_updated", userData);

    console.log(`📡 Emitted user:updated for user ${userData.userId}`);
  } catch (error) {
    console.error("Failed to emit user:updated event:", error);
  }
};

/**
 * Emit user deleted event
 */
export const emitUserDeleted = (tenantId, userId) => {
  try {
    // Emit to all users in tenant
    emitToTenant(tenantId, "user:deleted", { userId });

    // Emit to admins for notification
    emitToAdmin(tenantId, "admin:user_deleted", { userId });

    console.log(`📡 Emitted user:deleted for user ${userId}`);
  } catch (error) {
    console.error("Failed to emit user:deleted event:", error);
  }
};

/**
 * Emit user status changed event (active/inactive)
 */
export const emitUserStatusChanged = (tenantId, userData) => {
  try {
    // Emit to all users in tenant
    emitToTenant(tenantId, "user:status_changed", userData);

    // Emit to admins for notification
    emitToAdmin(tenantId, "admin:user_status_changed", userData);

    console.log(`📡 Emitted user:status_changed for user ${userData.userId}`);
  } catch (error) {
    console.error("Failed to emit user:status_changed event:", error);
  }
};
