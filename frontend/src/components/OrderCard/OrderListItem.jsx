// src/components/OrderCard/OrderListItem.jsx
import React, { useState } from "react";
import { Clock, CheckCircle2, XCircle, StickyNote } from "lucide-react";
import { STATUS_CONFIG, STATUS_BADGE } from "../../constants/orderConstants";
import OrderActions from "./OrderActions";
import OrderDetailModal from "./OrderDetailModal";

const OrderListItem = ({
    order,
    getElapsedTime,
    getOrderStatus,
    handleCompleteItem,
    handleCancelItem,
    handleConfirmOrder,
    handleComplete,
    handleCancel,
    handleRecall,
}) => {
    const [showDetailModal, setShowDetailModal] = useState(false);
    const status = getOrderStatus(order);
    const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG["new"];
    // Use dbStatus from order for badge display (database status)
    const dbStatus = order.dbStatus || order.status || "Pending";
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
                className={`rounded-xl shadow-sm border-2 ${statusConfig.borderColor} bg-white overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 flex items-stretch min-h-[120px]`}
            >
                {/* Left: Order Info + Status Indicator */}
                <div className={`w-2 ${statusConfig.color}`}></div>

                <div className={`w-44 px-3 py-3 ${statusConfig.bgLight} border-r-2 ${statusConfig.borderColor} flex flex-col justify-center gap-2 shrink-0`}>
                    {/* Order Numbers */}
                    <div>
                        <div className="flex flex-col gap-1">
                            <span className="font-extrabold text-gray-800 text-xl leading-none">
                                Đơn #{order.orderNumber}
                            </span>
                            <span className="font-bold text-gray-700 text-base">
                                Bàn {order.tableNumber}
                            </span>
                        </div>
                    </div>

                    {/* Status Badge */}
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-md border w-fit ${statusBadge.bgColor} ${statusBadge.textColor} ${statusBadge.borderColor}`}>
                        {statusBadge.label}
                    </span>

                    {/* Timer Badge - Red when exceeds prep time */}
                    <div
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold w-fit shadow-sm ${isLate
                            ? "bg-red-500 text-white"
                            : "bg-gray-200 text-gray-700"
                            }`}
                    >
                        <Clock size={14} strokeWidth={2.5} />
                        <span>{elapsed}'{prepTime ? `/${prepTime}'` : ''}</span>
                    </div>
                </div>

                {/* Middle: Items Section */}
                <div className="flex-1 p-2 overflow-y-auto">
                    <div className="space-y-1">
                        {order.items.map((item, idx) => {
                            // Determine item status
                            const itemStatus = item.status || (item.completed ? "Ready" : item.cancelled ? "Cancelled" : "Pending");
                            const isItemCompleted = item.completed || itemStatus === "Ready" || itemStatus === "Served";
                            const isItemCancelled = item.cancelled || itemStatus === "Cancelled";
                            
                            return (
                                <div
                                    key={item.id || idx}
                                    className={`flex items-center justify-between gap-4 p-2 rounded-lg hover:bg-gray-50 transition-colors ${isItemCompleted ? "bg-green-50" : isItemCancelled ? "bg-gray-100" : ""
                                        } ${idx !== order.items.length - 1 ? "border-b border-gray-100" : ""
                                        }`}
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span
                                                className={`font-bold text-lg ${isItemCompleted ? "text-gray-400 line-through" : isItemCancelled ? "text-gray-400 line-through" : "text-gray-900"
                                                    }`}
                                            >
                                                {item.name}
                                            </span>
                                            <span className="text-base font-black text-orange-600">
                                                x{item.quantity}
                                            </span>
                                        </div>

                                        {/* Modifiers - Green Pills */}
                                        {item.modifiers && item.modifiers.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mt-1">
                                                {item.modifiers.map((mod, mIdx) => (
                                                    <span
                                                        key={mIdx}
                                                        className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-md"
                                                    >
                                                        + {mod.optionName}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        {/* Note - Yellow with StickyNote icon */}
                                        {item.note && (
                                            <div className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md inline-flex items-center gap-1 mt-1">
                                                <StickyNote size={12} />
                                                {item.note}
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                        {/* Complete Button */}
                                        {!isItemCompleted && !isItemCancelled && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleCompleteItem(order.id, item.id);
                                                }}
                                                className="w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all border-green-400 text-green-500 hover:bg-green-50 hover:border-green-500"
                                                title="Hoàn thành món"
                                            >
                                                <CheckCircle2 size={14} strokeWidth={2.5} />
                                            </button>
                                        )}
                                        
                                        {/* Cancel Button */}
                                        {!isItemCompleted && !isItemCancelled && handleCancelItem && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleCancelItem(order.id, item.id);
                                                }}
                                                className="w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all border-red-400 text-red-500 hover:bg-red-50 hover:border-red-500"
                                                title="Hủy món"
                                            >
                                                <XCircle size={14} strokeWidth={2.5} />
                                            </button>
                                        )}

                                        {/* Completed indicator */}
                                        {isItemCompleted && (
                                            <div className="w-7 h-7 rounded-full flex items-center justify-center bg-green-500 text-white shadow-sm">
                                                <CheckCircle2 size={14} strokeWidth={2.5} />
                                            </div>
                                        )}
                                        
                                        {/* Cancelled indicator */}
                                        {isItemCancelled && (
                                            <div className="w-7 h-7 rounded-full flex items-center justify-center bg-gray-400 text-white">
                                                <XCircle size={14} strokeWidth={2.5} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right: Actions - Auto width */}
                <div
                    className="shrink-0 p-3 bg-gray-50 border-l-2 border-gray-100 flex items-center"
                    onClick={(e) => e.stopPropagation()}
                >
                    <OrderActions
                        status={status}
                        dbStatus={dbStatus}
                        orderId={order.id}
                        handleConfirmOrder={handleConfirmOrder}
                        handleComplete={handleComplete}
                        handleCancel={handleCancel}
                        handleRecall={handleRecall}
                        viewMode="list"
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
                    handleConfirmOrder={handleConfirmOrder}
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

export default OrderListItem;
