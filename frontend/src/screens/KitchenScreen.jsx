import React, { useState, useEffect, useMemo, useCallback } from "react";
import KitchenHeader from "../components/Kitchen/KitchenHeader";
import OrdersGrid from "../components/Kitchen/OrdersGrid";
import AlertModal from "../components/Modal/AlertModal";
import Pagination from "../components/SpinnerLoad/Pagination";
import { useAlert } from "../hooks/useAlert";
import { useKitchenSocket, useOrderSocket } from "../hooks/useOrderSocket";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { X, Bell } from "lucide-react";
import * as kitchenService from "../services/kitchenService";
import { SkeletonOrderCard } from "../components/Skeleton";
import {
  mapKitchenOrdersFromApi,
  calculateElapsedTime,
  determineOrderDisplayStatus,
  getPendingItems,
  filterOrdersBySearch,
  sortOrdersByTime,
  updateOrderInList,
  updateOrderItemInList,
  removeOrderFromList,
  STATUS_MAP,
  STATUS_OPTIONS,
  CATEGORY_OPTIONS,
} from "../utils/kitchenUtils";

const KitchenScreen = () => {
  const { alert, showSuccess, showError, showWarning, showInfo, closeAlert } =
    useAlert();
  const { user, logout, updateUser } = useAuth();
  const { socket, isConnected } = useSocket();
  const [viewMode, setViewMode] = useState("card");
  const [filterStation, setFilterStation] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchOrderId, setSearchOrderId] = useState("");
  const [sortBy, setSortBy] = useState("time"); // "time" | "table" | "order" | "prepTime"
  const [orders, setOrders] = useState([]);

  // State quản lý pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

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

      const result = await kitchenService.fetchKitchenOrders({
        status: filterStatus,
        categoryId: filterStation,
        pageNumber: currentPage,
        pageSize: itemsPerPage,
      });

      // Kiểm tra nếu có pagination (backend trả về object)
      if (result.pagination) {
        const mappedOrders = mapKitchenOrdersFromApi(result.data);
        setOrders(mappedOrders);
        setTotalItems(result.pagination.totalCount);
        setTotalPages(result.pagination.totalPages);
      } else {
        // Fallback: không có pagination
        const mappedOrders = mapKitchenOrdersFromApi(result);
        setOrders(mappedOrders);
        setTotalItems(mappedOrders.length);
        setTotalPages(Math.ceil(mappedOrders.length / itemsPerPage));
      }
    } catch (error) {
      console.error("Error fetching kitchen orders:", error);
    } finally {
      setIsLoading(false);
    }
  }, [filterStatus, filterStation, currentPage, itemsPerPage]);

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
      const order = await kitchenService.fetchOrderDetails(orderId);
      if (!order) return null;

      const orderDetails = order.orderDetails || [];
      let orderStatus = order.status || "Pending";

      return {
        id: order.id,
        orderNumber: order.id,
        tableNumber: order.tableNumber || order.tableId, // Ưu tiên tên bàn, fallback về ID
        orderTime: new Date(order.createdAt),
        status: orderStatus,
        dbStatus: order.status, // Thêm dbStatus để hiển thị button chính xác
        prepTimeOrder: order.prepTimeOrder, // Thêm prepTimeOrder để đồng bộ với mapKitchenOrderFromApi
        waiterId: order.waiterId, // Thêm waiterId để dùng cho filter thông báo
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
          completed: detail.status === "Ready" || detail.status === "Served",
          cancelled: detail.status === "Cancelled",
          modifiers: detail.modifiers || [],
        })),
        customerName: order.customerName || "Khách",
        notes: order.note || "",
        server: order.server || "Server",
      };
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

      // Fetch thông tin đơn hàng mới
      const newOrder = await fetchSingleOrder(data.orderId);

      // Chỉ thông báo và thêm vào danh sách nếu đơn ở trạng thái Approved
      if (newOrder && newOrder.status === "Approved") {
        setNotification({
          message: `Đơn mới #${data.orderId} từ ${data.tableId || newOrder.tableNumber}`,
          orderId: data.orderId,
          tableId: data.tableId || newOrder.tableNumber,
        });
        playNotificationSound();
        setOrders((prev) => [newOrder, ...prev]);
      }
    },
    [fetchSingleOrder, playNotificationSound]
  );

  const handleDishStatusChanged = useCallback(
    async (data) => {
      console.log("🔔 Dish status changed:", data);
      const targetId = String(data.orderId);

      // Cập nhật order cụ thể trong state
      const updatedOrder = await fetchSingleOrder(data.orderId);
      if (updatedOrder) {
        setOrders((prev) =>
          prev.map((order) =>
            String(order.id) === targetId ? updatedOrder : order
          )
        );
      }
    },
    [fetchSingleOrder]
  );

  const handleOrderUpdated = useCallback(
    async (data) => {
      console.log("🔔 Order updated:", data);
      const targetId = String(data.orderId);

      // Cập nhật order cụ thể trong state
      const updatedOrder = await fetchSingleOrder(data.orderId);
      if (updatedOrder) {
        setOrders((prevOrders) => {
          const existingOrder = prevOrders.find(o => String(o.id) === targetId);

          if (!existingOrder && updatedOrder.status === "Approved") {
            // Đơn mới vào trạng thái Approved (ví dụ: waiter vừa claim)
            setNotification({
              message: `Đơn mới #${data.orderId} từ ${updatedOrder.tableNumber}`,
              orderId: data.orderId,
              tableId: updatedOrder.tableNumber,
            });
            playNotificationSound();
            return [updatedOrder, ...prevOrders];
          } else if (existingOrder) {
            // Cập nhật đơn đã có
            return prevOrders.map((order) =>
              String(order.id) === targetId ? updatedOrder : order
            );
          }
          return prevOrders;
        });
      }
    },
    [fetchSingleOrder, playNotificationSound]
  );

  const handleOrderDeleted = useCallback((data) => {
    console.log("🔔 Order deleted:", data);
    const targetId = String(data.orderId);
    // Xóa order khỏi state
    setOrders((prev) => prev.filter((order) => String(order.id) !== targetId));
  }, []);

  const handleOrderCreated = useCallback(
    async (data) => {
      console.log("🔔 Order created:", data);

      // Fetch thông tin đơn hàng mới
      const newOrder = await fetchSingleOrder(data.orderId);

      // Chỉ thông báo và thêm vào danh sách nếu đơn ở trạng thái Approved
      if (newOrder && newOrder.status === "Approved") {
        setNotification({
          message: `Đơn mới #${data.orderId}`,
          orderId: data.orderId,
        });
        playNotificationSound();
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
      return calculateElapsedTime(orderTime, currentTime);
    },
    [currentTime]
  );

  // Xác định trạng thái hiển thị dựa trên status backend và thời gian
  const getOrderStatus = useCallback(
    (order) => {
      const elapsed = getElapsedTime(order.orderTime);
      return determineOrderDisplayStatus(order, elapsed);
    },
    [getElapsedTime]
  );

  // Lọc và sắp xếp orders (local filtering/sorting sau khi có data từ API)
  const displayOrders = useMemo(() => {
    const filtered = filterOrdersBySearch(orders, searchOrderId);

    // Sort based on sortBy state
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "table":
          // Sort by table number/name
          const tableA = String(a.tableNumber || "");
          const tableB = String(b.tableNumber || "");
          return tableA.localeCompare(tableB, "vi", { numeric: true });
        case "order":
          // Sort by order number
          return (a.orderNumber || a.id) - (b.orderNumber || b.id);
        case "prepTime":
          // Sort by prep time (shortest first)
          const prepA = a.prepTimeOrder || 9999;
          const prepB = b.prepTimeOrder || 9999;
          return prepA - prepB;
        case "time":
        default:
          // Sort by order time (newest first - descending)
          return new Date(b.orderTime) - new Date(a.orderTime);
      }
    });
  }, [orders, searchOrderId, sortBy]);

  // Reset về trang 1 khi filter thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, filterStation, searchOrderId, sortBy]);

  // Actions
  // Xác nhận đơn Approved - chuyển sang Pending (Bếp bắt đầu xử lý)
  const handleConfirmOrder = async (orderId) => {
    try {
      await kitchenService.confirmKitchenOrder(orderId);
      // Update local state
      setOrders((prev) =>
        updateOrderInList(prev, orderId, {
          status: "Pending",
          dbStatus: "Pending",
          startTime: new Date(),
        })
      );
      showSuccess(`Bếp đã nhận đơn #${orderId}`);
    } catch (error) {
      console.error("Error updating order status:", error);
      showError("Không thể cập nhật trạng thái đơn hàng");
    }
  };

  // Hàm thực sự gọi API hoàn thành đơn
  const doCompleteOrder = async (orderId) => {
    try {
      await kitchenService.completeOrder(orderId);
      // Update local state
      setOrders((prev) =>
        updateOrderInList(prev, orderId, {
          status: "Completed",
          dbStatus: "Completed",
          completeTime: new Date(),
        })
      );
      showSuccess(`Đã hoàn thành đơn #${orderId}`);
    } catch (error) {
      console.error("Error completing order:", error);
      showError("Không thể hoàn thành đơn hàng");
    }
  };

  // Hàm xử lý khi nhấn hoàn thành - kiểm tra có món pending không
  const handleComplete = async (orderId) => {
    const targetId = String(orderId);
    const order = orders.find((o) => String(o.id) === targetId);
    if (!order) return;

    // Tìm các món đang ở trạng thái Pending (chưa nấu)
    const pendingItems = getPendingItems(order);

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
      await kitchenService.markItemAsReady(orderId, item.order_detail_id);
      // Update local state
      setOrders((prev) =>
        updateOrderItemInList(prev, orderId, item.order_detail_id, {
          completed: true,
          status: "Ready",
        })
      );
    } catch (error) {
      console.error("Error marking item as ready:", error);
    }
  };

  const handleCancel = async (orderId) => {
    try {
      await kitchenService.cancelOrder(orderId);
      // Update local state
      setOrders((prev) =>
        updateOrderInList(prev, orderId, {
          status: "Cancelled",
          dbStatus: "Cancelled",
        })
      );
      showSuccess(`Đã hủy đơn #${orderId}`);
    } catch (error) {
      console.error("Error cancelling order:", error);
      showError("Không thể hủy đơn hàng");
    }
  };

  const handleRecall = (orderId) => {
    // Tìm order để lấy thông tin
    const order = orders.find(o => String(o.id) === String(orderId));
    if (!order) {
      showError("Không tìm thấy đơn hàng");
      return;
    }

    // Emit socket event để gọi nhân viên (không thay đổi status)
    if (socket && isConnected) {
      socket.emit("kitchen:call_waiter", {
        orderId: order.id,
        tableNumber: order.tableNumber,
        waiterId: order.waiterId, // Để frontend waiter filter theo user.id
        message: `Bàn ${order.tableNumber} - Đơn #${order.orderNumber || order.id} cần phục vụ!`,
      });
      showSuccess(`Đã gọi nhân viên phục vụ - Đơn #${order.orderNumber || orderId}`);
    } else {
      showError("Không thể kết nối. Vui lòng thử lại.");
      console.error("Socket not connected");
    }
  };

  const handleCompleteItem = async (orderId, itemId) => {
    // Lấy thông tin món trước khi update
    const targetOrderId = String(orderId);
    const targetItemId = String(itemId);
    const order = orders.find((o) => String(o.id) === targetOrderId);
    const item = order?.items.find((i) => String(i.id) === targetItemId);

    // Chỉ xử lý nếu món tồn tại và chưa hoàn thành
    if (!item || item.completed) return;

    // Thông báo trước khi update state
    showInfo(
      `🔔 Đã thông báo nhân viên!\n\nMón: ${item.name} x${item.quantity}\nBàn: ${order.tableNumber}\nĐơn: ${order.orderNumber}\n\n✅ Món đã sẵn sàng để phục vụ!`
    );

    try {
      await kitchenService.markItemAsReady(orderId, item.order_detail_id);

      // Update state sau khi thông báo
      setOrders((prev) =>
        prev.map((o) => {
          if (String(o.id) === targetOrderId) {
            const updatedItems = o.items.map((i) =>
              String(i.id) === targetItemId ? { ...i, completed: true, status: "Ready" } : i
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
    } catch (error) {
      showError("Không thể cập nhật trạng thái món ăn");
    }
  };

  // Cancel individual item
  const handleCancelItem = async (orderId, itemId) => {
    const targetOrderId = String(orderId);
    const targetItemId = String(itemId);
    const order = orders.find((o) => String(o.id) === targetOrderId);
    const item = order?.items.find((i) => String(i.id) === targetItemId);

    if (!item || item.completed || item.cancelled) return;

    try {
      await kitchenService.cancelOrderItem(orderId, item.order_detail_id);
      showWarning(`Đã hủy món: ${item.name}`);

      // Fetch updated order to check if all items are cancelled
      const updatedOrderData = await kitchenService.fetchOrderDetails(orderId);

      if (updatedOrderData) {
        // Check if order is fully cancelled (status = Cancelled from backend)
        if (updatedOrderData.orderStatus === "Cancelled" || updatedOrderData.status === "Cancelled") {
          showError(`Đơn hàng #${order.orderNumber} đã bị hủy hoàn toàn!`);
          // Remove the order from list since it's fully cancelled
          setOrders((prev) => removeOrderFromList(prev, orderId));
        } else {
          // Update local state
          setOrders((prev) =>
            updateOrderItemInList(prev, orderId, item.order_detail_id, {
              cancelled: true,
              status: "Cancelled",
            })
          );
        }
      } else {
        // Fallback: Update local state
        setOrders((prev) =>
          updateOrderItemInList(prev, orderId, item.order_detail_id, {
            cancelled: true,
            status: "Cancelled",
          })
        );
      }
    } catch (error) {
      showError("Không thể hủy món ăn");
    }
  };

  return (
    <div className="h-full bg-linear-to-br from-slate-100 to-slate-200 flex flex-col">
      {/* Notification Banner */}
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
        sortBy={sortBy}
        setSortBy={setSortBy}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <SkeletonOrderCard key={i} variant="kitchen" />
            ))}
          </div>
        ) : (
          <>
            <OrdersGrid
              orders={displayOrders}
              currentTime={currentTime}
              getElapsedTime={getElapsedTime}
              getOrderStatus={getOrderStatus}
              handleConfirmOrder={handleConfirmOrder}
              handleComplete={handleComplete}
              handleCancel={handleCancel}
              handleRecall={handleRecall}
              handleCompleteItem={handleCompleteItem}
              handleCancelItem={handleCancelItem}
              viewMode={viewMode}
            />

            {/* Pagination */}
            {totalItems > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                pageSize={itemsPerPage}
                onPageChange={(page) => setCurrentPage(page)}
                onPageSizeChange={(size) => {
                  setItemsPerPage(size);
                  setCurrentPage(1);
                }}
                pageSizeOptions={[6, 12, 24, 48]}
              />
            )}
          </>
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
