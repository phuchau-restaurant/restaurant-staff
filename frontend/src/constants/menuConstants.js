/**
 * Menu Constants - Các hằng số cho quản lý món ăn
 */

export const SORT_OPTIONS = [
  { value: "name", label: "Sắp xếp theo tên" },
  { value: "price", label: "Sắp xếp theo giá" },
  { value: "createdAt", label: "Sắp xếp theo ngày tạo" },
];

export const STATUS_OPTIONS = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "true", label: "Đang bán" },
  { value: "false", label: "Ngừng bán" },
];

export const VIEW_MODES = {
  GRID: "grid",
  LIST: "list",
};

export const MESSAGES = {
  CREATE_SUCCESS: "Tạo món ăn thành công!",
  UPDATE_SUCCESS: "Cập nhật món ăn thành công!",
  DELETE_SUCCESS: "Xóa món ăn thành công!",
  CREATE_ERROR: "Lỗi khi tạo món ăn. Vui lòng thử lại!",
  UPDATE_ERROR: "Lỗi khi cập nhật món ăn. Vui lòng thử lại!",
  DELETE_ERROR: "Lỗi khi xóa món ăn. Vui lòng thử lại!",
  DELETE_CONFIRMATION: "Bạn có chắc chắn muốn xóa món ăn này?",
  IMAGE_UPLOAD_SUCCESS: "Upload ảnh thành công!",
  IMAGE_DELETE_SUCCESS: "Xóa ảnh thành công!",
  SET_PRIMARY_SUCCESS: "Đã đặt làm ảnh chính!",
  MODIFIER_ATTACH_SUCCESS: "Gắn modifier group thành công!",
  LOADING: "Đang tải...",
};

export const PLACEHOLDER_IMAGES = {
  MENU_ITEM: "https://via.placeholder.com/400x300?text=Menu+Item",
};

export const PRICE_RANGES = [
  { value: "", label: "Tất cả mức giá" },
  { value: "0-50000", label: "Dưới 50.000đ" },
  { value: "50000-100000", label: "50.000đ - 100.000đ" },
  { value: "100000-200000", label: "100.000đ - 200.000đ" },
  { value: "200000-", label: "Trên 200.000đ" },
];
