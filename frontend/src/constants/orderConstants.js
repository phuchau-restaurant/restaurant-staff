/**
 * Order Constants
 * Định nghĩa constants cho quản lý đơn hàng
 */

// Trạng thái đơn hàng
export const ORDER_STATUS = {
  UNSUBMIT: "Unsubmit",
  APPROVED: "Approved",
  PENDING: "Pending",
  COMPLETED: "Completed",
  SERVED: "Served",
  PAID: "Paid",
  CANCELLED: "Cancelled",
};

// Thứ tự trạng thái đơn hàng (không bao gồm Cancelled)
export const ORDER_STATUS_FLOW = [
  ORDER_STATUS.UNSUBMIT,
  ORDER_STATUS.APPROVED,
  ORDER_STATUS.PENDING,
  ORDER_STATUS.COMPLETED,
  ORDER_STATUS.SERVED,
  ORDER_STATUS.PAID,
];

/**
 * Lấy trạng thái tiếp theo của đơn hàng
 * @param {string} currentStatus - Trạng thái hiện tại
 * @returns {string|null} Trạng thái tiếp theo hoặc null nếu đã là cuối
 */
export const getNextStatus = (currentStatus) => {
  const currentIndex = ORDER_STATUS_FLOW.indexOf(currentStatus);
  if (currentIndex === -1 || currentIndex === ORDER_STATUS_FLOW.length - 1) {
    return null;
  }
  return ORDER_STATUS_FLOW[currentIndex + 1];
};

/**
 * Lấy trạng thái trước đó của đơn hàng
 * @param {string} currentStatus - Trạng thái hiện tại
 * @returns {string|null} Trạng thái trước hoặc null nếu đã là đầu
 */
export const getPrevStatus = (currentStatus) => {
  const currentIndex = ORDER_STATUS_FLOW.indexOf(currentStatus);
  if (currentIndex <= 0) {
    return null;
  }
  return ORDER_STATUS_FLOW[currentIndex - 1];
};

// Trạng thái chi tiết đơn hàng (order detail/item)
export const ORDER_DETAIL_STATUS = {
  PENDING: "Pending",
  PREPARING: "Preparing",
  READY: "Ready",
  SERVED: "Served",
  CANCELLED: "Cancelled",
};

// Mapping trạng thái đơn hàng sang label tiếng Việt
export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.UNSUBMIT]: "Chưa xác nhận",
  [ORDER_STATUS.APPROVED]: "Đã xác nhận",
  [ORDER_STATUS.PENDING]: "Đang chờ",
  [ORDER_STATUS.COMPLETED]: "Hoàn thành",
  [ORDER_STATUS.SERVED]: "Đã phục vụ",
  [ORDER_STATUS.PAID]: "Đã thanh toán",
  [ORDER_STATUS.CANCELLED]: "Đã hủy",
};

// Mapping trạng thái chi tiết đơn hàng sang label tiếng Việt
export const ORDER_DETAIL_STATUS_LABELS = {
  [ORDER_DETAIL_STATUS.PENDING]: "Chờ xử lý",
  [ORDER_DETAIL_STATUS.PREPARING]: "Đang chuẩn bị",
  [ORDER_DETAIL_STATUS.READY]: "Sẵn sàng",
  [ORDER_DETAIL_STATUS.SERVED]: "Đã phục vụ",
  [ORDER_DETAIL_STATUS.CANCELLED]: "Đã hủy",
};

// Màu sắc cho các trạng thái đơn hàng
export const ORDER_STATUS_COLORS = {
  [ORDER_STATUS.UNSUBMIT]: "bg-gray-100 text-gray-700 border-gray-300",
  [ORDER_STATUS.APPROVED]: "bg-blue-100 text-blue-700 border-blue-300",
  [ORDER_STATUS.PENDING]: "bg-yellow-100 text-yellow-700 border-yellow-300",
  [ORDER_STATUS.COMPLETED]: "bg-green-100 text-green-700 border-green-300",
  [ORDER_STATUS.SERVED]: "bg-purple-100 text-purple-700 border-purple-300",
  [ORDER_STATUS.PAID]: "bg-emerald-100 text-emerald-700 border-emerald-300",
  [ORDER_STATUS.CANCELLED]: "bg-red-100 text-red-700 border-red-300",
};

