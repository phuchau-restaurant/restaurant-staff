/**
 * Menu Utils - Utility functions cho quản lý món ăn
 */

/**
 * Filter và sort danh sách món ăn
 * @param {Array} menuItems - Danh sách món ăn
 * @param {string} searchTerm - Từ khóa tìm kiếm
 * @param {string} statusFilter - Bộ lọc trạng thái
 * @param {string} categoryFilter - Bộ lọc danh mục
 * @param {string} priceRange - Bộ lọc giá
 * @param {string} sortBy - Tiêu chí sắp xếp
 * @returns {Array} Danh sách món ăn sau khi filter và sort
 */
export const filterAndSortMenuItems = (
  menuItems = [],
  searchTerm = "",
  statusFilter = "",
  categoryFilter = "",
  priceRange = "",
  sortBy = "name"
) => {
  if (!Array.isArray(menuItems)) {
    return [];
  }

  // Filter theo status
  let filtered = menuItems;
  if (statusFilter) {
    const isAvailable = statusFilter === "true";
    filtered = filtered.filter((item) => item.isAvailable === isAvailable);
  }

  // Filter theo category
  if (categoryFilter) {
    filtered = filtered.filter(
      (item) => String(item.categoryId) === String(categoryFilter)
    );
  }

  // Filter theo price range
  if (priceRange) {
    const [min, max] = priceRange.split("-").map(Number);
    filtered = filtered.filter((item) => {
      const price = Number(item.price);
      if (max) {
        return price >= min && price <= max;
      }
      return price >= min;
    });
  }

  // Filter theo search term
  if (searchTerm.trim()) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.name.toLowerCase().includes(term) ||
        (item.description && item.description.toLowerCase().includes(term))
    );
  }

  // Sort
  const sorted = [...filtered];
  switch (sortBy) {
    case "name":
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "price":
      sorted.sort((a, b) => Number(a.price) - Number(b.price));
      break;
    case "createdAt":
      sorted.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA;
      });
      break;
    case "isAvailable":
      sorted.sort((a, b) => {
        if (a.isAvailable === b.isAvailable) return 0;
        return a.isAvailable ? -1 : 1;
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
  if (price === null || price === undefined) return "0 ₫";
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
 * Validate menu item data
 * @param {Object} menuData - Dữ liệu món ăn
 * @returns {Object} {isValid: boolean, errors: Object}
 */
export const validateMenuItemData = (menuData) => {
  const errors = {};

  // Name validation
  if (!menuData.name || !menuData.name.trim()) {
    errors.name = "Name is required, 2–80 characters";
  } else if (menuData.name.trim().length < 2 || menuData.name.trim().length > 80) {
    errors.name = "Name is required, 2–80 characters";
  }

  // Price validation
  if (menuData.price === undefined || menuData.price === null || menuData.price === "") {
    errors.price = "Price must be a positive number (e.g., 0.01 to 999999)";
  } else {
    const price = Number(menuData.price);
    if (isNaN(price) || price <= 0 || price > 999999) {
      errors.price = "Price must be a positive number (e.g., 0.01 to 999999)";
    }
  }

  // Category validation
  if (!menuData.categoryId) {
    errors.categoryId = "Category must exist and belong to the same restaurant";
  }

  // Preparation time validation
  if (menuData.preparationTime !== undefined && menuData.preparationTime !== null && menuData.preparationTime !== "") {
    const time = Number(menuData.preparationTime);
    if (isNaN(time) || time < 0 || !Number.isInteger(time) || time > 240) {
      errors.preparationTime = "Preparation time must be a non-negative integer (0–240 suggested)";
    }
  }

  // Description validation (optional but max length)
  if (menuData.description && menuData.description.length > 500) {
    errors.description = "Mô tả không được vượt quá 500 ký tự";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Get primary image from images array
 * @param {Array} images - Danh sách ảnh
 * @returns {Object|null} Ảnh chính
 */
export const getPrimaryImage = (images) => {
  if (!images || !Array.isArray(images) || images.length === 0) return null;
  return images.find((img) => img.isPrimary) || images[0];
};
