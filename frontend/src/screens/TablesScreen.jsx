import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import TableStatus from "../../constants/tableStatus";

// Components
import TablesHeader from "../components/tables/TablesHeader";
import TablesFilterBar from "../components/tables/TablesFilterBar";
import TableCard from "../components/tables/TableCard";
import TableListView from "../components/tables/TableListView";
import TableFormInline from "../components/tables/TableFormInline";
import AlertModal from "../components/Modal/AlertModal";
import ConfirmModal from "../components/Modal/ConfirmModal";
import Pagination from "../components/SpinnerLoad/Pagination";
import { useAlert } from "../hooks/useAlert";

// QR Management Screen
import QRManagementScreen from "./QRManagementScreen";

// Services & Utils
import * as tableService from "../services/tableService";
import { filterAndSortTables } from "../utils/tableUtils";
import {
  STATUS_OPTIONS,
  DEACTIVATE_CONFIRMATION,
  WARNING_MESSAGES,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
} from "../constants/tableConstants";

// Socket hooks for real-time updates
import { useTableSocket } from "../hooks/useTableSocket";

/**
 * TablesScreen - Màn hình quản lý bàn
 * Hiển thị danh sách bàn với các chức năng:
 * - Lọc theo trạng thái, khu vực
 * - Tìm kiếm theo tên bàn, khu vực
 * - Sắp xếp theo tên bàn, sức chứa
 * - Xem dạng lưới hoặc danh sách
 * - Cập nhật trạng thái bàn (Trống/Có khách)
 */
