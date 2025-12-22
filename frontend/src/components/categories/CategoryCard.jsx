import { memo } from "react";
import { Edit2 } from "lucide-react";
import { formatDate } from "../../utils/categoryUtils";

/**
 * CategoryCard Component
 * Hiển thị danh mục dạng card cho grid view
 * 
 * @param {Object} category - Dữ liệu danh mục
 * @param {function} onEdit - Callback khi bấm edit
 */
const CategoryCard = memo(({ category, onEdit }) => {
  const statusText = category.isActive ? "Hoạt động" : "Không hoạt động";
  const statusColor = category.isActive ? "text-green-600" : "text-red-600";

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all h-full flex flex-col">
      {/* Hình ảnh */}
      <div className="relative w-full h-48 bg-gray-200 overflow-hidden">
        {category.image ? (
          <img
            src={category.image}
            alt={category.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
            <div className="text-gray-500 text-sm">Không có hình ảnh</div>
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

        {/* Edit button */}
        <button
          onClick={() => onEdit(category)}
          className="mt-4 w-full flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold py-2 px-3 rounded-lg transition-colors"
        >
          <Edit2 className="w-4 h-4" />
          Chỉnh sửa
        </button>
      </div>
    </div>
  );
});

CategoryCard.displayName = "CategoryCard";

export default CategoryCard;
