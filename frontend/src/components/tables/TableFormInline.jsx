import { useState, useEffect } from "react";
import { Save, MapPin, Users, FileText, X } from "lucide-react";
import TableStatus from "../../../constants/tableStatus";
import AlertModal from "../Modal/AlertModal";
import ConfirmModal from "../Modal/ConfirmModal";
import { useAlert } from "../../hooks/useAlert";
import * as tableService from "../../services/tableService";
import {
  DEACTIVATE_CONFIRMATION,
  WARNING_MESSAGES,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
} from "../../constants/tableConstants";

/**
 * TableFormInline - Form tạo/chỉnh sửa bàn hiển thị inline
 * @param {number|null} tableId - ID bàn (null nếu tạo mới)
 * @param {function} onCancel - Callback khi hủy
 * @param {function} onSuccess - Callback khi tạo/sửa thành công
 */
const TableFormInline = ({ tableId, onCancel, onSuccess }) => {
  const isEditMode = !!tableId;
  const { alert, showSuccess, showError, showWarning, closeAlert } = useAlert();

  const [originalTableName, setOriginalTableName] = useState("");
  const [originalStatus, setOriginalStatus] = useState(TableStatus.AVAILABLE);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
  });
  const [formData, setFormData] = useState({
    tableNumber: "",
    capacity: "",
    area: "",
    description: "",
    status: TableStatus.AVAILABLE,
  });

  const [errors, setErrors] = useState({
    tableNumber: "",
    capacity: "",
    area: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [areas, setAreas] = useState([]);

  // Fetch locations
  useEffect(() => {
    fetchAvailableLocations();
  }, []);

  // Fetch table data if editing
  useEffect(() => {
    if (isEditMode) {
      fetchTableData();
    }
  }, [tableId]);

  const fetchAvailableLocations = async () => {
    try {
      const options = await tableService.fetchLocationOptions();
      const locations = options.map((option) => option.value).filter((val) => val);
      setAreas(locations);
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  };

  const fetchTableData = async () => {
    try {
      const data = await tableService.fetchTableById(tableId);
      const currentStatus = data.status || TableStatus.AVAILABLE;
      setFormData({
        tableNumber: data.tableNumber || "",
        capacity: String(data.capacity ?? ""),
        area: data.location || "",
        description: data.description || "",
        status: currentStatus,
      });
      setOriginalTableName(data.tableNumber || "");
      setOriginalStatus(currentStatus);
    } catch (error) {
      console.error("Error fetching table:", error);
      showError(ERROR_MESSAGES.FETCH_TABLE_FAILED);
    }
  };

  const checkDuplicateTableNumber = async (tableNumber) => {
    try {
      return await tableService.checkDuplicateTableNumber(tableNumber);
    } catch (error) {
      console.error("Error checking duplicate:", error);
      return false;
    }
  };

  const validateForm = async () => {
    const newErrors = {};
    let isValid = true;

    // Validate table number
    const tableNumber = formData.tableNumber.trim();
    if (!tableNumber) {
      newErrors.tableNumber = "Vui lòng nhập tên bàn";
      isValid = false;
    } else {
      const inputNormalized = tableNumber.toLowerCase();
      const originalNormalized = originalTableName.toLowerCase();
      const shouldCheckDuplicate = !isEditMode || inputNormalized !== originalNormalized;

      if (shouldCheckDuplicate) {
        const isDuplicate = await checkDuplicateTableNumber(tableNumber);
        if (isDuplicate) {
          newErrors.tableNumber = "Tên bàn này đã tồn tại";
          isValid = false;
        }
      }
    }

    // Validate capacity
    const capacityStr = String(formData.capacity || "").trim();
    if (!capacityStr) {
      newErrors.capacity = "Vui lòng nhập sức chứa";
      isValid = false;
    } else {
      const capacityNum = parseInt(capacityStr, 10);
      if (isNaN(capacityNum) || capacityNum <= 0) {
        newErrors.capacity = "Sức chứa phải là số dương";
        isValid = false;
      }
    }

    // Validate area
    if (!formData.area.trim()) {
      newErrors.area = "Vui lòng chọn khu vực";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValid = await validateForm();
    if (!isValid) return;

    setIsLoading(true);

    try {
      const payload = {
        tableNumber: formData.tableNumber.trim(),
        capacity: parseInt(formData.capacity, 10),
        location: formData.area.trim(),
        description: formData.description.trim(),
        status: formData.status,
      };

      if (isEditMode) {
        await tableService.updateTable(tableId, payload);
        showSuccess(SUCCESS_MESSAGES.TABLE_UPDATED);
      } else {
        await tableService.createTable(payload);
        showSuccess(SUCCESS_MESSAGES.TABLE_CREATED);
      }

      onSuccess?.();
    } catch (error) {
      console.error("Error submitting form:", error);
      showError(error.message || ERROR_MESSAGES.SAVE_FAILED);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    const currentStatus = formData.status;

    // Nếu đang tạo mới, cho phép thay đổi tự do
    if (!isEditMode) {
      setFormData((prev) => ({ ...prev, status: newStatus }));
      return;
    }

    // Nếu không chuyển sang INACTIVE, cho phép thay đổi tự do
    if (newStatus !== TableStatus.INACTIVE) {
      setFormData((prev) => ({ ...prev, status: newStatus }));
      return;
    }

    // Kiểm tra nếu đang ở trạng thái OCCUPIED
    if (currentStatus === TableStatus.OCCUPIED) {
      showWarning(
        WARNING_MESSAGES.CANNOT_DEACTIVATE_OCCUPIED,
        "Không thể vô hiệu hóa"
      );
      return;
    }

    // Xác nhận trước khi chuyển sang INACTIVE
    setPendingStatus(newStatus);
    setConfirmDialog({
      isOpen: true,
      title: DEACTIVATE_CONFIRMATION.title,
      message: DEACTIVATE_CONFIRMATION.message,
      onConfirm: () => {
        setFormData((prev) => ({ ...prev, status: newStatus }));
        setConfirmDialog({ ...confirmDialog, isOpen: false });
        setPendingStatus(null);
      },
    });
  };

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-sm p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800">
          {isEditMode ? "Chỉnh Sửa Bàn" : "Thêm Bàn Mới"}
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col gap-6">
          {/* Table Number */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4" />
              Tên Bàn
            </label>
            <input
              type="text"
              name="tableNumber"
              value={formData.tableNumber}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.tableNumber
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
              placeholder="Ví dụ: Table 01, Bàn VIP 5"
            />
            {errors.tableNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.tableNumber}</p>
            )}
          </div>

          {/* Capacity */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Users className="w-4 h-4" />
              Sức Chứa
            </label>
            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              min="1"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.capacity
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
              placeholder="Số người"
            />
            {errors.capacity && (
              <p className="mt-1 text-sm text-red-600">{errors.capacity}</p>
            )}
          </div>

          {/* Area */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4" />
              Khu Vực
            </label>
            <select
              name="area"
              value={formData.area}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.area
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
            >
              <option value="">-- Chọn khu vực --</option>
              {areas.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
            {errors.area && (
              <p className="mt-1 text-sm text-red-600">{errors.area}</p>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Trạng Thái
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleStatusChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={TableStatus.AVAILABLE}>Trống</option>
              <option value={TableStatus.OCCUPIED}>Có khách</option>
              <option value={TableStatus.INACTIVE}>Không hoạt động</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Mô Tả (Tùy chọn)
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Thêm ghi chú về bàn..."
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            {isLoading ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </form>
      </div>

      {/* Alert Modal */}
      <AlertModal
        isOpen={alert.isOpen}
        onClose={closeAlert}
        title={alert.title}
        message={alert.message}
        type={alert.type}
      />

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmDialog.isOpen}
        onClose={() => {
          setConfirmDialog({ ...confirmDialog, isOpen: false });
          setPendingStatus(null);
        }}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type="danger"
      />
    </div>
  );
};

export default TableFormInline;
