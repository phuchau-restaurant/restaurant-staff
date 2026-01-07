// frontend/src/components/Profile/ProfileDropup.jsx
import React, { useState, useRef, useEffect } from "react";
import { ChevronUp, User, LogOut } from "lucide-react";
import UserProfileModal from "./UserProfileModal";

/**
 * ProfileDropup - Menu góc dưới sidebar
 * Hiển thị avatar + tên, click để mở menu dropup
 */
const ProfileDropup = ({ user, onLogout, onUserUpdate }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const dropupRef = useRef(null);

    // Close dropup when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropupRef.current && !dropupRef.current.contains(event.target)) {
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
            <div ref={dropupRef} className="relative">
                {/* Dropup Menu */}
                {isOpen && (
                    <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50 animate-in slide-in-from-bottom-2">
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

                {/* Profile Button */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition-colors rounded-lg group"
                >
                    {/* Avatar */}
                    <img
                        src={getAvatarUrl()}
                        alt="Avatar"
                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 group-hover:border-blue-500 transition-colors"
                    />

                    {/* Info */}
                    <div className="flex-1 text-left min-w-0">
                        <p className="font-medium text-gray-800 truncate">
                            {user?.fullName || user?.full_name || "User"}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                            {user?.role || "Staff"}
                        </p>
                    </div>

                    {/* Arrow */}
                    <ChevronUp
                        className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""
                            }`}
                    />
                </button>
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

export default ProfileDropup;
