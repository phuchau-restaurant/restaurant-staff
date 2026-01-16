/**
 * Kitchen Utils - Helper functions cho màn hình bếp
 */

/**
 * Map order từ API response sang format của kitchen
 * @param {Object} order - Order từ API
 * @returns {Object} Order đã được map
 */
export const mapKitchenOrderFromApi = (order) => {
  const allDishes = order.dishes || [];

  // Lấy trạng thái từ database
  const dbStatus = order.orderStatus || "Pending";

  return {
    id: order.orderId,
    orderNumber: order.orderId,
    tableNumber: order.tableId,
    orderTime: new Date(order.createdAt),
    status: dbStatus, // Dùng trực tiếp DB status để đồng bộ với filter
    dbStatus: dbStatus, // Giữ dbStatus riêng cho button logic
    prepTimeOrder: order.prepTimeOrder,
    waiterId: order.waiterId, // Thêm waiterId để dùng cho filter thông báo
    items: allDishes.map((dish) => ({
      id: dish.order_detail_id, // ✅ SỬA: Dùng order_detail_id làm ID (unique), KHÔNG dùng dishId (có thể trùng)
      order_detail_id: dish.order_detail_id,
      dishId: dish.dishId,
      name: dish.name,
      quantity: dish.quantity,
      note: dish.note || "",
      status: dish.status,
      categoryId: dish.categoryId,
      image: dish.image,
      completed: dish.status === "Ready" || dish.status === "Served",
      cancelled: dish.status === "Cancelled",
      modifiers: dish.modifiers || [],
    })),
    customerName: order.customerName || "Khách",
    notes: order.note || "",
  };
};

/**
 * Map danh sách orders từ API
 * @param {Array} orders - Danh sách orders từ API
 * @returns {Array} Danh sách orders đã được map
 */
export const mapKitchenOrdersFromApi = (orders) => {
  return orders.map(mapKitchenOrderFromApi);
};

/**
 * Tính thời gian đã trôi qua từ khi tạo đơn (phút)
 * @param {Date} orderTime - Thời gian tạo đơn
 * @param {Date} currentTime - Thời gian hiện tại
 * @returns {number} Số phút đã trôi qua
 */
export const calculateElapsedTime = (orderTime, currentTime) => {
  return Math.floor((currentTime - orderTime) / 1000 / 60);
};

/**
 * Xác định trạng thái hiển thị dựa trên status backend và thời gian
 * @param {Object} order - Đơn hàng
 * @param {number} elapsed - Thời gian đã trôi qua (phút)
 * @returns {string} Trạng thái hiển thị
 */
export const determineOrderDisplayStatus = (order, elapsed) => {
  // Ưu tiên dùng dbStatus (status từ database) để xác định trạng thái hiển thị
  const dbStatus = (order.dbStatus || order.status || "").toLowerCase();

  // Map backend status to frontend display status
  if (dbStatus === "completed") {
    return "completed";
  }

  if (dbStatus === "served" || dbStatus === "paid") {
    return "completed";
  }

  if (dbStatus === "cancelled") {
    return "cancelled";
  }

  const prepTime = order.prepTimeOrder || order.prepTime || 15;

  // Approved -> đơn mới từ waiter, chờ bếp nhận
  if (dbStatus === "approved") {
    return elapsed >= prepTime ? "late" : "new";
  }

  // Pending -> bếp đã nhận, đang xử lý
  if (dbStatus === "pending") {
    return elapsed >= prepTime ? "late" : "cooking";
  }

  // Unsubmit -> chưa gửi đến bếp (không nên hiện trong kitchen)
  if (dbStatus === "unsubmit") {
    return "new";
  }

  // Default: treat as new
  return elapsed >= prepTime ? "late" : "new";
};

/**
 * Kiểm tra xem đơn có món nào đang pending/preparing không
 * @param {Object} order - Đơn hàng
 * @returns {Array} Danh sách món đang pending hoặc preparing
 */
export const getPendingItems = (order) => {
  return (order.items || []).filter(
    (item) => (item.status === "Pending") && !item.cancelled
  );
};

