import React, { useState } from "react";
import { ChevronDown, Search, SlidersHorizontal, Grid3x3, List } from "lucide-react";

const FilterBar = ({
  filterStation,
  setFilterStation,
  filterStatus,
  setFilterStatus,
  searchOrderId,
  setSearchOrderId,
  statusOptions = [],
  categoryOptions = [],
  viewMode,
  setViewMode,
}) => {
  const [showStationDropdown, setShowStationDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const selectedCategory = categoryOptions.find(
    (c) => c.value === filterStation
  ) || { value: "all", label: "Tất cả" };
  const selectedStatus = statusOptions.find(
    (s) => s.value === filterStatus
  ) || { value: "all", label: "Tất cả" };

  return (
    <div className="flex gap-3 items-center">
      {/* Search */}
      <div className="relative flex-1">
        <input
          type="text"
          value={searchOrderId}
          onChange={(e) => setSearchOrderId(e.target.value)}
          placeholder="Tìm mã đơn 001..."
          className="w-full px-4 py-2.5 pl-10 bg-white border-2 border-gray-300 rounded-lg text-sm text-gray-700 placeholder-gray-500 focus:outline-none focus:border-blue-400 transition-colors"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
      </div>

      {/* Status Filter */}
      <div className="relative">
        <button
          onClick={() => {
            setShowStatusDropdown(!showStatusDropdown);
            setShowStationDropdown(false);
          }}
          className="px-4 py-2.5 bg-white border-2 border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors flex items-center gap-2"
        >
          <SlidersHorizontal size={16} className="text-gray-600" />
          <span>Trạng thái</span>
          <ChevronDown size={16} className={`text-gray-500 transition-transform ${showStatusDropdown ? 'rotate-180' : ''}`} />
        </button>

        {showStatusDropdown && (
          <div className="absolute top-full right-0 mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-lg z-50 min-w-[180px]">
            {statusOptions.map((status) => (
              <button
                key={status.value}
                onClick={() => {
                  setFilterStatus(status.value);
                  setShowStatusDropdown(false);
                }}
                className={`w-full px-4 py-2.5 text-left text-sm font-medium transition-colors ${filterStatus === status.value
                  ? "bg-blue-50 text-blue-700 border-l-4 border-blue-500"
                  : "text-gray-700 hover:bg-gray-50"
                  }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Category Filter */}
      <div className="relative">
        <button
          onClick={() => {
            setShowStationDropdown(!showStationDropdown);
            setShowStatusDropdown(false);
          }}
          className="px-4 py-2.5 bg-white border-2 border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors flex items-center gap-2"
        >
          <SlidersHorizontal size={16} className="text-gray-600" />
          <span>Loại món</span>
          <ChevronDown size={16} className={`text-gray-500 transition-transform ${showStationDropdown ? 'rotate-180' : ''}`} />
        </button>

        {showStationDropdown && (
          <div className="absolute top-full right-0 mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-lg z-50 min-w-[180px]">
            {categoryOptions.map((category) => (
              <button
                key={category.value}
                onClick={() => {
                  setFilterStation(category.value);
                  setShowStationDropdown(false);
                }}
                className={`w-full px-4 py-2.5 text-left text-sm font-medium transition-colors ${filterStation === category.value
                  ? "bg-blue-50 text-blue-700 border-l-4 border-blue-500"
                  : "text-gray-700 hover:bg-gray-50"
                  }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* View Mode Toggle */}
      {viewMode !== undefined && setViewMode && (
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setViewMode("card")}
            className={`p-2 rounded-md transition-colors ${viewMode === "card"
              ? "bg-white text-gray-800 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
              }`}
            title="Chế độ lưới"
          >
            <Grid3x3 size={18} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-md transition-colors ${viewMode === "list"
              ? "bg-white text-gray-800 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
              }`}
            title="Chế độ danh sách"
          >
            <List size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default FilterBar;
