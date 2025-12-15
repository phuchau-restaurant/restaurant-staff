import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Filter, Search, Grid, List, QrCode, Users, MapPin, Check, X, Calendar, UserCheck, UserX } from "lucide-react";
import { getAllTables, updateTable } from "../data/mockTables";
import TableStatus from "../../constants/tableStatus";

const TablesScreen = () => {
  const navigate = useNavigate();
  const [tables, setTables] = useState([]);
  const [filteredTables, setFilteredTables] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState("all"); // all, active, inactive
  const [areaFilter, setAreaFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("tableNumber"); // tableNumber, capacity, createdAt
  
  // Fetch tables from API
  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      setIsLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const data = getAllTables();
      setTables(data);
    } catch (error) {
      console.error("Error fetching tables:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and sort tables
  useEffect(() => {
    let result = [...tables];

    // Filter by status
    if (statusFilter !== "all") {
      result = result.filter((table) =>
        statusFilter === "active" ? table.isActive : !table.isActive
      );
    }

    // Filter by area
    if (areaFilter !== "all") {
      result = result.filter((table) => table.area === areaFilter);
    }

    // Filter by search term
    if (searchTerm) {
      result = result.filter(
        (table) =>
          table.tableNumber.toString().includes(searchTerm) ||
          table.area?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === "tableNumber") {
        return a.tableNumber - b.tableNumber;
      } else if (sortBy === "capacity") {
        return b.capacity - a.capacity;
      } else if (sortBy === "createdAt") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return 0;
    });

    setFilteredTables(result);
  }, [tables, statusFilter, areaFilter, searchTerm, sortBy]);

  // Get unique areas for filter
  const areas = [...new Set(tables.map((t) => t.area).filter(Boolean))];

  const handleCreateTable = () => {
    navigate("/tables/new");
  };

  const handleEditTable = (id) => {
    navigate(`/tables/edit/${id}`);
  };

  const toggleTableStatus = async (tableId, currentStatus) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      updateTable(tableId, { isActive: !currentStatus });
      
      // Refresh tables
      fetchTables();
    } catch (error) {
      console.error("Error updating table status:", error);
    }
  };

  const toggleOccupiedStatus = async (tableId, currentStatus) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const newStatus = currentStatus === TableStatus.OCCUPIED 
        ? TableStatus.AVAILABLE 
        : TableStatus.OCCUPIED;
      
      updateTable(tableId, { status: newStatus });
      
      // Refresh tables
      fetchTables();
    } catch (error) {
      console.error("Error updating occupied status:", error);
    }
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
          <div className="flex items-center gap-4">
            <img 
              src="/images/logo.png" 
              alt="Restaurant Logo" 
              className="h-16 w-16 object-contain"
            />
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Quản Lý Bàn</h1>
              <p className="text-gray-600 mt-1">
                Tổng số: {filteredTables.length} bàn
              </p>
            </div>
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
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Không hoạt động</option>
            </select>

            {/* Area Filter */}
            <select
              value={areaFilter}
              onChange={(e) => setAreaFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả khu vực</option>
              {areas.map((area) => (
                <option key={area} value={area}>
                  {area}
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
          {filteredTables.map((table) => (
            <div
              key={table.id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-200 flex flex-col"
            >
              {/* Table Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-bold text-gray-800">
                    Bàn {table.tableNumber}
                  </h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      table.status === TableStatus.OCCUPIED
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {table.status === TableStatus.OCCUPIED ? "Có khách" : "Trống"}
                  </span>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    table.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {table.isActive ? "Hoạt động" : "Không hoạt động"}
                </span>
              </div>
              
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{table.area || "Chưa xác định"}</span>
                </div>
                {table.hasQR && (
                  <QrCode className="w-5 h-5 text-blue-600" />
                )}
              </div>

              {/* Capacity */}
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-gray-500" />
                <span className="text-gray-700">
                  Sức chứa: {table.capacity} người
                </span>
              </div>

              {/* Created Date */}
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {new Date(table.createdAt).toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
                </span>
              </div>

              {/* Description */}
              {table.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {table.description}
                </p>
              )}

              {/* Spacer to push actions to bottom */}
              <div className="flex-1"></div>

              {/* Actions */}
              <div className="space-y-2 pt-4 border-t border-gray-100 mt-auto">
                <button
                  onClick={() => handleEditTable(table.id)}
                  className="w-full px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                >
                  Chỉnh sửa
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => toggleOccupiedStatus(table.id, table.status)}
                    className={`px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                      table.status === TableStatus.OCCUPIED
                        ? "bg-red-50 text-red-600 hover:bg-red-100"
                        : "bg-green-50 text-green-600 hover:bg-green-100"
                    }`}
                    title={table.status === TableStatus.OCCUPIED ? "Đánh dấu trống" : "Đánh dấu có khách"}
                    disabled={!table.isActive}
                  >
                    {table.status === TableStatus.OCCUPIED ? "Trống" : "Có khách"}
                  </button>
                  <button
                    onClick={() => toggleTableStatus(table.id, table.isActive)}
                    className={`px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                      table.isActive
                        ? "bg-red-50 text-red-600 hover:bg-red-100"
                        : "bg-green-50 text-green-600 hover:bg-green-100"
                    }`}
                    title={table.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
                  >
                    {table.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
                  </button>
                </div>
              </div>
            </div>
          ))}
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
                  Ngày Tạo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng Thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tình Trạng
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
              {filteredTables.map((table) => (
                <tr key={table.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-lg font-semibold text-gray-800">
                      Bàn {table.tableNumber}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-gray-700">
                      <MapPin className="w-4 h-4" />
                      {table.area || "Chưa xác định"}
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
                        {new Date(table.createdAt).toLocaleDateString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        table.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {table.isActive ? "Hoạt động" : "Không hoạt động"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        table.status === TableStatus.OCCUPIED
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {table.status === TableStatus.OCCUPIED ? "Có khách" : "Trống"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">                    {table.hasQR ? (
                      <QrCode className="w-5 h-5 text-blue-600" />
                    ) : (
                      <span className="text-gray-400 text-sm">Chưa có</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => handleEditTable(table.id)}
                        className="px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors text-sm font-medium"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => toggleOccupiedStatus(table.id, table.status)}
                        className={`px-3 py-1 rounded transition-colors text-sm font-medium ${
                          table.status === TableStatus.OCCUPIED
                            ? "bg-red-50 text-red-600 hover:bg-red-100"
                            : "bg-green-50 text-green-600 hover:bg-green-100"
                        }`}
                        disabled={!table.isActive}
                      >
                        {table.status === TableStatus.OCCUPIED ? "Trống" : "Có khách"}
                      </button>
                      <button
                        onClick={() => toggleTableStatus(table.id, table.isActive)}
                        className={`px-3 py-1 rounded transition-colors text-sm font-medium ${
                          table.isActive
                            ? "bg-red-50 text-red-600 hover:bg-red-100"
                            : "bg-green-50 text-green-600 hover:bg-green-100"
                        }`}
                      >
                        {table.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TablesScreen;
