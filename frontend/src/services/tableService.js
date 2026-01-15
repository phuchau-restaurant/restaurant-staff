import { getTenantId } from "../utils/auth";

/**
 * Table Service - API calls cho quản lý bàn
 */

import { fetchLocationOptions as getLocationOptions } from "./appSettingsService";

const BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api/admin/tables`;
const getHeaders = () => ({
  "Content-Type": "application/json",
  "x-tenant-id": getTenantId(),
});

/**
 * Fetch danh sách bàn từ API
 * @param {string} statusFilter - Lọc theo trạng thái (optional)
 * @param {string} areaFilter - Lọc theo khu vực (optional)
 * @param {Object} pagination - { pageNumber, pageSize } (optional)
 * @returns {Promise<Object|Array>} Danh sách bàn hoặc object có pagination
 */
export const fetchTables = async (statusFilter = "", areaFilter = "", pagination = null) => {
  try {
    const queryParams = new URLSearchParams();
    if (statusFilter) queryParams.append("status", statusFilter);
    if (areaFilter) queryParams.append("location", areaFilter);
    
    // Thêm pagination params nếu có
    if (pagination && pagination.pageNumber && pagination.pageSize) {
      queryParams.append("pageNumber", pagination.pageNumber);
      queryParams.append("pageSize", pagination.pageSize);
    }

    const url = `${BASE_URL}${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    const response = await fetch(url, { headers: getHeaders() });
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
    return pagination ? { data: [], pagination: null } : [];
  } catch (error) {
    console.error("Fetch tables error:", error);
    throw error;
  }
};

/**
 * Fetch danh sách khu vực từ appsettings API
 * @returns {Promise<Array>} Danh sách options khu vực
 */
export const fetchLocationOptions = getLocationOptions;

/**
 * Cập nhật trạng thái bàn
 * @param {number} tableId - ID bàn
 * @param {string} newStatus - Trạng thái mới
 * @returns {Promise<Object>} Kết quả cập nhật
 */
export const updateTableStatus = async (tableId, newStatus) => {
  try {
    const response = await fetch(`${BASE_URL}/${tableId}/status`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify({ status: newStatus }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Cập nhật trạng thái thất bại");
    }

    return result;
  } catch (error) {
    console.error("Update table status error:", error);
    throw error;
  }
};

/**
 * Tạo bàn mới
 * @param {Object} tableData - Dữ liệu bàn
 * @returns {Promise<Object>} Kết quả tạo bàn
 */
export const createTable = async (tableData) => {
  try {
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(tableData),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Tạo bàn thất bại");
    }

    return result;
  } catch (error) {
    console.error("Create table error:", error);
    throw error;
  }
};

/**
 * Cập nhật thông tin bàn
 * @param {number} tableId - ID bàn
 * @param {Object} tableData - Dữ liệu bàn
 * @returns {Promise<Object>} Kết quả cập nhật
 */
export const updateTable = async (tableId, tableData) => {
  try {
    const response = await fetch(`${BASE_URL}/${tableId}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(tableData),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Cập nhật bàn thất bại");
    }

    return result;
  } catch (error) {
    console.error("Update table error:", error);
    throw error;
  }
};

/**
 * Fetch thông tin chi tiết bàn
 * @param {number} tableId - ID bàn
 * @returns {Promise<Object>} Thông tin bàn
 */
export const fetchTableById = async (tableId) => {
  try {
    const response = await fetch(`${BASE_URL}/${tableId}`, {
      headers: getHeaders(),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Không thể tải thông tin bàn");
    }

    return result.data;
  } catch (error) {
    console.error("Fetch table by ID error:", error);
    throw error;
  }
};

/**
 * Kiểm tra trùng số bàn
 * @param {string} tableNumber - Số bàn cần kiểm tra
 * @param {number} currentTableId - ID bàn hiện tại (để loại trừ khi update)
 * @returns {Promise<boolean>} True nếu trùng, false nếu không trùng
 */
export const checkDuplicateTableNumber = async (tableNumber, currentTableId = null) => {
  try {
    // Fetch toàn bộ bàn
    const allTables = await fetchTables();
    
    // Kiểm tra xem có bàn nào khác có cùng tableNumber không
    const isDuplicate = allTables.some(table => 
      table.tableNumber === tableNumber && table.id !== currentTableId
    );
    
    return isDuplicate;
  } catch (error) {
    console.error("Check duplicate table number error:", error);
    return false;
  }
};

/**
 * Xóa vĩnh viễn bàn
 * @param {number} tableId - ID bàn
 * @returns {Promise<Object>} Kết quả xóa
 */
export const deleteTablePermanent = async (tableId) => {
  try {
    const response = await fetch(`${BASE_URL}/${tableId}`, {
      method: "DELETE",
      headers: getHeaders(),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Xóa bàn thất bại");
    }

    return result;
  } catch (error) {
    console.error("Delete table permanently error:", error);
    throw error;
  }
};
