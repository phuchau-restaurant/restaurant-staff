import { memo } from "react";
import {
  Edit2,
  Trash2,
  UtensilsCrossed,
  AlertTriangle,
  RotateCcw,
  Trash,
} from "lucide-react";
import {
  formatPrice,
  formatDate,
  getOrderStatusLabel,
  getOrderStatusColor,
  isOrderOverdue,
  getTotalItemsCount,
} from "../../utils/orderUtils";
import { DEFAULT_PREP_TIME } from "../../constants/orderConstants";

/**
 * OrderListView Component
 * Hiển thị đơn hàng dạng bảng cho list view
 */
const OrderListView = memo(
  ({
    orders,
    onEdit,
    onDelete,
    onRestore,
    onDeletePermanent,
    prepTime = DEFAULT_PREP_TIME,
  }) => {
    if (!orders || orders.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <p className="text-gray-500">Không có đơn hàng nào</p>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Đơn hàng
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Bàn
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Số món
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                  Tổng tiền
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Thời gian tạo
                </th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => {
                const isCancelled = order.status === "Cancelled";
                const isOverdue = isOrderOverdue(
                  order.createdAt,
                  prepTime,
                  order.status
                );
                const itemsCount = getTotalItemsCount(order.items);
                const statusColor = getOrderStatusColor(order.status);
                const statusLabel = getOrderStatusLabel(order.status);

                return (
                  <tr
                    key={order.id || index}
                    className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                      isOverdue ? "bg-red-50/30" : ""
                    } ${isCancelled ? "bg-gray-50" : ""}`}
                  >
                    {/* Order ID */}
                    <td
                      className={`px-6 py-4 ${
                        isCancelled ? "opacity-50 bg-gray-50" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <UtensilsCrossed className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <span className="font-semibold text-gray-800 block">
                            #{order.id}
                          </span>
                          {isOverdue && (
                            <span className="flex items-center gap-1 text-xs text-red-600 font-semibold">
                              <AlertTriangle className="w-3 h-3" />
                              Quá hạn
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Table */}
                    <td
                      className={`px-6 py-4 ${
                        isCancelled ? "opacity-50 bg-gray-50" : ""
                      }`}
                    >
                      <span className="font-medium text-gray-700">
                        Bàn {order.tableId || "-"}
                      </span>
                    </td>

                    {/* Items Count */}
                    <td
                      className={`px-6 py-4 ${
                        isCancelled ? "opacity-50 bg-gray-50" : ""
                      }`}
                    >
                      <span className="text-gray-700">{itemsCount}</span>
                    </td>

                    {/* Total Amount */}
                    <td
                      className={`px-6 py-4 text-right ${
                        isCancelled ? "opacity-50 bg-gray-50" : ""
                      }`}
                    >
                      <span className="font-semibold text-orange-600">
                        {formatPrice(order.totalAmount)}
                      </span>
                    </td>

                    {/* Status */}
                    <td
                      className={`px-6 py-4 ${
                        isCancelled ? "opacity-50 bg-gray-50" : ""
                      }`}
                    >
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${statusColor}`}
                      >
                        {statusLabel}
                      </span>
                    </td>

                    {/* Created At */}
                    <td
                      className={`px-6 py-4 text-sm text-gray-600 ${
                        isCancelled ? "opacity-50 bg-gray-50" : ""
                      }`}
                    >
                      {formatDate(order.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-3">
                        {isCancelled ? (
                          <>
                            <button
                              onClick={() => onRestore && onRestore(order)}
                              className="text-xs flex items-center justify-center gap-2 bg-green-100 hover:bg-green-200 text-green-700 font-semibold py-2 px-3 rounded-lg transition-colors"
                              title="Khôi phục"
                            >
                              <RotateCcw className="w-4 h-4" />
                              Khôi phục
                            </button>
                            <button
                              onClick={() =>
                                onDeletePermanent && onDeletePermanent(order)
                              }
                              className="text-xs flex items-center justify-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-2 px-3 rounded-lg transition-colors"
                              title="Xóa vĩnh viễn"
                            >
                              <Trash className="w-4 h-4" />
                              Xóa vĩnh viễn
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => onEdit(order)}
                              className="text-xs flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold py-2 px-3 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                              Sửa
                            </button>
                            {onDelete && (
                              <button
                                onClick={() => onDelete(order)}
                                className="text-xs flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-2 px-3 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                                Xóa
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
);

OrderListView.displayName = "OrderListView";

export default OrderListView;
