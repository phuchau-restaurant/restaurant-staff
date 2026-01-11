import React, { useState, useEffect, useMemo, useCallback } from "react";
import KitchenHeader from "../components/Kitchen/KitchenHeader";
import OrdersGrid from "../components/Kitchen/OrdersGrid";
import AlertModal from "../components/Modal/AlertModal";
import { useAlert } from "../hooks/useAlert";
import { useKitchenSocket, useOrderSocket } from "../hooks/useOrderSocket";
import { X, Bell } from "lucide-react";

// Map trạng thái từ tiếng Anh sang tiếng Việt
const STATUS_MAP = {
  Pending: "Chờ xử lý",
  Cooking: "Đang nấu",
  Completed: "Hoàn thành",
  Cancelled: "Đã hủy",
};

// Options cho dropdown status (hiển thị tiếng Việt)
const STATUS_OPTIONS = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "Pending", label: "Chờ xử lý" },
  { value: "Completed", label: "Hoàn thành" },
  { value: "Cancelled", label: "Đã hủy" },
];

// Options cho dropdown category (hiển thị tiếng Việt)
const CATEGORY_OPTIONS = [
  { value: "all", label: "Tất cả loại món" },
  { value: "1", label: "Khai vị" },
  { value: "2", label: "Đồ uống" },
  { value: "3", label: "Món chính" },
];

