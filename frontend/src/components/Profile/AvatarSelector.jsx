// frontend/src/components/Profile/AvatarSelector.jsx
import React, { useRef } from "react";
import { Upload, Check } from "lucide-react";
import { PRESET_AVATARS } from "../../services/profileService";

/**
 * AvatarSelector - Component chọn avatar (preset + upload)
 * Có thể tái sử dụng cho Waiter/Kitchen screens
 */
const AvatarSelector = ({
    selectedAvatar,
    avatarType,
    onSelectPreset,
    onUpload,
    isUploading = false,
}) => {
    const fileInputRef = useRef(null);

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file
            if (!file.type.startsWith("image/")) {
                alert("Vui lòng chọn file ảnh!");
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                alert("File không được lớn hơn 5MB!");
                return;
            }
            onUpload(file);
        }
    };

    return (
        <div className="space-y-6">
            {/* Preview Avatar */}
            <div className="flex justify-center">
                <div className="relative">
                    <img
                        src={selectedAvatar || "/images/avatar/avt1.svg"}
                        alt="Avatar preview"
                        className="w-32 h-32 rounded-full object-cover border-4 border-blue-500 shadow-lg"
                    />
                    {isUploading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                            <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
                        </div>
                    )}
                </div>
            </div>

            {/* Preset Avatars Grid */}
            <div>
                <p className="text-base text-gray-700 mb-3 font-semibold">
                    Chọn avatar có sẵn:
                </p>
                <div className="grid grid-cols-6 gap-3">
                    {PRESET_AVATARS.map((avatar, index) => {
                        const isSelected =
                            avatarType === "preset" && selectedAvatar === avatar;
                        return (
                            <button
                                key={index}
                                type="button"
                                onClick={() => onSelectPreset(avatar)}
                                className={`relative p-2 rounded-xl transition-all hover:scale-105 ${isSelected
                                    ? "ring-2 ring-blue-500 bg-blue-50"
                                    : "hover:bg-gray-100"
                                    }`}
                            >
                                <img
                                    src={avatar}
                                    alt={`Avatar ${index + 1}`}
                                    className="w-14 h-14 rounded-full"
                                />
                                {isSelected && (
                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                        <Check className="w-4 h-4 text-white" />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Upload Button */}
            <div>
                <p className="text-base text-gray-700 mb-3 font-semibold">
                    Hoặc tải ảnh lên:
                </p>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                />
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex items-center gap-3 px-6 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50"
                >
                    <Upload className="w-5 h-5 text-gray-500" />
                    <span className="text-base text-gray-600">
                        {isUploading ? "Đang tải..." : "Chọn ảnh từ máy"}
                    </span>
                </button>
            </div>
        </div>
    );
};

export default AvatarSelector;
