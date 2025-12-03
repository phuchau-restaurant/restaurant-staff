// src/components/OrderCard/OrderCard.jsx
import React, { useState } from 'react';
import { Bell, Clock, User, AlertCircle, CheckCircle2 } from 'lucide-react';
import { STATUS_CONFIG } from './constants.jsx'; // Giả sử constants cùng thư mục hoặc chỉnh đường dẫn phù hợp

// Import components đã tách
import OrderActions from './OrderActions';
import OrderDetailModal from './OrderDetailModal';

const OrderCard = ({ 
  order, 
  currentTime, 
  getElapsedTime, 
  getOrderStatus, 
  handleStart, 
  handleComplete, 
  handleCancel, 
  handleRecall,
  handleCompleteItem,
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
        viewMode === 'list' ? 'flex items-stretch' : 'flex flex-col h-full'
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

        {/* Content - Danh sách món trong thẻ */}
        <div className={`p-4 flex-1 ${viewMode === 'list' ? 'flex items-center gap-4' : 'flex flex-col'}`}>
          <div className={`${viewMode === 'list' ? 'flex-1 mb-0' : 'flex-1 max-h-[180px] overflow-y-auto mb-3'}`}>
            <div className={viewMode === 'list' ? 'space-y-1' : 'space-y-2'}>
              {order.items.map(item => (
                <div key={item.id} className={`flex gap-3 bg-gray-50 p-2 rounded-lg relative ${
                  item.completed ? 'opacity-50 bg-green-50' : ''
                } ${viewMode === 'list' ? 'items-center p-1.5' : ''}`}>
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className={`rounded-lg object-cover flex-shrink-0 ${viewMode === 'list' ? 'w-10 h-10' : 'w-14 h-14'}`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className={`font-bold text-gray-800 truncate ${
                        item.completed ? 'line-through' : ''
                      } ${viewMode === 'list' ? 'text-sm' : 'text-base'}`}>
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
                  {/* Nút hoàn thành món - chỉ hiện khi đã bắt đầu nấu */}
                  {(status === 'cooking' || status === 'late') && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!item.completed) {
                          handleCompleteItem(order.id, item.id);
                        }
                      }}
                      disabled={item.completed}
                      className={`shrink-0 self-center p-1 rounded-lg border-2 transition-all ${
                        item.completed
                          ? 'text-white bg-green-600 cursor-not-allowed'
                          : 'text-white bg-green-500 hover:shadow-lg hover:scale-110 cursor-pointer'
                      }`}
                      title={item.completed ? 'Đã hoàn thành' : 'Đánh dấu hoàn thành'}
                    >
                      <CheckCircle2 size={25} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Buttons on Card - Luôn ở cuối */}
          <div onClick={(e) => e.stopPropagation()} className="mt-auto">
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

      {/* Render Modal if open */}
      {showDetailModal && (
        <OrderDetailModal 
          order={order}
          status={status}
          statusConfig={statusConfig}
          elapsed={elapsed}
          onClose={() => setShowDetailModal(false)}
          handleStart={handleStart}
          handleComplete={handleComplete}
          handleCancel={handleCancel}
          handleRecall={handleRecall}
          handleCompleteItem={handleCompleteItem}
        />
      )}
    </>
  );
};

export default OrderCard;