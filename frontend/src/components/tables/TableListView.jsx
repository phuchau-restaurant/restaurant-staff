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
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Số Bàn
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Khu Vực
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Sức Chứa
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Mô Tả
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tình Trạng
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              QR Code
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ngày Tạo
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Thao Tác
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {tables.map((table) => (
            <tr key={table.id} className="hover:bg-gray-50">
              {/* Số bàn */}
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-lg font-semibold text-gray-800">
                  Bàn {table.tableNumber}
                </span>
              </td>

              {/* Khu vực */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2 text-gray-700">
                  <MapPin className="w-4 h-4" />
                  {table.location || "Chưa xác định"}
                </div>
              </td>

              {/* Sức chứa */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2 text-gray-700">
                  <Users className="w-4 h-4" />
                  {table.capacity} người
                </div>
              </td>

              {/* Mô tả */}
              <td className="px-6 py-4 max-w-xs">
                <span className="text-sm text-gray-600 line-clamp-2">
                  {table.description || "Không có mô tả"}
                </span>
              </td>

              {/* Tình trạng */}
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    table.status === TableStatus.AVAILABLE
                      ? "bg-green-100 text-green-700"
                      : table.status === TableStatus.OCCUPIED
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {table.status === TableStatus.AVAILABLE && "Trống"}
                  {table.status === TableStatus.OCCUPIED && "Có khách"}
                  {table.status === TableStatus.INACTIVE && "Không hoạt động"}
                </span>
              </td>

              {/* QR Code */}
              <td className="px-6 py-4 whitespace-nowrap">
                {table.qrToken != null ? (
                  <QrCode className="w-5 h-5 text-blue-600" />
                ) : (
                  <span className="text-gray-400 text-sm">Chưa có</span>
                )}
              </td>

              {/* Ngày tạo */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">{formatDate(table.createdAt || table.created_at)}</span>
                </div>
              </td>

              {/* Thao tác */}
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <div className="inline-flex gap-2">
                  {/* Nút sửa */}
                  <button
                    onClick={() => onEdit(table.id)}
                    className="px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors text-sm font-medium min-w-[80px]"
                  >
                    Sửa
                  </button>

                  {/* Nút toggle trạng thái */}
                  <button
                    onClick={() => onToggleStatus(table.id, table.status)}
                    className={`px-3 py-1 rounded transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed min-w-[90px] ${
                      table.status === TableStatus.OCCUPIED
                        ? "bg-green-50 text-green-600 hover:bg-green-100"
                        : "bg-red-50 text-red-600 hover:bg-red-100"
                    }`}
                    disabled={table.status === TableStatus.INACTIVE}
                  >
                    {table.status === TableStatus.OCCUPIED ? "Trống" : "Có khách"}
                  </button>

                  {/* Nút kích hoạt/vô hiệu hóa */}
                  <button
                    onClick={() => onToggleActive(table.id, table.status)}
                    className={`px-3 py-1 rounded transition-colors text-sm font-medium min-w-[100px] ${
                      table.status === TableStatus.INACTIVE
                        ? "bg-green-50 text-green-600 hover:bg-green-100"
                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {table.status === TableStatus.INACTIVE ? "Kích hoạt" : "Vô hiệu hóa"}
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
