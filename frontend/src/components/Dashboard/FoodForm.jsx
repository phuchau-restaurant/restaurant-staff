import React, { useState, useRef } from "react";
import { X, Upload } from "lucide-react";

const FoodForm = ({ mode, food, categories, onSubmit, onClose }) => {
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: food?.name || "",
    category: food?.category || "",
    newCategory: "",
    price: food?.price || "",
    description: food?.description || "",
    image: null,
  });

  const [useNewCategory, setUseNewCategory] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const categoryToUse = useNewCategory ? formData.newCategory : formData.category;
    onSubmit({ ...formData, category: categoryToUse });
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-gray-100 px-8 py-6 min-h-screen">
      {/* Container with white background and shadow */}
      <div className="bg-white rounded-3xl shadow-lg p-8 max-w-5xl mx-auto">
        {/* Header with Close Button */}
        <div className="mb-6 flex items-start justify-between">
          <h2 className="text-2xl font-bold text-gray-800">
            {mode === 'add' ? 'Add New Category' : 'Edit Food Item'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={28} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-8 font-assistant">
            {/* Left Column - Form Fields */}
            <div className="space-y-6">
              {/* Item Name */}
              <div>
                <label className="block text-xl font-semibold text-gray-700 mb-2">
                  Item name :
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Mushroom Risotto"
                  className="w-full px-4 py-2 border-b-2 border-gray-300 focus:border-gray-500 focus:outline-none"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xl font-semibold text-gray-700 mb-2">
                  Category :
                </label>
                {!useNewCategory ? (
                  <div className="space-y-2">
                    <select
                      value={formData.category}
                      onChange={(e) => {
                        if (e.target.value === "new") {
                          setUseNewCategory(true);
                        } else {
                          setFormData({ ...formData, category: e.target.value });
                        }
                      }}
                      className="w-full px-4 py-2 border-b-2 border-gray-300 focus:border-gray-500 focus:outline-none"
                      required
                    >
                      <option value="">Select category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                      <option value="new">+ Add New Category</option>
                    </select>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={formData.newCategory}
                      onChange={(e) => setFormData({ ...formData, newCategory: e.target.value })}
                      placeholder="Enter new category name"
                      className="w-full px-4 py-2 border-b-2 border-gray-300 focus:border-gray-500 focus:outline-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setUseNewCategory(false);
                        setFormData({ ...formData, newCategory: "" });
                      }}
                      className="text-sm text-orange-500 hover:text-orange-600"
                    >
                      ← Back to existing categories
                    </button>
                  </div>
                )}
              </div>

              {/* Price */}
              <div>
                <label className="block text-xl font-semibold text-gray-700 mb-2">
                  Price :
                </label>
                <input
                  type="text"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="$15"
                  className="w-full px-4 py-2 border-b-2 border-gray-300 focus:border-gray-500 focus:outline-none"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xl font-semibold text-gray-700 mb-2">
                  Description :
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Creamy Mushroom Risotto, Cooked To Perfection With Arborio Rice, Wild Mushrooms, Parmesan Cheese, And White Wine."
                  rows={4}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:border-gray-500 focus:outline-none resize-none"
                />
              </div>
            </div>

            {/* Right Column - Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Image
              </label>
              <div 
                onClick={handleImageClick}
                className="bg-gray-200 rounded-2xl flex items-center justify-center h-96 cursor-pointer hover:bg-gray-300 transition-colors overflow-hidden"
              >
                {formData.image ? (
                  <img
                    src={URL.createObjectURL(formData.image)}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Upload className="text-gray-400" size={64} />
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                className="hidden"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8">
            <button
              type="submit"
              className="px-8 py-3 bg-teal-500 text-white font-bold rounded-lg hover:bg-teal-600 transition-colors"
            >
              {mode === 'add' ? 'Upload' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FoodForm;
