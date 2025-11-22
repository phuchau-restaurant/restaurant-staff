import React from 'react';
import { CheckCircle } from 'lucide-react';
import OrderCard from './OrderCard';

const OrdersGrid = ({ 
  orders, 
  currentTime, 
  getElapsedTime, 
  getOrderStatus, 
  handleStart, 
  handleComplete, 
  handleCancel, 
  handleRecall,
  viewMode 
}) => {
  if (orders.length === 0) {
    return (
      <div className="text-center py-20">
        <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
        <p className="text-2xl font-bold text-gray-600">Không có đơn hàng nào</p>
      </div>
    );
  }

  return (
    <div className={
      viewMode === 'card'
        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
        : 'space-y-4'
    }>
      {orders.map(order => (
        <OrderCard
          key={order.id}
          order={order}
          currentTime={currentTime}
          getElapsedTime={getElapsedTime}
          getOrderStatus={getOrderStatus}
          handleStart={handleStart}
          handleComplete={handleComplete}
          handleCancel={handleCancel}
          handleRecall={handleRecall}
          viewMode={viewMode}
        />
      ))}
    </div>
  );
};

export default OrdersGrid;
