// src/components/OrderCard/OrderDetailModal.jsx
import React from "react";
import { ChefHat, X, User, CheckCircle2, Clock, Printer } from "lucide-react";
import OrderActions from "./OrderActions";

const OrderDetailModal = ({
  order,
  status,
  statusConfig,
  elapsed,
  onClose,
  handleStart,
  handleComplete,
  handleCancel,
  handleRecall,
  handleCompleteItem,
}) => {
  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-white border-b border-gray-100 p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-6">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-lg ${statusConfig.color}`}
            >
              #{order.orderNumber}
            </div>

            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-2xl font-bold text-gray-900">
                  Bàn {order.tableNumber}
                </h2>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-bold border ${statusConfig.borderColor} ${statusConfig.textColor} bg-opacity-10`}
                >
                  {statusConfig.label}
                </span>
              </div>
              <div className="flex items-center gap-4 text-gray-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <Clock size={16} />
                  <span
                    className={elapsed >= 15 ? "text-red-500 font-bold" : ""}
                  >
                    {elapsed} phút
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <User size={16} />
                  <span>{order.server}</span>
                </div>
                <span>•</span>
                <span>
                  {new Date(order.orderTime).toLocaleTimeString("vi-VN")}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
              <Printer size={24} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={28} />
            </button>
          </div>
        </div>

        {/* Modal Content - Scrollable */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 bg-gray-50/50 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-bold text-gray-700 flex items-center gap-2">
                <span className="w-2 h-6 bg-orange-500 rounded-full inline-block"></span>
                Danh sách món ăn ({order.items.length})
              </h3>
            </div>

            <div className="divide-y divide-gray-100">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 flex gap-4 transition-colors hover:bg-gray-50 ${
                    item.completed ? "bg-green-50/50" : ""
                  }`}
                >
                  {/* Item Image */}
                  <div className="w-20 h-20 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-100">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <ChefHat size={24} />
                      </div>
                    )}
                  </div>

                  {/* Item Details */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h4
                        className={`text-xl font-bold ${
                          item.completed
                            ? "text-gray-400 line-through"
                            : "text-gray-800"
                        }`}
                      >
                        {item.name}
                      </h4>
                      <div className="flex items-center gap-4">
                        <span className="text-2xl font-black text-orange-500">
                          x{item.quantity}
                        </span>

                        {/* Check Button for Individual Item */}
                        {(status === "cooking" || status === "late") && (
                          <button
                            onClick={() =>
                              handleCompleteItem(order.id, item.id)
                            }
                            disabled={item.completed}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                              item.completed
                                ? "bg-green-500 text-white shadow-none"
                                : "bg-white border-2 border-gray-200 text-gray-300 hover:border-green-500 hover:text-green-500 scale-100 hover:scale-110 active:scale-95"
                            }`}
                          >
                            <CheckCircle2
                              size={item.completed ? 20 : 24}
                              strokeWidth={3}
                            />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Modifiers Grid */}
                    {item.modifiers && item.modifiers.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {item.modifiers.map((mod, idx) => (
                          <span
                            key={idx}
                            className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm font-medium border border-gray-200"
                          >
                            + {mod.optionName}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Notes */}
                    {item.note && (
                      <div className="inline-flex items-start gap-2 bg-red-50 text-red-600 px-3 py-2 rounded-lg border border-red-100 max-w-full">
                        <span className="text-lg">📝</span>
                        <span className="font-semibold">{item.note}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer - Actions */}
        <div className="p-6 bg-white border-t border-gray-100 shrink-0">
          <OrderActions
            status={status}
            orderId={order.id}
            handleStart={handleStart}
            handleComplete={handleComplete}
            handleCancel={handleCancel}
            handleRecall={handleRecall}
            viewMode="modal" // Special mode for large buttons
          />
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
