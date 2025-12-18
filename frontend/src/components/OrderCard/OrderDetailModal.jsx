// src/components/OrderCard/OrderDetailModal.jsx
import React from 'react';
import { ChefHat, X, User, CheckCircle2 } from 'lucide-react';
import OrderActions from './OrderActions'; // Import component con

const OrderDetailModal = ({ 
  order, 
  status, 
  statusConfig, 
  elapsed, 
  onClose, 
  // Nhận các function xử lý từ cha để truyền xuống OrderActions
  handleStart, handleComplete, handleCancel, handleRecall,
  handleCompleteItem
}) => {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4" onClick={onClose}>
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
                onClick={onClose}
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
            {order.items.map((item) => (
              <div key={item.id} className={`p-4 rounded-xl border-2 flex gap-4 items-center ${
                item.completed ? 'bg-green-50 border-green-200 opacity-70' : 'bg-gray-50 border-gray-200'
              }`}>
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-24 h-24 rounded-xl object-cover shadow-md"
                />
                <div className="flex-1">
                  <h4 className={`text-2xl font-bold text-gray-800 mb-1 ${
                    item.completed ? 'line-through' : ''
                  }`}>{item.name}</h4>
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
                {/* Nút hoàn thành món */}
                {(status === 'cooking' || status === 'late') && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!item.completed) {
                        handleCompleteItem(order.id, item.id);
                      }
                    }}
                    disabled={item.completed}
                    className={`shrink-0 self-center p-1.5 rounded-lg border-2 transition-all ${
                      item.completed
                        ? 'text-white bg-green-600 cursor-not-allowed'
                        : 'text-white bg-green-500 hover:shadow-lg hover:scale-110 cursor-pointer'
                    }`}
                    title={item.completed ? 'Đã hoàn thành' : 'Đánh dấu hoàn thành'}
                  >
                    <CheckCircle2 size={32} />
                  </button>
                )}
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
  );
};

export default OrderDetailModal;