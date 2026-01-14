import { useState, useEffect, useCallback } from "react";
import { Plus, ShoppingCart, AlertTriangle } from "lucide-react";

// Components
import OrderFilterBar from "../../components/orders/OrderFilterBar";
import OrderCard from "../../components/orders/OrderCard";
import OrderListView from "../../components/orders/OrderListView";
import OrderForm from "../../components/orders/OrderForm";
import OrderDetailViewModal from "../../components/orders/OrderDetailViewModal";
import AlertModal from "../../components/Modal/AlertModal";
import LoadingOverlay from "../../components/SpinnerLoad/LoadingOverlay";
import Pagination from "../../components/SpinnerLoad/Pagination";

// Services & Utils
import * as orderService from "../../services/orderService";
import * as menuService from "../../services/menuService";
import * as modifierService from "../../services/modifierService";
import * as tableService from "../../services/tableService";
import { filterAndSortOrders } from "../../utils/orderUtils";
import {
  STATUS_OPTIONS,
  MESSAGES,
  VIEW_MODES,
  SORT_OPTIONS,
  ORDER_STATUS,
  ORDER_DETAIL_STATUS,
  ORDER_STATUS_LABELS,
  DEFAULT_PREP_TIME,
} from "../../constants/orderConstants";

// Socket hooks for real-time updates
import { useOrderSocket } from "../../hooks/useOrderSocket";

/**
 * OrderManagementContent - Màn hình quản lý đơn hàng trong Dashboard
 * Hiển thị danh sách đơn hàng với các chức năng:
 * - Lọc theo trạng thái
 * - Tìm kiếm theo bàn/mã đơn
 * - Sắp xếp
 * - Xem dạng lưới hoặc danh sách
 * - Thêm, chỉnh sửa, xóa đơn hàng
 * - Hỗ trợ modifier cho món ăn
 * - Highlight đơn hàng quá thời gian chuẩn bị
 */
