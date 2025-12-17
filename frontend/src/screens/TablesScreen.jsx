import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Plus, Filter, Search, Grid, List, QrCode, Users, MapPin, Check, X, Calendar, UserCheck, UserX } from "lucide-react";
import { getAllTables, updateTable } from "../data/mockTables";
import TableStatus from "../../constants/tableStatus";
import TableLocation from "../../constants/tableLocation";


const TablesScreen = () => {
  const navigate = useNavigate();
  const [tables, setTables] = useState([]);
  const [filteredTables, setFilteredTables] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);

  // Filter states
  const [statusFilter, setStatusFilter] = useState(""); 
  const [areaFilter, setAreaFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("tableNumber"); 
  
  // Status options for filter - from constants
  const statusOptions = [
    { value: "", label: "Tất cả trạng thái" },
    { value: TableStatus.AVAILABLE, label: "Trống" },
    { value: TableStatus.OCCUPIED, label: "Có khách" },
    { value: TableStatus.ACTIVE, label: "Hoạt động" },
    { value: TableStatus.INACTIVE, label: "Không hoạt động" },
  ];

  
  const areaOptions = [
    { value: "", label: "Tất cả khu vực" },
    ...Object.values(TableLocation).map((loc) => ({
      value: loc,
      label: loc,
    })),
  ];



  // Fetch tables from API
  useEffect(() => {
    fetchTables();
  }, []);

  // Refetch when filters change
  useEffect(() => {
    fetchTables();
  }, [statusFilter, areaFilter]);

  const fetchTables = async () => {
  try {
    setIsLoading(true);

    const queryParams = new URLSearchParams();

    if (statusFilter) {
      queryParams.append("status", statusFilter);
    }

    if (areaFilter) {
      queryParams.append("location", areaFilter);
    }

    const url = `${import.meta.env.VITE_BACKEND_URL}/api/admin/tables${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        "x-tenant-id": import.meta.env.VITE_TENANT_ID,
      },
    });

    const result = await response.json();

    if (result.success) {
      setTables(result.data || []);
    } else {
      setTables([]);
    }
    } catch (error) {
      console.error("Fetch tables error:", error);

      setTables([]);
    } finally {
      setIsLoading(false);
    }
  };


  // Filter and sort tables (client-side for search and sort only)
  useEffect(() => {
    let result = [...tables];


    // Filter by search term (client-side)
    if (searchTerm) {
      result = result.filter(
        (table) =>
          table.tableNumber.toString().includes(searchTerm) ||

          table.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    const parseTableNumber = (value) => {
      const str = String(value ?? "").trim().toLowerCase();

      // check VIP
      const isVip = str.includes("vip") ? 1 : 0;

      // lấy số trong chuỗi (table vip 12 -> 12)
      const match = str.match(/\d+/);
      const number = match ? Number(match[0]) : 0;

      return { isVip, number };
    };

    // Sort (client-side)
    result.sort((a, b) => {
      if (sortBy === "tableNumber") {
        const A = parseTableNumber(a.tableNumber);
        const B = parseTableNumber(b.tableNumber);

        // 1️⃣ bàn thường trước – VIP sau
        if (A.isVip !== B.isVip) {
          return A.isVip - B.isVip;
        }

        // 2️⃣ cùng loại → sort theo số tăng dần
        return A.number - B.number;

      }

      if (sortBy === "capacity") {
        return a.capacity - b.capacity; // tăng dần
      }

      return 0;
    });

    setFilteredTables(result);
  }, [tables, searchTerm, sortBy]);


  const handleCreateTable = () => {
    navigate("/tables/new");
  };


  const handleEditTable = (table) => {
    navigate(`/tables/edit/${table.id}`);

  };

  const handleDownloadQR = () => {
    const canvas = document.getElementById("qr-code-canvas");
    if (canvas) {
      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `table-${selectedTable.tableNumber}-qr.png`;
      link.href = url;
      link.click();
    }
  };

  const getQRValue = (table) => {
    if (!table.qrToken) return "";
    // Generate QR code URL with qrToken
    return `${window.location.origin}/menu?token=${table.qrToken}&table=${table.tableNumber}`;
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      Active: {
        bg: "bg-green-100",
        text: "text-green-700",
        label: "Hoạt động",
      },
      Inactive: {
        bg: "bg-gray-100",
        text: "text-gray-700",
        label: "Không hoạt động",
      },
      Occupied: { bg: "bg-red-100", text: "text-red-700", label: "Có khách" },
      Available: { bg: "bg-blue-100", text: "text-blue-700", label: "Trống" },
    };
    const badge = statusMap[status] || statusMap["Inactive"];
    return badge;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Quản Lý Bàn</h1>
            <p className="text-gray-600 mt-1">
              Tổng số: {filteredTables.length} bàn
            </p>
          </div>
          <button
            onClick={handleCreateTable}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Thêm Bàn Mới
          </button>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm số bàn, khu vực..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >

              {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}

            </select>

            {/* Area Filter */}
            <select
              value={areaFilter}
              onChange={(e) => setAreaFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {areaOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}   
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="tableNumber">Sắp xếp theo số bàn</option>
              <option value="capacity">Sắp xếp theo sức chứa</option>
              <option value="createdAt">Sắp xếp theo ngày tạo</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex gap-2 border border-gray-300 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded ${
                  viewMode === "grid"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded ${
                  viewMode === "list"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tables Display */}
      {filteredTables.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <p className="text-gray-500 mb-4">Không tìm thấy bàn nào</p>
          <button
            onClick={handleCreateTable}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Thêm bàn mới
          </button>
        </div>
      ) : viewMode === "grid" ? (
        // Grid View
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTables.map((table) => {
            const statusBadge = getStatusBadge(table.status);
            return (
              <div
                key={table.tableNumber}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-200 flex flex-col"
              >
                {/* Table Header */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-gray-800">
                    {table.tableNumber}
                  </h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}
                  >
                    {statusBadge.label}
                  </span>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 mb-2 text-gray-600">
                  <MapPin className="w-4 h-4" />

                  <span className="text-sm">{table.location || "Chưa xác định"}</span>
                </div>
                {table.qrToken != null && (
                  <QrCode className="w-5 h-5 text-blue-600" />

                )}

                {/* QR Token Created Date */}
                {table.qrTokenCreatedAt && (
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <span className="text-xs text-gray-600">
                      QR:{" "}
                      {new Date(table.qrTokenCreatedAt).toLocaleDateString(
                        "vi-VN"
                      )}
                    </span>
                  </div>
                )}

                {/* Current Order */}
                {table.currentOrderId && (
                  <div className="mb-2">
                    <span className="text-xs text-orange-600 font-medium">
                      Đơn hàng: #{table.currentOrderId}
                    </span>
                  </div>
                )}

                {/* Description */}
                {table.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {table.description}
                  </p>
                )}

                {/* Spacer */}
                <div className="flex-1"></div>

                {/* Actions */}
                <div className="space-y-2 pt-4 border-t border-gray-100 mt-auto">
                  {table.qrToken ? (
                    <button
                      onClick={() => handleGenerateQR(table)}
                      className="w-full px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <QrCode className="w-4 h-4" />
                      Xem QR Code
                    </button>
                  ) : (
                    <div className="w-full px-3 py-2 bg-gray-50 text-gray-400 rounded-lg text-sm text-center">
                      Chưa có QR Code
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // List View
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
                  Ngày Tạo QR
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng Thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Đơn Hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  QR Code
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao Tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTables.map((table) => {
                const statusBadge = getStatusBadge(table.status);
                return (
                  <tr key={table.tableNumber} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-lg font-semibold text-gray-800">
                        {table.tableNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-gray-700">
                        <MapPin className="w-4 h-4" />
                        {table.location || "Chưa xác định"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Users className="w-4 h-4" />
                        {table.capacity} người
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">
                          {table.qrTokenCreatedAt
                            ? new Date(
                                table.qrTokenCreatedAt
                              ).toLocaleDateString("vi-VN", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              })
                            : "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}
                      >
                        {statusBadge.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {table.currentOrderId ? (
                        <span className="text-xs text-orange-600 font-medium">
                          #{table.currentOrderId}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {table.qrToken ? (
                        <button
                          onClick={() => handleGenerateQR(table)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <QrCode className="w-5 h-5" />
                        </button>
                      ) : (
                        <span className="text-gray-400 text-sm">Chưa có</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex gap-2 justify-end">
                        {table.qrToken && (
                          <button
                            onClick={() => handleGenerateQR(table)}
                            className="px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors text-sm font-medium"
                          >
                            QR
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && selectedTable && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => setShowQRModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                QR Code - {selectedTable.tableNumber}
              </h2>
              <p className="text-gray-600 text-sm">Quét mã để truy cập menu</p>
            </div>

            {/* QR Code Display */}
            <div className="bg-white p-6 rounded-xl border-4 border-blue-100 flex justify-center mb-6">
              <QRCodeCanvas
                id="qr-code-canvas"
                value={getQRValue(selectedTable)}
                size={256}
                level="H"
                includeMargin={true}
              />
            </div>

            {/* Table Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Bàn:</span>
                <span className="font-semibold text-gray-800">
                  {selectedTable.tableNumber}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Khu vực:</span>
                <span className="font-semibold text-gray-800">
                  {selectedTable.location}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Sức chứa:</span>
                <span className="font-semibold text-gray-800">
                  {selectedTable.capacity} người
                </span>
              </div>
              {selectedTable.qrTokenCreatedAt && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Ngày tạo QR:</span>
                  <span className="font-semibold text-gray-800">
                    {new Date(
                      selectedTable.qrTokenCreatedAt
                    ).toLocaleDateString("vi-VN")}
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleDownloadQR}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors font-medium"
              >
                <Download className="w-5 h-5" />
                Tải xuống
              </button>
              <button
                onClick={() => setShowQRModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg transition-colors font-medium"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TablesScreen;
