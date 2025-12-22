/**
 * Category Constants - Các hằng số cho quản lý danh mục
 */

export const SORT_OPTIONS = [
  { value: "name", label: "Sắp xếp theo tên" },
  { value: "createdAt", label: "Sắp xếp theo ngày tạo" },
  { value: "isActive", label: "Sắp xếp theo trạng thái" },
];

export const STATUS_OPTIONS = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "true", label: "Đang hoạt động" },
  { value: "false", label: "Không hoạt động" },
];

export const VIEW_MODES = {
  GRID: "grid",
  LIST: "list",
};

export const MESSAGES = {
  CREATE_SUCCESS: "Tạo danh mục thành công!",
  UPDATE_SUCCESS: "Cập nhật danh mục thành công!",
  DELETE_SUCCESS: "Xóa danh mục thành công!",
  CREATE_ERROR: "Lỗi khi tạo danh mục. Vui lòng thử lại!",
  UPDATE_ERROR: "Lỗi khi cập nhật danh mục. Vui lòng thử lại!",
  DELETE_ERROR: "Lỗi khi xóa danh mục. Vui lòng thử lại!",
  DELETE_CONFIRMATION: "Bạn có chắc chắn muốn xóa danh mục này?",
  LOADING: "Đang tải...",
};

export const PLACEHOLDER_IMAGES = {
  CATEGORY: "https://via.placeholder.com/400x300?text=Category",
};