const OrderManagementContent = () => {
  // ==================== STATE MANAGEMENT ====================

  // State quản lý dữ liệu
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [tables, setTables] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [modifierGroups, setModifierGroups] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);

  // State quản lý UI
  const [viewMode, setViewMode] = useState(VIEW_MODES.GRID);
  const [showForm, setShowForm] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [viewingOrder, setViewingOrder] = useState(null);
  const [isLoadingForm, setIsLoadingForm] = useState(false);

  // State quản lý filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt-desc");

  // State quản lý pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // State quản lý modals
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  });

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    type: "warning",
    confirmText: "Xác nhận",
    items: [], // Danh sách items để hiển thị
  });

  // Prep time configuration (có thể lấy từ API settings sau)
  const [prepTime, setPrepTime] = useState(DEFAULT_PREP_TIME);

  // ==================== SOCKET REAL-TIME UPDATES ====================

  // Handler for new order created (from other tabs/users)
  const handleSocketOrderCreated = useCallback(async (data) => {
    console.log("🔔 [Socket] New order created:", data);
    try {
      // Fetch full order details
      const orderDetail = await orderService.fetchOrderById(data.orderId);
      setOrders((prev) => {
        // Check if order already exists
        if (prev.some((o) => o.id === data.orderId)) return prev;
        return [orderDetail, ...prev];
      });
    } catch (error) {
      console.error("Failed to fetch new order details:", error);
    }
  }, []);

  // Handler for order updated (from other tabs/users)
  const handleSocketOrderUpdated = useCallback(async (data) => {
    try {
      // Fetch updated order details
      const updatedOrder = await orderService.fetchOrderById(data.orderId);
      setOrders((prev) =>
        prev.map((order) => (order.id === data.orderId ? updatedOrder : order))
      );
    } catch (error) {
      console.error("Failed to fetch updated order:", error);
      // Fallback: update with socket data
      setOrders((prev) =>
        prev.map((order) =>
          order.id === data.orderId ? { ...order, ...data } : order
        )
      );
    }
  }, []);

  // Handler for order detail updated (dish status changed)
  const handleSocketOrderDetailUpdated = useCallback(async (data) => {
    console.log("🔔 [Socket] Order detail updated:", data);
    try {
      // Fetch updated order to get all items
      const updatedOrder = await orderService.fetchOrderById(data.orderId);
      setOrders((prev) =>
        prev.map((order) => (order.id === data.orderId ? updatedOrder : order))
      );
    } catch (error) {
      console.error("Failed to fetch order after detail update:", error);
    }
  }, []);

  // Handler for order deleted
  const handleSocketOrderDeleted = useCallback((data) => {
    console.log("🔔 [Socket] Order deleted:", data);
    setOrders((prev) => prev.filter((order) => order.id !== data.orderId));
  }, []);

  // Connect socket listeners and get connection status
  const { isConnected: socketConnected } = useOrderSocket({
    onOrderCreated: handleSocketOrderCreated,
    onOrderUpdated: handleSocketOrderUpdated,
    onOrderDetailUpdated: handleSocketOrderDetailUpdated,
    onOrderDeleted: handleSocketOrderDeleted,
  });

  // ==================== LIFECYCLE ====================

  // Fetch dữ liệu ban đầu
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Fetch orders khi pagination thay đổi
  useEffect(() => {
    fetchOrdersWithPagination();
  }, [currentPage, itemsPerPage, statusFilter]);

  // Filter và sort phía client (chỉ áp dụng cho search và sort)
  useEffect(() => {
    const filtered = filterAndSortOrders(
      orders,
      searchTerm,
      "",  // Bỏ statusFilter vì đã filter ở backend
      sortBy
    );
    setFilteredOrders(filtered);
  }, [orders, searchTerm, sortBy]);

  // ==================== API CALLS ====================

  /**
   * Fetch orders với pagination
   */
  const fetchOrdersWithPagination = async () => {
    try {
      const result = await orderService.fetchOrders({
        status: statusFilter,
        pageNumber: currentPage,
        pageSize: itemsPerPage,
      });

      // Kiểm tra nếu có pagination (backend trả về object)
      if (result.pagination) {
        const ordersWithDetails = result.data.map((order) => ({
          ...order,
          items: order.items || [],
        }));
        setOrders(ordersWithDetails);
        // Pagination info đã có trong result.pagination
      } else {
        // Fallback: không có pagination
        const ordersWithDetails = result.map((order) => ({
          ...order,
          items: order.items || [],
        }));
        setOrders(ordersWithDetails);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  /**
   * Fetch tất cả dữ liệu ban đầu
   */
  const fetchInitialData = async () => {
    try {
      setInitialLoading(true);
      const [tablesData, menuData, modifierData] = await Promise.all([
        tableService.fetchTables(),
        menuService.fetchMenuItems(),
        modifierService.fetchModifierGroups(),
      ]);

      // Orders sẽ được fetch riêng với pagination
      setTables(tablesData);
      setMenuItems(menuData);
      setModifierGroups(modifierData);
    } catch (error) {
      console.error("Error fetching initial data:", error);
      showAlert(
        "error",
        "Lỗi tải dữ liệu",
        "Không thể tải dữ liệu ban đầu. Vui lòng thử lại."
      );
    } finally {
      setInitialLoading(false);
    }
  };

  /**
   * Thêm đơn hàng mới
   */
  const handleCreateOrder = async (_, orderData) => {
    try {
      await orderService.createOrder(orderData);
      setShowForm(false);
      showAlert("Thành công", MESSAGES.CREATE_SUCCESS, "success");
    } catch (error) {
      console.error("Create order error:", error);
      showAlert("Lỗi", error.message || MESSAGES.CREATE_ERROR, "error");
      throw error;
    }
  };

  /**
   * Cập nhật đơn hàng
   */
  const handleUpdateOrder = async (orderId, orderData) => {
    try {
      await orderService.updateOrder(orderId, orderData);

      // Fetch lại chi tiết đơn hàng sau khi update
      const updatedOrder = await orderService.fetchOrderById(orderId);

      setOrders((prev) =>
        prev.map((order) => (order.id === orderId ? updatedOrder : order))
      );

      setShowForm(false);
      setEditingOrder(null);
      showAlert("Thành công", MESSAGES.UPDATE_SUCCESS, "success");
    } catch (error) {
      console.error("Update order error:", error);
      showAlert("Lỗi", error.message || MESSAGES.UPDATE_ERROR, "error");
      throw error;
    }
  };

  /**
   * Vô hiệu hóa (soft-delete) đơn hàng bằng cách cập nhật trạng thái thành CANCELLED
   */
  const handleDeleteOrder = async (orderId) => {
    try {
      await orderService.updateOrderStatus(orderId, ORDER_STATUS.CANCELLED);

      // Update local state: mark order as cancelled
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? { ...order, status: ORDER_STATUS.CANCELLED }
            : order
        )
      );

      showAlert("Thành công", "Đã hủy đơn hàng", "success");
    } catch (error) {
      console.error("Delete(order -> cancel) error:", error);
      showAlert("Lỗi", error.message || MESSAGES.DELETE_ERROR, "error");
    }
  };

  /**
   * Khôi phục đơn hàng (từ CANCELLED về PENDING)
   */
  const handleRestoreOrder = async (orderId) => {
    try {
      await orderService.restoreOrder(orderId, ORDER_STATUS.PENDING);

      // Update local state: restore order to PENDING
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? { ...order, status: ORDER_STATUS.PENDING }
            : order
        )
      );

      showAlert("Thành công", "Đã khôi phục đơn hàng", "success");
    } catch (error) {
      console.error("Restore order error:", error);
      showAlert(
        "Lỗi",
        error.message || "Không thể khôi phục đơn hàng",
        "error"
      );
    }
  };

  /**
   * Xóa vĩnh viễn đơn hàng
   */
  const handleDeleteOrderPermanent = async (orderId) => {
    try {
      await orderService.deleteOrderPermanent(orderId);

      // Remove from local state
      setOrders((prev) => prev.filter((order) => order.id !== orderId));

      showAlert("Thành công", "Đã xóa vĩnh viễn đơn hàng", "success");
    } catch (error) {
      console.error("Delete order permanently error:", error);
      showAlert(
        "Lỗi",
        error.message || "Không thể xóa vĩnh viễn đơn hàng",
        "error"
      );
    }
  };

  // ==================== HANDLERS ====================

  /**
   * Xử lý chuyển trạng thái đơn hàng
   * Kiểm tra items theo logic:
   * - Chuyển sang Approved (Xác nhận đơn): Kiểm tra các món chưa xác nhận (status == null), chuyển sang Pending
   * - Chuyển sang Pending (Bếp nhận đơn): Không cần kiểm tra, chuyển trực tiếp
   * - Chuyển sang Completed (Hoàn thành): Kiểm tra các món Pending, chuyển sang Ready
   * - Chuyển sang Served (Đã phục vụ): Kiểm tra các món chưa Served, chuyển sang Served
   */
  const handleStatusChange = async (order, newStatus) => {
    const items = order.items || [];
    
    // Xác định logic kiểm tra dựa trên trạng thái mới
    let unfinishedItems = [];
    let targetItemStatus = "";
    let warningMessage = "";
    let actionDescription = "";

    switch (newStatus) {
      case ORDER_STATUS.APPROVED:
        // Chuyển sang Approved (Xác nhận đơn) -> Kiểm tra món chưa xác nhận (status == null)
        unfinishedItems = items.filter(
          (item) => !item.status || item.status === null
        );
        targetItemStatus = ORDER_DETAIL_STATUS.PENDING;
        warningMessage = `Đơn hàng có ${unfinishedItems.length} món chưa được xác nhận.`;
        actionDescription = `chuyển sang Chờ xử lý (Pending)`;
        break;

      case ORDER_STATUS.PENDING:
        // Chuyển sang Pending (Bếp nhận đơn) -> Không cần kiểm tra, chuyển trực tiếp
        await executeStatusChange(order, newStatus, null, null);
        return;

      case ORDER_STATUS.COMPLETED:
        // Chuyển sang Completed (Hoàn thành) -> Kiểm tra món Pending
        unfinishedItems = items.filter(
          (item) => item.status === ORDER_DETAIL_STATUS.PENDING
        );
        targetItemStatus = ORDER_DETAIL_STATUS.READY;
        warningMessage = `Đơn hàng có ${unfinishedItems.length} món chưa sẵn sàng.`;
        actionDescription = `chuyển sang Sẵn sàng (Ready)`;
        break;

      case ORDER_STATUS.SERVED:
        // Chuyển sang Served (Đã phục vụ) -> Kiểm tra món chưa Served
        unfinishedItems = items.filter(
          (item) =>
            item.status !== ORDER_DETAIL_STATUS.SERVED &&
            item.status !== ORDER_DETAIL_STATUS.CANCELLED
        );
        targetItemStatus = ORDER_DETAIL_STATUS.SERVED;
        warningMessage = `Đơn hàng có ${unfinishedItems.length} món chưa được phục vụ.`;
        actionDescription = `chuyển sang Đã phục vụ (Served)`;
        break;

      default:
        // Các trạng thái khác không cần kiểm tra
        await executeStatusChange(order, newStatus, null, null);
        return;
    }

    if (unfinishedItems.length > 0) {
      // Hiển confirm modal với thông tin chi tiết
      setConfirmDialog({
        isOpen: true,
        title: "Xác nhận chuyển trạng thái",
        message: `${warningMessage}\n\nCác món này sẽ được ${actionDescription} khi chuyển đơn hàng sang ${ORDER_STATUS_LABELS[newStatus]}.\n\nBạn có chắc chắn muốn tiếp tục?`,
        type: "warning",
        confirmText: "Xác nhận",
        items: unfinishedItems,
        onConfirm: async () => {
          setConfirmDialog({ isOpen: false, title: "", message: "", onConfirm: null, items: [] });
          await executeStatusChange(order, newStatus, unfinishedItems, targetItemStatus);
        },
      });
    } else {
      // Không có items cần update, chuyển trạng thái trực tiếp
      await executeStatusChange(order, newStatus, null, null);
    }
  };

  /**
   * Thực hiện chuyển trạng thái đơn hàng
   * @param {Object} order - Đơn hàng
   * @param {string} newStatus - Trạng thái mới của đơn
   * @param {Array|null} itemsToUpdate - Danh sách items cần update (null nếu không cần)
   * @param {string|null} targetItemStatus - Trạng thái đích của items (null nếu không cần)
   */
  const executeStatusChange = async (order, newStatus, itemsToUpdate, targetItemStatus) => {
    try {
      // Nếu cần update items trước
      if (itemsToUpdate && itemsToUpdate.length > 0 && targetItemStatus) {
        // Update từng item sang trạng thái đích
        for (const item of itemsToUpdate) {
          await orderService.updateOrderDetailStatus(
            order.id,
            item.id,
            targetItemStatus
          );
        }
      }

      // Update trạng thái order
      await orderService.updateOrderStatus(order.id, newStatus);

      // Fetch lại order để cập nhật state
      const updatedOrder = await orderService.fetchOrderById(order.id);
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? updatedOrder : o))
      );

      showAlert(
        "Thành công",
        `Đã chuyển đơn hàng sang ${ORDER_STATUS_LABELS[newStatus]}`,
        "success"
      );
    } catch (error) {
      console.error("Status change error:", error);
      showAlert(
        "Lỗi",
        error.message || "Không thể chuyển trạng thái đơn hàng",
        "error"
      );
    }
  };

  /**
   * Xử lý submit form
   */
  const handleFormSubmit = async (orderId, orderData) => {
    if (editingOrder) {
      await handleUpdateOrder(orderId, orderData);
    } else {
      await handleCreateOrder(null, orderData);
    }
  };

  /**
   * Xử lý đóng form
   */
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingOrder(null);
  };

  /**
   * Xử lý click view details (xem chi tiết đơn hàng)
   */
  const handleViewClick = async (order) => {
    setIsLoadingForm(true);
    try {
      // API trả về { ...order, items } trực tiếp với items đã bao gồm modifiers
      const orderWithDetails = await orderService.fetchOrderByIdWithDetails(order.id);

      setViewingOrder(orderWithDetails);
      setShowDetailModal(true);
    } catch (error) {
      console.error("Error fetching order details:", error);
      setViewingOrder(order);
      setShowDetailModal(true);
    } finally {
      setIsLoadingForm(false);
    }
  };

  /**
   * Xử lý click delete
   */
  const handleDeleteClick = (order) => {
    setConfirmDialog({
      isOpen: true,
      title: "Xác nhận hủy đơn hàng",
      message: `Bạn có chắc chắn muốn hủy (vô hiệu hóa) đơn hàng #${order.id}?`,
      items: [],
      confirmText: "Xác nhận hủy",
      onConfirm: () => {
        handleDeleteOrder(order.id);
        setConfirmDialog({ isOpen: false, title: "", message: "", onConfirm: null, items: [] });
      },
    });
  };

  /**
   * Xử lý click restore
   */
  const handleRestoreClick = (order) => {
    setConfirmDialog({
      isOpen: true,
      title: "Xác nhận khôi phục",
      message: `Bạn có chắc chắn muốn khôi phục đơn hàng #${order.id}?`,
      items: [],
      confirmText: "Khôi phục",
      onConfirm: () => {
        handleRestoreOrder(order.id);
        setConfirmDialog({ isOpen: false, title: "", message: "", onConfirm: null, items: [] });
      },
    });
  };

  /**
   * Xử lý click permanent delete
   */
  const handleDeletePermanentClick = (order) => {
    setConfirmDialog({
      isOpen: true,
      title: "Xác nhận xóa vĩnh viễn",
      message: `Bạn có chắc chắn muốn xóa vĩnh viễn đơn hàng #${order.id}? Hành động này không thể hoàn tác!`,
      items: [],
      confirmText: "Xóa vĩnh viễn",
      onConfirm: () => {
        handleDeleteOrderPermanent(order.id);
        setConfirmDialog({ isOpen: false, title: "", message: "", onConfirm: null, items: [] });
      },
    });
  };

  /**
   * Xử lý thêm đơn hàng mới
   */
  const handleAddNew = () => {
    setEditingOrder(null);
    setShowForm(true);
  };

  /**
   * Hiển thị alert
   */
  const showAlert = (title, message, type = "success") => {
    setAlertModal({
      isOpen: true,
      title,
      message,
      type,
    });
  };

  // ==================== STATISTICS ====================

  const stats = {
    total: orders.length,
    pending: orders.filter((order) => order.status === ORDER_STATUS.PENDING)
      .length,
    completed: orders.filter((order) => order.status === ORDER_STATUS.COMPLETED)
      .length,
    cancelled: orders.filter((order) => order.status === ORDER_STATUS.CANCELLED)
      .length,
  };

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      <div>
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Quản Lý Đơn Hàng
              </h1>
              <p className="text-gray-600 mt-1">
                Tổng số: {filteredOrders.length} đơn hàng | Trang {currentPage}{" "}
                / {Math.ceil(filteredOrders.length / itemsPerPage) || 1}
                {/* Socket connection indicator */}
                <span
                  className={`ml-3 inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${socketConnected
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                    }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${socketConnected ? "bg-green-500" : "bg-red-500"
                      }`}
                  ></span>
                  {socketConnected ? "Live" : "Offline"}
                </span>
              </p>
            </div>
            <button
              onClick={handleAddNew}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-semibold shadow-md hover:shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Thêm Đơn Hàng
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Tổng số</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.total}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Đang xử lý</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">
                  {stats.pending}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Hoàn thành</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {stats.completed}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Đã hủy</p>
                <p className="text-3xl font-bold text-red-600 mt-1">
                  {stats.cancelled}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <OrderFilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          sortBy={sortBy}
          onSortChange={setSortBy}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          statusOptions={STATUS_OPTIONS}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          sortOptions={SORT_OPTIONS}
        />

        {/* Content */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Không có đơn hàng nào
            </h3>
            <p className="text-gray-500 mb-4">
              Bắt đầu bằng cách thêm đơn hàng đầu tiên
            </p>
            <button
              onClick={handleAddNew}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              Thêm Đơn Hàng
            </button>
          </div>
        ) : null}

        {/* Pagination logic */}
        {filteredOrders.length > 0 &&
          (() => {
            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const paginatedOrders = filteredOrders.slice(startIndex, endIndex);
            const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

            return (
              <>
                {viewMode === VIEW_MODES.GRID ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {paginatedOrders.map((order) => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        tables={tables}
                        onEdit={handleViewClick}
                        onDelete={handleDeleteClick}
                        onRestore={handleRestoreClick}
                        onDeletePermanent={handleDeletePermanentClick}
                        onStatusChange={handleStatusChange}
                        prepTime={prepTime}
                      />
                    ))}
                  </div>
                ) : (
                  <OrderListView
                    orders={paginatedOrders}
                    tables={tables}
                    onEdit={handleViewClick}
                    onDelete={handleDeleteClick}
                    onRestore={handleRestoreClick}
                    onDeletePermanent={handleDeletePermanentClick}
                    onStatusChange={handleStatusChange}
                    prepTime={prepTime}
                  />
                )}

                {/* Pagination */}
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredOrders.length}
                  pageSize={itemsPerPage}
                  onPageChange={(page) => setCurrentPage(page)}
                  onPageSizeChange={(size) => {
                    setItemsPerPage(size);
                    setCurrentPage(1);
                  }}
                  pageSizeOptions={[5, 10, 20, 50]}
                />
              </>
            );
          })()}

        {/* Loading Overlay */}
        {isLoadingForm && (
          <LoadingOverlay message="Đang tải dữ liệu đơn hàng..." />
        )}

        {/* Form Modal - For creating new orders */}
        {showForm && (
          <OrderForm
            order={editingOrder}
            tables={tables}
            menuItems={menuItems}
            modifierGroups={modifierGroups}
            onSubmit={handleFormSubmit}
            onClose={handleCloseForm}
          />
        )}

        {/* Detail View Modal - For viewing order details (read-only) */}
        {showDetailModal && (
          <OrderDetailViewModal
            order={viewingOrder}
            tables={tables}
            onClose={() => {
              setShowDetailModal(false);
              setViewingOrder(null);
            }}
          />
        )}

        {/* Alert Modal */}
        <AlertModal
          isOpen={alertModal.isOpen}
          onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
          title={alertModal.title}
          message={alertModal.message}
          type={alertModal.type}
        />

        {/* Confirm Modal với danh sách items */}
        {confirmDialog.isOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-amber-50 border-b border-amber-200 p-5">
                <h3 className="text-xl font-bold text-amber-800 flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6 text-amber-600" />
                  {confirmDialog.title}
                </h3>
              </div>

              {/* Content */}
              <div className="p-5">
                {/* Hiển thị danh sách items nếu có */}
                {confirmDialog.items && confirmDialog.items.length > 0 && (
                  <>
                    <p className="text-gray-700 mb-4">
                      Đơn hàng có <span className="font-bold text-red-600">{confirmDialog.items.length} món</span> cần xử lý:
                    </p>

                    <div className="bg-gray-50 rounded-lg p-3 mb-4 max-h-40 overflow-y-auto">
                      {confirmDialog.items.map((item, idx) => (
                        <div key={item.id || idx} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                          <span className="font-medium text-gray-800">{item.name || item.dishName}</span>
                          <span className="text-orange-600 font-bold">x{item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <p className="text-gray-600 text-sm whitespace-pre-line">
                  {confirmDialog.message}
                </p>
              </div>

              {/* Actions */}
              <div className="p-5 bg-gray-50 border-t border-gray-200 flex gap-3">
                <button
                  onClick={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
                  className="flex-1 py-2.5 px-4 rounded-lg font-semibold border-2 border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={confirmDialog.onConfirm}
                  className="flex-1 py-2.5 px-4 rounded-lg font-semibold bg-amber-500 text-white hover:bg-amber-600 transition-colors"
                >
                  {confirmDialog.confirmText || "Xác nhận"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderManagementContent;
