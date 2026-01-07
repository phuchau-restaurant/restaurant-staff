// useCategorySocket.js - Custom hook for categories real-time updates
import { useEffect } from "react";
import { useSocket } from "../context/SocketContext";

/**
 * Custom hook to listen for category-related socket events
 * @param {Object} callbacks - Event callbacks
 * @param {Function} callbacks.onCategoryCreated - Called when new category is created
 * @param {Function} callbacks.onCategoryUpdated - Called when category is updated
 * @param {Function} callbacks.onCategoryDeleted - Called when category is deleted
 */
export const useCategorySocket = (callbacks = {}) => {
  const { socket, isConnected } = useSocket();

  const { onCategoryCreated, onCategoryUpdated, onCategoryDeleted } = callbacks;

  useEffect(() => {
    if (!socket || !isConnected) {
      console.log("⏸️ Socket not connected, skipping category event listeners");
      return;
    }

    console.log("👂 Setting up category socket listeners");

    // Category created event
    if (onCategoryCreated) {
      socket.on("category:created", (data) => {
        console.log("📨 Received category:created event:", data);
        onCategoryCreated(data);
      });
    }

    // Category updated event
    if (onCategoryUpdated) {
      socket.on("category:updated", (data) => {
        console.log("📨 Received category:updated event:", data);
        onCategoryUpdated(data);
      });
    }

    // Category deleted event
    if (onCategoryDeleted) {
      socket.on("category:deleted", (data) => {
        console.log("📨 Received category:deleted event:", data);
        onCategoryDeleted(data);
      });
    }

    // Cleanup listeners on unmount
    return () => {
      console.log("🧹 Cleaning up category socket listeners");
      socket.off("category:created");
      socket.off("category:updated");
      socket.off("category:deleted");
    };
  }, [
    socket,
    isConnected,
    onCategoryCreated,
    onCategoryUpdated,
    onCategoryDeleted,
  ]);

  return { isConnected };
};

/**
 * Custom hook to listen for admin category events
 */
export const useAdminCategorySocket = (callbacks = {}) => {
  const { socket, isConnected } = useSocket();

  const { onCategoryCreated, onCategoryUpdated, onCategoryDeleted } = callbacks;

  useEffect(() => {
    if (!socket || !isConnected) return;

    console.log("👂 Setting up admin category socket listeners");

    if (onCategoryCreated) {
      socket.on("admin:category_created", (data) => {
        console.log("📨 Received admin:category_created event:", data);
        onCategoryCreated(data);
      });
    }

    if (onCategoryUpdated) {
      socket.on("admin:category_updated", (data) => {
        console.log("📨 Received admin:category_updated event:", data);
        onCategoryUpdated(data);
      });
    }

    if (onCategoryDeleted) {
      socket.on("admin:category_deleted", (data) => {
        console.log("📨 Received admin:category_deleted event:", data);
        onCategoryDeleted(data);
      });
    }

    return () => {
      console.log("🧹 Cleaning up admin category socket listeners");
      socket.off("admin:category_created");
      socket.off("admin:category_updated");
      socket.off("admin:category_deleted");
    };
  }, [
    socket,
    isConnected,
    onCategoryCreated,
    onCategoryUpdated,
    onCategoryDeleted,
  ]);

  return { isConnected };
};
