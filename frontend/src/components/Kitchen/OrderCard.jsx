import React, { useState } from 'react';
import { Bell, Clock, User, AlertCircle, X, ChefHat } from 'lucide-react';
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
  const [showDetailModal, setShowDetailModal] = useState(false);
  const status = getOrderStatus(order);
  const statusConfig = STATUS_CONFIG[status];
  const elapsed = getElapsedTime(order.orderTime);

  return (
    <>
    <div 
      onClick={() => setShowDetailModal(true)}
      className={`bg-white rounded-2xl shadow-lg border-4 ${statusConfig.borderColor} overflow-hidden hover:shadow-2xl transition-all cursor-pointer ${
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
        <div className="mt-2 text-xs bg-white/20 px-2 py-1 rounded text-center">
          {order.items.length} món - Click xem chi tiết
        </div>
      </div>

      {/* Content - Hidden in card view */}
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

    {/* Detail Modal */}
    {showDetailModal && (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4" onClick={() => setShowDetailModal(false)}>
        <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
          {/* Modal Header */}
          <div className={`${statusConfig.color} text-white p-6 sticky top-0 z-10`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <ChefHat size={32} />
                <div>
                  <h2 className="text-3xl font-bold">{order.orderNumber}</h2>
                  <p className="text-white/90">Bàn {order.tableNumber} • {elapsed} phút</p>
                </div>
              </div>
              <button 
                onClick={() => setShowDetailModal(false)}
                className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-all"
              >
                <X size={28} />
              </button>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <User size={18} />
              <span>Phục vụ: {order.server}</span>
            </div>
          </div>

          {/* Modal Content - All Items */}
          <div className="p-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="bg-orange-500 text-white px-4 py-2 rounded-lg">
                {order.items.length} món
              </span>
              <span className="text-gray-600 text-lg">trong đơn hàng</span>
            </h3>
            
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={item.id} className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-2xl border-2 border-orange-200 flex gap-4 items-center">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-24 h-24 rounded-xl object-cover shadow-md"
                  />
                  <div className="flex-1">
                    <h4 className="text-2xl font-bold text-gray-800 mb-1">{item.name}</h4>
                    <div className="flex items-center gap-3">
                      <span className="bg-orange-500 text-white px-4 py-2 rounded-full text-lg font-bold">
                        Số lượng: x{item.quantity}
                      </span>
                      {item.notes && (
                        <p className="text-red-600 text-base font-semibold italic">
                          📝 {item.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Action Buttons */}
            <div className="mt-6 border-t-2 border-gray-200 pt-6">
              <OrderActions 
                status={status}
                orderId={order.id}
                handleStart={handleStart}
                handleComplete={handleComplete}
                handleCancel={handleCancel}
                handleRecall={handleRecall}
                viewMode="card"
              />
            </div>
          </div>
        </div>
      </div>
    )}
    </>
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
