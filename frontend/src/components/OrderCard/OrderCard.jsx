// src/components/OrderCard/OrderCard.jsx
import React, { useState } from "react";
import { Clock, CheckCircle2 } from "lucide-react";
import { STATUS_CONFIG } from "./constants.jsx";
import OrderActions from "./OrderActions";
import OrderDetailModal from "./OrderDetailModal";

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
  viewMode,
}) => {
  const [showDetailModal, setShowDetailModal] = useState(false);
  const status = getOrderStatus(order);
  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG["new"];
  const elapsed = getElapsedTime(order.orderTime);
  const isLate = elapsed >= 15;

  return (
    <>
      <div
        onClick={() => setShowDetailModal(true)}
        className={`rounded-xl shadow-md border-2 ${statusConfig.borderColor} bg-white overflow-hidden cursor-pointer flex flex-col h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-200`}
      >
        {/* Header - Bold with gradient accent */}
        <div className={`px-4 py-3 ${statusConfig.bgLight} border-b-2 ${statusConfig.borderColor}`}>
          <div className="flex items-center justify-between">
            {/* Order Info - Simpler */}
            <div className="flex items-center gap-2">
              <span className="font-black text-gray-900 text-xl">
                #{order.orderNumber.toString().slice(-2)}
              </span>
              <span className="text-gray-300">|</span>
              <span className="font-bold text-gray-700 text-lg">
                Bàn {order.tableNumber}
              </span>
            </div>

            {/* Timer Badge */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-black text-sm ${isLate
                ? "bg-red-500 text-white shadow-lg"
                : "bg-gray-200 text-gray-600"
                }`}
            >
              <Clock size={14} strokeWidth={3} />
              <span>{elapsed}'</span>
            </div>
          </div>
        </div>

        {/* Items List - Better contrast */}
        <div className="flex-1 px-3 py-2 overflow-y-auto bg-white min-h-[160px]">
          <div className="space-y-0.5">
            {order.items.map((item, idx) => (
              <div
                key={item.id || idx}
                className={`flex items-start justify-between gap-3 p-3 rounded-lg transition-colors ${item.completed ? "bg-green-50" : "hover:bg-gray-50"
                  } ${idx !== order.items.length - 1 ? "border-b-2 border-gray-100" : ""}`}
              >
                <div className="flex-1 min-w-0 space-y-1.5">
                  {/* Item Name with Quantity inline */}
                  <div className="flex items-baseline gap-2">
                    <span
                      className={`font-bold text-xl ${item.completed ? "text-gray-400 line-through" : "text-gray-900"
                        }`}
                    >
                      {item.name}
                    </span>
                    <span className="text-lg font-black text-orange-600">
                      x{item.quantity}
                    </span>
                  </div>

                  {/* Modifiers - Green pills */}
                  {item.modifiers && item.modifiers.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {item.modifiers.map((mod, mIdx) => (
                        <span
                          key={mIdx}
                          className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-md"
                        >
                          + {mod.optionName}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Note - Red alert */}
                  {item.note && (
                    <div className="text-sm font-bold text-red-600 bg-red-100 px-2 py-1 rounded-md inline-block">
                      ⚠ {item.note}
                    </div>
                  )}
                </div>

                {/* Checkbox - Larger */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!item.completed) {
                      handleCompleteItem(order.id, item.id);
                    }
                  }}
                  className={`flex-shrink-0 w-10 h-10 rounded-full border-3 flex items-center justify-center transition-all mt-1 ${item.completed
                    ? "bg-green-500 border-green-600 text-white shadow-md scale-105"
                    : "border-gray-300 text-gray-300 hover:border-green-400 hover:bg-green-50 hover:text-green-500"
                    }`}
                >
                  <CheckCircle2 size={20} strokeWidth={3} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Actions Footer - Tighter */}
        <div
          className="p-2.5 bg-gray-50 border-t-2 border-gray-100"
          onClick={(e) => e.stopPropagation()}
        >
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
