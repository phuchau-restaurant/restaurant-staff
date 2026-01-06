import React, { useState, useEffect, useMemo, useCallback } from "react";
import WaiterHeader from "../components/Waiter/WaiterHeader";
import WaiterOrdersGrid from "../components/Waiter/WaiterOrdersGrid";
import { useOrderSocket } from "../hooks/useOrderSocket";

const WaiterScreen = () => {
  const [orders, setOrders] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchOrderId, setSearchOrderId] = useState("");

  // Cập nhật thời gian mỗi giây
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Socket listeners for real-time updates
  useOrderSocket({
    onOrderCreated: (data) => {
      console.log("🔔 New order created:", data);
      const newOrder = {
        id: data.orderId,
        orderNumber: data.orderId,
        tableNumber: data.tableId,
        orderTime: new Date(),
        status: data.status || "Pending",
        items: (data.items || []).map((item) => ({
          id: item.dishId,
          name: item.name || "Món ăn",
          quantity: item.quantity,
          completed: item.status === "Completed",
        })),
      };
      setOrders((prev) => [newOrder, ...prev]);
    },
    onOrderUpdated: (data) => {
      console.log("🔔 Order updated:", data);
      setOrders((prev) =>
        prev.map((order) =>
          order.id === data.orderId ? { ...order, status: data.status } : order
        )
      );
    },
    onOrderDetailUpdated: (data) => {
      console.log("🔔 Order detail updated:", data);
      setOrders((prev) =>
        prev.map((order) => {
          if (order.id === data.orderId) {
            return {
              ...order,
              items: order.items.map((item) =>
                item.id === data.dishId
                  ? { ...item, completed: data.status === "Completed" }
                  : item
              ),
            };
          }
          return order;
        })
      );
    },
    onOrderDeleted: (data) => {
      console.log("🔔 Order deleted:", data);
      setOrders((prev) => prev.filter((order) => order.id !== data.orderId));
    },
  });

  // Tính thời gian từ khi order
  const getElapsedTime = useCallback(
    (orderTime) => {
      const diff = Math.floor((currentTime - orderTime) / 1000 / 60);
      return diff;
    },
    [currentTime]
  );

  // Xác định trạng thái dựa trên thời gian
  const getOrderStatus = useCallback(
    (order) => {
      if (order.status === "completed" || order.status === "cancelled") {
        return order.status;
      }
      const elapsed = getElapsedTime(order.orderTime);
      if (elapsed >= 10) return "late";
      return order.status;
    },
    [getElapsedTime]
  );

  // Lọc orders
  const filteredOrders = useMemo(() => {
    return orders
      .filter((order) => {
        if (
          searchOrderId &&
          !order.orderNumber.toLowerCase().includes(searchOrderId.toLowerCase())
        ) {
          return false;
        }
        return order.status !== "cancelled";
      })
      .sort((a, b) => a.orderTime - b.orderTime);
  }, [orders, searchOrderId]);

  // Tính toán thống kê món ăn
  const getItemsStats = useCallback(() => {
    let totalItems = 0;
    let preparingItems = 0;
    let completedItems = 0;

    orders.forEach((order) => {
      if (order.status !== "cancelled") {
        order.items.forEach((item) => {
          totalItems++;
          if (item.completed) {
            completedItems++;
          } else if (order.status === "cooking" || order.status === "late") {
            preparingItems++;
          }
        });
      }
    });

    return { totalItems, preparingItems, completedItems };
  }, [orders]);

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-blue-50">
      <WaiterHeader
        searchOrderId={searchOrderId}
        setSearchOrderId={setSearchOrderId}
      />

      <WaiterOrdersGrid
        orders={filteredOrders}
        currentTime={currentTime}
        getElapsedTime={getElapsedTime}
        getOrderStatus={getOrderStatus}
      />
    </div>
  );
};

export default WaiterScreen;
