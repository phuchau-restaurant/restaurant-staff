// useOrderSocket.js - Custom hook for order real-time updates
import { useEffect, useCallback } from "react";
import { useSocket } from "../context/SocketContext";

/**
 * Custom hook to listen for order-related socket events
 * @param {Object} callbacks - Event callbacks
 * @param {Function} callbacks.onOrderCreated - Called when new order is created
 * @param {Function} callbacks.onOrderUpdated - Called when order is updated
 * @param {Function} callbacks.onOrderDetailUpdated - Called when order detail is updated
 * @param {Function} callbacks.onOrderDeleted - Called when order is deleted
 */
export const useOrderSocket = (callbacks = {}) => {
  const { socket, isConnected } = useSocket();

  const {
    onOrderCreated,
    onOrderUpdated,
    onOrderDetailUpdated,
    onOrderDeleted,
  } = callbacks;

  useEffect(() => {
    if (!socket || !isConnected) {
      console.log("⏸️ Socket not connected, skipping event listeners");
      return;
    }

    console.log("👂 Setting up order socket listeners");

    // Order created event
    if (onOrderCreated) {
      socket.on("order:created", (data) => {
        console.log("📨 Received order:created event:", data);
        onOrderCreated(data);
      });
    }

    // Order updated event
    if (onOrderUpdated) {
      socket.on("order:updated", (data) => {
        console.log("📨 Received order:updated event:", data);
        onOrderUpdated(data);
      });
    }

    // Order detail updated event
    if (onOrderDetailUpdated) {
      socket.on("order_detail:updated", (data) => {
        console.log("📨 Received order_detail:updated event:", data);
        onOrderDetailUpdated(data);
      });
    }

    // Order deleted event
    if (onOrderDeleted) {
      socket.on("order:deleted", (data) => {
        console.log("📨 Received order:deleted event:", data);
        onOrderDeleted(data);
      });
    }

    // Cleanup listeners on unmount
    return () => {
      console.log("🧹 Cleaning up order socket listeners");
      socket.off("order:created");
      socket.off("order:updated");
      socket.off("order_detail:updated");
      socket.off("order:deleted");
    };
  }, [
    socket,
    isConnected,
    onOrderCreated,
    onOrderUpdated,
    onOrderDetailUpdated,
    onOrderDeleted,
  ]);

  return { isConnected };
};

/**
 * Custom hook to listen for kitchen-specific socket events
 */
export const useKitchenSocket = (callbacks = {}) => {
  const { socket, isConnected } = useSocket();

  const { onNewOrder, onDishStatusChanged } = callbacks;

  useEffect(() => {
    if (!socket || !isConnected) return;

    console.log("👂 Setting up kitchen socket listeners");

    if (onNewOrder) {
      socket.on("kitchen:new_order", (data) => {
        console.log("📨 Received kitchen:new_order event:", data);
        onNewOrder(data);
      });
    }

    if (onDishStatusChanged) {
      socket.on("kitchen:dish_status_changed", (data) => {
        console.log("📨 Received kitchen:dish_status_changed event:", data);
        onDishStatusChanged(data);
      });
    }

    return () => {
      console.log("🧹 Cleaning up kitchen socket listeners");
      socket.off("kitchen:new_order");
      socket.off("kitchen:dish_status_changed");
    };
  }, [socket, isConnected, onNewOrder, onDishStatusChanged]);

  return { isConnected };
};

/**
 * Custom hook to listen for admin-specific socket events
 */
export const useAdminSocket = (callbacks = {}) => {
  const { socket, isConnected } = useSocket();

  const { onOrderStatusChanged } = callbacks;

  useEffect(() => {
    if (!socket || !isConnected) return;

    console.log("👂 Setting up admin socket listeners");

    if (onOrderStatusChanged) {
      socket.on("admin:order_status_changed", (data) => {
        console.log("📨 Received admin:order_status_changed event:", data);
        onOrderStatusChanged(data);
      });
    }

    return () => {
      console.log("🧹 Cleaning up admin socket listeners");
      socket.off("admin:order_status_changed");
    };
  }, [socket, isConnected, onOrderStatusChanged]);

  return { isConnected };
};
