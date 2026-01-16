// useTableSocket.js - Custom hook for tables real-time updates
import { useEffect } from "react";
import { useSocket } from "../context/SocketContext";

/**
 * Custom hook to listen for table-related socket events
 * @param {Object} callbacks - Event callbacks
 * @param {Function} callbacks.onTableCreated - Called when new table is created
 * @param {Function} callbacks.onTableUpdated - Called when table is updated
 * @param {Function} callbacks.onTableDeleted - Called when table is deleted
 * @param {Function} callbacks.onQRRegenerated - Called when QR code is regenerated
 */
export const useTableSocket = (callbacks = {}) => {
  const { socket, isConnected } = useSocket();

  const { onTableCreated, onTableUpdated, onTableDeleted, onQRRegenerated } =
    callbacks;

  useEffect(() => {
    if (!socket || !isConnected) {
      console.log("⏸️ Socket not connected, skipping table event listeners");
      return;
    }

    console.log("👂 Setting up table socket listeners");

    // Table created event
    if (onTableCreated) {
      socket.on("table:created", (data) => {
        console.log("📨 Received table:created event:", data);
        onTableCreated(data);
      });
    }

    // Table updated event
    if (onTableUpdated) {
      socket.on("table:updated", (data) => {
        console.log("📨 Received table:updated event:", data);
        onTableUpdated(data);
      });
    }

    // Table deleted event
    if (onTableDeleted) {
      socket.on("table:deleted", (data) => {
        console.log("📨 Received table:deleted event:", data);
        onTableDeleted(data);
      });
    }

    // QR code regenerated event
    if (onQRRegenerated) {
      socket.on("table:qr_regenerated", (data) => {
        console.log("📨 Received table:qr_regenerated event:", data);
        onQRRegenerated(data);
      });
    }

    // Cleanup listeners on unmount
    return () => {
      console.log("🧹 Cleaning up table socket listeners");
      socket.off("table:created");
      socket.off("table:updated");
      socket.off("table:deleted");
      socket.off("table:qr_regenerated");
    };
  }, [
    socket,
    isConnected,
    onTableCreated,
    onTableUpdated,
    onTableDeleted,
    onQRRegenerated,
  ]);

  return { isConnected };
};

/**
 * Custom hook to listen for admin table events
 */
export const useAdminTableSocket = (callbacks = {}) => {
  const { socket, isConnected } = useSocket();

  const { onTableCreated, onTableDeleted, onQRRegenerated } = callbacks;

  useEffect(() => {
    if (!socket || !isConnected) return;

    console.log("👂 Setting up admin table socket listeners");

    if (onTableCreated) {
      socket.on("admin:table_created", (data) => {
        console.log("📨 Received admin:table_created event:", data);
        onTableCreated(data);
      });
    }

    if (onTableDeleted) {
      socket.on("admin:table_deleted", (data) => {
        console.log("📨 Received admin:table_deleted event:", data);
        onTableDeleted(data);
      });
    }

    if (onQRRegenerated) {
      socket.on("admin:qr_regenerated", (data) => {
        console.log("📨 Received admin:qr_regenerated event:", data);
        onQRRegenerated(data);
      });
    }

    return () => {
      console.log("🧹 Cleaning up admin table socket listeners");
      socket.off("admin:table_created");
      socket.off("admin:table_deleted");
      socket.off("admin:qr_regenerated");
    };
  }, [socket, isConnected, onTableCreated, onTableDeleted, onQRRegenerated]);

  return { isConnected };
};
