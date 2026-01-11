// src/components/OrderCard/OrderActions.jsx
import React from 'react';

const OrderActions = ({ status, orderId, handleStart, handleComplete, handleCancel, handleRecall, viewMode }) => {
  // Check if we're in list view mode
  const isListView = viewMode === 'list';

  // Base button styles
  const baseBtn = "rounded-lg font-semibold text-sm transition-all border-2";

  // Button styles - adapt based on view mode
  const primaryBtn = isListView
    ? `${baseBtn} px-4 py-1.5 whitespace-nowrap`
    : `${baseBtn} w-full py-2`;
  const secondaryBtn = isListView
    ? `${baseBtn} px-3 py-1.5 whitespace-nowrap`
    : `${baseBtn} flex-1 py-1.5`;

  // Outline button color variants - light background + dark border
  const greenOutline = "bg-green-50 border-green-500 text-green-700 hover:bg-green-100";
  const blueOutline = "bg-blue-50 border-blue-500 text-blue-700 hover:bg-blue-100";
  const orangeOutline = "bg-orange-50 border-orange-500 text-orange-700 hover:bg-orange-100";

  // Container style based on view mode
  const containerClass = isListView
    ? "flex items-center gap-2"
    : "space-y-2";

  // --- NEW ORDER ---
  if (status === 'new') {
    if (isListView) {
      // Horizontal layout for list view
      return (
        <div className={containerClass}>
          <button
            onClick={(e) => { e.stopPropagation(); handleComplete(orderId); }}
            className={`${primaryBtn} ${greenOutline}`}
          >
            Hoàn thành
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleRecall(orderId); }}
            className={`${secondaryBtn} ${blueOutline}`}
          >
            Gọi PV
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleCancel(orderId); }}
            className={`${secondaryBtn} ${orangeOutline}`}
          >
            Hủy
          </button>
        </div>
      );
    }
    // Original vertical layout for card view
    return (
      <div className={containerClass}>
        <button
          onClick={(e) => { e.stopPropagation(); handleComplete(orderId); }}
          className={`${primaryBtn} ${greenOutline}`}
        >
          Hoàn thành
        </button>
        <div className="flex gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); handleRecall(orderId); }}
            className={`${secondaryBtn} ${blueOutline}`}
          >
            Gọi PV
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleCancel(orderId); }}
            className={`${secondaryBtn} ${orangeOutline}`}
          >
            Hủy
          </button>
        </div>
      </div>
    );
  }

  // --- COOKING / LATE ---
  if (status === 'cooking' || status === 'warning' || status === 'late') {
    if (isListView) {
      // Horizontal layout for list view
      return (
        <div className={containerClass}>
          <button
            onClick={(e) => { e.stopPropagation(); handleComplete(orderId); }}
            className={`${primaryBtn} ${greenOutline}`}
          >
            Hoàn thành
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleRecall(orderId); }}
            className={`${secondaryBtn} ${blueOutline}`}
          >
            Gọi PV
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleCancel(orderId); }}
            className={`${secondaryBtn} ${orangeOutline}`}
          >
            Hủy
          </button>
        </div>
      );
    }
    // Original vertical layout for card view
    return (
      <div className={containerClass}>
        <button
          onClick={(e) => { e.stopPropagation(); handleComplete(orderId); }}
          className={`${primaryBtn} ${greenOutline}`}
        >
          Hoàn thành
        </button>
        <div className="flex gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); handleRecall(orderId); }}
            className={`${secondaryBtn} ${blueOutline}`}
          >
            Gọi PV
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleCancel(orderId); }}
            className={`${secondaryBtn} ${orangeOutline}`}
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
        className={`${primaryBtn} ${blueOutline}`}
      >
        Gọi nhân viên ra lấy
      </button>
    );
  }

  return null;
};

export default OrderActions;