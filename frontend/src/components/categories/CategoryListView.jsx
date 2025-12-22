import { memo } from "react";
import { Edit2, Trash2 } from "lucide-react";
import { formatDate } from "../../utils/categoryUtils";

/**
 * CategoryListView Component
 * Hiển thị danh mục dạng bảng cho list view
 * 
 * @param {Array} categories - Danh sách danh mục
 * @param {function} onEdit - Callback khi bấm edit
 * @param {function} onDelete - Callback khi bấm delete
 */
const CategoryListView = memo(({ categories, onEdit, onDelete }) => {
  if (!categories || categories.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <p className="text-gray-500">Không có danh mục nào</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
              Tên danh mục
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
              Mô tả
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
              Trạng thái
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
              Ngày tạo
            </th>
            <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
              Hành động
            </th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category, index) => (
            <tr
              key={category.id || index}
              className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  {category.urlIcon ? (
                    <div className="w-10 h-10 rounded bg-blue-100 flex items-center justify-center">
                      <img
                        src={category.urlIcon}
                        alt={category.name}
                        className="w-6 h-6 object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center">
                      <span className="text-xs text-gray-500">N/A</span>
                    </div>
                  )}
                  <span className="font-semibold text-gray-800">
                    {category.name}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600 truncate max-w-xs">
                {category.description || "-"}
              </td>
              <td className="px-6 py-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    category.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {category.isActive ? "Hoạt động" : "Không hoạt động"}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {formatDate(category.createdAt)}
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => onEdit(category)}
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                    title="Chỉnh sửa"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(category)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                    title="Xóa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

CategoryListView.displayName = "CategoryListView";

export default CategoryListView;
