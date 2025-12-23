import { memo } from "react";
import { Edit2, Trash2 } from "lucide-react";
import { formatDate } from "../../utils/categoryUtils";

/**
 * CategoryCard Component
 */
const CategoryCard = memo(({ category, onEdit, onDelete, onRestore, onDeletePermanent }) => {
  const isInactive = category.isActive === false; // Hoặc category.is_active tùy backend
  const statusText = category.isActive ? "Hoạt động" : "Không hoạt động";

  // Tạo biến class riêng để tái sử dụng cho các phần cần làm mờ
  const inactiveStyle = isInactive ? "opacity-50 grayscale" : "";

  return (
    <div
      // 1. BỎ logic isInactive ở đây để khung và nút không bị ảnh hưởng
      className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all h-full flex flex-col"
    >
      {/* 2. ÁP DỤNG inactiveStyle VÀO KHỐI HÌNH ẢNH */}
      <div className={`relative w-full h-48 bg-gradient-to-br from-blue-500 to-blue-700 overflow-hidden ${inactiveStyle}`}>
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

      {/* Nội dung chính */}
      <div className="p-4 flex flex-col flex-1">
        
        {/* 3. BỌC PHẦN CHỮ VÀO DIV RIÊNG VÀ ÁP DỤNG inactiveStyle */}
        <div className={inactiveStyle}>
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
        </div>

        {/* 4. PHẦN BUTTON NẰM NGOÀI KHỐI BỊ LÀM MỜ -> SẼ LUÔN SÁNG MÀU */}
        <div className="mt-4 flex gap-2 pt-2"> 
              {isInactive ? (
                <>
                  <button
                    onClick={() => onRestore && onRestore(category)}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-2.5 px-3 rounded-lg transition-all shadow-md hover:shadow-lg"
                    title="Khôi phục danh mục"
                  >
                    Khôi phục
                  </button>
                  <button
                    onClick={() => onDeletePermanent && onDeletePermanent(category)}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-2.5 px-3 rounded-lg transition-all shadow-md hover:shadow-lg"
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