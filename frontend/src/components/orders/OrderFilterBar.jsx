import { memo } from "react";
import { Search, SlidersHorizontal, Grid, List } from "lucide-react";
import { VIEW_MODES } from "../../constants/orderConstants";

/**
 * OrderFilterBar Component
 * Thanh filter, search, sort cho quản lý đơn hàng
 */
const OrderFilterBar = memo(
  ({
    searchTerm,
    onSearchChange,
    sortBy,
    onSortChange,
    statusFilter,
    onStatusChange,
    statusOptions,
    viewMode,
    onViewModeChange,
    sortOptions,
  }) => {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo bàn hoặc mã đơn..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Status Filter */}
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

          {/* Sort */}
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
              onClick={() => onViewModeChange(VIEW_MODES.GRID)}
              className={`p-2 rounded transition-colors ${
                viewMode === VIEW_MODES.GRID
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              title="Xem dạng lưới"
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => onViewModeChange(VIEW_MODES.LIST)}
              className={`p-2 rounded transition-colors ${
                viewMode === VIEW_MODES.LIST
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
  }
);

OrderFilterBar.displayName = "OrderFilterBar";

export default OrderFilterBar;
