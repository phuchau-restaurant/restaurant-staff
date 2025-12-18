/**
 * Table Constants - Hằng số dùng cho quản lý bàn
 */
import TableStatus from "../../constants/tableStatus";

/**
 * Danh sách options cho dropdown trạng thái
 */
export const STATUS_OPTIONS = [
  { value: "", label: "Tất cả trạng thái" },
  { value: TableStatus.AVAILABLE, label: "Trống" },
  { value: TableStatus.OCCUPIED, label: "Có khách" },
  { value: TableStatus.INACTIVE, label: "Không hoạt động" },
];

/**
 * Danh sách options cho dropdown sắp xếp
 */
export const SORT_OPTIONS = [
  { value: "tableNumber", label: "Sắp xếp theo số bàn" },
  { value: "capacity", label: "Sắp xếp theo sức chứa" },
  { value: "createdAt", label: "Sắp xếp theo ngày tạo" },
];

/**
 * Giá trị mặc định cho area options
 */
export const DEFAULT_AREA_OPTION = { value: "", label: "Tất cả khu vực" };

/**
 * View modes
 */
export const VIEW_MODES = {
  GRID: "grid",
  LIST: "list",
};

/**
 * Messages cho modal xác nhận vô hiệu hóa
 */
export const DEACTIVATE_CONFIRMATION = {
  title: "Xác nhận vô hiệu hóa",
  message:
    "Bàn sẽ chuyển sang trạng thái 'Không hoạt động' và không thể sử dụng cho đến khi kích hoạt lại.\n\nBạn có chắc chắn muốn vô hiệu hóa bàn này?",
};

/**
 * Messages cho cảnh báo
 */
export const WARNING_MESSAGES = {
  CANNOT_DEACTIVATE_OCCUPIED:
    "Không thể vô hiệu hóa bàn đang có khách!\n\nVui lòng đổi trạng thái sang 'Trống' trước.",
};

/**
 * Messages cho thông báo thành công
 */
export const SUCCESS_MESSAGES = {
  TABLE_ACTIVATED: "Đã kích hoạt bàn thành công",
  TABLE_DEACTIVATED: "Đã vô hiệu hóa bàn thành công",
  TABLE_CREATED: "Tạo bàn mới thành công!",
  TABLE_UPDATED: "Cập nhật bàn thành công!",
};

/**
 * Messages cho thông báo lỗi
 */
export const ERROR_MESSAGES = {
  ACTIVATE_FAILED: "Có lỗi xảy ra khi kích hoạt bàn",
  DEACTIVATE_FAILED: "Có lỗi xảy ra khi vô hiệu hóa bàn",
  UPDATE_STATUS_FAILED: "Có lỗi xảy ra khi cập nhật trạng thái",
  FETCH_TABLE_FAILED: "Không thể tải thông tin bàn",
  SAVE_FAILED: "Không thể lưu dữ liệu",
};
