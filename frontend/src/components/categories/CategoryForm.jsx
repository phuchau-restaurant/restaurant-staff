import { useState, useEffect, useRef } from "react";
import { X, Upload } from "lucide-react";
import { validateCategoryData } from "../../utils/categoryUtils";
import { fetchCategoryIcons } from "../../services/appSettingsService";

/**
 * CategoryForm Component
 * Form để add/edit danh mục
 *
 * @param {Object} category - Dữ liệu danh mục (null nếu tạo mới)
 * @param {function} onSubmit - Callback khi submit form
 * @param {function} onClose - Callback khi đóng form
 */
const CategoryForm = ({ category, onSubmit, onClose }) => {
  // State cho danh sách icons fetch từ API
  const [categoryIcons, setCategoryIcons] = useState([]);
  const [isLoadingIcons, setIsLoadingIcons] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    description:  "",
    displayOrder: 0,
    image: "",
    isActive: true,
    icon: "",
    modifiers:  [],
  });
  // State cho toggle icon picker
  const [showIconPicker, setShowIconPicker] = useState(false);

  // Modifier input state
  const [modifierInput, setModifierInput] = useState("");
  // Gợi ý các modifier phổ biến
  const SUGGESTED_MODIFIERS = [
    "Size",
    "Topping",
    "Đá",
    "Đường",
    "Nhiệt độ",
    "Loại sữa",
    "Phụ kiện",
    "Hương vị",
    "Kích cỡ",
    "Loại bánh",
  ];
  const [showModifierOptions, setShowModifierOptions] = useState(false);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch icons từ API khi component mount
  useEffect(() => {
    const loadIcons = async () => {
      try {
        setIsLoadingIcons(true);
        const icons = await fetchCategoryIcons();
        setCategoryIcons(icons);
        
        // Set default icon nếu chưa có icon được chọn
        if (!formData.icon && icons.length > 0) {
          setFormData((prev) => ({
            ...prev,
            icon: icons[0]?.icon || "",
          }));
        }
      } catch (error) {
        console.error("Error loading icons:", error);
      } finally {
        setIsLoadingIcons(false);
      }
    };

    loadIcons();
  }, []); // chỉ chạy 1 lần khi mount

  // Initialize form with category data if editing
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || "",
        description: category.description || "",
        displayOrder: category.displayOrder || 0,
        image:  category.image || "",
        isActive: category.isActive !== undefined ? category.isActive : true,
        icon: category.icon || (categoryIcons[0]?.icon || ""),
        modifiers: category.modifiers || [],
      });
    }
  }, [category, categoryIcons]);

  // Icon selection handler
  const handleIconSelect = (icon) => {
    setFormData((prev) => ({ ...prev, icon }));
  };

  // Modifier handlers
  const handleAddModifier = (value) => {
    const val = (value ??  modifierInput).trim();
    if (val && !formData.modifiers.includes(val)) {
      setFormData((prev) => ({
        ...prev,
        modifiers: [...prev.modifiers, val],
      }));
      setModifierInput("");
      setShowModifierOptions(false);
    }
  };

  const handleRemoveModifier = (mod) => {
    setFormData((prev) => ({
      ...prev,
      modifiers: prev.modifiers.filter((m) => m !== mod),
    }));
  };

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
    const { isValid, errors: validationErrors } =
      validateCategoryData(formData);
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

  // Drag & resize state
  const modalRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y:  0 });
  const [modalPos, setModalPos] = useState({ 
    x: window.innerWidth / 2 - 400, 
    y: window. innerHeight / 2 - 300 
  });
  const [modalSize, setModalSize] = useState({ width: 800, height: 600 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ 
    x: 0, 
    y: 0, 
    width: 800, 
    height: 600 
  });

  // Drag handlers
  const onDragStart = (e) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - modalPos.x,
      y: e.clientY - modalPos. y,
    });
  };
  const onDrag = (e) => {
    if (!isDragging) return;
    setModalPos({
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y,
    });
  };
  const onDragEnd = () => setIsDragging(false);

  // Resize handlers
  const onResizeStart = (e) => {
    setIsResizing(true);
    setResizeStart({
      x:  e.clientX,
      y: e.clientY,
      width: modalSize.width,
      height: modalSize.height,
    });
    e.stopPropagation();
  };
  const onResize = (e) => {
    if (!isResizing) return;
    setModalSize({
      width:  Math.max(400, resizeStart.width + (e.clientX - resizeStart.x)),
      height: Math.max(300, resizeStart.height + (e.clientY - resizeStart.y)),
    });
  };
  const onResizeEnd = () => setIsResizing(false);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", onDrag);
      window.addEventListener("mouseup", onDragEnd);
    } else {
      window.removeEventListener("mousemove", onDrag);
      window.removeEventListener("mouseup", onDragEnd);
    }
    return () => {
      window.removeEventListener("mousemove", onDrag);
      window.removeEventListener("mouseup", onDragEnd);
    };
  }, [isDragging, dragOffset, modalPos]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", onResize);
      window.addEventListener("mouseup", onResizeEnd);
    } else {
      window.removeEventListener("mousemove", onResize);
      window.removeEventListener("mouseup", onResizeEnd);
    }
    return () => {
      window.removeEventListener("mousemove", onResize);
      window.removeEventListener("mouseup", onResizeEnd);
    };
  }, [isResizing, resizeStart, modalSize]);

  return (
    <div className="fixed inset-0 bg-black/10 backdrop-blur-sm z-50 p-4 select-none">
      <div
        ref={modalRef}
        style={{
          position: "absolute",
          left: modalPos. x,
          top: modalPos.y,
          width: modalSize.width,
          height: modalSize.height,
          minWidth: 400,
          minHeight: 300,
          maxWidth: '100vw',
          maxHeight: '100vh',
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          background: "white",
          borderRadius: 12,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
        className="shadow-2xl border border-gray-200"
      >
        {/* Drag bar */}
        <div
          className="cursor-move bg-gray-100 px-6 py-3 flex items-center justify-between border-b border-gray-200"
          onMouseDown={onDragStart}
          style={{ userSelect: "none" }}
        >
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

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto">
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
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus: ring-2 ${
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
                    : "border-gray-300 focus: ring-blue-500"
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

            {/* Icon & Modifier */}
            <div className="pt-2 border-t border-gray-100 mt-2">
              {/* Icon Picker */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Icon đại diện
                </label>
                {isLoadingIcons ? (
                  <div className="text-sm text-gray-500">Đang tải icons...</div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{formData.icon}</span>
                      <button
                        type="button"
                        className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                        onClick={() => setShowIconPicker((v) => !v)}
                      >
                        {showIconPicker ? "Ẩn icon" : "Chọn icon"}
                      </button>
                    </div>
                    {showIconPicker && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {categoryIcons.map((item) => (
                          <button
                            type="button"
                            key={item.icon}
                            className={`text-2xl p-2 rounded border transition-colors ${
                              formData.icon === item.icon
                                ?  "border-blue-500 bg-blue-50"
                                :  "border-gray-200 bg-white hover:border-blue-300"
                            }`}
                            onClick={() => handleIconSelect(item.icon)}
                            aria-label={item.name}
                          >
                            {item.icon}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Icon sẽ hiển thị cùng tên danh mục. 
                </p>
              </div>

              {/* Modifiers */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Modifiers (tuỳ chọn)
                </label>
                <div className="flex gap-2 mb-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={modifierInput}
                      onFocus={() => setShowModifierOptions(true)}
                      onBlur={() =>
                        setTimeout(() => setShowModifierOptions(false), 150)
                      }
                      onChange={(e) => setModifierInput(e.target.value)}
                      placeholder="Nhập tên modifier..."
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus: ring-2 border-gray-300 focus:ring-blue-500"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddModifier();
                        }
                      }}
                    />
                    {showModifierOptions && (
                      <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-2 flex flex-wrap gap-2">
                        {SUGGESTED_MODIFIERS.filter(
                          (mod) =>
                            !formData.modifiers.includes(mod) &&
                            (! modifierInput ||
                              mod
                                .toLowerCase()
                                .includes(modifierInput.toLowerCase()))
                        ).map((mod) => (
                          <button
                            type="button"
                            key={mod}
                            className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-full border border-blue-200 text-xs font-medium transition-colors"
                            onMouseDown={() => handleAddModifier(mod)}
                          >
                            {mod}
                          </button>
                        ))}
                        {SUGGESTED_MODIFIERS.filter(
                          (mod) =>
                            !formData.modifiers.includes(mod) &&
                            (! modifierInput ||
                              mod
                                .toLowerCase()
                                .includes(modifierInput. toLowerCase()))
                        ).length === 0 && (
                          <span className="text-xs text-gray-400">
                            Không có gợi ý
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddModifier()}
                    className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Thêm
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.modifiers.map((mod) => (
                    <span
                      key={mod}
                      className="inline-flex items-center bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm gap-1 border border-gray-200"
                    >
                      {mod}
                      <button
                        type="button"
                        className="ml-1 text-gray-400 hover:text-red-500"
                        onClick={() => handleRemoveModifier(mod)}
                        aria-label="Xoá modifier"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Modifier là các tuỳ chọn thêm cho danh mục (ví dụ: size,
                  topping...)
                </p>
              </div>
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

        {/* Resize handle */}
        <div
          onMouseDown={onResizeStart}
          className="absolute right-0 bottom-0 w-6 h-6 cursor-nwse-resize z-20 flex items-end justify-end"
          style={{ userSelect: "none" }}
        >
          <div className="w-4 h-4 bg-gray-200 rounded-br-lg border-r-2 border-b-2 border-gray-400" />
        </div>
      </div>
    </div>
  );
};

export default CategoryForm;