// src/components/OrderCard/OrderActions.jsx
import React from 'react';

const OrderActions = ({ status, orderId, handleStart, handleComplete, handleCancel, handleRecall, viewMode }) => {
  // Button styles - simple and clean
  const primaryBtn = "w-full py-2.5 rounded-lg font-semibold text-sm transition-colors";
  const secondaryBtn = "flex-1 py-2 rounded-lg font-medium text-sm transition-colors";

  // --- NEW ORDER ---
  if (status === 'new') {
    return (
      <div className="space-y-2">
        <button
          onClick={(e) => { e.stopPropagation(); handleComplete(orderId); }}
          className={`${primaryBtn} bg-green-500 hover:bg-green-600 text-white`}
        >
          Hoàn thành
        </button>
        <div className="flex gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); handleRecall(orderId); }}
            className={`${secondaryBtn} bg-blue-500 hover:bg-blue-600 text-white`}
          >
            Gọi PV
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleCancel(orderId); }}
            className={`${secondaryBtn} bg-orange-500 hover:bg-orange-600 text-white`}
          >
            Hủy
          </button>
        </div>
      </div>
    );
  }

  // --- COOKING / LATE ---
  if (status === 'cooking' || status === 'warning' || status === 'late') {
    return (
      <div className="space-y-2">
        <button
          onClick={(e) => { e.stopPropagation(); handleComplete(orderId); }}
          className={`${primaryBtn} bg-green-500 hover:bg-green-600 text-white`}
        >
          Hoàn thành
        </button>
        <div className="flex gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); handleRecall(orderId); }}
            className={`${secondaryBtn} bg-blue-500 hover:bg-blue-600 text-white`}
          >
            Gọi PV
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleCancel(orderId); }}
            className={`${secondaryBtn} bg-orange-500 hover:bg-orange-600 text-white`}
          >
            Hủy
          </button>
        </div>
      </div>
    );
  }

  // --- COMPLETED ---
  if (status === 'completed') {
    return (
      <button
        onClick={(e) => { e.stopPropagation(); handleRecall(orderId); }}
        className={`${primaryBtn} bg-blue-500 hover:bg-blue-600 text-white`}
      >
        Gọi nhân viên ra lấy
      </button>
    );
  }

  return null;
};

export default OrderActions;