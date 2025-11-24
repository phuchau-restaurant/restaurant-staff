import React, { useState, useEffect, useMemo } from 'react';
import KitchenHeader from '../components/Kitchen/KitchenHeader';
import OrdersGrid from '../components/Kitchen/OrdersGrid';
import { MOCK_ORDERS } from '../components/Kitchen/mockData';


const KitchenScreen = () => {
  const [viewMode, setViewMode] = useState('card');
  const [filterStation, setFilterStation] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
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
  const getElapsedTime = (orderTime) => {
    const diff = Math.floor((currentTime - orderTime) / 1000 / 60);
    return diff;
  };

  // Xác định trạng thái dựa trên thời gian
  const getOrderStatus = (order) => {
    if (order.status === 'completed' || order.status === 'cancelled') {
      return order.status;
    }
    const elapsed = getElapsedTime(order.orderTime);
    if (elapsed >= 10) return 'late';
    return order.status;
  };

  // Lọc orders
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Lấy trạng thái động (bao gồm late và warning)
      const actualStatus = getOrderStatus(order);
      const statusMatch = filterStatus === 'all' || actualStatus === filterStatus;
      const stationMatch = filterStation === 'all' || order.items.some(item => item.station === filterStation);
      return statusMatch && stationMatch;
    }).sort((a, b) => a.orderTime - b.orderTime);
  }, [orders, filterStation, filterStatus, currentTime]);

  // Actions
  const handleStart = (orderId) => {
    setOrders(prev => prev.map(o => 
      o.id === orderId ? { ...o, status: 'cooking', startTime: new Date() } : o
    ));
  };

  const handleComplete = (orderId) => {
    setOrders(prev => prev.map(o => 
      o.id === orderId ? { ...o, status: 'completed', completeTime: new Date() } : o
    ));
  };

  const handleCancel = (orderId) => {
    setOrders(prev => prev.map(o => 
      o.id === orderId ? { ...o, status: 'cancelled' } : o
    ));
  };

  const handleRecall = (orderId) => {
    alert(`Đã gọi nhân viên phục vụ đến lấy món - Đơn ${orderId}`);
  };

  return (
    <div className="h-full bg-gradient-to-br from-slate-100 to-slate-200 flex flex-col">
      <KitchenHeader
        currentTime={currentTime}
        viewMode={viewMode}
        setViewMode={setViewMode}
        filterStation={filterStation}
        setFilterStation={setFilterStation}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
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
          viewMode={viewMode}
        />
      </div>
    </div>
  );
};

export default KitchenScreen;
