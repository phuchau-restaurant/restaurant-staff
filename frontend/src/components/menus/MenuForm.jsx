import { useState, useEffect } from "react";
import { X, Upload, Trash2, Star, Plus } from "lucide-react";
import { validateMenuItemData } from "../../utils/menuUtils";

/**
 * MenuForm Component
 * Form để add/edit món ăn với hỗ trợ multi-image upload
 */
const MenuForm = ({ menuItem, categories = [], modifierGroups = [], onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    isAvailable: true,
    images: [],
    selectedModifierGroups: [],
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newImages, setNewImages] = useState([]); // Files to upload
  const [imagesToDelete, setImagesToDelete] = useState([]); // IDs of images to delete

  // Initialize form with menuItem data if editing
  useEffect(() => {
    if (menuItem) {
      setFormData({
        name: menuItem.name || "",
        description: menuItem.description || "",
        price: menuItem.price || "",
        categoryId: menuItem.categoryId || "",
        isAvailable: menuItem.isAvailable !== undefined ? menuItem.isAvailable : true,
        images: menuItem.images || [],
        selectedModifierGroups: menuItem.modifierGroups?.map(g => g.id) || [],
      });
    }
  }, [menuItem]);

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

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Preview images
    const newImagePreviews = files.map((file) => ({
      id: `new-${Date.now()}-${Math.random()}`,
      file,
      url: URL.createObjectURL(file),
      isPrimary: formData.images.length === 0 && newImages.length === 0,
      isNew: true,
    }));

    setNewImages((prev) => [...prev, ...newImagePreviews]);
  };

  const handleRemoveImage = (imageId, isNew = false) => {
    if (isNew) {
      setNewImages((prev) => {
        const filtered = prev.filter((img) => img.id !== imageId);
        // Revoke object URL to prevent memory leak
        const removed = prev.find((img) => img.id === imageId);
        if (removed?.url) {
          URL.revokeObjectURL(removed.url);
        }
        return filtered;
      });
    } else {
      setImagesToDelete((prev) => [...prev, imageId]);
      setFormData((prev) => ({
        ...prev,
        images: prev.images.filter((img) => img.id !== imageId),
      }));
    }
  };

  const handleSetPrimary = (imageId, isNew = false) => {
    if (isNew) {
      setNewImages((prev) =>
        prev.map((img) => ({
          ...img,
          isPrimary: img.id === imageId,
        }))
      );
      setFormData((prev) => ({
        ...prev,
        images: prev.images.map((img) => ({
          ...img,
          isPrimary: false,
        })),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        images: prev.images.map((img) => ({
          ...img,
          isPrimary: img.id === imageId,
        })),
      }));
      setNewImages((prev) =>
        prev.map((img) => ({
          ...img,
          isPrimary: false,
        }))
      );
    }
  };

  const handleModifierGroupToggle = (groupId) => {
    setFormData((prev) => {
      const selected = prev.selectedModifierGroups;
      if (selected.includes(groupId)) {
        return {
          ...prev,
          selectedModifierGroups: selected.filter((id) => id !== groupId),
        };
      }
      return {
        ...prev,
        selectedModifierGroups: [...selected, groupId],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    const { isValid, errors: validationErrors } = validateMenuItemData(formData);
    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        ...formData,
        newImages: newImages.map((img) => img.file),
        imagesToDelete,
        primaryImageId: formData.images.find((img) => img.isPrimary)?.id ||
          newImages.find((img) => img.isPrimary)?.id,
      });
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const allImages = [...formData.images, ...newImages].filter(
    (img) => !imagesToDelete.includes(img.id)
  );

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-800">
            {menuItem ? "Chỉnh sửa món ăn" : "Thêm món ăn mới"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700 border-b pb-2">Thông tin cơ bản</h3>
            
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tên món ăn <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Nhập tên món ăn"
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

            {/* Category & Price */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Danh mục <span className="text-red-500">*</span>
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.categoryId
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className="text-red-600 text-sm mt-1">{errors.categoryId}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Giá (VNĐ) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.price
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                />
                {errors.price && (
                  <p className="text-red-600 text-sm mt-1">{errors.price}</p>
                )}
              </div>
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
                placeholder="Nhập mô tả món ăn"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Is Available */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isAvailable"
                name="isAvailable"
                checked={formData.isAvailable}
                onChange={handleInputChange}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isAvailable" className="text-sm font-medium text-gray-700">
                Đang bán
              </label>
            </div>
          </div>

          {/* Images Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700 border-b pb-2">Hình ảnh</h3>
            
            {/* Image Grid */}
            <div className="grid grid-cols-3 gap-4">
              {allImages.map((img) => (
                <div
                  key={img.id}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 ${
                    img.isPrimary ? "border-yellow-400" : "border-gray-200"
                  }`}
                >
                  <img
                    src={img.url}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Primary badge */}
                  {img.isPrimary && (
                    <div className="absolute top-1 left-1">
                      <span className="px-2 py-0.5 bg-yellow-400 text-yellow-900 text-xs font-semibold rounded">
                        Ảnh chính
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="absolute bottom-1 right-1 flex gap-1">
                    {!img.isPrimary && (
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(img.id, img.isNew)}
                        className="p-1.5 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                        title="Đặt làm ảnh chính"
                      >
                        <Star className="w-3 h-3" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(img.id, img.isNew)}
                      className="p-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                      title="Xóa ảnh"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Upload button */}
              <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 cursor-pointer flex flex-col items-center justify-center transition-colors">
                <Plus className="w-8 h-8 text-gray-400" />
                <span className="text-sm text-gray-500 mt-2">Thêm ảnh</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-xs text-gray-500">
              Hỗ trợ upload nhiều ảnh. Click vào ngôi sao để đặt ảnh chính.
            </p>
          </div>

          {/* Modifier Groups Section */}
          {modifierGroups.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700 border-b pb-2">Modifier Groups</h3>
              
              <div className="grid grid-cols-2 gap-3">
                {modifierGroups.map((group) => (
                  <label
                    key={group.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      formData.selectedModifierGroups.includes(group.id)
                        ? "bg-blue-50 border-blue-300"
                        : "bg-white border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.selectedModifierGroups.includes(group.id)}
                      onChange={() => handleModifierGroupToggle(group.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <span className="font-medium text-gray-800">{group.name}</span>
                      <p className="text-xs text-gray-500">
                        {group.modifiers?.length || 0} options
                      </p>
                    </div>
                    {!group.isActive && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded">
                        Inactive
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          )}

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
              {isSubmitting ? "Đang lưu..." : menuItem ? "Cập nhật" : "Tạo mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MenuForm;
