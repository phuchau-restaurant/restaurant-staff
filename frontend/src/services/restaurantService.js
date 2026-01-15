// frontend/src/services/restaurantService.js
const BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api/restaurant`;

const getHeaders = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const tenantId = user.tenantId;
    
    return {
        "Content-Type": "application/json",
        "x-tenant-id": tenantId,
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    };
};

/**
 * Restaurant Service - API calls cho quản lý thông tin nhà hàng
 */

/**
 * Lấy thông tin nhà hàng
 * @returns {Promise<Object>} Thông tin nhà hàng
 */
export const getRestaurantInfo = async () => {
    try {
        const response = await fetch(BASE_URL, {
            headers: getHeaders(),
        });

        const result = await response.json();

        if (response.status === 404) {
            // Chưa có thông tin nhà hàng
            return { success: true, data: null };
        }

        if (result.success) {
            return result;
        }
        throw new Error(result.message || "Failed to fetch restaurant info");
    } catch (error) {
        console.error("Get restaurant info error:", error);
        throw error;
    }
};

/**
 * Cập nhật thông tin nhà hàng
 * @param {Object} data - Dữ liệu { name, logoUrl, address, email, phone }
 * @returns {Promise<Object>} Thông tin nhà hàng đã cập nhật
 */
export const updateRestaurantInfo = async (data) => {
    try {
        const response = await fetch(BASE_URL, {
            method: "PUT",
            headers: getHeaders(),
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (result.success) {
            return result;
        }
        throw new Error(result.message || "Failed to update restaurant info");
    } catch (error) {
        console.error("Update restaurant info error:", error);
        throw error;
    }
};

/**
 * Cập nhật logo nhà hàng
 * @param {string} logoUrl - URL của logo
 * @returns {Promise<Object>} Thông tin nhà hàng đã cập nhật
 */
export const updateLogo = async (logoUrl) => {
    try {
        const response = await fetch(`${BASE_URL}/logo`, {
            method: "PATCH",
            headers: getHeaders(),
            body: JSON.stringify({ logoUrl }),
        });

        const result = await response.json();

        if (result.success) {
            return result;
        }
        throw new Error(result.message || "Failed to update logo");
    } catch (error) {
        console.error("Update logo error:", error);
        throw error;
    }
};

/**
 * Upload logo image
 * @param {File} file - File ảnh logo
 * @returns {Promise<string>} URL của logo đã upload
 */
export const uploadLogo = async (file) => {
    try {
        const formData = new FormData();
        formData.append("image", file);
        formData.append("folder", "restaurant-logos");

        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const response = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/upload`,
            {
                method: "POST",
                headers: {
                    "x-tenant-id": user.tenantId,
                },
                body: formData,
            }
        );

        const result = await response.json();

        if (result.data?.url) {
            return result.data.url;
        }
        throw new Error(result.message || "Failed to upload logo");
    } catch (error) {
        console.error("Upload logo error:", error);
        throw error;
    }
};

// Default export for backward compatibility
const restaurantService = {
    getRestaurantInfo,
    updateRestaurantInfo,
    updateLogo,
    uploadLogo,
};

export default restaurantService;
