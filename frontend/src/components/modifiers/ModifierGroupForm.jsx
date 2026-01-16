import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Plus, Trash2, GripVertical } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  validateModifierGroupData,
  validateModifierData,
} from "../../utils/modifierUtils";

/**
 * ModifierGroupForm Component
 * Form để add/edit modifier group với các modifiers con
 */
const ModifierGroupForm = ({ group, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isRequired: false,
    minSelect: 0,
    maxSelect: 1,
    isActive: true,
    modifiers: [],
  });

  const [errors, setErrors] = useState({});
  const [modifierErrors, setModifierErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with group data if editing
  useEffect(() => {
    if (group) {
      setFormData({
        name: group.name || "",
        description: group.description || "",
        isRequired: group.isRequired || false,
        minSelect: group.minSelect || 0,
        maxSelect: group.maxSelect || 1,
        isActive: group.isActive !== undefined ? group.isActive : true,
        modifiers:
          group.modifiers?.map((m) => ({
            ...m,
            tempId: m.id || `temp-${Date.now()}-${Math.random()}`,
          })) || [],
      });
    }
  }, [group]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleAddModifier = () => {
    const newModifier = {
      tempId: `temp-${Date.now()}-${Math.random()}`,
      name: "",
      price: 0,
      isDefault: formData.modifiers.length === 0,
      isActive: true,
      isNew: true,
    };
    setFormData((prev) => ({
      ...prev,
      modifiers: [...prev.modifiers, newModifier],
    }));
  };

  const handleModifierChange = (tempId, field, value) => {
    setFormData((prev) => ({
      ...prev,
      modifiers: prev.modifiers.map((mod) =>
        mod.tempId === tempId
          ? {
              ...mod,
              [field]:
                field === "isDefault" || field === "isActive" ? value : value,
            }
          : field === "isDefault" && value
          ? { ...mod, isDefault: false }
          : mod
      ),
    }));
    if (modifierErrors[tempId]?.[field]) {
      setModifierErrors((prev) => ({
        ...prev,
        [tempId]: { ...prev[tempId], [field]: "" },
      }));
    }
  };

  const handleRemoveModifier = (tempId) => {
    setFormData((prev) => ({
      ...prev,
      modifiers: prev.modifiers.filter((mod) => mod.tempId !== tempId),
    }));
  };

  const handleSetDefault = (tempId) => {
    setFormData((prev) => ({
      ...prev,
      modifiers: prev.modifiers.map((mod) => ({
        ...mod,
        isDefault: mod.tempId === tempId,
      })),
    }));
  };

  const validateForm = () => {
    // Validate group
    const { isValid: groupValid, errors: groupErrors } =
      validateModifierGroupData(formData);
    setErrors(groupErrors);

    // Validate modifiers
    let modifiersValid = true;
    const newModifierErrors = {};

    formData.modifiers.forEach((mod) => {
      const { isValid, errors: modErrors } = validateModifierData(mod);
      if (!isValid) {
        modifiersValid = false;
        newModifierErrors[mod.tempId] = modErrors;
      }
    });
    setModifierErrors(newModifierErrors);

    return groupValid && modifiersValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        ...formData,
        modifiers: formData.modifiers.map(({ tempId, isNew, ...rest }) => rest),
      });
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Drag & resize state
  const modalRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [modalPos, setModalPos] = useState({
    x: window.innerWidth / 2 - 400,
    y: window.innerHeight / 2 - 300,
  });
  const [modalSize, setModalSize] = useState({ width: 800, height: 600 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({
    x: 0,
    y: 0,
    width: 800,
    height: 600,
  });

  // Drag handlers
  const onDragStart = (e) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - modalPos.x,
      y: e.clientY - modalPos.y,
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
      x: e.clientX,
      y: e.clientY,
      width: modalSize.width,
      height: modalSize.height,
    });
    e.stopPropagation();
  };
  const onResize = (e) => {
    if (!isResizing) return;
    setModalSize({
      width: Math.max(400, resizeStart.width + (e.clientX - resizeStart.x)),
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

  const modalContent = (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="relative bg-white rounded-3xl shadow-2xl overflow-hidden"
          initial={{ scale: 0.9, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 30 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
          ref={modalRef}
          style={{
            position: "absolute",
            left: modalPos.x,
            top: modalPos.y,
            width: modalSize.width,
            height: modalSize.height,
            minWidth: 400,
            minHeight: 300,
            maxWidth: "100vw",
            maxHeight: "100vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header (drag handle) */}
          <div
            className="cursor-move bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 flex items-center justify-between"
            onMouseDown={onDragStart}
            style={{ userSelect: "none" }}
          >
            <h2 className="text-xl font-semibold">
              {group ? "Chỉnh sửa nhóm Modifier" : "Thêm nhóm Modifier mới"}
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form - Scrollable content */}
          <div className="flex-1 overflow-y-auto p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Group Info Section */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700 border-b pb-2">
                  Thông tin nhóm
                </h3>

                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tên nhóm <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Ví dụ: Size, Topping, Độ ngọt..."
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
                    placeholder="Mô tả cho nhóm modifier"
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Settings */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="isRequired"
                      name="isRequired"
                      checked={formData.isRequired}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label
                      htmlFor="isRequired"
                      className="text-sm font-medium text-gray-700"
                    >
                      Bắt buộc chọn
                    </label>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="isActive"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label
                      htmlFor="isActive"
                      className="text-sm font-medium text-gray-700"
                    >
                      Đang hoạt động
                    </label>
                  </div>
                </div>

                {/* Min/Max Select */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Số lượng chọn tối thiểu
                    </label>
                    <input
                      type="number"
                      name="minSelect"
                      value={formData.minSelect}
                      onChange={handleInputChange}
                      min="0"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        errors.minSelect
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-blue-500"
                      }`}
                    />
                    {errors.minSelect && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.minSelect}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Số lượng chọn tối đa
                    </label>
                    <input
                      type="number"
                      name="maxSelect"
                      value={formData.maxSelect}
                      onChange={handleInputChange}
                      min="1"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        errors.maxSelect
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-blue-500"
                      }`}
                    />
                    {errors.maxSelect && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.maxSelect}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Modifiers Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="font-semibold text-gray-700">
                    Danh sách Options
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddModifier}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Thêm option
                  </button>
                </div>

                {formData.modifiers.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                    <p className="text-gray-500">Chưa có option nào</p>
                    <button
                      type="button"
                      onClick={handleAddModifier}
                      className="mt-2 text-blue-600 hover:text-blue-800 font-medium"
                    >
                      + Thêm option đầu tiên
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {formData.modifiers.map((mod, index) => (
                      <div
                        key={mod.tempId}
                        className={`p-4 rounded-lg border ${
                          mod.isDefault
                            ? "border-blue-300 bg-blue-50"
                            : "border-gray-200 bg-white"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="text-gray-400 cursor-move pt-2">
                            <GripVertical className="w-4 h-4" />
                          </div>

                          <div className="flex-1 grid grid-cols-12 gap-3">
                            {/* Name */}
                            <div className="col-span-5">
                              <input
                                type="text"
                                value={mod.name}
                                onChange={(e) =>
                                  handleModifierChange(
                                    mod.tempId,
                                    "name",
                                    e.target.value
                                  )
                                }
                                placeholder="Tên option"
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm ${
                                  modifierErrors[mod.tempId]?.name
                                    ? "border-red-500 focus:ring-red-500"
                                    : "border-gray-300 focus:ring-blue-500"
                                }`}
                              />
                              {modifierErrors[mod.tempId]?.name && (
                                <p className="text-red-600 text-xs mt-1">
                                  {modifierErrors[mod.tempId].name}
                                </p>
                              )}
                            </div>

                            {/* Price */}
                            <div className="col-span-3">
                              <input
                                type="number"
                                value={mod.price}
                                onChange={(e) =>
                                  handleModifierChange(
                                    mod.tempId,
                                    "price",
                                    e.target.value
                                  )
                                }
                                placeholder="Giá thêm"
                                min="0"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              />
                            </div>

                            {/* Default */}
                            <div className="col-span-2 flex items-center justify-center">
                              <button
                                type="button"
                                onClick={() => handleSetDefault(mod.tempId)}
                                className={`px-2 py-1 text-xs rounded font-medium ${
                                  mod.isDefault
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                              >
                                Mặc định
                              </button>
                            </div>

                            {/* Active toggle */}
                            <div className="col-span-2 flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={mod.isActive}
                                onChange={(e) =>
                                  handleModifierChange(
                                    mod.tempId,
                                    "isActive",
                                    e.target.checked
                                  )
                                }
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <span className="text-xs text-gray-600">
                                Active
                              </span>
                            </div>
                          </div>

                          {/* Delete button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveModifier(mod.tempId)}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                            title="Xóa option"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit buttons */}
              <div className="flex gap-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting
                    ? "Đang lưu..."
                    : group
                    ? "Cập nhật"
                    : "Tạo mới"}
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
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

export default ModifierGroupForm;
