/**
 * Category Service - API calls cho quản lý danh mục
 */

const BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api/categories`;
const HEADERS = {
  "Content-Type": "application/json",
  "x-tenant-id": import.meta.env.VITE_TENANT_ID,
};

/**
 * Fetch danh sách danh mục từ API
 * @param {string} searchTerm - Tìm kiếm theo tên (optional)
 * @returns {Promise<Array>} Danh sách danh mục
 */
export const fetchCategories = async (searchTerm = "") => {
  try {
    const queryParams = new URLSearchParams();
    if (searchTerm) queryParams.append("search", searchTerm);

    const url = `${BASE_URL}${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    const response = await fetch(url, { headers: HEADERS });
    const result = await response.json();

    if (result.success) {
      return result.data || [];
    }
    return [];
  } catch (error) {
    console.error("Fetch categories error:", error);
    // Return mock data for development
    return getMockCategories();
  }
};

/**
 * Tạo danh mục mới
 * @param {Object} categoryData - Dữ liệu danh mục
 * @returns {Promise<Object>} Danh mục vừa tạo
 */
export const createCategory = async (categoryData) => {
  try {
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify(categoryData),
    });

    const result = await response.json();

    if (result.success) {
      return result.data;
    }
    throw new Error(result.message || "Failed to create category");
  } catch (error) {
    console.error("Create category error:", error);
    throw error;
  }
};

/**
 * Cập nhật danh mục
 * @param {string} categoryId - ID danh mục
 * @param {Object} categoryData - Dữ liệu cập nhật
 * @returns {Promise<Object>} Danh mục sau khi cập nhật
 */
export const updateCategory = async (categoryId, categoryData) => {
  try {
    const response = await fetch(`${BASE_URL}/${categoryId}`, {
      method: "PUT",
      headers: HEADERS,
      body: JSON.stringify(categoryData),
    });

    const result = await response.json();

    if (result.success) {
      return result.data;
    }
    throw new Error(result.message || "Failed to update category");
  } catch (error) {
    console.error("Update category error:", error);
    throw error;
  }
};

/**
 * Xóa danh mục
 * @param {string} categoryId - ID danh mục
 * @returns {Promise<void>}
 */
export const deleteCategory = async (categoryId) => {
  try {
    const response = await fetch(`${BASE_URL}/${categoryId}`, {
      method: "DELETE",
      headers: HEADERS,
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Failed to delete category");
    }
  } catch (error) {
    console.error("Delete category error:", error);
    throw error;
  }
};

/**
 * Mock data cho development
 */
const getMockCategories = () => {
  return [
    {
      id: "cat-1",
      name: "Snack",
      description: "Các loại thực phẩm ăn nhẹ",
      image: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400",
      isActive: true,
      createdAt: new Date("2024-01-10").toISOString(),
    },
    {
      id: "cat-2",
      name: "Meal",
      description: "Các bữa ăn chính",
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400",
      isActive: true,
      createdAt: new Date("2024-01-11").toISOString(),
    },
    {
      id: "cat-3",
      name: "Vegan",
      description: "Các món ăn chay",
      image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400",
      isActive: true,
      createdAt: new Date("2024-01-12").toISOString(),
    },
    {
      id: "cat-4",
      name: "Dessert",
      description: "Các loại tráng miệng",
      image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400",
      isActive: true,
      createdAt: new Date("2024-01-13").toISOString(),
    },
    {
      id: "cat-5",
      name: "Drink",
      description: "Các loại đồ uống",
      image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400",
      isActive: true,
      createdAt: new Date("2024-01-14").toISOString(),
    },
    {
      id: "cat-6",
      name: "Appetizer",
      description: "Các loại khai vị",
      image: "https://images.unsplash.com/photo-1541529086526-db283c563270?w=400",
      isActive: true,
      createdAt: new Date("2024-01-15").toISOString(),
    },
  ];
};
