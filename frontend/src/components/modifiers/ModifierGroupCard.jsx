import { memo } from "react";
import { Edit2, Trash2, ToggleLeft, ToggleRight, ChevronDown, ChevronUp } from "lucide-react";
import { formatPrice, formatDate, countActiveModifiers } from "../../utils/modifierUtils";
import { useState } from "react";

/**
 * ModifierGroupCard Component
 * Hiển thị nhóm modifier dạng card cho grid view
 */
const ModifierGroupCard = memo(({ group, onEdit, onDelete, onToggleStatus }) => {
  const [expanded, setExpanded] = useState(false);
  const activeCount = countActiveModifiers(group);

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all h-full flex flex-col">
      {/* Header */}
      <div className="relative p-4 bg-gradient-to-br from-blue-500 to-blue-700">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">{group.name}</h3>
            <p className="text-purple-100 text-sm mt-1">
              {group.modifiers?.length || 0} options ({activeCount} active)
            </p>
          </div>
          {/* Status toggle */}
          <button
            onClick={() => onToggleStatus(group)}
            className="p-1 rounded hover:bg-white/20 transition-colors"
            title={group.isActive ? "Đang hoạt động - Click để tắt" : "Không hoạt động - Click để bật"}
          >
            {group.isActive ? (
              <ToggleRight className="w-8 h-8 text-green-300" />
            ) : (
              <ToggleLeft className="w-8 h-8 text-gray-300" />
            )}
          </button>
        </div>
        
        {/* Status badge */}
        <div className="absolute bottom-2 right-2">
          <span
            className={`px-2 py-0.5 rounded text-xs font-semibold ${
              group.isActive 
                ? "bg-green-100 text-green-700" 
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {group.isActive ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-sm text-gray-600 line-clamp-2">
          {group.description || "Không có mô tả"}
        </p>

        {/* Config info */}
        <div className="mt-3 flex gap-4 text-xs text-gray-500">
          <span>
            {group.isRequired ? "Bắt buộc" : "Tùy chọn"}
          </span>
          <span>
            Chọn: {group.minSelect || 0} - {group.maxSelect || "∞"}
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

        {/* Action buttons */}
        <div className="mt-4 flex gap-2">
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
        </div>
      </div>
    </div>
  );
});

ModifierGroupCard.displayName = "ModifierGroupCard";

export default ModifierGroupCard;
