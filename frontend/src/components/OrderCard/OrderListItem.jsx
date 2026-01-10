// src/components/OrderCard/OrderListItem.jsx
import React, { useState } from "react";
import { Clock, CheckCircle2 } from "lucide-react";
import { STATUS_CONFIG } from "./constants.jsx";
import OrderActions from "./OrderActions";
import OrderDetailModal from "./OrderDetailModal";

const OrderListItem = ({
    order,
    getElapsedTime,
    getOrderStatus,
    handleCompleteItem,
    handleStart,
    handleComplete,
    handleCancel,
    handleRecall,
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
                className={`rounded-xl shadow-sm border-2 ${statusConfig.borderColor} bg-white overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 flex items-stretch min-h-[120px]`}
            >
                {/* Left: Order Info + Status Indicator */}
                <div className={`w-2 ${statusConfig.color}`}></div>

                <div className={`w-40 px-3 py-4 ${statusConfig.bgLight} border-r-2 ${statusConfig.borderColor} flex flex-col justify-center gap-2 shrink-0`}>
                    {/* Order Numbers */}
                    <div>
                        <div className="flex flex-col gap-1">
                            <span className="font-extrabold text-gray-800 text-xl leading-none">
                                #{order.orderNumber.toString().slice(-2)}
                            </span>
                            <span className="font-bold text-gray-700 text-base">
                                Bàn {order.tableNumber}
                            </span>
                        </div>
                    </div>

                    {/* Timer Badge - Pill shape */}
                    <div
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold w-fit shadow-sm ${isLate
                                ? "bg-red-500 text-white"
                                : "bg-gray-200 text-gray-700"
                            }`}
                    >
                        <Clock size={14} strokeWidth={2.5} />
                        <span>{elapsed}'</span>
                    </div>
                </div>

                {/* Middle: Items Section */}
                <div className="flex-1 p-2 overflow-y-auto">
                    <div className="space-y-1">
                        {order.items.map((item, idx) => (
                            <div
                                key={item.id || idx}
                                className={`flex items-center justify-between gap-4 p-2 rounded-lg hover:bg-gray-50 transition-colors ${idx !== order.items.length - 1 ? "border-b border-gray-100" : ""
                                    }`}
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-baseline gap-3">
                                        <span
                                            className={`font-bold text-lg ${item.completed ? "text-gray-400 line-through" : "text-gray-900"
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
                                    {/* Note */}
                                    {item.note && (
                                        <p className="text-xs font-medium text-red-600 mt-1 flex items-center gap-1">
                                            • {item.note}
                                        </p>
                                    )}
                                </div>

                                {/* Checkbox */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (!item.completed) {
                                            handleCompleteItem(order.id, item.id);
                                        }
                                    }}
                                    className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${item.completed
                                        ? "bg-green-500 border-green-500 text-white shadow-sm scale-110"
                                        : "border-gray-300 text-gray-300 hover:border-gray-400 hover:text-gray-400 hover:bg-gray-50"
                                        }`}
                                >
                                    <CheckCircle2 size={16} strokeWidth={3} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Actions */}
                <div
                    className="w-56 p-3 bg-gray-50 border-l-2 border-gray-100 flex items-center"
                    onClick={(e) => e.stopPropagation()}
                >
                    <OrderActions
                        status={status}
                        orderId={order.id}
                        handleStart={handleStart}
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

export default OrderListItem;
