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

const StatusToggle = ({ item, onToggle, onDelete, onRestore }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handle = async () => {
    const newStatus = !item.isAvailable;
    if (onToggle) {
      try {
        setIsProcessing(true);
        await onToggle(item, newStatus);
      } finally {
        setIsProcessing(false);
      }
    } else {
      if (newStatus === false) onDelete && onDelete(item);
      else onRestore && onRestore(item);
    }
  };

  const isInactive = item.isAvailable === false;

  return (
    <button
      onClick={handle}
      disabled={isProcessing}
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors focus:outline-none ${
        !isInactive
          ? "bg-green-100 text-green-800 hover:bg-green-200"
          : "bg-gray-100 text-gray-800 hover:bg-gray-200"
      } ${isProcessing ? "opacity-60 cursor-wait" : ""}`}
      title={item.isAvailable ? "Tắt bán" : "Bật bán"}
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
  );
};

/**
 * MenuListView Component
 * Hiển thị món ăn dạng bảng cho list view
 */
const MenuListView = memo(
  ({
    menuItems,
    onEdit,
    onDelete,
    onRestore,
    onDeletePermanent,
    onToggleAvailability,
  }) => {
    if (!menuItems || menuItems.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <p className="text-gray-500">Không có món ăn nào</p>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Món ăn
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Danh mục
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                  Giá
                </th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                  Thời gian chuẩn bị
                </th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                  Ảnh
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody>
              {menuItems.map((item, index) => {
                const primaryImage = getPrimaryImage(item.images);
                const imageUrl = primaryImage?.url || item.imgUrl;
                const isInactive = item.isAvailable === false;
                const inactiveStyle = isInactive ? "opacity-50 grayscale" : "";

                return (
                  <tr
                    key={item.id || index}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <td className={`px-6 py-4 ${inactiveStyle}`}>
                      <div className="flex items-center gap-3">
                        {imageUrl ? (
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                            <img
                              src={imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-orange-300" />
                          </div>
                        )}
                        <div>
                          <span className="font-semibold text-gray-800 block">
                            {item.name}
                          </span>
                          <span className="text-xs text-gray-500 line-clamp-1">
                            {item.description || "-"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className={`pl-6 py-4 ${inactiveStyle}`}>
                      {item.categoryName ? (
                        <span className="">{item.categoryName}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className={`text-right ${inactiveStyle}`}>
                      <span className="font-semibold text-orange-600">
                        {formatPrice(item.price)}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-center ${inactiveStyle}`}>
                      {item.prepTimeMinutes !== undefined &&
                      item.prepTimeMinutes > 0 ? (
                        <span className="text-sm bg-orange-100 text-orange-700 px-2 py-1 rounded inline-block">
                          ⏱️ {item.prepTimeMinutes} phút
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                    <td className={`px-6 py-4 text-center ${inactiveStyle}`}>
                      <span className="text-sm text-gray-600">
                        {item.images?.length || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusToggle
                        item={item}
                        onToggle={onToggleAvailability}
                        onDelete={onDelete}
                        onRestore={onRestore}
                      />
                    </td>
                    <td
                      className={`px-6 py-4 text-sm text-gray-600 ${inactiveStyle}`}
                    >
                      {formatDate(item.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-3">
                        {isInactive ? (
                          <>
                            <button
                              onClick={() => onRestore && onRestore(item)}
                              className="text-xs flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-2 px-3 rounded-lg transition-all shadow-md hover:shadow-lg"
                              title="Khôi phục món ăn"
                            >
                              Khôi phục
                            </button>
                            <button
                              onClick={() =>
                                onDeletePermanent && onDeletePermanent(item)
                              }
                              className="text-xs flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-2 px-3 rounded-lg transition-all shadow-md hover:shadow-lg"
                              title="Xóa vĩnh viễn"
                            >
                              Xóa vĩnh viễn
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => onEdit(item)}
                              className="text-xs flex-1 flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold py-2 px-1 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                              Chỉnh sửa
                            </button>
                            <button
                              onClick={() => onDelete(item)}
                              className="text-xs flex-1 flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-2 px-1 rounded-lg transition-colors"
                              title="Xóa"
                            >
                              <Trash2 className="w-4 h-4" />
                              Xóa
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
      </div>
    );
  }
);

MenuListView.displayName = "MenuListView";

export default MenuListView;
