/**
 * Order Service - API calls cho quản lý đơn hàng
 * Base: /api/orders
 */

const BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api/orders`;
const HEADERS = {
  "Content-Type": "application/json",
  "x-tenant-id": import.meta.env.VITE_TENANT_ID,
  Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
};

/**
 * Fetch danh sách tất cả đơn hàng
 * @param {Object} filters - { status } (optional)
 * @returns {Promise<Array>} Danh sách đơn hàng
 */
export const fetchOrders = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();

    if (filters.status) {
      queryParams.append("status", filters.status);
    }

    const url = `${BASE_URL}${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    const response = await fetch(url, { headers: HEADERS });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();

    if (result.success) {
      return result.data || [];
    }
    return [];
  } catch (error) {
    console.error("Fetch orders error:", error);
    return [];
  }
};

/**
 * Lấy chi tiết đơn hàng theo ID
 * @param {string} orderId - ID đơn hàng
 * @returns {Promise<Object>} Chi tiết đơn hàng
 */
export const fetchOrderById = async (orderId) => {
  try {
    const response = await fetch(`${BASE_URL}/${orderId}`, {
      headers: HEADERS,
    });
    const result = await response.json();

    if (result.success) {
      return result.data;
    }
    throw new Error(result.message || "Failed to fetch order");
  } catch (error) {
    console.error("Fetch order error:", error);
    throw error;
  }
};

/**
 * Tạo đơn hàng mới
 * @param {Object} orderData - { tableId, dishes: [{ dishId, quantity, description, modifiers }] }
 * @returns {Promise<Object>} Đơn hàng vừa tạo
 */
export const createOrder = async (orderData) => {
  try {
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify(orderData),
    });

    const result = await response.json();

    if (result.success) {
      return result.data;
    }
    throw new Error(result.message || "Failed to create order");
  } catch (error) {
    console.error("Create order error:", error);
    throw error;
  }
};

/**
 * Cập nhật đơn hàng
 * @param {string} orderId - ID đơn hàng
 * @param {Object} orderData - Dữ liệu cập nhật (status, tableId, etc.)
 * @returns {Promise<Object>} Đơn hàng sau khi cập nhật
 */
export const updateOrder = async (orderId, orderData) => {
  try {
    const response = await fetch(`${BASE_URL}/${orderId}`, {
      method: "PUT",
      headers: HEADERS,
      body: JSON.stringify(orderData),
    });

    const result = await response.json();

    if (result.success) {
      return result.data;
    }
    throw new Error(result.message || "Failed to update order");
  } catch (error) {
    console.error("Update order error:", error);
    throw error;
  }
};

/**
 * Xóa đơn hàng
 * @param {string} orderId - ID đơn hàng
 * @returns {Promise<void>}
 */
export const deleteOrder = async (orderId) => {
  try {
    const response = await fetch(`${BASE_URL}/${orderId}`, {
      method: "DELETE",
      headers: HEADERS,
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Failed to delete order");
    }
  } catch (error) {
    console.error("Delete order error:", error);
    throw error;
  }
};

/**
 * Cập nhật trạng thái đơn hàng
 * @param {string} orderId - ID đơn hàng
 * @param {string} status - Trạng thái mới
 * @returns {Promise<Object>}
 */
export const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await fetch(`${BASE_URL}/${orderId}`, {
      method: "PUT",
      headers: HEADERS,
      body: JSON.stringify({ status }),
    });

    const result = await response.json();

    if (result.success) {
      return result.data;
    }
    throw new Error(result.message || "Failed to update order status");
  } catch (error) {
    console.error("Update order status error:", error);
    throw error;
  }
};

/**
 * Lấy danh sách đơn hàng cho bếp (kitchen view)
 * @param {Object} filters - { status, categoryId, itemStatus }
 * @returns {Promise<Array>}
 */
export const fetchKitchenOrders = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();

    if (filters.status) queryParams.append("status", filters.status);
    if (filters.categoryId)
      queryParams.append("categoryId", filters.categoryId);
    if (filters.itemStatus)
      queryParams.append("itemStatus", filters.itemStatus);

    const url = `${import.meta.env.VITE_BACKEND_URL}/api/kitchen/orders${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    const response = await fetch(url, { headers: HEADERS });
    const result = await response.json();

    if (result.success) {
      return result.data || [];
    }
    return [];
  } catch (error) {
    console.error("Fetch kitchen orders error:", error);
    return [];
  }
};

/**
 * Cập nhật trạng thái chi tiết đơn hàng (order detail/item status)
 * @param {string} orderId - ID đơn hàng
 * @param {string} orderDetailId - ID chi tiết đơn hàng
 * @param {string} status - Trạng thái mới
 * @returns {Promise<Object>}
 */
export const updateOrderDetailStatus = async (
  orderId,
  orderDetailId,
  status
) => {
  try {
    const url = `${
      import.meta.env.VITE_BACKEND_URL
    }/api/kitchen/orders/${orderId}/${orderDetailId}`;

    const response = await fetch(url, {
      method: "PUT",
      headers: HEADERS,
      body: JSON.stringify({ status }),
    });

    const result = await response.json();

    if (result.success) {
      return result.data;
    }
    throw new Error(result.message || "Failed to update order detail status");
  } catch (error) {
    console.error("Update order detail status error:", error);
    throw error;
  }
};
