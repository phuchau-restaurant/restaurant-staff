/**
 * Waiter Service - API calls cho màn hình phục vụ
 * Base: /api/orders
 */

const BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api/orders`;

const getHeaders = () => ({
  "Content-Type": "application/json",
  "x-tenant-id": import.meta.env.VITE_TENANT_ID,
});

/**
 * Lấy chi tiết đơn hàng theo ID
 * @param {string|number} orderId - ID đơn hàng
 * @returns {Promise<Object>} Chi tiết đơn hàng
 */
export const fetchOrderDetails = async (orderId) => {
  try {
    const response = await fetch(`${BASE_URL}/${orderId}`, {
      headers: getHeaders(),
    });
    const result = await response.json();

    if (result.success) {
      return result.data;
    }
    return null;
  } catch (error) {
    console.error("Error fetching order details:", error);
    return null;
  }
};

/**
 * Lấy danh sách đơn hàng chưa có người nhận (status = Unsubmit)
 * @returns {Promise<Array>} Danh sách đơn hàng chưa có waiter
 */
export const fetchUnassignedOrders = async () => {
  try {
    const response = await fetch(`${BASE_URL}?status=Unsubmit`, {
      headers: getHeaders(),
    });
    const result = await response.json();

    if (result.success) {
      return result.data || [];
    }
    return [];
  } catch (error) {
    console.error("Error fetching unassigned orders:", error);
    return [];
  }
};

/**
 * Lấy danh sách đơn hàng của waiter hiện tại
 * @param {string} waiterId - ID của waiter
 * @returns {Promise<Array>} Danh sách đơn hàng của waiter
 */
export const fetchMyOrders = async (waiterId) => {
  try {
    const response = await fetch(`${BASE_URL}?waiterId=${waiterId}`, {
      headers: getHeaders(),
    });
    const result = await response.json();

    if (result.success) {
      return result.data || [];
    }
    return [];
  } catch (error) {
    console.error("Error fetching my orders:", error);
    return [];
  }
};

/**
 * Nhận đơn hàng (gán waiterId qua PUT /api/orders/:id)
 * @param {string|number} orderId - ID đơn hàng
 * @param {string} waiterId - ID waiter
 * @returns {Promise<Object>} Kết quả nhận đơn
 */
export const claimOrder = async (orderId, waiterId) => {
  try {
    const response = await fetch(`${BASE_URL}/${orderId}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ waiterId }),
    });
    const result = await response.json();

    if (result.success) {
      return result;
    }
    throw new Error(result.message || "Failed to claim order");
  } catch (error) {
    console.error("Error claiming order:", error);
    throw error;
  }
};

/**
 * Cập nhật trạng thái món ăn (Cancel, Confirm, Serve)
 * PATCH /api/orders/:orderId/items/:orderDetailId
 * @param {string|number} orderId - ID đơn hàng
 * @param {string|number} itemId - ID món ăn (orderDetailId)
 * @param {string} status - Trạng thái mới (Cancelled, Pending, Served)
 * @returns {Promise<Object>} Kết quả cập nhật
 */
export const updateOrderItemStatus = async (orderId, itemId, status) => {
  try {
    const response = await fetch(`${BASE_URL}/${orderId}/items/${itemId}`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    const result = await response.json();

    if (result.success) {
      return result.data;
    }
    throw new Error(result.message || "Failed to update item status");
  } catch (error) {
    console.error("Error updating item status:", error);
    throw error;
  }
};

/**
 * Hủy món ăn
 * @param {string|number} orderId - ID đơn hàng
 * @param {string|number} itemId - ID món ăn
 * @returns {Promise<Object>}
 */
export const cancelOrderItem = async (orderId, itemId) => {
  return updateOrderItemStatus(orderId, itemId, "Cancelled");
};

/**
 * Xác nhận món ăn (chuyển sang Pending)
 * @param {string|number} orderId - ID đơn hàng
 * @param {string|number} itemId - ID món ăn
 * @returns {Promise<Object>}
 */
export const confirmOrderItem = async (orderId, itemId) => {
  return updateOrderItemStatus(orderId, itemId, "Pending");
};

/**
 * Phục vụ món ăn (chuyển sang Served)
 * @param {string|number} orderId - ID đơn hàng
 * @param {string|number} itemId - ID món ăn
 * @returns {Promise<Object>}
 */
export const serveOrderItem = async (orderId, itemId) => {
  return updateOrderItemStatus(orderId, itemId, "Served");
};

