// useQRSocket.js - Custom hook for QR management real-time updates
import { useEffect } from "react";
import { useSocket } from "../context/SocketContext";

/**
 * Custom hook to listen for QR-related socket events
 * @param {Object} callbacks - Event callbacks
 * @param {Function} callbacks.onQRGenerated - Called when QR code is generated/regenerated
 * @param {Function} callbacks.onQRDeleted - Called when QR code is deleted
 */
export const useQRSocket = (callbacks = {}) => {
  const { socket, isConnected } = useSocket();

  const { onQRGenerated, onQRDeleted } = callbacks;

  useEffect(() => {
    if (!socket || !isConnected) {
      console.log("⏸️ Socket not connected, skipping QR event listeners");
      return;
    }

    console.log("👂 Setting up QR socket listeners");

    // QR generated/regenerated event
    if (onQRGenerated) {
      socket.on("qr:generated", (data) => {
        console.log("📨 Received qr:generated event:", data);
        onQRGenerated(data);
      });
    }

    // QR deleted event
    if (onQRDeleted) {
      socket.on("qr:deleted", (data) => {
        console.log("📨 Received qr:deleted event:", data);
        onQRDeleted(data);
      });
    }

    // Cleanup listeners on unmount
    return () => {
      console.log("🧹 Cleaning up QR socket listeners");
      socket.off("qr:generated");
      socket.off("qr:deleted");
    };
  }, [socket, isConnected, onQRGenerated, onQRDeleted]);

  return { isConnected };
};

/**
 * Custom hook to listen for admin QR events
 */
export const useAdminQRSocket = (callbacks = {}) => {
  const { socket, isConnected } = useSocket();

  const { onQRGenerated, onQRDeleted } = callbacks;

  useEffect(() => {
    if (!socket || !isConnected) return;

    console.log("👂 Setting up admin QR socket listeners");

    if (onQRGenerated) {
      socket.on("admin:qr_generated", (data) => {
        console.log("📨 Received admin:qr_generated event:", data);
        onQRGenerated(data);
      });
    }

    if (onQRDeleted) {
      socket.on("admin:qr_deleted", (data) => {
        console.log("📨 Received admin:qr_deleted event:", data);
        onQRDeleted(data);
      });
    }

    return () => {
      console.log("🧹 Cleaning up admin QR socket listeners");
      socket.off("admin:qr_generated");
      socket.off("admin:qr_deleted");
    };
  }, [socket, isConnected, onQRGenerated, onQRDeleted]);

  return { isConnected };
};
