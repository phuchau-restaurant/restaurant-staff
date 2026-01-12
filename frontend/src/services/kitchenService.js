/**
 * Kitchen Service - API calls cho màn hình bếp
 * Base: /api/kitchen/orders
 */

const BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api/kitchen/orders`;
const ORDER_URL = `${import.meta.env.VITE_BACKEND_URL}/api/orders`;

const getHeaders = () => ({
  "Content-Type": "application/json",
  "x-tenant-id": import.meta.env.VITE_TENANT_ID,
});

/**
 * Lấy danh sách đơn hàng cho bếp
 * @param {Object} filters - { status, categoryId, itemStatus }
 * @returns {Promise<Array>} Danh sách đơn hàng
 */
export const fetchKitchenOrders = async (filters = {}) => {
  try {
    const params = new URLSearchParams();

    if (filters.status && filters.status !== "all") {
      params.append("status", filters.status);
    }

    if (filters.categoryId && filters.categoryId !== "all") {
      params.append("categoryId", filters.categoryId);
    }

    if (filters.itemStatus) {
      params.append("itemStatus", filters.itemStatus);
    }

    const queryString = params.toString();
    const url = `${BASE_URL}${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(url, {
      headers: getHeaders(),
    });
    const result = await response.json();

    if (result.success) {
      return result.data || [];
    }
    return [];
  } catch (error) {
    console.error("Error fetching kitchen orders:", error);
    return [];
  }
};

/**
 * Lấy chi tiết đơn hàng
 * @param {string|number} orderId - ID đơn hàng
 * @returns {Promise<Object>} Chi tiết đơn hàng
 */
export const fetchOrderDetails = async (orderId) => {
  try {
    const response = await fetch(`${ORDER_URL}/${orderId}`, {
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
 * Bếp xác nhận nhận đơn (chuyển từ Approved sang Pending)
 * @param {string|number} orderId - ID đơn hàng
 * @returns {Promise<Object>}
 */
export const confirmKitchenOrder = async (orderId) => {
  try {
    const response = await fetch(`${ORDER_URL}/${orderId}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ status: "Pending" }),
    });
    const result = await response.json();

    if (result.success) {
      return result.data;
    }
    throw new Error(result.message || "Failed to confirm order");
  } catch (error) {
    console.error("Error confirming kitchen order:", error);
    throw error;
  }
};

/**
 * Hoàn thành đơn hàng (chuyển sang Completed)
 * @param {string|number} orderId - ID đơn hàng
 * @returns {Promise<Object>}
 */
export const completeOrder = async (orderId) => {
  try {
    const response = await fetch(`${ORDER_URL}/${orderId}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ status: "Completed" }),
    });
    const result = await response.json();

    if (result.success) {
      return result.data;
    }
    throw new Error(result.message || "Failed to complete order");
  } catch (error) {
    console.error("Error completing order:", error);
    throw error;
  }
};

/**
 * Hủy đơn hàng
 * @param {string|number} orderId - ID đơn hàng
 * @returns {Promise<Object>}
 */
export const cancelOrder = async (orderId) => {
  try {
    const response = await fetch(`${ORDER_URL}/${orderId}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ status: "Cancelled" }),
    });
    const result = await response.json();

    if (result.success) {
      return result.data;
    }
    throw new Error(result.message || "Failed to cancel order");
  } catch (error) {
    console.error("Error cancelling order:", error);
    throw error;
  }
};

/**
 * Cập nhật trạng thái món ăn
 * @param {string|number} orderId - ID đơn hàng
 * @param {string|number} orderDetailId - ID chi tiết đơn hàng
 * @param {string} status - Trạng thái mới (Pending, Ready, Served, Cancelled)
 * @returns {Promise<Object>}
 */
export const updateOrderItemStatus = async (orderId, orderDetailId, status) => {
  try {
    const response = await fetch(`${BASE_URL}/${orderId}/${orderDetailId}`, {
      method: "PUT",
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
 * Đánh dấu món ăn là đã hoàn thành (Ready)
 * @param {string|number} orderId - ID đơn hàng
 * @param {string|number} orderDetailId - ID món ăn
 * @returns {Promise<Object>}
 */
export const markItemAsReady = async (orderId, orderDetailId) => {
  return updateOrderItemStatus(orderId, orderDetailId, "Ready");
};

/**
 * Hủy món ăn
 * @param {string|number} orderId - ID đơn hàng
 * @param {string|number} orderDetailId - ID món ăn
 * @returns {Promise<Object>}
 */
export const cancelOrderItem = async (orderId, orderDetailId) => {
  return updateOrderItemStatus(orderId, orderDetailId, "Cancelled");
};
