/**
 * Modifier Constants - Các hằng số cho quản lý modifier
 */

export const SORT_OPTIONS = [
  { value: "name", label: "Sắp xếp theo tên" },
  { value: "createdAt", label: "Sắp xếp theo ngày tạo" },
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
  GROUP_CREATE_SUCCESS: "Tạo nhóm modifier thành công!",
  GROUP_UPDATE_SUCCESS: "Cập nhật nhóm modifier thành công!",
  GROUP_DELETE_SUCCESS: "Xóa nhóm modifier thành công!",
  GROUP_TOGGLE_SUCCESS: "Thay đổi trạng thái thành công!",
  MODIFIER_CREATE_SUCCESS: "Tạo modifier thành công!",
  MODIFIER_UPDATE_SUCCESS: "Cập nhật modifier thành công!",
  MODIFIER_DELETE_SUCCESS: "Xóa modifier thành công!",
  CREATE_ERROR: "Lỗi khi tạo. Vui lòng thử lại!",
  UPDATE_ERROR: "Lỗi khi cập nhật. Vui lòng thử lại!",
  DELETE_ERROR: "Lỗi khi xóa. Vui lòng thử lại!",
  DELETE_CONFIRMATION: "Bạn có chắc chắn muốn xóa?",
  LOADING: "Đang tải...",
};
