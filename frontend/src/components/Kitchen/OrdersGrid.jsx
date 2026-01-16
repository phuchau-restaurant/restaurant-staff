import React from 'react';
import { CheckCircle } from 'lucide-react';
import OrderCard from '../OrderCard/OrderCard';
import OrderListItem from '../OrderCard/OrderListItem';

const OrdersGrid = ({
  orders,
  currentTime,
  getElapsedTime,
  getOrderStatus,
  handleConfirmOrder,
  handleComplete,
  handleCancel,
  handleRecall,
  handleCompleteItem,
  handleCancelItem,
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
        viewMode === 'list' ? (
          <OrderListItem
            key={order.id}
            order={order}
            getElapsedTime={getElapsedTime}
            getOrderStatus={getOrderStatus}
            handleConfirmOrder={handleConfirmOrder}
            handleComplete={handleComplete}
            handleCancel={handleCancel}
            handleRecall={handleRecall}
            handleCompleteItem={handleCompleteItem}
            handleCancelItem={handleCancelItem}
            viewMode={viewMode}
          />
        ) : (
          <OrderCard
            key={order.id}
            order={order}
            currentTime={currentTime}
            getElapsedTime={getElapsedTime}
            getOrderStatus={getOrderStatus}
            handleConfirmOrder={handleConfirmOrder}
            handleComplete={handleComplete}
            handleCancel={handleCancel}
            handleRecall={handleRecall}
            handleCompleteItem={handleCompleteItem}
            handleCancelItem={handleCancelItem}
            viewMode={viewMode}
          />
        )
      ))}
    </div>
  );
};

export default OrdersGrid;

