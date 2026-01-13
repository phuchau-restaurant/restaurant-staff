import React from "react";
import ProfileDropdown from "../Kitchen/ProfileDropdown";

const WaiterHeader = ({
  currentTime,
  user,
  onLogout,
  onUserUpdate
}) => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo và tiêu đề */}
          <div className="flex items-center gap-3">
            <img src="/images/logo.png" alt="Logo" className="h-10 w-auto" />
            <div>
              <h1 className="text-lg font-bold text-gray-800">
                Waiter
              </h1>
              <p className="text-gray-500 text-xs">
                {currentTime?.toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })} •{" "}
                {currentTime?.toLocaleDateString("vi-VN", { weekday: 'short', day: '2-digit', month: '2-digit' })}
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
    </header>
  );
};

export default WaiterHeader;
