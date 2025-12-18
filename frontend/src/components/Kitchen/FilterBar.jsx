import React, { useState } from "react";
import { ChevronDown, Search } from "lucide-react";

const FilterBar = ({
  filterStation,
  setFilterStation,
  filterStatus,
  setFilterStatus,
  searchOrderId,
  setSearchOrderId,
  statusOptions = [],
  categoryOptions = [],
}) => {
  const [showStationDropdown, setShowStationDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const selectedCategory = categoryOptions.find(
    (c) => c.value === filterStation
  ) || { value: "all", label: "Tất cả" };
  const selectedStatus = statusOptions.find(
    (s) => s.value === filterStatus
  ) || { value: "all", label: "Tất cả" };

  const statusColorMap = {
    Pending: "from-blue-400 to-blue-500",
    Cooking: "from-yellow-400 to-yellow-500",
    Completed: "from-green-400 to-green-500",
    Cancelled: "from-red-400 to-red-500",
    all: "from-slate-500 to-slate-600",
  };

  const categoryIconMap = {
    Appetizers: "🥗",
    Beverage: "🥤",
    "Main course": "🍽️",
    all: "📋",
  };

  return (
    <div className="flex gap-3">
      {/* Thanh tìm kiếm */}
      <div className="relative w-full">
        <input
          type="text"
          value={searchOrderId}
          onChange={(e) => setSearchOrderId(e.target.value)}
          placeholder="Tìm mã đơn 001.."
          className="w-full px-3 py-2 pl-9 bg-white border-2 border-gray-300 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-all shadow-sm"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      </div>

      {/* 2 Dropdown lọc - bên phải */}
      <div className="flex gap-3 justify-center">
        {/* Loại món Dropdown */}
        <div className="relative w-60">
          <button
            onClick={() => {
              setShowStationDropdown(!showStationDropdown);
              setShowStatusDropdown(false);
            }}
            className="w-full px-3 py-2 bg-white border-2 border-gray-300 rounded-lg font-medium text-sm text-gray-700 hover:border-gray-400 transition-all flex items-center justify-between shadow-sm"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Loại món:</span>
              <span className="w-4 h-4">
                {categoryIconMap[selectedCategory.value]}
              </span>
              <span className="truncate">{selectedCategory.label}</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 transition-transform shrink-0 ${
                showStationDropdown ? "rotate-180" : ""
              }`}
            />
          </button>

          {showStationDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-300 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
              {categoryOptions.map((category) => (
                <button
                  key={category.value}
                  onClick={() => {
                    setFilterStation(category.value);
                    setShowStationDropdown(false);
                  }}
                  className={`w-full px-4 py-2 text-left font-semibold transition-all flex items-center gap-2 ${
                    filterStation === category.value
                      ? "bg-linear-to-r from-orange-400 to-orange-500 text-white shadow-lg"
                      : "bg-white text-gray-800 hover:bg-orange-50"
                  }`}
                >
                  <span className="w-5 h-5">
                    {categoryIconMap[category.value]}
                  </span>
                  <span>{category.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tình trạng đơn Dropdown */}
        <div className="relative w-60">
          <button
            onClick={() => {
              setShowStatusDropdown(!showStatusDropdown);
              setShowStationDropdown(false);
            }}
            className={`w-full px-3 py-2 rounded-lg font-medium text-sm transition-all flex items-center justify-between shadow-sm bg-linear-to-r ${
              statusColorMap[selectedStatus.value]
            } text-white border-2 border-gray-400 hover:border-gray-500`}
          >
            <div className="flex items-center gap-2">
              <span className="text-xs">Tình trạng:</span>
              <span className="truncate">{selectedStatus.label}</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 transition-transform shrink-0 ${
                showStatusDropdown ? "rotate-180" : ""
              }`}
            />
          </button>

          {showStatusDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-300 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
              {statusOptions.map((status) => {
                const gradient = statusColorMap[status.value];

                return (
                  <button
                    key={status.value}
                    onClick={() => {
                      setFilterStatus(status.value);
                      setShowStatusDropdown(false);
                    }}
                    className={`w-full px-4 py-2 text-left font-semibold transition-all shadow-sm ${
                      filterStatus === status.value
                        ? `bg-linear-to-r ${gradient} text-white shadow-lg`
                        : `bg-linear-to-r from-white to-gray-50 text-gray-700 hover:from-${
                            status.value === "all"
                              ? "slate"
                              : status.value === "Pending"
                              ? "blue"
                              : status.value === "Cooking"
                              ? "yellow"
                              : status.value === "Completed"
                              ? "green"
                              : "red"
                          }-200 hover:to-${
                            status.value === "all"
                              ? "slate"
                              : status.value === "Pending"
                              ? "blue"
                              : status.value === "Cooking"
                              ? "yellow"
                              : status.value === "Completed"
                              ? "green"
                              : "red"
                          }-300`
                    }`}
                  >
                    {status.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
