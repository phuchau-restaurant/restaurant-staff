import React from "react";
import { UtensilsCrossed, Search } from "lucide-react";
import ProfileDropdown from "../Kitchen/ProfileDropdown";

const WaiterHeader = ({
  searchOrderId,
  setSearchOrderId,
  currentTime,
  user,
  onLogout,
  onUserUpdate
}) => {
  return (
    <div className="bg-white shadow-lg border-b-4 border-orange-400 sticky top-0 z-50">
      <div className="max-w-[1920px] mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo và tiêu đề */}
          <div className="flex items-center gap-3">
            <img src="/images/logo.png" alt="Logo" className="h-15 w-auto" />
            <div>
              <h1 className="text-2xl font-black text-gray-800">
                Waiter Screen
              </h1>
              <p className="text-gray-500 text-sm">
                {currentTime?.toLocaleTimeString("vi-VN")} -{" "}
                {currentTime?.toLocaleDateString("vi-VN", { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })}
              </p>
            </div>
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

export default WaiterHeader;
