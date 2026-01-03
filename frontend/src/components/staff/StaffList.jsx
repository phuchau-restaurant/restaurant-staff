import {
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  RotateCcw,
  Trash,
  Key,
  Mail,
  User,
  Briefcase,
} from "lucide-react";

/**
 * StaffList - Hiển thị danh sách nhân viên dạng table
 */
const StaffList = ({
  staff,
  onEdit,
  onDelete,
  onToggleStatus,
  onRestore,
  onDeletePermanent,
  onChangePassword,
}) => {
  if (!staff || staff.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <p>Chưa có nhân viên nào</p>
      </div>
    );
  }

  const getRoleBadge = (role) => {
    const roleConfig = {
      admin: { label: "Admin", color: "bg-purple-100 text-purple-800" },
      kitchen: {
        label: "Nhân viên bếp",
        color: "bg-orange-100 text-orange-800",
      },
      waiter: {
        label: "Nhân viên phục vụ",
        color: "bg-blue-100 text-blue-800",
      },
    };

    const config = roleConfig[role?.toLowerCase()] || {
      label: role,
      color: "bg-gray-100 text-gray-800",
    };

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        <Briefcase size={12} />
        {config.label}
      </span>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nhân viên
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Vai trò
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Trạng thái
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Hành động
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {staff.map((member) => {
            const isInactive =
              member.isActive === false || member.is_active === false;
            return (
              <tr
                key={member.id}
                className={`hover:bg-gray-50 ${
                  isInactive ? "opacity-50 bg-gray-50" : ""
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {member.fullName || member.full_name || "N/A"}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <Mail className="w-4 h-4 mr-2" />
                    {member.email}
                  </div>
                </td>
                <td className="px-6 py-4 text-center whitespace-nowrap">
                  {getRoleBadge(member.role)}
                </td>
                <td className="px-6 py-4 text-center whitespace-nowrap">
                  <button
                    onClick={() => onToggleStatus(member)}
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      !isInactive
                        ? "bg-green-100 text-green-800 hover:bg-green-200"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                    }`}
                  >
                    {!isInactive ? (
                      <>
                        <ToggleRight size={16} />
                        Hoạt động
                      </>
                    ) : (
                      <>
                        <ToggleLeft size={16} />
                        Không hoạt động
                      </>
                    )}
                  </button>
                </td>
                <td className="px-6 py-4 text-center whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center justify-center gap-2">
                    {isInactive ? (
                      <>
                        <button
                          onClick={() => onRestore && onRestore(member)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 hover:text-green-900 rounded-lg font-medium transition-all"
                          title="Khôi phục"
                        >
                          <RotateCcw size={16} />
                          <span className="text-xs">Khôi phục</span>
                        </button>
                        <button
                          onClick={() =>
                            onDeletePermanent && onDeletePermanent(member)
                          }
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 hover:text-red-900 rounded-lg font-medium transition-all"
                          title="Xóa vĩnh viễn"
                        >
                          <Trash size={16} />
                          <span className="text-xs">Xóa vĩnh viễn</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => onEdit(member)}
                          className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                          title="Chỉnh sửa"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() =>
                            onChangePassword && onChangePassword(member)
                          }
                          className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded"
                          title="Đổi mật khẩu"
                        >
                          <Key size={18} />
                        </button>
                        <button
                          onClick={() => onDelete(member)}
                          className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                          title="Vô hiệu hóa"
                        >
                          <Trash2 size={18} />
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
  );
};

export default StaffList;
