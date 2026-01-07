// useStaffSocket.js - Custom hook for staff/users real-time updates
import { useEffect } from "react";
import { useSocket } from "../context/SocketContext";

/**
 * Custom hook to listen for staff-related socket events
 * @param {Object} callbacks - Event callbacks
 * @param {Function} callbacks.onStaffCreated - Called when new staff is created
 * @param {Function} callbacks.onStaffUpdated - Called when staff is updated
 * @param {Function} callbacks.onStaffDeleted - Called when staff is deleted
 */
export const useStaffSocket = (callbacks = {}) => {
  const { socket, isConnected } = useSocket();

  const { onStaffCreated, onStaffUpdated, onStaffDeleted } = callbacks;

  useEffect(() => {
    if (!socket || !isConnected) {
      console.log("⏸️ Socket not connected, skipping staff event listeners");
      return;
    }

    console.log("👂 Setting up staff socket listeners");

    // Staff created event
    if (onStaffCreated) {
      socket.on("staff:created", (data) => {
        console.log("📨 Received staff:created event:", data);
        onStaffCreated(data);
      });
    }

    // Staff updated event
    if (onStaffUpdated) {
      socket.on("staff:updated", (data) => {
        console.log("📨 Received staff:updated event:", data);
        onStaffUpdated(data);
      });
    }

    // Staff deleted event
    if (onStaffDeleted) {
      socket.on("staff:deleted", (data) => {
        console.log("📨 Received staff:deleted event:", data);
        onStaffDeleted(data);
      });
    }

    // Cleanup listeners on unmount
    return () => {
      console.log("🧹 Cleaning up staff socket listeners");
      socket.off("staff:created");
      socket.off("staff:updated");
      socket.off("staff:deleted");
    };
  }, [socket, isConnected, onStaffCreated, onStaffUpdated, onStaffDeleted]);

  return { isConnected };
};

/**
 * Custom hook to listen for admin staff events
 */
export const useAdminStaffSocket = (callbacks = {}) => {
  const { socket, isConnected } = useSocket();

  const { onStaffCreated, onStaffUpdated, onStaffDeleted } = callbacks;

  useEffect(() => {
    if (!socket || !isConnected) return;

    console.log("👂 Setting up admin staff socket listeners");

    if (onStaffCreated) {
      socket.on("admin:staff_created", (data) => {
        console.log("📨 Received admin:staff_created event:", data);
        onStaffCreated(data);
      });
    }

    if (onStaffUpdated) {
      socket.on("admin:staff_updated", (data) => {
        console.log("📨 Received admin:staff_updated event:", data);
        onStaffUpdated(data);
      });
    }

    if (onStaffDeleted) {
      socket.on("admin:staff_deleted", (data) => {
        console.log("📨 Received admin:staff_deleted event:", data);
        onStaffDeleted(data);
      });
    }

    return () => {
      console.log("🧹 Cleaning up admin staff socket listeners");
      socket.off("admin:staff_created");
      socket.off("admin:staff_updated");
      socket.off("admin:staff_deleted");
    };
  }, [socket, isConnected, onStaffCreated, onStaffUpdated, onStaffDeleted]);

  return { isConnected };
};
