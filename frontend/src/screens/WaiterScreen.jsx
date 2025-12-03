import React, { useState, useEffect, useMemo, useCallback } from "react";
import { MOCK_ORDERS } from "../components/Kitchen/mockData";
import WaiterHeader from "../components/Waiter/WaiterHeader";
import WaiterOrdersGrid from "../components/Waiter/WaiterOrdersGrid";

const WaiterScreen = () => {
  const [orders, setOrders] = useState(MOCK_ORDERS);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchOrderId, setSearchOrderId] = useState("");

  // Cập nhật thời gian mỗi giây
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
        if (searchOrderId && !order.orderNumber.toLowerCase().includes(searchOrderId.toLowerCase())) {
          return false;
        }
        return order.status !== 'cancelled';
      })
      .sort((a, b) => a.orderTime - b.orderTime);
  }, [orders, searchOrderId]);

  // Tính toán thống kê món ăn
  const getItemsStats = useCallback(() => {
    let totalItems = 0;
    let preparingItems = 0;
    let completedItems = 0;

    orders.forEach(order => {
      if (order.status !== 'cancelled') {
        order.items.forEach(item => {
          totalItems++;
          if (item.completed) {
            completedItems++;
          } else if (order.status === 'cooking' || order.status === 'late') {
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
