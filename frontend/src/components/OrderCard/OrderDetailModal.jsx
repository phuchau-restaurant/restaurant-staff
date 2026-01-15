// src/components/OrderCard/OrderDetailModal.jsx
import React, { useState, useEffect, useRef } from "react";
import { ChefHat, X, User, CheckCircle2, Clock, XCircle, StickyNote } from "lucide-react";
import OrderActions from "./OrderActions";
import { STATUS_BADGE, ORDER_DETAIL_STATUS_COLORS, ORDER_DETAIL_STATUS_LABELS } from "../../constants/orderConstants";

const OrderDetailModal = ({
  order,
  status,
  statusConfig,
  elapsed,
  onClose,
  handleConfirmOrder,
  handleComplete,
  handleCancel,
  handleRecall,
  handleCompleteItem,
  handleCancelItem,
}) => {
  // Get database status badge for the order
  const dbStatus = order.dbStatus || order.status || "Pending";
  const orderStatusBadge = STATUS_BADGE[dbStatus] || STATUS_BADGE["Pending"];

  // Get prep time from order
  const prepTime = order.prepTimeOrder || order.prepTime;
  const isLate = prepTime ? elapsed >= prepTime : false;

  // Drag & resize state
  const modalRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [modalPos, setModalPos] = useState({
    x: window.innerWidth / 2 - 640,
    y: window.innerHeight / 2 - 400,
  });
  const [modalSize, setModalSize] = useState({ width: 1280, height: 800 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({
    x: 0,
    y: 0,
    width: 1280,
    height: 800,
  });

  // Drag handlers
  const onDragStart = (e) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - modalPos.x,
      y: e.clientY - modalPos.y,
    });
  };
  const onDrag = (e) => {
    if (!isDragging) return;
    setModalPos({
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y,
    });
  };
  const onDragEnd = () => setIsDragging(false);

  // Resize handlers
  const onResizeStart = (e) => {
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: modalSize.width,
      height: modalSize.height,
    });
    e.stopPropagation();
  };
  const onResize = (e) => {
    if (!isResizing) return;
    setModalSize({
      width: Math.max(800, resizeStart.width + (e.clientX - resizeStart.x)),
      height: Math.max(600, resizeStart.height + (e.clientY - resizeStart.y)),
    });
  };
  const onResizeEnd = () => setIsResizing(false);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", onDrag);
      window.addEventListener("mouseup", onDragEnd);
    } else {
      window.removeEventListener("mousemove", onDrag);
      window.removeEventListener("mouseup", onDragEnd);
    }
    return () => {
      window.removeEventListener("mousemove", onDrag);
      window.removeEventListener("mouseup", onDragEnd);
    };
  }, [isDragging, dragOffset, modalPos]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", onResize);
      window.addEventListener("mouseup", onResizeEnd);
    } else {
      window.removeEventListener("mousemove", onResize);
      window.removeEventListener("mouseup", onResizeEnd);
    }
    return () => {
      window.removeEventListener("mousemove", onResize);
      window.removeEventListener("mouseup", onResizeEnd);
    };
  }, [isResizing, resizeStart, modalSize]);

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-40 p-4"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        style={{
          position: "absolute",
          left: modalPos.x,
          top: modalPos.y,
          width: modalSize.width,
          height: modalSize.height,
          minWidth: 800,
          minHeight: 600,
          maxWidth: "100vw",
          maxHeight: "100vh",
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          background: "white",
          borderRadius: 16,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
        className="shadow-2xl border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header - Draggable */}
        <div
          className="cursor-move bg-white border-b border-gray-100 p-6 flex items-center justify-between shrink-0"
          onMouseDown={onDragStart}
          style={{ userSelect: "none" }}
        >
          <div className="flex items-center gap-6">
            <div
              className={`p-2 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg ${statusConfig.color}`}
            >
              Mã Đơn #{order.orderNumber}
            </div>

            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-2xl font-bold text-gray-900">
                  Bàn {order.tableNumber}
                </h2>
                {/* Order Status Badge from Database */}
                <span
                  className={`px-3 py-1 rounded-full text-sm font-bold border ${orderStatusBadge.borderColor} ${orderStatusBadge.textColor} ${orderStatusBadge.bgColor}`}
                >
                  {orderStatusBadge.label}
                </span>
              </div>
              <div className="flex items-center gap-4 text-gray-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <Clock size={16} />
                  <span>{prepTime ? `${prepTime}'` : '--'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <User size={16} />
                  <span>{order.server || "Nhân viên"}</span>
                </div>
                <span>•</span>
                <span>
                  {new Date(order.orderTime).toLocaleTimeString("vi-VN")}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={28} />
          </button>
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
              {order.items.map((item, index) => {
                // Get item status for display - OrderDetail status: Pending, Ready, Served, Cancelled
                const itemStatus = item.status || (item.completed ? "Ready" : item.cancelled ? "Cancelled" : "Pending");
                const isItemCompleted = item.completed || itemStatus === "Ready" || itemStatus === "Served";
                const isItemCancelled = item.cancelled || itemStatus === "Cancelled";
                const statusColorClass = ORDER_DETAIL_STATUS_COLORS[itemStatus] || "bg-yellow-100 text-yellow-700";
                const statusLabel = ORDER_DETAIL_STATUS_LABELS[itemStatus] || itemStatus;

                return (
                  <div
                    key={item.id}
                    className={`p-4 flex gap-4 transition-colors hover:bg-gray-50 ${isItemCompleted ? "bg-green-50/50" : isItemCancelled ? "bg-gray-100/50" : ""
                      }`}
                  >
                    {/* Item Index - Before Image */}
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-500 text-white font-bold text-sm shrink-0 mt-6">
                      {index + 1}
                    </div>

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
                        <div className="flex-1">
                          {/* Item Name with Quantity and Status inline - matching card/list view */}
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h4
                              className={`text-xl font-bold ${isItemCompleted
                                ? "text-gray-400 line-through"
                                : isItemCancelled
                                  ? "text-gray-400 line-through"
                                  : "text-gray-800"
                                }`}
                            >
                              {item.name}
                            </h4>
                            <span className="text-xl font-black text-orange-500">
                              x{item.quantity}
                            </span>
                            {/* Item Status Badge - matching card/list view */}
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${statusColorClass}`}>
                              {statusLabel}
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {/* Complete Button - Only show when kitchen has claimed the order (not Approved status) */}
                          {!isItemCompleted && !isItemCancelled && order.dbStatus !== "Approved" && (
                            <button
                              onClick={() => handleCompleteItem(order.id, item.id)}
                              className="w-10 h-10 rounded-full flex items-center justify-center transition-all bg-green-50 border-2 border-green-500 text-green-600 hover:bg-green-100 scale-100 hover:scale-110 active:scale-95"
                              title="Hoàn thành món"
                            >
                              <CheckCircle2 size={20} strokeWidth={2.5} />
                            </button>
                          )}

                          {/* Cancel Button - Always show when item is not complete/cancelled */}
                          {!isItemCompleted && !isItemCancelled && handleCancelItem && (
                            <button
                              onClick={() => handleCancelItem(order.id, item.id)}
                              className="w-10 h-10 rounded-full flex items-center justify-center transition-all bg-red-50 border-2 border-red-500 text-red-600 hover:bg-red-100 scale-100 hover:scale-110 active:scale-95"
                              title="Hủy món"
                            >
                              <XCircle size={20} strokeWidth={2.5} />
                            </button>
                          )}
                        </div>

                        {/* Status indicator for completed items */}
                        {isItemCompleted && (
                          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-500 text-white">
                            <CheckCircle2 size={20} strokeWidth={2.5} />
                          </div>
                        )}

                        {/* Status indicator for cancelled items */}
                        {isItemCancelled && (
                          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-400 text-white">
                            <XCircle size={20} strokeWidth={2.5} />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Modifiers Grid - matching card/list view style */}
                    {item.modifiers && item.modifiers.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {item.modifiers.map((mod, idx) => (
                          <span
                            key={idx}
                            className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-md"
                          >
                            + {mod.optionName}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Notes - Yellow with StickyNote icon */}
                    {item.note && (
                      <div className="text-sm font-semibold text-amber-700 bg-amber-100 px-2 py-1 rounded-md inline-flex items-center gap-1.5">
                        <StickyNote size={14} />
                        {item.note}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer - Actions */}
        <div className="p-6 bg-white border-t border-gray-100 shrink-0">
          <OrderActions
            status={status}
            dbStatus={dbStatus}
            orderId={order.id}
            handleConfirmOrder={handleConfirmOrder}
            handleComplete={handleComplete}
            handleCancel={handleCancel}
            handleRecall={handleRecall}
            viewMode="modal" // Special mode for large buttons
          />
        </div>

        {/* Resize handle */}
        <div
          onMouseDown={onResizeStart}
          className="absolute right-0 bottom-0 w-6 h-6 cursor-nwse-resize z-20 flex items-end justify-end"
          style={{ userSelect: "none" }}
        >
          <div className="w-4 h-4 bg-gray-200 rounded-br-2xl border-r-2 border-b-2 border-gray-400" />
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;

