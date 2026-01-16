import React, { useState } from "react";
import {
  Clock,
  AlertCircle,
  CheckCircle2,
  X,
  Check,
  Utensils,
  ChevronRight,
  CreditCard,
} from "lucide-react";
import { STATUS_BADGE } from "../../constants/orderConstants";
import AlertModal from "../Modal/AlertModal";
import { useAlert } from "../../hooks/useAlert";

const WaiterOrderCard = ({
  order,
  currentTime,
  getElapsedTime,
  getOrderStatus,
  showClaimButton = false, // True = tab "Đơn mới" (chưa nhận)
  onClaimOrder,
  onCancelItem,
  onConfirmItem,
  onServeItem, // Handler để đánh dấu đã phục vụ
  onPayment, // Handler để thanh toán
}) => {
  const { alert, showSuccess, showWarning, closeAlert } = useAlert();
  const [showDetail, setShowDetail] = useState(false);
  const elapsed = getElapsedTime(order.orderTime);

  // Get prep time from order
  const prepTime = order.prepTimeOrder || 15;

  // Timer turns red when elapsed time exceeds prep time
  const isLate = elapsed >= prepTime;

  // Đây là đơn đã được nhận (có waiterId)
  const isClaimedOrder = !!order.waiterId;

  // Tính số món đã hoàn thành (Ready hoặc Served)
  const readyCount = order.items?.filter((item) => item.status === "Ready").length || 0;
  const servedCount = order.items?.filter((item) => item.status === "Served").length || 0;
  const cancelledCount = order.items?.filter((item) => item.status === "Cancelled").length || 0;
  const pendingCount = order.items?.filter((item) => item.status === "Pending").length || 0;
  const totalCount = order.items?.length || 0;

  // Handle cancel item
  const handleCancelItem = (e, item) => {
    e.stopPropagation();
    if (onCancelItem) {
      onCancelItem(order.id, item.id);
      showWarning(`Đã hủy món: ${item.name}`);
    }
  };

  // Handle confirm item (chuyển sang Pending)
  const handleConfirmItem = (e, item) => {
    e.stopPropagation();
    if (onConfirmItem) {
      onConfirmItem(order.id, item.id);
      showSuccess(`Đã xác nhận món: ${item.name}`);
    }
  };

  // Handle serve item (chuyển từ Ready sang Served)
  const handleServeItem = (e, item) => {
    e.stopPropagation();
    if (onServeItem) {
      onServeItem(order.id, item.id);
      showSuccess(`Đã phục vụ món: ${item.name}`);
    }
  };

  // Get status color for item
  const getItemStatusStyle = (item) => {
    switch (item.status) {
      case "Cancelled":
        return { bg: "bg-red-50", border: "border-red-100", text: "text-red-600", badge: "bg-red-100 text-red-700" };
      case "Served":
        return { bg: "bg-purple-50", border: "border-purple-100", text: "text-purple-600", badge: "bg-purple-100 text-purple-700" };
      case "Ready":
        return { bg: "bg-green-50", border: "border-green-100", text: "text-green-600", badge: "bg-green-100 text-green-700" };
      case "Pending":
      case "Preparing":
        return { bg: "bg-blue-50", border: "border-blue-100", text: "text-blue-600", badge: "bg-blue-100 text-blue-700" };
      default:
        // Chờ xác nhận (Unsubmit/Unconfirmed) -> Màu xám
        return { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-500", badge: "bg-gray-100 text-gray-600" };
    }
  };

  // Get status label
  const getItemStatusLabel = (item) => {
    switch (item.status) {
      case "Cancelled": return "Đã hủy";
      case "Served": return "Đã phục vụ";
      case "Ready": return "Sẵn sàng";
      case "Pending": return "Chờ bếp";
      case "Preparing": return "Đang nấu";
      default: return "Chờ xác nhận";
    }
  };

  // Get status color for item
  const getItemStatusColor = (item) => {
    if (item.status === "Cancelled") return "bg-red-100 border-red-200";
    if (item.status === "Served") return "bg-purple-100 border-purple-200";
    if (item.status === "Ready") return "bg-green-100 border-green-200";
    if (item.status === "Pending") return "bg-blue-100 border-blue-200";
    return "bg-gray-100 border-gray-200";
  };

  // Get status text color
  const getItemStatusTextColor = (item) => {
    if (item.status === "Cancelled") return "text-red-600";
    if (item.status === "Served") return "text-purple-600";
    if (item.status === "Ready") return "text-green-600";
    if (item.status === "Pending") return "text-blue-600";
    return "text-gray-600";
  };

  return (
    <>
      <div
        onClick={() => setShowDetail(true)}
        className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer flex flex-col h-full border border-gray-100"
      >
        {/* Header - Table Number & Timer */}
        <div className="p-3 sm:p-4 border-b border-gray-100">
          <div className="flex items-start justify-between gap-2 sm:gap-3">
            {/* Table Info - Left */}
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight leading-tight">
                {order.tableNumber}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Đơn #{order.orderNumber}
              </p>
            </div>

            {/* Timer Badge - Prep Time Only */}
            <div
              className="flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-3 sm:py-2 rounded-lg font-bold text-xs sm:text-sm transition-colors bg-gray-100 text-gray-600"
            >
              <Clock size={14} className="sm:hidden" strokeWidth={2.5} />
              <Clock size={16} className="hidden sm:block" strokeWidth={2.5} />
              <span>{prepTime ? `${prepTime}'` : '--'}</span>
            </div>
          </div>

          {/* Status summary */}
          {isClaimedOrder && (
            <div className="flex items-center gap-2 mt-2 sm:mt-3 flex-wrap">
              {/* Custom Waiter Status Badge */}
              {(() => {
                const WAITER_STATUS_CONFIG = {
                  Approved: { label: "Chờ bếp xác nhận", className: "bg-blue-100 text-blue-700 border-blue-200" },
                  Pending: { label: "Đang chuẩn bị", className: "bg-orange-100 text-orange-700 border-orange-200" },
                  Completed: { label: "Hoàn thành", className: "bg-green-100 text-green-700 border-green-200" }, // Ready to serve
                  Served: { label: "Đã phục vụ", className: "bg-purple-100 text-purple-700 border-purple-200" },
                  Paid: { label: "Đã thanh toán", className: "bg-teal-100 text-teal-700 border-teal-200" },
                  Cancelled: { label: "Đã hủy", className: "bg-gray-100 text-gray-500 border-gray-200" },
                  Unsubmit: { label: "Chưa gửi", className: "bg-gray-100 text-gray-500 border-gray-200" }
                };

                const config = WAITER_STATUS_CONFIG[order.status] || { label: order.status, className: "bg-gray-100 text-gray-600" };

                return (
                  <span className={`text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap border ${config.className}`}>
                    {config.label}
                  </span>
                );
              })()}
            </div>
          )}
        </div>

        {/* Items List */}
        <div className="flex-1 p-2 sm:p-3 overflow-y-auto max-h-[220px] sm:max-h-[280px]">
          <div className="space-y-1.5 sm:space-y-2">
            {order.items?.slice(0, 5).map((item, itemIndex) => {
              const style = getItemStatusStyle(item);
              return (
                <div
                  key={`${order.id}-item-${item.id || itemIndex}`}
                  className={`p-2 sm:p-3 rounded-lg ${style.bg} ${style.border} border`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      {/* Item name and quantity */}
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-[17px] text-gray-800 ${item.status === "Cancelled" || item.status === "Served" ? "line-through opacity-60" : ""}`}>
                          {item.name}
                        </span>
                        <span className="text-[15px] font-black text-orange-600">
                          x{item.quantity}
                        </span>
                      </div>

                      {/* Modifiers */}
                      {item.modifiers && item.modifiers.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.modifiers.map((mod, idx) => (
                            <span
                              key={`${item.id}-mod-${mod.id || mod.optionName}-${idx}`}
                              className="text-[10px] sm:text-xs text-gray-600 bg-white/80 px-1.5 py-0.5 rounded border border-gray-200"
                            >
                              + {mod.optionName}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Note */}
                      {item.note && (
                        <p className="text-[10px] sm:text-xs text-amber-700 font-medium mt-1 bg-amber-50 px-1.5 py-0.5 rounded inline-block">
                          📝 {item.note}
                        </p>
                      )}
                    </div>

                    {/* Status Badge */}
                    <span className={`text-[12px] sm:text-[14px] font-semibold px-1.5 py-0.5 rounded ${style.badge} flex-shrink-0`}>
                      {getItemStatusLabel(item)}
                    </span>
                  </div>

                  {/* Action buttons for New Orders (Confirm/Cancel) */}
                  {showClaimButton && item.status !== "Cancelled" && item.status !== "Pending" && item.status !== "Ready" && item.status !== "Served" && (
                    <div className="flex gap-1.5 sm:gap-2 mt-2">
                      <button
                        onClick={(e) => handleConfirmItem(e, item)}
                        className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 border-2 border-green-600 rounded-lg text-xs font-bold transition-colors"
                      >
                        <Check size={12} className="sm:w-3.5 sm:h-3.5" /> Xác nhận
                      </button>
                      <button
                        onClick={(e) => handleCancelItem(e, item)}
                        className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border-2 border-red-600 rounded-lg text-xs font-bold transition-colors"
                      >
                        <X size={12} className="sm:w-3.5 sm:h-3.5" /> Hủy
                      </button>
                    </div>
                  )}

                  {/* Action buttons for Ready items */}
                  {isClaimedOrder && item.status === "Ready" && onServeItem && (
                    <button
                      onClick={(e) => handleServeItem(e, item)}
                      className="w-full mt-2 flex items-center justify-center gap-1 px-2 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border-2 border-purple-600 rounded-lg text-xs sm:text-sm font-semibold transition-colors"
                    >
                      <Utensils size={12} className="sm:w-3.5 sm:h-3.5" />
                      Phục vụ
                    </button>
                  )}
                </div>
              );
            })}

            {/* Show more indicator */}
            {order.items?.length > 5 && (
              <div className="text-center text-xs sm:text-sm text-gray-500 py-1 sm:py-2">
                +{order.items.length - 5} món khác
              </div>
            )}

            {(!order.items || order.items.length === 0) && (
              <div className="text-center text-gray-400 py-4 sm:py-6">
                <p className="text-xs sm:text-sm">Chưa có món ăn</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Footer */}
        {showClaimButton && onClaimOrder && (
          <div className="p-2 sm:p-3 border-t border-gray-100">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClaimOrder(order.id);
              }}
              className="w-full flex items-center justify-center gap-2 bg-orange-50 hover:bg-orange-100 text-orange-700 border-2 border-orange-600 px-3 py-2 sm:px-4 sm:py-3 rounded-lg font-bold text-sm sm:text-base shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
            >
              <Check size={16} className="sm:w-5 sm:h-5" strokeWidth={2.5} />
              Nhận đơn
            </button>
          </div>
        )}

        {/* View detail footer for claimed orders */}
        {isClaimedOrder && order.status !== "Served" && (
          <div className="px-3 py-2 sm:px-4 sm:py-3 border-t border-gray-100 flex items-center justify-between text-xs sm:text-sm text-gray-500 hover:bg-gray-50 transition-colors">
            <span>Xem chi tiết</span>
            <ChevronRight size={14} className="sm:w-4 sm:h-4" />
          </div>
        )}

        {/* Payment button for Served orders */}
        {isClaimedOrder && order.status === "Served" && onPayment && (
          <div className="p-2 sm:p-3 border-t border-gray-100">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPayment(order.id);
              }}
              className="w-full flex items-center justify-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 border-2 border-green-600 px-3 py-2 sm:px-4 sm:py-3 rounded-lg font-bold text-sm sm:text-base shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
            >
              <CreditCard size={16} className="sm:w-5 sm:h-5" strokeWidth={2.5} />
              Thanh toán
            </button>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetail && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4"
          onClick={() => setShowDetail(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gray-50 p-6 border-b border-gray-200 sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">
                    {order.tableNumber}
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">
                    Đơn #{order.orderNumber} • {elapsed} phút
                  </p>
                </div>
                <button
                  onClick={() => setShowDetail(false)}
                  className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
                >
                  <X size={20} className="sm:w-6 sm:h-6 text-gray-500" />
                </button>
              </div>

              {/* Timer in modal - Prep Time Only */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg mt-2 font-semibold text-sm bg-gray-200 text-gray-700">
                <Clock size={16} />
                <span>{prepTime ? `${prepTime}'` : '--'}</span>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-gray-800">
                  Chi tiết món ăn
                </h3>
                <div className="text-sm text-gray-500">
                  {readyCount > 0 && <span className="text-green-600 font-medium">{readyCount} sẵn sàng</span>}
                  {servedCount > 0 && <span className="ml-2 text-gray-600">{servedCount} đã phục vụ</span>}
                  {cancelledCount > 0 && <span className="ml-2 text-red-600">{cancelledCount} đã hủy</span>}
                </div>
              </div>

              <div className="space-y-2 sm:space-y-3">
                {order.items?.map((item, itemIndex) => {
                  const style = getItemStatusStyle(item);
                  return (
                    <div
                      key={`${order.id}-detail-item-${item.id || itemIndex}`}
                      className={`p-3 sm:p-4 rounded-xl ${style.bg} ${style.border} border-2`}
                    >
                      <div className="flex items-start justify-between gap-3 sm:gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h4 className={`text-[20px] font-bold text-gray-800 ${item.status === "Cancelled" ? "line-through opacity-60" : ""}`}>
                              {item.name}
                            </h4>
                            <span className="text-[20px] font-black text-orange-600">
                              ×{item.quantity}
                            </span>
                            <span className={`px-2.5 py-1 rounded-lg text-[13px] font-semibold ${style.badge}`}>
                              {getItemStatusLabel(item)}
                            </span>
                          </div>

                          {/* Price */}
                          <div className="mb-2">
                            <span className="text-gray-600 text-[15px]">
                              Đơn giá: <span className="font-bold text-lg text-gray-800">{item.unitPrice?.toLocaleString('vi-VN')}đ</span>
                            </span>
                          </div>

                          {/* Modifiers */}
                          {item.modifiers && item.modifiers.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                              {item.modifiers.map((mod, idx) => (
                                <span
                                  key={`${item.id}-detail-mod-${mod.id || mod.optionName}-${idx}`}
                                  className="text-xs sm:text-sm bg-white text-gray-700 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full border border-gray-200"
                                >
                                  + {mod.optionName}{mod.price > 0 ? ` (+${mod.price.toLocaleString('vi-VN')}đ)` : ''}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Note */}
                          {item.note && (
                            <p className="text-amber-700 text-sm font-medium bg-amber-50 px-2 py-1 rounded-lg inline-block">
                              📝 {item.note}
                            </p>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-1.5 sm:gap-2">
                          {/* Serve button for Ready items */}
                          {isClaimedOrder && item.status === "Ready" && onServeItem && (
                            <button
                              onClick={(e) => handleServeItem(e, item)}
                              className="flex items-center gap-1.5 sm:gap-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border-2 border-purple-600 px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg text-xs sm:text-base font-semibold transition-colors"
                            >
                              <Utensils size={14} className="sm:w-4 sm:h-4" /> Phục vụ
                            </button>
                          )}

                          {/* Cancel button for Pending items */}
                          {isClaimedOrder && item.status === "Pending" && (
                            <button
                              onClick={(e) => handleCancelItem(e, item)}
                              className="flex items-center gap-1.5 sm:gap-2 bg-red-50 hover:bg-red-100 text-red-700 border-2 border-red-600 px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg text-xs sm:text-base font-semibold transition-colors"
                            >
                              <X size={14} className="sm:w-4 sm:h-4" /> Hủy món
                            </button>
                          )}

                          {/* Confirm/Cancel for new orders */}
                          {showClaimButton && item.status !== "Cancelled" && item.status !== "Pending" && item.status !== "Ready" && item.status !== "Served" && (
                            <>
                              <button
                                onClick={(e) => handleConfirmItem(e, item)}
                                className="flex items-center gap-1.5 sm:gap-2 bg-green-50 hover:bg-green-100 text-green-700 border-2 border-green-600 px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg text-xs sm:text-base font-semibold transition-colors"
                              >
                                <Check size={14} className="sm:w-4 sm:h-4" /> Xác nhận
                              </button>
                              <button
                                onClick={(e) => handleCancelItem(e, item)}
                                className="flex items-center gap-1.5 sm:gap-2 bg-red-50 hover:bg-red-100 text-red-700 border-2 border-red-600 px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg text-xs sm:text-base font-semibold transition-colors"
                              >
                                <X size={14} className="sm:w-4 sm:h-4" /> Hủy
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Total Price */}
                      <div className="flex justify-end pt-2 mt-2 border-t border-dashed border-gray-200">
                        <span className="text-green-600 font-bold text-lg">
                          Thành tiền: {(
                            ((item.unitPrice || 0) + (item.modifiers || []).reduce((sum, mod) => sum + (mod.price || 0), 0)) * (item.quantity || 1)
                          ).toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer - Claim button */}
            {showClaimButton && onClaimOrder && (
              <div className="p-3 sm:p-5 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => {
                    onClaimOrder(order.id);
                    setShowDetail(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-orange-50 hover:bg-orange-100 text-orange-700 border-2 border-orange-600 px-4 py-3 sm:px-6 sm:py-4 rounded-xl font-bold text-base sm:text-lg shadow-lg transition-all hover:shadow-xl active:scale-[0.98]"
                >
                  <Check size={20} className="sm:w-6 sm:h-6" strokeWidth={2.5} />
                  Nhận đơn này
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Alert Modal */}
      <AlertModal
        isOpen={alert.isOpen}
        onClose={closeAlert}
        title={alert.title}
        message={alert.message}
        type={alert.type}
      />
    </>
  );
};

export default WaiterOrderCard;

