import React from "react";
import { Menu } from "lucide-react";
import FilterBar from "./FilterBar";
import ProfileDropdown from "./ProfileDropdown";

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
  user,
  onLogout,
  onUserUpdate,
}) => {
  return (
    <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="px-6 py-2">
        <div className="flex items-center justify-between gap-6">
          {/* Logo và tiêu đề */}
          <div className="flex items-center gap-3">
            <img src="/public/images/logo.png" alt="Logo" className="h-20 w-20" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Màn Hình Bếp</h1>
              <p className="text-gray-400 text-sm">
                {currentTime.toLocaleTimeString("vi-VN")} -{" "}
                {currentTime.toLocaleDateString("vi-VN", { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Filters + View Mode Toggle */}
          <div className="flex-1 max-w-[800px]">
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
            />
          </div>

          {/* User Profile Dropdown */}
          <ProfileDropdown
            user={user}
            onLogout={onLogout}
            onUserUpdate={onUserUpdate}
          />
        </div>
      </div>
    </div>
  );
};

export default KitchenHeader;

