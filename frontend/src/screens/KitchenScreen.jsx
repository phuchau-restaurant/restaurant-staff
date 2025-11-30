import React, { useState, useEffect, useMemo, useCallback } from "react";
import KitchenHeader from "../components/Kitchen/KitchenHeader";
import OrdersGrid from "../components/Kitchen/OrdersGrid";
import { MOCK_ORDERS } from "../components/Kitchen/mockData";

const STATUS_OPTIONS = [
  "all",
  "pending",
  "cooking",
  "completed",
  "late",
  "cancelled",
];

const KitchenScreen = () => {
  const [viewMode, setViewMode] = useState("card");
  const [filterStation, setFilterStation] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchOrderId, setSearchOrderId] = useState("");
  const [orders, setOrders] = useState(MOCK_ORDERS);
  const [currentTime, setCurrentTime] = useState(new Date());

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
        // Tìm kiếm theo orderNumber
        if (searchOrderId && !order.orderNumber.toLowerCase().includes(searchOrderId.toLowerCase())) {
          return false;
        }
        
        const actualStatus = getOrderStatus(order);
        const statusMatch =
          filterStatus === "all" || actualStatus === filterStatus;
        const stationMatch =
          filterStation === "all" ||
          order.items.some((item) => item.station === filterStation);
        return statusMatch && stationMatch;
      })
      .sort((a, b) => a.orderTime - b.orderTime);
  }, [orders, filterStation, filterStatus, searchOrderId, getOrderStatus]);

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

  const handleRecall = (orderId) => {
    alert(`Đã gọi nhân viên phục vụ đến lấy món - Đơn ${orderId}`);
  };

  const handleCompleteItem = (orderId, itemId) => {
    // Lấy thông tin món trước khi update
    const order = orders.find(o => o.id === orderId);
    const item = order?.items.find(i => i.id === itemId);
    
    // Chỉ xử lý nếu món tồn tại và chưa hoàn thành
    if (!item || item.completed) return;
    
    // Thông báo trước khi update state
    alert(`🔔 Đã thông báo nhân viên!\n\nMón: ${item.name} x${item.quantity}\nBàn: ${order.tableNumber}\nĐơn: ${order.orderNumber}\n\n✅ Món đã sẵn sàng để phục vụ!`);
    
    // Update state sau khi thông báo
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const updatedItems = o.items.map((item) =>
            item.id === itemId ? { ...item, completed: true } : item
          );
          
          // Kiểm tra nếu tất cả món đã hoàn thành thì chuyển status sang completed
          const allCompleted = updatedItems.every((item) => item.completed);
          return {
            ...o,
            items: updatedItems,
            status: allCompleted ? "completed" : o.status,
            completeTime: allCompleted ? new Date() : o.completeTime,
          };
        }
        return o;
      })
    );
  };

  return (
    <div className="h-full bg-linear-to-br from-slate-100 to-slate-200 flex flex-col">
      <KitchenHeader
        currentTime={currentTime}
        viewMode={viewMode}
        setViewMode={setViewMode}
        filterStation={filterStation}
        setFilterStation={setFilterStation}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        searchOrderId={searchOrderId}
        setSearchOrderId={setSearchOrderId}
        statusOptions={STATUS_OPTIONS}
      />

      <div className="flex-1 p-6 overflow-y-auto">
        <OrdersGrid
          orders={filteredOrders}
          currentTime={currentTime}
          getElapsedTime={getElapsedTime}
          getOrderStatus={getOrderStatus}
          handleStart={handleStart}
          handleComplete={handleComplete}
          handleCancel={handleCancel}
          handleRecall={handleRecall}
          handleCompleteItem={handleCompleteItem}
          viewMode={viewMode}
        />
      </div>
    </div>
  );
};

export default KitchenScreen;
