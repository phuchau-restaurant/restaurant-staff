// useMenuSocket.js - Custom hook for menus real-time updates
import { useEffect } from "react";
import { useSocket } from "../context/SocketContext";

/**
 * Custom hook to listen for menu-related socket events
 * @param {Object} callbacks - Event callbacks
 * @param {Function} callbacks.onMenuCreated - Called when new menu item is created
 * @param {Function} callbacks.onMenuUpdated - Called when menu item is updated
 * @param {Function} callbacks.onMenuDeleted - Called when menu item is deleted
 */
export const useMenuSocket = (callbacks = {}) => {
  const { socket, isConnected } = useSocket();

  const { onMenuCreated, onMenuUpdated, onMenuDeleted } = callbacks;

  useEffect(() => {
    if (!socket || !isConnected) {
      console.log("⏸️ Socket not connected, skipping menu event listeners");
      return;
    }

    console.log("👂 Setting up menu socket listeners");

    // Menu created event
    if (onMenuCreated) {
      socket.on("menu:created", (data) => {
        console.log("📨 Received menu:created event:", data);
        onMenuCreated(data);
      });
    }

    // Menu updated event
    if (onMenuUpdated) {
      socket.on("menu:updated", (data) => {
        console.log("📨 Received menu:updated event:", data);
        onMenuUpdated(data);
      });
    }

    // Menu deleted event
    if (onMenuDeleted) {
      socket.on("menu:deleted", (data) => {
        console.log("📨 Received menu:deleted event:", data);
        onMenuDeleted(data);
      });
    }

    // Cleanup listeners on unmount
    return () => {
      console.log("🧹 Cleaning up menu socket listeners");
      socket.off("menu:created");
      socket.off("menu:updated");
      socket.off("menu:deleted");
    };
  }, [socket, isConnected, onMenuCreated, onMenuUpdated, onMenuDeleted]);

  return { isConnected };
};

/**
 * Custom hook to listen for admin menu events
 */
export const useAdminMenuSocket = (callbacks = {}) => {
  const { socket, isConnected } = useSocket();

  const { onMenuCreated, onMenuUpdated, onMenuDeleted } = callbacks;

  useEffect(() => {
    if (!socket || !isConnected) return;

    console.log("👂 Setting up admin menu socket listeners");

    if (onMenuCreated) {
      socket.on("admin:menu_created", (data) => {
        console.log("📨 Received admin:menu_created event:", data);
        onMenuCreated(data);
      });
    }

    if (onMenuUpdated) {
      socket.on("admin:menu_updated", (data) => {
        console.log("📨 Received admin:menu_updated event:", data);
        onMenuUpdated(data);
      });
    }

    if (onMenuDeleted) {
      socket.on("admin:menu_deleted", (data) => {
        console.log("📨 Received admin:menu_deleted event:", data);
        onMenuDeleted(data);
      });
    }

    return () => {
      console.log("🧹 Cleaning up admin menu socket listeners");
      socket.off("admin:menu_created");
      socket.off("admin:menu_updated");
      socket.off("admin:menu_deleted");
    };
  }, [socket, isConnected, onMenuCreated, onMenuUpdated, onMenuDeleted]);

  return { isConnected };
};
