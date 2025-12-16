import { useState, useEffect, useMemo } from "react";

export const useKitchenOrders = (initialOrders) => {
  const [orders, setOrders] = useState(initialOrders);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Cập nhật thời gian mỗi giây
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Phát âm thanh khi có đơn mới
  useEffect(() => {
    const newOrders = orders.filter((o) => o.status === "new");
    if (newOrders.length > 0) {
      // Có thể thêm audio.play() ở đây
    }
  }, [orders]);

  // Tính thời gian từ khi order
  const getElapsedTime = (orderTime) => {
    const diff = Math.floor((currentTime - orderTime) / 1000 / 60);
    return diff;
  };

  // Xác định trạng thái dựa trên thời gian
  const getOrderStatus = (order) => {
    if (order.status === "completed" || order.status === "cancelled") {
      return order.status;
    }
    const elapsed = getElapsedTime(order.orderTime);
    if (elapsed >= 15) return "late";
    if (elapsed >= 10) return "warning";
    return order.status;
  };

  // Actions
  const handleStart = (orderId) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, status: "cooking", startTime: new Date() }
          : o
      )
    );
  };

  const handleComplete = (orderId) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, status: "completed", completeTime: new Date() }
          : o
      )
    );
  };

  const handleCancel = (orderId) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: "cancelled" } : o))
    );
  };

  const handleRecall = (orderId, onRecallSuccess) => {
    if (onRecallSuccess) {
      onRecallSuccess(`Đã gọi nhân viên phục vụ đến lấy món - Đơn ${orderId}`);
    }
  };

  return {
    orders,
    currentTime,
    getElapsedTime,
    getOrderStatus,
    handleStart,
    handleComplete,
    handleCancel,
    handleRecall,
  };
};

export const useOrderFilters = (orders, filterStation, filterStatus) => {
  return useMemo(() => {
    return orders
      .filter((order) => {
        const statusMatch =
          filterStatus === "all" || order.status === filterStatus;
        const stationMatch =
          filterStation === "all" ||
          order.items.some((item) => item.station === filterStation);
        return statusMatch && stationMatch;
      })
      .sort((a, b) => a.orderTime - b.orderTime);
  }, [orders, filterStation, filterStatus]);
};
