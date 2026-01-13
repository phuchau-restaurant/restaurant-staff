import React, { useState, useEffect, useMemo, useCallback } from "react";
import WaiterHeader from "../components/Waiter/WaiterHeader";
import WaiterOrdersGrid from "../components/Waiter/WaiterOrdersGrid";
import ConfirmModal from "../components/Modal/ConfirmModal";
import { useOrderSocket } from "../hooks/useOrderSocket";
import { useAuth } from "../context/AuthContext";
import { Search } from "lucide-react";
import * as waiterService from "../services/waiterService";
import {
  mapOrderFromApi,
  updateOrderItemInList,
  calculateElapsedTime,
  determineOrderStatus,
  filterOrdersBySearch,
  filterOutCancelledOrders,
  sortOrdersByTime,
} from "../utils/waiterUtils";

const WaiterScreen = () => {
  const { user, logout, updateUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchOrderId, setSearchOrderId] = useState("");
  const [activeTab, setActiveTab] = useState("new"); // "new" | "my"
  const [isLoading, setIsLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    orderId: null,
    unconfirmedItems: [],
  });

  // Cập nhật thời gian mỗi giây
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Helper: Fetch single order with details
  const fetchOrderDetails = useCallback(async (orderId) => {
    const order = await waiterService.fetchOrderDetails(orderId);
    return order ? mapOrderFromApi(order) : null;
  }, []);

  // Fetch đơn hàng chưa có người nhận (với chi tiết)
  const fetchUnassignedOrders = useCallback(async () => {
    try {
      const orders = await waiterService.fetchUnassignedOrders();
      // Fetch details for each order
      const ordersWithDetails = await Promise.all(
        orders.map(async (order) => {
          const fullOrder = await fetchOrderDetails(order.id);
          return fullOrder || {
            id: order.id,
            orderNumber: order.id,
            tableNumber: order.tableNumber || order.tableId,
            orderTime: new Date(order.createdAt),
            status: order.status,
            waiterId: order.waiterId,
            items: [],
          };
        })
      );
      setOrders(ordersWithDetails);
    } catch (error) {
      console.error("Error fetching unassigned orders:", error);
    }
  }, [fetchOrderDetails]);

  // Fetch đơn hàng của tôi (với chi tiết)
  const fetchMyOrders = useCallback(async () => {
    if (!user?.id) {
      console.log("⚠️ fetchMyOrders: No user.id");
      return;
    }
    try {
      console.log("📡 Fetching my orders for user:", user.id);
      const orders = await waiterService.fetchMyOrders(user.id);
      console.log("📦 Received my orders:", orders.length, orders.map(o => ({ id: o.id, status: o.status })));
      
      // Fetch details for each order
      const ordersWithDetails = await Promise.all(
        orders.map(async (order) => {
          const fullOrder = await fetchOrderDetails(order.id);
          return fullOrder || {
            id: order.id,
            orderNumber: order.id,
            tableNumber: order.tableNumber || order.tableId,
            orderTime: new Date(order.createdAt),
            status: order.status,
            waiterId: order.waiterId,
            items: [],
          };
        })
      );
      console.log("✅ Setting myOrders:", ordersWithDetails.length, ordersWithDetails.map(o => ({ id: o.id, status: o.status })));
      setMyOrders(ordersWithDetails);
    } catch (error) {
      console.error("Error fetching my orders:", error);
    }
  }, [user?.id, fetchOrderDetails]);

  // Fetch orders lần đầu
  useEffect(() => {
    const loadOrders = async () => {
      setIsLoading(true);
      await Promise.all([fetchUnassignedOrders(), fetchMyOrders()]);
      setIsLoading(false);
    };
    loadOrders();
  }, [fetchUnassignedOrders, fetchMyOrders]);

  // Hàm nhận đơn
  const handleClaimOrder = async (orderId, confirmUnconfirmed = false) => {
    if (!user?.id) {
      console.error("User not logged in");
      return;
    }
    try {
      const result = await waiterService.claimOrder(
        orderId,
        user.id,
        confirmUnconfirmed
      );

      // Nếu cần xác nhận món null
      if (result.needsConfirmation) {
        const unconfirmedItems = result.data.unconfirmedItems;
        setConfirmModal({
          isOpen: true,
          orderId: orderId,
          unconfirmedItems: unconfirmedItems,
        });
        return;
      }

      // Map order from response (now includes orderDetails)
      const claimedOrder = mapOrderFromApi(result.data);
      // Remove from unassigned list
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      // Add to my orders list
      setMyOrders((prev) => [claimedOrder, ...prev]);
      // Switch to my orders tab
      setActiveTab("my");
    } catch (error) {
      console.error("Error claiming order:", error);
    }
  };

  // Xử lý xác nhận món null từ modal
  const handleConfirmUnconfirmedItems = () => {
    const { orderId } = confirmModal;
    setConfirmModal({ isOpen: false, orderId: null, unconfirmedItems: [] });
    // Gọi lại API với confirmUnconfirmed = true
    handleClaimOrder(orderId, true);
  };

  // Hàm hủy món ăn
  const handleCancelItem = async (orderId, itemId) => {
    try {
      await waiterService.cancelOrderItem(orderId, itemId);
      // Update local state
      const updateOrders = (ordersList) =>
        updateOrderItemInList(ordersList, orderId, itemId, {
          status: "Cancelled",
          cancelled: true,
        });
      setOrders(updateOrders);
      setMyOrders(updateOrders);
    } catch (error) {
      console.error("Error cancelling item:", error);
    }
  };

  // Hàm xác nhận món ăn (chuyển sang Pending)
  const handleConfirmItem = async (orderId, itemId) => {
    try {
      await waiterService.confirmOrderItem(orderId, itemId);
      // Update local state
      const updateOrders = (ordersList) =>
        updateOrderItemInList(ordersList, orderId, itemId, {
          status: "Pending",
          cancelled: false,
          completed: false,
        });
      setOrders(updateOrders);
      setMyOrders(updateOrders);
    } catch (error) {
      console.error("Error confirming item:", error);
    }
  };

  // Hàm phục vụ món ăn (chuyển từ Ready sang Served)
  const handleServeItem = async (orderId, itemId) => {
    try {
      await waiterService.serveOrderItem(orderId, itemId);
      // Update local state
      const updateOrders = (ordersList) =>
        updateOrderItemInList(ordersList, orderId, itemId, {
          status: "Served",
          completed: true,
        });
      setOrders(updateOrders);
      setMyOrders(updateOrders);
    } catch (error) {
      console.error("Error serving item:", error);
    }
  };

  // Socket callbacks
  const handleOrderCreated = useCallback(async (data) => {
    console.log("🔔 New order created:", data);
    const newOrder = await fetchOrderDetails(data.orderId);
    if (newOrder && !newOrder.waiterId) {
      setOrders((prev) => [newOrder, ...prev]);
    }
  }, [fetchOrderDetails]);

  const handleOrderUpdated = useCallback((data) => {
    console.log("🔔 Order updated:", data);
    // Refresh cả 2 list để đảm bảo dữ liệu mới nhất
    fetchUnassignedOrders();
    fetchMyOrders();
  }, [fetchUnassignedOrders, fetchMyOrders]);

  const handleOrderDetailUpdated = useCallback((data) => {
    console.log("🔔 Order detail updated:", data);
    const targetOrderId = String(data.orderId);
    const targetDetailId = String(data.orderDetailId);
    const targetDishId = String(data.dishId);
    
    const updateOrderItems = (ordersList) =>
      ordersList.map((order) => {
        if (String(order.id) === targetOrderId) {
          return {
            ...order,
            items: order.items.map((item) =>
              String(item.id) === targetDetailId || String(item.dishId) === targetDishId
                ? {
                  ...item,
                  completed: data.status === "Ready" || data.status === "Served",
                  cancelled: data.status === "Cancelled",
                  status: data.status,
                }
                : item
            ),
          };
        }
        return order;
      });
    setOrders(updateOrderItems);
    setMyOrders(updateOrderItems);
  }, []);

  const handleOrderDeleted = useCallback((data) => {
    console.log("🔔 Order deleted:", data);
    const targetId = String(data.orderId);
    setOrders((prev) => prev.filter((order) => String(order.id) !== targetId));
    setMyOrders((prev) => prev.filter((order) => String(order.id) !== targetId));
  }, []);

  // Socket listeners
  useOrderSocket({
    onOrderCreated: handleOrderCreated,
    onOrderUpdated: handleOrderUpdated,
    onOrderDetailUpdated: handleOrderDetailUpdated,
    onOrderDeleted: handleOrderDeleted,
  });

  // Tính thời gian từ khi order
  const getElapsedTime = useCallback(
    (orderTime) => {
      return calculateElapsedTime(orderTime, currentTime);
    },
    [currentTime]
  );

  // Xác định trạng thái dựa trên thời gian
  const getOrderStatus = useCallback(
    (order) => {
      const elapsed = getElapsedTime(order.orderTime);
      return determineOrderStatus(order, elapsed);
    },
    [getElapsedTime]
  );

  // Lọc orders theo tab hiện tại
  const filteredOrders = useMemo(() => {
    const sourceOrders = activeTab === "new" ? orders : myOrders;
    const filteredBySearch = filterOrdersBySearch(sourceOrders, searchOrderId);
    const withoutCancelled = filterOutCancelledOrders(filteredBySearch);
    return sortOrdersByTime(withoutCancelled, "asc");
  }, [orders, myOrders, activeTab, searchOrderId]);

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-blue-50">
      <WaiterHeader
        currentTime={currentTime}
        user={user}
        onLogout={logout}
        onUserUpdate={updateUser}
      />

      {/* Confirm Modal for Unconfirmed Items */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, orderId: null, unconfirmedItems: [] })}
        onConfirm={handleConfirmUnconfirmedItems}
        title="Đơn hàng có món chưa xác nhận"
        message={
          confirmModal.unconfirmedItems.length > 0
            ? `Đơn #${confirmModal.orderId} có ${confirmModal.unconfirmedItems.length} món chưa được xác nhận:\n` +
              `\nBạn có muốn xác nhận và chuyển các món này sang trạng thái "Đang chờ bếp" không?`
            : ""
        }
        confirmText="Xác nhận"
        cancelText="Hủy"
        type="warning"
      />

      {/* Tabs */}
      <div className="max-w-[1920px] mx-auto px-6 py-4">
        <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1">
            <button
              onClick={() => setActiveTab("new")}
              className={`px-4 py-2 rounded-lg font-bold text-sm md:text-base whitespace-nowrap transition-all flex-1 md:flex-none ${activeTab === "new"
                ? "bg-orange-500 text-white shadow-md"
                : "bg-white text-gray-600 hover:bg-orange-100 border border-gray-200"
                }`}
            >
              📋 Đơn mới ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab("my")}
              className={`px-4 py-2 rounded-lg font-bold text-sm md:text-base whitespace-nowrap transition-all flex-1 md:flex-none ${activeTab === "my"
                ? "bg-blue-500 text-white shadow-md"
                : "bg-white text-gray-600 hover:bg-blue-100 border border-gray-200"
                }`}
            >
              👤 Đơn của tôi ({myOrders.length})
            </button>
          </div>

          {/* Search Bar */}
          <div className="w-full md:w-64 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Tìm mã đơn..."
              value={searchOrderId}
              onChange={(e) => setSearchOrderId(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tải đơn hàng...</p>
            </div>
          </div>
        ) : (
          <WaiterOrdersGrid
            orders={filteredOrders}
            currentTime={currentTime}
            getElapsedTime={getElapsedTime}
            getOrderStatus={getOrderStatus}
            showClaimButton={activeTab === "new"}
            onClaimOrder={handleClaimOrder}
            onCancelItem={handleCancelItem}
            onConfirmItem={handleConfirmItem}
            onServeItem={handleServeItem}
          />
        )}
      </div>
    </div>
  );
};

export default WaiterScreen;