const TablesScreen = () => {
  const navigate = useNavigate();
  const { alert, showSuccess, showError, showWarning, closeAlert } = useAlert();

  // State quản lý confirm dialog
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  // State quản lý dữ liệu
  const [tables, setTables] = useState([]);
  const [filteredTables, setFilteredTables] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  // State quản lý phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [paginationInfo, setPaginationInfo] = useState(null);

  // State quản lý UI
  const [viewMode, setViewMode] = useState("grid");
  const [showForm, setShowForm] = useState(false);
  const [editingTableId, setEditingTableId] = useState(null);
  const [showQRManagement, setShowQRManagement] = useState(false);

  // State quản lý filters
  const [statusFilter, setStatusFilter] = useState("");
  const [areaFilter, setAreaFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("tableNumber");

  // Options cho dropdowns
  const [areaOptions, setAreaOptions] = useState([{ value: "", label: "Tất cả khu vực" }]);

  // ==================== SOCKET REAL-TIME UPDATES ====================

  // Handler for table created (from other tabs/users)
  const handleSocketTableCreated = useCallback(async (data) => {
    console.log("🔔 [Socket] New table created:", data);
    await fetchTables(); // Re-fetch để có dữ liệu mới nhất
  }, [statusFilter, areaFilter, currentPage, pageSize]);

  // Handler for table updated (from other tabs/users)
  const handleSocketTableUpdated = useCallback(async (data) => {
    console.log("🔔 [Socket] Table updated:", data);
    await fetchTables(); // Re-fetch để có dữ liệu mới nhất
  }, [statusFilter, areaFilter, currentPage, pageSize]);

  // Handler for table deleted
  const handleSocketTableDeleted = useCallback((data) => {
    console.log("🔔 [Socket] Table deleted:", data);
    setTables((prev) => prev.filter((table) => table.id !== data.tableId));
  }, []);

  // Connect socket listeners and get connection status
  const { isConnected: socketConnected } = useTableSocket({
    onTableCreated: handleSocketTableCreated,
    onTableUpdated: handleSocketTableUpdated,
    onTableDeleted: handleSocketTableDeleted,
  });

  // ==================== LIFECYCLE ====================

  // Fetch dữ liệu ban đầu
  useEffect(() => {
    fetchTables();
    fetchLocationOptions();
  }, []);

  // Refetch khi filters hoặc pagination thay đổi (server-side filtering)
  useEffect(() => {
    fetchTables();
  }, [statusFilter, areaFilter, currentPage, pageSize]);

  // Filter và sort phía client (search và sort)
  useEffect(() => {
    handleFilterAndSort();
  }, [tables, searchTerm, sortBy]);

  // ==================== API CALLS ====================

  /**
   * Fetch danh sách bàn từ API
   * Filters: status, location (server-side)
   */
  const fetchTables = async () => {
    try {
      setIsFetching(true);
      const result = await tableService.fetchTables(statusFilter, areaFilter, {
        pageNumber: currentPage,
        pageSize: pageSize
      });
      
      // Xử lý response có pagination hoặc không
      if (result.pagination) {
        setTables(result.data);
        setPaginationInfo(result.pagination);
      } else {
        setTables(result);
        setPaginationInfo(null);
      }
    } catch (error) {
      console.error("Fetch tables error:", error);
      setTables([]);
    } finally {
      setIsFetching(false);
      setInitialLoading(false);
    }
  };

  /**
   * Xử lý thay đổi trang
   */
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  /**
   * Xử lý thay đổi số items mỗi trang
   */
  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setCurrentPage(1); // Reset về trang 1 khi thay đổi pageSize
  };

  /**
   * Fetch danh sách khu vực từ appsettings API
   */
  const fetchLocationOptions = async () => {
    try {
      const options = await tableService.fetchLocationOptions();
      setAreaOptions(options);
    } catch (error) {
      console.error("Fetch area options error:", error);
    }
  };

  /**
   * Cập nhật trạng thái bàn (Trống <-> Có khách)
   */
  const toggleOccupiedStatus = async (tableId, currentStatus) => {
    try {
      const newStatus =
        currentStatus === TableStatus.OCCUPIED
          ? TableStatus.AVAILABLE
          : TableStatus.OCCUPIED;

      await tableService.updateTableStatus(tableId, newStatus);
      fetchTables();
    } catch (error) {
      console.error("Error updating occupied status:", error);
      showError(error.message || ERROR_MESSAGES.UPDATE_STATUS_FAILED);
    }
  };

  /**
   * Kích hoạt/Vô hiệu hóa bàn
   */
  const toggleTableActive = async (tableId, currentStatus) => {
    // Kích hoạt bàn (INACTIVE -> AVAILABLE)
    if (currentStatus === TableStatus.INACTIVE) {
      try {
        await tableService.updateTableStatus(tableId, TableStatus.AVAILABLE);
        showSuccess(SUCCESS_MESSAGES.TABLE_ACTIVATED);
        fetchTables();
      } catch (error) {
        console.error("Error activating table:", error);
        showError(error.message || ERROR_MESSAGES.ACTIVATE_FAILED);
      }
      return;
    }

    // Cảnh báo nếu bàn đang có khách
    if (currentStatus === TableStatus.OCCUPIED) {
      showWarning(
        WARNING_MESSAGES.CANNOT_DEACTIVATE_OCCUPIED,
        "Không thể vô hiệu hóa"
      );
      return;
    }

    // Xác nhận vô hiệu hóa
    setConfirmDialog({
      isOpen: true,
      title: DEACTIVATE_CONFIRMATION.title,
      message: DEACTIVATE_CONFIRMATION.message,
      onConfirm: async () => {
        try {
          await tableService.updateTableStatus(tableId, TableStatus.INACTIVE);
          showSuccess(SUCCESS_MESSAGES.TABLE_DEACTIVATED);
          fetchTables();
        } catch (error) {
          console.error("Error deactivating table:", error);
          showError(error.message || ERROR_MESSAGES.DEACTIVATE_FAILED);
        }
      },
    });
  };

  // ==================== HELPERS ====================

  /**
   * Filter và sort tables phía client
   * - Filter: searchTerm (tìm kiếm tên bàn, khu vực)
   * - Sort: tableNumber, capacity, createdAt
   */
  const handleFilterAndSort = () => {
    const result = filterAndSortTables(tables, searchTerm, sortBy);
    setFilteredTables(result);
  };

  // ==================== HANDLERS ====================

  const handleCreateTable = useCallback(() => {
    setEditingTableId(null);
    setShowForm(true);
  }, []);

  const handleEditTable = useCallback((tableId) => {
    setEditingTableId(tableId);
    setShowForm(true);
  }, []);

  const handleCancelForm = useCallback(() => {
    setShowForm(false);
    setEditingTableId(null);
  }, []);

  const handleFormSuccess = useCallback(() => {
    setShowForm(false);
    setEditingTableId(null);
    fetchTables(); // Refresh danh sách bàn
  }, [statusFilter, areaFilter]);

  const handleManageQR = useCallback(() => {
    setShowQRManagement(true);
  }, []);

  const handleBackToTables = useCallback(() => {
    setShowQRManagement(false);
  }, []);

  // ==================== RENDER ====================

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="text-gray-500 font-medium">Đang tải dữ liệu...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      {/* QR Management View - Full Screen */}
      {showQRManagement ? (
        <div>
          {/* Back Button */}
          <div className="">
            <button
              onClick={handleBackToTables}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Quay lại danh sách bàn
            </button>
          </div>

          {/* QR Management Screen - Always Embedded */}
          <QRManagementScreen />
        </div>
      ) : (
        <>
          {/* Header - Only show when not in QR mode */}
          <TablesHeader
            totalTables={filteredTables.length}
            onCreateTable={handleCreateTable}
            onManageQR={handleManageQR}
            socketConnected={socketConnected}
          />
          {/* Filter Bar */}
          <TablesFilterBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            statusOptions={STATUS_OPTIONS}
            areaFilter={areaFilter}
            onAreaChange={setAreaFilter}
            areaOptions={areaOptions}
            sortBy={sortBy}
            onSortChange={setSortBy}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          {/* Tables Display */}
          <div className="mt-6">
            {showForm ? (
              // Form tạo/sửa bàn
              <TableFormInline
                tableId={editingTableId}
                onCancel={handleCancelForm}
                onSuccess={handleFormSuccess}
              />
            ) : filteredTables.length === 0 ? (
              // Empty state
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
                  <TableCard
                    key={table.id}
                    table={table}
                    onEdit={handleEditTable}
                    onToggleStatus={toggleOccupiedStatus}
                    onToggleActive={toggleTableActive}
                  />
                ))}
              </div>
            ) : (
              // List View
              <TableListView
                tables={filteredTables}
                onEdit={handleEditTable}
                onToggleStatus={toggleOccupiedStatus}
                onToggleActive={toggleTableActive}
              />
            )}

            {/* Pagination */}
            {paginationInfo && !showForm && (
              <Pagination
                currentPage={paginationInfo.pageNumber}
                totalPages={paginationInfo.totalPages}
                totalItems={paginationInfo.totalItems}
                pageSize={paginationInfo.pageSize}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                pageSizeOptions={[12, 24, 48, 96]}
              />
            )}
          </div>
        </>
      )}

      {/* Alert Modal */}
      <AlertModal
        isOpen={alert.isOpen}
        onClose={closeAlert}
        title={alert.title}
        message={alert.message}
        type={alert.type}
      />

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type="danger"
      />
    </div>
  );
};

export default TablesScreen;
