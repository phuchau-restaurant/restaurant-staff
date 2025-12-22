/**
 * Category Utils - Utility functions cho quản lý danh mục
 */

/**
 * Filter và sort danh sách danh mục
 * @param {Array} categories - Danh sách danh mục
 * @param {string} searchTerm - Từ khóa tìm kiếm
 * @param {string} statusFilter - Bộ lọc trạng thái
 * @param {string} sortBy - Tiêu chí sắp xếp
 * @returns {Array} Danh sách danh mục sau khi filter và sort
 */
export const filterAndSortCategories = (
  categories = [],
  searchTerm = "",
  statusFilter = "",
  sortBy = "name"
) => {
  if (!Array.isArray(categories)) {
    return [];
  }

  // Filter theo status
  let filtered = categories;
  if (statusFilter) {
    const isActive = statusFilter === "true";
    filtered = filtered.filter((cat) => cat.isActive === isActive);
  }

  // Filter theo search term
  if (searchTerm.trim()) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(
      (cat) =>
        cat.name.toLowerCase().includes(term) ||
        (cat.description && cat.description.toLowerCase().includes(term))
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
 * Validate category data
 * @param {Object} categoryData - Dữ liệu danh mục
 * @returns {Object} {isValid: boolean, errors: Object}
 */
export const validateCategoryData = (categoryData) => {
  const errors = {};

  if (!categoryData.name || !categoryData.name.trim()) {
    errors.name = "Tên danh mục là bắt buộc";
  }

  if (categoryData.name && categoryData.name.trim().length > 100) {
    errors.name = "Tên danh mục không quá 100 ký tự";
  }

  if (
    categoryData.description &&
    categoryData.description.trim().length > 500
  ) {
    errors.description = "Mô tả không quá 500 ký tự";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
