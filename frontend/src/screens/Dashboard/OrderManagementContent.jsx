import { useState, useEffect } from "react";
import { Plus, ShoppingCart, AlertTriangle } from "lucide-react";

// Components
import OrderFilterBar from "../../components/orders/OrderFilterBar";
import OrderCard from "../../components/orders/OrderCard";
import OrderListView from "../../components/orders/OrderListView";
import OrderForm from "../../components/orders/OrderForm";
import AlertModal from "../../components/Modal/AlertModal";
import ConfirmModal from "../../components/Modal/ConfirmModal";
import LoadingOverlay from "../../components/SpinnerLoad/LoadingOverlay";

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
  DEFAULT_PREP_TIME,
} from "../../constants/orderConstants";

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
  const [editingOrder, setEditingOrder] = useState(null);
  const [isLoadingForm, setIsLoadingForm] = useState(false);

  // State quản lý filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt-desc");

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
  });

  // Prep time configuration (có thể lấy từ API settings sau)
  const [prepTime, setPrepTime] = useState(DEFAULT_PREP_TIME);

  // ==================== LIFECYCLE ====================

  // Fetch dữ liệu ban đầu
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Filter và sort phía client
  useEffect(() => {
    const filtered = filterAndSortOrders(
      orders,
      searchTerm,
      statusFilter,
      sortBy
    );
    setFilteredOrders(filtered);
  }, [orders, searchTerm, sortBy, statusFilter]);

  // ==================== API CALLS ====================

  /**
   * Fetch tất cả dữ liệu ban đầu
   */
  const fetchInitialData = async () => {
    try {
      setInitialLoading(true);
      const [ordersData, tablesData, menuData, modifierData] =
        await Promise.all([
          orderService.fetchOrders(),
          tableService.fetchTables(),
          menuService.fetchMenuItems(),
          modifierService.fetchModifierGroups(),
        ]);

      // Process orders với thông tin bổ sung
      const ordersWithDetails = await Promise.all(
        ordersData.map(async (order) => {
          try {
            // Fetch chi tiết đơn hàng để có đầy đủ items
            const orderDetail = await orderService.fetchOrderById(order.id);
            return {
              ...order,
              items: orderDetail.items || [],
            };
          } catch (error) {
            console.warn(
              `Failed to fetch details for order ${order.id}:`,
              error
            );
            return order;
          }
        })
      );

      setOrders(ordersWithDetails);
      setTables(Array.isArray(tablesData) ? tablesData : tablesData.data || []);

      // Process menu items
      const menuList = Array.isArray(menuData) ? menuData : menuData.data || [];
      setMenuItems(menuList);

      setModifierGroups(modifierData.data || modifierData || []);
    } catch (error) {
      console.error("Fetch initial data error:", error);
      showAlert("Lỗi", MESSAGES.FETCH_ERROR, "error");
    } finally {
      setInitialLoading(false);
    }
  };

  /**
   * Thêm đơn hàng mới
   */
  const handleCreateOrder = async (_, orderData) => {
    try {
      const newOrder = await orderService.createOrder(orderData);

      // Fetch chi tiết đơn hàng vừa tạo để có đầy đủ thông tin
      const orderDetail = await orderService.fetchOrderById(
        newOrder.id || newOrder.tableId
      );

      setOrders((prev) => [orderDetail, ...prev]);
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
   * Xóa đơn hàng
   */
  const handleDeleteOrder = async (orderId) => {
    try {
      await orderService.deleteOrder(orderId);
      setOrders((prev) => prev.filter((order) => order.id !== orderId));
      showAlert("Thành công", MESSAGES.DELETE_SUCCESS, "success");
    } catch (error) {
      console.error("Delete order error:", error);
      showAlert("Lỗi", error.message || MESSAGES.DELETE_ERROR, "error");
    }
  };

  // ==================== HANDLERS ====================

  /**
   * Xử lý submit form
   */
  const handleFormSubmit = async (orderId, orderData) => {
    if (editingOrder) {
      await handleUpdateOrder(orderId || editingOrder.id, orderData);
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
   * Xử lý click edit
   */
  const handleEditClick = async (order) => {
    setIsLoadingForm(true);
    try {
      // Fetch chi tiết đơn hàng nếu chưa có đầy đủ items
      let orderDetail = order;
      if (!order.items || order.items.length === 0) {
        orderDetail = await orderService.fetchOrderById(order.id);
      }

      setEditingOrder(orderDetail);
      setShowForm(true);
    } catch (error) {
      console.error("Error fetching order details:", error);
      setEditingOrder(order);
      setShowForm(true);
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
      title: "Xác nhận xóa",
      message: `Bạn có chắc chắn muốn xóa đơn hàng #${order.id}?`,
      onConfirm: () => {
        handleDeleteOrder(order.id);
        setConfirmDialog({
          isOpen: false,
          title: "",
          message: "",
          onConfirm: null,
        });
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
                Tổng số: {filteredOrders.length} đơn hàng
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
        ) : viewMode === VIEW_MODES.GRID ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                prepTime={prepTime}
              />
            ))}
          </div>
        ) : (
          <OrderListView
            orders={filteredOrders}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
            prepTime={prepTime}
          />
        )}

        {/* Loading Overlay */}
        {isLoadingForm && (
          <LoadingOverlay message="Đang tải dữ liệu đơn hàng..." />
        )}

        {/* Form Modal */}
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

        {/* Alert Modal */}
        <AlertModal
          isOpen={alertModal.isOpen}
          onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
          title={alertModal.title}
          message={alertModal.message}
          type={alertModal.type}
        />

        {/* Confirm Modal */}
        <ConfirmModal
          isOpen={confirmDialog.isOpen}
          onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
          onConfirm={confirmDialog.onConfirm}
          title={confirmDialog.title}
          message={confirmDialog.message}
        />
      </div>
    </div>
  );
};

export default OrderManagementContent;
