import { memo } from "react";
import { Edit2, Trash2, Image as ImageIcon } from "lucide-react";
import { formatPrice, formatDate, getPrimaryImage } from "../../utils/menuUtils";

/**
 * MenuCard Component
 * Hiển thị món ăn dạng card cho grid view
 */
const MenuCard = memo(({ menuItem, onEdit, onDelete }) => {
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
            className="w-full h-full object-cover"
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
        {/* Header: Name and Price */}
        <div className="flex justify-between items-start gap-2">
            <h3 className="text-lg font-bold text-gray-800 line-clamp-2 flex-1 pr-2">
                {menuItem.name}
            </h3>
            <span className="text-xl font-bold text-orange-600 whitespace-nowrap">
                {formatPrice(menuItem.price)}
            </span>
        </div>

        {/* Sub-header: Category */}
        <div className="mt-1 h-5">
            {menuItem.categoryName && (
                <span className="text-sm text-gray-500">{menuItem.categoryName}</span>
            )}
        </div>

        {/* Description */}
        <p className="mt-2 text-sm text-gray-500 line-clamp-3">
            {menuItem.description || "Không có mô tả"}
        </p>

        {/* Footer pushed to bottom */}
        <div className="mt-auto pt-4">
            {/* Meta info */}
            <div className="flex justify-between text-xs text-gray-400 border-t border-gray-200 pt-2">
                <span>Tạo ngày: {formatDate(menuItem.createdAt)}</span>
                {menuItem.modifierGroups && menuItem.modifierGroups.length > 0 && (
                    <span>{menuItem.modifierGroups.length} nhóm modifier</span>
                )}
            </div>

            {/* Action buttons */}
            <div className="mt-3 flex gap-2">
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
    </div>
  );
});

MenuCard.displayName = "MenuCard";

export default MenuCard;
