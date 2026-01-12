import React, { useState } from "react";
import {
  Bell,
  Clock,
  AlertCircle,
  CheckCircle2,
  Hand,
  X,
  Check,
  Utensils,
} from "lucide-react";
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
}) => {
  const { alert, showSuccess, showWarning, closeAlert } = useAlert();
  const [showDetail, setShowDetail] = useState(false);
  const elapsed = getElapsedTime(order.orderTime);

  // Đây là đơn đã được nhận (có waiterId)
  const isClaimedOrder = !!order.waiterId;

  // Tính số món đã hoàn thành (Ready hoặc Served)
  const readyCount = order.items?.filter((item) => item.status === "Ready").length || 0;
  const servedCount = order.items?.filter((item) => item.status === "Served").length || 0;
  const cancelledCount = order.items?.filter((item) => item.status === "Cancelled").length || 0;
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

  // Get status label
  const getItemStatusLabel = (item) => {
    if (item.status === "Cancelled") return "Đã hủy";
    if (item.status === "Served") return "Đã phục vụ";
    if (item.status === "Ready") return "Sẵn sàng";
    if (item.status === "Pending") return "Đang chờ bếp";
    if (item.status === "Preparing") return "Đang nấu";
    return "Chưa xác nhận";
  };

  return (
    <>
      <div
        onClick={() => setShowDetail(true)}
        className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all cursor-pointer flex flex-col h-full"
      >
        {/* Header */}
        <div className="bg-linear-to-br from-gray-50 to-white p-4 border-b-2 border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg shadow-sm ${isClaimedOrder ? 'bg-linear-to-br from-blue-400 to-blue-500' : 'bg-linear-to-br from-orange-400 to-orange-500'}`}>
                <Bell size={20} className="text-white" />
              </div>
              <div>
                <span className="font-black text-xl text-gray-800">
                  #{order.orderNumber}
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-4 py-1.5 rounded-lg text-sm font-bold text-white shadow-md transition-all ${isClaimedOrder ? 'bg-linear-to-r from-blue-500 to-blue-600' : 'bg-linear-to-r from-orange-500 to-orange-600'}`}>
                    Bàn {order.tableNumber}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${elapsed >= 10
              ? "bg-red-50 border-red-200 text-red-600"
              : "bg-white border-gray-200 text-gray-700"
              }`}>
              <Clock size={16} className={elapsed >= 10 ? "text-red-600" : "text-gray-500"} />
              <span className="font-bold text-sm">
                {elapsed} phút
              </span>
              {elapsed >= 10 && (
                <AlertCircle size={16} className="text-red-600" />
              )}
            </div>

            {/* Claim Button - chỉ hiện ở tab Đơn mới */}
            {showClaimButton && onClaimOrder && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClaimOrder(order.id);
                }}
                className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-md transition-all hover:scale-105"
              >
                Nhận đơn
              </button>
            )}
          </div>

          {isClaimedOrder && (
            <div className="mt-3 flex items-center gap-2 text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
              <CheckCircle2 size={14} />
              <span className="font-bold">Đang phục vụ bởi bạn</span>
            </div>
          )}
        </div>

        {/* Content - Danh sách món */}
        <div className="p-4 flex-1 flex flex-col">
          <div className="flex-1 max-h-[300px] overflow-y-auto">
            <div className="space-y-3">
              {order.items?.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-lg border-2 ${getItemStatusColor(item)}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-800 text-sm truncate">
                          {item.name}
                        </h3>
                        <span className="bg-orange-500 text-white px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0">
                          x{item.quantity}
                        </span>
                      </div>

                      {/* Modifiers */}
                      {item.modifiers && item.modifiers.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.modifiers.map((mod, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full"
                            >
                              {mod.optionName}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Note */}
                      {item.note && (
                        <p className="text-red-600 text-xs font-semibold mt-1 italic">
                          📝 {item.note}
                        </p>
                      )}
                    </div>

                    {/* Status & Actions */}
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-xs font-bold ${getItemStatusTextColor(item)}`}>
                        {getItemStatusLabel(item)}
                      </span>

                      {/* Nút Phục vụ - CHỈ hiện cho món Ready ở đơn đã nhận */}
                      {isClaimedOrder && item.status === "Ready" && onServeItem && (
                        <button
                          onClick={(e) => handleServeItem(e, item)}
                          className="flex items-center gap-1 px-2 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded text-xs font-bold transition-colors mt-1"
                          title="Phục vụ món"
                        >
                          <Utensils size={12} />
                          Phục vụ
                        </button>
                      )}

                      {/* Nút Hủy - cho món Pending ở đơn đã nhận */}
                      {isClaimedOrder && item.status === "Pending" && (
                        <button
                          onClick={(e) => handleCancelItem(e, item)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-bold transition-colors mt-1"
                          title="Hủy món"
                        >
                          Hủy
                        </button>
                      )}

                      {/* Nút Xác nhận/Hủy - CHỈ hiện ở đơn chưa nhận (tab Đơn mới) */}
                      {showClaimButton && item.status !== "Cancelled" && item.status !== "Pending" && item.status !== "Ready" && item.status !== "Served" && (
                        <div className="flex gap-1 mt-1">
                          <button
                            onClick={(e) => handleConfirmItem(e, item)}
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-bold transition-colors"
                            title="Xác nhận món"
                          >
                            Xác nhận
                          </button>
                          <button
                            onClick={(e) => handleCancelItem(e, item)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-bold transition-colors"
                            title="Hủy món"
                          >
                            Hủy
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {(!order.items || order.items.length === 0) && (
                <div className="text-center text-gray-400 py-4">
                  <p className="text-sm">Chưa có món ăn</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetail && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-100 p-4"
          onClick={() => setShowDetail(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-linear-to-br from-gray-50 to-white p-6 border-b-2 border-gray-200 sticky top-0 z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl shadow-md ${isClaimedOrder ? 'bg-linear-to-br from-blue-400 to-blue-500' : 'bg-linear-to-br from-orange-400 to-orange-500'}`}>
                    <Bell size={32} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800">
                      Đơn #{order.orderNumber}
                    </h2>
                    <p className="text-gray-600">
                      Bàn {order.tableNumber} • {elapsed} phút • {order.status}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetail(false)}
                  className="text-4xl text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Chi tiết món ăn ({readyCount} sẵn sàng, {servedCount} đã phục vụ, {cancelledCount} đã hủy)
              </h3>

              <div className="space-y-4">
                {order.items?.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border-2 ${getItemStatusColor(item)}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h4 className="text-xl font-bold text-gray-800">
                            {item.name}
                          </h4>
                          <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                            x{item.quantity}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-bold ${getItemStatusColor(item)} ${getItemStatusTextColor(item)}`}>
                            {getItemStatusLabel(item)}
                          </span>
                        </div>

                        {/* Price */}
                        <div className="mb-2">
                          <span className="text-gray-600 text-sm">
                            Đơn giá: <span className="font-bold text-gray-800">{item.unitPrice?.toLocaleString('vi-VN')}đ</span>
                          </span>
                        </div>

                        {/* Modifiers */}
                        {item.modifiers && item.modifiers.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {item.modifiers.map((mod, idx) => (
                              <span
                                key={idx}
                                className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium"
                              >
                                + {mod.optionName}{mod.price > 0 ? ` (+${mod.price.toLocaleString('vi-VN')}đ)` : ''}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Note */}
                        {item.note && (
                          <p className="text-red-600 font-semibold italic">
                            📝 Ghi chú: {item.note}
                          </p>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        {/* Nút Phục vụ - CHỈ cho món Ready ở đơn đã nhận */}
                        {isClaimedOrder && item.status === "Ready" && onServeItem && (
                          <button
                            onClick={(e) => handleServeItem(e, item)}
                            className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-bold transition-colors"
                          >
                            <Utensils size={16} /> Phục vụ
                          </button>
                        )}

                        {/* Nút Hủy - cho món Pending ở đơn đã nhận */}
                        {isClaimedOrder && item.status === "Pending" && (
                          <button
                            onClick={(e) => handleCancelItem(e, item)}
                            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-bold transition-colors"
                          >
                            <X size={16} /> Hủy món
                          </button>
                        )}

                        {/* Nút Xác nhận/Hủy - CHỈ cho đơn chưa nhận */}
                        {showClaimButton && item.status !== "Cancelled" && item.status !== "Pending" && item.status !== "Ready" && item.status !== "Served" && (
                          <>
                            <button
                              onClick={(e) => handleConfirmItem(e, item)}
                              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-bold transition-colors"
                            >
                              <Check size={16} /> Xác nhận
                            </button>
                            <button
                              onClick={(e) => handleCancelItem(e, item)}
                              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-bold transition-colors"
                            >
                              <X size={16} /> Hủy
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Total Price - Bottom Right */}
                    <div className="flex justify-end pt-2 border-t border-gray-100 border-dashed">
                      <span className="text-green-600 font-bold py-1 rounded-lg">
                        Thành tiền: {(
                          ((item.unitPrice || 0) + (item.modifiers || []).reduce((sum, mod) => sum + (mod.price || 0), 0)) * (item.quantity || 1)
                        ).toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Amount */}
              <div className="mt-6 pt-4 border-t-2 border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-700">Tổng cộng:</span>
                  <span className="text-2xl font-black text-green-600">
                    {order.items?.reduce((sum, item) => {
                      if (item.status === "Cancelled") return sum;
                      const modifierTotal = (item.modifiers || []).reduce((modSum, mod) => modSum + (mod.price || 0), 0);
                      return sum + ((item.unitPrice || 0) + modifierTotal) * (item.quantity || 1);
                    }, 0).toLocaleString('vi-VN')}đ
                  </span>
                </div>
              </div>
            </div>
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
