import { memo } from "react";
import { Edit2, Trash2, Image as ImageIcon } from "lucide-react";
import { formatPrice, formatDate, getPrimaryImage } from "../../utils/menuUtils";

/**
 * MenuCard Component
 * Hiển thị món ăn dạng card cho grid view
 */
const MenuCard = memo(({ menuItem, onEdit, onDelete }) => {
  const statusText = menuItem.isAvailable ? "Đang bán" : "Ngừng bán";
  const primaryImage = getPrimaryImage(menuItem.images);
  const imageUrl = primaryImage?.url || menuItem.imgUrl;

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all h-full flex flex-col">
      {/* Hình ảnh */}
      <div className="relative w-full h-48 bg-gradient-to-br from-orange-100 to-orange-200 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={menuItem.name}
            className="m-1 w-full h-full object-cover rounded-[2px]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-16 h-16 text-orange-300" />
          </div>
        )}
        
        {/* Image count badge */}
        {menuItem.images && menuItem.images.length > 1 && (
          <div className="absolute bottom-2 left-2">
            <span className="px-2 py-1 rounded bg-black/50 text-white text-xs">
              +{menuItem.images.length - 1} ảnh
            </span>
          </div>
        )}
        
      </div>

      {/* Nội dung */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2">
            <h3 className="text-lg font-bold text-gray-800 line-clamp-1 flex-1">
                {menuItem.name}
            </h3>

            {/* Status badge */}
            <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                menuItem.isAvailable 
                    ? "bg-green-100 text-green-700" 
                    : "bg-red-100 text-red-700"
                }`}
            >
                {statusText}
            </span>
        </div>


        {/* Category */}
        {menuItem.categoryName && (
        <div className="">
            <span className="text-gray-400">
            {menuItem.categoryName}
            </span>
        </div>
        )}

        {/* Description */}
        <p className="mt-2 text-xs text-gray-500 mt-1 line-clamp-2 flex-1">
          {menuItem.description || "Không có mô tả"}
        </p>

        <span className="ml-auto text-lg font-bold text-orange-600 whitespace-nowrap">
            {formatPrice(menuItem.price)}
        </span>

        {/* Modifier groups */}
        {menuItem.modifierGroups && menuItem.modifierGroups.length > 0 && (
          <div className="mt-2">
            <span className="text-xs text-gray-400">
              {menuItem.modifierGroups.length} modifier group(s)
            </span>
          </div>
        )}

        <div className="mt-2 pt-2 border-t border-gray-200">
          <p className="text-xs text-gray-400">
            Tạo ngày: {formatDate(menuItem.createdAt)}
          </p>
        </div>

        {/* Action buttons */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => onEdit(menuItem)}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold py-2 px-3 rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            Chỉnh sửa
          </button>
          {onDelete && (
            <button
              onClick={() => onDelete(menuItem)}
              className="flex-1 flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-2 px-3 rounded-lg transition-colors"
              title="Xóa"
            >
              <Trash2 className="w-4 h-4" />
              Xóa
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

MenuCard.displayName = "MenuCard";

export default MenuCard;