// Màu sắc cho các nút chuyển trạng thái (có hover)
export const ORDER_STATUS_BUTTON_COLORS = {
  [ORDER_STATUS.UNSUBMIT]: "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300",
  [ORDER_STATUS.APPROVED]: "bg-blue-100 hover:bg-blue-200 text-blue-700 border border-blue-300",
  [ORDER_STATUS.PENDING]: "bg-yellow-100 hover:bg-yellow-200 text-yellow-700 border border-yellow-300",
  [ORDER_STATUS.COMPLETED]: "bg-green-100 hover:bg-green-200 text-green-700 border border-green-300",
  [ORDER_STATUS.SERVED]: "bg-purple-100 hover:bg-purple-200 text-purple-700 border border-purple-300",
  [ORDER_STATUS.PAID]: "bg-emerald-100 hover:bg-emerald-200 text-emerald-700 border border-emerald-300",
  [ORDER_STATUS.CANCELLED]: "bg-red-100 hover:bg-red-200 text-red-700 border border-red-300",
};

// Màu sắc cho các trạng thái chi tiết đơn hàng
export const ORDER_DETAIL_STATUS_COLORS = {
  [ORDER_DETAIL_STATUS.PENDING]: "bg-yellow-100 text-yellow-700",
  [ORDER_DETAIL_STATUS.PREPARING]: "bg-orange-100 text-orange-700",
  [ORDER_DETAIL_STATUS.READY]: "bg-green-100 text-green-700",
  [ORDER_DETAIL_STATUS.SERVED]: "bg-purple-100 text-purple-700",
  [ORDER_DETAIL_STATUS.CANCELLED]: "bg-red-100 text-red-700",
};

// Options cho filter trạng thái
export const STATUS_OPTIONS = [
  { value: "", label: "Tất cả trạng thái" },
  {
    value: ORDER_STATUS.UNSUBMIT,
    label: ORDER_STATUS_LABELS[ORDER_STATUS.UNSUBMIT],
  },
  {
    value: ORDER_STATUS.APPROVED,
    label: ORDER_STATUS_LABELS[ORDER_STATUS.APPROVED],
  },
  {
    value: ORDER_STATUS.PENDING,
    label: ORDER_STATUS_LABELS[ORDER_STATUS.PENDING],
  },
  {
    value: ORDER_STATUS.COMPLETED,
    label: ORDER_STATUS_LABELS[ORDER_STATUS.COMPLETED],
  },
  {
    value: ORDER_STATUS.SERVED,
    label: ORDER_STATUS_LABELS[ORDER_STATUS.SERVED],
  },
  { value: ORDER_STATUS.PAID, label: ORDER_STATUS_LABELS[ORDER_STATUS.PAID] },
  {
    value: ORDER_STATUS.CANCELLED,
    label: ORDER_STATUS_LABELS[ORDER_STATUS.CANCELLED],
  },
];

// View modes
export const VIEW_MODES = {
  GRID: "grid",
  LIST: "list",
};

// Sort options
export const SORT_OPTIONS = [
  { value: "createdAt-desc", label: "Mới nhất" },
  { value: "createdAt-asc", label: "Cũ nhất" },
  { value: "totalAmount-desc", label: "Giá cao nhất" },
  { value: "totalAmount-asc", label: "Giá thấp nhất" },
  { value: "prepTimeOrder-desc", label: "TG chuẩn bị (cao → thấp)" },
  { value: "prepTimeOrder-asc", label: "TG chuẩn bị (thấp → cao)" },
  { value: "tableId-asc", label: "Bàn (A-Z)" },
];

