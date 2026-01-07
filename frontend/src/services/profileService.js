// frontend/src/services/profileService.js
const BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api/users`;
const HEADERS = {
    "Content-Type": "application/json",
    "x-tenant-id": import.meta.env.VITE_TENANT_ID,
};

/**
 * Profile Service - API calls cho quản lý thông tin cá nhân
 */

/**
 * Lấy thông tin profile của user
 * @param {string} userId - ID của user
 * @returns {Promise<Object>} Thông tin user
 */
export const getProfile = async (userId) => {
    try {
        const response = await fetch(`${BASE_URL}/${userId}`, {
            headers: HEADERS,
        });

        const result = await response.json();

        if (result.success) {
            return result.data;
        }
        throw new Error(result.message || "Failed to fetch profile");
    } catch (error) {
        console.error("Get profile error:", error);
        throw error;
    }
};

/**
 * Cập nhật thông tin profile
 * @param {string} userId - ID của user
 * @param {Object} profileData - Dữ liệu cập nhật { phoneNumber, dateOfBirth, hometown, avatarUrl, avatarType }
 * @returns {Promise<Object>} User đã cập nhật
 */
export const updateProfile = async (userId, profileData) => {
    try {
        const response = await fetch(`${BASE_URL}/${userId}`, {
            method: "PUT",
            headers: HEADERS,
            body: JSON.stringify(profileData),
        });

        const result = await response.json();

        if (result.success) {
            return result.data;
        }
        throw new Error(result.message || "Failed to update profile");
    } catch (error) {
        console.error("Update profile error:", error);
        throw error;
    }
};

/**
 * Upload avatar image
 * @param {File} file - File ảnh
 * @returns {Promise<Object>} Thông tin file sau khi upload
 */
export const uploadAvatar = async (file) => {
    try {
        const formData = new FormData();
        formData.append("image", file); // Must be 'image' to match backend Multer config
        formData.append("folder", "avatars");

        const response = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/upload`,
            {
                method: "POST",
                headers: {
                    "x-tenant-id": import.meta.env.VITE_TENANT_ID,
                },
                body: formData,
            }
        );

        const result = await response.json();

        if (result.data?.url) {
            return result.data;
        }
        throw new Error(result.message || "Failed to upload avatar");
    } catch (error) {
        console.error("Upload avatar error:", error);
        throw error;
    }
};

// Danh sách avatar có sẵn
export const PRESET_AVATARS = [
    "/images/avatar/avt1.svg",
    "/images/avatar/avt2.svg",
    "/images/avatar/avt3.svg",
    "/images/avatar/avt4.svg",
    "/images/avatar/avt5.svg",
    "/images/avatar/avt6.svg",
];
