/**
 * Modifier Service - API calls cho quản lý modifier groups và options
 * Base: /api/admin/menu
 */

const BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api/admin/menu`;
const HEADERS = {
  "Content-Type": "application/json",
  "x-tenant-id": import.meta.env.VITE_TENANT_ID,
  Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
};

// ==================== MODIFIER GROUPS ====================

/**
 * Fetch danh sách modifier groups
 * @param {string} searchTerm - Tìm kiếm theo tên (optional)
 * @returns {Promise<Array>} Danh sách modifier groups
 */
export const fetchModifierGroups = async (searchTerm = "") => {
  try {
    const queryParams = new URLSearchParams();
    if (searchTerm) queryParams.append("search", searchTerm);

    const url = `${BASE_URL}/modifier-groups${
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
    console.error("Fetch modifier groups error:", error);
    
    return [];

  }
};

/**
 * Lấy chi tiết modifier group theo ID
 * @param {string} groupId - ID modifier group
 * @returns {Promise<Object>} Chi tiết modifier group
 */
export const fetchModifierGroupById = async (groupId) => {
  try {
    const response = await fetch(`${BASE_URL}/modifier-groups/${groupId}`, {
      headers: HEADERS,
    });
    const result = await response.json();

    if (result.success) {
      return result.data;
    }
    throw new Error(result.message || "Failed to fetch modifier group");
  } catch (error) {
    console.error("Fetch modifier group error:", error);
    throw error;
  }
};

/**
 * Tạo modifier group mới
 * @param {Object} groupData - Dữ liệu modifier group
 * @returns {Promise<Object>} Modifier group vừa tạo
 */
export const createModifierGroup = async (groupData) => {
  try {
    console.log("Creating modifier group with data:", groupData);
    const response = await fetch(`${BASE_URL}/modifier-groups`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify(groupData),
    });

    const result = await response.json();

    if (result.success) {
      return result.data;
    }
    throw new Error(result.message || "Failed to create modifier group");
  } catch (error) {
    console.error("Create modifier group error:", error);
    throw error;
  }
};

/**
 * Cập nhật modifier group
 * @param {string} groupId - ID modifier group
 * @param {Object} groupData - Dữ liệu cập nhật
 * @returns {Promise<Object>} Modifier group sau khi cập nhật
 */
export const updateModifierGroup = async (groupId, groupData) => {
  try {
    const response = await fetch(`${BASE_URL}/modifier-groups/${groupId}`, {
      method: "PUT",
      headers: HEADERS,
      body: JSON.stringify(groupData),
    });

    const result = await response.json();

    if (result.success) {
      return result.data;
    }
    throw new Error(result.message || "Failed to update modifier group");
  } catch (error) {
    console.error("Update modifier group error:", error);
    throw error;
  }
};

/**
 * Xóa modifier group (soft delete)
 * @param {string} groupId - ID modifier group
 * @returns {Promise<void>}
 */
export const deleteModifierGroup = async (groupId) => {
  try {
    const response = await fetch(`${BASE_URL}/modifier-groups/${groupId}`, {
      method: "DELETE",
      headers: HEADERS,
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Failed to delete modifier group");
    }
  } catch (error) {
    console.error("Delete modifier group error:", error);
    throw error;
  }
};

/**
 * Toggle trạng thái active/inactive của modifier group
 * @param {string} groupId - ID modifier group
 * @param {boolean} isActive - Trạng thái mới
 * @returns {Promise<Object>}
 */
export const toggleModifierGroupStatus = async (groupId, isActive) => {
  try {
    // Use PUT to update the group with new isActive status
    const response = await fetch(`${BASE_URL}/modifier-groups/${groupId}`, {
      method: "PUT",
      headers: HEADERS,
      body: JSON.stringify({ isActive }),
    });

    const result = await response.json();

    if (result.success) {
      return result.data;
    }
    throw new Error(result.message || "Failed to toggle status");
  } catch (error) {
    console.error("Toggle modifier group status error:", error);
    throw error;
  }
};

// ==================== MODIFIER OPTIONS ====================

/**
 * Fetch danh sách modifier groups đã gắn cho một dish
 * GET /api/menu-item-modifier-group?dishId=...
 * @param {string} dishId - ID của dish
 * @returns {Promise<Array>} Danh sách modifier group IDs đã gắn
 */
export const fetchDishModifierGroups = async (dishId) => {
  try {
    const url = `${
      import.meta.env.VITE_BACKEND_URL
    }/api/menu-item-modifier-group?dishId=${dishId}`;

    const response = await fetch(url, { headers: HEADERS });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();

    if (result.success) {
      // Trả về danh sách các group IDs
      return result.data || [];
    }
    return [];
  } catch (error) {
    console.error("Fetch dish modifier groups error:", error);
    return [];
  }
};

/**
 * Thêm liên kết modifier group cho dish
 * POST /api/menu-item-modifier-group
 * @param {string} dishId - ID của dish
 * @param {string} groupId - ID của modifier group
 * @returns {Promise<Object>} Kết quả thêm liên kết
 */
export const addDishModifierGroup = async (dishId, groupId) => {
  try {
    const url = `${
      import.meta.env.VITE_BACKEND_URL
    }/api/menu-item-modifier-group`;

    const response = await fetch(url, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({ dishId, groupId }),
    });

    const result = await response.json();

    if (result.success) {
      return result.data;
    }
    throw new Error(result.message || "Failed to add modifier group link");
  } catch (error) {
    console.error("Add dish modifier group error:", error);
    throw error;
  }
};

