// src/components/OrderCard/OrderCard.jsx
import React, { useState } from "react";
import { Clock, CheckCircle2, XCircle, StickyNote } from "lucide-react";
import { STATUS_CONFIG, STATUS_BADGE } from "../../constants/orderConstants";
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
  handleCancelItem,
  viewMode,
}) => {
  const [showDetailModal, setShowDetailModal] = useState(false);
  const status = getOrderStatus(order);
  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG["new"];
  // Use order.status directly from database for the badge display
  const dbStatus = order.status || "Pending";
  const statusBadge = STATUS_BADGE[dbStatus] || STATUS_BADGE["Pending"];
  const elapsed = getElapsedTime(order.orderTime);

  // Get prep time from order (in minutes) - use prepTimeOrder from API
  const prepTime = order.prepTimeOrder || order.prepTime;

  // Timer turns red when elapsed time exceeds prep time (only if prepTime is available)
  const isLate = prepTime ? elapsed >= prepTime : false;

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
                Đơn #{order.orderNumber}
              </span>
              <span className="text-gray-300">|</span>
              <span className="font-bold text-gray-700 text-lg">
                Bàn {order.tableNumber}
              </span>
            </div>

            {/* Timer Badge - Red when exceeds prep time */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-black text-sm ${isLate
                ? "bg-red-500 text-white shadow-lg"
                : "bg-gray-200 text-gray-600"
                }`}
            >
              <Clock size={14} strokeWidth={3} />
              <span>{elapsed}'{prepTime ? `/${prepTime}'` : ''}</span>
            </div>
          </div>

          {/* Status Badge */}
          <div className="mt-2">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${statusBadge.bgColor} ${statusBadge.textColor} ${statusBadge.borderColor}`}>
              {statusBadge.label}
            </span>
          </div>
        </div>

        {/* Items List - Better contrast */}
        <div className="flex-1 px-3 py-2 overflow-y-auto bg-white min-h-[160px]">
          <div className="space-y-0.5">
            {order.items.map((item, idx) => {
              // Determine item status
              const itemStatus = item.status || (item.completed ? "Ready" : item.cancelled ? "Cancelled" : "Pending");
              const isItemCompleted = item.completed || itemStatus === "Ready" || itemStatus === "Served";
              const isItemCancelled = item.cancelled || itemStatus === "Cancelled";
              
              return (
                <div
                  key={item.id || idx}
                  className={`flex items-start justify-between gap-3 p-3 rounded-lg transition-colors ${isItemCompleted ? "bg-green-50" : isItemCancelled ? "bg-gray-100" : "hover:bg-gray-50"
                    } ${idx !== order.items.length - 1 ? "border-b-2 border-gray-100" : ""}`}
                >
                  <div className="flex-1 min-w-0 space-y-1.5">
                    {/* Item Name with Quantity inline */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`font-bold text-xl ${isItemCompleted ? "text-gray-400 line-through" : isItemCancelled ? "text-gray-400 line-through" : "text-gray-900"
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

                    {/* Note - Yellow with StickyNote icon */}
                    {item.note && (
                      <div className="text-sm font-semibold text-amber-700 bg-amber-100 px-2 py-1 rounded-md inline-flex items-center gap-1.5">
                        <StickyNote size={14} />
                        {item.note}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1.5 flex-shrink-0 mt-1">
                    {/* Complete Button */}
                    {!isItemCompleted && !isItemCancelled && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCompleteItem(order.id, item.id);
                        }}
                        className="w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all border-green-400 text-green-500 hover:bg-green-50 hover:border-green-500 hover:text-green-600"
                        title="Hoàn thành món"
                      >
                        <CheckCircle2 size={18} strokeWidth={2.5} />
                      </button>
                    )}
                    
                    {/* Cancel Button */}
                    {!isItemCompleted && !isItemCancelled && handleCancelItem && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancelItem(order.id, item.id);
                        }}
                        className="w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all border-red-400 text-red-500 hover:bg-red-50 hover:border-red-500 hover:text-red-600"
                        title="Hủy món"
                      >
                        <XCircle size={18} strokeWidth={2.5} />
                      </button>
                    )}

                    {/* Completed indicator */}
                    {isItemCompleted && (
                      <div className="w-9 h-9 rounded-full flex items-center justify-center bg-green-500 text-white shadow-md">
                        <CheckCircle2 size={18} strokeWidth={2.5} />
                      </div>
                    )}
                    
                    {/* Cancelled indicator */}
                    {isItemCancelled && (
                      <div className="w-9 h-9 rounded-full flex items-center justify-center bg-gray-400 text-white">
                        <XCircle size={18} strokeWidth={2.5} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
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
          handleCancelItem={handleCancelItem}
        />
      )}
    </>
  );
};

export default OrderCard;
