import React, { useState, useEffect, useMemo, useCallback } from "react";
import KitchenHeader from "../components/Kitchen/KitchenHeader";
import OrdersGrid from "../components/Kitchen/OrdersGrid";

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
  const [viewMode, setViewMode] = useState("card");
  const [filterStation, setFilterStation] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchOrderId, setSearchOrderId] = useState("");
  const [orders, setOrders] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);

  // Fetch orders từ API
  useEffect(() => {
    const fetchOrders = async () => {
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
        console.log("Kitchen orders API response:", data); // Debug: xem response từ API
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
              })),
              customerName: order.customerName || "Khách",
              notes: order.note || "",
            };
          });
          console.log("Mapped orders:", mappedOrders); // Debug
          setOrders(mappedOrders);
        }
      } catch (error) {
        console.error("Error fetching kitchen orders:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();

    // Auto refresh every 30 seconds
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [filterStatus, filterStation]); // Re-fetch khi filter thay đổi

  // Cập nhật thời gian mỗi giây
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Tính thời gian từ khi order
  const getElapsedTime = useCallback(
    (orderTime) => {
      const diff = Math.floor((currentTime - orderTime) / 1000 / 60);
      return diff;
    },
    [currentTime]
  );

  // Xác định trạng thái dựa trên thời gian
  const getOrderStatus = useCallback(
    (order) => {
      if (order.status === "completed" || order.status === "cancelled") {
        return order.status;
      }
      const elapsed = getElapsedTime(order.orderTime);
      if (elapsed >= 10) return "late";
      return order.status;
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

    console.log("Filtered orders:", filtered); // Debug
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
        alert("Không thể cập nhật trạng thái đơn hàng");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Lỗi khi cập nhật trạng thái đơn hàng");
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
        alert("Không thể cập nhật trạng thái đơn hàng");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Lỗi khi cập nhật trạng thái đơn hàng");
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
        alert("Không thể hủy đơn hàng");
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      alert("Lỗi khi hủy đơn hàng");
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
        alert(`Đã gọi nhân viên phục vụ đến lấy món - Đơn ${orderId}`);
        // Update local state
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: "Served" } : o))
        );
      } else {
        console.error("Failed to update order status:", data.message);
        alert("Không thể cập nhật trạng thái đơn hàng");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Lỗi khi cập nhật trạng thái đơn hàng");
    }
  };

  const handleCompleteItem = async (orderId, itemId) => {
    // Lấy thông tin món trước khi update
    const order = orders.find((o) => o.id === orderId);
    const item = order?.items.find((i) => i.id === itemId);

    // Chỉ xử lý nếu món tồn tại và chưa hoàn thành
    if (!item || item.completed) return;

    // Thông báo trước khi update state
    alert(
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
      alert("Không thể cập nhật trạng thái món ăn");
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
    </div>
  );
};

export default KitchenScreen;
