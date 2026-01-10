// frontend/src/services/menuItemModifierGroupService.js

const BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api/menu-item-modifier-group`;

const HEADERS = {
  "Content-Type": "application/json",
  "x-tenant-id": import.meta.env.VITE_TENANT_ID,
};

/**
 * Lấy danh sách modifier groups của một món ăn
 * @param {number} dishId - ID của món ăn
 * @returns {Promise<Array>} - Danh sách modifier group IDs
 */
export const fetchModifierGroupsByDishId = async (dishId) => {
  try {
    const response = await fetch(`${BASE_URL}?dishId=${dishId}`, {
      headers: HEADERS,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    if (result.success) {
      return result.data || [];
    }
    return [];
  } catch (error) {
    console.error("Fetch modifier groups by dish ID error:", error);
    return [];
  }
};

/**
 * Thêm liên kết giữa món ăn và modifier group
 * @param {number} dishId - ID của món ăn
 * @param {number} groupId - ID của modifier group
 * @returns {Promise<Object>} - Kết quả
 */
export const addModifierGroupLink = async (dishId, groupId) => {
  try {
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({ dishId, groupId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Add modifier group link error:", error);
    throw error;
  }
};

/**
 * Xóa liên kết giữa món ăn và modifier group
 * @param {number} dishId - ID của món ăn  
 * @param {number} groupId - ID của modifier group
 * @returns {Promise<Object>} - Kết quả
 */
export const removeModifierGroupLink = async (dishId, groupId) => {
  try {
    const response = await fetch(BASE_URL, {
      method: "DELETE",
      headers: HEADERS,
      body: JSON.stringify({ dishId, groupId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Remove modifier group link error:", error);
    throw error;
  }
};