const KitchenScreen = () => {
  const { alert, showSuccess, showError, showWarning, showInfo, closeAlert } =
    useAlert();
  const [viewMode, setViewMode] = useState("card");
  const [filterStation, setFilterStation] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchOrderId, setSearchOrderId] = useState("");
  const [orders, setOrders] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  
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

  // Fetch orders từ API - dùng useCallback để có thể gọi lại từ socket
  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);

      // Build query params
      const params = new URLSearchParams();

      // Add status filter (nếu không phải "all")
      if (filterStatus !== "all") {
        // filterStatus đã là giá trị tiếng Anh (Pending, Cooking, etc.)
        params.append("status", filterStatus);
      }

      // Add category filter (nếu không phải "all")
      if (filterStation !== "all") {
        // filterStation đã là giá trị tiếng Anh (Appetizers, Beverage, etc.)
        params.append("categoryId", filterStation);
      }

      const queryString = params.toString();
      const url = `${import.meta.env.VITE_BACKEND_URL}/api/kitchen/orders${
        queryString ? `?${queryString}` : ""
      }`;

      const res = await fetch(url, {
        headers: { "x-tenant-id": import.meta.env.VITE_TENANT_ID },
      });

      const data = await res.json();
      if (data.success) {
        // Map API data to component format
        const mappedOrders = data.data.map((order) => {
          // Determine order status based on dishes
          const allDishes = order.dishes || [];
          let orderStatus = "Pending";
          if (allDishes.every((d) => d.status === "Completed")) {
            orderStatus = "Completed";
          } else if (allDishes.some((d) => d.status === "Cooking")) {
            orderStatus = "Cooking";
          } else if (allDishes.every((d) => d.status === "Cancelled")) {
            orderStatus = "Cancelled";
          }

          return {
            id: order.orderId,
            orderNumber: order.orderId,
            tableNumber: order.tableId,
            orderTime: new Date(order.createdAt),
            status: orderStatus,
            items: allDishes.map((dish) => ({
              id: dish.dishId,
              order_detail_id: dish.order_detail_id,
              dishId: dish.dishId,
              name: dish.name,
              quantity: dish.quantity,
              note: dish.note || "",
              status: dish.status,
              categoryId: dish.categoryId,
              image: dish.image,
              completed: dish.status === "Completed",
              modifiers: dish.modifiers || [],
            })),
            customerName: order.customerName || "Khách",
            notes: order.note || "",
          };
        });
        setOrders(mappedOrders);
      }
    } catch (error) {
      console.error("Error fetching kitchen orders:", error);
    } finally {
      setIsLoading(false);
    }
  }, [filterStatus, filterStation]);

  // Fetch orders lần đầu và khi filter thay đổi
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Cập nhật thời gian mỗi giây
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch single order by ID từ API và chuyển đổi sang format kitchen
  const fetchSingleOrder = useCallback(async (orderId) => {
    try {
      const url = `${import.meta.env.VITE_BACKEND_URL}/api/orders/${orderId}`;
      const res = await fetch(url, {
        headers: { "x-tenant-id": import.meta.env.VITE_TENANT_ID },
      });
      const data = await res.json();

      if (data.success && data.data) {
        const order = data.data;
        const orderDetails = order.orderDetails || [];

        // Determine order status based on order details
        let orderStatus = order.status || "Pending";

        console.log(
          "Fetched order status:",
          orderStatus,
          "for order:",
          order.id
        );

        return {
          id: order.id,
          orderNumber: order.id,
          tableNumber: order.tableId,
          orderTime: new Date(order.createdAt),
          status: orderStatus,
          items: orderDetails.map((detail) => ({
            id: detail.dishId,
            order_detail_id: detail.id,
            dishId: detail.dishId,
            name: detail.dishName || detail.menu?.name || "Món ăn",
            quantity: detail.quantity,
            note: detail.note || "",
            status: detail.status,
            categoryId: detail.menu?.categoryId,
            image: detail.menu?.image,
            completed: detail.status === "Completed",
            modifiers: detail.modifiers || [],
          })),
          customerName: order.customerName || "Khách",
          notes: order.note || "",
          server: order.server || "Server",
        };
      }
      return null;
    } catch (error) {
      console.error("Error fetching single order:", error);
      return null;
    }
  }, []);



  // Socket callbacks with useCallback to prevent infinite re-renders
  // Cập nhật state trực tiếp thay vì fetch lại toàn bộ để tránh reload màn hình
  const handleNewOrder = useCallback(
    async (data) => {
      console.log("🔔 New order received:", data);
      setNotification({
        message: `Đơn mới #${data.orderId} từ bàn ${data.tableId}`,
        orderId: data.orderId,
        tableId: data.tableId,
      });
      playNotificationSound();

      // Fetch thông tin đơn hàng mới và thêm vào đầu danh sách
      const newOrder = await fetchSingleOrder(data.orderId);
      if (newOrder) {
        setOrders((prev) => [newOrder, ...prev]);
      }
    },
    [fetchSingleOrder, playNotificationSound]
  );

  const handleDishStatusChanged = useCallback(
    async (data) => {
      console.log("🔔 Dish status changed:", data);

      // Cập nhật order cụ thể trong state
      const updatedOrder = await fetchSingleOrder(data.orderId);
      if (updatedOrder) {
        setOrders((prev) =>
          prev.map((order) =>
            order.id === data.orderId ? updatedOrder : order
          )
        );
      }
    },
    [fetchSingleOrder]
  );

  const handleOrderUpdated = useCallback(
    async (data) => {
      console.log("🔔 Order updated:", data);

      // Cập nhật order cụ thể trong state
      const updatedOrder = await fetchSingleOrder(data.orderId);
      if (updatedOrder) {
        setOrders((prev) =>
          prev.map((order) =>
            order.id === data.orderId ? updatedOrder : order
          )
        );
      }
    },
    [fetchSingleOrder]
  );

  const handleOrderDeleted = useCallback((data) => {
    console.log("🔔 Order deleted:", data);
    // Xóa order khỏi state
    setOrders((prev) => prev.filter((order) => order.id !== data.orderId));
  }, []);

  const handleOrderCreated = useCallback(
    async (data) => {
      console.log("🔔 Order created:", data);
      setNotification({
        message: `Đơn mới #${data.orderId}`,
        orderId: data.orderId,
      });
      playNotificationSound();

      // Fetch thông tin đơn hàng mới và thêm vào đầu danh sách
      const newOrder = await fetchSingleOrder(data.orderId);
      if (newOrder) {
        setOrders((prev) => [newOrder, ...prev]);
      }
    },
    [fetchSingleOrder, playNotificationSound]
  );

  // Socket listeners for real-time updates
  useKitchenSocket({
    onNewOrder: handleNewOrder,
    onDishStatusChanged: handleDishStatusChanged,
  });

  useOrderSocket({
    onOrderCreated: handleOrderCreated,
    onOrderUpdated: handleOrderUpdated,
    onOrderDeleted: handleOrderDeleted,
  });

  // Tính thời gian từ khi order
  const getElapsedTime = useCallback(
    (orderTime) => {
      const diff = Math.floor((currentTime - orderTime) / 1000 / 60);
      return diff;
    },
    [currentTime]
  );

  // Xác định trạng thái dựa trên thời gian
  // Xác định trạng thái dựa trên thời gian
  const getOrderStatus = useCallback(
    (order) => {
      const statusLower = (order.status || "").toLowerCase();

      // Map backend status to frontend status
      if (statusLower === "completed" || statusLower === "served") {
        return "completed";
      }

      if (statusLower === "cancelled") {
        return "cancelled";
      }

      const elapsed = getElapsedTime(order.orderTime);

      // Pending/Approved/Unsubmit -> new or late based on time
      if (
        statusLower === "pending" ||
        statusLower === "approved" ||
        statusLower === "unsubmit"
      ) {
        return elapsed >= 15 ? "late" : "new";
      }

      // Cooking status
      if (statusLower === "cooking") {
        return elapsed >= 15 ? "late" : "cooking";
      }

      // Default: treat as new
      return elapsed >= 15 ? "late" : "new";
    },
    [getElapsedTime]
  );

  // Lọc orders (chỉ filter search vì status và category đã được filter ở API)
  const filteredOrders = useMemo(() => {
    const filtered = orders
      .filter((order) => {
        // Tìm kiếm theo orderNumber
        if (
          searchOrderId &&
          !String(order.orderNumber)
            .toLowerCase()
            .includes(searchOrderId.toLowerCase())
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) => a.orderTime - b.orderTime);

    return filtered;
  }, [orders, searchOrderId]);

  // Actions
  const handleStart = async (orderId) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/orders/${orderId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-tenant-id": import.meta.env.VITE_TENANT_ID,
          },
          body: JSON.stringify({ status: "Cooking" }),
        }
      );

      const data = await res.json();
      if (data.success) {
        // Update local state
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? { ...o, status: "Cooking", startTime: new Date() }
              : o
          )
        );
      } else {
        console.error("Failed to update order status:", data.message);
        showError("Không thể cập nhật trạng thái đơn hàng");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      showError("Lỗi khi cập nhật trạng thái đơn hàng");
    }
  };

  const handleComplete = async (orderId) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/orders/${orderId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-tenant-id": import.meta.env.VITE_TENANT_ID,
          },
          body: JSON.stringify({ status: "Completed" }),
        }
      );

      const data = await res.json();
      if (data.success) {
        // Update local state
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? { ...o, status: "Completed", completeTime: new Date() }
              : o
          )
        );
      } else {
        console.error("Failed to update order status:", data.message);
        showError("Không thể cập nhật trạng thái đơn hàng");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      showError("Lỗi khi cập nhật trạng thái đơn hàng");
    }
  };

  const handleCancel = async (orderId) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/orders/${orderId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-tenant-id": import.meta.env.VITE_TENANT_ID,
          },
          body: JSON.stringify({ status: "Cancelled" }),
        }
      );

      const data = await res.json();
      if (data.success) {
        // Update local state
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId ? { ...o, status: "Cancelled" } : o
          )
        );
      } else {
        console.error("Failed to update order status:", data.message);
        showError("Không thể hủy đơn hàng");
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      showError("Lỗi khi hủy đơn hàng");
    }
  };

  const handleRecall = async (orderId) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/orders/${orderId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-tenant-id": import.meta.env.VITE_TENANT_ID,
          },
          body: JSON.stringify({ status: "Served" }),
        }
      );

      const data = await res.json();
      if (data.success) {
        showSuccess(`Đã gọi nhân viên phục vụ đến lấy món - Đơn ${orderId}`);
        // Update local state
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: "Served" } : o))
        );
      } else {
        console.error("Failed to update order status:", data.message);
        showError("Không thể cập nhật trạng thái đơn hàng");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      showError("Lỗi khi cập nhật trạng thái đơn hàng");
    }
  };

  const handleCompleteItem = async (orderId, itemId) => {
    // Lấy thông tin món trước khi update
    const order = orders.find((o) => o.id === orderId);
    const item = order?.items.find((i) => i.id === itemId);

    // Chỉ xử lý nếu món tồn tại và chưa hoàn thành
    if (!item || item.completed) return;

    // Thông báo trước khi update state
    showInfo(
      `🔔 Đã thông báo nhân viên!\n\nMón: ${item.name} x${item.quantity}\nBàn: ${order.tableNumber}\nĐơn: ${order.orderNumber}\n\n✅ Món đã sẵn sàng để phục vụ!`
    );

    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/kitchen/orders/${orderId}/${
        item.order_detail_id
      }`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-tenant-id": import.meta.env.VITE_TENANT_ID,
        },
        body: JSON.stringify({ status: "Ready" }),
      }
    );

    if (!res.ok) {
      console.error("Failed to update order item status");
      showError("Không thể cập nhật trạng thái món ăn");
      return;
    }

    // Update state sau khi thông báo
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const updatedItems = o.items.map((item) =>
            item.id === itemId ? { ...item, completed: true } : item
          );

          // Kiểm tra nếu tất cả món đã hoàn thành thì chuyển status sang completed
          const allCompleted = updatedItems.every((item) => item.completed);

          if (allCompleted) {
            handleComplete(orderId);
          }

          return {
            ...o,
            items: updatedItems,
            status: allCompleted ? "Completed" : o.status,
            completeTime: allCompleted ? new Date() : o.completeTime,
          };
        }
        return o;
      })
    );
  };

  return (
    <div className="h-full bg-linear-to-br from-slate-100 to-slate-200 flex flex-col">
      {/* Notification Banner */}
      {!isAudioEnabled && (
        <div className="bg-amber-100 border-b border-amber-200 px-6 py-2 flex items-center justify-center gap-2 text-amber-800 text-sm animate-pulse cursor-pointer"
             onClick={() => {
                notificationAudio.play().then(() => setIsAudioEnabled(true)).catch(() => {});
             }}>
          <Bell className="w-4 h-4" />
          <span>Vui lòng click vào màn hình để kích hoạt âm thanh thông báo.</span>
        </div>
      )}

      <KitchenHeader
        currentTime={currentTime}
        viewMode={viewMode}
        setViewMode={setViewMode}
        filterStation={filterStation}
        setFilterStation={setFilterStation}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        searchOrderId={searchOrderId}
        setSearchOrderId={setSearchOrderId}
        statusOptions={STATUS_OPTIONS}
        categoryOptions={CATEGORY_OPTIONS}
      />

      {notification && (
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 flex items-center justify-between shadow-lg animate-in slide-in-from-top duration-300">
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
        className="fixed bottom-4 right-4 z-50 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transition-all hover:scale-110"
        title="Test âm thanh thông báo"
      >
        <Bell className={`w-5 h-5 ${isAudioEnabled ? 'text-white' : 'text-red-200 animate-pulse'}`} />
        {!isAudioEnabled && <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>}
      </button>

      <div className="flex-1 p-6 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tải đơn hàng...</p>
            </div>
          </div>
        ) : (
          <OrdersGrid
            orders={filteredOrders}
            currentTime={currentTime}
            getElapsedTime={getElapsedTime}
            getOrderStatus={getOrderStatus}
            handleStart={handleStart}
            handleComplete={handleComplete}
            handleCancel={handleCancel}
            handleRecall={handleRecall}
            handleCompleteItem={handleCompleteItem}
            viewMode={viewMode}
          />
        )}
      </div>

      {/* Alert Modal */}
      <AlertModal
        isOpen={alert.isOpen}
        onClose={closeAlert}
        title={alert.title}
        message={alert.message}
        type={alert.type}
      />
    </div>
  );
};

export default KitchenScreen;
