import React, { useState } from "react";
import { ChevronDown, Search, SlidersHorizontal, ArrowUpDown } from "lucide-react";

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
  sortBy,
  setSortBy,
}) => {
  const [showStationDropdown, setShowStationDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const selectedCategory = categoryOptions.find(
    (c) => c.value === filterStation
  ) || { value: "all", label: "Tất cả" };
  const selectedStatus = statusOptions.find(
    (s) => s.value === filterStatus
  ) || { value: "all", label: "Tất cả" };

  // Sort options
  const sortOptions = [
    { value: "time", label: "Thời gian thực" },
    { value: "table", label: "Tên bàn" },
    { value: "order", label: "Số đơn" },
    { value: "prepTime", label: "TG chuẩn bị" },
  ];

  const selectedSort = sortOptions.find((s) => s.value === sortBy) || sortOptions[0];

  return (
    <div className="flex flex-wrap gap-2 md:gap-3 items-center">
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
            setShowSortDropdown(false);
          }}
          className="px-3 md:px-4 py-2 md:py-2.5 bg-white border-2 border-gray-300 rounded-lg text-xs md:text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors flex items-center gap-1.5 md:gap-2 min-w-[130px] md:min-w-[160px]"
        >
          <SlidersHorizontal size={16} className="text-gray-600 shrink-0" />
          <span className="truncate flex-1 text-left">{selectedStatus.label}</span>
          <ChevronDown size={16} className={`text-gray-500 transition-transform shrink-0 ${showStatusDropdown ? 'rotate-180' : ''}`} />
        </button>

        {showStatusDropdown && (
          <div className="absolute top-full right-0 mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-lg z-50 w-full">
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
            setShowSortDropdown(false);
          }}
          className="px-3 md:px-4 py-2 md:py-2.5 bg-white border-2 border-gray-300 rounded-lg text-xs md:text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors flex items-center gap-1.5 md:gap-2 min-w-[130px] md:min-w-[160px]"
        >
          <SlidersHorizontal size={16} className="text-gray-600 shrink-0" />
          <span className="truncate flex-1 text-left">{selectedCategory.label}</span>
          <ChevronDown size={16} className={`text-gray-500 transition-transform shrink-0 ${showStationDropdown ? 'rotate-180' : ''}`} />
        </button>

        {showStationDropdown && (
          <div className="absolute top-full right-0 mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-lg z-50 w-full">
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

      {/* Sort Dropdown */}
      {sortBy !== undefined && setSortBy && (
        <div className="relative">
          <button
            onClick={() => {
              setShowSortDropdown(!showSortDropdown);
              setShowStationDropdown(false);
              setShowStatusDropdown(false);
            }}
            className="px-3 md:px-4 py-2 md:py-2.5 bg-white border-2 border-gray-300 rounded-lg text-xs md:text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors flex items-center gap-1.5 md:gap-2 min-w-[130px] md:min-w-[160px]"
          >
            <ArrowUpDown size={16} className="text-gray-600 shrink-0" />
            <span className="truncate flex-1 text-left">{selectedSort.label}</span>
            <ChevronDown size={16} className={`text-gray-500 transition-transform shrink-0 ${showSortDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showSortDropdown && (
            <div className="absolute top-full right-0 mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-lg z-50 w-full">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setSortBy(option.value);
                    setShowSortDropdown(false);
                  }}
                  className={`w-full px-4 py-2.5 text-left text-sm font-medium transition-colors ${sortBy === option.value
                    ? "bg-blue-50 text-blue-700 border-l-4 border-blue-500"
                    : "text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default FilterBar;
