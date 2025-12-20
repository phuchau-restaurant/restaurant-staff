import { Users, MapPin, QrCode, Calendar } from "lucide-react";
import TableStatus from "../../../constants/tableStatus";

/**
 * TableListView Component
 * Hiển thị danh sách bàn ở dạng bảng (list view)
 * 
 * @param {array} tables - Danh sách bàn
 * @param {function} onEdit - Callback khi bấm "Sửa"
 * @param {function} onToggleStatus - Callback khi bấm "Trống/Có khách"
 * @param {function} onToggleActive - Callback khi kích hoạt/vô hiệu hóa bàn
 */
const TableListView = ({ tables, onEdit, onToggleStatus, onToggleActive }) => {
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
    <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Số Bàn
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Khu Vực
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Sức Chứa
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Mô Tả
            </th>
            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              QR Code
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ngày Tạo
            </th>
            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Thao Tác
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {tables.map((table) => (
            <tr key={table.id} className="hover:bg-blue-50 transition-colors">
              {/* Số bàn */}
              <td className="px-4 py-3 whitespace-nowrap">
                <span className="text-base font-semibold text-gray-800">
                  Bàn {table.tableNumber}
                </span>
              </td>

              {/* Khu vực */}
              <td className="px-4 py-3">
                <div className="flex items-center gap-1 text-gray-700 text-sm">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{table.location || "Chưa xác định"}</span>
                </div>
              </td>

              {/* Sức chứa */}
              <td className="px-4 py-3">
                <div className="flex items-center gap-1 text-gray-700 text-sm">
                  <Users className="w-4 h-4 flex-shrink-0" />
                  <span className="whitespace-nowrap">{table.capacity}</span>
                </div>
              </td>

              {/* Mô tả */}
              <td className="px-4 py-3">
                <span className="text-sm text-gray-600 line-clamp-2 block">
                  {table.description || "Không có mô tả"}
                </span>
              </td>

              {/* QR Code */}
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex items-center justify-center">
                  {table.qrToken != null ? (
                    <QrCode className="w-5 h-5 text-blue-600" />
                  ) : (
                    <span className="text-gray-400 text-xs">-</span>
                  )}
                </div>
              </td>

              {/* Ngày tạo */}
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex items-center gap-1 text-gray-600">
                  <Calendar className="w-3 h-3 flex-shrink-0" />
                  <span className="text-xs">{formatDate(table.createdAt || table.created_at)}</span>
                </div>
              </td>

              {/* Thao tác */}
              <td className="px-4 py-3">
                <div className="flex items-center justify-center gap-1.5 w-full">
                  {/* Nút sửa */}
                  <button
                    onClick={() => onEdit(table.id)}
                    className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors text-sm font-medium flex-1"
                  >
                    Sửa
                  </button>

                  {/* Nút toggle trạng thái */}
                  <button
                    onClick={() => onToggleStatus(table.id, table.status)}
                    className={`px-3 py-1.5 rounded transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex-1 ${
                      table.status === TableStatus.AVAILABLE
                        ? "bg-green-50 text-green-600 hover:bg-green-100"
                        : "bg-red-50 text-red-600 hover:bg-red-100"
                    }`}
                    disabled={table.status === TableStatus.INACTIVE}
                  >
                    {table.status === TableStatus.AVAILABLE ? "Trống" : "Có khách"}
                  </button>

                  {/* Nút kích hoạt/vô hiệu hóa */}
                  <button
                    onClick={() => onToggleActive(table.id, table.status)}
                    className={`px-3 py-1.5 rounded transition-colors text-sm font-medium flex-1 ${
                      table.status === TableStatus.INACTIVE
                        ? "bg-green-50 text-green-600 hover:bg-green-100"
                        : "bg-orange-50 text-orange-600 hover:bg-orange-100"
                    }`}
                  >
                    {table.status === TableStatus.INACTIVE ? "Kích hoạt" : "Vô hiệu hoá"}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableListView;
