import { getTenantId } from "../utils/auth";

/**
 * Kitchen Service - API calls cho màn hình bếp
 * Base: /api/orders/kitchen
 */

const BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api/orders`;

const getHeaders = () => ({
  "Content-Type": "application/json",
  "x-tenant-id": getTenantId(),
});

/**
 * Lấy danh sách đơn hàng cho bếp
 * GET /api/orders/kitchen?status=...&categoryId=...&itemStatus=...&pageNumber=...&pageSize=...
 * @param {Object} filters - { status, categoryId, itemStatus, pageNumber, pageSize }
 * @returns {Promise<Array|Object>} Danh sách đơn hàng hoặc object có pagination
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

    // Thêm pagination params nếu có
    if (filters.pageNumber && filters.pageSize) {
      params.append("pageNumber", filters.pageNumber);
      params.append("pageSize", filters.pageSize);
    }

    // Thêm hours filter (đơn trong vòng X giờ gần nhất, mặc định 24h)
    const hours = filters.hours || 24;
    params.append("hours", hours);

    const queryString = params.toString();
    const url = `${BASE_URL}/kitchen${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(url, {
      headers: getHeaders(),
    });
    const result = await response.json();

    if (result.success) {
      // Nếu có pagination trong response, trả về cả data và pagination
      if (result.pagination) {
        return {
          data: result.data || [],
          pagination: result.pagination
        };
      }
      return result.data || [];
    }
    return filters.pageNumber ? { data: [], pagination: null } : [];
  } catch (error) {
    console.error("Error fetching kitchen orders:", error);
    return filters.pageNumber ? { data: [], pagination: null } : [];
  }
};

/**
 * Lấy chi tiết đơn hàng
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
 * Bếp xác nhận nhận đơn (chuyển từ Approved sang Pending)
 * @param {string|number} orderId - ID đơn hàng
 * @returns {Promise<Object>}
 */
export const confirmKitchenOrder = async (orderId) => {
  try {
    const response = await fetch(`${BASE_URL}/${orderId}`, {
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
    const response = await fetch(`${BASE_URL}/${orderId}`, {
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
    const response = await fetch(`${BASE_URL}/${orderId}`, {
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
 * PATCH /api/orders/:orderId/items/:orderDetailId
 * @param {string|number} orderId - ID đơn hàng
 * @param {string|number} orderDetailId - ID chi tiết đơn hàng
 * @param {string} status - Trạng thái mới (Pending, Ready, Served, Cancelled)
 * @returns {Promise<Object>}
 */
export const updateOrderItemStatus = async (orderId, orderDetailId, status) => {
  try {
    const response = await fetch(`${BASE_URL}/${orderId}/items/${orderDetailId}`, {
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

