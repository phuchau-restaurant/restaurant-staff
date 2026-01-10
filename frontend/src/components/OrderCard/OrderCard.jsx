// src/components/OrderCard/OrderCard.jsx
import React, { useState } from "react";
import { Bell, Clock, User, AlertCircle, CheckCircle2 } from "lucide-react";
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

  // Status-based accent colors
  const getStatusColor = () => {
    switch (status) {
      case "new":
        return "border-blue-500 bg-blue-50";
      case "cooking":
        return "border-orange-500 bg-orange-50";
      case "late":
        return "border-red-500 bg-red-50";
      case "ready":
        return "border-green-500 bg-green-50";
      case "completed":
        return "border-gray-500 bg-gray-100 opacity-75";
      default:
        return "border-gray-200 bg-white";
    }
  };

  return (
    <>
      <div
        onClick={() => setShowDetailModal(true)}
        className={`group relative bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-2xl transition-all cursor-pointer flex flex-col h-full transform hover:-translate-y-1 ${
          viewMode === "list" ? "flex-row min-h-[140px]" : ""
        }`}
      >
        {/* Status Indicator Strip */}
        <div
          className={`absolute top-0 left-0 w-full h-1.5 ${statusConfig.color} z-10`}
        />

        {/* Header Section */}
        <div
          className={`p-4 border-b border-gray-100 ${
            viewMode === "list"
              ? "w-64 border-b-0 border-r bg-gray-50/50 flex flex-col justify-center"
              : "bg-gray-50/30"
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            {/* Order Number Badge */}
            <div
              className={`flex items-center justify-center w-12 h-12 rounded-xl text-white font-black text-xl shadow-md ${statusConfig.color}`}
            >
              #{order.orderNumber.toString().slice(-3)}
            </div>

            {/* Timer */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border font-bold text-sm ${
                elapsed >= 15
                  ? "bg-red-100 text-red-600 border-red-200 animate-pulse"
                  : "bg-white text-gray-600 border-gray-200"
              }`}
            >
              <Clock size={15} />
              <span>{elapsed}'</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-800 text-lg">
                Bàn {order.tableNumber}
              </span>
              <span className="text-xs font-medium text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200 shadow-sm">
                {order.items.length} món
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
              <User size={12} />
              <span className="truncate max-w-[120px]">
                {order.server || "Server"}
              </span>
              <span>•</span>
              <span>
                {new Date(order.orderTime).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 p-3 overflow-y-auto min-h-[120px] bg-white custom-scrollbar">
          <div className="space-y-3">
            {order.items.map((item, idx) => (
              <div
                key={item.id}
                className={`relative pl-3 ${
                  idx !== order.items.length - 1
                    ? "border-b border-gray-100 pb-3"
                    : ""
                }`}
              >
                {/* Status Line */}
                <div
                  className={`absolute left-0 top-1 bottom-1 w-1 rounded-full ${
                    item.completed ? "bg-green-500" : "bg-gray-200"
                  }`}
                />

                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2">
                      <span
                        className={`font-bold text-base ${
                          item.completed
                            ? "text-gray-400 line-through"
                            : "text-gray-800"
                        }`}
                      >
                        {item.name}
                      </span>
                      <span className="text-orange-600 font-bold text-lg whitespace-nowrap">
                        x{item.quantity}
                      </span>
                    </div>

                    {/* Modifiers */}
                    {item.modifiers && item.modifiers.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {item.modifiers.map((mod, mIdx) => (
                          <span
                            key={mIdx}
                            className="text-xs font-medium text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded"
                          >
                            + {mod.optionName}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Notes */}
                    {item.note && (
                      <p className="mt-1.5 text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded inline-block border border-red-100">
                        ⚠️ {item.note}
                      </p>
                    )}
                  </div>

                  {/* Quick Complete Action */}
                  {(status === "cooking" || status === "late") &&
                    !item.completed && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCompleteItem(order.id, item.id);
                        }}
                        className="p-1.5 text-gray-300 hover:text-green-500 hover:bg-green-50 rounded-full transition-colors"
                      >
                        <CheckCircle2 size={22} />
                      </button>
                    )}
                  {item.completed && (
                    <CheckCircle2 size={22} className="text-green-500 mt-1" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions Footer */}
        <div
          className={`p-3 bg-gray-50 border-t border-gray-100 ${
            viewMode === "list"
              ? "w-48 border-t-0 border-l flex flex-col justify-center"
              : ""
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <OrderActions
            status={status}
            orderId={order.id}
            handleStart={handleStart}
            handleComplete={handleComplete}
            handleCancel={handleCancel}
            handleRecall={handleRecall}
            viewMode={viewMode} // Pass viewMode to adjust button layout if needed
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
