import React, { useState } from "react";
import {
  Bell,
  Clock,
  User,
  AlertCircle,
  CheckCircle2,
  ChefHat,
} from "lucide-react";
import AlertModal from "../Modal/AlertModal";
import { useAlert } from "../../hooks/useAlert";

const WaiterOrderCard = ({
  order,
  currentTime,
  getElapsedTime,
  getOrderStatus,
}) => {
  const { alert, showSuccess, closeAlert } = useAlert();
  const [showDetail, setShowDetail] = useState(false);
  const [servedItems, setServedItems] = useState([]);
  const elapsed = getElapsedTime(order.orderTime);

  // Tính số món đã hoàn thành
  const completedCount = order.items.filter((item) => item.completed).length;
  const totalCount = order.items.length;

  // Hàm xử lý khi nhân viên đánh dấu món đã phục vụ
  const handleMarkAsServed = (itemId) => {
    if (!servedItems.includes(itemId)) {
      setServedItems([...servedItems, itemId]);
      showSuccess(`Đã đánh dấu món phục vụ thành công!`);
    }
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
              <div className="bg-linear-to-br from-orange-400 to-orange-500 p-2 rounded-lg shadow-sm">
                <Bell size={20} className="text-white" />
              </div>
              <div>
                <span className="font-black text-xl text-gray-800">
                  {order.orderNumber}
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-linear-to-r from-orange-400 to-orange-500 text-white shadow-sm">
                    Bàn {order.tableNumber}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-200 text-gray-700">
                    {completedCount}/{totalCount} món
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200">
            <Clock
              size={16}
              className={elapsed >= 10 ? "text-red-500" : "text-gray-500"}
            />
            <span
              className={`font-bold text-sm ${
                elapsed >= 10 ? "text-red-600" : "text-gray-700"
              }`}
            >
              {elapsed} phút
            </span>
            {elapsed >= 10 && (
              <AlertCircle size={16} className="text-red-500 animate-pulse" />
            )}
          </div>

          <div className="mt-3 flex items-center gap-2 text-xs text-gray-600">
            <User size={14} />
            <span className="font-medium">{order.server}</span>
          </div>
        </div>

        {/* Content - Danh sách món với trạng thái bên phải */}
        <div className="p-4 flex-1 flex flex-col">
          <div className="flex-1 max-h-[240px] overflow-y-auto mb-3">
            <div className="space-y-2">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className={`flex gap-3 p-3 rounded-lg border-2 ${
                    item.completed
                      ? "bg-green-50 border-green-200"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="rounded-lg object-cover flex-shrink-0 w-16 h-16"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 text-sm">
                      {item.name}
                    </h3>
                    <span className="bg-orange-500 text-white px-2 py-0.5 rounded-full text-xs font-bold inline-block mt-1">
                      x{item.quantity}
                    </span>
                    {item.notes && (
                      <p className="text-red-600 text-xs font-semibold mt-1 italic">
                        📝 {item.notes}
                      </p>
                    )}
                  </div>
                  {/* Trạng thái món - bên phải */}
                  <div className="flex flex-col items-center justify-center px-2 gap-2">
                    {servedItems.includes(item.id) ? (
                      <span className="text-purple-600 text-xs font-bold text-center whitespace-nowrap">
                        Served
                      </span>
                    ) : item.completed ? (
                      <>
                        <span className="text-green-600 text-xs font-bold text-center whitespace-nowrap">
                          Ready
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsServed(item.id);
                          }}
                          className="bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-lg transition-all"
                        >
                          Phục vụ
                        </button>
                      </>
                    ) : order.status === "Approved" ||
                      order.status === "Pending" ||
                      order.status === "late" ? (
                      <span className="text-blue-600 text-xs font-bold text-center whitespace-nowrap">
                        Pending
                      </span>
                    ) : order.status === "cancelled" || order.status === "Cancelled" ? (
                      <span className="text-red-600 text-xs font-bold text-center whitespace-nowrap">
                        Cancel
                      </span>
                    ) : (
                      <span className="text-purple-600 text-xs font-bold text-center whitespace-nowrap">
                        Served
                      </span>
                    )}
                  </div>
                </div>
              ))}
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
                  <div className="bg-linear-to-br from-orange-400 to-orange-500 p-3 rounded-xl shadow-md">
                    <Bell size={32} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800">
                      {order.orderNumber}
                    </h2>
                    <p className="text-gray-600">
                      Bàn {order.tableNumber} • {elapsed} phút • {order.server}
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
                Chi tiết món ăn ({completedCount}/{totalCount} sẵn sàng)
              </h3>

              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border-2 flex gap-4 items-center ${
                      item.completed
                        ? "bg-green-50 border-green-200"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 rounded-xl object-cover shadow-md"
                    />
                    <div className="flex-1">
                      <h4 className="text-2xl font-bold text-gray-800 mb-1">
                        {item.name}
                      </h4>
                      <div className="flex items-center gap-3">
                        <span className="bg-orange-500 text-white px-4 py-2 rounded-full text-lg font-bold">
                          x{item.quantity}
                        </span>
                        {item.notes && (
                          <p className="text-red-600 text-base font-semibold italic">
                            📝 {item.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    {/* Trạng thái món - bên phải */}
                    <div className="flex flex-col items-center justify-center px-3 gap-2">
                      {servedItems.includes(item.id) ? (
                        <span className="text-purple-600 text-sm font-bold text-center whitespace-nowrap">
                          Served
                        </span>
                      ) : item.completed ? (
                        <>
                          <span className="text-green-600 text-sm font-bold text-center whitespace-nowrap">
                            Ready
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsServed(item.id);
                            }}
                            className="bg-green-500 hover:bg-green-600 text-white text-sm font-bold px-4 py-2 rounded-lg transition-all"
                          >
                            Phục vụ
                          </button>
                        </>
                      ) : order.status === "Approved" ||
                        order.status === "Pending" ||
                        order.status === "late" ? (
                        <span className="text-blue-600 text-sm font-bold text-center whitespace-nowrap">
                          Pending
                        </span>
                      ) : order.status === "cancelled" || order.status === "Cancelled" ? (
                        <span className="text-red-600 text-sm font-bold text-center whitespace-nowrap">
                          Cancel
                        </span>
                      ) : (
                        <span className="text-purple-600 text-sm font-bold text-center whitespace-nowrap">
                          Served
                        </span>
                      )}
                    </div>
                  </div>
                ))}
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
