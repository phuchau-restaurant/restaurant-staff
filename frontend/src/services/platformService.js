// frontend/src/services/platformService.js
/**
 * Service cho Super Admin API
 */

const BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api/platform`;

const getHeaders = (token) => ({
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
});

/**
 * Đăng nhập Super Admin
 */
export const login = async (email, password) => {
    const response = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ email, password }),
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.message || "Login failed");
    return result.data;
};

/**
 * Lấy danh sách Super Admin
 */
export const getAllSuperAdmins = async (token) => {
    const response = await fetch(`${BASE_URL}/admins`, {
        headers: getHeaders(token),
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.message || "Failed to get admins");
    return result.data;
};

/**
 * Tạo Super Admin mới
 */
export const createSuperAdmin = async (token, data) => {
    const response = await fetch(`${BASE_URL}/admins`, {
        method: "POST",
        headers: getHeaders(token),
        body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.message || "Failed to create admin");
    return result.data;
};

/**
 * Xóa Super Admin
 */
export const deleteSuperAdmin = async (token, id) => {
    const response = await fetch(`${BASE_URL}/admins/${id}`, {
        method: "DELETE",
        headers: getHeaders(token),
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.message || "Failed to delete admin");
    return result.data;
};

/**
 * Lấy danh sách Tenants
 */
export const getAllTenants = async (token) => {
    const response = await fetch(`${BASE_URL}/tenants`, {
        headers: getHeaders(token),
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.message || "Failed to get tenants");
    return result.data;
};

/**
 * Tạo Tenant mới
 */
export const createTenant = async (token, data) => {
    const response = await fetch(`${BASE_URL}/tenants`, {
        method: "POST",
        headers: getHeaders(token),
        body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.message || "Failed to create tenant");
    return result.data;
};

/**
 * Tạo Admin đầu tiên cho Tenant
 */
export const createFirstAdmin = async (token, tenantId, adminData) => {
    const response = await fetch(`${BASE_URL}/tenants/${tenantId}/admin`, {
        method: "POST",
        headers: getHeaders(token),
        body: JSON.stringify(adminData),
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.message || "Failed to create admin");
    return result.data;
};

/**
 * Đổi mật khẩu Super Admin
 */
export const changePassword = async (token, currentPassword, newPassword) => {
    const response = await fetch(`${BASE_URL}/admins/password`, {
        method: "PUT",
        headers: getHeaders(token),
        body: JSON.stringify({ currentPassword, newPassword }),
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.message || "Failed to change password");
    return result.data;
};
