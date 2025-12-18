/**
 * Table Service - API calls cho quản lý bàn
 */

const BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api/admin/tables`;
const HEADERS = {
  "Content-Type": "application/json",
  "x-tenant-id": import.meta.env.VITE_TENANT_ID,
};

/**
 * Fetch danh sách bàn từ API
 * @param {string} statusFilter - Lọc theo trạng thái (optional)
 * @param {string} areaFilter - Lọc theo khu vực (optional)
 * @returns {Promise<Array>} Danh sách bàn
 */
export const fetchTables = async (statusFilter = "", areaFilter = "") => {
  try {
    const queryParams = new URLSearchParams();
    if (statusFilter) queryParams.append("status", statusFilter);
    if (areaFilter) queryParams.append("location", areaFilter);

    const url = `${BASE_URL}${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    const response = await fetch(url, { headers: HEADERS });
    const result = await response.json();

    if (result.success) {
      return result.data || [];
    }
    return [];
  } catch (error) {
    console.error("Fetch tables error:", error);
    throw error;
  }
};

/**
 * Fetch danh sách khu vực từ appsettings API
 * @returns {Promise<Array>} Danh sách options khu vực
 */
export const fetchLocationOptions = async () => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/appsettings?category=Location`,
      { headers: HEADERS }
    );

    const result = await response.json();

    if (response.ok && result.success) {
      return [
        { value: "", label: "Tất cả khu vực" },
        ...(result.data || []).map((item) => ({
          value: item.value,
          label: item.value,
        })),
      ];
    }
    return [{ value: "", label: "Tất cả khu vực" }];
  } catch (error) {
    console.error("Fetch location options error:", error);
    throw error;
  }
};

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
      headers: HEADERS,
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
      headers: HEADERS,
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
      headers: HEADERS,
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
      headers: HEADERS,
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
 * @returns {Promise<boolean>} True nếu trùng, false nếu không trùng
 */
export const checkDuplicateTableNumber = async (tableNumber) => {
  try {
    const response = await fetch(
      `${BASE_URL}?tableNumber=${encodeURIComponent(tableNumber)}`,
      { headers: HEADERS }
    );

    const result = await response.json();
    return result.success && result.data && result.data.length > 0;
  } catch (error) {
    console.error("Check duplicate table number error:", error);
    return false;
  }
};
