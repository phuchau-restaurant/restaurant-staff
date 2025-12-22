import { useState, useEffect } from "react";
import { X, Upload } from "lucide-react";
import { validateCategoryData } from "../../utils/categoryUtils";

/**
 * CategoryForm Component
 * Form để add/edit danh mục
 * 
 * @param {Object} category - Dữ liệu danh mục (null nếu tạo mới)
 * @param {function} onSubmit - Callback khi submit form
 * @param {function} onClose - Callback khi đóng form
 */
const CategoryForm = ({ category, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    displayOrder: 0,
    image: "",
    isActive: true,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with category data if editing
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || "",
        description: category.description || "",
        displayOrder: category.displayOrder || 0,
        image: category.image || "",
        isActive: category.isActive !== undefined ? category.isActive : true,
      });
    }
  }, [category]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          image: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    const { isValid, errors: validationErrors } = validateCategoryData(formData);
    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(formData);
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">
            {category ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tên danh mục <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Nhập tên danh mục"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.name
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
            />
            {errors.name && (
              <p className="text-red-600 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Mô tả
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Nhập mô tả danh mục"
              rows={3}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.description
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
            />
            {errors.description && (
              <p className="text-red-600 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          {/* Display Order */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Thứ tự hiển thị
            </label>
            <input
              type="number"
              name="displayOrder"
              value={formData.displayOrder}
              onChange={handleInputChange}
              min="0"
              placeholder="0"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.displayOrder
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
            />
            {errors.displayOrder && (
              <p className="text-red-600 text-sm mt-1">{errors.displayOrder}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Số thứ tự để sắp xếp danh mục (0 = đầu tiên)
            </p>
          </div>

          {/* Image */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Hình ảnh
            </label>
            <div className="space-y-2">
              {formData.image && (
                <div className="relative w-full h-32 rounded-lg overflow-hidden border border-gray-300">
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <label className="flex items-center justify-center w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                <div className="flex items-center gap-2 text-gray-600">
                  <Upload className="w-4 h-4" />
                  <span className="text-sm">Chọn hình ảnh</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Active status */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="isActive"
              id="isActive"
              checked={formData.isActive}
              onChange={handleInputChange}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label
              htmlFor="isActive"
              className="text-sm font-semibold text-gray-700"
            >
              Danh mục đang hoạt động
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryForm;
