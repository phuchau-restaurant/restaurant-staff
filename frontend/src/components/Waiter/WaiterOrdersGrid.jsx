import React from "react";
import WaiterOrderCard from "./WaiterOrderCard";

const WaiterOrdersGrid = ({
  orders,
  currentTime,
  getElapsedTime,
  getOrderStatus,
  showClaimButton = false,
  onClaimOrder,
  onCancelItem,
  onConfirmItem,
  onServeItem,
}) => {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-gray-400">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <span className="text-4xl">📋</span>
        </div>
        <p className="text-xl font-semibold text-gray-500">Không có đơn hàng nào</p>
        <p className="text-sm text-gray-400 mt-1">Các đơn hàng mới sẽ xuất hiện ở đây</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {orders.map((order) => (
        <WaiterOrderCard
          key={order.id}
          order={order}
          currentTime={currentTime}
          getElapsedTime={getElapsedTime}
          getOrderStatus={getOrderStatus}
          showClaimButton={showClaimButton}
          onClaimOrder={onClaimOrder}
          onCancelItem={onCancelItem}
          onConfirmItem={onConfirmItem}
          onServeItem={onServeItem}
        />
      ))}
    </div>
  );
};

export default WaiterOrdersGrid;
