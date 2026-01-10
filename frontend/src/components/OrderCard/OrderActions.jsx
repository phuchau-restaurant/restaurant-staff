// src/components/OrderCard/OrderActions.jsx
import React from 'react';

const OrderActions = ({ status, orderId, handleStart, handleComplete, handleCancel, handleRecall, viewMode }) => {
  // Config layout based on viewMode
  let containerClass = "grid gap-2";
  let btnBaseClass = "rounded-xl font-bold transition-all transform active:scale-95 flex items-center justify-center shadow-sm";
  let btnHeightClass = "py-3 text-sm"; // default for card

  if (viewMode === 'list') {
    containerClass = "grid gap-1.5 grid-cols-2";
    btnHeightClass = "py-2 text-xs";
  } else if (viewMode === 'modal') {
    containerClass = "flex gap-4"; // Modal uses flex row usually with big buttons
    btnBaseClass = "rounded-xl font-bold transition-all transform hover:-translate-y-1 hover:shadow-lg active:scale-95 flex-1 flex items-center justify-center text-lg";
    btnHeightClass = "py-4";
  } else {
    // Card view defaults
    containerClass = "grid grid-cols-2 gap-2";
  }

  // --- RENDERING ---

  if (status === 'new') {
    return (
      <div className={containerClass}>
        <button
          onClick={(e) => { e.stopPropagation(); handleStart(orderId); }}
          className={`${btnBaseClass} ${btnHeightClass} bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:shadow-orange-200 border border-transparent`}
        >
          Bắt đầu
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); handleCancel(orderId); }}
          className={`${btnBaseClass} ${btnHeightClass} bg-red-50 text-red-600 border border-red-200 hover:bg-red-100`}
        >
          Hủy đơn
        </button>
      </div>
    );
  }

  if (status === 'cooking' || status === 'warning' || status === 'late') {
    return (
      <div className={containerClass}>
         {/* Complete Button - Main Action */}
        <button
          onClick={(e) => { e.stopPropagation(); handleComplete(orderId); }}
          className={`${btnBaseClass} ${btnHeightClass} ${viewMode === 'list' ? 'col-span-2' : viewMode === 'card' ? 'col-span-2' : ''} bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-green-200 border border-transparent`}
        >
          Hoàn thành
        </button>

        {/* Secondary Actions */}
        <button
          onClick={(e) => { e.stopPropagation(); handleCancel(orderId); }}
          className={`${btnBaseClass} ${btnHeightClass} bg-red-50 text-red-600 border border-red-200 hover:bg-red-100`}
        >
          Hủy
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); handleRecall(orderId); }}
          className={`${btnBaseClass} ${btnHeightClass} bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100`}
        >
          Gọi PV
        </button>
      </div>
    );
  }

  if (status === 'completed') {
    return (
      <div className={containerClass}>
        <button
          onClick={(e) => { e.stopPropagation(); handleRecall(orderId); }}
          className={`${btnBaseClass} ${btnHeightClass} ${viewMode === 'list' || viewMode === 'card' ? 'col-span-2' : ''} bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100`}
        >
          Gọi ra lấy
        </button>
      </div>
    );
  }

  return null;
};

export default OrderActions;