/**
 * Kiểm tra xem tất cả món trong đơn đã ready chưa
 * @param {Object} order - Đơn hàng
 * @returns {boolean}
 */
export const areAllItemsReady = (order) => {
  const items = order.items || [];
  return items.every(
    (item) =>
      item.status === "Ready" ||
      item.status === "Served" ||
      item.status === "Cancelled"
  );
};

/**
 * Filter orders theo tìm kiếm
 * @param {Array} orders - Danh sách orders
 * @param {string} searchOrderId - Từ khóa tìm kiếm
 * @returns {Array} Danh sách orders đã được filter
 */
export const filterOrdersBySearch = (orders, searchOrderId) => {
  if (!searchOrderId) return orders;

  return orders.filter((order) => {
    return String(order.orderNumber)
      .toLowerCase()
      .includes(searchOrderId.toLowerCase());
  });
};

/**
 * Sort orders theo thời gian
 * @param {Array} orders - Danh sách orders
 * @param {string} direction - Hướng sắp xếp ('asc' hoặc 'desc')
 * @returns {Array} Danh sách orders đã được sort
 */
export const sortOrdersByTime = (orders, direction = "asc") => {
  return [...orders].sort((a, b) => {
    const timeA = a.orderTime.getTime();
    const timeB = b.orderTime.getTime();
    return direction === "asc" ? timeA - timeB : timeB - timeA;
  });
};

/**
 * Update trạng thái đơn trong danh sách
 * @param {Array} ordersList - Danh sách orders
 * @param {string|number} orderId - ID đơn cần update
 * @param {Object} updates - Các thay đổi cần apply
 * @returns {Array} Danh sách orders đã được update
 */
export const updateOrderInList = (ordersList, orderId, updates) => {
  // Chuyển cả 2 về string để so sánh chính xác (tránh lỗi type mismatch)
  const targetId = String(orderId);
  return ordersList.map((o) =>
    String(o.id) === targetId ? { ...o, ...updates } : o
  );
};

/**
 * Update trạng thái món ăn trong danh sách orders
 * @param {Array} ordersList - Danh sách orders
 * @param {string|number} orderId - ID đơn
 * @param {string|number} itemId - ID món (order_detail_id)
 * @param {Object} updates - Các thay đổi cần apply
 * @returns {Array} Danh sách orders đã được update
 */
export const updateOrderItemInList = (ordersList, orderId, itemId, updates) => {
  // Chuyển về string để so sánh chính xác
  const targetOrderId = String(orderId);
  const targetItemId = String(itemId);

  return ordersList.map((order) => {
    if (String(order.id) === targetOrderId) {
      return {
        ...order,
        items: order.items.map((item) =>
          String(item.order_detail_id) === targetItemId ? { ...item, ...updates } : item
        ),
      };
    }
    return order;
  });
};

/**
 * Remove đơn hàng khỏi danh sách
 * @param {Array} ordersList - Danh sách orders
 * @param {string|number} orderId - ID đơn cần xóa
 * @returns {Array} Danh sách orders sau khi xóa
 */
export const removeOrderFromList = (ordersList, orderId) => {
  const targetId = String(orderId);
  return ordersList.filter((order) => String(order.id) !== targetId);
};

// Map trạng thái từ tiếng Anh sang tiếng Việt
export const STATUS_MAP = {
  Unsubmit: "Chưa gửi",
  Approved: "Đơn mới",
  Pending: "Đang chuẩn bị",
  Completed: "Hoàn thành",
  Served: "Đã phục vụ",
  Paid: "Đã thanh toán",
  Cancelled: "Đã hủy",
};

// Options cho dropdown status
export const STATUS_OPTIONS = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "Approved", label: "Đơn mới" },
  { value: "Pending", label: "Đang chuẩn bị" },
  { value: "Completed", label: "Hoàn thành" },
  { value: "Served", label: "Đã phục vụ" },
  { value: "Cancelled", label: "Đã hủy" },
];

// Options cho dropdown category
export const CATEGORY_OPTIONS = [
  { value: "all", label: "Tất cả loại món" },
  { value: "1", label: "Khai vị" },
  { value: "2", label: "Đồ uống" },
  { value: "3", label: "Món chính" },
];
