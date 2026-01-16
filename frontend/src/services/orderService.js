import { getTenantId } from "../utils/auth";

/**
 * Order Service - API calls cho quản lý đơn hàng
 * Base: /api/orders
 */

const BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api/orders`;
const getHeaders = () => ({
  "Content-Type": "application/json",
  "x-tenant-id": getTenantId(),
  Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
});

/**
 * Fetch danh sách tất cả đơn hàng
 * @param {Object} filters - { status, pageNumber, pageSize } (optional)
 * @returns {Promise<Array|Object>} Danh sách đơn hàng hoặc object có pagination
 */
export const fetchOrders = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();

    if (filters.status) {
      queryParams.append("status", filters.status);
    }

    // Thêm pagination params nếu có
    if (filters.pageNumber && filters.pageSize) {
      queryParams.append("pageNumber", filters.pageNumber);
      queryParams.append("pageSize", filters.pageSize);
    }

    const url = `${BASE_URL}${queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;

    const response = await fetch(url, { headers: getHeaders() });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
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
    console.error("Fetch orders error:", error);
    return filters.pageNumber ? { data: [], pagination: null } : [];
  }
};

/**
 * Lấy chi tiết đơn hàng theo ID (CÓ dishName)
 * Dùng khi click vào đơn cụ thể để xem/chỉnh sửa chi tiết
 * @param {string} orderId - ID đơn hàng
 * @returns {Promise<Object>} Chi tiết đơn hàng với đầy đủ thông tin
 */
export const fetchOrderById = async (orderId) => {
  try {
    const response = await fetch(`${BASE_URL}/${orderId}`, {
      headers: getHeaders(),
    });
    const result = await response.json();

    if (result.success) {
      // Transform orderDetails to items for frontend compatibility
      const data = result.data;
      if (data.orderDetails) {
        data.items = data.orderDetails;
        delete data.orderDetails;
      }
      return data;
    }
    throw new Error(result.message || "Failed to fetch order");
  } catch (error) {
    console.error("Fetch order error:", error);
    throw error;
  }
};

/**
 * Lấy chi tiết đơn hàng theo ID (CÓ dishName - alias cho fetchOrderById)
 * Dùng khi cần load đầy đủ thông tin
 * @param {string} orderId - ID đơn hàng
 * @returns {Promise<Object>} Chi tiết đơn hàng với đầy đủ thông tin
 */
export const fetchOrderByIdWithDetails = async (orderId) => {
  return fetchOrderById(orderId);
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
      headers: getHeaders(),
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
      headers: getHeaders(),
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
      headers: getHeaders(),
    });

    // Handle server errors (5xx)
    if (response.status >= 500) {
      throw new Error("Lỗi server. Vui lòng thử lại sau.");
    }

    // Check content-type to avoid parsing HTML as JSON
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      if (!response.ok) {
        throw new Error("Lỗi server. Vui lòng thử lại sau.");
      }
      return; // Success but no JSON response
    }

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
      headers: getHeaders(),
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
 * GET /api/orders/kitchen
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

    const url = `${BASE_URL}/kitchen${queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;

    const response = await fetch(url, { headers: getHeaders() });
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
 * PATCH /api/orders/:orderId/items/:orderDetailId
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
    const url = `${BASE_URL}/${orderId}/items/${orderDetailId}`;

    const response = await fetch(url, {
      method: "PATCH",
      headers: getHeaders(),
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

/**
 * Khôi phục đơn hàng (restore từ CANCELLED về PENDING)
 * @param {string} orderId - ID đơn hàng
 * @param {string} newStatus - Trạng thái mới (mặc định: Pending)
 * @returns {Promise<Object>}
 */
export const restoreOrder = async (orderId, newStatus = "Pending") => {
  try {
    const response = await fetch(`${BASE_URL}/${orderId}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ status: newStatus }),
    });

    const result = await response.json();

    if (result.success) {
      return result.data;
    }
    throw new Error(result.message || "Failed to restore order");
  } catch (error) {
    console.error("Restore order error:", error);
    throw error;
  }
};

/**
 * Xóa vĩnh viễn đơn hàng (hard delete)
 * @param {string} orderId - ID đơn hàng
 * @returns {Promise<void>}
 */
export const deleteOrderPermanent = async (orderId) => {
  try {
    const response = await fetch(`${BASE_URL}/${orderId}`, {
      method: "DELETE",
      headers: getHeaders(),
    });

    // Handle server errors (5xx)
    if (response.status >= 500) {
      throw new Error("Lỗi server. Vui lòng thử lại sau.");
    }

    // Check content-type to avoid parsing HTML as JSON
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      if (!response.ok) {
        throw new Error("Lỗi server. Vui lòng thử lại sau.");
      }
      return; // Success but no JSON response
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Failed to delete order permanently");
    }
  } catch (error) {
    console.error("Delete order permanently error:", error);
    throw error;
  }
};
