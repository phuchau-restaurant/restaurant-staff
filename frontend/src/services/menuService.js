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
export const fetchMenuItems = async () => {
  try {
    const response = await fetch(BASE_URL, { headers: HEADERS });
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
    throw error;
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
 * POST /api/admin/menu/items/photos
 * @param {string} dishId - ID món ăn (dishId)
 * @param {File|File[]} files - File ảnh hoặc mảng files từ máy tính
 * @returns {Promise<Object>} Thông tin ảnh đã upload
 */
export const uploadMenuImage = async (dishId, files) => {
  try {
    const formData = new FormData();
    
    // Thêm dishId vào form data để backend biết ảnh này thuộc món ăn nào
    formData.append("dishId", dishId);
    
    // Hỗ trợ cả single file và multiple files
    // Key là "images" theo API instruction
    if (Array.isArray(files)) {
      files.forEach((file) => {
        formData.append("images", file);
      });
    } else {
      formData.append("images", files);
    }

    const ADMIN_BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api/admin/menu/items`;
    
    const response = await fetch(`${ADMIN_BASE_URL}/photos`, {
      method: "POST",
      headers: {
        "x-tenant-id": import.meta.env.VITE_TENANT_ID,
        "Authorization": `Bearer ${localStorage.getItem("adminToken")}`,
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
 * DELETE /api/admin/menu/items/photos/:id
 * @param {string} photoId - ID ảnh (từ bảng menu_item_photos)
 * @returns {Promise<void>}
 */
export const deleteMenuImage = async (photoId) => {
  try {
    const ADMIN_BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api/admin/menu/items`;
    
    const response = await fetch(`${ADMIN_BASE_URL}/photos/${photoId}`, {
      method: "DELETE",
      headers: {
        "x-tenant-id": import.meta.env.VITE_TENANT_ID,
        "Authorization": `Bearer ${localStorage.getItem("adminToken")}`,
      },
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
 * PATCH /api/admin/menu/items/photos/:id
 * @param {string} photoId - ID ảnh cần set làm primary
 * @returns {Promise<Object>}
 */
export const setPrimaryImage = async (photoId) => {
  try {
    const ADMIN_BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api/admin/menu/items`;
    
    const response = await fetch(`${ADMIN_BASE_URL}/photos/${photoId}`, {
      method: "PATCH",
      headers: {
        "x-tenant-id": import.meta.env.VITE_TENANT_ID,
        "Authorization": `Bearer ${localStorage.getItem("adminToken")}`,
      },
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
 * Lấy ảnh đại diện của món ăn
 * GET /api/admin/menu/items/photos/primary?dish_id=:dishId
 * @param {string} dishId - ID món ăn
 * @returns {Promise<Object>} Thông tin ảnh primary
 */
export const getPrimaryImageFromAPI = async (dishId) => {
  try {
    const ADMIN_BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api/admin/menu/items`;
    
    const response = await fetch(`${ADMIN_BASE_URL}/photos/primary?dish_id=${dishId}`, {
      method: "GET",
      headers: {
        "x-tenant-id": import.meta.env.VITE_TENANT_ID,
        "Authorization": `Bearer ${localStorage.getItem("adminToken")}`,
      },
    });

    const result = await response.json();

    if (result.success) {
      return result.data;
    }
    throw new Error(result.message || "Failed to get primary image");
  } catch (error) {
    console.error("Get primary image error:", error);
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


