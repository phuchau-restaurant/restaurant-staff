// Socket event emitters for category management
import { emitToTenant, emitToAdmin } from "../configs/socket.js";

/**
 * Emit category created event
 */
export const emitCategoryCreated = (tenantId, categoryData) => {
  try {
    // Emit to all users in tenant
    emitToTenant(tenantId, "category:created", categoryData);

    // Emit to admins for notification
    emitToAdmin(tenantId, "admin:category_created", categoryData);

    console.log(`📡 Emitted category:created for category ${categoryData.id}`);
  } catch (error) {
    console.error("Failed to emit category:created event:", error);
  }
};

/**
 * Emit category updated event
 */
export const emitCategoryUpdated = (tenantId, categoryData) => {
  try {
    // Emit to all users in tenant
    emitToTenant(tenantId, "category:updated", categoryData);

    console.log(`📡 Emitted category:updated for category ${categoryData.id}`);
  } catch (error) {
    console.error("Failed to emit category:updated event:", error);
  }
};

/**
 * Emit category deleted event
 */
export const emitCategoryDeleted = (tenantId, categoryId) => {
  try {
    // Emit to all users in tenant
    emitToTenant(tenantId, "category:deleted", { categoryId });

    // Emit to admins for notification
    emitToAdmin(tenantId, "admin:category_deleted", { categoryId });

    console.log(`📡 Emitted category:deleted for category ${categoryId}`);
  } catch (error) {
    console.error("Failed to emit category:deleted event:", error);
  }
};
