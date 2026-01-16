import React from "react";
import { Menu } from "lucide-react";
import FilterBar from "./FilterBar";
import ProfileDropdown from "./ProfileDropdown";
import { useRestaurant } from "../../context/RestaurantContext";

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
  sortBy,
  setSortBy,
  user,
  onLogout,
  onUserUpdate,
}) => {
  const { restaurantInfo } = useRestaurant();

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="px-4 md:px-6 py-2">
        {/* First row: Logo + Profile (always visible) */}
        <div className="flex items-center justify-between gap-4">
          {/* Logo và tiêu đề */}
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            <img
              src={restaurantInfo.logoUrl || "/images/logo.png"}
              alt="Logo"
              className="h-12 w-12 md:h-16 md:w-16 lg:h-20 lg:w-20 object-contain"
            />
            <div>
              <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-800">Màn Hình Bếp</h1>
              <p className="text-gray-400 text-xs md:text-sm">
                {currentTime.toLocaleTimeString("vi-VN")} -{" "}
                {currentTime.toLocaleDateString("vi-VN", { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Filters - Hidden on mobile, shown on large screens */}
          <div className="hidden lg:flex flex-1 max-w-[1000px] mx-4">
            <FilterBar
              filterStation={filterStation}
              setFilterStation={setFilterStation}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              searchOrderId={searchOrderId}
              setSearchOrderId={setSearchOrderId}
              statusOptions={statusOptions}
              categoryOptions={categoryOptions}
              viewMode={viewMode}
              setViewMode={setViewMode}
              sortBy={sortBy}
              setSortBy={setSortBy}
            />
          </div>

          {/* User Profile Dropdown */}
          <ProfileDropdown
            user={user}
            onLogout={onLogout}
            onUserUpdate={onUserUpdate}
          />
        </div>

        {/* Second row: Filters on tablet/mobile */}
        <div className="lg:hidden mt-3 overflow-x-auto pb-1">
          <FilterBar
            filterStation={filterStation}
            setFilterStation={setFilterStation}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            searchOrderId={searchOrderId}
            setSearchOrderId={setSearchOrderId}
            statusOptions={statusOptions}
            categoryOptions={categoryOptions}
            viewMode={viewMode}
            setViewMode={setViewMode}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />
        </div>
      </div>
    </div>
  );
};

export default KitchenHeader;
