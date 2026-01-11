// frontend/src/components/Kitchen/ProfileDropdown.jsx
import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, User, LogOut } from "lucide-react";
import UserProfileModal from "../Profile/UserProfileModal";

/**
 * ProfileDropdown - Dropdown hiển thị user cho Kitchen Header
 * Tương tự ProfileDropup nhưng mở xuống dưới (dropdown thay vì dropup)
 */
const ProfileDropdown = ({ user, onLogout, onUserUpdate }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const getAvatarUrl = () => {
        if (user?.avatarUrl || user?.avatar_url) {
            return user.avatarUrl || user.avatar_url;
        }
        return "/images/avatar/avt1.svg";
    };

    const handleProfileSave = (updatedUser) => {
        setShowProfileModal(false);
        if (onUserUpdate) {
            onUserUpdate(updatedUser);
        }
    };

    const menuItems = [
        {
            id: "profile",
            label: "Thông tin cá nhân",
            icon: User,
            onClick: () => {
                setIsOpen(false);
                setShowProfileModal(true);
            },
        },
        {
            id: "logout",
            label: "Đăng xuất",
            icon: LogOut,
            onClick: () => {
                setIsOpen(false);
                onLogout();
            },
            danger: true,
        },
    ];

    return (
        <>
            <div ref={dropdownRef} className="relative">
                {/* Profile Button - Compact Design */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 transition-colors rounded-lg group"
                >
                    {/* Avatar */}
                    <img
                        src={getAvatarUrl()}
                        alt="Avatar"
                        className="w-9 h-9 rounded-full object-cover border-2 border-gray-200 group-hover:border-blue-500 transition-colors"
                    />

                    {/* Info */}
                    <div className="text-left min-w-0 hidden sm:block">
                        <p className="font-medium text-gray-800 text-sm truncate max-w-[120px]">
                            {user?.fullName || user?.full_name || "User"}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                            {user?.role || "Staff"}
                        </p>
                    </div>

                    {/* Arrow */}
                    <ChevronDown
                        className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""
                            }`}
                    />
                </button>

                {/* Dropdown Menu */}
                {isOpen && (
                    <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50 min-w-[200px] animate-in fade-in slide-in-from-top-2 duration-200">
                        {/* User Info Header */}
                        <div className="px-4 py-3 border-b border-gray-100">
                            <p className="font-semibold text-gray-800">
                                {user?.fullName || user?.full_name || "User"}
                            </p>
                            <p className="text-sm text-gray-500">
                                {user?.email || ""}
                            </p>
                        </div>

                        {/* Menu Items */}
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <button
                                    key={item.id}
                                    onClick={item.onClick}
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${item.danger
                                        ? "text-red-600 hover:bg-red-50"
                                        : "text-gray-700 hover:bg-gray-50"
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="font-medium">{item.label}</span>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Profile Modal */}
            {showProfileModal && (
                <UserProfileModal
                    user={user}
                    onClose={() => setShowProfileModal(false)}
                    onSave={handleProfileSave}
                />
            )}
        </>
    );
};

export default ProfileDropdown;
