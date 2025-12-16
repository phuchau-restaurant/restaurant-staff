import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, MapPin, Users, FileText, Home } from "lucide-react";
import { getTableById, createTable, updateTable, getAllTables } from "../data/mockTables";

const TableFormScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // id sẽ có giá trị nếu đang edit
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    tableNumber: "",
    capacity: "",
    area: "",
    description: "",
    isActive: true,
  });

  const [errors, setErrors] = useState({
    tableNumber: "",
    capacity: "",
    area: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  // Fetch table data if editing
  useEffect(() => {
    if (isEditMode) {
      fetchTableData();
    }
  }, [id]);

  const fetchTableData = async () => {
    try {
      setIsFetching(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const data = getTableById(id);
      
      if (!data) {
        alert("Không tìm thấy bàn");
        navigate("/tables");
        return;
      }
      
      setFormData({
        tableNumber: data.tableNumber,
        capacity: data.capacity,
        area: data.area || "",
        description: data.description || "",
        isActive: data.isActive,
      });
    } catch (error) {
      console.error("Error fetching table:", error);
      alert("Không thể tải thông tin bàn");
      navigate("/tables");
    } finally {
      setIsFetching(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear error when user types
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // Validate table number
    if (!formData.tableNumber || formData.tableNumber.trim() === "") {
      newErrors.tableNumber = "Vui lòng nhập số bàn";
      isValid = false;
    } else if (isNaN(formData.tableNumber) || parseInt(formData.tableNumber) <= 0) {
      newErrors.tableNumber = "Số bàn phải là số nguyên dương";
      isValid = false;
    }

    // Validate capacity
    if (!formData.capacity || formData.capacity.trim() === "") {
      newErrors.capacity = "Vui lòng nhập sức chứa";
      isValid = false;
    } else if (isNaN(formData.capacity) || parseInt(formData.capacity) <= 0) {
      newErrors.capacity = "Sức chứa phải là số nguyên dương";
      isValid = false;
    } else if (parseInt(formData.capacity) > 50) {
      newErrors.capacity = "Sức chứa tối đa là 50 người";
      isValid = false;
    }

    // Validate area
    if (!formData.area || formData.area.trim() === "") {
      newErrors.area = "Vui lòng nhập khu vực";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const tableData = {
        tableNumber: parseInt(formData.tableNumber),
        capacity: parseInt(formData.capacity),
        area: formData.area.trim(),
        description: formData.description.trim() || "",
        isActive: formData.isActive,
      };
      
      // Check if table number already exists (only for new tables)
      if (!isEditMode) {
        const existingTables = getAllTables();
        const isDuplicate = existingTables.some(
          t => t.tableNumber === tableData.tableNumber
        );
        
        if (isDuplicate) {
          setErrors((prev) => ({
            ...prev,
            tableNumber: "Số bàn đã tồn tại",
          }));
          setIsLoading(false);
          return;
        }
        
        createTable(tableData);
      } else {
        // Check if table number conflicts with other tables
        const existingTables = getAllTables();
        const isDuplicate = existingTables.some(
          t => t.tableNumber === tableData.tableNumber && t.id !== id
        );
        
        if (isDuplicate) {
          setErrors((prev) => ({
            ...prev,
            tableNumber: "Số bàn đã tồn tại",
          }));
          setIsLoading(false);
          return;
        }
        
        updateTable(id, tableData);
      }

      // Success - navigate back to tables list
      navigate("/tables");
    } catch (error) {
      console.error("Error saving table:", error);
      alert("Có lỗi xảy ra");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/tables");
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </button>
          <h1 className="text-3xl font-bold text-gray-800">
            {isEditMode ? "Chỉnh Sửa Bàn" : "Thêm Bàn Mới"}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEditMode
              ? "Cập nhật thông tin bàn"
              : "Nhập thông tin để tạo bàn mới"}
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Table Number */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Số Bàn <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.tableNumber}
                  onChange={(e) => handleInputChange("tableNumber", e.target.value)}
                  className={`w-full px-4 py-3 pl-12 border-2 rounded-lg focus:outline-none transition-all ${
                    errors.tableNumber
                      ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                      : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  }`}
                  placeholder="Nhập số bàn (VD: 1, 2, 3...)"
                />
                <Home
                  className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
                    errors.tableNumber ? "text-red-400" : "text-gray-400"
                  }`}
                />
              </div>
              {errors.tableNumber && (
                <p className="text-red-600 text-sm mt-1">{errors.tableNumber}</p>
              )}
            </div>

            {/* Capacity */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Sức Chứa <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => handleInputChange("capacity", e.target.value)}
                  className={`w-full px-4 py-3 pl-12 border-2 rounded-lg focus:outline-none transition-all ${
                    errors.capacity
                      ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                      : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  }`}
                  placeholder="Số người tối đa (VD: 4, 6, 8...)"
                  min="1"
                  max="50"
                />
                <Users
                  className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
                    errors.capacity ? "text-red-400" : "text-gray-400"
                  }`}
                />
              </div>
              {errors.capacity && (
                <p className="text-red-600 text-sm mt-1">{errors.capacity}</p>
              )}
              <p className="text-gray-500 text-sm mt-1">
                Nhập số người tối đa có thể ngồi (1-50)
              </p>
            </div>

            {/* Area */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Khu Vực / Vị Trí <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.area}
                  onChange={(e) => handleInputChange("area", e.target.value)}
                  className={`w-full px-4 py-3 pl-12 border-2 rounded-lg focus:outline-none transition-all ${
                    errors.area
                      ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                      : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  }`}
                  placeholder="Nhập khu vực (VD: Tầng 1, Sân thượng, VIP...)"
                />
                <MapPin
                  className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
                    errors.area ? "text-red-400" : "text-gray-400"
                  }`}
                />
              </div>
              {errors.area && (
                <p className="text-red-600 text-sm mt-1">{errors.area}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mô Tả
              </label>
              <div className="relative">
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className="w-full px-4 py-3 pl-12 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
                  placeholder="Mô tả thêm về bàn (tùy chọn)"
                  rows={4}
                  maxLength={500}
                />
                <FileText className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm mt-1">
                {formData.description.length}/500 ký tự
              </p>
            </div>

            {/* Status Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Trạng Thái
                </label>
                <p className="text-sm text-gray-500">
                  {formData.isActive
                    ? "Bàn đang hoạt động và có thể nhận khách"
                    : "Bàn tạm thời không hoạt động"}
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleInputChange("isActive", !formData.isActive)
                }
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  formData.isActive ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                    formData.isActive ? "translate-x-7" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                disabled={isLoading}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                <Save className="w-5 h-5" />
                {isLoading
                  ? "Đang lưu..."
                  : isEditMode
                  ? "Cập Nhật"
                  : "Tạo Bàn"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TableFormScreen;
