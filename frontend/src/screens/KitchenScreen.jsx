import React, { useState, useEffect, useMemo, useCallback } from "react";
import KitchenHeader from "../components/Kitchen/KitchenHeader";
import OrdersGrid from "../components/Kitchen/OrdersGrid";
import AlertModal from "../components/Modal/AlertModal";
import { useAlert } from "../hooks/useAlert";
import { useKitchenSocket, useOrderSocket } from "../hooks/useOrderSocket";
import { useAuth } from "../context/AuthContext";
import { X, Bell } from "lucide-react";

// Map trạng thái từ tiếng Anh sang tiếng Việt
// Order Status: Unsubmit, Approved, Pending, Completed, Served, Paid, Cancelled
// OrderDetail Status: Pending, Ready, Served, Cancelled
const STATUS_MAP = {
  Unsubmit: "Chưa gửi",
  Approved: "Đã duyệt",
  Pending: "Chờ xử lý",
  Completed: "Hoàn thành",
  Served: "Đã phục vụ",
  Paid: "Đã thanh toán",
  Cancelled: "Đã hủy",
};

// Options cho dropdown status (hiển thị tiếng Việt)
// Chỉ hiển thị các trạng thái quan trọng cho bếp
const STATUS_OPTIONS = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "Pending", label: "Chờ xử lý" },
  { value: "Approved", label: "Đã duyệt" },
  { value: "Completed", label: "Hoàn thành" },
  { value: "Served", label: "Đã phục vụ" },
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
  const { user, logout, updateUser } = useAuth();
  const [viewMode, setViewMode] = useState("card");
  const [filterStation, setFilterStation] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchOrderId, setSearchOrderId] = useState("");
  const [orders, setOrders] = useState([]);
  
  // State cho confirm dialog khi hoàn thành đơn có món pending
  const [confirmComplete, setConfirmComplete] = useState({
    isOpen: false,
    orderId: null,
    pendingItems: [],
  });
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
      const url = `${import.meta.env.VITE_BACKEND_URL}/api/kitchen/orders${queryString ? `?${queryString}` : ""
        }`;

      const res = await fetch(url, {
        headers: { "x-tenant-id": import.meta.env.VITE_TENANT_ID },
      });

      const data = await res.json();
      if (data.success) {
        // Map API data to component format
        const mappedOrders = data.data.map((order) => {
          // Backend OrderDetail status: Pending, Ready, Served, Cancelled
          const allDishes = order.dishes || [];
          
          // Xác định order status dựa trên status của các món
          let orderStatus = "Pending";
          const allReady = allDishes.every((d) => d.status === "Ready" || d.status === "Served");
          const allCancelled = allDishes.every((d) => d.status === "Cancelled");
          const hasServed = allDishes.some((d) => d.status === "Served");
          
          if (allCancelled) {
            orderStatus = "Cancelled";
          } else if (allReady && hasServed) {
            orderStatus = "Served";
          } else if (allReady) {
            orderStatus = "Completed";
          }

          return {
            id: order.orderId,
            orderNumber: order.orderId,
            tableNumber: order.tableId,
            orderTime: new Date(order.createdAt),
            status: orderStatus,
            prepTimeOrder: order.prepTimeOrder,
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
              // OrderDetail status: Pending, Ready, Served, Cancelled
              completed: dish.status === "Ready" || dish.status === "Served",
              cancelled: dish.status === "Cancelled",
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
            // OrderDetail status: Pending, Ready, Served, Cancelled
            completed: detail.status === "Ready" || detail.status === "Served",
            cancelled: detail.status === "Cancelled",
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

  // Xác định trạng thái hiển thị dựa trên status backend và thời gian
  // Order Status từ backend: Unsubmit, Approved, Pending, Completed, Served, Paid, Cancelled
  const getOrderStatus = useCallback(
    (order) => {
      const statusLower = (order.status || "").toLowerCase();

      // Map backend status to frontend display status
      if (statusLower === "completed" || statusLower === "served" || statusLower === "paid") {
        return "completed";
      }

      if (statusLower === "cancelled") {
        return "cancelled";
      }

      const elapsed = getElapsedTime(order.orderTime);
      const prepTime = order.prepTimeOrder || order.prepTime || 15;

      // Pending/Approved -> đang chờ bếp xử lý
      if (statusLower === "pending" || statusLower === "approved") {
        return elapsed >= prepTime ? "late" : "new";
      }

      // Unsubmit -> chưa gửi đến bếp
      if (statusLower === "unsubmit") {
        return "new";
      }

      // Default: treat as new
      return elapsed >= prepTime ? "late" : "new";
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
  // Bắt đầu xử lý đơn - chuyển sang Approved (đã xác nhận bếp sẽ làm)
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
          body: JSON.stringify({ status: "Approved" }),
        }
      );

      const data = await res.json();
      if (data.success) {
        // Update local state
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? { ...o, status: "Approved", startTime: new Date() }
              : o
          )
        );
        showSuccess(`Đã xác nhận đơn #${orderId}`);
      } else {
        console.error("Failed to update order status:", data.message);
        showError("Không thể cập nhật trạng thái đơn hàng");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      showError("Lỗi khi cập nhật trạng thái đơn hàng");
    }
  };

  // Hàm thực sự gọi API hoàn thành đơn
  const doCompleteOrder = async (orderId) => {
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
        showSuccess(`Đã hoàn thành đơn #${orderId}`);
      } else {
        console.error("Failed to update order status:", data.message);
        showError("Không thể cập nhật trạng thái đơn hàng");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      showError("Lỗi khi cập nhật trạng thái đơn hàng");
    }
  };

  // Hàm xử lý khi nhấn hoàn thành - kiểm tra có món pending không
  const handleComplete = async (orderId) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    // Tìm các món đang ở trạng thái Pending (chưa nấu)
    const pendingItems = order.items.filter((item) => {
      const status = item.status || "Pending";
      return status === "Pending" && !item.completed && !item.cancelled;
    });

    if (pendingItems.length > 0) {
      // Có món pending -> hiện dialog xác nhận
      setConfirmComplete({
        isOpen: true,
        orderId: orderId,
        pendingItems: pendingItems,
      });
    } else {
      // Không có món pending -> hoàn thành ngay
      await doCompleteOrder(orderId);
    }
  };

  // Xác nhận hoàn thành đơn và chuyển các món pending sang Ready
  const confirmCompleteOrder = async () => {
    const { orderId, pendingItems } = confirmComplete;
    
    // Chuyển tất cả các món pending sang Ready trước
    for (const item of pendingItems) {
      await markItemAsReady(orderId, item);
    }
    
    // Sau đó hoàn thành đơn
    await doCompleteOrder(orderId);
    
    // Đóng dialog
    setConfirmComplete({ isOpen: false, orderId: null, pendingItems: [] });
  };

  // Hàm đánh dấu món là Ready (dùng cho confirmCompleteOrder)
  const markItemAsReady = async (orderId, item) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/kitchen/orders/${orderId}/${item.order_detail_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-tenant-id": import.meta.env.VITE_TENANT_ID,
          },
          body: JSON.stringify({ status: "Ready" }),
        }
      );

      if (res.ok) {
        // Update local state
        setOrders((prev) =>
          prev.map((o) => {
            if (o.id === orderId) {
              return {
                ...o,
                items: o.items.map((i) =>
                  i.id === item.id ? { ...i, completed: true, status: "Ready" } : i
                ),
              };
            }
            return o;
          })
        );
      }
    } catch (error) {
      console.error("Error marking item as ready:", error);
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
      `${import.meta.env.VITE_BACKEND_URL}/api/kitchen/orders/${orderId}/${item.order_detail_id}`,
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
      showError("Không thể cập nhật trạng thái món ăn");
      return;
    }

    // Update state sau khi thông báo
    // OrderDetail status: Pending -> Ready (món đã sẵn sàng)
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const updatedItems = o.items.map((i) =>
            i.id === itemId ? { ...i, completed: true, status: "Ready" } : i
          );

          // Kiểm tra nếu tất cả món đã Ready hoặc Cancelled thì chuyển order sang Completed
          const allCompleted = updatedItems.every((i) => 
            i.status === "Ready" || i.status === "Served" || i.status === "Cancelled"
          );

          if (allCompleted) {
            // Gọi trực tiếp API hoàn thành (không cần confirm vì tất cả món đã xong)
            doCompleteOrder(orderId);
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

  // Cancel individual item
  const handleCancelItem = async (orderId, itemId) => {
    const order = orders.find((o) => o.id === orderId);
    const item = order?.items.find((i) => i.id === itemId);

    if (!item || item.completed || item.cancelled) return;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/kitchen/orders/${orderId}/${item.order_detail_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-tenant-id": import.meta.env.VITE_TENANT_ID,
          },
          body: JSON.stringify({ status: "Cancelled" }),
        }
      );

      if (!res.ok) {
        showError("Không thể hủy món ăn");
        return;
      }

      showWarning(`Đã hủy món: ${item.name} x${item.quantity} - Bàn ${order.tableNumber}`);

      // Update state
      setOrders((prev) =>
        prev.map((o) => {
          if (o.id === orderId) {
            const updatedItems = o.items.map((i) =>
              i.id === itemId ? { ...i, cancelled: true, status: "Cancelled" } : i
            );
            return { ...o, items: updatedItems };
          }
          return o;
        })
      );
    } catch (error) {
      showError("Lỗi khi hủy món ăn");
    }
  };

  return (
    <div className="h-full bg-linear-to-br from-slate-100 to-slate-200 flex flex-col">
      {/* Notification Banner */}
      {!isAudioEnabled && (
        <div className="bg-amber-100 border-b border-amber-200 px-6 py-2 flex items-center justify-center gap-2 text-amber-800 text-sm animate-pulse cursor-pointer"
          onClick={() => {
            notificationAudio.play().then(() => setIsAudioEnabled(true)).catch(() => { });
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
        user={user}
        onLogout={logout}
        onUserUpdate={updateUser}
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
            handleCancelItem={handleCancelItem}
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

      {/* Confirm Complete Dialog */}
      {confirmComplete.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-amber-50 border-b border-amber-200 p-5">
              <h3 className="text-xl font-bold text-amber-800 flex items-center gap-2">
                ⚠️ Xác nhận hoàn thành đơn
              </h3>
            </div>
            
            {/* Content */}
            <div className="p-5">
              <p className="text-gray-700 mb-4">
                Đơn hàng này có <span className="font-bold text-red-600">{confirmComplete.pendingItems.length} món</span> chưa hoàn thành:
              </p>
              
              <div className="bg-gray-50 rounded-lg p-3 mb-4 max-h-40 overflow-y-auto">
                {confirmComplete.pendingItems.map((item, idx) => (
                  <div key={item.id || idx} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <span className="font-medium text-gray-800">{item.name}</span>
                    <span className="text-orange-600 font-bold">x{item.quantity}</span>
                  </div>
                ))}
              </div>
              
              <p className="text-gray-600 text-sm">
                Các món này sẽ được <span className="font-bold text-green-600">chuyển sang Sẵn sàng (Ready)</span> khi hoàn thành đơn. Bạn có chắc chắn?
              </p>
            </div>
            
            {/* Actions */}
            <div className="p-5 bg-gray-50 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setConfirmComplete({ isOpen: false, orderId: null, pendingItems: [] })}
                className="flex-1 py-2.5 px-4 rounded-lg font-semibold border-2 border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={confirmCompleteOrder}
                className="flex-1 py-2.5 px-4 rounded-lg font-semibold bg-amber-500 text-white hover:bg-amber-600 transition-colors"
              >
                Xác nhận hoàn thành
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KitchenScreen;
