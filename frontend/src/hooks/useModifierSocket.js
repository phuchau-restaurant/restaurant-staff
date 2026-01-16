// useModifierSocket.js - Custom hook for modifiers real-time updates
import { useEffect } from "react";
import { useSocket } from "../context/SocketContext";

/**
 * Custom hook to listen for modifier-related socket events
 * @param {Object} callbacks - Event callbacks
 * @param {Function} callbacks.onModifierCreated - Called when new modifier group is created
 * @param {Function} callbacks.onModifierUpdated - Called when modifier group is updated
 * @param {Function} callbacks.onModifierDeleted - Called when modifier group is deleted
 */
export const useModifierSocket = (callbacks = {}) => {
  const { socket, isConnected } = useSocket();

  const { onModifierCreated, onModifierUpdated, onModifierDeleted } = callbacks;

  useEffect(() => {
    if (!socket || !isConnected) {
      console.log("⏸️ Socket not connected, skipping modifier event listeners");
      return;
    }

    console.log("👂 Setting up modifier socket listeners");

    // Modifier created event
    if (onModifierCreated) {
      socket.on("modifier:created", (data) => {
        console.log("📨 Received modifier:created event:", data);
        onModifierCreated(data);
      });
    }

    // Modifier updated event
    if (onModifierUpdated) {
      socket.on("modifier:updated", (data) => {
        console.log("📨 Received modifier:updated event:", data);
        onModifierUpdated(data);
      });
    }

    // Modifier deleted event
    if (onModifierDeleted) {
      socket.on("modifier:deleted", (data) => {
        console.log("📨 Received modifier:deleted event:", data);
        onModifierDeleted(data);
      });
    }

    // Cleanup listeners on unmount
    return () => {
      console.log("🧹 Cleaning up modifier socket listeners");
      socket.off("modifier:created");
      socket.off("modifier:updated");
      socket.off("modifier:deleted");
    };
  }, [
    socket,
    isConnected,
    onModifierCreated,
    onModifierUpdated,
    onModifierDeleted,
  ]);

  return { isConnected };
};

/**
 * Custom hook to listen for admin modifier events
 */
export const useAdminModifierSocket = (callbacks = {}) => {
  const { socket, isConnected } = useSocket();

  const { onModifierCreated, onModifierUpdated, onModifierDeleted } = callbacks;

  useEffect(() => {
    if (!socket || !isConnected) return;

    console.log("👂 Setting up admin modifier socket listeners");

    if (onModifierCreated) {
      socket.on("admin:modifier_created", (data) => {
        console.log("📨 Received admin:modifier_created event:", data);
        onModifierCreated(data);
      });
    }

    if (onModifierUpdated) {
      socket.on("admin:modifier_updated", (data) => {
        console.log("📨 Received admin:modifier_updated event:", data);
        onModifierUpdated(data);
      });
    }

    if (onModifierDeleted) {
      socket.on("admin:modifier_deleted", (data) => {
        console.log("📨 Received admin:modifier_deleted event:", data);
        onModifierDeleted(data);
      });
    }

    return () => {
      console.log("🧹 Cleaning up admin modifier socket listeners");
      socket.off("admin:modifier_created");
      socket.off("admin:modifier_updated");
      socket.off("admin:modifier_deleted");
    };
  }, [
    socket,
    isConnected,
    onModifierCreated,
    onModifierUpdated,
    onModifierDeleted,
  ]);

  return { isConnected };
};
