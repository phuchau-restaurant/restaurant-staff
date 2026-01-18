import { memo, useState } from "react";
import { Edit2, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { formatPrice, formatDate, countActiveModifiers } from "../../utils/modifierUtils";

/**
 * ModifierListView Component
 * Hiển thị modifier groups dạng bảng cho list view
 */
const ModifierListView = memo(({ groups, onEdit, onDelete, onRestore, onDeletePermanent }) => {
  const [expandedRows, setExpandedRows] = useState({});

  const toggleRow = (groupId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  if (!groups || groups.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <p className="text-gray-500">Không có nhóm modifier nào</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 w-8">
                
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Tên nhóm
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Mô tả
              </th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                Options
              </th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                Bắt buộc
              </th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                Chọn
              </th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody>
            {groups.map((group, index) => {
              const isExpanded = expandedRows[group.id];
              const activeCount = countActiveModifiers(group);
              const isInactive = group.isActive === false;
              const inactiveStyle = isInactive ? "opacity-50" : "";

              return (
                <>
                  <tr
                    key={group.id || index}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      {group.modifiers && group.modifiers.length > 0 && (
                        <button
                          onClick={() => toggleRow(group.id)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </td>
                    <td className={`px-6 py-4 ${inactiveStyle}`}>
                      <span className="font-semibold text-gray-800">
                        {group.name}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-sm text-gray-600 max-w-xs truncate ${inactiveStyle}`}>
                      {group.description || "-"}
                    </td>
                    <td className={`px-6 py-4 text-center ${inactiveStyle}`}>
                      <span className="text-sm">
                        {group.modifiers?.length || 0}
                        <span className="text-gray-400 ml-1">
                          ({activeCount} active)
                        </span>
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-center ${inactiveStyle}`}>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          group.isRequired
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {group.isRequired ? "Có" : "Không"}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-center text-sm text-gray-600 ${inactiveStyle}`}>
                      {group.minSelect ?? group.minSelections ?? 0} - {group.maxSelect ?? group.maxSelections ?? "∞"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          group.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {group.isActive ? "Hoạt động" : "Không hoạt động"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        {isInactive ? (
                          <>
                            <button
                              onClick={() => onRestore && onRestore(group)}
                              className="text-xs flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-2 px-3 rounded-lg transition-all shadow-md hover:shadow-lg"
                              title="Khôi phục nhóm modifier"
                            >
                              Khôi phục
                            </button>
                            <button
                              onClick={() => onDeletePermanent && onDeletePermanent(group)}
                              className="text-xs flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-2 px-3 rounded-lg transition-all shadow-md hover:shadow-lg"
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
                  
                  {/* Expanded modifiers */}
                  {isExpanded && group.modifiers && group.modifiers.length > 0 && (
                    <tr key={`${group.id}-modifiers`}>
                      <td colSpan={8} className="px-6 py-2 bg-gray-50">
                        <div className="pl-8">
                          <table className="w-full">
                            <thead>
                              <tr className="text-xs text-gray-500">
                                <th className="text-left py-2 font-medium">Tên option</th>
                                <th className="text-right py-2 font-medium">Giá thêm</th>
                                <th className="text-center py-2 font-medium">Mặc định</th>
                              </tr>
                            </thead>
                            <tbody>
                              {group.modifiers.map((mod) => (
                                <tr key={mod.id} className="text-sm">
                                  <td className="py-1.5 text-gray-700">{mod.name}</td>
                                  <td className="py-1.5 text-right text-gray-600">
                                    {formatPrice(mod.price)}
                                  </td>
                                  <td className="py-1.5 text-center">
                                    {mod.isDefault && (
                                      <span className="px-2 py-0.5 bg-purple-100 text-purple-600 text-xs rounded">
                                        Mặc định
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
});

ModifierListView.displayName = "ModifierListView";

export default ModifierListView;