/**
 * Xóa liên kết modifier group khỏi dish
 * DELETE /api/menu-item-modifier-group
 * @param {string} dishId - ID của dish
 * @param {string} groupId - ID của modifier group
 * @returns {Promise<void>}
 */
export const removeDishModifierGroup = async (dishId, groupId) => {
  try {
    const url = `${
      import.meta.env.VITE_BACKEND_URL
    }/api/menu-item-modifier-group`;

    const response = await fetch(url, {
      method: "DELETE",
      headers: HEADERS,
      body: JSON.stringify({ dishId, groupId }),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Failed to remove modifier group link");
    }
  } catch (error) {
    console.error("Remove dish modifier group error:", error);
    throw error;
  }
};

/**
 * Sync modifier groups cho dish (thêm mới và xóa các group không còn chọn)
 * @param {string} dishId - ID của dish
 * @param {Array<string>} selectedGroupIds - Danh sách group IDs được chọn
 * @returns {Promise<void>}
 */
export const syncDishModifierGroups = async (dishId, selectedGroupIds) => {
  try {
    // Lấy danh sách modifier groups hiện tại
    const currentGroups = await fetchDishModifierGroups(dishId);
    const currentGroupIds = currentGroups.map(
      (item) => item.groupId || item.id
    );

    // Tìm các group cần thêm (có trong selectedGroupIds nhưng không có trong currentGroupIds)
    const groupsToAdd = selectedGroupIds.filter(
      (id) => !currentGroupIds.includes(id)
    );

    // Tìm các group cần xóa (có trong currentGroupIds nhưng không có trong selectedGroupIds)
    const groupsToRemove = currentGroupIds.filter(
      (id) => !selectedGroupIds.includes(id)
    );

    // Thực hiện thêm
    for (const groupId of groupsToAdd) {
      await addDishModifierGroup(dishId, groupId);
    }

    // Thực hiện xóa
    for (const groupId of groupsToRemove) {
      await removeDishModifierGroup(dishId, groupId);
    }

    console.log(
      `Synced modifier groups for dish ${dishId}: Added ${groupsToAdd.length}, Removed ${groupsToRemove.length}`
    );
  } catch (error) {
    console.error("Sync dish modifier groups error:", error);
    throw error;
  }
};

/**
 * Tạo option mới trong group
 * POST /api/admin/menu/modifier-groups/:id/options
 * @param {string} groupId - ID modifier group
 * @param {Object} optionData - Dữ liệu option
 * @returns {Promise<Object>} Option vừa tạo
 */
export const createModifier = async (groupId, optionData) => {
  try {

    const response = await fetch(
      `${BASE_URL}/modifier-groups/${groupId}/options`,
      {
        method: "POST",
        headers: HEADERS,
        body: JSON.stringify(modifierData),
      }
    );


    const result = await response.json();

    if (result.success) {
      return result.data;
    }
    throw new Error(result.message || "Failed to create modifier");
  } catch (error) {
    console.error("Create modifier error:", error);
    throw error;
  }
};

/**
 * Cập nhật option
 * PUT /api/admin/menu/modifier-options/:id
 * @param {string} groupId - ID modifier group (không dùng trong API mới)
 * @param {string} optionId - ID option
 * @param {Object} optionData - Dữ liệu cập nhật
 * @returns {Promise<Object>} Option sau khi cập nhật
 */
export const updateModifier = async (groupId, optionId, optionData) => {
  try {
    const response = await fetch(`${BASE_URL}/modifier-options/${optionId}`, {
      method: "PUT",
      headers: HEADERS,
      body: JSON.stringify(optionData),
    });

    const result = await response.json();

    if (result.success) {
      return result.data;
    }
    throw new Error(result.message || "Failed to update modifier");
  } catch (error) {
    console.error("Update modifier error:", error);
    throw error;
  }
};

/**
 * Xóa option
 * DELETE /api/admin/menu/modifier-options/:id (assumed)
 * @param {string} groupId - ID modifier group (không dùng trong API mới)
 * @param {string} optionId - ID option
 * @returns {Promise<void>}
 */
export const deleteModifier = async (groupId, optionId) => {
  try {
    const response = await fetch(`${BASE_URL}/modifier-options/${optionId}`, {
      method: "DELETE",
      headers: HEADERS,
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Failed to delete modifier");
    }
  } catch (error) {
    console.error("Delete modifier error:", error);
    throw error;
  }
};

/**
 * Xóa vĩnh viễn modifier group (hard delete)
 * @param {string} groupId - ID modifier group
 * @returns {Promise<void>}
 */
export const deleteModifierGroupPermanent = async (groupId) => {
  try {
    const response = await fetch(`${BASE_URL}/modifier-groups/${groupId}/permanent`, {
      method: "DELETE", 
      headers: HEADERS,
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Failed to permanently delete modifier group");
    }
  } catch (error) {
    console.error("Delete modifier group permanent error:", error);
    throw error;
  }
};


