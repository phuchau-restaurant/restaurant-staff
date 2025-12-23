import { memo } from "react";
import { Edit2, Trash2 } from "lucide-react";
import { formatDate } from "../../utils/categoryUtils";

/**
 * CategoryCard Component
 * Hiển thị danh mục dạng card cho grid view
 * 
 * @param {Object} category - Dữ liệu danh mục
 * @param {function} onEdit - Callback khi bấm edit
 * @param {function} onDelete - Callback khi bấm delete
 */
const CategoryCard = memo(({ category, onEdit, onDelete }) => {
  const statusText = category.isActive ? "Hoạt động" : "Không hoạt động";
  const statusColor = category.isActive ? "text-green-600" : "text-red-600";

  const isInactive = category.is_active === false;
  return (
    <div
      className={`bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all h-full flex flex-col ${isInactive ? "opacity-50" : ""}`}
    >
      {/* Hình ảnh */}
      <div className="relative w-full h-48 bg-gradient-to-br from-blue-500 to-blue-700 overflow-hidden">
        {category.urlIcon ? (
          <div className="w-full h-full flex items-center justify-center">
            <img
              src={category.urlIcon}
              alt={category.name}
              className="w-24 h-24 object-contain"
            />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-white text-sm">Không có icon</div>
          </div>
        )}
        
        {/* Status badge */}
        <div className="absolute top-2 right-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              category.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {statusText}
          </span>
        </div>
      </div>

      {/* Nội dung */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-gray-800 truncate">
          {category.name}
        </h3>
        
        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
          {category.description || "Không có mô tả"}
        </p>

        <div className="mt-2 pt-2 border-t border-gray-200">
          <p className="text-xs text-gray-400">
            Tạo ngày: {formatDate(category.createdAt)}
          </p>
        </div>

        {/* Action buttons */}
        <div className="mt-4 flex gap-2">
          {isInactive ? (
            <>
              <button
                onClick={() => onEdit && onEdit({ ...category, restore: true })}
                className="flex-1 flex items-center justify-center gap-2 bg-green-50 hover:bg-green-100 text-green-600 font-semibold py-2 px-3 rounded-lg transition-colors"
              >
                Khôi phục
              </button>
              <button
                onClick={() => onDelete && onDelete({ ...category, permanent: true })}
                className="flex-1 flex items-center justify-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-2 px-3 rounded-lg transition-colors"
                title="Xóa vĩnh viễn"
              >
                Xóa vĩnh viễn
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onEdit(category)}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold py-2 px-3 rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Chỉnh sửa
              </button>
              {onDelete && (
                <button
                  onClick={() => onDelete(category)}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-2 px-3 rounded-lg transition-colors"
                  title="Xóa"
                >
                  <Trash2 className="w-4 h-4" />
                  Xóa
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
});

CategoryCard.displayName = "CategoryCard";

export default CategoryCard;
