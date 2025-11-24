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
      className={`group bg-white rounded-xl shadow-md border-l-8 ${statusConfig.borderColor} overflow-hidden hover:shadow-xl transition-all cursor-pointer ${
      viewMode === 'list' ? 'flex items-stretch' : ''
    }`}>
      {/* Header */}
      <div className={`bg-gradient-to-br from-gray-50 to-white p-4 border-b-2 border-gray-100 ${viewMode === 'list' ? 'w-64 flex-shrink-0 border-b-0 border-r-2' : ''}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-400 to-blue-500 p-2 rounded-lg shadow-sm">
              <Bell size={20} className="text-white" />
            </div>
            <div>
              <span className="font-black text-xl text-gray-800">{order.orderNumber}</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-blue-400 to-blue-500 text-white shadow-sm">
                  Bàn {order.tableNumber}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-200 text-gray-700">
                  {order.items.length} món
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200">
          <Clock size={16} className={elapsed >= 10 ? 'text-red-500' : 'text-gray-500'} />
          <span className={`font-bold text-sm ${elapsed >= 10 ? 'text-red-600' : 'text-gray-700'}`}>
            {elapsed} phút
          </span>
          {elapsed >= 10 && <AlertCircle size={16} className="text-red-500 animate-pulse" />}
        </div>

        <div className="mt-3 flex items-center gap-2 text-xs text-gray-600">
          <User size={14} />
          <span className="font-medium">{order.server}</span>
        </div>
      </div>

      {/* Content */}
      <div className={`p-4 flex-1 ${viewMode === 'list' ? 'flex items-center gap-4' : ''}`}>
        {/* Items */}
        <div className={`space-y-2 mb-3 ${viewMode === 'list' ? 'flex-1 mb-0 space-y-1' : ''}`}>
          {order.items.map(item => (
            <div key={item.id} className={`flex gap-3 bg-gray-50 p-2 rounded-lg ${viewMode === 'list' ? 'items-center p-1.5' : ''}`}>
              <img 
                src={item.image} 
                alt={item.name} 
                className={`rounded-lg object-cover flex-shrink-0 ${viewMode === 'list' ? 'w-10 h-10' : 'w-14 h-14'}`}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className={`font-bold text-gray-800 truncate ${viewMode === 'list' ? 'text-sm' : 'text-base'}`}>
                    {item.name}
                  </h3>
                  <span className="bg-orange-500 text-white px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0">
                    x{item.quantity}
                  </span>
                </div>
                {item.notes && (
                  <p className="text-red-600 text-xs font-semibold mt-0.5 italic truncate">
                    📝 {item.notes}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div onClick={(e) => e.stopPropagation()}>
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
    </div>

    {/* Detail Modal */}
    {showDetailModal && (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4" onClick={() => setShowDetailModal(false)}>
        <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
          {/* Modal Header */}
          <div className="bg-gradient-to-br from-gray-50 to-white p-6 border-b-2 border-gray-200 sticky top-0 z-10">
            <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-blue-400 to-blue-500 p-3 rounded-xl shadow-md">
                <ChefHat size={32} className="text-white" />
              </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-800">{order.orderNumber}</h2>
                  <p className="text-gray-600">Bàn {order.tableNumber} • {elapsed} phút</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-4 py-2 rounded-lg text-sm font-bold ${statusConfig.color} text-white`}>
                  {statusConfig.label}
                </span>
                <button 
                  onClick={() => setShowDetailModal(false)}
                  className="bg-gray-200 hover:bg-gray-300 p-2 rounded-full transition-all"
                >
                  <X size={28} className="text-gray-700" />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
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
                <div key={item.id} className="bg-gray-50 p-4 rounded-xl border-2 border-gray-200 flex gap-4 items-center">
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
  const gridClass = viewMode === 'list' ? 'grid-cols-2 gap-1.5' : 'grid-cols-2 gap-2';

  if (status === 'new') {
    return (
      <div className={`grid ${gridClass}`}>
        <button
          onClick={(e) => { e.stopPropagation(); handleStart(orderId); }}
          className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-2.5 px-3 rounded-lg font-bold hover:shadow-lg hover:scale-105 transition-all text-sm"
        >
          Bắt đầu
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); handleCancel(orderId); }}
          className="bg-red-50 text-red-700 py-2.5 px-3 rounded-lg font-bold hover:bg-red-100 hover:shadow-md hover:scale-105 transition-all text-sm border-2 border-red-200"
          style={{ backgroundColor: '#FEF2F2', color: '#B91C1C', borderColor: '#FECACA' }}
        >
          Hủy đơn
        </button>
      </div>
    );
  }

  if (status === 'cooking' || status === 'warning' || status === 'late') {
    return (
      <div className={`grid ${gridClass}`}>
        <button
          onClick={(e) => { e.stopPropagation(); handleComplete(orderId); }}
          className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2.5 px-3 rounded-lg font-bold hover:shadow-lg hover:scale-105 transition-all col-span-2 text-sm"
        >
          Hoàn thành
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); handleCancel(orderId); }}
          className="bg-red-50 text-red-700 py-2.5 px-3 rounded-lg font-bold hover:bg-red-100 hover:shadow-md hover:scale-105 transition-all text-sm border-2 border-red-200"
          style={{ backgroundColor: '#FEF2F2', color: '#B91C1C', borderColor: '#FECACA' }}
        >
          Hủy đơn
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); handleRecall(orderId); }}
          className="bg-blue-100 text-blue-700 py-2.5 px-3 rounded-lg font-bold hover:bg-blue-200 hover:shadow-md hover:scale-105 transition-all text-sm border-2 border-blue-300"
          style={{ backgroundColor: '#DBEAFE', color: '#1D4ED8' }}
        >
          Gọi PV
        </button>
      </div>
    );
  }

  if (status === 'completed') {
    return (
      <div className={`grid ${gridClass}`}>
        <button
          onClick={(e) => { e.stopPropagation(); handleRecall(orderId); }}
          className="bg-blue-100 text-blue-700 py-2.5 px-3 rounded-lg font-bold hover:bg-blue-200 hover:shadow-md hover:scale-105 transition-all col-span-2 text-sm border-2 border-blue-300"
          style={{ backgroundColor: '#DBEAFE', color: '#1D4ED8' }}
        >
          Gọi ra lấy
        </button>
      </div>
    );
  }

  return null;
};

export default OrderCard;
