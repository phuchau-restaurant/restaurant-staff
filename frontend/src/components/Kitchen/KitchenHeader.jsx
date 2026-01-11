import React from "react";
import { Menu, Grid3x3, List } from "lucide-react";
import FilterBar from "./FilterBar";

const KitchenHeader = ({
  currentTime,
  viewMode,
  setViewMode,
  filterStation,
  setFilterStation,
  filterStatus,
  setFilterStatus,
  searchOrderId,
  setSearchOrderId,
  statusOptions,
  categoryOptions,
}) => {
  return (
    <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between gap-6">
          {/* Logo và tiêu đề */}
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Menu className="text-gray-600" size={24} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Màn Hình Bếp</h1>
              <p className="text-gray-400 text-sm">
                {currentTime.toLocaleTimeString("vi-VN")} -{" "}
                {currentTime.toLocaleDateString("vi-VN", { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex-1 max-w-[700px]">
            <FilterBar
              filterStation={filterStation}
              setFilterStation={setFilterStation}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              searchOrderId={searchOrderId}
              setSearchOrderId={setSearchOrderId}
              statusOptions={statusOptions}
              categoryOptions={categoryOptions}
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode("card")}
              className={`p-2 rounded-md transition-colors ${viewMode === "card"
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
                }`}
            >
              <Grid3x3 size={20} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-md transition-colors ${viewMode === "list"
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
                }`}
            >
              <List size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KitchenHeader;
