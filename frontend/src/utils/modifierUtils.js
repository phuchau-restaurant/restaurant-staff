/**
 * Modifier Utils - Utility functions cho quản lý modifier
 */

/**
 * Filter và sort danh sách modifier groups
 * @param {Array} groups - Danh sách modifier groups
 * @param {string} searchTerm - Từ khóa tìm kiếm
 * @param {string} statusFilter - Bộ lọc trạng thái
 * @param {string} sortBy - Tiêu chí sắp xếp
 * @returns {Array} Danh sách modifier groups sau khi filter và sort
 */
export const filterAndSortModifierGroups = (
  groups = [],
  searchTerm = "",
  statusFilter = "",
  sortBy = "name"
) => {
  if (!Array.isArray(groups)) {
    return [];
  }

  // Filter theo status
  let filtered = groups;
  if (statusFilter) {
    const isActive = statusFilter === "true";
    filtered = filtered.filter((group) => group.isActive === isActive);
  }

  // Filter theo search term
  if (searchTerm.trim()) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(
      (group) =>
        group.name.toLowerCase().includes(term) ||
        (group.description && group.description.toLowerCase().includes(term))
    );
  }

  // Sort
  const sorted = [...filtered];
  switch (sortBy) {
    case "name":
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "createdAt":
      sorted.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA;
      });
      break;
    case "isActive":
      sorted.sort((a, b) => {
        if (a.isActive === b.isActive) return 0;
        return a.isActive ? -1 : 1;
      });
      break;
    default:
      break;
  }

  return sorted;
};

/**
 * Format giá tiền
 * @param {number} price - Giá tiền
 * @returns {string} Giá định dạng VND
 */
export const formatPrice = (price) => {
  if (price === null || price === undefined || price === 0) return "Miễn phí";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

/**
 * Format ngày tạo
 * @param {string} dateString - Chuỗi ngày
 * @returns {string} Ngày định dạng
 */
export const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

/**
 * Validate modifier group data
 * @param {Object} groupData - Dữ liệu modifier group
 * @returns {Object} {isValid: boolean, errors: Object}
 */
export const validateModifierGroupData = (groupData) => {
  const errors = {};

  // Name validation
  if (!groupData.name || !groupData.name.trim()) {
    errors.name = "Tên nhóm modifier là bắt buộc";
  } else if (groupData.name.trim().length < 2) {
    errors.name = "Tên nhóm modifier phải có ít nhất 2 ký tự";
  } else if (groupData.name.trim().length > 100) {
    errors.name = "Tên nhóm modifier không được vượt quá 100 ký tự";
  }

  // Min/Max select validation
  if (groupData.minSelect !== undefined && groupData.maxSelect !== undefined) {
    if (Number(groupData.minSelect) > Number(groupData.maxSelect)) {
      errors.minSelect = "Số lượng tối thiểu không được lớn hơn tối đa";
    }
  }

  if (groupData.minSelect !== undefined && Number(groupData.minSelect) < 0) {
    errors.minSelect = "Số lượng tối thiểu phải >= 0";
  }

  if (groupData.maxSelect !== undefined && Number(groupData.maxSelect) < 1) {
    errors.maxSelect = "Số lượng tối đa phải >= 1";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate modifier data
 * @param {Object} modifierData - Dữ liệu modifier
 * @returns {Object} {isValid: boolean, errors: Object}
 */
export const validateModifierData = (modifierData) => {
  const errors = {};

  // Name validation
  if (!modifierData.name || !modifierData.name.trim()) {
    errors.name = "Tên modifier là bắt buộc";
  } else if (modifierData.name.trim().length < 1) {
    errors.name = "Tên modifier phải có ít nhất 1 ký tự";
  }

  // Price validation
  if (modifierData.price !== undefined && modifierData.price !== null && modifierData.price !== "") {
    if (isNaN(Number(modifierData.price)) || Number(modifierData.price) < 0) {
      errors.price = "Giá phải là số >= 0";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Count active modifiers in a group
 * @param {Object} group - Modifier group
 * @returns {number} Số lượng modifiers đang active
 */
export const countActiveModifiers = (group) => {
  if (!group || !group.modifiers || !Array.isArray(group.modifiers)) return 0;
  return group.modifiers.filter((m) => m.isActive).length;
};