// Messages
export const MESSAGES = {
  CREATE_SUCCESS: "Tạo đơn hàng thành công!",
  UPDATE_SUCCESS: "Cập nhật đơn hàng thành công!",
  DELETE_SUCCESS: "Xóa đơn hàng thành công!",
  STATUS_UPDATE_SUCCESS: "Cập nhật trạng thái thành công!",
  FETCH_ERROR: "Không thể tải dữ liệu đơn hàng!",
  CREATE_ERROR: "Không thể tạo đơn hàng!",
  UPDATE_ERROR: "Không thể cập nhật đơn hàng!",
  DELETE_ERROR: "Không thể xóa đơn hàng!",
};

// Thời gian chuẩn bị mặc định (phút)
export const DEFAULT_PREP_TIME = 15;

// Màu cảnh báo cho đơn hàng quá thời gian
export const OVERDUE_WARNING_COLOR = "bg-red-50 border-red-300";
export const OVERDUE_TEXT_COLOR = "text-red-700";

// ============================================
// KITCHEN DISPLAY SYSTEM (KDS) CONSTANTS
// ============================================

// Kitchen stations/categories
export const STATIONS = [
  { id: 'all', name: 'Tất cả', icon: null },
  { id: 'drink', name: 'Đồ uống', icon: null },
  { id: 'food', name: 'Món chính', icon: null },
  { id: 'appetizer', name: 'Khai vị', icon: null },
  { id: 'dessert', name: 'Tráng miệng', icon: null }
];

// Unified simple color for all order cards - white/gray theme
export const STATUS_CONFIG = {
  new: {
    label: 'Chờ xử lý',
    color: 'bg-gray-400',
    borderColor: 'border-gray-300',
    textColor: 'text-gray-700',
    bgLight: 'bg-gray-50'
  },
  cooking: {
    label: 'Đang chế biến',
    color: 'bg-gray-400',
    borderColor: 'border-gray-300',
    textColor: 'text-gray-700',
    bgLight: 'bg-gray-50'
  },
  late: {
    label: 'Quá giờ!',
    color: 'bg-gray-400',
    borderColor: 'border-gray-300',
    textColor: 'text-gray-700',
    bgLight: 'bg-gray-50'
  },
  completed: {
    label: 'Hoàn thành',
    color: 'bg-gray-400',
    borderColor: 'border-gray-300',
    textColor: 'text-gray-700',
    bgLight: 'bg-gray-50'
  },
  cancelled: {
    label: 'Đã hủy',
    color: 'bg-gray-400',
    borderColor: 'border-gray-300',
    textColor: 'text-gray-700',
    bgLight: 'bg-gray-50'
  }
};

// Status badge colors for displaying order status - maps to database status
export const STATUS_BADGE = {
  // Frontend computed statuses
  new: {
    label: 'Chờ xử lý',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    borderColor: 'border-yellow-300'
  },
  cooking: {
    label: 'Đang chuẩn bị',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-800',
    borderColor: 'border-orange-300'
  },
  late: {
    label: 'Đang chuẩn bị',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-800',
    borderColor: 'border-orange-300'
  },
  completed: {
    label: 'Hoàn thành',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    borderColor: 'border-green-300'
  },
  cancelled: {
    label: 'Đã hủy',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-600',
    borderColor: 'border-gray-300'
  },
  // Database statuses - direct mapping
  Pending: {
    label: 'Chờ xử lý',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    borderColor: 'border-yellow-300'
  },
  Approved: {
    label: 'Đã duyệt',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    borderColor: 'border-blue-300'
  },
  Cooking: {
    label: 'Đang chuẩn bị',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-800',
    borderColor: 'border-orange-300'
  },
  Completed: {
    label: 'Hoàn thành',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    borderColor: 'border-green-300'
  },
  Served: {
    label: 'Đã phục vụ',
    bgColor: 'bg-teal-100',
    textColor: 'text-teal-800',
    borderColor: 'border-teal-300'
  },
  Cancelled: {
    label: 'Đã hủy',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-600',
    borderColor: 'border-gray-300'
  },
  Unsubmit: {
    label: 'Chưa gửi',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-600',
    borderColor: 'border-gray-300'
  },
  Paid: {
    label: 'Đã thanh toán',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
    borderColor: 'border-purple-300'
  }
};
