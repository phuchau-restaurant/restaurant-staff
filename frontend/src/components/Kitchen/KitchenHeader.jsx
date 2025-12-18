import React from "react";
import { ChefHat, Grid3x3, List } from "lucide-react";
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
    <div className="bg-linear-to-r from-orange-50 via-amber-50 to-yellow-50 shadow-md border-b-4 border-orange-400 sticky top-0 z-50">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo và tiêu đề */}
          <div className="flex items-center gap-4">
            <ChefHat className="text-orange-500" size={36} />
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Màn Hình Bếp</h1>
              <p className="text-gray-500 text-sm">
                {currentTime.toLocaleTimeString("vi-VN")} -{" "}
                {currentTime.toLocaleDateString("vi-VN")}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex-1 max-w-[900px]">
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
          <div className="flex items-center gap-3 bg-white p-2 rounded-xl shadow-md border border-orange-200">
            <button
              onClick={() => setViewMode("card")}
              className={`p-3 rounded-lg transition-all ${
                viewMode === "card"
                  ? "bg-linear-to-r from-orange-400 to-orange-500 text-white shadow-lg"
                  : "bg-linear-to-r from-orange-100 to-amber-100 text-gray-700 hover:from-orange-400 hover:to-orange-500 hover:text-white"
              }`}
            >
              <Grid3x3 size={24} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-3 rounded-lg transition-all ${
                viewMode === "list"
                  ? "bg-linear-to-r from-orange-400 to-orange-500 text-white shadow-lg"
                  : "bg-linear-to-r from-orange-100 to-amber-100 text-gray-700 hover:from-orange-400 hover:to-orange-500 hover:text-white"
              }`}
            >
              <List size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KitchenHeader;
