import { memo, useState } from "react";
import {
  Edit2,
  Trash2,
  Image as ImageIcon,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import {
  formatPrice,
  formatDate,
  getPrimaryImage,
} from "../../utils/menuUtils";

/**
 * MenuCard Component
 * Hiển thị món ăn dạng card cho grid view
 */
const MenuCard = memo(
  ({
    menuItem,
    onEdit,
    onDelete,
    onRestore,
    onDeletePermanent,
    onToggleAvailability,
  }) => {
    const primaryImage = getPrimaryImage(menuItem.images);
    const imageUrl = primaryImage?.url || menuItem.imgUrl;

    // Kiểm tra trạng thái inactive của món ăn
    const isInactive = menuItem.isAvailable === false;

    const [isProcessing, setIsProcessing] = useState(false);

    const handleToggle = async () => {
      const newStatus = !menuItem.isAvailable;
      if (onToggleAvailability) {
        try {
          setIsProcessing(true);
          await onToggleAvailability(menuItem, newStatus);
        } finally {
          setIsProcessing(false);
        }
      } else {
        // Fallback to existing handlers
        if (newStatus === false) {
          onDelete && onDelete(menuItem);
        } else {
          onRestore && onRestore(menuItem);
        }
      }
    };

    // Tạo biến class riêng để tái sử dụng cho các phần cần làm mờ
    const inactiveStyle = isInactive ? "opacity-50 grayscale" : "";
    return (
      <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all h-full flex flex-col">
        {/* Hình ảnh */}
        <div
          className={`relative w-full h-60 overflow-hidden p-2 ${inactiveStyle}`}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={menuItem.name}
              className="w-full h-full object-fill shadow-sm rounded-2xl transition-transform duration-300 ease-in-out hover:scale-105"
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
        <div className="px-4 py-2  flex flex-col flex-1">
          {/* Header: Name and Price */}
          <div className="flex justify-between items-start gap-2">
            <h3 className="text-lg font-bold text-gray-800 line-clamp-2 flex-1 pr-2">
              {menuItem.name}
            </h3>

            {/* Status Toggle */}
            <button
              onClick={handleToggle}
              disabled={isProcessing}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors focus:outline-none ${
                !isInactive
                  ? "bg-green-100 text-green-800 hover:bg-green-200"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              } ${isProcessing ? "opacity-60 cursor-wait" : ""}`}
              title={menuItem.isAvailable ? "Tắt bán" : "Bật bán"}
            >
              {!isInactive ? (
                <>
                  <ToggleRight size={14} />
                  Hoạt động
                </>
              ) : (
                <>
                  <ToggleLeft size={14} />
                  Ngừng bán
                </>
              )}
            </button>
          </div>

          {/* Sub-header: Category */}
          <div className="h-4">
            {menuItem.categoryName && (
              <span className="text-sm text-gray-500">
                {menuItem.categoryName}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="mt-3 text-sm text-gray-500 line-clamp-3">
            {menuItem.description || "Không có mô tả"}
          </p>

          <span className="ml-auto text-xl font-bold text-orange-600 whitespace-nowrap">
            {formatPrice(menuItem.price)}
          </span>

          {/* Footer pushed to bottom */}
          <div className="mt-auto pt-4">
            {/* Meta info */}
            <div className="flex justify-between text-xs text-gray-400 border-t border-gray-200 pt-2">
              <span>Tạo ngày: {formatDate(menuItem.createdAt)}</span>
              {menuItem.modifierGroups &&
                menuItem.modifierGroups.length > 0 && (
                  <span>{menuItem.modifierGroups.length} nhóm modifier</span>
                )}
            </div>

            {/* Action buttons */}
            <div className="mt-3 flex gap-2">
              {isInactive ? (
                <>
                  <button
                    onClick={() => onRestore && onRestore(menuItem)}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-2 px-3 rounded-lg transition-all shadow-md hover:shadow-lg"
                    title="Khôi phục món ăn"
                  >
                    Khôi phục
                  </button>
                  <button
                    onClick={() =>
                      onDeletePermanent && onDeletePermanent(menuItem)
                    }
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-2 px-3 rounded-lg transition-all shadow-md hover:shadow-lg"
                    title="Xóa vĩnh viễn"
                  >
                    Xóa vĩnh viễn
                  </button>
                </>
              ) : (
                <>
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
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

MenuCard.displayName = "MenuCard";

export default MenuCard;
