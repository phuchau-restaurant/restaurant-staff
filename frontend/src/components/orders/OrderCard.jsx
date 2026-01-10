import { memo } from "react";
import {
  Edit2,
  Trash2,
  Clock,
  UtensilsCrossed,
  AlertTriangle,
  DollarSign,
  RotateCcw,
  Trash,
  Eye,
} from "lucide-react";
import {
  formatPrice,
  formatDateShort,
  getOrderStatusLabel,
  getOrderStatusColor,
  isOrderOverdue,
  getTimeSinceCreated,
  getTotalItemsCount,
} from "../../utils/orderUtils";
import { DEFAULT_PREP_TIME } from "../../constants/orderConstants";

/**
 * OrderCard Component
 * Hiển thị đơn hàng dạng card cho grid view
 */
const OrderCard = memo(
  ({
    order,
    tables = [],
    onEdit,
    onDelete,
    onRestore,
    onDeletePermanent,
    prepTime = DEFAULT_PREP_TIME,
  }) => {
    const isCancelled = order.status === "Cancelled";
    const isOverdue = isOrderOverdue(order.createdAt, prepTime, order.status);
    const itemsCount = getTotalItemsCount(order.items);
    const statusColor = getOrderStatusColor(order.status);
    const statusLabel = getOrderStatusLabel(order.status);

    // Lấy tên bàn từ tableId
    const table = tables.find((t) => t.id === order.tableId);
    const tableName = table
      ? `${table.tableNumber}`
      : `Bàn #${order.tableId}`;

    return (
      <div
        className={`bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all h-full flex flex-col border-2 ${
          isOverdue ? "border-red-300 bg-red-50/30" : "border-gray-200"
        }`}
      >
        {/* Header */}
        <div
          className={`p-4 ${
            isOverdue
              ? "bg-red-50"
              : "bg-gradient-to-r from-blue-50 to-indigo-50"
          } ${isCancelled ? "bg-gray-100 opacity-50" : ""}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">
                <UtensilsCrossed className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{tableName}</h3>
                <p className="text-xs text-gray-500">#{order.id}</p>
              </div>
            </div>

            {/* Status Badge */}
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColor}`}
            >
              {statusLabel}
            </span>
          </div>
        </div>

        {/* Body */}
        <div
          className={`p-4 flex-1 flex flex-col gap-3 ${
            isCancelled ? "opacity-50" : ""
          }`}
        >
          {/* Overdue Warning */}
          {isOverdue && (
            <div className="flex items-center gap-2 p-2 bg-red-100 border border-red-300 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span className="text-xs text-red-700 font-semibold">
                Vượt quá thời gian chuẩn bị!
              </span>
            </div>
          )}

          {/* Order Info */}
          <div className="space-y-2">
            {/* Items Count */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 flex items-center gap-1">
                <UtensilsCrossed className="w-4 h-4" />
                Số món:
              </span>
              <span className="font-semibold text-gray-900">{itemsCount}</span>
            </div>

            {/* Total Amount */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                Tổng tiền:
              </span>
              <span className="font-bold text-orange-600">
                {formatPrice(order.totalAmount)}
              </span>
            </div>

            {/* Time */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Thời gian:
              </span>
              <span
                className={`text-xs ${
                  isOverdue ? "text-red-600 font-semibold" : "text-gray-500"
                }`}
              >
                {getTimeSinceCreated(order.createdAt)}
              </span>
            </div>
          </div>

          {/* Items Preview */}
          {order.items && order.items.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Món ăn:</p>
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {order.items.slice(0, 3).map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="text-gray-700 truncate flex-1">
                      {item.dishName || `Món #${item.dishId}`}
                    </span>
                    <span className="text-gray-500 ml-2">x{item.quantity}</span>
                  </div>
                ))}
                {order.items.length > 3 && (
                  <p className="text-xs text-gray-400 italic">
                    +{order.items.length - 3} món khác...
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div
            className={`mt-auto pt-3 border-t border-gray-200 text-xs text-gray-500 ${
              isCancelled ? "opacity-50" : ""
            }`}
          >
            <div className="flex justify-between">
              <span>Tạo lúc:</span>
              <span>{formatDateShort(order.createdAt)}</span>
            </div>
            {order.completedAt && (
              <div className="flex justify-between mt-1">
                <span>Hoàn thành:</span>
                <span>{formatDateShort(order.completedAt)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer - Actions */}
        <div className="p-4 pt-0">
          <div className="flex gap-2">
            {isCancelled ? (
              <>
                <button
                  onClick={() => onRestore && onRestore(order)}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 font-semibold py-2 px-3 rounded-lg transition-colors"
                  title="Khôi phục"
                >
                  <RotateCcw className="w-4 h-4" />
                  Khôi phục
                </button>
                <button
                  onClick={() => onDeletePermanent && onDeletePermanent(order)}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-2 px-3 rounded-lg transition-colors"
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
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold py-2 px-3 rounded-lg transition-colors"
                  title="Xem chi tiết đơn hàng"
                >
                  <Eye className="w-4 h-4" />
                  Xem chi tiết
                </button>
                {onDelete && (
                  <button
                    onClick={() => onDelete(order)}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-2 px-3 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Xóa
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }
);

OrderCard.displayName = "OrderCard";

export default OrderCard;
