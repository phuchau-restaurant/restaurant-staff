import { getTenantId } from "../utils/auth";

const BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api/users`;
const getHeaders = () => ({
  "Content-Type": "application/json",
  "x-tenant-id": getTenantId(),
});

/**
 * Staff Service - API calls cho quản lý nhân viên
 */

/**
 * Fetch danh sách nhân viên từ API
 * @param {Object} options - { searchTerm, role, status, pageNumber, pageSize }
 * @returns {Promise<Object|Array>} Danh sách nhân viên hoặc object có pagination
 */
export const fetchStaff = async (options = {}) => {
  try {
    const {
      searchTerm = "",
      role = "",
      status = "",
      pageNumber,
      pageSize,
    } = options;

    const queryParams = new URLSearchParams();
    if (searchTerm) queryParams.append("search", searchTerm);
    if (role) queryParams.append("role", role);
    if (status) queryParams.append("active", status);

    // Thêm pagination params nếu có
    if (pageNumber && pageSize) {
      queryParams.append("pageNumber", pageNumber);
      queryParams.append("pageSize", pageSize);
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
          pagination: result.pagination,
        };
      }
      return result.data || [];
    }
    return pageNumber && pageSize ? { data: [], pagination: null } : [];
  } catch (error) {
    console.error("Fetch staff error:", error);
    throw error;
  }
};

/**
 * Lấy thông tin chi tiết một nhân viên
 * @param {string} staffId - ID nhân viên
 * @returns {Promise<Object>} Thông tin nhân viên
 */
export const getStaffById = async (staffId) => {
  try {
    const response = await fetch(`${BASE_URL}/${staffId}`, {
      headers: getHeaders(),
    });

    const result = await response.json();

    if (result.success) {
      return result.data;
    }
    throw new Error(result.message || "Failed to fetch staff");
  } catch (error) {
    console.error("Get staff by ID error:", error);
    throw error;
  }
};

/**
 * Tạo nhân viên mới
 * @param {Object} staffData - Dữ liệu nhân viên { email, fullName, password, role }
 * @returns {Promise<Object>} Nhân viên vừa tạo
 */
export const createStaff = async (staffData) => {
  try {
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(staffData),
    });

    const result = await response.json();

    if (result.success) {
      return result.data;
    }
    throw new Error(result.message || "Failed to create staff");
  } catch (error) {
    console.error("Create staff error:", error);
    throw error;
  }
};

/**
 * Cập nhật thông tin nhân viên
 * @param {string} staffId - ID nhân viên
 * @param {Object} staffData - Dữ liệu cập nhật
 * @returns {Promise<Object>} Nhân viên đã cập nhật
 */
export const updateStaff = async (staffId, staffData) => {
  try {
    const response = await fetch(`${BASE_URL}/${staffId}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(staffData),
    });

    const result = await response.json();

    if (result.success) {
      return result.data;
    }
    throw new Error(result.message || "Failed to update staff");
  } catch (error) {
    console.error("Update staff error:", error);
    throw error;
  }
};

/**
 * Cập nhật trạng thái nhân viên (Soft Delete)
 * @param {string} staffId - ID nhân viên
 * @param {boolean} isActive - Trạng thái mới
 * @returns {Promise<Object>} Nhân viên đã cập nhật
 */
export const updateStaffStatus = async (staffId, isActive) => {
  try {
    const response = await fetch(`${BASE_URL}/${staffId}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ isActive }),
    });

    const result = await response.json();

    if (result.success) {
      return result.data;
    }
    throw new Error(result.message || "Failed to update staff status");
  } catch (error) {
    console.error("Update staff status error:", error);
    throw error;
  }
};

/**
 * Xóa vĩnh viễn nhân viên (Hard Delete)
 * @param {string} staffId - ID nhân viên
 * @returns {Promise<void>}
 */
export const deleteStaffPermanent = async (staffId) => {
  try {
    const response = await fetch(`${BASE_URL}/${staffId}`, {
      method: "DELETE",
      headers: getHeaders(),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Failed to delete staff");
    }
  } catch (error) {
    console.error("Delete staff error:", error);
    throw error;
  }
};
