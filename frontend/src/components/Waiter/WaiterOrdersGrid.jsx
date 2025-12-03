import React from "react";
import WaiterOrderCard from "./WaiterOrderCard";

const WaiterOrdersGrid = ({
  orders,
  currentTime,
  getElapsedTime,
  getOrderStatus,
}) => {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400">
        <div className="text-6xl mb-4">📋</div>
        <p className="text-2xl font-bold">Không có đơn hàng nào</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1920px] mx-auto px-6 py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr">
        {orders.map((order) => (
          <WaiterOrderCard
            key={order.id}
            order={order}
            currentTime={currentTime}
            getElapsedTime={getElapsedTime}
            getOrderStatus={getOrderStatus}
          />
        ))}
      </div>
    </div>
  );
};

export default WaiterOrdersGrid;
