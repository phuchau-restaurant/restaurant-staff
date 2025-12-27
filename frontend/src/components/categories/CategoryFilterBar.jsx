import { memo } from "react";
import { Search, Grid, List } from "lucide-react";

/**
 * CategoryFilterBar Component
 * Thanh tìm kiếm, lọc và sắp xếp danh mục
 * 
 * @param {string} searchTerm - Từ khóa tìm kiếm
 * @param {function} onSearchChange - Callback khi thay đổi từ khóa
 * @param {string} sortBy - Tiêu chí sắp xếp
 * @param {function} onSortChange - Callback khi thay đổi sắp xếp
 * @param {string} statusFilter - Bộ lọc trạng thái
 * @param {function} onStatusChange - Callback khi thay đổi trạng thái
 * @param {array} statusOptions - Danh sách options trạng thái
 * @param {string} viewMode - Chế độ hiển thị (grid/list)
 * @param {function} onViewModeChange - Callback khi thay đổi chế độ hiển thị
 */
const CategoryFilterBar = memo(({
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  statusFilter,
  onStatusChange,
  statusOptions,
  viewMode,
  onViewModeChange,
}) => {
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
            placeholder="Tìm kiếm tên danh mục..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

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
          <option value="name">Sắp xếp theo tên</option>
          <option value="createdAt">Sắp xếp theo ngày tạo</option>
          <option value="isActive">Sắp xếp theo trạng thái</option>
        </select>

        {/* Toggle view mode (Grid/List) */}
        <div className="flex gap-2 border border-gray-300 rounded-lg p-1 ml-auto">
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
      </div>
    </div>
  );
});

CategoryFilterBar.displayName = "CategoryFilterBar";

export default CategoryFilterBar;
