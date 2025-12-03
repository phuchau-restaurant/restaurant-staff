// src/components/OrderCard/OrderActions.jsx
import React from 'react';

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

export default OrderActions;