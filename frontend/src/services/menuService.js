/**
 * Menu Service - API calls cho quản lý món ăn
 * Base: /api/admin/menu/items
 */

const BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api/menus`;
const HEADERS = {
  "Content-Type": "application/json",
  "x-tenant-id": import.meta.env.VITE_TENANT_ID,
  "Authorization": `Bearer ${localStorage.getItem("adminToken")}`,
};

/**
 * Fetch danh sách món ăn từ API
 * @param {string} searchTerm - Tìm kiếm theo tên (optional)
 * @param {string} categoryId - Lọc theo danh mục (optional)
 * @returns {Promise<Array>} Danh sách món ăn
 */
export const fetchMenuItems = async (searchTerm = "", categoryId = "") => {
  try {
    const queryParams = new URLSearchParams();
    if (searchTerm) queryParams.append("search", searchTerm);
    if (categoryId) queryParams.append("categoryId", categoryId);

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
    console.error("Fetch menu items error:", error);
    return [];
  }
};

/**
 * Lấy chi tiết món ăn theo ID
 * @param {string} menuId - ID món ăn
 * @returns {Promise<Object>} Chi tiết món ăn
 */
export const fetchMenuItemById = async (menuId) => {
  try {
    const response = await fetch(`${BASE_URL}/${menuId}`, { headers: HEADERS });
    const result = await response.json();

    if (result.success) {
      return result.data;
    }
    throw new Error(result.message || "Failed to fetch menu item");
  } catch (error) {
    console.error("Fetch menu item error:", error);
    throw error;
  }
};

/**
 * Tạo món ăn mới
 * @param {Object} menuData - Dữ liệu món ăn
 * @returns {Promise<Object>} Món ăn vừa tạo
 */
export const createMenuItem = async (menuData) => {
  try {
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify(menuData),
    });

    const result = await response.json();

    if (result.success) {
      return result.data;
    }
    throw new Error(result.message || "Failed to create menu item");
  } catch (error) {
    console.error("Create menu item error:", error);
    throw error;
  }
};

/**
 * Cập nhật món ăn
 * @param {string} menuId - ID món ăn
 * @param {Object} menuData - Dữ liệu cập nhật
 * @returns {Promise<Object>} Món ăn sau khi cập nhật
 */
export const updateMenuItem = async (menuId, menuData) => {
  try {
    const response = await fetch(`${BASE_URL}/${menuId}`, {
      method: "PUT",
      headers: HEADERS,
      body: JSON.stringify(menuData),
    });

    const result = await response.json();

    if (result.success) {
      return result.data;
    }
    throw new Error(result.message || "Failed to update menu item");
  } catch (error) {
    console.error("Update menu item error:", error);
    throw error;
  }
};

/**
 * Xóa món ăn (soft delete)
 * @param {string} menuId - ID món ăn
 * @returns {Promise<void>}
 */
export const deleteMenuItem = async (menuId) => {
  try {
    const response = await fetch(`${BASE_URL}/${menuId}`, {
      method: "DELETE",
      headers: HEADERS,
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Failed to delete menu item");
    }
  } catch (error) {
    console.error("Delete menu item error:", error);
    throw error;
  }
};

/**
 * Upload ảnh cho món ăn (hỗ trợ nhiều ảnh)
 * POST /api/admin/menu/items/:id/photos
 * @param {string} menuId - ID món ăn
 * @param {File|File[]} files - File ảnh hoặc mảng files
 * @returns {Promise<Object>} Thông tin ảnh đã upload
 */
export const uploadMenuImage = async (menuId, files) => {
  try {
    const formData = new FormData();
    
    // Hỗ trợ cả single file và multiple files
    if (Array.isArray(files)) {
      files.forEach((file) => {
        formData.append("photos", file);
      });
    } else {
      formData.append("photos", files);
    }

    const response = await fetch(`${BASE_URL}/${menuId}/photos`, {
      method: "POST",
      headers: {
        "x-tenant-id": import.meta.env.VITE_TENANT_ID,
      },
      body: formData,
    });

    const result = await response.json();

    if (result.success) {
      return result.data;
    }
    throw new Error(result.message || "Failed to upload photos");
  } catch (error) {
    console.error("Upload photos error:", error);
    throw error;
  }
};

/**
 * Xóa ảnh của món ăn
 * DELETE /api/admin/menu/items/:id/photos/:photoId
 * @param {string} menuId - ID món ăn
 * @param {string} photoId - ID ảnh
 * @returns {Promise<void>}
 */
export const deleteMenuImage = async (menuId, photoId) => {
  try {
    const response = await fetch(`${BASE_URL}/${menuId}/photos/${photoId}`, {
      method: "DELETE",
      headers: HEADERS,
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Failed to delete photo");
    }
  } catch (error) {
    console.error("Delete photo error:", error);
    throw error;
  }
};

/**
 * Set ảnh chính cho món ăn
 * PATCH /api/admin/menu/items/:id/photos/:photoId/primary
 * @param {string} menuId - ID món ăn
 * @param {string} photoId - ID ảnh
 * @returns {Promise<Object>}
 */
export const setPrimaryImage = async (menuId, photoId) => {
  try {
    const response = await fetch(`${BASE_URL}/${menuId}/photos/${photoId}/primary`, {
      method: "PATCH",
      headers: HEADERS,
    });

    const result = await response.json();

    if (result.success) {
      return result.data;
    }
    throw new Error(result.message || "Failed to set primary image");
  } catch (error) {
    console.error("Set primary image error:", error);
    throw error;
  }
};

/**
 * Gắn/Gỡ modifier groups vào món ăn
 * POST /api/admin/menu/items/:id/modifier-groups
 * @param {string} menuId - ID món ăn
 * @param {Array<string>} modifierGroupIds - Danh sách ID modifier group
 * @returns {Promise<Object>}
 */
export const attachModifierGroups = async (menuId, modifierGroupIds) => {
  try {
    const response = await fetch(`${BASE_URL}/${menuId}/modifier-groups`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({ modifierGroupIds }),
    });

    const result = await response.json();

    if (result.success) {
      return result.data;
    }
    throw new Error(result.message || "Failed to attach modifier groups");
  } catch (error) {
    console.error("Attach modifier groups error:", error);
    throw error;
  }
};
