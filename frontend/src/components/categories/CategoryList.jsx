import { Edit2, Trash2, ToggleLeft, ToggleRight, RotateCcw, Trash } from "lucide-react";

/**
 * CategoryList - Hiển thị danh sách categories dạng table
 */
const CategoryList = ({ categories, onEdit, onDelete, onToggleStatus, onRestore, onDeletePermanent }) => {
  if (!categories || categories.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        Chưa có danh mục nào
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tên danh mục
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Mô tả
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Thứ tự
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Trạng thái
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Hành động
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {categories.map((category) => {
            const isInactive = category.is_active === false;
            return (
              <tr
                key={category.id}
                className={`hover:bg-gray-50 ${
                  isInactive ? "opacity-50 bg-gray-50" : ""
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {category.icon && (
                      <span className="text-2xl mr-3">{category.icon}</span>
                    )}
                    <div className="text-sm font-medium text-gray-900">
                      {category.name}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500">
                    {category.description || "—"}
                  </div>
                </td>
                <td className="px-6 py-4 text-center whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {category.display_order}
                  </div>
                </td>
                <td className="px-6 py-4 text-center whitespace-nowrap">
                  <button
                    onClick={() => onToggleStatus(category)}
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      category.is_active
                        ? "bg-green-100 text-green-800 hover:bg-green-200"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                    }`}
                  >
                    {category.is_active ? (
                      <>
                        <ToggleRight size={16} />
                        Hoạt động
                      </>
                    ) : (
                      <>
                        <ToggleLeft size={16} />
                        Không hoạt động
                      </>
                    )}
                  </button>
                </td>
                <td className="px-6 py-4 text-center whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center justify-center gap-2">
                    {isInactive ? (
                      <>
                        <button
                          onClick={() => onRestore && onRestore(category)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 hover:text-green-900 rounded-lg font-medium transition-all"
                          title="Khôi phục"
                        >
                          <RotateCcw size={16} />
                          <span className="text-xs">Khôi phục</span>
                        </button>
                        <button
                          onClick={() => onDeletePermanent && onDeletePermanent(category)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 hover:text-red-900 rounded-lg font-medium transition-all"
                          title="Xóa vĩnh viễn"
                        >
                          <Trash size={16} />
                          <span className="text-xs">Xóa vĩnh viễn</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => onEdit(category)}
                          className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                          title="Chỉnh sửa"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => onDelete(category)}
                          className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                          title="Xóa"
                        >
                          <Trash2 size={18} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default CategoryList;
