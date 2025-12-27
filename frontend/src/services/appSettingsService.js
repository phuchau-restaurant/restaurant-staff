/**
 * AppSettings Service - API calls cho app settings (location, icons, etc.)
 */

const BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api/appsettings`;
const HEADERS = {
  "Content-Type": "application/json",
  "x-tenant-id": import.meta.env.VITE_TENANT_ID,
};

/**
 * Fetch app settings theo category
 * @param {string} category - Category cần lấy (ví dụ: "Location", "icon Danh mục món")
 * @returns {Promise<Array>} Danh sách settings
 */
export const fetchAppSettings = async (category) => {
  try {
    const queryParams = new URLSearchParams();
    if (category) queryParams.append("category", category);

    const url = `${BASE_URL}?${queryParams.toString()}`;

    const response = await fetch(url, { headers: HEADERS });
    const result = await response.json();

    if (response.ok && result.success) {
      return result.data || [];
    }
    return [];
  } catch (error) {
    console.error(`Fetch app settings error (category: ${category}):`, error);
    throw error;
  }
};

/**
 * Fetch danh sách icon cho category menu từ appsettings
 * @returns {Promise<Array>} Danh sách icons với format { name, icon }
 */
export const fetchCategoryIcons = async () => {
  try {
    const data = await fetchAppSettings("icon Danh mục món");
    
    // Transform data từ API sang format { name, icon }
    return data.map((item) => ({
      name: item.key || item.value,
      icon: item.value,
    }));
  } catch (error) {
    console.error("Fetch category icons error:", error);
    // Fallback icons nếu API lỗi
    return [
      { name: "Pizza", icon: "🍕" },
      { name: "Burger", icon: "🍔" },
      { name: "Coffee", icon: "☕" },
      { name: "Sushi", icon: "🍣" },
      { name: "Chicken", icon: "🍗" },
      { name: "Salad", icon: "🥗" },
      { name: "Ice Cream", icon: "🍦" },
      { name: "Cake", icon: "🍰" },
      { name: "Beer", icon: "🍺" },
      { name: "Wine", icon: "🍷" },
    ];
  }
};

/**
 * Fetch danh sách location options từ appsettings
 * @returns {Promise<Array>} Danh sách location options
 */
export const fetchLocationOptions = async () => {
  try {
    const data = await fetchAppSettings("Location");
    
    return [
      { value: "", label: "Tất cả khu vực" },
      ...data.map((item) => ({
        value: item.value,
        label: item.value,
      })),
    ];
  } catch (error) {
    console.error("Fetch location options error:", error);
    return [{ value: "", label: "Tất cả khu vực" }];
  }
};
