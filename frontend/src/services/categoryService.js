const BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api/categories`;
const HEADERS = {
  "Content-Type": "application/json",
  "x-tenant-id": import.meta.env.VITE_TENANT_ID,
};

/**
 * Xóa vĩnh viễn danh mục
 * @param {string} categoryId - ID danh mục
 * @returns {Promise<void>}
 */
export const deleteCategoryPermanent = async (categoryId) => {
  try {
    const response = await fetch(`${BASE_URL}/${categoryId}`, {
      method: "DELETE",
      headers: HEADERS,
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(
        result.message || "Failed to permanently delete category"
      );
    }
  } catch (error) {
    console.error("Delete permanent error:", error);
    throw error;
  }
};
/**
 * Category Service - API calls cho quản lý danh mục
 */

/**
 * Fetch danh sách danh mục từ API
 * @param {string} searchTerm - Tìm kiếm theo tên (optional)
 * @param {Object} pagination - { pageNumber, pageSize } (optional)
 * @param {string} status - Lọc theo trạng thái: 'active', 'inactive' (optional)
 * @returns {Promise<Object|Array>} Danh sách danh mục hoặc object có pagination
 */
export const fetchCategories = async (searchTerm = "", pagination = null, status = null) => {
  try {
    const queryParams = new URLSearchParams();
    if (searchTerm) queryParams.append("search", searchTerm);
    if (status) queryParams.append("status", status);
    
    // Thêm pagination params nếu có
    if (pagination && pagination.pageNumber && pagination.pageSize) {
      queryParams.append("pageNumber", pagination.pageNumber);
      queryParams.append("pageSize", pagination.pageSize);
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
    console.error("Fetch categories error:", error);
    // Return mock data for development
    return pagination ? { data: [], pagination: null } : [];
  }
};

/**
 * Tạo danh mục mới
 * @param {Object} categoryData - Dữ liệu danh mục
 * @returns {Promise<Object>} Danh mục vừa tạo
 */
export const createCategory = async (categoryData) => {
  try {
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify(categoryData),
    });

    const result = await response.json();

    if (result.success) {
      return result.data;
    }
    throw new Error(result.message || "Failed to create category");
  } catch (error) {
    console.error("Create category error:", error);
    throw error;
  }
};

/**
 * Cập nhật danh mục
 * @param {string} categoryId - ID danh mục
 * @param {Object} categoryData - Dữ liệu cập nhật
 * @returns {Promise<Object>} Danh mục sau khi cập nhật
 */
export const updateCategory = async (categoryId, categoryData) => {
  try {
    const response = await fetch(`${BASE_URL}/${categoryId}`, {
      method: "PUT",
      headers: HEADERS,
      body: JSON.stringify(categoryData),
    });

    const result = await response.json();

    if (result.success) {
      return result.data;
    }
    throw new Error(result.message || "Failed to update category");
  } catch (error) {
    console.error("Update category error:", error);
    throw error;
  }
};

/**
 * Xóa danh mục
 * @param {string} categoryId - ID danh mục
 * @returns {Promise<void>}
 */
/**
 * Xóa danh mục (Soft Delete)
 * API backend sẽ tự động cập nhật is_active = false
 * @param {string} categoryId - ID danh mục
 * @returns {Promise<Object>}
 */
export const deleteCategory = async (categoryId) => {
  try {
    const response = await fetch(`${BASE_URL}/${categoryId}`, {
      method: "DELETE",
      headers: HEADERS,
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Failed to delete category");
    }

    return result;
  } catch (error) {
    console.error("Delete category error:", error);
    throw error;
  }
};

/**
 * Cập nhật trạng thái hoạt động của danh mục
 * @param {string} categoryId - ID danh mục
 * @param {boolean} isActive - Trạng thái hoạt động
 * @returns {Promise<Object>} Danh mục sau khi cập nhật
 */
export const updateCategoryStatus = async (categoryId, isActive) => {
  try {
    const response = await fetch(`${BASE_URL}/${categoryId}`, {
      method: "PUT",
      headers: HEADERS,
      body: JSON.stringify({ is_active: isActive }),
    });

    const result = await response.json();

    if (result.success) {
      return result.data;
    }
    throw new Error(result.message || "Failed to update category status");
  } catch (error) {
    console.error("Update category status error:", error);
    throw error;
  }
};
