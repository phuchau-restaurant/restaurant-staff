/**
 * Order Utilities
 * Helper functions cho quản lý đơn hàng
 */

import {
  ORDER_STATUS,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  ORDER_DETAIL_STATUS_LABELS,
  ORDER_DETAIL_STATUS_COLORS,
  DEFAULT_PREP_TIME,
} from "../constants/orderConstants";

/**
 * Format giá tiền
 * @param {number} price - Giá tiền
 * @returns {string} Chuỗi giá đã format
 */
export const formatPrice = (price) => {
  if (!price && price !== 0) return "0đ";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

/**
 * Format ngày giờ
 * @param {string} dateString - Chuỗi ngày
 * @returns {string} Chuỗi ngày đã format
 */
export const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

/**
 * Format ngày giờ ngắn gọn
 * @param {string} dateString - Chuỗi ngày
 * @returns {string} Chuỗi ngày đã format
 */
export const formatDateShort = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("vi-VN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

/**
 * Lấy label trạng thái đơn hàng
 * @param {string} status - Trạng thái
 * @returns {string} Label tiếng Việt
 */
export const getOrderStatusLabel = (status) => {
  return ORDER_STATUS_LABELS[status] || status;
};

/**
 * Lấy class màu sắc cho trạng thái đơn hàng
 * @param {string} status - Trạng thái
 * @returns {string} Class CSS
 */
export const getOrderStatusColor = (status) => {
  return ORDER_STATUS_COLORS[status] || "bg-gray-100 text-gray-700";
};

/**
 * Lấy label trạng thái chi tiết đơn hàng
 * @param {string} status - Trạng thái
 * @returns {string} Label tiếng Việt
 */
export const getOrderDetailStatusLabel = (status) => {
  return ORDER_DETAIL_STATUS_LABELS[status] || status;
};

/**
 * Lấy class màu sắc cho trạng thái chi tiết đơn hàng
 * @param {string} status - Trạng thái
 * @returns {string} Class CSS
 */
export const getOrderDetailStatusColor = (status) => {
  return ORDER_DETAIL_STATUS_COLORS[status] || "bg-gray-100 text-gray-700";
};

/**
 * Tính tổng tiền đơn hàng
 * @param {Array} items - Danh sách items
 * @returns {number} Tổng tiền
 */
export const calculateOrderTotal = (items) => {
  if (!items || !Array.isArray(items)) return 0;
  return items.reduce((total, item) => {
    const itemPrice = (item.unitPrice || 0) * (item.quantity || 0);
    return total + itemPrice;
  }, 0);
};

/**
 * Kiểm tra đơn hàng có quá thời gian chuẩn bị không
 * @param {string} createdAt - Thời gian tạo đơn
 * @param {number} prepTime - Thời gian chuẩn bị (phút), mặc định 15 phút
 * @param {string} status - Trạng thái đơn hàng
 * @returns {boolean} True nếu quá thời gian
 */
export const isOrderOverdue = (
  createdAt,
  prepTime = DEFAULT_PREP_TIME,
  status
) => {
  // Chỉ check overdue cho các đơn đang active (chưa completed/served/paid/cancelled)
  const activeStatuses = [
    ORDER_STATUS.UNSUBMIT,
    ORDER_STATUS.APPROVED,
    ORDER_STATUS.PENDING,
  ];
  if (!activeStatuses.includes(status)) {
    return false;
  }

  if (!createdAt) return false;

  const created = new Date(createdAt);
  const now = new Date();
  const diffMinutes = (now - created) / 1000 / 60;

  return diffMinutes > prepTime;
};

/**
 * Tính thời gian đã trôi qua từ khi tạo đơn
 * @param {string} createdAt - Thời gian tạo đơn
 * @returns {string} Chuỗi mô tả thời gian (vd: "5 phút trước", "2 giờ trước")
 */
export const getTimeSinceCreated = (createdAt) => {
  if (!createdAt) return "-";

  const created = new Date(createdAt);
  const now = new Date();
  const diffMinutes = Math.floor((now - created) / 1000 / 60);

  if (diffMinutes < 1) return "Vừa xong";
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} ngày trước`;
};

/**
 * Filter và sort danh sách đơn hàng
 * @param {Array} orders - Danh sách đơn hàng
 * @param {string} searchTerm - Từ khóa tìm kiếm
 * @param {string} statusFilter - Filter theo trạng thái
 * @param {string} sortBy - Tiêu chí sắp xếp
 * @returns {Array} Danh sách đã filter và sort
 */
export const filterAndSortOrders = (
  orders,
  searchTerm = "",
  statusFilter = "",
  sortBy = "createdAt-desc"
) => {
  let filtered = [...orders];

  // Filter theo search term (tìm theo table ID hoặc order ID)
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter((order) => {
      const tableIdMatch = order.tableId?.toString().includes(term);
      const orderIdMatch = order.id?.toString().includes(term);
      return tableIdMatch || orderIdMatch;
    });
  }

  // Filter theo trạng thái
  if (statusFilter) {
    filtered = filtered.filter((order) => order.status === statusFilter);
  }

  // Sort
  const [field, direction] = sortBy.split("-");
  filtered.sort((a, b) => {
    let valueA = a[field];
    let valueB = b[field];

    // Handle date fields
    if (field === "createdAt" || field === "completedAt") {
      valueA = valueA ? new Date(valueA).getTime() : 0;
      valueB = valueB ? new Date(valueB).getTime() : 0;
    }

    // Handle numeric fields
    if (field === "totalAmount" || field === "tableId" || field === "prepTimeOrder") {
      valueA = valueA || 0;
      valueB = valueB || 0;
    }

    if (direction === "asc") {
      return valueA > valueB ? 1 : -1;
    } else {
      return valueA < valueB ? 1 : -1;
    }
  });

  return filtered;
};

/**
 * Lấy số lượng món trong đơn hàng
 * @param {Array} items - Danh sách items
 * @returns {number} Tổng số lượng món
 */
export const getTotalItemsCount = (items) => {
  if (!items || !Array.isArray(items)) return 0;
  return items.reduce((total, item) => total + (item.quantity || 0), 0);
};

/**
 * Validate dữ liệu đơn hàng
 * @param {Object} orderData - Dữ liệu đơn hàng
 * @returns {Object} { valid: boolean, errors: Array }
 */
export const validateOrderData = (orderData) => {
  const errors = [];

  if (!orderData.tableId) {
    errors.push("Vui lòng chọn bàn");
  }

  if (!orderData.dishes || orderData.dishes.length === 0) {
    errors.push("Vui lòng chọn ít nhất một món");
  }

  if (orderData.dishes && orderData.dishes.length > 0) {
    orderData.dishes.forEach((dish, index) => {
      if (!dish.dishId) {
        errors.push(`Món thứ ${index + 1}: Thiếu thông tin món ăn`);
      }
      if (!dish.quantity || dish.quantity < 1) {
        errors.push(`Món thứ ${index + 1}: Số lượng phải lớn hơn 0`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};
