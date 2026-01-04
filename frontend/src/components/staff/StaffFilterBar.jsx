import { memo } from "react";
import { Search, Grid, List } from "lucide-react";

/**
 * StaffFilterBar Component
 * Thanh tìm kiếm, lọc và sắp xếp nhân viên
 */
const StaffFilterBar = memo(
  ({
    searchTerm,
    onSearchChange,
    sortBy,
    onSortChange,
    roleFilter,
    onRoleChange,
    statusFilter,
    onStatusChange,
    viewMode,
    onViewModeChange,
  }) => {
    const roleOptions = [
      { value: "all", label: "Tất cả vai trò" },
      { value: "admin", label: "Admin" },
      { value: "kitchen", label: "Nhân viên bếp" },
      { value: "waiter", label: "Nhân viên phục vụ" },
    ];

    const statusOptions = [
      { value: "all", label: "Tất cả trạng thái" },
      { value: "true", label: "Đang hoạt động" },
      { value: "false", label: "Không hoạt động" },
    ];

    const sortOptions = [
      { value: "fullName", label: "Sắp xếp theo tên" },
      { value: "email", label: "Sắp xếp theo email" },
      { value: "role", label: "Sắp xếp theo vai trò" },
      { value: "createdAt", label: "Sắp xếp theo ngày tạo" },
    ];

    return (
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Ô tìm kiếm */}
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Tìm kiếm tên, email nhân viên..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filter vai trò */}
          <select
            value={roleFilter}
            onChange={(e) => onRoleChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {roleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Filter trạng thái */}
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Sắp xếp */}
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Toggle view mode (Grid/List) */}
          <div className="flex gap-2 border border-gray-300 rounded-lg p-1">
            <button
              onClick={() => onViewModeChange("grid")}
              className={`p-2 rounded transition-colors ${
                viewMode === "grid"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              title="Xem dạng lưới"
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => onViewModeChange("list")}
              className={`p-2 rounded transition-colors ${
                viewMode === "list"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              title="Xem dạng danh sách"
            >
              <List className="w-5 h-5" />
            </button>
          </div>

          {/* (removed create button) */}
        </div>
      </div>
    );
  }
);

StaffFilterBar.displayName = "StaffFilterBar";

export default StaffFilterBar;
