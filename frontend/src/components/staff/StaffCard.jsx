import {
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  RotateCcw,
  Trash,
  Mail,
  User,
  Briefcase,
} from "lucide-react";

/**
 * StaffCard - Hiển thị thông tin nhân viên dạng card (Grid view)
 */
const StaffCard = ({
  member,
  onEdit,
  onDelete,
  onToggleStatus,
  onRestore,
  onDeletePermanent,
}) => {
  const isInactive = member.isActive === false || member.is_active === false;

  const getRoleConfig = (role) => {
    const roleConfig = {
      admin: {
        label: "Admin",
        color: "bg-purple-100 text-purple-800",
        borderColor: "border-purple-200",
      },
      kitchen: {
        label: "Nhân viên bếp",
        color: "bg-orange-100 text-orange-800",
        borderColor: "border-orange-200",
      },
      waiter: {
        label: "Nhân viên phục vụ",
        color: "bg-blue-100 text-blue-800",
        borderColor: "border-blue-200",
      },
    };

    return (
      roleConfig[role?.toLowerCase()] || {
        label: role,
        color: "bg-gray-100 text-gray-800",
        borderColor: "border-gray-200",
      }
    );
  };

  const roleConfig = getRoleConfig(member.role);

  return (
    <div
      className={`bg-white rounded-lg border-2 ${roleConfig.borderColor} shadow-sm hover:shadow-md transition-all`}
    >
      {/* Header với avatar và role badge */}
      <div
        className={`${roleConfig.color} p-4 rounded-t-lg ${isInactive ? "opacity-50" : ""
          }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 h-12 w-12 rounded-full bg-white flex items-center justify-center shadow-sm">
              <User className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {member.fullName || member.full_name || "N/A"}
              </h3>
              <span className="inline-flex items-center gap-1 text-xs font-medium">
                <Briefcase size={12} />
                {roleConfig.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className={`p-4 space-y-3 ${isInactive ? "opacity-50" : ""}`}>
        {/* Email */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Mail className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{member.email}</span>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-xs text-gray-500">Trạng thái:</span>
          <button
            onClick={() => onToggleStatus(member)}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${!isInactive
                ? "bg-green-100 text-green-800 hover:bg-green-200"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
          >
            {!isInactive ? (
              <>
                <ToggleRight size={14} />
                Hoạt động
              </>
            ) : (
              <>
                <ToggleLeft size={14} />
                Không hoạt động
              </>
            )}
          </button>
        </div>
      </div>

      {/* Footer - Actions */}
      <div className="px-4 pb-4">
        <div className="flex gap-2">
          {isInactive ? (
            <>
              <button
                onClick={() => onRestore && onRestore(member)}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 hover:text-green-900 rounded-lg font-medium transition-all text-sm"
                title="Khôi phục"
              >
                <RotateCcw size={16} />
                Khôi phục
              </button>
              <button
                onClick={() => onDeletePermanent && onDeletePermanent(member)}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 hover:text-red-900 rounded-lg font-medium transition-all text-sm"
                title="Xóa vĩnh viễn"
              >
                <Trash size={16} />
                Xóa vĩnh viễn
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onEdit(member)}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-medium transition-all text-sm"
                title="Chỉnh sửa"
              >
                <Edit2 size={16} />
                Sửa
              </button>
              <button
                onClick={() => onDelete(member)}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg font-medium transition-all text-sm"
                title="Vô hiệu hóa"
              >
                <Trash2 size={16} />
                Xóa
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffCard;
