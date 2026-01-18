import { memo } from "react";
import { Edit2, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { formatPrice, formatDate, countActiveModifiers } from "../../utils/modifierUtils";
import { useState } from "react";

/**
 * ModifierGroupCard Component
 * Hiển thị nhóm modifier dạng card cho grid view
 */
const ModifierGroupCard = memo(({ group, onEdit, onDelete, onRestore, onDeletePermanent }) => {
  const [expanded, setExpanded] = useState(false);
  const activeCount = countActiveModifiers(group);
  const isInactive = group.isActive === false;

  // Tạo biến class riêng để tái sử dụng cho các phần cần làm mờ
  const inactiveStyle = isInactive ? "opacity-50 grayscale" : "";

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all h-full flex flex-col">
      {/* Header */}
      <div className="relative p-4 bg-gradient-to-br from-blue-500 to-blue-700">
        <div className={inactiveStyle}>
          <h3 className="text-lg font-bold text-white">{group.name}</h3>
          <p className="text-purple-100 text-sm mt-1">
            {group.modifiers?.length || 0} options ({activeCount} active)
          </p>
        </div>
        
        {/* Status badge - góc trên bên phải - KHÔNG bị làm mờ */}
        <div className="absolute top-2 right-2">
          <span
            className={`px-2 py-1 rounded text-xs font-semibold ${
              group.isActive
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {group.isActive ? "Hoạt động" : "Không hoạt động"}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Phần text bị làm mờ khi inactive */}
        <div className={inactiveStyle}>
          <p className="text-sm text-gray-600 line-clamp-2">
            {group.description || "Không có mô tả"}
          </p>

          {/* Config info */}
          <div className="mt-3 flex gap-4 text-xs text-gray-500">
            <span>
              {group.isRequired ? "Bắt buộc" : "Tùy chọn"}
            </span>
            <span>
              Chọn: {group.minSelect ?? group.minSelections ?? 0} - {group.maxSelect ?? group.maxSelections ?? "∞"}
            </span>
          </div>

          {/* Modifiers preview */}
          <div className="mt-3">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
            >
              {expanded ? (
                <>
                  <ChevronUp className="w-4 h-4" /> Ẩn options
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" /> Xem options
                </>
              )}
            </button>

            {expanded && group.modifiers && group.modifiers.length > 0 && (
              <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                {group.modifiers.map((mod) => (
                  <div
                    key={mod.id}
                    className={`flex items-center justify-between p-2 rounded text-sm ${
                      mod.isActive ? "bg-gray-50" : "bg-gray-100 opacity-60"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={mod.isDefault ? "font-semibold" : ""}>
                        {mod.name}
                      </span>
                      {mod.isDefault && (
                        <span className="px-1 py-0.5 bg-blue-100 text-blue-600 text-xs rounded">
                          Mặc định
                        </span>
                      )}
                    </div>
                    <span className="text-gray-600">
                      {formatPrice(mod.price)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-auto pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-400">
              Tạo ngày: {formatDate(group.createdAt)}
            </p>
          </div>
        </div>

        {/* Action buttons - luôn sáng màu */}
        <div className="mt-4 flex gap-2 pt-2">
          {isInactive ? (
            <>
              <button
                onClick={() => onRestore && onRestore(group)}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-2.5 px-3 rounded-lg transition-all shadow-md hover:shadow-lg"
                title="Khôi phục nhóm modifier"
              >
                Khôi phục
              </button>
              <button
                onClick={() => onDeletePermanent && onDeletePermanent(group)}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-2.5 px-3 rounded-lg transition-all shadow-md hover:shadow-lg"
                title="Xóa vĩnh viễn"
              >
                Xóa vĩnh viễn
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onEdit(group)}
                className="text-xs flex-1 flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold py-2 px-1 rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Chỉnh sửa
              </button>
              <button
                onClick={() => onDelete(group)}
                className="flex-1 flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-2 px-3 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Xóa
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
});

ModifierGroupCard.displayName = "ModifierGroupCard";

export default ModifierGroupCard;
