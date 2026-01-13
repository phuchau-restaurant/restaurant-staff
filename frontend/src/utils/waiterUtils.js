/**
 * Waiter Utils - Helper functions cho màn hình waiter
 */

/**
 * Map order từ API response sang format của frontend
 * @param {Object} order - Order từ API
 * @returns {Object} Order đã được map
 */
export const mapOrderFromApi = (order) => ({
  id: order.id,
  prepTimeOrder: order.prepTimeOrder,
  orderNumber: order.id,
  tableNumber: order.tableNumber || order.tableId, // Ưu tiên tableNumber (tên bàn), fallback về tableId
  orderTime: new Date(order.createdAt),
  status: order.status,
  waiterId: order.waiterId,
  items: (order.orderDetails || []).map((item) => ({
    id: item.id,
    dishId: item.dishId,
    name: item.dishName || item.menu?.name || "Món ăn",
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    note: item.note || "",
    status: item.status,
    completed: item.status === "Ready" || item.status === "Served",
    cancelled: item.status === "Cancelled",
    modifiers: item.modifiers || [],
    image: item.menu?.image || null,
  })),
});

/**
 * Map danh sách orders từ API
 * @param {Array} orders - Danh sách orders từ API
 * @returns {Array} Danh sách orders đã được map
 */
export const mapOrdersFromApi = (orders) => {
  return orders.map(mapOrderFromApi);
};

/**
 * Update order item trong danh sách orders
 * @param {Array} ordersList - Danh sách orders hiện tại
 * @param {string|number} orderId - ID đơn hàng cần update
 * @param {string|number} itemId - ID món ăn cần update
 * @param {Object} updates - Các thay đổi cần apply
 * @returns {Array} Danh sách orders đã được update
 */
export const updateOrderItemInList = (ordersList, orderId, itemId, updates) => {
  // Chuyển về string để so sánh chính xác (tránh lỗi type mismatch)
  const targetOrderId = String(orderId);
  const targetItemId = String(itemId);

  return ordersList.map((order) => {
    if (String(order.id) === targetOrderId) {
      return {
        ...order,
        items: order.items.map((item) =>
          String(item.id) === targetItemId ? { ...item, ...updates } : item
        ),
      };
    }
    return order;
  });
};

/**
 * Tính thời gian đã trôi qua từ khi tạo đơn
 * @param {Date} orderTime - Thời gian tạo đơn
 * @param {Date} currentTime - Thời gian hiện tại
 * @returns {number} Số phút đã trôi qua
 */
export const calculateElapsedTime = (orderTime, currentTime) => {
  return Math.floor((currentTime - orderTime) / 1000 / 60);
};

/**
 * Xác định trạng thái hiển thị của đơn hàng dựa trên thời gian
 * @param {Object} order - Đơn hàng
 * @param {number} elapsed - Thời gian đã trôi qua (phút)
 * @returns {string} Trạng thái hiển thị (completed, cancelled, late, new)
 */
export const determineOrderStatus = (order, elapsed) => {
  if (order.status === "completed" || order.status === "cancelled") {
    return order.status;
  }
  if (elapsed >= 10) return "late";
  return order.status;
};

/**
 * Filter orders theo điều kiện tìm kiếm
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
 * Filter orders loại bỏ các đơn đã hủy
 * @param {Array} orders - Danh sách orders
 * @returns {Array} Danh sách orders không bao gồm đơn hủy
 */
export const filterOutCancelledOrders = (orders) => {
  return orders.filter(
    (order) => order.status !== "cancelled" && order.status !== "Cancelled"
  );
};

/**
 * Sort orders theo thời gian tạo
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
