import { MapPin, Users, QrCode, Calendar, Edit2, Trash2, RotateCcw, Trash } from "lucide-react";
import TableStatus from "../../../constants/tableStatus";

/**
 * TableCard - Component hiển thị thông tin bàn dạng card (grid view)
 * @param {Object} table - Thông tin bàn
 * @param {Function} onEdit - Callback khi click nút chỉnh sửa
 * @param {Function} onToggleStatus - Callback khi chuyển đổi trạng thái Trống/Có khách
 * @param {Function} onDelete - Callback khi xóa mềm bàn
 * @param {Function} onRestore - Callback khi khôi phục bàn đã xóa
 * @param {Function} onDeletePermanent - Callback khi xóa vĩnh viễn bàn
 */
const TableCard = ({ table, onEdit, onToggleStatus, onDelete, onRestore, onDeletePermanent }) => {
  const isInactive = table.status === TableStatus.INACTIVE;

  // Format ngày tạo
  const formatDate = (dateString) => {
    if (!dateString) return "Chưa có";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all p-6 border border-gray-200 hover:border-blue-300 flex flex-col"
    >
      {/* Table Header */}
      <div className={`flex items-center justify-between mb-4 ${isInactive ? "opacity-50" : ""}`}>
        <h3 className="text-2xl font-bold text-gray-800">
          {table.tableNumber}
        </h3>
        {table.qrToken != null && (
          <QrCode className="w-5 h-5 text-blue-600" />
        )}
      </div>

      {/* Table Info */}
      <div className={`space-y-2 ${isInactive ? "opacity-50" : ""}`}>
        {/* Location */}
        <div className="flex py-2 items-center gap-2 text-gray-600">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">{table.location || "Chưa xác định"}</span>
        </div>

        {/* Capacity */}
        <div className="flex items-center gap-2 mb-2">
          <Users className="w-5 h-5 text-gray-500" />
          <span className="text-gray-700 text-sm">
            Sức chứa: {table.capacity} người
          </span>
        </div>

        {/* Created At */}
        <div className="flex items-center gap-2 mb-2 text-gray-500">
          <Calendar className="w-4 h-4" />
          <span className="text-sm">{formatDate(table.createdAt || table.createdat)}</span>
        </div>

        {/* Description */}
        {table.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {table.description}
          </p>
        )}

        {/* Status Display */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <span className="text-xs text-gray-500">Trạng thái:</span>
          <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              table.status === TableStatus.AVAILABLE
                ? "bg-green-100 text-green-800"
                : table.status === TableStatus.OCCUPIED
                ? "bg-red-100 text-red-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {table.status === TableStatus.AVAILABLE
              ? "Trống"
              : table.status === TableStatus.OCCUPIED
              ? "Có khách"
              : "Không hoạt động"}
          </span>
        </div>
      </div>

      {/* Spacer to push actions to bottom */}
      <div className="flex-1"></div>

      {/* Actions */}
      <div className="grid grid-cols-2 pt-4 gap-2 border-t border-gray-100 mt-4">
        {isInactive ? (
          <>
            {/* Restore Button */}
            <button
              onClick={() => onRestore && onRestore(table.id)}
              className="flex items-center justify-center gap-2 px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
            >
              <RotateCcw className="w-4 h-4" />
              Khôi phục
            </button>
            {/* Delete Permanent Button */}
            <button
              onClick={() => onDeletePermanent && onDeletePermanent(table.id)}
              className="flex items-center justify-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
            >
              <Trash className="w-4 h-4" />
              Xóa vĩnh viễn
            </button>
          </>
        ) : (
          <>
            {/* Toggle Status Button */}
            <button
              onClick={() => onToggleStatus(table.id, table.status)}
              className={`px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                table.status === TableStatus.AVAILABLE
                  ? "bg-green-50 text-green-600 hover:bg-green-100"
                  : "bg-red-50 text-red-600 hover:bg-red-100"
              }`}
            >
              {table.status === TableStatus.AVAILABLE ? "Trống" : "Có khách"}
            </button>
            {/* Edit Button */}
            <button
              onClick={() => onEdit(table.id)}
              className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
            >
              <Edit2 className="w-4 h-4" />
              Sửa
            </button>
            {/* Delete Button */}
            <button
              onClick={() => onDelete(table.id)}
              className="col-span-2 flex items-center justify-center gap-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
            >
              <Trash2 className="w-4 h-4" />
              Xóa
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default TableCard;
