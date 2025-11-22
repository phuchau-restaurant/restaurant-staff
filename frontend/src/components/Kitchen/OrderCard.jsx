import React from 'react';
import { Bell, Clock, User, AlertCircle } from 'lucide-react';
import { STATUS_CONFIG } from './constants.jsx';

const OrderCard = ({ 
  order, 
  currentTime, 
  getElapsedTime, 
  getOrderStatus, 
  handleStart, 
  handleComplete, 
  handleCancel, 
  handleRecall,
  viewMode 
}) => {
  const status = getOrderStatus(order);
  const statusConfig = STATUS_CONFIG[status];
  const elapsed = getElapsedTime(order.orderTime);

  return (
    <div className={`bg-white rounded-2xl shadow-lg border-4 ${statusConfig.borderColor} overflow-hidden hover:shadow-2xl transition-all ${
      viewMode === 'list' ? 'flex items-stretch' : ''
    }`}>
      {/* Header */}
      <div className={`${statusConfig.color} text-white p-4 ${viewMode === 'list' ? 'w-48 flex-shrink-0 flex flex-col justify-center' : ''}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Bell size={20} />
            <span className="font-bold text-lg">{order.orderNumber}</span>
          </div>
          <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold">
            Bàn {order.tableNumber}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock size={16} />
          <span className="font-semibold">{elapsed} phút</span>
          {elapsed >= 10 && <AlertCircle size={16} className="animate-pulse" />}
        </div>
      </div>

      {/* Content */}
      <div className={`p-4 flex-1 ${viewMode === 'list' ? 'flex items-center gap-4' : ''}`}>
        {/* Items */}
        <div className={`mb-4 ${viewMode === 'list' ? 'flex-1 mb-0' : ''}`}>
          {order.items.map(item => (
            <div key={item.id} className={`flex gap-3 mb-3 ${viewMode === 'list' ? 'items-center' : ''}`}>
              <img 
                src={item.image} 
                alt={item.name} 
                className={`rounded-lg object-cover ${viewMode === 'list' ? 'w-12 h-12' : 'w-16 h-16'}`}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className={`font-bold text-gray-800 ${viewMode === 'list' ? 'text-base' : 'text-lg'}`}>
                    {item.name}
                  </h3>
                  <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    x{item.quantity}
                  </span>
                </div>
                {item.notes && (
                  <p className="text-red-600 text-sm font-semibold mt-1 italic">
                    📝 {item.notes}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Server Info */}
        <div className={`flex items-center gap-2 text-sm text-gray-600 mb-4 ${viewMode === 'list' ? 'mb-0 w-48' : ''}`}>
          <User size={16} />
          <span>{order.server}</span>
        </div>

        {/* Action Buttons */}
        <OrderActions 
          status={status}
          orderId={order.id}
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

// Action Buttons Component
const OrderActions = ({ status, orderId, handleStart, handleComplete, handleCancel, handleRecall, viewMode }) => {
  const gridClass = viewMode === 'list' ? 'grid-cols-2 w-64' : 'grid-cols-2';

  if (status === 'new') {
    return (
      <div className={`grid gap-2 ${gridClass}`}>
        <button
          onClick={() => handleStart(orderId)}
          className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white py-3 px-4 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all"
        >
          🔥 Bắt đầu
        </button>
        <button
          onClick={() => handleCancel(orderId)}
          className="bg-gradient-to-r from-red-400 to-red-600 text-white py-3 px-4 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all"
        >
          ❌ Hủy
        </button>
      </div>
    );
  }

  if (status === 'cooking' || status === 'warning' || status === 'late') {
    return (
      <div className={`grid gap-2 ${gridClass}`}>
        <button
          onClick={() => handleComplete(orderId)}
          className="bg-gradient-to-r from-green-400 to-green-600 text-white py-3 px-4 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all col-span-2"
        >
          ✅ Hoàn thành
        </button>
        <button
          onClick={() => handleCancel(orderId)}
          className="bg-gradient-to-r from-red-400 to-red-600 text-white py-3 px-4 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all"
        >
          ❌ Hủy
        </button>
        <button
          onClick={() => handleRecall(orderId)}
          className="bg-gradient-to-r from-purple-400 to-purple-600 text-white py-3 px-4 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all"
        >
          📢 Gọi PV
        </button>
      </div>
    );
  }

  if (status === 'completed') {
    return (
      <div className={`grid gap-2 ${gridClass}`}>
        <button
          onClick={() => handleRecall(orderId)}
          className="bg-gradient-to-r from-blue-400 to-blue-600 text-white py-3 px-4 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all col-span-2"
        >
          📢 Gọi ra lấy
        </button>
      </div>
    );
  }

  return null;
};

export default OrderCard;
