import React, { useState, useEffect, useMemo, useCallback } from "react";
import WaiterHeader from "../components/Waiter/WaiterHeader";
import WaiterOrdersGrid from "../components/Waiter/WaiterOrdersGrid";
import InvoiceModal from "../components/Waiter/InvoiceModal";
import ConfirmModal from "../components/Modal/ConfirmModal";
import AlertModal from "../components/Modal/AlertModal"; // Import AlertModal
import { useOrderSocket, useWaiterSocket } from "../hooks/useOrderSocket";
import { useAuth } from "../context/AuthContext";
import { useAlert } from "../hooks/useAlert"; // Import useAlert
import { Search, Bell, X } from "lucide-react";
import * as waiterService from "../services/waiterService";
import { SkeletonOrderCard } from "../components/Skeleton";
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
  const { alert, showAlert, closeAlert } = useAlert(); // Init useAlert hook

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
  const [notification, setNotification] = useState(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);

  // Invoice modal state
  const [invoiceModal, setInvoiceModal] = useState({
    isOpen: false,
    order: null,
    isConfirming: false,
  });

  // Khởi tạo audio từ file MP3 trong thư mục public
  const notificationAudio = useMemo(() => new Audio('/notification.mp3'), []);

  // Hàm phát âm thanh thông báo
  const playNotificationSound = useCallback(() => {
    if (notificationAudio) {
      notificationAudio.currentTime = 0; // Chơi lại từ đầu
      notificationAudio.play().catch(error => {
        console.warn("🔇 Không thể tự động phát âm thanh (cần tương tác người dùng):", error);
      });
    }
  }, [notificationAudio]);

  // Cần ít nhất 1 tương tác để trình duyệt cho phép phát audio
  useEffect(() => {
    const unlockAudio = async () => {
      try {
        // Thử phát âm thanh im lặng để unlock
        notificationAudio.muted = true;
        await notificationAudio.play();
        notificationAudio.pause();
        notificationAudio.muted = false;

        setIsAudioEnabled(true);
        console.log("✅ Âm thanh đã được mở khóa (Audio Unlocked)");

        // Gỡ bỏ listener sau khi đã unlock thành công
        document.removeEventListener('click', unlockAudio);
        document.removeEventListener('keydown', unlockAudio);
      } catch (error) {
        console.warn("🔇 Chờ tương tác người dùng để mở âm thanh...");
      }
    };

    document.addEventListener('click', unlockAudio);
    document.addEventListener('keydown', unlockAudio);

    return () => {
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
    };
  }, [notificationAudio]);

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

  // Hàm nhận đơn (claim order = gán waiterId qua PUT)
  // Nếu có món chưa xác nhận (status null), hiển thị modal xác nhận trước
  const handleClaimOrder = async (orderId, forceConfirm = false) => {
    if (!user?.id) {
      console.error("User not logged in");
      return;
    }

    // Tìm order cần claim
    const orderToClaim = orders.find(o => String(o.id) === String(orderId));

    // Kiểm tra các món chưa xác nhận (status null hoặc undefined)
    const unconfirmedItems = orderToClaim?.items?.filter(
      item => !item.status || item.status === null
    ) || [];

    // Nếu có món chưa xác nhận và chưa được confirm -> Hiển thị modal
    if (unconfirmedItems.length > 0 && !forceConfirm) {
      setConfirmModal({
        isOpen: true,
        orderId: orderId,
        unconfirmedItems: unconfirmedItems.map(item => ({
          id: item.id,
          dishId: item.dishId,
          name: item.name,
          quantity: item.quantity,
          status: item.status
        })),
      });
      return;
    }

    // Gọi API nhận đơn
    try {
      const result = await waiterService.claimOrder(orderId, user.id);

      // Map order from response (now includes orderDetails)
      const claimedOrder = mapOrderFromApi(result.data);
      // Remove from unassigned list
      setOrders((prev) => prev.filter((o) => String(o.id) !== String(orderId)));
      // Add to my orders list (with duplicate check)
      setMyOrders((prev) => {
        const exists = prev.some(o => String(o.id) === String(claimedOrder.id));
        if (exists) {
          console.log("⚠️ Order already in myOrders, updating instead:", claimedOrder.id);
          return prev.map(o => String(o.id) === String(claimedOrder.id) ? claimedOrder : o);
        }
        return [claimedOrder, ...prev];
      });
      // Switch to my orders tab
      setActiveTab("my");
      showAlert("Thành công", `Đã nhận đơn #${orderId}`, "success");
    } catch (error) {
      console.error("Error claiming order:", error);
      showAlert("Lỗi", error.message || "Không thể nhận đơn", "error");
    }
  };

  // Xử lý xác nhận món null từ modal
  const handleConfirmUnconfirmedItems = () => {
    const { orderId } = confirmModal;
    setConfirmModal({ isOpen: false, orderId: null, unconfirmedItems: [] });
    // Gọi lại hàm claim với forceConfirm = true
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

      // Fetch updated order to check status
      const updatedOrder = await fetchOrderDetails(orderId);

      console.log('🔍 handleServeItem - Updated order:', {
        orderId,
        status: updatedOrder?.status,
        orderNumber: updatedOrder?.orderNumber,
        items: updatedOrder?.items?.map(i => ({ name: i.name, status: i.status }))
      });

      if (updatedOrder) {
        // Update local state with fresh data
        const updateOrders = (ordersList) =>
          ordersList.map((o) => (o.id === orderId ? updatedOrder : o));

        setOrders(updateOrders);
        setMyOrders(updateOrders);

        // Check if order is fully served
        if (updatedOrder.status === "Served") {
          console.log('✅ Order is fully served - showing notification');
          showAlert("Đơn hàng hoàn tất", `Đơn hàng #${updatedOrder.orderNumber} đã phục vụ hoàn tất!`, "success");
        } else {
          console.log('⚠️ Order status is not Served yet:', updatedOrder.status);
        }
      } else {
        console.warn('⚠️ Failed to fetch updated order');
        // Fallback local update if fetch fails
        const updateOrders = (ordersList) =>
          updateOrderItemInList(ordersList, orderId, itemId, {
            status: "Served",
            completed: true,
          });
        setOrders(updateOrders);
        setMyOrders(updateOrders);
      }
    } catch (error) {
      console.error("Error serving item:", error);
    }
  };

  // Hàm mở modal thanh toán
  const handlePayment = async (orderId) => {
    // Lấy order từ state (myOrders hoặc orders)
    let orderData = myOrders.find(o => String(o.id) === String(orderId));
    if (!orderData) {
      orderData = orders.find(o => String(o.id) === String(orderId));
    }

    if (orderData) {
      setInvoiceModal({
        isOpen: true,
        order: orderData,
        isConfirming: false,
      });
    } else {
      // Nếu không tìm thấy trong state, gọi API lấy chi tiết
      try {
        const freshOrder = await fetchOrderDetails(orderId);
        if (freshOrder) {
          setInvoiceModal({
            isOpen: true,
            order: freshOrder,
            isConfirming: false,
          });
        } else {
          showAlert("Lỗi", "Không tìm thấy đơn hàng", "error");
        }
      } catch (error) {
        console.error("Error getting order:", error);
        showAlert("Lỗi", error.message || "Không thể lấy thông tin đơn hàng", "error");
      }
    }
  };

  // Hàm xác nhận thanh toán
  const handleConfirmPayment = async (orderId, paymentMethod) => {
    setInvoiceModal(prev => ({ ...prev, isConfirming: true }));

    try {
      const response = await waiterService.confirmPayment(orderId, paymentMethod);

      if (response.success) {
        // Đóng modal
        setInvoiceModal({ isOpen: false, order: null, isConfirming: false });

        // Cập nhật local state - chuyển đơn sang Paid
        const updateOrders = (ordersList) =>
          ordersList.map(order =>
            order.id === orderId
              ? { ...order, status: "Paid" }
              : order
          );
        setOrders(updateOrders);
        setMyOrders(updateOrders);

        showAlert("Thành công", "Đã xác nhận thanh toán thành công!", "success");
      }
    } catch (error) {
      console.error("Error confirming payment:", error);
      setInvoiceModal(prev => ({ ...prev, isConfirming: false }));
      showAlert("Lỗi", error.message || "Không thể xác nhận thanh toán", "error");
    }
  };

  // Socket callbacks
  const handleOrderCreated = useCallback(async (data) => {
    console.log("🔔 New order created:", data);
    const newOrder = await fetchOrderDetails(data.orderId);
    if (newOrder && !newOrder.waiterId) {
      // Kiểm tra trùng lặp trước khi thêm
      setOrders((prev) => {
        const exists = prev.some(o => String(o.id) === String(newOrder.id));
        if (exists) {
          console.log("⚠️ Order already exists in list, skipping:", newOrder.id);
          return prev;
        }
        
        // Phát âm thanh và hiển thị thông báo khi có đơn mới
        playNotificationSound();
        setNotification({
          message: `Đơn hàng mới #${newOrder.orderNumber} - Bàn ${newOrder.tableNumber}`,
          orderId: newOrder.id,
          type: "new",
        });
        
        // Tự động ẩn sau 5 giây
        setTimeout(() => setNotification(null), 5000);
        
        return [newOrder, ...prev];
      });
    }
  }, [fetchOrderDetails, playNotificationSound]);

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

    // Thông báo khi món ăn đã sẵn sàng (Ready) - chỉ thông báo nếu đơn thuộc về waiter này
    if (data.status === "Ready") {
      // Tìm đơn từ myOrders (chỉ có đơn của waiter hiện tại)
      const order = myOrders.find(o => String(o.id) === targetOrderId);

      // Chỉ thông báo nếu đơn này thuộc về waiter hiện tại
      if (order) {
        const item = order?.items?.find(i => String(i.id) === targetDetailId || String(i.dishId) === targetDishId);
        const itemName = item?.name || "Món ăn";
        const tableNumber = order?.tableNumber || "";

        setNotification({
          message: `🍽️ ${itemName} (Bàn ${tableNumber}) đã sẵn sàng!`,
          orderId: data.orderId,
          type: "ready",
        });
        playNotificationSound();

        // Tự động ẩn sau 5 giây
        setTimeout(() => setNotification(null), 5000);
      } else {
        console.log("⏭️ Skipping Ready notification - order not in myOrders");
      }
    }

    // Thông báo khi món ăn bị hủy (Cancelled) - chỉ thông báo nếu đơn thuộc về waiter này
    if (data.status === "Cancelled") {
      const order = myOrders.find(o => String(o.id) === targetOrderId);

      if (order) {
        const item = order?.items?.find(i => String(i.id) === targetDetailId || String(i.dishId) === targetDishId);
        const itemName = item?.name || "Món ăn";
        const tableNumber = order?.tableNumber || "";

        setNotification({
          message: `❌ ${itemName} (Bàn ${tableNumber}) đã bị hủy!`,
          orderId: data.orderId,
          type: "cancelled",
        });
        playNotificationSound();

        // Tự động ẩn sau 5 giây
        setTimeout(() => setNotification(null), 5000);
      } else {
        console.log("⏭️ Skipping Cancelled notification - order not in myOrders");
      }
    }

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
  }, [myOrders, playNotificationSound]);

  const handleOrderDeleted = useCallback((data) => {
    console.log("🔔 Order deleted:", data);
    const targetId = String(data.orderId);
    setOrders((prev) => prev.filter((order) => String(order.id) !== targetId));
    setMyOrders((prev) => prev.filter((order) => String(order.id) !== targetId));
  }, []);

  // Socket listeners - Order events
  useOrderSocket({
    onOrderCreated: handleOrderCreated,
    onOrderUpdated: handleOrderUpdated,
    onOrderDetailUpdated: handleOrderDetailUpdated,
    onOrderDeleted: handleOrderDeleted,
  });

  // Handler for kitchen calling waiter - only notify if this waiter is assigned to the order
  const handleWaiterCall = useCallback((data) => {
    console.log("🔔 Waiter call received:", data);

    // Kiểm tra xem đơn hàng có được gán cho waiter cụ thể không
    // Nếu có waiterId và không phải user hiện tại → skip
    // Nếu không có waiterId (null/undefined) → cũng skip (đơn chưa được nhận)
    const hasAssignedWaiter = data.waiterId !== null && data.waiterId !== undefined;
    const isMyOrder = hasAssignedWaiter && String(data.waiterId) === String(user?.id);

    if (!isMyOrder) {
      console.log("⏭️ Skipping notification - not assigned to this order (waiterId:", data.waiterId, ", myId:", user?.id, ")");
      return;
    }

    setNotification({
      message: `📞 ${data.message || `Bàn ${data.tableNumber} - Đơn #${data.orderId} cần phục vụ!`}`,
      orderId: data.orderId,
      type: "call",
    });
    playNotificationSound();

    // Tự động ẩn sau 8 giây (lâu hơn vì quan trọng)
    setTimeout(() => setNotification(null), 8000);
  }, [playNotificationSound, user?.id]);

  // Socket listeners - Waiter specific events
  useWaiterSocket({
    onWaiterCall: handleWaiterCall,
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
    <div className="min-h-screen bg-gray-50">
      <WaiterHeader
        currentTime={currentTime}
        user={user}
        onLogout={logout}
        onUserUpdate={updateUser}
      />

      {/* Audio Enable Prompt */}
      {!isAudioEnabled && (
        <div
          className="bg-amber-100 border-b border-amber-200 px-6 py-2 flex items-center justify-center gap-2 text-amber-800 text-sm animate-pulse cursor-pointer"
          onClick={() => {
            notificationAudio.play().then(() => setIsAudioEnabled(true)).catch(() => { });
          }}
        >
          <Bell className="w-4 h-4" />
          <span>Vui lòng click vào màn hình để kích hoạt âm thanh thông báo.</span>
        </div>
      )}

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

      {/* Alert Modal for notifications */}
      <AlertModal
        isOpen={alert.isOpen}
        onClose={closeAlert}
        title={alert.title}
        message={alert.message}
        type={alert.type}
      />

      {/* Notification Toast */}
      {notification && (
        <div className={`${
          notification.type === "cancelled" 
            ? "bg-gradient-to-r from-red-500 to-red-600" 
            : notification.type === "new"
            ? "bg-gradient-to-r from-blue-500 to-blue-600"
            : "bg-gradient-to-r from-green-500 to-green-600"
        } text-white px-6 py-4 flex items-center justify-between shadow-lg animate-in slide-in-from-top duration-300`}>
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 animate-bounce" />
            <span className="font-semibold text-lg">
              {notification.message}
            </span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Đóng thông báo"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Test Audio Button - Fixed position */}
      <button
        onClick={() => {
          console.log('🔊 Testing notification sound...');
          playNotificationSound();
        }}
        className="fixed bottom-4 right-4 z-50 bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg transition-all hover:scale-110"
        title="Test âm thanh thông báo"
      >
        <Bell className={`w-5 h-5 ${isAudioEnabled ? 'text-white' : 'text-red-200 animate-pulse'}`} />
        {!isAudioEnabled && <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>}
      </button>

      {/* Tabs & Search */}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-5">
          {/* Pill Tabs */}
          <div className="flex gap-1 p-1 bg-gray-100 rounded-full w-full sm:w-auto">
            <button
              onClick={() => setActiveTab("new")}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-full font-semibold text-sm transition-all ${activeTab === "new"
                ? "bg-orange-500 text-white shadow-md"
                : "text-gray-600 hover:text-gray-800"
                }`}
            >
              Đơn mới
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === "new" ? "bg-white/20" : "bg-gray-200"}`}>
                {orders.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("my")}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-full font-semibold text-sm transition-all ${activeTab === "my"
                ? "bg-blue-500 text-white shadow-md"
                : "text-gray-600 hover:text-gray-800"
                }`}
            >
              Đơn của tôi
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === "my" ? "bg-white/20" : "bg-gray-200"}`}>
                {myOrders.length}
              </span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="w-full sm:w-64 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Tìm mã đơn..."
              value={searchOrderId}
              onChange={(e) => setSearchOrderId(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-full focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-100 transition-all"
            />
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(6)].map((_, i) => (
              <SkeletonOrderCard key={i} variant="waiter" />
            ))}
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
            onPayment={handlePayment}
          />
        )}
      </div>

      {/* Invoice Modal */}
      <InvoiceModal
        isOpen={invoiceModal.isOpen}
        onClose={() => setInvoiceModal({ isOpen: false, order: null, isConfirming: false })}
        order={invoiceModal.order}
        onConfirmPayment={handleConfirmPayment}
        isConfirming={invoiceModal.isConfirming}
      />
    </div>
  );
};

export default WaiterScreen;
